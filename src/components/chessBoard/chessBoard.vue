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
              :class="[getSquareColor(rowIndex, colIndex), 
                { 'selected': isSelected(rowIndex, colIndex), 
                  'possible-move': isPossibleMove(rowIndex, colIndex), 
                  'king-check': isKingInCheck(rowIndex, colIndex),
                  'last-move': isLastMove(rowIndex, colIndex) }]" 
              @click="handleSquareClick(rowIndex, colIndex)">
            <div v-if="square" class="piece">
              <chessPiece :piece="square"/>
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
  <audio ref="moveSound" src="/move-self.mp3"></audio>
  <audio ref="captureSound" src="/capture.mp3"></audio>
</template>

<script>
import { defineComponent, watch } from 'vue';
import chessPiece from './chessPiece.vue';
import { Chess } from 'chess.js';

export default defineComponent({
  name: 'ChessBoard',
  components: {
    chessPiece
  },
  props: {
    fen: String,
    moves: Array,
    currentMoveIndex: Number
  },
  data() {
    return {
      chess: new Chess(),
      board: Array(8).fill(null).map(() => Array(8).fill(null)),
      selectedPiece: null,
      possibleMoves: [],
      columnLabels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      rowLabels: ['1', '2', '3', '4', '5', '6', '7', '8'],
      lastMoveStart: null,
      lastMoveEnd: null 
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
    playMoveSound() {
      const moveSound = this.$refs.moveSound;
      if (moveSound) {
        moveSound.play();
      }
    },
    playCaptureSound() {
      const captureSound = this.$refs.captureSound;
      if (captureSound) {
        captureSound.play();
      }
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
  const piece = this.board[rowIndex][colIndex];
  const currentTurn = this.chess.turn() === 'w' ? 'w' : 'b';

  if (this.selectedPiece) {
    if (piece && piece[0] === currentTurn) {
      // If clicking on another piece of the current player, update the selected piece
      this.selectedPiece = { row: rowIndex, col: colIndex };
      this.possibleMoves = this.getPossibleMoves(rowIndex, colIndex);
    } else {
      // Otherwise, try to move the selected piece
      this.movePiece(this.selectedPiece.row, this.selectedPiece.col, rowIndex, colIndex);
      this.selectedPiece = null;
      this.possibleMoves = [];
    }
  } else if (piece && piece[0] === currentTurn) {
    // If no piece is selected and the clicked piece belongs to the current player, select it
    this.selectedPiece = { row: rowIndex, col: colIndex };
    this.possibleMoves = this.getPossibleMoves(rowIndex, colIndex);
  }
},
    movePiece(fromRow, fromCol, toRow, toCol) {
      const from = this.getCoordinates(fromRow, fromCol);
      const to = this.getCoordinates(toRow, toCol);
      const move = this.chess.move({ from, to });
      if (move) {
        this.lastMoveStart = { row: fromRow, col: fromCol }; 		
        this.lastMoveEnd = { row: toRow, col: toCol };
        if (move.flags.includes('c')) {
          this.playCaptureSound(); // Play capture sound
        } else {
          this.playMoveSound(); // Play move sound
        }
        this.updateBoard(this.chess.fen());
        this.$emit('move', move.san); // Emit the move event here
        this.$emit('fen', this.chess.fen());
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
    },
    isKingInCheck(rowIndex, colIndex) {
    // First, find the current position of the king for the player who's turn it is
    const kingPosition = this.findKingPosition(this.chess.turn());
    // Check if the current square has the king and then check if it's in check
    if (kingPosition && kingPosition.row === rowIndex && kingPosition.col === colIndex) {
      return this.chess.inCheck();
    }
    return false;
  }, 
  findKingPosition(color) {
    const board = this.chess.board();
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        const piece = board[j][i];
        if (piece && piece.type === 'k' && piece.color === color) {
          return { row: i, col: j };
        }
      }
    }
    return null; // If no king found, return null
  },
  isLastMove(row, col) {
  return (this.lastMoveStart && this.lastMoveStart.row === row && this.lastMoveStart.col === col) ||
         (this.lastMoveEnd && this.lastMoveEnd.row === row && this.lastMoveEnd.col === col);
},
highlightLastMove(move) {
    if (move) {
      const from = move.from;
      const to = move.to;

      // Convert 'a'-'h' to 0-7 for columns and '1'-'8' to 0-7 for rows
      const  fromRow = from.charCodeAt(0) - 'a'.charCodeAt(0);
      const  fromCol = 8 - parseInt(from[1]); // Chessboard rows are usually reversed

      const toRow = to.charCodeAt(0) - 'a'.charCodeAt(0);
      const toCol = 8 - parseInt(to[1]);

      this.lastMoveStart = { row: fromRow, col: fromCol };
      this.lastMoveEnd = { row: toRow, col: toCol };
    } else {
      this.lastMoveStart = null;
      this.lastMoveEnd = null;
    }
  }
  },
  watch: {
  fen(newFen) {
    this.updateBoard(newFen); // Met à jour le tableau lorsque le FEN change
  }
}
});
</script>

<style scoped>

.chess-board-container {
  width: 605px;
  height: 605px;
  background-color: #f0d9b5;
  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4PSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIgogICAgIHZpZXdCb3g9IjAgMCA4IDgiIHNoYXBlLXJlbmRlcmluZz0iY3Jpc3BFZGdlcyI+CjxnIGlkPSJhIj4KICA8ZyBpZD0iYiI+CiAgICA8ZyBpZD0iYyI+CiAgICAgIDxnIGlkPSJkIj4KICAgICAgICA8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBpZD0iZSIgb3BhY2l0eT0iMCIvPgogICAgICAgIDx1c2UgeD0iMSIgeT0iMSIgaHJlZj0iI2UiIHg6aHJlZj0iI2UiLz4KICAgICAgICA8cmVjdCB5PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBpZD0iZiIgb3BhY2l0eT0iMC4yIi8+CiAgICAgICAgPHVzZSB4PSIxIiB5PSItMSIgaHJlZj0iI2YiIHg6aHJlZj0iI2YiLz4KICAgICAgPC9nPgogICAgICA8dXNlIHg9IjIiIGhyZWY9IiNkIiB4OmhyZWY9IiNkIi8+CiAgICA8L2c+CiAgICA8dXNlIHg9IjQiIGhyZWY9IiNjIiB4OmhyZWY9IiNjIi8+CiAgPC9nPgogIDx1c2UgeT0iMiIgaHJlZj0iI2IiIHg6aHJlZj0iI2IiLz4KPC9nPgo8dXNlIHk9IjQiIGhyZWY9IiNhIiB4OmhyZWY9IiNhIi8+Cjwvc3ZnPg==');
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: var(--white-color);
  border-radius: 15px;
  padding-top: 20px;  /* Ajuster le padding pour centrer les labels des colonnes */
  padding-right: 20px;
  
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
  margin-right: 12px;
  margin-top: 23px;
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
  background-color:var(--selected-color) !important;
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
  background-color: var(--check-color); /* Adjust the color to fit your design */
}

.last-move {
  background-color: var(--move-color);
}

</style>















  
  
  
  
  
  
  