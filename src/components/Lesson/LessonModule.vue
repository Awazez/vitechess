<template>
  <div class="lesson-module">
    <ChessBoard
      ref="chessBoard"
      :fen="currentFen"
      :flipped="flipped"
      :selectedPieceSet="selectedPieceSet"
      @move="handleMove"
      @fen="handleFen"
    />

    <LessonBox
      :title="translatedTitle"
      :message="message"
      :messageType="messageType"
      :hintMove="hintMove"
      :demoRunning="demoRunning"
      :hintRequested="hintRequested"
      :isEnglish="isEnglish"
      :currentPlayer="currentPlayer"
      @start-demo="startDemo"
      @stop-demo="stopDemo"
      @get-hint="getHint"
      @reset-lesson="resetToInitialPosition"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed, markRaw } from "vue"
import { Chess } from "chess.js"
import LessonBox from "./LessonBox.vue"
import ChessBoard from "../chessBoard/chessBoard.vue"

const props = defineProps({
  title: { type: String, default: "Basic mate" },
  initialFen: { type: String, default: "8/8/3k4/8/4Q3/8/4K3/8 w - - 0 1" },
  scriptedMoves: { type: Array, default: () => [] },
  scriptedPgn: { type: String, default: "" },
  selectedPieceSet: { type: String, default: "cburnett" },
  isEnglish: { type: Boolean, default: false },
  apiUrl: { type: String, default: "https://api.vitechess.com/analyze" },
  demoDelay: { type: Number, default: 1000 },
  analysisDepth: { type: Number, default: 12 },
  apiTimeout: { type: Number, default: 5000 }
})

const emit = defineEmits(['lesson-completed', 'error'])

// Le titre est déjà traduit par App.vue, on le passe directement
const translatedTitle = computed(() => {
  return props.title
})

// État
const currentFen = ref(props.initialFen)
const flipped = ref(false)
const moves = ref([])
const demoRunning = ref(false)
const demoAborted = ref(false)
const message = ref("")
const messageType = ref("")
const hintMove = ref("")
const hintRequested = ref(false)
const chessBoard = markRaw(ref(null))
const currentPlayer = ref("w")

// Gestion des requêtes en cours pour éviter les race conditions
let currentMoveEvaluation = null
let currentAutoResponse = null
let abortController = null
let pendingTimeouts = new Set()

// Traductions centralisées
const t = computed(() => ({
  yourTurn: props.isEnglish ? "Your turn!" : "À toi de jouer !",
  welcome: props.isEnglish ? "👋 Welcome! Click 🚀 to start the demo." : "👋 Bienvenue ! Clique sur 🚀 pour lancer la démo.",
  wellDone: props.isEnglish ? "✅ Well played" : "✅ Bien joué",
  blunder: props.isEnglish ? "💥 Blunder" : "💥 Gaffe",
  lookingForMove: props.isEnglish ? "🤔 Looking for the best move..." : "🤔 Recherche du meilleur coup...",
  noHint: props.isEnglish ? "❌ Unable to get hint" : "❌ Impossible d'obtenir un indice",
  networkError: props.isEnglish ? "❌ Network error" : "❌ Erreur réseau",
  demoStopped: props.isEnglish ? "⏹️ Demo stopped" : "⏹️ Démo arrêtée",
  noScriptedDemo: props.isEnglish ? "🚫 This module has no scripted demo." : "🚫 Ce module n'a pas de démo scriptée.",
  checkmate: props.isEnglish ? "♔ Checkmate!" : "♔ Échec et mat !",
  stalemate: props.isEnglish ? "♟️ Stalemate" : "♟️ Pat",
  draw: props.isEnglish ? "🤝 Draw" : "🤝 Nulle",
  invalidFen: props.isEnglish ? "⚠️ Invalid position" : "⚠️ Position invalide",
  apiTimeout: props.isEnglish ? "⏱️ Analysis timeout" : "⏱️ Délai d'analyse dépassé",
  promotion: props.isEnglish ? "♛ Promotion!" : "♛ Promotion !"
}))

// Watchers avec reset
watch(() => props.initialFen, resetToInitialPosition)
watch(() => props.scriptedPgn, resetToInitialPosition)
watch(() => props.isEnglish, updateWelcomeMessage)

// Validation de FEN
function isValidFen(fen) {
  try {
    markRaw(new Chess(fen))
    return true
  } catch {
    return false
  }
}

function resetToInitialPosition() {
  // Annuler les requêtes en cours
  cancelPendingRequests()
  
  // Déterminer la FEN initiale (PGN prioritaire)
  let targetFen = props.initialFen
  
  if (props.scriptedPgn) {
    const parsed = parsePgn(props.scriptedPgn)
    targetFen = parsed?.fen || props.initialFen
  }
  
  // Validation de la FEN
  if (!isValidFen(targetFen)) {
    console.error('❌ Invalid FEN:', targetFen)
    message.value = t.value.invalidFen
    messageType.value = "bad"
    targetFen = '8/8/8/8/8/8/8/8 w - - 0 1' // Position vide comme fallback
  }
  
  currentFen.value = targetFen
  moves.value = []
  chessBoard.value?.loadFen(currentFen.value)
  message.value = t.value.yourTurn
  messageType.value = "good"
}


function cancelPendingRequests() {
  // Annuler les évaluations en cours
  currentMoveEvaluation = null
  currentAutoResponse = null
  
  // Annuler la requête HTTP en cours
  if (abortController) {
    abortController.abort()
    abortController = null
  }
  
  // Nettoyer tous les timeouts
  pendingTimeouts.forEach(timeout => clearTimeout(timeout))
  pendingTimeouts.clear()
}

// Variable pour suivre les promotions
let lastPromotionSquare = ref(null)

// Gestion des coups utilisateur
async function handleMove(move) {
  if (demoRunning.value) {
    console.log('⏸️ Coup ignoré: démo en cours')
    return
  }
  if (!move?.from || !move?.to) {
    console.warn('⚠️ Coup invalide reçu:', move)
    return
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎮 NOUVEAU COUP:', move.san)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const preMoveFen = currentFen.value
  console.log('📋 FEN avant coup:', preMoveFen)
  
  // Calculer la FEN après le coup
  let afterFen = preMoveFen
  let hasPromotion = false
  try {
    const tmp = markRaw(new Chess(preMoveFen))
    const result = tmp.move({ from: move.from, to: move.to, promotion: move.promotion })
    if (!result) {
      console.error('❌ Invalid move')
      return
    }
    afterFen = tmp.fen()
    console.log('📋 FEN après coup:', afterFen)

    // Promotion: afficher le message mais attendre la réponse de l'ordi
    if (result.promotion) {
      hasPromotion = true
      lastPromotionSquare.value = move.to
      console.log(`♛ Promotion détectée sur ${move.to} - attente de la réponse de l'adversaire`)
      message.value = t.value.promotion
      messageType.value = 'good'
      // Synchroniser l'état courant
      currentFen.value = afterFen
      chessBoard.value?.loadFen(currentFen.value)
    }
  } catch (err) {
    handleError('Move calculation error', err)
    return
  }

  // Ne PAS réinitialiser l'état ici, car on veut garder le message précédent
  // L'évaluation du coup mettra à jour le message si nécessaire
  hintMove.value = ""
  hintRequested.value = false
  chessBoard.value?.highlightLastMove(move)

  // Évaluation ET réponse automatique en parallèle
  const sideToMove = preMoveFen.split(" ")[1]?.toLowerCase()
  console.log(`🎯 Tour du joueur: ${sideToMove === 'w' ? 'Blancs' : 'Noirs'}`)
  
  if (sideToMove === "w") {
    console.log('⚪ Coup des Blancs → Évaluation + Réponse de l\'ordi')
    
    // Si pas de promotion, évaluer le coup normalement
    if (!hasPromotion) {
      await evaluatePlayerMove(preMoveFen, move.san)
    }
    // Pas de délai - l'API lente compense déjà
    
    console.log('🤖 Tour de l\'ordinateur...')
    await playEngineResponse(afterFen, hasPromotion)
  } else {
    console.log('⚫ Coup des Noirs → Juste réponse de l\'ordi')
    // Pour les Noirs : juste laisser l'ordi jouer
    await playEngineResponse(afterFen, hasPromotion)
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

async function evaluatePlayerMove(fen, sanMove) {
  const sideToMove = fen.split(" ")[1]?.toLowerCase()
  if (sideToMove !== "w") {
    console.log('⏭️ Pas d\'évaluation pour les coups noirs')
    return
  }

  // ID unique pour cette évaluation
  const evalId = {}
  currentMoveEvaluation = evalId

  // Pas de placeholder: on attend la réponse
  console.log(`🔍 Début évaluation de ${sanMove} sur FEN: ${fen.substring(0, 30)}...`)

  try {
    const evalData = await analyzePosition(fen, sanMove)
    
    console.log('📦 Réponse API complète:', JSON.stringify(evalData, null, 2))
    
    // Vérifier que cette évaluation est toujours pertinente
    if (currentMoveEvaluation !== evalId) {
      console.log('⏹️ Évaluation obsolète, ignorée')
      return
    }

    const evalType = evalData?.evaluation_type?.toString().toLowerCase() || ""
    console.log(`📊 ${sanMove} → Type d'évaluation: "${evalType}"`)
    
    // Log détaillé pour comprendre ce qui se passe
    if (!evalType) {
      console.warn('⚠️ Aucun evaluation_type reçu de l\'API!')
    }
    
    if (evalType.includes("blunder")) {
      console.log('💥 BLUNDER DÉTECTÉ!')
      message.value = t.value.blunder
      messageType.value = "bad"
    } else if (evalType.includes("mistake")) {
      console.log('😬 Erreur détectée')
      message.value = props.isEnglish ? "😬 Mistake" : "😬 Erreur"
      messageType.value = "bad"
    } else if (evalType.includes("inaccuracy")) {
      console.log('🤨 Imprécision détectée')
      message.value = props.isEnglish ? "🤨 Inaccuracy" : "🤨 Imprécision"
      messageType.value = ""
    } else if (evalType.includes("good") || evalType.includes("best")) {
      console.log('✅ Bon coup!')
      message.value = t.value.wellDone
      messageType.value = "good"
    } else {
      console.log(`⚠️ Type d'évaluation inconnu: "${evalType}", considéré comme bon`)
      message.value = t.value.wellDone
      messageType.value = "good"
    }
    
    console.log(`💬 Message affiché: "${message.value}" (type: ${messageType.value})`)
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('⏹️ Evaluation cancelled')
      return
    }
    console.error('❌ Erreur évaluation:', err)
    console.error('Stack:', err.stack)
    handleError('Evaluation error', err)
    message.value = ""
    messageType.value = ""
  }
}

async function playEngineResponse(fen, hadPromotion = false) {
  const responseId = {}
  currentAutoResponse = responseId

  try {
    const chess = markRaw(new Chess(fen))
    
    // Vérifier si la partie est terminée AVANT le coup de l'ordinateur
    if (chess.isCheckmate()) {
      message.value = t.value.checkmate
      messageType.value = "good"
      console.log('🏁 Mat détecté avant le coup de l\'ordinateur')
      
      // Si il y avait une promotion ET mat, c'est une victoire
      if (hadPromotion) {
        emit('lesson-completed', { result: 'promotion_checkmate', fen, hasErrors: false })
      } else {
        emit('lesson-completed', { result: 'checkmate', fen, hasErrors: false })
      }
      
      // Retour au début après un délai
      setTimeout(() => {
        resetToInitialPosition()
      }, 2000)
      return
    }
    
    if (chess.isStalemate()) {
      message.value = t.value.stalemate
      messageType.value = ""
      console.log('🏁 Pat détecté avant le coup de l\'ordinateur')
      emit('lesson-completed', { result: 'stalemate', fen, hasErrors: true })
      // Retour au début après un délai
      setTimeout(() => {
        resetToInitialPosition()
      }, 2000)
      return
    }
    
    if (chess.isDraw()) {
      message.value = t.value.draw
      messageType.value = ""
      console.log('🏁 Nulle détectée avant le coup de l\'ordinateur')
      emit('lesson-completed', { result: 'draw', fen, hasErrors: true })
      // Retour au début après un délai
      setTimeout(() => {
        resetToInitialPosition()
      }, 2000)
      return
    }

    console.log('🤖 Recherche du meilleur coup pour l\'ordinateur...')
    const hint = await analyzePosition(fen)
    
    // Vérifier que cette réponse est toujours pertinente
    if (currentAutoResponse !== responseId) return

    const uci = hint?.best_move
    
    // Si pas de best_move (cas d'une analyse de coup), on arrête
    if (!uci || uci.length < 4) {
      console.warn('⚠️ Pas de best_move reçu')
      return
    }

    const from = uci.slice(0, 2)
    const to = uci.slice(2, 4)
    const promotion = uci[4] || undefined
    
    const applied = chess.move({ from, to, promotion })
    if (!applied) {
      console.warn('❌ Coup invalide:', uci)
      return
    }

    console.log(`🤖 L'ordinateur joue: ${applied.san}`)

    // Vérifier si la pièce promue a été capturée
    let promotionCaptured = false
    if (hadPromotion && lastPromotionSquare.value) {
      if (to === lastPromotionSquare.value && applied.captured) {
        console.log(`💥 La pièce promue sur ${lastPromotionSquare.value} a été capturée !`)
        promotionCaptured = true
        lastPromotionSquare.value = null
        // Effacer le message de promotion et continuer le jeu
        message.value = ""
        messageType.value = ""
        // Ne pas retourner à zéro, continuer le jeu normalement
      } else {
        console.log(`✅ La pièce promue sur ${lastPromotionSquare.value} a survécu !`)
        // La promotion est réussie
        message.value = t.value.promotion
        messageType.value = "good"
        emit('lesson-completed', { result: 'promotion_survived', fen, hasErrors: false })
        lastPromotionSquare.value = null
        // Retour au début après un délai
        setTimeout(() => {
          resetToInitialPosition()
        }, 2000)
        return
      }
    }

    currentFen.value = chess.fen()
    chessBoard.value?.loadFen(currentFen.value)
    chessBoard.value?.highlightLastMove({ from, to })
    chessBoard.value?.clearPremove() // Effacer les premoves après le coup de l'ordinateur
    
    // Sons pour le coup de l'ordinateur
    if (applied.flags?.includes('c')) {
      chessBoard.value?.playCaptureSound?.()
    } else {
      chessBoard.value?.playMoveSound?.()
    }
    
    // Vérifier si le joueur est mat/pat/nulle après le coup de l'ordinateur
    if (chess.isCheckmate()) {
      message.value = t.value.checkmate
      messageType.value = "bad"
      console.log('🏁 Le joueur est mat')
      emit('lesson-completed', { result: 'player_checkmated', fen: currentFen.value, hasErrors: true })
      // Retour au début après un délai
      setTimeout(() => {
        resetToInitialPosition()
      }, 2000)
    } else if (chess.isStalemate()) {
      message.value = t.value.stalemate
      messageType.value = ""
      console.log('🏁 Pat (après coup ordinateur)')
      emit('lesson-completed', { result: 'draw', fen: currentFen.value, hasErrors: true })
      // Retour au début après un délai
      setTimeout(() => {
        resetToInitialPosition()
      }, 2000)
    } else if (chess.isDraw()) {
      message.value = t.value.draw
      messageType.value = ""
      console.log('🏁 Nulle (après coup ordinateur)')
      emit('lesson-completed', { result: 'draw', fen: currentFen.value, hasErrors: true })
      // Retour au début après un délai
      setTimeout(() => {
        resetToInitialPosition()
      }, 2000)
    } else if (chess.isInsufficientMaterial()) {
      message.value = t.value.draw
      messageType.value = ""
      console.log('🏁 Matériel insuffisant')
      emit('lesson-completed', { result: 'insufficient_material', fen: currentFen.value, hasErrors: true })
    }
    
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('⏹️ Engine response cancelled')
      return
    }
    handleError('Engine response error', err)
  }
}

// Appel API unifié avec gestion d'erreurs améliorée
async function analyzePosition(fen, move = null) {
  const body = { fen, depth: props.analysisDepth }
  if (move) {
    body.move = move
    console.log(`🔍 Analyse d'un coup spécifique: ${move}`)
  } else {
    console.log(`🔍 Recherche du meilleur coup (pas d'évaluation de coup)`)
  }

  console.log(`🌐 Appel API: ${props.apiUrl}`)
  console.log(`📤 Envoi:`, JSON.stringify(body, null, 2))

  // Créer un nouveau AbortController pour cette requête
  abortController = new AbortController()

  try {
    const response = await fetch(props.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: abortController.signal
    })

    console.log(`📡 Réponse HTTP: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`❌ Erreur API ${response.status}:`, errorText)
      throw new Error(`API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    if (move) {
      console.log(`📥 Évaluation reçue pour ${move}:`, JSON.stringify(data, null, 2))
    } else {
      console.log(`📥 Meilleur coup trouvé: ${data.best_move}`)
    }
    
    return data
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('⏹️ Requête annulée')
      throw err // Laisser passer les annulations
    }
    
    // Gestion des erreurs spécifiques
    if (err.message.includes('Failed to fetch')) {
      console.error('❌ Network error - is the API running?')
      message.value = t.value.networkError
      messageType.value = "bad"
    }
    
    console.error('❌ Erreur fetch:', err)
    throw err
  } finally {
    abortController = null
  }
}

function handleFen(fen) {
  currentFen.value = fen
  
  // Mettre à jour l'indicateur de tour
  const sideToMove = fen.split(" ")[1]?.toLowerCase()
  currentPlayer.value = sideToMove || "w"
}

// Démo scriptée
async function startDemo() {
  demoRunning.value = true
  demoAborted.value = false
  cancelPendingRequests()
  resetToInitialPosition()

  // Préparer la séquence
  let sequence = Array.isArray(props.scriptedMoves) ? [...props.scriptedMoves] : []
  
  if (sequence.length === 0 && props.scriptedPgn) {
    const { fen: fenFromPgn, sanMoves } = parsePgn(props.scriptedPgn)
    if (fenFromPgn) {
      currentFen.value = fenFromPgn
      chessBoard.value?.loadFen(currentFen.value)
    }
    sequence = sanMoves
  }

  if (sequence.length === 0) {
    console.warn("No scripted demo available")
    message.value = t.value.noScriptedDemo
    messageType.value = "bad"
    demoRunning.value = false
    return
  }

  console.log(`🚀 Starting demo: ${sequence.length} move(s)`)
  const chess = markRaw(new Chess(currentFen.value))

  for (let i = 0; i < sequence.length; i++) {
    if (demoAborted.value) break

    const step = sequence[i]
    const move = parseMove(chess, step)
    
    if (!move) {
      console.error(`❌ Invalid move at step ${i + 1}:`, step)
      break
    }

    moves.value.push(move.san)
    currentFen.value = chess.fen()
    chessBoard.value?.loadFen(currentFen.value)
    chessBoard.value?.highlightLastMove(move)

    // Sons
    if (move.flags?.includes('c')) {
      chessBoard.value?.playCaptureSound?.()
    } else {
      chessBoard.value?.playMoveSound?.()
    }

    message.value = (typeof step === 'object' && step.comment)
      ? step.comment
      : `▶️ ${props.isEnglish ? 'Move' : 'Coup'} ${i + 1}: ${move.san}`
    messageType.value = ""

    // Attente interruptible
    if (!await waitInterruptible(props.demoDelay)) break
  }

  if (!demoAborted.value) {
    message.value = props.isEnglish ? "✅ Demo completed!" : "✅ Démo terminée !"
    messageType.value = "good"
    await wait(1000)
    resetToInitialPosition()
  }

  demoRunning.value = false
}

function stopDemo() {
  demoAborted.value = true
  demoRunning.value = false
  resetToInitialPosition()
  message.value = t.value.demoStopped
  messageType.value = ""
}

// Utilitaire d'attente simple
function wait(ms) {
  return new Promise(resolve => {
    const timeout = setTimeout(resolve, ms)
    pendingTimeouts.add(timeout)
    setTimeout(() => pendingTimeouts.delete(timeout), ms)
  })
}

// Attente interruptible pour la démo
async function waitInterruptible(ms) {
  const start = Date.now()
  while (Date.now() - start < ms) {
    if (demoAborted.value) return false
    await wait(50)
  }
  return true
}

function parseMove(chess, step) {
  if (typeof step === 'string') {
    // UCI format: e2e4
    if (/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(step)) {
      return chess.move({
        from: step.slice(0, 2),
        to: step.slice(2, 4),
        promotion: step.slice(4) || undefined
      })
    }
    // SAN format: e4, Nf3, etc.
    return chess.move(step, { sloppy: true })
  }
  
  // Object format: { from, to, promotion? }
  if (step?.from && step?.to) {
    return chess.move({
      from: step.from,
      to: step.to,
      promotion: step.promotion
    })
  }
  
  return null
}

// Système d'indices
async function getHint() {
  hintRequested.value = true
  message.value = t.value.lookingForMove
  messageType.value = ""

  try {
    const data = await analyzePosition(currentFen.value)
    const san = translateUciToSan(data.best_move)
    hintMove.value = translateToFrench(san)
    message.value = ""
  } catch (err) {
    if (err.name === 'AbortError') return
    handleError('Hint error', err)
    message.value = t.value.noHint
    messageType.value = "bad"
    hintRequested.value = false
  }
}

function translateUciToSan(uciMove) {
  if (!uciMove || uciMove.length < 4) return uciMove
  
  try {
    const chess = markRaw(new Chess(currentFen.value))
    const move = chess.move({
      from: uciMove.substring(0, 2),
      to: uciMove.substring(2, 4),
      promotion: uciMove[4]
    })
    return move?.san || uciMove
  } catch {
    return uciMove
  }
}

function translateToFrench(sanMove) {
  if (!sanMove || props.isEnglish) return sanMove
  
  const pieceMap = { 'K': 'R', 'Q': 'D', 'R': 'T', 'B': 'F', 'N': 'C' }
  
  return sanMove.replace(/[KQRBN]/g, match => pieceMap[match] || match)
}

// Utilitaire PGN
function parsePgn(pgn) {
  const fenMatch = pgn.match(/\[FEN\s+"([^"]+)"\]/i)
  const fen = fenMatch?.[1] || null
  
  const body = pgn
    .replace(/\[[^\]]*\]\s*/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\d+\.(\.\.)?/g, " ")
    .replace(/1-0|0-1|1\/2-1\/2|\*/g, " ")
    .trim()
  
  const sanMoves = body
    .split(/\s+/)
    .filter(t => /^(O-O(-O)?|[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](=[NBRQ])?[+#]?|[a-h]x[a-h][1-8](=[NBRQ])?[+#]?)$/.test(t))
  
  return { fen, sanMoves }
}

function updateWelcomeMessage() {
  if (!demoRunning.value && !message.value) {
    message.value = t.value.welcome
    messageType.value = "good"
  }
}

function handleError(context, error) {
  console.error(`[LessonModule] ${context}:`, error)
  emit('error', { context, error })
}

// Nettoyage au démontage
onBeforeUnmount(() => {
  cancelPendingRequests()
})

onMounted(() => {
  resetToInitialPosition()
  updateWelcomeMessage()
})
</script>

<style scoped>
.lesson-module {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

</style>