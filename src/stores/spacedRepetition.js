import { ref, computed } from 'vue'

// Store pour gérer les révisions espacées
export const useSpacedRepetitionStore = () => {
  // État réactif
  const problems = ref([])
  const isLoading = ref(false)

  // Computed properties
  const stats = computed(() => {
    const total = problems.value.length
    const today = new Date().toISOString().split('T')[0]
    
    // Nouvelles (jamais révisées)
    const newToday = problems.value.filter(problem => problem.repetitions === 0).length
    
    // Révisées aujourd'hui
    const reviewedToday = problems.value.filter(problem => {
      if (problem.repetitions === 0) return false
      const lastReviewDate = new Date(problem.lastReviewed || problem.createdAt).toISOString().split('T')[0]
      return lastReviewDate === today
    }).length
    
    // À réviser (déjà révisées mais pas aujourd'hui)
    const toReview = problems.value.filter(problem => {
      if (problem.repetitions === 0) return false
      const lastReviewDate = new Date(problem.lastReviewed || problem.createdAt).toISOString().split('T')[0]
      return lastReviewDate !== today
    }).length

    return {
      total,
      newToday,
      reviewedToday,
      toReview
    }
  })

  const problemsToReviewToday = computed(() => {
    return problems.value.filter(problem => {
      // Inclure les nouvelles (jamais révisées)
      if (problem.repetitions === 0) return true
      
      // Exclure les révisées aujourd'hui
      const today = new Date().toISOString().split('T')[0]
      const lastReviewDate = new Date(problem.lastReviewed || problem.createdAt).toISOString().split('T')[0]
      return lastReviewDate !== today
    })
  })

  // Actions
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('vitechess_spaced_repetition')
      if (stored) {
        problems.value = JSON.parse(stored)
        console.log('📦 Chargé depuis localStorage:', problems.value.length, 'problèmes')
      }
    } catch (e) {
      console.warn('Erreur lors du chargement:', e)
      problems.value = []
    }
  }

  const saveToStorage = () => {
    try {
      localStorage.setItem('vitechess_spaced_repetition', JSON.stringify(problems.value))
      console.log('💾 Sauvegardé dans localStorage:', problems.value.length, 'problèmes')
    } catch (e) {
      console.warn('Erreur lors de la sauvegarde:', e)
    }
  }

  const addProblem = (lessonTitle) => {
    console.log(`➕ Ajout du problème: "${lessonTitle}"`)
    
    // Vérifier si le problème existe déjà
    const existingIndex = problems.value.findIndex(p => p.lessonTitle === lessonTitle)
    if (existingIndex !== -1) {
      console.log('⚠️ Problème déjà existant, ignoré')
      return false
    }

    // Créer un nouveau problème
    const newProblem = {
      id: `problem_${lessonTitle.replace(/\s+/g, '_').toLowerCase()}`,
      lessonTitle: lessonTitle,
      createdAt: new Date().toISOString(),
      nextReview: new Date().toISOString(),
      interval: 1,
      repetitions: 0,
      ease: 2.5
    }

    problems.value.push(newProblem)
    saveToStorage()
    console.log('✅ Problème ajouté:', newProblem)
    return true
  }

  const removeProblem = (lessonTitle) => {
    console.log(`➖ Suppression du problème: "${lessonTitle}"`)
    
    const initialLength = problems.value.length
    problems.value = problems.value.filter(p => p.lessonTitle !== lessonTitle)
    
    if (problems.value.length < initialLength) {
      saveToStorage()
      console.log('✅ Problème supprimé')
      return true
    } else {
      console.log('⚠️ Problème non trouvé')
      return false
    }
  }

  const isLessonInSpacedRepetition = (lessonTitle) => {
    return problems.value.some(problem => problem.lessonTitle === lessonTitle)
  }

  const recordCompletion = (lessonTitle, hasErrors = false, timeSpent = 0) => {
    console.log(`🎯 Enregistrement completion: "${lessonTitle}", erreurs: ${hasErrors}`)
    
    const problem = problems.value.find(p => p.lessonTitle === lessonTitle)
    if (!problem) {
      console.warn('⚠️ Problème non trouvé pour enregistrement')
      return false
    }

    // Mettre à jour le problème
    problem.repetitions = (problem.repetitions || 0) + 1
    problem.lastReviewed = new Date().toISOString()

    if (hasErrors) {
      // En cas d'erreur, remettre à zéro
      problem.interval = 1
      problem.ease = Math.max(1.3, problem.ease - 0.2)
    } else {
      // En cas de succès, augmenter l'intervalle
      problem.interval = problem.interval * problem.ease
      problem.ease = Math.min(2.5, problem.ease + 0.1)
    }

    // Calculer la prochaine révision
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + Math.ceil(problem.interval))
    problem.nextReview = nextReview.toISOString()

    saveToStorage()
    console.log(`✅ Completion enregistrée pour "${lessonTitle}"`)
    return true
  }

  const clearAll = () => {
    console.log('🗑️ Suppression de tous les problèmes')
    problems.value = []
    saveToStorage()
  }

  // Initialiser au démarrage
  loadFromStorage()

  return {
    // État
    problems,
    isLoading,
    
    // Computed
    stats,
    problemsToReviewToday,
    
    // Actions
    addProblem,
    removeProblem,
    isLessonInSpacedRepetition,
    recordCompletion,
    clearAll,
    loadFromStorage,
    saveToStorage
  }
}
