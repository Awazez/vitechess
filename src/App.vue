<template>
  <div class="container">
    <div>
      <ChessBoard
        ref="chessBoard" 
        @fen="handleUpdateFen" 
        :fen="currentFen" 
        :flipped="flipped" 
        @move="handleMove"
        :currentMoveIndex="currentMoveIndex"
      />
      <FenBoard 
        @update-fen="handleUpdateFen" 
        :fen="currentFen" 
      />
    </div>
    <FrameBoard 
      :moves="moves" 
      @flip="flipBoard" 
      @move-selected="handleMoveSelected"
      :currentMoveIndex="currentMoveIndex" 
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import ChessBoard from './components/chessBoard/chessBoard.vue';
import FenBoard from './components/FenBoard.vue';
import FrameBoard from './components/FrameBoard.vue';
import { Chess } from 'chess.js';

export default defineComponent({
  name: 'App',
  components: {
    ChessBoard,
    FenBoard,
    FrameBoard
  },
  data() {
    return {
      currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // FEN initial
      flipped: false,
      fen: [],
      moves: []
    };
  },
  methods: {
  handleUpdateFen(fen) {
    this.currentFen = fen;
  },
  flipBoard() {
    this.flipped = !this.flipped;
  },
  handleMove(move) {
    this.moves.push(move);
  },
  handleMoveSelected(index) {
    const chess = new Chess(); // Create a new Chess.js instance
    chess.reset(); // Reset the board to the initial position

    let lastMove = null;
    for (let i = 0; i <= index; i++) {
      lastMove = chess.move(this.moves[i]); // Play the moves up to the selected one
    }

    this.currentFen = chess.fen(); // Update the FEN string
    this.$refs.chessBoard.highlightLastMove(lastMove); // Highlight the selected move on the board
  }
}
  }
);
</script>

<style scoped>
.container {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
}
</style>



