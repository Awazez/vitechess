<template>
  <div class="container">
    <div class="container-top">
      <div class="engine-toggle">
        {{ engineOn ? 'Engine is on' : 'Engine is off' }}
        <label class="switch">
          <input type="checkbox" v-model="engineOn">
          <span class="slider round"></span>
        </label>
      </div>
    </div>
    <div class="notation-panel">
      <div class="notation-header">
      </div>
  
      <div class="notation-content-wrapper">
        <table class="notation-content">
          <tbody>
            <tr v-for="(pair, index) in formattedMoves" :key="index">
              <td class="td-number">{{ index + 1 }}</td>
              <td 
                class="td-moves" 
                :class="{ 'highlight': isSelectedMove(index * 2) }" 
                @click="selectMove(index * 2)">
                {{ pair.white }} <span v-if="pair.whiteEval">({{ pair.whiteEval }})</span>
              </td>
              <td 
                class="td-moves" 
                :class="{ 'highlight': isSelectedMove(index * 2 + 1) }" 
                @click="selectMove(index * 2 + 1)">
                {{ pair.black }} <span v-if="pair.blackEval">({{ pair.blackEval }})</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="navigation">
        <button @click="prevMove">&laquo;</button>
        <button @click="nextMove">&raquo;</button>
      </div>
    </div>
  </div>
</template>

<script>
import { Chess } from 'chess.js';

export default {
  props: {
    initialFen: {
      type: String,
      default: 'start' // Use 'start' for the initial position
    },
    moves: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      engineOn: true,
      currentMoveIndex: 0,
      evaluations: {} // Store evaluations keyed by move index
    };
  },
  computed: {
    formattedMoves() {
      const pairs = [];
      for (let i = 0; i < this.moves.length; i += 2) {
        const whiteMove = this.moves[i] || '';
        const blackMove = this.moves[i + 1] || '';
        const whiteEval = this.evaluations[i];
        const blackEval = this.evaluations[i + 1];
        pairs.push({ white: whiteMove, whiteEval, black: blackMove, blackEval });
      }
      return pairs;
    }
  },
  watch: {
    engineOn(newVal) {
      if (newVal) {
        this.evaluateAllMoves();
      } else {
        this.evaluations = {};
      }
    },
    moves: {
      handler() {
        if (this.engineOn) {
          this.evaluateAllMoves();
        }
      },
      deep: true
    }
  },
  methods: {
    async evaluateAllMoves() {
      const chess = new Chess(this.initialFen);
      for (let i = 0; i < this.moves.length; i++) {
        const move = this.moves[i];
        if (!chess.move(move)) {
          console.error(`Invalid move: ${move}`);
          continue;
        }

        const fen = chess.fen();
        // Fetch evaluation for this position
        await this.getEval(i, fen);
      }
    },
    async getEval(index, fen) {
      try {
        const response = await fetch(`http://localhost:3000/evaluate?fen=${encodeURIComponent(fen)}`);
        const data = await response.json();
        if (data && data.length > 0) {
          // Assuming the API returns an array of evaluations
          const score = data[0].score;
          // Update evaluations
          this.$set(this.evaluations, index, score);
        }
      } catch (error) {
        console.error('Error fetching evaluation:', error);
      }
    },
    prevMove() {
      if (this.currentMoveIndex > 0) {
        this.currentMoveIndex -= 1;
        this.$emit('move-selected', this.currentMoveIndex);
      }
    },
    nextMove() {
      if (this.currentMoveIndex < this.moves.length - 1) {
        this.currentMoveIndex += 1;
        this.$emit('move-selected', this.currentMoveIndex);
      }
    },
    selectMove(index) {
      this.currentMoveIndex = index;
      this.$emit('move-selected', index);
    },
    isSelectedMove(index) {
      return this.currentMoveIndex === index;
    },
  },
  mounted() {
    if (this.engineOn) {
      this.evaluateAllMoves();
    }
  }
};
</script>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap');

.container {
  display: flex;
  flex-direction: column;
  width: 400px;
  height: 620px;
  background: white;
  border-radius: 15px;
  margin-bottom: 145px;
  color: #333;
  font-size: 14px;
  font-family: "Montserrat", sans-serif;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.container-top {
  display: flex;
  align-content: center;
  justify-content: space-around;
  width: 400px;
  height: 50px;
  background: #f0f0f0;
  border-top-right-radius: 15px;
  border-top-left-radius: 15px;
  margin-bottom: 70px;
  font-family: "Montserrat", sans-serif;
}

.analysis-header {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #dadada;
}

.notation-panel {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.notation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.notation-title {
  font-size: 18px;
  font-weight: bold;
}

.engine-toggle {
  display: flex;
  align-items: center;
  color: #333;
}

.switch {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
  margin-left: 10px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:checked + .slider:before {
  transform: translateX(14px);
}

.slider.round {
  border-radius: 20px;
}

.slider.round:before {
  border-radius: 50%;
}

.notation-content-wrapper {
  flex-grow: 1;
  overflow-y: auto;
  width: 400px;
  font-size: 14px;
  color: grey;
  max-height: 300px; /* Adjust as needed */
}

.notation-content {
  border-collapse: collapse; /* Collapse borders */
  width: 100%; /* Ensure table width */
}

.td-number {
  width: 40px;
  height: 5px; /* Set your desired height here */
  font-size: 14px;
  font-weight: 500;
  border-right: 1px solid #dadada;
  background: rgba(247,246,245,255);
  font-family: "Montserrat", sans-serif;
}

.td-moves {
  width: 100px;
  height: 5px; /* Set your desired height here */
  font-size: 14px;
  font-weight: 500;
  font-family: "Montserrat", sans-serif;
}

.notation-content th,
.notation-content td {
  text-align: center; /* Center text in cells */
  padding: 10px; /* Add padding for better appearance */
}

.td-moves:hover {
  font-weight: bold;
  color: white; /* Change text color to white for better visibility */
  background-color: #1b79cf; /* Grey background for emphasis */
}

.highlight {
  color: black;
  background-color: #c8def4; /* Highlight color on click */
}

.notation-content th {
  background-color: #f7f7f7;
  color: #333;
}

.notation-content tr {
  height: 40px; /* Set a fixed height for rows */
}

.notation-content tr:nth-child(even) {
  background-color: white;
}

.navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

button {
  background-color: #f7f7f7;
  border: 1px solid #e0e0e0;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  color: #333;
}

button:hover {
  background-color: #e0e0e0;
}
</style>



