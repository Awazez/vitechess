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
        <span class="hint-label">💡 {{ isEnglish ? 'Best move:' : 'Meilleur coup :' }}</span>
        <strong class="hint-move">{{ hintMove }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: String,
  type: String,
  hintMove: String,
  isEnglish: Boolean
})
</script>

<style scoped>
.teacher-container {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: var(--bg-primary);
}

.teacher-avatar {
  flex-shrink: 0;
}

.speech-bubble {
  flex: 1;
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  font-size: 14px;
  line-height: 1.5;
}

.speech-bubble.good {
  background: var(--success-color);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.2) 100%);
  border-color: var(--success-color);
}

.speech-bubble.bad {
  background: var(--warning-color);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.2) 100%);
  border-color: var(--warning-color);
}

.lesson-message {
  margin: 0;
  font-weight: 500;
  color: var(--text-primary);
}

.hint-box {
  margin-top: 10px;
  padding: 10px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hint-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.hint-move {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

/* Responsive Design */
@media (max-width: 768px) {
  .teacher-container {
    padding: 15px;
    gap: 12px;
  }
  
  .speech-bubble {
    padding: 12px 14px;
    font-size: 13px;
  }
  
  .lesson-message {
    font-size: 13px;
  }
  
  .hint-box {
    padding: 8px 10px;
  }
  
  .hint-label {
    font-size: 12px;
  }
  
  .hint-move {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .teacher-container {
    padding: 12px;
    gap: 10px;
  }
  
  .speech-bubble {
    padding: 10px 12px;
    font-size: 12px;
  }
  
  .lesson-message {
    font-size: 12px;
  }
  
  .hint-box {
    padding: 6px 8px;
  }
  
  .hint-label {
    font-size: 11px;
  }
  
  .hint-move {
    font-size: 12px;
  }
}
</style>

