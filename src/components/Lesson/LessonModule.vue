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
  },
  // Optionnel: permet de fournir une partie PGN complète
  scriptedPgn: { type: String, default: "" }
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
  message.value = "À toi de jouer !"
  messageType.value = "good"
}

// --- Gestion des coups utilisateur ---
async function handleMove(move) {
  if (demoRunning.value) return
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
    console.warn("🚫 Aucune démo scriptée pour ce module")
    message.value = "🚫 Ce module n'a pas de démo scriptée."
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
  message.value = "⏹️ Démo arrêtée"
  messageType.value = ""
  // Ne pas réinitialiser la position pour éviter l'effet de rollback
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





