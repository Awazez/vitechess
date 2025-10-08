import { computed } from 'vue'

export function useTranslation(isEnglish) {
  const t = computed(() => ({
    // Messages de base
    yourTurn: isEnglish.value ? "Your turn!" : "À toi de jouer !",
    computerTurn: isEnglish.value ? "Computer's turn..." : "Tour de l'ordinateur...",
    checkmate: isEnglish.value ? "♔ Checkmate!" : "♔ Échec et mat !",
    stalemate: isEnglish.value ? "♟️ Stalemate!" : "♟️ Pat !",
    draw: isEnglish.value ? "🤝 Draw!" : "🤝 Nulle !",
    
    // Messages d'erreur
    invalidMove: isEnglish.value ? "❌ Invalid move!" : "❌ Coup invalide !",
    networkError: isEnglish.value ? "❌ Network error" : "❌ Erreur réseau",
    computerError: isEnglish.value ? "❌ Computer error" : "❌ Erreur ordinateur",
    
    // Messages de succès
    wellPlayed: isEnglish.value ? "✅ Well played!" : "✅ Bien joué !",
    
    // Messages d'API
    analyzing: isEnglish.value ? "🤔 Analyzing position..." : "🤔 Analyse de la position...",
    lookingForMove: isEnglish.value ? "🤔 Looking for the best move..." : "🤔 Recherche du meilleur coup...",
    requestTimeout: isEnglish.value ? "⏰ Request timeout - try again" : "⏰ Délai d'attente dépassé - réessayez",
    corsError: isEnglish.value ? "🚫 CORS error - API not accessible" : "🚫 Erreur CORS - API inaccessible",
    networkCheck: isEnglish.value ? "🌐 Network error - check connection" : "🌐 Erreur réseau - vérifiez la connexion",
    
    // Messages de démo
    startDemo: isEnglish.value ? "🚀 Start demo" : "🚀 Lancer la démo",
    stopDemo: isEnglish.value ? "⏹️ Stop demo" : "⏹️ Arrêter la démo",
    demoStopped: isEnglish.value ? "⏹️ Demo stopped" : "⏹️ Démo arrêtée",
    noScriptedDemo: isEnglish.value ? "🚫 This module has no scripted demo." : "🚫 Ce module n'a pas de démo scriptée.",
    
    // Messages de boutons
    hint: isEnglish.value ? "💡 Hint" : "💡 Indice",
    loading: isEnglish.value ? "⏳ Loading..." : "⏳ Chargement...",
    reset: isEnglish.value ? "🔄 Reset" : "🔄 Reset",
    
    // Messages de bienvenue
    welcome: isEnglish.value ? "👋 Welcome! Click 🚀 to start the demo." : "👋 Bienvenue ! Clique sur 🚀 pour lancer la démo.",
    
    // Messages d'évaluation
    hintPrefix: isEnglish.value ? "💡 Hint: " : "💡 Indice : ",
    wellPlayedPrefix: isEnglish.value ? "✅ Well played!" : "✅ Bien joué !",
    wrongMove: isEnglish.value ? "❌ Wrong move, try again!" : "❌ Mauvais coup, essaie encore !",
    
    // Messages de fin de partie
    checkmateWin: isEnglish.value ? "🏆 Well done, you checkmated!" : "🏆 Bravo, tu as donné mat !",
    pawnPromoted: isEnglish.value ? "🎉 Well done! Pawn promoted!" : "🎉 Bravo ! Pion promu !",
    promotion: isEnglish.value ? "🎉 Promotion! The pawn becomes a queen!" : "🎉 Promotion ! Le pion devient une dame !"
  }))
  
  return { t }
}

