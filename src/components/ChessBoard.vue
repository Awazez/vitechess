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
          <div v-for="(square, colIndex) in row" :key="colIndex" 
               class="square" 
               :class="[getSquareColor(rowIndex, colIndex), { selected: isSelected(rowIndex, colIndex), 'possible-move': isPossibleMove(rowIndex, colIndex) }]"
               @click="handleSquareClick(rowIndex, colIndex)">
            <div v-if="square" class="piece">
              <ChessPiece :piece="square"/>
            </div>
            <div v-if="isPossibleMove(rowIndex, colIndex)" class="move-point"></div>
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
    fen: String
  },
  data() {
    return {
      chess: new Chess(),
      board: Array(8).fill(null).map(() => Array(8).fill(null)),
      selectedPiece: null,
      possibleMoves: [],
      columnLabels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      rowLabels: ['1', '2', '3', '4', '5', '6', '7', '8']
    };
  },
  computed: {
    displayedBoard() {
      return this.board;
    },
    displayedRowLabels() {
      return this.rowLabels.slice().reverse();
    },
    displayedColumnLabels() {
      return this.columnLabels;
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
      // Correctly compute the coordinates based on the row and column labels
      const rowLabel = this.rowLabels[7 - col]; // Adjust if your row labels are reversed
      const colLabel = this.columnLabels[row];
      return colLabel + rowLabel;
  },

    handleSquareClick(rowIndex, colIndex) {
      if (this.selectedPiece) {
        this.movePiece(this.selectedPiece.row, this.selectedPiece.col, rowIndex, colIndex);
        this.selectedPiece = null;
        this.possibleMoves = [];
      } else if (this.board[rowIndex][colIndex]) {
        this.selectedPiece = { row: rowIndex, col: colIndex };
        this.possibleMoves = this.getPossibleMoves(rowIndex, colIndex);
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
        this.selectedPiece = null;
      }
    },
    isSelected(row, col) {
      return this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col;
    },
    getPossibleMoves(row, col) {
  const square = this.getCoordinates(row, col);
  console.log(`Getting moves for square: ${square}`);

  const possibleMoves = this.chess.moves({ square, verbose: true });

  return possibleMoves.map(move => {
    // Convert 'a'-'h' to 0-7
    const toRow = move.to.charCodeAt(0) - 'a'.charCodeAt(0);
    // Convert '1'-'8' to 0-7 by reversing the rank
    const toCol = 8 - parseInt(move.to.charAt(1)); // Correctly map the row
    console.log(`Mapping move ${move.to} to indices row: ${toRow}, col: ${toCol}`);
    return { row: toRow, col: toCol };
  });
},
    isPossibleMove(row, col) {
      return this.possibleMoves.some(move => move.row === row && move.col === col);
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

.selected {
  background-color: yellow !important;
}

.possible-move {
  position: relative;
}

.move-point {
  width: 15px;
  height: 15px;
  background-color: yellow;
  border-radius: 50%;
  position: absolute;
}

</style>















  
  
  
  
  
  
  