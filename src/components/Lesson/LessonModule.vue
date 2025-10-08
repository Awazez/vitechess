<template>
  <div class="lesson-module">
    <ChessBoard
      ref="chessBoard"
      :fen="currentFen"
      :flipped="flipped"
      :selectedPieceSet="selectedPieceSet"
      @move="handleMove"
    />

    <LessonBox
      :title="title"
      :message="message"
      :messageType="messageType"
      :hintMove="hintMove"
      :demoRunning="demoRunning"
      :hintRequested="hintRequested"
      :isLoading="isLoading"
      :loadingMessage="loadingMessage"
      :isEnglish="isEnglish"
      :isWhiteTurn="isWhiteTurn"
      :flipped="flipped"
      @start-demo="startDemo"
      @stop-demo="stopDemo"
      @get-hint="getHint"
      @reset-position="resetToInitialPosition"
      @flip-board="flipBoard"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue"
import { Chess } from "chess.js"
import LessonBox from "./LessonBox.vue"
import ChessBoard from "../chessBoard/chessBoard.vue"
import { PERFORMANCE_CONFIG, getApiUrl, cleanupCache } from "../../config/performance.js"

const props = defineProps({
  title: { type: String, default: "Basic mate" },
  initialFen: { type: String, default: "8/8/3k4/8/4Q3/8/4K3/8 w - - 0 1" },
  scriptedMoves: {
    type: Array,
    default: () => []
  },
  // Optionnel: permet de fournir une partie PGN complète
  scriptedPgn: { type: String, default: "" },
  // Set de pièces sélectionné
  selectedPieceSet: { type: String, default: "cburnett" },
  // Langue
  isEnglish: { type: Boolean, default: false },
  // Configuration API
  apiUrl: { type: String, default: getApiUrl() },
  apiTimeout: { type: Number, default: PERFORMANCE_CONFIG.API_TIMEOUT },
  analysisDepth: { type: Number, default: PERFORMANCE_CONFIG.HINT_DEPTH }
})

const emit = defineEmits(['lesson-completed'])

const currentFen = ref(props.initialFen)
const flipped = ref(false)
const moves = ref([])
const demoRunning = ref(false)
const demoAborted = ref(false)
const message = ref("")
const messageType = ref("")
const hintMove = ref("")
const hintRequested = ref(false)
const isLoading = ref(false)
const loadingMessage = ref("")

const chessBoard = ref(null)

// Cache pour les évaluations API
const evaluationCache = ref(new Map())
const pendingRequests = ref(new Map())

// Computed property pour déterminer qui a le trait
const isWhiteTurn = computed(() => {
  try {
    const chess = new Chess(currentFen.value)
    return chess.turn() === 'w'
  } catch (e) {
    return true // Par défaut, blancs
  }
})

// 🔥 Reset quand la prop initialFen change (changement de module)
watch(() => props.initialFen, () => resetToInitialPosition())

// 🔥 Reset aussi quand le PGN change (changement de module PGN)
watch(() => props.scriptedPgn, () => resetToInitialPosition())

function resetToInitialPosition() {
  // Si un PGN est fourni et contient une FEN, elle prime
  if (props.scriptedPgn) {
    const parsed = parsePgn(props.scriptedPgn)
    if (parsed && parsed.fen) {
      currentFen.value = parsed.fen
    } else {
      currentFen.value = props.initialFen
    }
  } else {
    currentFen.value = props.initialFen
  }
  moves.value = []
  chessBoard.value?.loadFen(currentFen.value)
  message.value = props.isEnglish ? "Your turn!" : "À toi de jouer !"
  messageType.value = "good"
  
  // Vider le cache pour libérer la mémoire
  clearCache()
}

// Fonction pour vider le cache
function clearCache() {
  evaluationCache.value.clear()
  pendingRequests.value.clear()
  console.log('🧹 Cache vidé')
}

// Fonction pour précharger les évaluations courantes
async function preloadCommonPositions() {
  console.log('🚀 Préchargement des positions courantes...')
  for (const fen of PERFORMANCE_CONFIG.PRELOAD_POSITIONS) {
    try {
      await analyzePosition(fen, PERFORMANCE_CONFIG.PRELOAD_DEPTH)
    } catch (error) {
      console.warn('⚠️ Erreur préchargement pour FEN:', fen)
    }
  }
  console.log('✅ Préchargement terminé')
}

function flipBoard() {
  flipped.value = !flipped.value
}

// --- Gestion des coups utilisateur ---
async function handleMove(move) {
  if (demoRunning.value) return
  if (!move?.from || !move?.to) return
  const uciMove = move.uci || (move.from + move.to + (move.promotion || ""))

  try {
    const response = await fetch("https://api.vitechess.com/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen: currentFen.value, move: uciMove }),
    })
    const data = await response.json()
    console.log('🔍 Réponse API move:', data)

    if (!response.ok || data.error) {
      message.value = data.error ? (props.isEnglish ? "❌ API Error: " + data.error : "❌ Erreur API : " + data.error) : (props.isEnglish ? "❌ Wrong move, try again!" : "❌ Mauvais coup, essaie encore !")
      messageType.value = "bad"
      setTimeout(() => {
        chessBoard.value?.loadFen(currentFen.value)
        message.value = ""
      }, 2000)
      return
    }

    // Nouvelle logique avec l'API cohérente : isBest est maintenant fiable
    if (data.isBest === false) {
      // Coup médiocre - afficher l'évaluation si disponible
      let errorMessage = props.isEnglish ? "❌ Wrong move, try again!" : "❌ Mauvais coup, essaie encore !"
      if (data.evaluation) {
        const evalText = formatEvaluation(data.evaluation, props.isEnglish)
        errorMessage += ` (${evalText})`
      }
      message.value = errorMessage
      messageType.value = "bad"
      setTimeout(() => {
        chessBoard.value?.loadFen(currentFen.value)
        message.value = ""
      }, 2000)
      return
    }

    // Coup accepté - afficher l'évaluation si disponible
    let successMessage = props.isEnglish ? "✅ Well played!" : "✅ Bien joué !"
    if (data.evaluation) {
      const evalText = formatEvaluation(data.evaluation, props.isEnglish)
      successMessage += ` (${evalText})`
    }
    message.value = successMessage
    messageType.value = "good"
    hintMove.value = ""
    hintRequested.value = false

    await new Promise(r => setTimeout(r, 500))

    currentFen.value = data.fen
    chessBoard.value?.highlightLastMove(move)

    if (data.isCheckmate) {
      message.value = props.isEnglish ? "🏆 Well done, you checkmated!" : "🏆 Bravo, tu as donné mat !"
      messageType.value = "good"
      // Émettre l'événement de leçon terminée
      emit('lesson-completed')
      // Retour à la position initiale après un court délai
      setTimeout(() => {
        resetToInitialPosition()
      }, 1500)
    } else if (isPawnPromotion(uciMove)) {
      // Pour les finales de pion, terminer dès qu'un pion est promu
      message.value = props.isEnglish ? "🎉 Well done! Pawn promoted!" : "🎉 Bravo ! Pion promu !"
      messageType.value = "good"
      // Émettre l'événement de leçon terminée
      emit('lesson-completed')
      // Retour à la position initiale après un court délai
      setTimeout(() => {
        resetToInitialPosition()
      }, 1500)
    } else if (isRookEndgamePromotion(uciMove)) {
      // Pour les finales de tour, message de promotion mais continuer
      message.value = props.isEnglish ? "🎉 Promotion! The pawn becomes a queen!" : "🎉 Promotion ! Le pion devient une dame !"
      messageType.value = "good"
      
      // Continuer le jeu normalement jusqu'au mat
    }
  } catch (err) {
    message.value = props.isEnglish ? "❌ Network error: " + err.message : "❌ Erreur réseau : " + err.message
    messageType.value = "bad"
    setTimeout(() => {
      chessBoard.value?.loadFen(currentFen.value)
      message.value = ""
    }, 2000)
  }
}

// --- Démo scriptée uniquement ---
async function startDemo() {
  demoRunning.value = true
  demoAborted.value = false
  resetToInitialPosition()
  // Préparer la séquence de coups: priorité aux scriptedMoves, sinon PGN
  let sequence = Array.isArray(props.scriptedMoves) ? [...props.scriptedMoves] : []
  if ((!sequence || sequence.length === 0) && props.scriptedPgn) {
    const { fen: fenFromPgn, sanMoves } = parsePgn(props.scriptedPgn)
    if (fenFromPgn) {
      currentFen.value = fenFromPgn
      chessBoard.value?.loadFen(currentFen.value)
    }
    sequence = sanMoves
  }
  if (!sequence || sequence.length === 0) {
    console.warn("🚫 No scripted demo for this module")
    message.value = props.isEnglish ? "🚫 This module has no scripted demo." : "🚫 Ce module n'a pas de démo scriptée."
    messageType.value = "bad"
    demoRunning.value = false
    return
  }
  console.log(`▶️ Début de la démo: ${sequence.length} coup(s)`) 
  const chess = new Chess(currentFen.value)

  for (let i = 0; i < sequence.length; i++) {
    if (demoAborted.value) break
    const step = sequence[i]

    // Accepte: 'e2e4' | 'e4' (SAN) | { from, to, promotion? }
    let move
    if (typeof step === 'string') {
      // essaie UCI d'abord
      if (/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(step)) {
        const from = step.slice(0, 2)
        const to = step.slice(2, 4)
        const promotion = step.slice(4) || undefined
        move = chess.move({ from, to, promotion })
      } else {
        move = chess.move(step, { sloppy: true })
      }
    } else if (step && typeof step === 'object' && step.from && step.to) {
      move = chess.move({ from: step.from, to: step.to, promotion: step.promotion })
    }
    if (!move) break

    moves.value.push(move.san)
    currentFen.value = chess.fen()
    chessBoard.value?.loadFen(currentFen.value)
    chessBoard.value?.highlightLastMove(move)

    // Sons
    if (move.flags && move.flags.includes('c')) {
      chessBoard.value?.playCaptureSound?.()
    } else {
      chessBoard.value?.playMoveSound?.()
    }

    const translatedMove = props.isEnglish ? translateToEnglish(move.san) : translateToFrench(move.san)
    message.value = (step && typeof step === 'object' && step.comment)
      ? step.comment
      : `▶️ ${Math.floor(i / 2) + 1}${i % 2 === 0 ? '.' : '...'} ${translatedMove}`
    messageType.value = ""
    // Delay between moves; allow stop during wait
    const delayMs = 1000
    const start = Date.now()
    while (Date.now() - start < delayMs) {
      if (demoAborted.value) break
      await new Promise(r => setTimeout(r, 50))
    }
    if (demoAborted.value) break
  }

  if (!demoAborted.value) {
    // Fin normale: on remet les pièces en place et on redonne la main au joueur
    resetToInitialPosition()
  }

  demoRunning.value = false
}

function stopDemo() {
  demoAborted.value = true
  demoRunning.value = false
  resetToInitialPosition()
  message.value = props.isEnglish ? "⏹️ Demo stopped" : "⏹️ Démo arrêtée"
  messageType.value = ""
}

// --- Fonction optimisée pour les appels API ---
async function analyzePosition(fen, depth = props.analysisDepth) {
  // Vérifier le cache d'abord
  const cacheKey = `${fen}-${depth}`
  if (evaluationCache.value.has(cacheKey)) {
    console.log('🚀 Cache hit pour FEN:', fen)
    return evaluationCache.value.get(cacheKey)
  }

  // Éviter les requêtes dupliquées
  if (pendingRequests.value.has(cacheKey)) {
    console.log('⏳ Requête en cours pour FEN:', fen)
    return await pendingRequests.value.get(cacheKey)
  }

  console.log('🔍 Nouvelle requête API pour FEN:', fen)
  
  const requestPromise = fetchWithTimeout(fen, depth)
  pendingRequests.value.set(cacheKey, requestPromise)
  
  try {
    const result = await requestPromise
    evaluationCache.value.set(cacheKey, result)
    return result
  } finally {
    pendingRequests.value.delete(cacheKey)
  }
}

async function fetchWithTimeout(fen, depth) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), props.apiTimeout)
  
  try {
    const response = await fetch(props.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        fen: fen,
        depth: depth
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

// --- Indice (utilise l'API principale) ---
async function getHint() {
  hintRequested.value = true
  isLoading.value = true
  loadingMessage.value = props.isEnglish ? "🤔 Analyzing position..." : "🤔 Analyse de la position..."
  message.value = loadingMessage.value
  messageType.value = ""
  
  try {
    const data = await analyzePosition(currentFen.value, props.analysisDepth)
    console.log('🔍 Réponse API:', data)
    console.log('🔍 Coup brut de l\'API:', data.best_move)
    const sanMove = translateUciToSan(data.best_move)
    const translatedMove = props.isEnglish ? translateToEnglish(sanMove) : translateToFrench(sanMove)
    console.log('🔍 Coup traduit:', translatedMove)
    hintMove.value = translatedMove
    
    // Afficher l'évaluation si disponible
    if (data.evaluation) {
      const evalText = formatEvaluation(data.evaluation, props.isEnglish)
      message.value = props.isEnglish ? `💡 Hint: ${translatedMove} (${evalText})` : `💡 Indice : ${translatedMove} (${evalText})`
    } else {
      message.value = props.isEnglish ? `💡 Hint: ${translatedMove}` : `💡 Indice : ${translatedMove}`
    }
    messageType.value = "good"
  } catch (error) {
    console.error('❌ Erreur API:', error)
    if (error.message.includes('timeout')) {
      message.value = props.isEnglish ? "⏰ Request timeout - try again" : "⏰ Délai d'attente dépassé - réessayez"
    } else {
      message.value = props.isEnglish ? "❌ Network error" : "❌ Erreur réseau"
    }
    messageType.value = "bad"
    hintRequested.value = false
  } finally {
    isLoading.value = false
  }
}

function translateUciToSan(uciMove) {
  if (!uciMove || uciMove.length < 4) return uciMove
  try {
    const chess = new Chess(currentFen.value)
    const from = uciMove.substring(0, 2)
    const to = uciMove.substring(2, 4)
    const promotion = uciMove.length > 4 ? uciMove[4] : undefined
    
    // Essayer de faire le coup
    const move = chess.move({ from, to, promotion })
    if (move) {
      return move.san
    }
    
    // Si le coup échoue, essayer de déterminer manuellement
    const piece = chess.get(from)
    if (piece) {
      const pieceType = piece.type.toUpperCase()
      const pieceSymbol = pieceType === 'P' ? '' : pieceType
      return pieceSymbol + to
    }
    
    return uciMove
  } catch (e) {
    console.warn('Erreur traduction UCI:', e)
    return uciMove
  }
}

function translateToFrench(sanMove) {
  if (!sanMove) return sanMove
  
  // Traduction simple et robuste
  let frenchMove = sanMove
  
  // Traduire seulement les pièces principales (ordre important)
  frenchMove = frenchMove.replace(/R/g, 'T')  // Tour (en premier pour éviter les conflits)
  frenchMove = frenchMove.replace(/K/g, 'R')  // Roi
  frenchMove = frenchMove.replace(/Q/g, 'D')  // Dame
  frenchMove = frenchMove.replace(/B/g, 'F')  // Fou
  frenchMove = frenchMove.replace(/N/g, 'C')  // Cavalier
  
  return frenchMove
}

function translateToEnglish(sanMove) {
  if (!sanMove) return sanMove
  
  // En anglais, la notation standard est déjà correcte (K, Q, R, B, N)
  // Pas de traduction nécessaire
  return sanMove
}

// --- Formatage des évaluations ---
function formatEvaluation(evaluation, isEnglish) {
  if (!evaluation) return ""
  
  // Gérer les évaluations de mat
  if (evaluation.includes("mate")) {
    const mateIn = evaluation.replace("mate ", "")
    return isEnglish ? `Mate in ${mateIn}` : `Mat en ${mateIn}`
  }
  
  // Gérer les évaluations en centipawns
  const centipawns = parseInt(evaluation)
  if (isNaN(centipawns)) return evaluation
  
  // Convertir en avantage lisible
  if (Math.abs(centipawns) < 10) {
    return isEnglish ? "Equal" : "Égalité"
  } else if (centipawns > 0) {
    const advantage = (centipawns / 100).toFixed(1)
    return isEnglish ? `+${advantage}` : `+${advantage}`
  } else {
    const disadvantage = (Math.abs(centipawns) / 100).toFixed(1)
    return isEnglish ? `-${disadvantage}` : `-${disadvantage}`
  }
}

// --- Détection de promotion ---
function isPawnPromotion(uciMove) {
  if (!uciMove || uciMove.length < 4) return false
  
  // Format UCI: "e7e8q" (de e7 vers e8, promotion en dame)
  const toRank = uciMove[3] // 4ème caractère = rangée de destination
  const hasPromotion = uciMove.length > 4 // 5ème caractère = pièce de promotion
  
  // Vérifier si c'est une promotion (pion qui arrive sur la dernière rangée)
  const isWhitePromotion = toRank === '8' && hasPromotion
  const isBlackPromotion = toRank === '1' && hasPromotion
  
  return isWhitePromotion || isBlackPromotion
}

function isRookEndgamePromotion(uciMove) {
  if (!uciMove || uciMove.length < 4) return false
  
  // Format UCI: "e7e8q" (de e7 vers e8, promotion en dame)
  const toRank = uciMove[3] // 4ème caractère = rangée de destination
  const hasPromotion = uciMove.length > 4 // 5ème caractère = pièce de promotion
  
  // Vérifier si c'est une promotion (pion qui arrive sur la dernière rangée)
  const isWhitePromotion = toRank === '8' && hasPromotion
  const isBlackPromotion = toRank === '1' && hasPromotion
  
  // Détecter si c'est une finale de tour (présence de tours sur l'échiquier)
  const chess = new Chess(currentFen.value)
  const board = chess.board()
  let hasRooks = false
  
  for (let row of board) {
    for (let piece of row) {
      if (piece && piece.type === 'r') {
        hasRooks = true
        break
      }
    }
    if (hasRooks) break
  }
  
  return (isWhitePromotion || isBlackPromotion) && hasRooks
}

// --- Utilitaires PGN ---
function parsePgn(pgn) {
  // Extrait FEN si présente
  const fenMatch = pgn.match(/\[FEN\s+"([^"]+)"\]/i)
  const fen = fenMatch ? fenMatch[1] : null
  // Enlève headers
  const body = pgn.replace(/\[[^\]]*\]\s*/g, " ")
  // Enlève commentaires { ... } et variantes ( ... )
  const noComments = body.replace(/\{[^}]*\}/g, " ").replace(/\([^)]*\)/g, " ")
  // Enlève numéros de coups et résultats
  const tokens = noComments
    .replace(/\d+\.(\.\.)?/g, " ")
    .replace(/1-0|0-1|1\/2-1\/2|\*/g, " ")
    .trim()
    .split(/\s+/)
  // Garde que les SAN plausibles (incluant roques et promotions)
  const sanMoves = tokens.filter(t => /^(O-O(-O)?|[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](=[NBRQ])?[+#]?|[a-h]x[a-h][1-8](=[NBRQ])?[+#]?)$/.test(t))
  return { fen, sanMoves }
}

onMounted(async () => {
  // Charger la position initiale correcte au démarrage
  resetToInitialPosition()
  updateWelcomeMessage()
  
  // Précharger les positions courantes en arrière-plan
  setTimeout(() => {
    preloadCommonPositions()
  }, PERFORMANCE_CONFIG.PRELOAD_DELAY)
  
  // Nettoyer le cache périodiquement
  setInterval(() => {
    cleanupCache(evaluationCache.value)
  }, PERFORMANCE_CONFIG.CACHE_CLEANUP_INTERVAL)
})

// Réagir aux changements de langue
watch(() => props.isEnglish, () => {
  updateWelcomeMessage()
})

function updateWelcomeMessage() {
  message.value = props.isEnglish ? "👋 Welcome! Click 🚀 to start the demo." : "👋 Bienvenue ! Clique sur 🚀 pour lancer la démo."
  messageType.value = "good"
}
</script>

<style scoped>
.lesson-module {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
</style>





