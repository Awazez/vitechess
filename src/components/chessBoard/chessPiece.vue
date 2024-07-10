<!-- ChessPiece.vue -->
<template>
  <img :src="pieceImage" class="chess-piece" />
</template>

<script>
import { defineComponent } from 'vue';

import bB from '../../assets/pieces/cburnett/bB.svg';
import bK from '../../assets/pieces/cburnett/bK.svg';
import bN from '../../assets/pieces/cburnett/bN.svg';
import bP from '../../assets/pieces/cburnett/bP.svg';
import bQ from '../../assets/pieces/cburnett/bQ.svg';
import bR from '../../assets/pieces/cburnett/bR.svg';
import wB from '../../assets/pieces/cburnett/wB.svg';
import wK from '../../assets/pieces/cburnett/wK.svg';
import wN from '../../assets/pieces/cburnett/wN.svg';
import wP from '../../assets/pieces/cburnett/wP.svg';
import wQ from '../../assets/pieces/cburnett/wQ.svg';
import wR from '../../assets/pieces/cburnett/wR.svg';

export default defineComponent({
  name: 'ChessPiece',
  props: {
    piece: {
      type: String,
      required: true
    }
  },
  computed: {
    pieceImage() {
      const pieces = {
        bB, bK, bN, bP, bQ, bR,
        wB, wK, wN, wP, wQ, wR
      };
      return pieces[this.piece];
    }
  }
});
</script>

<style scoped>
.chess-piece {
  width: 100%;
  height: 100%;
}
</style>
