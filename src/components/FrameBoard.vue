<template>
  <div class="frame-container">
    <div class="header-section">
      <div class="title">Moves</div>
      <label class="engine-toggle">
        <input type="checkbox" v-model="engineOn">
        <span class="toggle-slider"></span>
        <span class="toggle-label">Engine</span>
      </label>
    </div>

    <div class="moves-section">
      <div class="moves-list" ref="movesList">
        <div v-if="moves.length === 0" class="empty-state">
          No moves yet
        </div>
        <div v-for="(pair, index) in formattedMoves" :key="index" class="move-pair">
          <div class="move-number">{{ index + 1 }}</div>
          <div 
            class="move-item" 
            :class="{ 'active': isSelectedMove(index * 2) }" 
            @click="selectMove(index * 2)">
            {{ pair.white }}
          </div>
          <div 
            v-if="pair.black"
            class="move-item" 
            :class="{ 'active': isSelectedMove(index * 2 + 1) }" 
            @click="selectMove(index * 2 + 1)">
            {{ pair.black }}
          </div>
        </div>
      </div>
    </div>

    <div class="footer-section">
      <button 
        @click="firstMove" 
        :disabled="currentMoveIndex < 0"
        class="nav-btn">
        ⟲
      </button>
      <button 
        @click="prevMove" 
        :disabled="currentMoveIndex < 0"
        class="nav-btn">
        ‹
      </button>
      <button 
        @click="nextMove" 
        :disabled="currentMoveIndex >= moves.length - 1"
        class="nav-btn">
        ›
      </button>
    
      <button @click="flipBoard" class="flip-btn">
        ⇅
      </button>
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
    currentMoveIndex: {
      type: Number,
      default: -1
    }
  },
  emits: ['move-selected', 'flip', 'reset-board'],
  data() {
    return {
      engineOn: false,
      localMoveIndex: this.currentMoveIndex
    };
  },
  computed: {
    formattedMoves() {
      const pairs = [];
      for (let i = 0; i < this.moves.length; i += 2) {
        const whiteMove = this.translateMove(this.moves[i] || '');
        const blackMove = this.translateMove(this.moves[i + 1] || '');
        pairs.push({ white: whiteMove, black: blackMove });
      }
      return pairs;
    }
  },
  watch: {
    currentMoveIndex(newVal) {
      this.localMoveIndex = newVal;
      this.$nextTick(() => {
        this.scrollToActiveMove();
      });
    },
    moves() {
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    }
  },
  methods: {
    translateMove(move) {
      if (!move) return '';

      const map = {
        K: 'R', // Roi
        Q: 'D', // Dame
        R: 'T', // Tour
        B: 'F', // Fou
        N: 'C'  // Cavalier
      };

      return move
        .split('')
        .map(ch => map[ch] || ch) // traduit uniquement si dans le mapping
        .join('');
    },
    prevMove() {
      if (this.localMoveIndex >= 0) {
        this.localMoveIndex -= 1;
        this.$emit('move-selected', this.localMoveIndex);
      }
    },
    nextMove() {
      if (this.localMoveIndex < this.moves.length - 1) {
        this.localMoveIndex += 1;
        this.$emit('move-selected', this.localMoveIndex);
      }
    },
    firstMove() {
      this.localMoveIndex = -1;
      this.$emit('move-selected', this.localMoveIndex);

      // ⚡️ reset complet de l’échiquier
      this.$emit('reset-board');
    },
    lastMove() {
      this.localMoveIndex = this.moves.length - 1;
      this.$emit('move-selected', this.localMoveIndex);
    },
    selectMove(index) {
      if (index < this.moves.length) {
        this.localMoveIndex = index;
        this.$emit('move-selected', index);
      }
    },
    isSelectedMove(index) {
      return this.localMoveIndex === index;
    },
    flipBoard() {
      this.$emit('flip');
    },
    scrollToActiveMove() {
      const activeElement = this.$el.querySelector('.move-item.active');
      if (activeElement && this.$refs.movesList) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    scrollToBottom() {
      if (this.$refs.movesList) {
        this.$refs.movesList.scrollTop = this.$refs.movesList.scrollHeight;
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

.frame-container {
  display: flex;
  flex-direction: column;
  width: 380px;
  height: 605px;
  background: #ffffff;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  font-family: 'Inter', sans-serif;
  border: 3px solid #e0e0e0;
}

.header-section {
  background: #f7f7f7;
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #e6e6e6;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.5px;
}

.engine-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.engine-toggle input {
  display: none;
}

.toggle-slider {
  width: 38px;
  height: 20px;
  background: #ddd;
  border-radius: 20px;
  position: relative;
  transition: background 0.2s;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #bbb;
  border-radius: 50%;
  transition: all 0.2s;
}

.engine-toggle input:checked + .toggle-slider {
  background: #c4c4c4;
}

.engine-toggle input:checked + .toggle-slider::after {
  transform: translateX(18px);
  background: #888;
}

.toggle-label {
  color: #666;
  font-size: 13px;
  font-weight: 500;
}

.moves-section {
  flex: 1;
  overflow: hidden;
  background: #fff;
}

.moves-list {
  height: 100%;
  overflow-y: auto;
  padding: 12px 16px;
}

.moves-list::-webkit-scrollbar {
  width: 8px;
}

.moves-list::-webkit-scrollbar-track {
  background: #f0f0f0;
}

.moves-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.moves-list::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}

.move-pair {
  display: grid;
  grid-template-columns: 35px 1fr 1fr;
  gap: 8px;
  margin-bottom: 6px;
  align-items: center;
}

.move-number {
  color: #aaa;
  font-weight: 600;
  font-size: 13px;
  text-align: right;
}

.move-item {
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  text-align: center;
  border: 1px solid transparent;
}

.move-item:hover {
  background: #eaeaea;
  border-color: #dcdcdc;
}

.move-item.active {
  background: #d0e7ff;
  color: #003366;
  border-color: #80bfff;
}

.footer-section {
  background: #f7f7f7;
  padding: 14px 16px;
  border-top: 2px solid #e6e6e6;
  display: flex;
  gap: 8px;
}

.nav-btn {
  flex: 1;
  background: #f0f0f0;
  border: 1px solid #ddd;
  color: #333;
  font-size: 20px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  font-weight: 600;
}

.nav-btn:hover:not(:disabled) {
  background: #e6e6e6;
  border-color: #ccc;
  color: #000;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.flip-btn {
  background: #f0f0f0;
  border: 1px solid #ddd;
  color: #333;
  font-size: 18px;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  font-weight: 600;
}

.flip-btn:hover {
  background: #e6e6e6;
  border-color: #ccc;
  color: #000;
}
</style>





