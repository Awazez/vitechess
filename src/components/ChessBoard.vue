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
            <div v-for="(square, colIndex) in row" :key="colIndex" class="square" :class="getSquareColor(rowIndex, colIndex)">
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
  
  <script lang="ts">
  export default {
    name: 'ChessBoard',
    data() {
      return {
        board: Array(8).fill(null).map(() => Array(8).fill(null)),
        columnLabels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        rowLabels: ['8', '7', '6', '5', '4', '3', '2', '1'],
      };
    },
    methods: {
      getSquareColor(row, col) {
        return (row + col) % 2 === 0 ? 'white' : 'black';
      },
    },
  };
  </script>
  
  <style scoped>
  .chess-board-container {
    width: 605px;
    height: 605px; /* Adjusted height to accommodate column labels */
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column; /* Arrange items in a column */
    background: var(--white-color);
    border-radius: 15px;
    padding-top: 10px;
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
    font-size: 16px;
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
  }
  
  .white {
    background-color: var(--white-color);
  }
  
  .black {
    background-color: var(--black-color);
  }
  
  .column-labels {
    display: grid;
    grid-template-columns: repeat(8, 69px); /* Ensure columns match the board's columns */
    justify-content: center; /* Center the column labels horizontally */
    align-items: center; /* Center the column labels vertically */
  }
  
  .column-label {
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    color: var(--black-color);
    font-family: Arial, Helvetica, sans-serif;
    font-size: 16px;
    margin: -5px;
  }
  </style>
  
  
  
  
  
  
  