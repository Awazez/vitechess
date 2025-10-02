<template>
  <div class="teacher-container">
    <div class="teacher-avatar">
      <!-- Avatar -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 5" width="70" height="70">
        <mask id="viewboxMask"><rect width="5" height="5" fill="#fff" /></mask>
        <g mask="url(#viewboxMask)">
          <path d="M0 0h1v1H0V0ZM4 0h1v1H4V0ZM3 0H2v1h1V0Z" fill="#ffb300"/>
          <path d="M2 1H0v1h2V1ZM5 1H3v1h2V1Z" fill="#ffb300"/>
          <path fill="#ffb300" d="M1 2h3v1H1z"/>
          <path fill="#ffb300" d="M0 3h5v1H0z"/>
          <path fill="#ffb300" d="M1 4h3v1H1z"/>
        </g>
      </svg>
    </div>

    <div class="speech-bubble" :class="type">
      <p v-if="message" class="lesson-message">{{ message }}</p>
      <div v-if="hintMove" class="hint-box">
        <span class="hint-label">💡 Meilleur coup :</span>
        <strong class="hint-move">{{ hintMove }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: String,
  type: String,
  hintMove: String
})
</script>

<style scoped>
.teacher-container {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: #fff;
}

.teacher-avatar {
  flex-shrink: 0;
}

.speech-bubble {
  flex: 1;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  line-height: 1.5;
}

.speech-bubble.good {
  background: #e8f5e9;
  border-color: #81c784;
}

.speech-bubble.bad {
  background: #fff3e0;
  border-color: #ffb74d;
}

.lesson-message {
  margin: 0;
  font-weight: 500;
  color: #333;
}

.hint-box {
  margin-top: 10px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hint-label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.hint-move {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  font-family: 'Courier New', monospace;
}
</style>

