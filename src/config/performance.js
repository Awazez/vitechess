// Configuration des performances pour l'API Stockfish
export const PERFORMANCE_CONFIG = {
  // Timeouts
  API_TIMEOUT: 3000, // 3 secondes
  CACHE_TIMEOUT: 300000, // 5 minutes
  
  // Profondeurs d'analyse
  HINT_DEPTH: 8, // Profondeur pour les indices
  ANALYSIS_DEPTH: 12, // Profondeur pour les évaluations
  PRELOAD_DEPTH: 6, // Profondeur pour le préchargement
  
  // Cache
  MAX_CACHE_SIZE: 50, // Nombre maximum d'entrées en cache
  CACHE_CLEANUP_INTERVAL: 60000, // Nettoyage du cache toutes les minutes
  
  // Préchargement
  PRELOAD_DELAY: 1000, // Délai avant préchargement (ms)
  PRELOAD_POSITIONS: [
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", // Position de départ
    "8/8/8/4k3/8/8/8/4K1Q1 w - - 0 1", // Mat élémentaire
    "8/8/8/8/8/8/8/4K3 w - - 0 1" // Roi seul
  ],
  
  // URLs API
  API_URLS: {
    PRODUCTION: "https://api.vitechess.com/analyze",
    DEVELOPMENT: "http://127.0.0.1:8082/analyze"
  }
}

// Fonction pour obtenir l'URL de l'API selon l'environnement
export function getApiUrl() {
  const envUrl = import.meta.env?.VITE_STOCKFISH_API_URL
  if (envUrl && String(envUrl).trim()) {
    return String(envUrl).trim()
  }
  
  // Détecter l'environnement
  if (import.meta.env.DEV) {
    return PERFORMANCE_CONFIG.API_URLS.DEVELOPMENT
  }
  
  return PERFORMANCE_CONFIG.API_URLS.PRODUCTION
}

// Fonction pour nettoyer le cache
export function cleanupCache(cache, maxSize = PERFORMANCE_CONFIG.MAX_CACHE_SIZE) {
  if (cache.size > maxSize) {
    const entries = Array.from(cache.entries())
    const toDelete = entries.slice(0, cache.size - maxSize)
    toDelete.forEach(([key]) => cache.delete(key))
    console.log(`🧹 Cache nettoyé: ${toDelete.length} entrées supprimées`)
  }
}
