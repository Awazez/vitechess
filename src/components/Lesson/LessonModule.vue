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
      @start-demo="startDemo"
      @stop-demo="stopDemo"
      @get-hint="getHint"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
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

    if (!response.ok || data.isBest === false) {
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

    message.value = (step && typeof step === 'object' && step.comment)
      ? step.comment
      : `▶️ Coup ${i + 1}: ${move.san}`
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

// --- Indice (désactivé en production) ---
async function getHint() {
  hintRequested.value = true
  message.value = props.isEnglish ? "🤔 Looking for the best move..." : "🤔 Recherche du meilleur coup..."
  messageType.value = ""
  
  // Désactiver les indices en production (serveur local non disponible)
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.location.hostname === ''
  
  if (!isLocal) {
    message.value = props.isEnglish ? "❌ Hints not available in production" : "❌ Indices non disponibles en production"
    messageType.value = "bad"
    hintRequested.value = false
    return
  }
  
  try {
    const response = await fetch("http://127.0.0.1:8080/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen: currentFen.value }),
    })
    const data = await response.json()
    if (!response.ok) {
      message.value = props.isEnglish ? "❌ Unable to get hint" : "❌ Impossible d'obtenir un indice"
      messageType.value = "bad"
      hintRequested.value = false
      return
    }
    hintMove.value = translateToFrench(translateUciToSan(data.bestMove))
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
    const move = chess.move({ from, to, promotion })
    return move?.san || uciMove
  } catch {
    return uciMove
  }
}

function translateToFrench(sanMove) {
  if (!sanMove) return sanMove
  
  // Dictionnaire de traduction des pièces
  const pieceTranslations = {
    'K': 'R',  // Roi
    'Q': 'D',  // Dame
    'R': 'T',  // Tour
    'B': 'F',  // Fou
    'N': 'C',  // Cavalier
    'P': ''    // Pion (pas de lettre en français)
  }
  
  // Dictionnaire de traduction des colonnes
  const columnTranslations = {
    'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f', 'g': 'g', 'h': 'h'
  }
  
  // Dictionnaire de traduction des rangées
  const rankTranslations = {
    '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8'
  }
  
  let frenchMove = sanMove
  
  // Traduire les pièces
  for (const [english, french] of Object.entries(pieceTranslations)) {
    frenchMove = frenchMove.replace(new RegExp(english, 'g'), french)
  }
  
  // Traduire les colonnes (a-h restent identiques)
  for (const [english, french] of Object.entries(columnTranslations)) {
    frenchMove = frenchMove.replace(new RegExp(english, 'g'), french)
  }
  
  // Traduire les rangées (1-8 restent identiques)
  for (const [english, french] of Object.entries(rankTranslations)) {
    frenchMove = frenchMove.replace(new RegExp(english, 'g'), french)
  }
  
  // Traduire les symboles spéciaux
  frenchMove = frenchMove.replace(/x/g, 'x')  // Prise (reste identique)
  frenchMove = frenchMove.replace(/\+/g, '+')  // Échec (reste identique)
  frenchMove = frenchMove.replace(/#/g, '#')  // Échec et mat (reste identique)
  frenchMove = frenchMove.replace(/=/g, '=')  // Promotion (reste identique)
  
  return frenchMove
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





