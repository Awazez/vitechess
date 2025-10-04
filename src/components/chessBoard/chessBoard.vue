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
                  'last-move': isLastMove(rowIndex, colIndex),
                  'dragging': draggedPiece && draggedPiece.row === rowIndex && draggedPiece.col === colIndex }]"
              @click="handleSquareClick(rowIndex, colIndex)"
              @dragover.prevent
              @drop="handleDrop($event, rowIndex, colIndex)">
            <div v-if="square" 
                class="piece"
                draggable="true"
                @dragstart="handleDragStart($event, rowIndex, colIndex)"
                @dragend="handleDragEnd">
              <chessPiece :piece="square"/>
            </div>
            <div v-else
                class="empty-square"
                @click="handleSquareClick(rowIndex, colIndex)">
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
    fen: { type: String, required: true },
    moves: { type: Array, default: () => [] },
    currentMoveIndex: { type: Number, default: -1 },
    flipped: { type: Boolean, default: false }
  },
  emits: ["move", "fen"],

  data() {
    return {
      chess: new Chess(),
      board: Array(8).fill(null).map(() => Array(8).fill(null)),
      selectedPiece: null,
      possibleMoves: [],
      columnLabels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      rowLabels: ['1', '2', '3', '4', '5', '6', '7', '8'],
      lastMoveStart: null,
      lastMoveEnd: null,
      draggedPiece: null
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
      try {
        this.chess.load(fen);
      } catch (e) {
        console.warn("⚠️ FEN invalide reçue:", fen);
        return;
      }

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
      const rowLabel = this.rowLabels[7 - col];
      const colLabel = this.columnLabels[row];
      return colLabel + rowLabel;
    },
    handleSquareClick(rowIndex, colIndex) {
      const piece = this.board[rowIndex][colIndex];
      const currentTurn = this.chess.turn() === 'w' ? 'w' : 'b';

      if (this.selectedPiece) {
        if (piece && piece[0] === currentTurn) {
          this.selectedPiece = { row: rowIndex, col: colIndex };
          this.possibleMoves = this.getPossibleMoves(rowIndex, colIndex);
        } else {
          this.movePiece(this.selectedPiece.row, this.selectedPiece.col, rowIndex, colIndex);
          this.selectedPiece = null;
          this.possibleMoves = [];
        }
      } else if (piece && piece[0] === currentTurn) {
        this.selectedPiece = { row: rowIndex, col: colIndex };
        this.possibleMoves = this.getPossibleMoves(rowIndex, colIndex);
      }
    },
    movePiece(fromRow, fromCol, toRow, toCol) {
      const from = this.getCoordinates(fromRow, fromCol);
      const to = this.getCoordinates(toRow, toCol);
      const piece = this.board[fromRow][fromCol];
      
      let move = null;
      
      try {
        const isPawn = piece && piece[1] === "P";
        const toRank = to[1];
        const isWhitePromoting = piece[0] === "w" && toRank === "8";
        const isBlackPromoting = piece[0] === "b" && toRank === "1";
        
        if (isPawn && (isWhitePromoting || isBlackPromoting)) {
          move = this.chess.move({ from, to, promotion: "q" });
        } else {
          move = this.chess.move({ from, to });
        }
        
        if (!move) {
          this.selectedPiece = null;
          return;
        }
        
        this.lastMoveStart = { row: fromRow, col: fromCol };
        this.lastMoveEnd = { row: toRow, col: toCol };
        
        if (move.flags.includes("c")) {
          this.playCaptureSound();
        } else {
          this.playMoveSound();
        }
        
        this.updateBoard(this.chess.fen());
        
        this.$emit("move", {
          from: move.from,
          to: move.to,
          san: move.san,
          uci: move.from + move.to + (move.promotion || ""),
          promotion: move.promotion || null
        });
        
        this.$emit("fen", this.chess.fen());
        
      } catch (err) {
        console.error("❌ Erreur movePiece:", err);
        this.selectedPiece = null;
      }
    },

    isSelected(row, col) {
      return this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col;
    },
    getPossibleMoves(row, col) {
      const square = this.getCoordinates(row, col);
      const possibleMoves = this.chess.moves({ square, verbose: true });
      return possibleMoves.map(move => {
        const toRow = move.to.charCodeAt(0) - 'a'.charCodeAt(0);
        const toCol = 8 - parseInt(move.to.charAt(1));
        return { row: toRow, col: toCol };
      });
    },
    isPossibleMove(row, col) {
      return this.possibleMoves.some(move => move.row === row && move.col === col);
    },
    isKingInCheck(rowIndex, colIndex) {
      const kingPosition = this.findKingPosition(this.chess.turn());
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
      return null;
    },
    isLastMove(row, col) {
      return (this.lastMoveStart && this.lastMoveStart.row === row && this.lastMoveStart.col === col) ||
             (this.lastMoveEnd && this.lastMoveEnd.row === row && this.lastMoveEnd.col === col);
    },
    highlightLastMove(move) {
      if (move) {
        const from = move.from;
        const to = move.to;
        const fromRow = from.charCodeAt(0) - 'a'.charCodeAt(0);
        const fromCol = 8 - parseInt(from[1]);
        const toRow = to.charCodeAt(0) - 'a'.charCodeAt(0);
        const toCol = 8 - parseInt(to[1]);
        this.lastMoveStart = { row: fromRow, col: fromCol };
        this.lastMoveEnd = { row: toRow, col: toCol };
      } else {
        this.lastMoveStart = null;
        this.lastMoveEnd = null;
      }
    },
    handleDragStart(event, rowIndex, colIndex) {
      const piece = this.board[rowIndex][colIndex];
      const currentTurn = this.chess.turn() === 'w' ? 'w' : 'b';
      
      if (piece && piece[0] === currentTurn) {
        this.draggedPiece = { row: rowIndex, col: colIndex };
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', `${rowIndex},${colIndex}`);
        this.selectedPiece = { row: rowIndex, col: colIndex };
        this.possibleMoves = this.getPossibleMoves(rowIndex, colIndex);
      } else {
        event.preventDefault();
      }
    },
    handleDragEnd() {
      this.draggedPiece = null;
      this.selectedPiece = null;
      this.possibleMoves = [];
    },
    handleDrop(event, toRow, toCol) {
      event.preventDefault();
      if (!this.draggedPiece) return;

      const fromRow = this.draggedPiece.row;
      const fromCol = this.draggedPiece.col;
      
      this.movePiece(fromRow, fromCol, toRow, toCol);
      this.draggedPiece = null;
      
      const piece = this.board[toRow][toCol];
      if (piece) {
        this.selectedPiece = { row: toRow, col: toCol };
        this.possibleMoves = this.getPossibleMoves(toRow, toCol);
      } else {
        this.selectedPiece = null;
        this.possibleMoves = [];
      }
    },
    
    undoMove() {
      console.log("🔄 undoMove() appelé");
      console.log("📜 Historique:", this.chess.history());
      console.log("📋 FEN actuelle:", this.chess.fen());
      
      if (this.chess.history().length > 0) {
        const undoneMove = this.chess.undo();
        console.log("✅ Coup annulé:", undoneMove);
        this.updateBoard(this.chess.fen());
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.lastMoveStart = null;
        this.lastMoveEnd = null;
        this.$emit("fen", this.chess.fen());
        console.log("📋 Nouvelle FEN après undo:", this.chess.fen());
      } else {
        console.warn("⚠️ Historique vide, impossible d'annuler");
      }
    },
    
    // Méthode pour recharger une FEN spécifique (utilisée par App.vue)
    loadFen(fen) {
      console.log("📥 Chargement forcé de la FEN:", fen);
      this.updateBoard(fen);
      this.selectedPiece = null;
      this.possibleMoves = [];
      this.lastMoveStart = null;
      this.lastMoveEnd = null;
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
  background-color: #f0d9b5;
  background-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4PSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIgogICAgIHZpZXdCb3g9IjAgMCA4IDgiIHNoYXBlLXJlbmRlcmluZz0iY3Jpc3BFZGdlcyI+CjxnIGlkPSJhIj4KICA8ZyBpZD0iYiI+CiAgICA8ZyBpZD0iYyI+CiAgICAgIDxnIGlkPSJkIj4KICAgICAgICA8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBpZD0iZSIgb3BhY2l0eT0iMCIvPgogICAgICAgIDx1c2UgeD0iMSIgeT0iMSIgaHJlZj0iI2UiIHg6aHJlZj0iI2UiLz4KICAgICAgICA8cmVjdCB5PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBpZD0iZiIgb3BhY2l0eT0iMC4yIi8+CiAgICAgICAgPHVzZSB4PSIxIiB5PSItMSIgaHJlZj0iI2YiIHg6aHJlZj0iI2YiLz4KICAgICAgPC9nPgogICAgICA8dXNlIHg9IjIiIGhyZWY9IiNkIiB4OmhyZWY9IiNkIi8+CiAgICA8L2c+CiAgICA8dXNlIHg9IjQiIGhyZWY9IiNjIiB4OmhyZWY9IiNjIi8+CiAgPC9nPgogIDx1c2UgeT0iMiIgaHJlZj0iI2IiIHg6aHJlZj0iI2IiLz4KPC9nPgo8dXNlIHk9IjQiIGhyZWY9IiNhIiB4OmhyZWY9IiNhIi8+Cjwvc3ZnPg==');
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: var(--white-color);
  border-radius: 15px;
  padding-top: 20px;
  padding-right: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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
  font-weight: 600;
  margin-right: 12px;
  margin-top: 23px;
}

.row-label {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chess-board {
  display: grid;
  grid-template-columns: repeat(8, 69px);
  grid-template-rows: repeat(8, 69px);
  border: 3px solid var(--black-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  overflow: hidden;
  animation: board-appear 0.3s ease-out;
}

@keyframes board-appear {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.square {
  width: 69px;
  height: 69px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
  cursor: grab;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.piece:active {
  cursor: grabbing;
}

.empty-square {
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
  font-weight: 600;
}

.selected {
  background-color: var(--selected-color) !important;
  animation: pulse-select 0.3s ease-out;
}

@keyframes pulse-select {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.possible-move {
  position: relative;
}

.possible-move::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.move-point {
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.25);
  border-radius: 50%;
  position: absolute;
  pointer-events: none;
  animation: fade-in 0.2s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.king-check {
  background-color: var(--check-color) !important;
  animation: check-pulse 1s ease-in-out infinite;
  box-shadow: inset 0 0 20px rgba(255, 0, 0, 0.3);
}

@keyframes check-pulse {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(0.85);
  }
}

.last-move {
  background-color: var(--move-color) !important;
  position: relative;
  animation: highlight-move 0.4s ease-out;
}

@keyframes highlight-move {
  0% {
    box-shadow: inset 0 0 0 3px rgba(255, 255, 0, 0.8);
  }
  100% {
    box-shadow: inset 0 0 0 0px rgba(255, 255, 0, 0);
  }
}

.last-move::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 255, 100, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.square.dragging .piece {
  opacity: 0.5;
}

</style>














  
  
  
  
  
  
  
