import { ref, computed } from 'vue'
import { Chess } from 'chess.js'

export function useChessGame(initialFen) {
  const currentFen = ref(initialFen)
  const moves = ref([])
  const flipped = ref(false)
  
  // Computed property pour déterminer qui a le trait
  const isWhiteTurn = computed(() => {
    try {
      const chess = new Chess(currentFen.value)
      return chess.turn() === 'w'
    } catch (e) {
      return true // Par défaut, blancs
    }
  })
  
  function resetToInitialPosition(initialFen) {
    currentFen.value = initialFen
    moves.value = []
  }
  
  function flipBoard() {
    flipped.value = !flipped.value
  }
  
  function applyMove(uciMove) {
    try {
      console.log('🎯 applyMove - FEN actuelle:', currentFen.value)
      console.log('🎯 applyMove - Coup UCI:', uciMove)
      
      const chess = new Chess(currentFen.value)
      
      // Convertir le coup UCI en objet pour chess.js
      let moveObj
      if (typeof uciMove === 'string' && uciMove.length >= 4) {
        const from = uciMove.substring(0, 2)
        const to = uciMove.substring(2, 4)
        const promotion = uciMove.length > 4 ? uciMove[4] : undefined
        
        console.log('🎯 applyMove - Conversion UCI:', { from, to, promotion })
        moveObj = chess.move({ from, to, promotion })
      } else {
        console.log('🎯 applyMove - Coup direct:', uciMove)
        moveObj = chess.move(uciMove)
      }
      
      if (!moveObj) {
        console.error('❌ applyMove - Coup invalide:', uciMove)
        return { success: false, error: 'Invalid move' }
      }
      
      console.log('✅ applyMove - Coup valide:', moveObj.san)
      currentFen.value = chess.fen()
      moves.value.push(moveObj.san)
      
      return {
        success: true,
        move: moveObj,
        fen: currentFen.value,
        isCheckmate: chess.isCheckmate(),
        isStalemate: chess.isStalemate(),
        isDraw: chess.isDraw(),
        sideToMove: chess.turn()
      }
    } catch (error) {
      console.error('❌ applyMove - Erreur:', error.message)
      return { success: false, error: error.message }
    }
  }
  
  function getGameState() {
    const chess = new Chess(currentFen.value)
    return {
      fen: currentFen.value,
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      isDraw: chess.isDraw(),
      sideToMove: chess.turn()
    }
  }
  
  return {
    currentFen,
    moves,
    flipped,
    isWhiteTurn,
    resetToInitialPosition,
    flipBoard,
    applyMove,
    getGameState
  }
}
