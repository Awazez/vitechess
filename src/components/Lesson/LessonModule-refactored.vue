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
      @get-hint="getHint"
      @start-demo="startDemo"
      @stop-demo="stopDemo"
      @reset="resetToInitialPosition"
    />
  </div>
</template>

<script setup>
// ============================================================================
// IMPORTS & DEPENDENCIES
// ============================================================================
import { ref, onMounted, watch, nextTick, watchEffect } from "vue"
import { Chess } from "chess.js"
import LessonBox from "./LessonBox.vue"
import ChessBoard from "../chessBoard/chessBoard.vue"
import { useChessGame } from "../../composables/useChessGame.js"
import { useStockfishApi } from "../../composables/useStockfishApi.js"
import { useLessonDemo } from "../../composables/useLessonDemo.js"
import { useTranslation } from "../../composables/useTranslation.js"

// ============================================================================
// PROPS & EMITS
// ============================================================================
const props = defineProps({
  title: { type: String, default: "Basic mate" },
  initialFen: { type: String, default: "8/8/3k4/8/4Q3/8/4K3/8 w - - 0 1" },
  scriptedMoves: { type: Array, default: () => [] },
  scriptedPgn: { type: String, default: "" },
  selectedPieceSet: { type: String, default: "cburnett" },
  isEnglish: { type: Boolean, default: false },
  apiUrl: { type: String, default: "https://api.vitechess.com/analyze" },
  apiTimeout: { type: Number, default: 3000 },
  analysisDepth: { type: Number, default: 8 }
})

const emit = defineEmits(['lesson-completed'])

// ============================================================================
// COMPOSABLES - LOGIQUE MÉTIER
// ============================================================================
const { 
  currentFen, 
  moves, 
  flipped, 
  isWhiteTurn, 
  resetToInitialPosition: resetGame, 
  flipBoard, 
  applyMove, 
  getGameState 
} = useChessGame(props.initialFen)

const { 
  analyzePosition, 
  preloadCommonPositions, 
  cleanupCache 
} = useStockfishApi()

const { 
  demoRunning, 
  demoAborted, 
  parsePgn, 
  translateToFrench, 
  translateToEnglish, 
  translateUciToSan, 
  formatEvaluation,
  isPawnPromotion,
  isRookEndgamePromotion
} = useLessonDemo()

const { t } = useTranslation(ref(props.isEnglish))

// ============================================================================
// ÉTAT LOCAL - UI STATE
// ============================================================================
const message = ref("")
const messageType = ref("")
const hintMove = ref("")
const hintRequested = ref(false)
const isLoading = ref(false)
const loadingMessage = ref("")
const chessBoard = ref(null)

// ============================================================================
// WATCHERS - RÉACTIVITÉ
// ============================================================================
// Reset quand la prop initialFen change (changement de module)
watch(() => props.initialFen, () => resetToInitialPosition())

// Reset aussi quand le PGN change (changement de module PGN)
watch(() => props.scriptedPgn, () => resetToInitialPosition())

// Optimisation UI : Synchronisation non-bloquante du plateau
watchEffect(() => {
  if (chessBoard.value && currentFen.value) {
    chessBoard.value.loadFen(currentFen.value)
  }
}, { flush: 'post' })

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================
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
  
  resetGame(currentFen.value)
  message.value = t.value.yourTurn
  messageType.value = "good"
  
  // Vider le cache pour libérer la mémoire
  cleanupCache()
}

// ============================================================================
// GESTION DES COUPS UTILISATEUR
// ============================================================================
async function handleMove(move) {
  if (demoRunning.value) return
  if (!move?.from || !move?.to) return
  
  const uciMove = move.uci || (move.from + move.to + (move.promotion || ""))
  const result = applyMove(uciMove)
  
  if (!result.success) {
    message.value = t.value.invalidMove
    messageType.value = "bad"
    setTimeout(() => {
      chessBoard.value?.loadFen(currentFen.value)
      message.value = ""
      messageType.value = ""
    }, 2000)
    return
  }

  // Mise à jour optimisée (watchEffect s'en charge)
  chessBoard.value?.highlightLastMove(result.move)

  // Sons après mise à jour DOM
  nextTick(() => {
    if (result.move.flags && result.move.flags.includes('c')) {
      chessBoard.value?.playCaptureSound?.()
    } else {
      chessBoard.value?.playMoveSound?.()
    }
  })

  // Vérifier les conditions de fin de partie
  if (result.isCheckmate) {
    message.value = t.value.checkmate
    messageType.value = "good"
    emit('lesson-completed', { hasErrors: false })
    setTimeout(() => resetToInitialPosition(), 2000)
    return
  }

  if (result.isStalemate) {
    message.value = t.value.stalemate
    messageType.value = "bad"
    emit('lesson-completed', { hasErrors: true })
    setTimeout(() => resetToInitialPosition(), 2000)
    return
  }

  if (result.isDraw) {
    message.value = t.value.draw
    messageType.value = "bad"
    emit('lesson-completed', { hasErrors: true })
    setTimeout(() => resetToInitialPosition(), 2000)
    return
  }

  // Message pour le tour suivant
  if (result.sideToMove === 'w') {
    message.value = t.value.yourTurn
  } else {
    message.value = t.value.computerTurn
    // Faire jouer les noirs automatiquement
    playEngineMove()
  }
  messageType.value = "good"
}

// ============================================================================
// GESTION DE L'ORDINATEUR
// ============================================================================
async function playEngineMove() {
  try {
    console.log('🤖 L\'ordinateur joue...')
    const startTime = performance.now()
    
    // Utiliser une profondeur optimisée (comme Lichess)
    const data = await analyzePosition(currentFen.value, 8)
    
    const apiTime = performance.now() - startTime
    console.log(`⚡ API time: ${apiTime.toFixed(0)}ms`)
    
    if (data.best_move) {
      // Utiliser le composable pour appliquer le coup
      const result = applyMove(data.best_move)
      
      if (!result.success) {
        console.error('❌ Coup invalide de l\'ordinateur:', data.best_move)
        message.value = t.value.computerError
        messageType.value = "bad"
        return
      }
      
      // Mise à jour optimisée (watchEffect s'en charge)
      chessBoard.value?.highlightLastMove(result.move)
      
      // Sons après mise à jour DOM
      nextTick(() => {
        if (result.move.flags && result.move.flags.includes('c')) {
          chessBoard.value?.playCaptureSound?.()
        } else {
          chessBoard.value?.playMoveSound?.()
        }
      })
      
      // Vérifier les conditions de fin de partie
      if (result.isCheckmate) {
        message.value = t.value.checkmate
        messageType.value = "good"
        emit('lesson-completed', { hasErrors: false })
        setTimeout(() => resetToInitialPosition(), 2000)
        return
      }
      
      if (result.isStalemate) {
        message.value = t.value.stalemate
        messageType.value = "bad"
        emit('lesson-completed', { hasErrors: true })
        setTimeout(() => resetToInitialPosition(), 2000)
        return
      }
      
      if (result.isDraw) {
        message.value = t.value.draw
        messageType.value = "bad"
        emit('lesson-completed', { hasErrors: true })
        setTimeout(() => resetToInitialPosition(), 2000)
        return
      }
      
      // Message pour le tour suivant
      if (result.sideToMove === 'w') {
        message.value = t.value.yourTurn
      } else {
        message.value = t.value.computerTurn
      }
      messageType.value = "good"
      
      const totalTime = performance.now() - startTime
      console.log(`⚡ Total time: ${totalTime.toFixed(0)}ms`)
    }
  } catch (error) {
    console.error('❌ Erreur lors du coup de l\'ordinateur:', error)
    message.value = t.value.computerError
    messageType.value = "bad"
  }
}

// ============================================================================
// GESTION DE LA DÉMO
// ============================================================================
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
    message.value = t.value.noScriptedDemo
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
    // Mise à jour optimisée (watchEffect s'en charge)
    chessBoard.value?.highlightLastMove(move)

    // Sons après mise à jour DOM
    nextTick(() => {
      if (move.flags && move.flags.includes('c')) {
        chessBoard.value?.playCaptureSound?.()
      } else {
        chessBoard.value?.playMoveSound?.()
      }
    })

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
  message.value = t.value.demoStopped
  messageType.value = ""
}

// ============================================================================
// GESTION DES INDICES
// ============================================================================
async function getHint() {
  hintRequested.value = true
  isLoading.value = true
  loadingMessage.value = t.value.analyzingPosition
  message.value = loadingMessage.value
  messageType.value = ""
  
  try {
    // Profondeur augmentée pour les indices (comme Lichess)
    const data = await analyzePosition(currentFen.value, 12)
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
      message.value = t.value.requestTimeout
    } else if (error.message.includes('CORS') || error.message.includes('cors') || error.message.includes('Access-Control-Allow-Origin')) {
      message.value = t.value.corsError
    } else if (error.message.includes('Failed to fetch')) {
      message.value = t.value.networkError
    } else {
      message.value = props.isEnglish ? "❌ API error: " + error.message : "❌ Erreur API : " + error.message
    }
    messageType.value = "bad"
    hintRequested.value = false
  } finally {
    isLoading.value = false
  }
}

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================
onMounted(async () => {
  // Charger la position initiale correcte au démarrage
  resetToInitialPosition()
  
  // Précharger les positions courantes en arrière-plan
  setTimeout(() => {
    preloadCommonPositions()
  }, 500)
  
  // Nettoyer le cache périodiquement
  setInterval(() => {
    cleanupCache()
  }, 30000)
})

// Réagir aux changements de langue
watch(() => props.isEnglish, () => {
  // La traduction se met à jour automatiquement via le composable
})
</script>

