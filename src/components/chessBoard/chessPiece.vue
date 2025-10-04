<!-- ChessPiece.vue -->
<template>
  <img :src="pieceImage" class="chess-piece" />
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ChessPiece',
  props: {
    piece: {
      type: String,
      required: true
    },
    selectedPieceSet: {
      type: String,
      default: 'cburnett'
    }
  },
  computed: {
    pieceImage() {
      // Utiliser le chemin public qui fonctionne avec Vite
      const path = `/pieces/${this.selectedPieceSet}/${this.piece}.svg`;
      console.log('🎯 Chargement pièce:', path);
      return path;
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
