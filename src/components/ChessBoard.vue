<template>
  <div class="chess-board-container">
    <div class="board-with-rows">
      <div class="row-labels">
        <div v-for="(rowLabel, index) in rowLabels" :key="index" class="row-label">
          {{ rowLabel }}
        </div>
      </div>
      <div class="chess-board">
        <div v-for="(row, rowIndex) in board" :key="rowIndex" class="row">
          <div v-for="(square, colIndex) in row" :key="colIndex" class="square" :class="getSquareColor(rowIndex, colIndex)"
               @dragover.prevent @drop="handleDrop($event, rowIndex, colIndex)">
            <div v-if="square" class="piece" :draggable="true" @dragstart="handleDragStart($event, rowIndex, colIndex)">
              <ChessPiece :piece="square"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="column-labels">
      <div v-for="(colLabel, index) in columnLabels" :key="index" class="column-label">
        {{ colLabel }}
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, watch } from 'vue';
import ChessPiece from './ChessPiece.vue';
import { Chess } from 'chess.js';

export default defineComponent({
  name: 'ChessBoard',
  components: {
    ChessPiece
  },
  props: ['fen'],
  data() {
    return {
      chess: new Chess(),
      board: Array(8).fill(null).map(() => Array(8).fill(null)),
      columnLabels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      rowLabels: ['8', '7', '6', '5', '4', '3', '2', '1'],
      draggedPiece: null
    };
  },
  mounted() {
    this.updateBoard(fen);
  },
  methods: {
    updateBoard(fen) {
      this.chess.load(fen);
      const newBoard = Array(8).fill(null).map(() => Array(8).fill(null));
      this.chess.board().forEach((row, colIndex) => {
        row.forEach((square, rowIndex) => {
          if (square) {
            const piece = square.color === 'b' ? 'b' : 'w';
            newBoard[rowIndex][colIndex] = piece + square.type.toUpperCase();
          }
        });
      });
      this.board = newBoard;
    },
    getSquareColor(row, col) {
      return (row + col) % 2 === 0 ? 'white' : 'black';
    },
    getCoordinates(row, col) {
      return this.columnLabels[col] + this.rowLabels[row];
    },
    handleDragStart(event, row, col) {
      this.draggedPiece = { row, col };
    },
    handleDrop(event, row, col) {
      const { row: fromRow, col: fromCol } = this.draggedPiece;
      const from = this.getCoordinates(fromRow, fromCol);
      const to = this.getCoordinates(row, col);
      const move = this.chess.move({ from, to });

      if (move) {
        this.updateBoard(this.chess.fen());
        this.$emit('move', this.chess.fen());
      }
    }
  },
  watch: {
    fen(newFen) {
      this.updateBoard(newFen);
    }
  }
});
</script>

<style scoped>
.chess-board-container {
  width: 605px;
  height: 605px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: var(--white-color);
  border-radius: 15px;
  padding-top: 15px;
  padding-right: 15px;
}

.board-with-rows {
  display: flex;
  align-items: center;
}

.row-labels {
  display: grid;
  grid-template-rows: repeat(8, 69px);
  color: var(--black-color);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 15px;
  margin-right: 10px;
  margin-top: 30px;
}

.chess-board {
  display: grid;
  grid-template-columns: repeat(8, 69px);
  grid-template-rows: repeat(8, 69px);
  border: 3px solid var(--black-color);
}

.square {
  width: 69px;
  height: 69px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.coordinates {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 10px;
  color: red;
}

.white {
  background-color: var(--white-color);
}

.black {
  background-color: var(--black-color);
}

.piece {
  width: 100%;
  height: 100%;
}

.column-labels {
  display: grid;
  grid-template-columns: repeat(8, 69px);
  padding: 10px;
  margin: -10px;
}

.column-label {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--black-color);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 15px;
}
</style>













  
  
  
  
  
  
  