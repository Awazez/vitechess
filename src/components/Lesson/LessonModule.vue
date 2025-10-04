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
  isEnglish: { type: Boolean, default: false }
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

const chessBoard = ref(null)

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

    if (!response.ok || data.error) {
      message.value = data.error ? (props.isEnglish ? "❌ API Error: " + data.error : "❌ Erreur API : " + data.error) : (props.isEnglish ? "❌ Wrong move, try again!" : "❌ Mauvais coup, essaie encore !")
      messageType.value = "bad"
      setTimeout(() => {
        chessBoard.value?.loadFen(currentFen.value)
        message.value = ""
      }, 2000)
      return
    }

    message.value = props.isEnglish ? "✅ Well played!" : "✅ Bien joué !"
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

// --- Indice (utilise l'API principale) ---
async function getHint() {
  hintRequested.value = true
  message.value = props.isEnglish ? "🤔 Looking for the best move..." : "🤔 Recherche du meilleur coup..."
  messageType.value = ""
  
  try {
    // Utiliser l'API principale au lieu du serveur local
    console.log('🔍 Demande d\'indice avec FEN:', currentFen.value)
    const response = await fetch("https://api.vitechess.com/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen: currentFen.value }),
    })
    const data = await response.json()
    console.log('🔍 Réponse API:', data)
    if (!response.ok) {
      message.value = props.isEnglish ? "❌ Unable to get hint" : "❌ Impossible d'obtenir un indice"
      messageType.value = "bad"
      hintRequested.value = false
      return
    }
    console.log('🔍 Coup brut de l\'API:', data.bestMove)
    const sanMove = translateUciToSan(data.bestMove)
    const translatedMove = props.isEnglish ? translateToEnglish(sanMove) : translateToFrench(sanMove)
    console.log('🔍 Coup traduit:', translatedMove)
    hintMove.value = translatedMove
    message.value = ""
  } catch {
    message.value = props.isEnglish ? "❌ Network error" : "❌ Erreur réseau"
    messageType.value = "bad"
    hintRequested.value = false
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

onMounted(() => {
  // Charger la position initiale correcte au démarrage
  resetToInitialPosition()
  updateWelcomeMessage()
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





