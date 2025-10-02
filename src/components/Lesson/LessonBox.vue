<template>
  <div class="lesson-box">
    <h2>{{ title }}</h2>

    <TeacherBubble 
      :message="message" 
      :type="messageType"
      :hintMove="hintMove"
    />

    <div class="button-group">
      <button v-if="!demoRunning" class="demo-btn" @click="$emit('start-demo')">
        🚀 Lancer la démo
      </button>
      <button v-else class="stop-btn" @click="$emit('stop-demo')">
        ⏹️ Arrêter la démo
      </button>
      <button 
        class="hint-btn" 
        @click="$emit('get-hint')" 
        :disabled="hintRequested || demoRunning"
      >
        💡 Indice
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
  hintRequested: Boolean
})

defineEmits(["start-demo", "stop-demo", "get-hint"])
</script>

<style scoped>
.lesson-box {
  width: 605px;
  background: #ffffff;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 3px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.lesson-box h2 {
  margin: 0;
  padding: 18px 20px;
  background: #f7f7f7;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #e6e6e6;
}

.button-group {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 14px 16px;
  background: #f7f7f7;
  border-top: 2px solid #e6e6e6;
}

.demo-btn, .hint-btn, .stop-btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.15s;
}

.demo-btn {
  background: #f0f0f0;
  color: #333;
}

.stop-btn {
  background: #ffebee;
  color: #c62828;
  border-color: #ef9a9a;
}

.hint-btn {
  background: #f0f0f0;
  color: #333;
}
</style>


