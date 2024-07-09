<template>
  <div class="chess-board-container">
    <div class="board-with-rows">
      <div class="row-labels">
        <div v-for="(rowLabel, index) in displayedRowLabels" :key="index" class="row-label">
          {{ rowLabel }}
        </div>
      </div>
      <div class="chess-board">
        <div v-for="(row, rowIndex) in displayedBoard" :key="rowIndex" class="row">
          <div v-for="(square, colIndex) in row" :key="colIndex" class="square" :class="getSquareColor(rowIndex, colIndex)"
          @click="handleSquareClick(rowIndex, colIndex)">
            <div v-if="square" class="piece" :class="{ selected: isSelected(rowIndex, colIndex) }">
              <ChessPiece :piece="square"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="column-labels">
      <div v-for="(colLabel, index) in displayedColumnLabels" :key="index" class="column-label">
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
  props: {
    fen: String,
    flipped: Boolean
  },
  data() {
    return {
      chess: new Chess(),
      board: Array(8).fill(null).map(() => Array(8).fill(null)),
      selectedPiece: null,  // Store the selected piece
      columnLabels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      rowLabels: ['1', '2', '3', '4', '5', '6', '7', '8'],
      draggedPiece: null
    };
  },
  computed: {
    displayedBoard() {
      return this.flipped ? this.board.slice().reverse().map(row => row.slice().reverse()) : this.board;
    },
    displayedRowLabels() {
      return this.flipped ? this.rowLabels.slice().reverse() : this.rowLabels;
    },
    displayedColumnLabels() {
      return this.flipped ? this.columnLabels.slice().reverse() : this.columnLabels;
    }
  },
  mounted() {
    this.updateBoard(this.fen);
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
      const rowLabel = this.rowLabels[7 - col];
      const colLabel = this.columnLabels[row];
      return colLabel + rowLabel;
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
    },
    handleSquareClick(rowIndex, colIndex) {
    if (this.selectedPiece) {
      this.movePiece(this.selectedPiece.row, this.selectedPiece.col, rowIndex, colIndex);
      this.selectedPiece = null;  // Deselect after moving
    } else if (this.board[rowIndex][colIndex]) {
      this.selectedPiece = { row: rowIndex, col: colIndex };  // Select the piece
    }
    },
    movePiece(fromRow, fromCol, toRow, toCol) {
    const from = this.getCoordinates(fromRow, fromCol);
    const to = this.getCoordinates(toRow, toCol);
    const move = this.chess.move({ from, to });
    if (move) {
      this.updateBoard(this.chess.fen());
      this.$emit('move', this.chess.fen());
    } else {
      this.selectedPiece = null;  // Deselect if move is invalid
    }
  },
  isSelected(row, col) {
    return this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col;
  },
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

.selected {
  box-shadow: 0 0 10px 3px #ff0; /* Highlight with a yellow glow */
}

</style>













  
  
  
  
  
  
  