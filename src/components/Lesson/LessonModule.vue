<template>
  <div class="lesson-module">
    <ChessBoard
      ref="chessBoard"
      :fen="currentFen"
      :flipped="flipped"
      @move="handleMove"
    />

    <LessonBox
      :title="title"
      :message="message"
      :messageType="messageType"
      :hintMove="hintMove"
      :demoRunning="demoRunning"
      :hintRequested="hintRequested"
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
  title: { type: String, default: "Mat élémentaire" },
  initialFen: { type: String, default: "8/8/3k4/8/4Q3/8/4K3/8 w - - 0 1" },
  scriptedMoves: {
    type: Array,
    default: () => []
  }
})

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

function resetToInitialPosition() {
  currentFen.value = props.initialFen
  moves.value = []
  chessBoard.value?.loadFen(currentFen.value)
  message.value = "À toi de jouer !"
  messageType.value = "good"
}

// --- Gestion des coups utilisateur ---
async function handleMove(move) {
  if (!move?.from || !move?.to) return
  const uciMove = move.uci || (move.from + move.to + (move.promotion || ""))

  try {
    const response = await fetch("http://127.0.0.1:8080/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen: currentFen.value, move: uciMove }),
    })
    const data = await response.json()

    if (!response.ok || data.isBest === false) {
      message.value = data.error ? "❌ Erreur API : " + data.error : "❌ Mauvais coup, essaie encore !"
      messageType.value = "bad"
      setTimeout(() => {
        chessBoard.value?.loadFen(currentFen.value)
        message.value = ""
      }, 2000)
      return
    }

    message.value = "✅ Bien joué !"
    messageType.value = "good"
    hintMove.value = ""
    hintRequested.value = false

    await new Promise(r => setTimeout(r, 500))

    currentFen.value = data.fen
    chessBoard.value?.highlightLastMove(move)

    if (data.isCheckmate) {
      message.value = "🏆 Bravo, tu as donné mat !"
      messageType.value = "good"
    }
  } catch (err) {
    message.value = "❌ Erreur réseau : " + err.message
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
  const chess = new Chess(currentFen.value)

  for (let i = 0; i < props.scriptedMoves.length; i++) {
    if (demoAborted.value) break
    const move = chess.move(props.scriptedMoves[i], { sloppy: true })
    if (!move) break

    moves.value.push(move.san)
    currentFen.value = chess.fen()
    chessBoard.value?.loadFen(currentFen.value)
    chessBoard.value?.highlightLastMove(move)

    message.value = `▶️ Coup ${i + 1}: ${move.san}`
    messageType.value = ""
    await new Promise(r => setTimeout(r, 1000))
  }

  if (!demoAborted.value) {
    message.value = "🏆 Démo scriptée terminée !"
    messageType.value = "good"
  }

  demoRunning.value = false
}

function stopDemo() {
  demoAborted.value = true
  demoRunning.value = false
  message.value = "⏹️ Démo arrêtée"
  messageType.value = ""
  setTimeout(() => resetToInitialPosition(), 1500)
}

// --- Indice (via Stockfish si tu veux le garder) ---
async function getHint() {
  hintRequested.value = true
  message.value = "🤔 Recherche du meilleur coup..."
  messageType.value = ""
  try {
    const response = await fetch("http://127.0.0.1:8080/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen: currentFen.value }),
    })
    const data = await response.json()
    if (!response.ok) {
      message.value = "❌ Impossible d'obtenir un indice"
      messageType.value = "bad"
      hintRequested.value = false
      return
    }
    hintMove.value = translateHintToFrench(data.bestMove)
    message.value = ""
  } catch {
    message.value = "❌ Erreur réseau"
    messageType.value = "bad"
    hintRequested.value = false
  }
}

function translateHintToFrench(uciMove) {
  if (!uciMove || uciMove.length < 4) return uciMove
  const from = uciMove.substring(0, 2)
  const to = uciMove.substring(2, 4)
  const promotion = uciMove.length > 4 ? uciMove[4] : ""
  const chess = new Chess(currentFen.value)
  const piece = chess.get(from)
  if (!piece) return `${from} → ${to}`

  const pieceNames = { k: "R", q: "D", r: "T", b: "F", n: "C", p: "" }
  const pieceLetter = pieceNames[piece.type] || ""
  let moveNotation = `${pieceLetter}${to}`
  if (promotion) moveNotation += `=${pieceNames[promotion] || promotion}`

  return moveNotation
}

onMounted(() => {
  message.value = "👋 Bienvenue ! Clique sur 🚀 pour lancer la démo."
  messageType.value = "good"
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





