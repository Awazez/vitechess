<template>
  <div class="lesson-box">
    <h2>{{ title }}</h2>

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
  isEnglish: Boolean
})

defineEmits(["start-demo", "stop-demo", "get-hint", "reset-position"])
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

.hint-btn, .reset-btn {
  background: #40fbdc;
  color: #000;
  border-color: #40fbdc;
  font-weight: 700;
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


