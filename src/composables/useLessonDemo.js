import { ref } from 'vue'
import { Chess } from 'chess.js'

export function useLessonDemo() {
  const demoRunning = ref(false)
  const demoAborted = ref(false)
  
  function parsePgn(pgn) {
    // Extrait FEN si présente
    const fenMatch = pgn.match(/\[FEN\s+"([^"]+)"\]/i)
    const fen = fenMatch ? fenMatch[1] : null
    // Enlève headers
    const body = pgn.replace(/\[[^\]]*\]\s*/g, " ")
    // Enlève commentaires { ... } et variantes ( ... )
    const noComments = body.replace(/\{[^}]*\}/g, " ").replace(/\([^)]*\)/g, " ")
    // Enlève numéros de coups et résultats
    const tokens = noComments
      .replace(/\d+\.(\.\.)?/g, " ")
      .replace(/1-0|0-1|1\/2-1\/2|\*/g, " ")
      .trim()
      .split(/\s+/)
    // Garde que les SAN plausibles (incluant roques et promotions)
    const sanMoves = tokens.filter(t => /^(O-O(-O)?|[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](=[NBRQ])?[+#]?|[a-h]x[a-h][1-8](=[NBRQ])?[+#]?)$/.test(t))
    return { fen, sanMoves }
  }
  
  function translateToFrench(sanMove) {
    if (!sanMove) return sanMove
    
    // Traduction simple et robuste
    let frenchMove = sanMove
    
    // Traduire seulement les pièces principales (ordre important)
    frenchMove = frenchMove.replace(/R/g, 'T')  // Tour (en premier pour éviter les conflits)
    frenchMove = frenchMove.replace(/K/g, 'R')  // Roi
    frenchMove = frenchMove.replace(/Q/g, 'D')  // Dame
    frenchMove = frenchMove.replace(/B/g, 'F')  // Fou
    frenchMove = frenchMove.replace(/N/g, 'C')  // Cavalier
    
    return frenchMove
  }
  
  function translateToEnglish(sanMove) {
    if (!sanMove) return sanMove
    
    // En anglais, la notation standard est déjà correcte (K, Q, R, B, N)
    // Pas de traduction nécessaire
    return sanMove
  }
  
  function translateUciToSan(uciMove, currentFen) {
    if (!uciMove || uciMove.length < 4) return uciMove
    try {
      const chess = new Chess(currentFen)
      const from = uciMove.substring(0, 2)
      const to = uciMove.substring(2, 4)
      const promotion = uciMove.length > 4 ? uciMove[4] : undefined
      
      // Essayer de faire le coup
      const move = chess.move({ from, to, promotion })
      if (move) {
        return move.san
      }
      
      // Si le coup échoue, essayer de déterminer manuellement
      const piece = chess.get(from)
      if (piece) {
        const pieceType = piece.type.toUpperCase()
        const pieceSymbol = pieceType === 'P' ? '' : pieceType
        return pieceSymbol + to
      }
      
      return uciMove
    } catch (e) {
      console.warn('Erreur traduction UCI:', e)
      return uciMove
    }
  }
  
  function formatEvaluation(evaluation, isEnglish) {
    if (!evaluation) return ""
    
    // Gérer les évaluations de mat
    if (evaluation.includes("mate")) {
      const mateIn = evaluation.replace("mate ", "")
      return isEnglish ? `Mate in ${mateIn}` : `Mat en ${mateIn}`
    }
    
    // Gérer les évaluations en centipawns
    const centipawns = parseInt(evaluation)
    if (isNaN(centipawns)) return evaluation
    
    // Convertir en avantage lisible
    if (Math.abs(centipawns) < 10) {
      return isEnglish ? "Equal" : "Égalité"
    } else if (centipawns > 0) {
      const advantage = (centipawns / 100).toFixed(1)
      return isEnglish ? `+${advantage}` : `+${advantage}`
    } else {
      const disadvantage = (Math.abs(centipawns) / 100).toFixed(1)
      return isEnglish ? `-${disadvantage}` : `-${disadvantage}`
    }
  }
  
  return {
    demoRunning,
    demoAborted,
    parsePgn,
    translateToFrench,
    translateToEnglish,
    translateUciToSan,
    formatEvaluation
  }
}

