import { ref } from 'vue'

export function useStockfishApi() {
  const evaluationCache = ref(new Map())
  const pendingRequests = ref(new Map())
  
  // Configuration de performance optimisée (Lichess-like)
  const PERFORMANCE_CONFIG = {
    API_TIMEOUT: 2000, // Timeout réduit
    HINT_DEPTH: 12,    // Profondeur augmentée pour les indices
    ENGINE_DEPTH: 8,   // Profondeur pour les coups de l'ordinateur
    PRELOAD_DEPTH: 6,  // Profondeur pour le préchargement
    PRELOAD_DELAY: 500, // Délai réduit
    CACHE_CLEANUP_INTERVAL: 30000, // Nettoyage plus fréquent
    PRELOAD_POSITIONS: [
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "8/8/8/4k3/8/8/8/4K1Q1 w - - 0 1",
      "8/8/8/8/8/8/8/4K3 w - - 0 1"
    ]
  }
  
  function getApiUrl() {
    const envUrl = import.meta.env?.VITE_STOCKFISH_API_URL
    if (envUrl && String(envUrl).trim()) {
      return String(envUrl).trim()
    }
    return import.meta.env.DEV ? "/api/analyze" : "https://api.vitechess.com/analyze"
  }
  
  function getFallbackApiUrl() {
    return "https://cors-anywhere.herokuapp.com/https://api.vitechess.com/analyze"
  }
  
  function cleanupCache(maxSize = 50) {
    if (evaluationCache.value && evaluationCache.value.size > maxSize) {
      const entries = Array.from(evaluationCache.value.entries())
      const toDelete = entries.slice(0, evaluationCache.value.size - maxSize)
      toDelete.forEach(([key]) => evaluationCache.value.delete(key))
      console.log(`🧹 Cache nettoyé: ${toDelete.length} entrées supprimées`)
    }
  }
  
  async function fetchWithTimeout(fen, depth, apiTimeout = 3000, useFallback = false) {
    const controller = new AbortController()
    // Timeout adaptatif basé sur la profondeur (comme Lichess)
    const timeout = Math.min(depth * 200, apiTimeout) // 200ms par profondeur
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const apiUrl = useFallback ? getFallbackApiUrl() : getApiUrl()
    
    try {
      console.log(`🌐 API ${useFallback ? 'FALLBACK' : 'PRINCIPALE'} (depth:${depth}, timeout:${timeout}ms):`, apiUrl)
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Cache-Control": "no-cache" // Éviter le cache navigateur
        },
        mode: 'cors',
        body: JSON.stringify({ 
          fen: fen,
          depth: depth,
          // Optimisations Lichess-like
          threads: 1, // Utiliser 1 thread pour la rapidité
          hash: 16,   // Hash table réduite pour la vitesse
          time: Math.min(depth * 50, 1000) // Time limit en ms
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      
      // Si c'est une erreur CORS et qu'on n'a pas encore essayé le fallback
      if (!useFallback && (error.message.includes('CORS') || error.message.includes('cors') || error.message.includes('Access-Control-Allow-Origin'))) {
        console.log('🔄 Erreur CORS détectée, tentative avec proxy...')
        return await fetchWithTimeout(fen, depth, apiTimeout, true)
      }
      
      throw error
    }
  }
  
  async function analyzePosition(fen, depth = 8, apiTimeout = 3000) {
    const startTime = performance.now()
    
    // Vérifier le cache d'abord
    const cacheKey = `${fen}-${depth}`
    if (evaluationCache.value.has(cacheKey)) {
      const cacheTime = performance.now() - startTime
      console.log(`🚀 Cache hit (${cacheTime.toFixed(0)}ms) pour FEN:`, fen)
      return evaluationCache.value.get(cacheKey)
    }

    // Éviter les requêtes dupliquées
    if (pendingRequests.value.has(cacheKey)) {
      console.log('⏳ Requête en cours pour FEN:', fen)
      return await pendingRequests.value.get(cacheKey)
    }

    console.log('🔍 Nouvelle requête API pour FEN:', fen)
    
    const requestPromise = fetchWithTimeout(fen, depth, apiTimeout)
    pendingRequests.value.set(cacheKey, requestPromise)
    
    try {
      const result = await requestPromise
      evaluationCache.value.set(cacheKey, result)
      
      const totalTime = performance.now() - startTime
      console.log(`⚡ API call completed in ${totalTime.toFixed(0)}ms`)
      
      return result
    } finally {
      pendingRequests.value.delete(cacheKey)
    }
  }
  
  async function preloadCommonPositions() {
    console.log('🚀 Préchargement des positions courantes...')
    for (const fen of PERFORMANCE_CONFIG.PRELOAD_POSITIONS) {
      try {
        await analyzePosition(fen, 6, 2000)
      } catch (error) {
        console.warn('⚠️ Erreur préchargement pour FEN:', fen)
      }
    }
    console.log('✅ Préchargement terminé')
  }
  
  return {
    evaluationCache,
    pendingRequests,
    PERFORMANCE_CONFIG,
    analyzePosition,
    preloadCommonPositions,
    cleanupCache,
    getApiUrl,
    getFallbackApiUrl
  }
}
