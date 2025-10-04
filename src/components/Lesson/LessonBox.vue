<template>
  <div class="lesson-box">
    <h2 class="lesson-title">
      {{ title }}
      <!-- Indicateur de trait et bouton flip à droite du titre -->
      <div class="title-controls">
        <div class="turn-indicator" :class="{ 'white-turn': isWhiteTurn, 'black-turn': !isWhiteTurn }"></div>
        <button 
          class="flip-btn-small" 
          @click="$emit('flip-board')"
          :title="isEnglish ? 'Flip board' : 'Retourner l\'échiquier'"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/>
            <path d="M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/>
            <path d="M8 12h8"/>
            <path d="M12 8l4 4-4 4"/>
          </svg>
        </button>
      </div>
    </h2>

    <TeacherBubble 
      :message="message" 
      :type="messageType"
      :hintMove="hintMove"
      :isEnglish="isEnglish"
    />

    <div class="button-group">
      <button v-if="!demoRunning" class="demo-btn" @click="$emit('start-demo')">
        🚀 {{ isEnglish ? 'Start demo' : 'Lancer la démo' }}
      </button>
      <button v-else class="stop-btn" @click="$emit('stop-demo')">
        ⏹️ {{ isEnglish ? 'Stop demo' : 'Arrêter la démo' }}
      </button>
      
      <button 
        class="hint-btn" 
        @click="$emit('get-hint')" 
        :disabled="hintRequested || demoRunning"
      >
        💡 {{ isEnglish ? 'Hint' : 'Indice' }}
      </button>
      <button 
        class="reset-btn" 
        @click="$emit('reset-position')"
      >
        🔄 {{ isEnglish ? 'Reset' : 'Reset' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import TeacherBubble from "./TeacherBubble.vue"

defineProps({
  title: String,
  message: String,
  messageType: String,
  hintMove: String,
  demoRunning: Boolean,
  hintRequested: Boolean,
  isEnglish: Boolean,
  isWhiteTurn: Boolean,
  flipped: Boolean
})

defineEmits(["start-demo", "stop-demo", "get-hint", "reset-position", "flip-board"])
</script>

<style scoped>
.lesson-box {
  width: 605px;
  background: var(--bg-primary);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 3px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.lesson-box h2 {
  margin: 0;
  padding: 18px 20px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid var(--border-color);
}

.button-group {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 14px 16px;
  background: var(--bg-secondary);
  border-top: 2px solid var(--border-color);
}

.demo-btn, .hint-btn, .stop-btn, .reset-btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.15s;
}

.demo-btn:hover, .hint-btn:hover, .reset-btn:hover {
  background: #2dd4bf;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 251, 220, 0.3);
}

.demo-btn {
  background: #40fbdc;
  color: #000;
  border-color: #40fbdc;
  font-weight: 700;
}

.stop-btn {
  background: #ffebee;
  color: #c62828;
  border-color: #ef9a9a;
}

.hint-btn, .reset-btn, .flip-btn {
  background: #40fbdc;
  color: #000;
  border-color: #40fbdc;
  font-weight: 700;
}

.lesson-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.title-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.turn-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.flip-btn-small {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #40fbdc;
  background: #40fbdc;
  color: #000;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.flip-btn-small:hover {
  background: #2dd4bf;
  border-color: #2dd4bf;
}

.white-turn {
  background: #fff;
  border: 2px solid #333;
}

.black-turn {
  background: #333;
  border: 2px solid #fff;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .lesson-box {
    width: 100%;
    max-width: 605px;
  }
}

@media (max-width: 768px) {
  .lesson-box {
    width: 100%;
  }
  
  .lesson-box h2 {
    font-size: 15px;
    padding: 15px 18px;
  }
  
  .button-group {
    padding: 12px 14px;
  }
  
  .demo-btn, .hint-btn, .stop-btn {
    padding: 8px 16px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .lesson-box h2 {
    font-size: 14px;
    padding: 12px 15px;
  }
  
  .button-group {
    padding: 10px 12px;
    gap: 6px;
  }
  
  .demo-btn, .hint-btn, .stop-btn {
    padding: 6px 12px;
    font-size: 11px;
  }
}
</style>


