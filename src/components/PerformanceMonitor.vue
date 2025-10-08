<template>
  <div v-if="showMonitor" class="performance-monitor">
    <div class="monitor-header">
      <h4>🚀 Performance Monitor</h4>
      <button @click="toggleMonitor" class="close-btn">×</button>
    </div>
    
    <div class="monitor-stats">
      <div class="stat-item">
        <span class="stat-label">Cache Size:</span>
        <span class="stat-value">{{ cacheSize }}</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">Pending Requests:</span>
        <span class="stat-value">{{ pendingRequests }}</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">Avg Response Time:</span>
        <span class="stat-value">{{ avgResponseTime }}ms</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">Cache Hit Rate:</span>
        <span class="stat-value">{{ cacheHitRate }}%</span>
      </div>
    </div>
    
    <div class="monitor-actions">
      <button @click="clearCache" class="action-btn">Clear Cache</button>
      <button @click="exportStats" class="action-btn">Export Stats</button>
    </div>
  </div>
  
  <button v-else @click="toggleMonitor" class="monitor-toggle">
    📊
  </button>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  cacheSize: { type: Number, default: 0 },
  pendingRequests: { type: Number, default: 0 },
  responseTimes: { type: Array, default: () => [] },
  cacheHits: { type: Number, default: 0 },
  cacheMisses: { type: Number, default: 0 }
})

const emit = defineEmits(['clear-cache', 'export-stats'])

const showMonitor = ref(false)

const avgResponseTime = computed(() => {
  if (props.responseTimes.length === 0) return 0
  const sum = props.responseTimes.reduce((a, b) => a + b, 0)
  return Math.round(sum / props.responseTimes.length)
})

const cacheHitRate = computed(() => {
  const total = props.cacheHits + props.cacheMisses
  if (total === 0) return 0
  return Math.round((props.cacheHits / total) * 100)
})

function toggleMonitor() {
  showMonitor.value = !showMonitor.value
}

function clearCache() {
  emit('clear-cache')
}

function exportStats() {
  emit('export-stats')
}
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 10px;
  padding: 15px;
  box-shadow: var(--shadow);
  z-index: 1000;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.monitor-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.monitor-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid var(--border-color);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.monitor-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 6px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  color: var(--text-primary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-tertiary);
}

.monitor-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 50%;
  color: var(--text-primary);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: all 0.2s ease;
}

.monitor-toggle:hover {
  background: var(--bg-secondary);
}
</style>
