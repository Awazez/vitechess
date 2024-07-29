<template>
  <div class="container">
    <div class="container-top">

    </div>
    <div class="analysis-header">
      Analysis
    </div>
    <div class="notation-panel">
      <div class="notation-header">
        <div class="notation-title">
          Notation
        </div>
        <div class="engine-toggle">
          Engine is on
          <label class="switch">
            <input type="checkbox" v-model="engineOn">
            <span class="slider round"></span>
          </label>
        </div>
      </div>
      <div class="evaluation">
        <div class="eval-score">{{ evaluationScore }}</div>
      </div>
      <div class="notation-content-wrapper">
        <table class="notation-content">
          <tbody>
            <tr v-for="(pair, index) in formattedMoves" :key="index">
              <td>{{ index + 1 }}</td>
              <td :class="{ highlight: currentMoveIndex === index * 2 }">{{ pair.white }}</td>
              <td :class="{ highlight: currentMoveIndex === index * 2 + 1 }">{{ pair.black }}</td>
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
export default {
  props: {
    moves: {
      type: Array,
      required: true
    },
    evaluationScore: {
      type: String,
      default: '+0.1'
    }
  },
  data() {
    return {
      engineOn: true,
      currentMoveIndex: 0
    };
  },
  computed: {
    formattedMoves() {
      const pairs = [];
      for (let i = 0; i < this.moves.length; i += 2) {
        const whiteMove = this.moves[i] || '';
        const blackMove = this.moves[i + 1] || '';
        const whiteEval = this.getEval(i);
        const blackEval = this.getEval(i + 1);
        pairs.push({ white: whiteMove, whiteEval, black: blackMove, blackEval });
      }
      return pairs;
    }
  },
  methods: {
    getEval(index) {
      // Placeholder for actual evaluation logic
      return '+0.1';
    },
    prevMove() {
      if (this.currentMoveIndex > 0) {
        this.currentMoveIndex -= 1;
      }
    },
    nextMove() {
      if (this.currentMoveIndex < this.moves.length - 1) {
        this.currentMoveIndex += 1;
      }
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
  font-family: "Montserrat", sans-serif;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.container-top {
  display: flex;
  flex-direction: column;
  width: 400px;
  height: 50px;
  background: #f0f0f0;
  border-top-right-radius:15px;
  border-top-left-radius:15px;
  margin-bottom: 145px;
  font-family: "Montserrat", sans-serif;
}

.analysis-header {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

.notation-panel {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 10px;
}

.notation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
  margin-bottom: 10px;
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

.evaluation {
  text-align: center;
  margin: 10px 0;
}

.eval-score {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.notation-content-wrapper {
  flex-grow: 1;
  overflow-y: auto;
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-top: 10px;
  color: #333;
  table-layout: fixed; /* Ensure consistent column widths */
  max-height: 300px; /* Adjust as needed */
}

.notation-content th, 
.notation-content td {
  padding: 10px;
  border: 1px solid #e0e0e0;
  text-align: center; /* Center text in cells */
}

.notation-content th {
  background-color: #f7f7f7;
  color: #333;
}

.notation-content tr {
  height: 40px; /* Set a fixed height for rows */
}

.notation-content tr:nth-child(even) {
  background-color: #f9f9f9;
}

.notation-content tr:hover {
  background-color: #f1f1f1;
}

.notation-content .highlight {
  font-weight: bold;
  color: #d9534f; /* Red text for emphasis */
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

