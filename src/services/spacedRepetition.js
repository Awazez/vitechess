// Service de répétition espacée pour l'apprentissage des finales d'échecs
// Implémentation simplifiée du système Anki

const STORAGE_KEY = 'vitechess_spaced_repetition'

// Structure d'un problème
class Problem {
  constructor(id, lessonTitle, difficulty = 2.5, interval = 1, repetitions = 0, easeFactor = 2.5) {
    this.id = id
    this.lessonTitle = lessonTitle
    this.difficulty = difficulty
    this.interval = interval
    this.repetitions = repetitions
    this.easeFactor = easeFactor
    this.lastReviewed = null
    this.nextReview = new Date().toISOString()
    this.errorCount = 0
    this.hasErrors = false
    this.daysOverdue = 0
  }
}

// Performance levels (comme Anki)
const PERFORMANCE = {
  AGAIN: 'again',    // 0 - Réviser immédiatement
  HARD: 'hard',      // 1 - Difficile
  GOOD: 'good',      // 2 - Bon
  EASY: 'easy'       // 3 - Facile
}

class SpacedRepetitionService {
  constructor() {
    this.problems = this.loadFromStorage()
  }

  // Charger les données depuis le localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        return data.problems || []
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des données de répétition espacée:', error)
    }
    return []
  }

  // Sauvegarder les données dans le localStorage
  saveToStorage() {
    try {
      const data = {
        problems: this.problems,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde des données de répétition espacée:', error)
    }
  }

  // Créer des problèmes à partir des leçons
  createProblemsFromLessons(lessons) {
    const newProblems = []
    
    lessons.forEach(lesson => {
      const problemId = `problem_${lesson.title.replace(/\s+/g, '_').toLowerCase()}`
      
      // Vérifier si le problème existe déjà
      const existingProblem = this.problems.find(p => p.id === problemId)
      if (!existingProblem) {
        const problem = new Problem(problemId, lesson.title)
        newProblems.push(problem)
      }
    })

    this.problems = [...this.problems, ...newProblems]
    this.saveToStorage()
  }

  // Obtenir les statistiques
  getStats() {
    const today = new Date().toISOString().split('T')[0]
    const todayProblems = this.problems.filter(p => 
      p.nextReview && p.nextReview.split('T')[0] <= today
    )

    return {
      totalProblems: this.problems.length,
      reviewedToday: 0, // Sera calculé dynamiquement
      toReviewToday: todayProblems.length,
      newToday: this.problems.filter(p => p.repetitions === 0).length
    }
  }

  // Obtenir les problèmes à réviser aujourd'hui
  getProblemsToReview() {
    const today = new Date().toISOString().split('T')[0]
    
    return this.problems
      .filter(p => p.nextReview && p.nextReview.split('T')[0] <= today)
      .map(p => {
        // Calculer les jours de retard
        const nextReviewDate = new Date(p.nextReview)
        const todayDate = new Date()
        const daysDiff = Math.floor((todayDate - nextReviewDate) / (1000 * 60 * 60 * 24))
        
        return {
          ...p,
          daysOverdue: Math.max(0, daysDiff),
          hasErrors: p.errorCount > 0
        }
      })
      .sort((a, b) => {
        // Prioriser les problèmes en retard et avec erreurs
        if (a.daysOverdue !== b.daysOverdue) {
          return b.daysOverdue - a.daysOverdue
        }
        if (a.hasErrors !== b.hasErrors) {
          return b.hasErrors - a.hasErrors
        }
        return new Date(a.nextReview) - new Date(b.nextReview)
      })
  }

  // Obtenir le prochain problème à réviser
  getNextProblem() {
    const problemsToReview = this.getProblemsToReview()
    return problemsToReview.length > 0 ? problemsToReview[0] : null
  }

  // Enregistrer la performance d'un problème
  recordPerformance(problemId, performance, timeSpent = 0, hasErrors = false) {
    const problem = this.problems.find(p => p.id === problemId)
    if (!problem) return

    // Mettre à jour les erreurs
    if (hasErrors) {
      problem.errorCount++
      problem.hasErrors = true
    } else {
      problem.hasErrors = false
    }

    // Calculer le nouvel intervalle basé sur la performance
    let newInterval = problem.interval
    let newEaseFactor = problem.easeFactor

    switch (performance) {
      case PERFORMANCE.AGAIN:
        newInterval = 1
        newEaseFactor = Math.max(1.3, problem.easeFactor - 0.2)
        problem.repetitions = 0
        break
      
      case PERFORMANCE.HARD:
        newInterval = Math.max(1, Math.floor(problem.interval * 1.2))
        newEaseFactor = Math.max(1.3, problem.easeFactor - 0.15)
        break
      
      case PERFORMANCE.GOOD:
        if (problem.repetitions === 0) {
          newInterval = 1
        } else if (problem.repetitions === 1) {
          newInterval = 6
        } else {
          newInterval = Math.floor(problem.interval * problem.easeFactor)
        }
        break
      
      case PERFORMANCE.EASY:
        newInterval = Math.floor(problem.interval * problem.easeFactor * 1.3)
        newEaseFactor = problem.easeFactor + 0.15
        break
    }

    // Mettre à jour le problème
    problem.interval = newInterval
    problem.easeFactor = newEaseFactor
    problem.repetitions++
    problem.lastReviewed = new Date().toISOString()
    
    // Calculer la prochaine révision
    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)
    problem.nextReview = nextReviewDate.toISOString()

    this.saveToStorage()
  }

  // Réinitialiser toutes les données
  reset() {
    this.problems = []
    localStorage.removeItem(STORAGE_KEY)
  }
}

// Exporter une instance singleton
export const spacedRepetition = new SpacedRepetitionService()


