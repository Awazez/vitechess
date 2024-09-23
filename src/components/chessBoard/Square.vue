<template>
    <div 
      class="square" 
      :class="[getSquareColor, 
               { 'selected': isSelected, 
                 'possible-move': isPossibleMove, 
                 'king-check': isKingInCheck, 
                 'last-move': isLastMove }]" 
      @click="handleClick">
      <div v-if="piece" class="piece">
        <chessPiece :piece="piece"/>
      </div>
      <div v-if="isPossibleMove" class="move-point"></div>
    </div>
  </template>
  
  <script>
  import chessPiece from './chessPiece.vue';
  
  export default {
    name: 'Square',
    props: {
      piece: String,
      rowIndex: Number,
      colIndex: Number,
      isSelected: Boolean,
      isPossibleMove: Boolean,
      isKingInCheck: Boolean,
      isLastMove: Boolean,
      getSquareColor: String, // Color of the square
    },
    components: {
      chessPiece
    },
    methods: {
      handleClick() {
        // Emit an event to the parent component with the row and column indices
        this.$emit('square-click', { row: this.rowIndex, col: this.colIndex });
      }
    }
  };
  </script>
  
  <style scoped>
  .square {
    width: 69px;
    height: 69px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  .piece {
    width: 100%;
    height: 100%;
  }
  
  .selected {
    background-color: var(--selected-color) !important;
  }
  
  .possible-move {
    position: relative;
  }
  
  .move-point {
    width: 20px;
    height: 20px;
    background-color: black;
    opacity: 25%;
    border-radius: 50%;
    position: absolute;
  }
  
  .king-check {
    background-color: var(--check-color);
  }
  
  .last-move {
    background-color: var(--move-color);
  }
  </style>
  