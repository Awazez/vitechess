<template>
    <div class="piece" @click="onPieceClick">
      <img :src="getPieceImage(piece)" alt="chess piece" />
    </div>
  </template>
  
  <script lang="ts">
  export default {
    name: 'ChessPiece',
    props: {
      piece: {
        type: String,
        required: true,
      },
    },
    methods: {
      getPieceImage(piece) {
        return require(`@/assets/chess-pieces/${piece}.png`); // Ajustez le chemin selon vos besoins
      },
      onPieceClick() {
        this.$emit('piece-click', this.piece);
      },
    },
  };
  </script>
  
  <style scoped>
  .piece img {
    width: 60px;
    height: 60px;
  }
  </style>