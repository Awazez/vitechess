<template>
  <button @click="flipBoard" class="flip-button" :title="flipped ? 'Voir du côté blanc' : 'Voir du côté noir'">
    <img :src="img" class="flip-icon">
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import img from '../assets/change_icon.svg'

const props = defineProps({
  flipped: { type: Boolean, default: false }
})

const emit = defineEmits(['flip'])

function flipBoard() {
  emit('flip')
}
</script>
  
<style scoped>
.flip-button {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flip-button:hover {
  transform: scale(1.1);
  border-color: var(--accent-color);
  box-shadow: 0 4px 12px rgba(64, 251, 220, 0.3);
}

.flip-icon {
  width: 24px;
  height: 24px;
  filter: invert(1);
}
</style>