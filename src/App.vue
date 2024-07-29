<template>
  <div class="container">
    <div>
      <ChessBoard @fen="handleUpdateFen" :fen="currentFen" :flipped="flipped" @move="handleMove"/>
      <FenBoard @update-fen="handleUpdateFen" :fen="currentFen" />
    </div>
    <FrameBoard :moves="moves" @flip="flipBoard"/>
  </div>
</template>
<script>
import { defineComponent } from 'vue';
import ChessBoard from './components/chessBoard/chessBoard.vue';
import FenBoard from './components/FenBoard.vue';
import FrameBoard from './components/FrameBoard.vue';

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
    console.log(move);
  }
  }
});
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



