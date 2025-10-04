<template>
  <!-- Message pour mobile -->
  <div class="mobile-message">
    <div class="mobile-content">
      <img :src="isDarkMode ? '/logo-dark.svg' : '/logo-light.svg'" alt="Vitechess" class="mobile-logo" />
      <h1>Vitechess est optimisé pour les écrans larges</h1>
      <p>Pour une expérience d'apprentissage optimale, nous recommandons d'utiliser un ordinateur ou une tablette en mode paysage.</p>
      <div class="mobile-features">
        <p>✨ Interface complète des échecs</p>
        <p>🎯 Modules d'apprentissage interactifs</p>
        <p>♟️ Plateau d'échecs haute résolution</p>
      </div>
    </div>
  </div>

  <div class="container">
    <!-- Logo et titre en haut à gauche -->
    <div class="header-logo">
      <img :src="isDarkMode ? '/logo-dark.svg' : '/logo-light.svg'" alt="Vitechess" class="logo" />
      <span class="app-name">vitechess</span>
    </div>
    
    <!-- Bouton de basculement de thème -->
    <button class="theme-toggle-btn" @click="toggleTheme">
      {{ isDarkMode ? '🌙' : '☀️' }}
    </button>
    
    <!-- Bouton de basculement de langue -->
    <button class="language-toggle-btn" @click="toggleLanguage">
      {{ isEnglish ? '🇬🇧' : '🇫🇷' }}
    </button>
    
    <!-- Bouton sélecteur de pièces -->
    <button class="piece-selector-btn" @click="togglePieceSelector">
      <img src="/pieces/cburnett/wN.svg" alt="Cavalier" class="piece-icon" />
    </button>
    
    <!-- Module actif (dynamique) -->
    <LessonModule
      :title="currentLesson.title"
      :initialFen="currentLesson.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'"
      :scriptedMoves="Array.isArray(currentLesson.scripted) ? currentLesson.scripted : []"
      :scriptedPgn="typeof currentLesson.scripted === 'string' ? currentLesson.scripted : ''"
      :selectedPieceSet="selectedPieceSet"
      :isEnglish="isEnglish"
      @lesson-completed="onLessonCompleted"
    />
    
    <!-- Colonne de droite -->
    <div class="right-column">
      <!-- Sélecteur de modules -->
      <div class="module-selector bubble">
        <div class="bubble-header" style="display:flex;align-items:center;gap:8px;">
          <div class="module-icon">
            <div class="avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
                <!-- Icône de formation professionnelle -->
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#40fbdc"/>
                <path d="M2 17L12 22L22 17" stroke="#40fbdc" stroke-width="2" fill="none"/>
                <path d="M2 12L12 17L22 12" stroke="#40fbdc" stroke-width="2" fill="none"/>
                <circle cx="12" cy="7" r="1" fill="#2a2a2a"/>
                <circle cx="12" cy="12" r="1" fill="#2a2a2a"/>
                <circle cx="12" cy="17" r="1" fill="#2a2a2a"/>
              </svg>
            </div>
          </div>
          <div class="titles">
            <h3>{{ isEnglish ? 'Available Modules' : 'Modules disponibles' }}</h3>
            <p class="subtitle">{{ isEnglish ? 'Choose your course package' : 'Choisis ton paquet de cours' }}</p>
          </div>
        </div>
        
        <!-- Vue des paquets -->
        <div v-if="!showPackageLessons" class="packages-grid">
          <div 
            v-for="pkg in coursePackages" 
            :key="pkg.id"
            class="package-card"
            :style="{ '--package-color': pkg.color }"
            @click="selectPackage(pkg)"
          >
            <div class="package-icon">{{ pkg.icon }}</div>
            <div class="package-content">
              <h4 class="package-title">{{ pkg.title }}</h4>
              <p class="package-description">{{ pkg.description }}</p>
              <div class="package-stats">
                <span class="lesson-count">{{ pkg.lessons.length }} {{ isEnglish ? (pkg.lessons.length > 1 ? 'lessons' : 'lesson') : (pkg.lessons.length > 1 ? 'leçons' : 'leçon') }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Vue des leçons d'un paquet -->
        <div v-else class="package-lessons">
          <div class="package-lessons-header">
            <button class="back-btn" @click="backToPackages">
              ← {{ isEnglish ? 'Back to packages' : 'Retour aux paquets' }}
            </button>
            <h4>{{ selectedPackage.title }}</h4>
          </div>
          <ul class="lessons-list">
            <li
              v-for="lesson in selectedPackage.lessons"
              :key="lesson.title"
              :class="{ 
                active: lesson.title === currentLesson.title
              }"
            >
              <div class="lesson-content" @click="selectLesson(lesson)">
                <div class="lesson-info">
                  <span class="lesson-title">{{ lesson.title }}</span>
                  <span class="lesson-difficulty" :class="lesson.difficulty.toLowerCase()">
                    {{ lesson.difficulty }}
                  </span>
                </div>
              </div>
              <div class="lesson-actions">
                <label class="sr-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="isLessonInSpacedRepetition(lesson.title)"
                    @change="toggleSpacedRepetition(lesson.title)"
                    @click.stop
                  >
                  <span class="sr-label">{{ isEnglish ? 'Reviews' : 'Révisions' }}</span>
                </label>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Système de répétition espacée -->
      <div class="spaced-repetition bubble">
        <div class="bubble-header" style="display:flex;align-items:center;gap:8px;">
          <div class="spaced-repetition-icon">
            <div class="avatar">
              <img v-if="teacherBubbleSvg" :src="teacherBubbleSvg" alt="Coach" />
              <span v-else>🧠</span>
            </div>
          </div>
          <div class="titles">
            <h3>{{ isEnglish ? 'Spaced Repetition' : 'Révisions espacées' }}</h3>
            <p class="subtitle">{{ isEnglish ? 'Come back at the right time to master your endgames' : 'Reviens au bon moment pour ancrer tes finales' }}</p>
          </div>
        </div>
        <div class="stats">
          <div class="stat-item">
            <span class="number">{{ srStats.total }}</span>
            <span class="label">Total</span>
          </div>
          <div class="stat-item">
            <span class="number">{{ srStats.reviewedToday }}</span>
            <span class="label">{{ isEnglish ? 'Reviewed' : 'Révisées' }}</span>
          </div>
          <div class="stat-item">
            <span class="number">{{ srStats.toReview || 0 }}</span>
            <span class="label">{{ isEnglish ? 'To Review' : 'À réviser' }}</span>
          </div>
          <div class="stat-item">
            <span class="number">{{ srStats.newToday }}</span>
            <span class="label">{{ isEnglish ? 'New' : 'Nouvelles' }}</span>
          </div>
        </div>
        
        <div v-if="srProblemsToReviewToday.length > 0" class="lessons-to-review">
          <h4>{{ isEnglish ? 'Problems to review today' : 'Problèmes à réviser aujourd\'hui' }}</h4>
          <div class="review-list">
            <div 
              v-for="problem in srProblemsToReviewToday" 
              :key="problem.id"
              class="review-item"
              :class="{ 
                'overdue': problem.daysOverdue > 0,
                'error': problem.hasErrors,
                'to-review': problem.repetitions > 0 && isProblemToReview(problem)
              }"
              @click="startSrReview(problem)"
            >
              <span class="lesson-title">{{ problem.lessonTitle }}</span>
              <span v-if="problem.hasErrors" class="error-badge">
                {{ problem.errorCount }} {{ isEnglish ? (problem.errorCount > 1 ? 'errors' : 'error') : (problem.errorCount > 1 ? 'erreurs' : 'erreur') }}
              </span>
              <span v-else-if="problem.daysOverdue > 0" class="overdue-badge">
                {{ problem.daysOverdue }}{{ isEnglish ? 'd overdue' : 'j en retard' }}
              </span>
              <span v-else class="due-badge">{{ isEnglish ? 'To Review' : 'À réviser' }}</span>
            </div>
          </div>
        </div>
        
        <div v-else class="no-reviews">
          <div class="celebration">🎉</div>
          <p>{{ isEnglish ? 'Everything is up to date. You can play or learn a new endgame.' : 'Tout est à jour. Tu peux jouer ou apprendre une nouvelle finale.' }}</p>
        </div>
      </div>
    </div>

    <!-- Sélecteur de pièces -->
    <div v-if="showPieceSelector" class="piece-selector-overlay" @click="closePieceSelector">
      <div class="piece-selector-modal" @click.stop>
        <div class="piece-selector-header">
          <h3>{{ isEnglish ? 'Choose piece style' : 'Choisir le style des pièces' }}</h3>
          <button class="close-btn" @click="closePieceSelector">×</button>
        </div>
        <div class="piece-sets-grid">
          <div 
            v-for="set in pieceSets" 
            :key="set.id"
            class="piece-set-card"
            :class="{ active: selectedPieceSet === set.id }"
            @click="selectPieceSet(set.id)"
          >
            <div class="piece-set-preview">
              <div class="piece-preview-grid">
                <div class="piece-preview" v-for="piece in set.previewPieces" :key="piece">
                  <img :src="`/pieces/${set.id}/${piece}.svg`" :alt="piece" />
                </div>
              </div>
            </div>
            <div class="piece-set-info">
              <h4>{{ set.name }}</h4>
              <p>{{ set.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import LessonModule from "./components/Lesson/LessonModule.vue"
import { spacedRepetition } from "./services/spacedRepetition.js"
import { useSpacedRepetitionStore } from "./stores/spacedRepetition.js"
import kingRookVsKingPgn from "./assets/pgn/king_rook_vs_king.pgn?raw"
import kingQueenVsKingPgn from "./assets/pgn/king_queen_vs_king.pgn?raw"
import king2RookVsKingPgn from "./assets/pgn/king_2rook_vs_king.pgn?raw"
import rookFinalsExercice1Pgn from "./assets/pgn/rook_finals_exercice1.pgn?raw"
import kingPawnVsKingPgn from "./assets/pgn/king_pawn_vs_king.pgn?raw"
import kingPawnVsKingExercice1Pgn from "./assets/pgn/king_pawn_vs_king_exercice1.pgn?raw"
import kingPawnVsKingExercice2Pgn from "./assets/pgn/king_pawn_vs_king_exercice2.pgn?raw"
import philidorPositionPgn from "./assets/pgn/philidor_position.pgn?raw"
import rookFinalsExercice2Pgn from "./assets/pgn/rook_finals_exercice2.pgn?raw"
import teacherBubbleSvg from "./assets/teacher-bubble.svg"

function parsePgnHeaders(pgn) {
  if (typeof pgn !== "string") return { title: "", fen: "" }
  const eventMatch = pgn.match(/\[Event\s+"([^"]+)"\]/i)
  const fenMatch = pgn.match(/\[FEN\s+"([^"]+)"\]/i)
  return {
    title: eventMatch ? eventMatch[1] : "",
    fen: fenMatch ? fenMatch[1] : ""
  }
}

const rookHeaders = parsePgnHeaders(kingRookVsKingPgn)
const kqHeaders = parsePgnHeaders(kingQueenVsKingPgn)
const twoRookHeaders = parsePgnHeaders(king2RookVsKingPgn)
const rookFinalsExercice1Headers = parsePgnHeaders(rookFinalsExercice1Pgn)
const kingPawnVsKingExercice1Headers = parsePgnHeaders(kingPawnVsKingExercice1Pgn)
const kingPawnVsKingExercice2Headers = parsePgnHeaders(kingPawnVsKingExercice2Pgn)
const philidorPositionHeaders = parsePgnHeaders(philidorPositionPgn)
const rookFinalsExercice2Headers = parsePgnHeaders(rookFinalsExercice2Pgn)

// Système de traduction des titres de leçons
const lessonTranslations = {
  "Mat élémentaire : Dame et roi contre roi": "Basic mate: Queen and king vs king",
  "Mat élémentaire : tour et roi contre roi": "Basic mate: Rook and king vs king", 
  "Mat élémentaire : Deux tour et roi contre roi": "Basic mate: Two rooks and king vs king",
  "Mat élémentaire : Deux tours contre roi": "Basic mate: Two rooks vs king",
  "Finales de tour : Exercice 1": "Rook endgames: Exercise 1",
  "Finales de tour - Exercice 1": "Rook endgames - Exercise 1",
  "Finale de tour : Exercice 2": "Rook endgame: Exercise 2",
  "Position de Philidor - Défense classique": "Philidor Position - Classic Defense",
  "Position de Philidor": "Philidor Position",
  "Finale de pion : exercice 1": "Pawn endgame: Exercise 1",
  "Finale de pion : exercice 2": "Pawn endgame: Exercise 2"
}

// Fonction pour traduire un titre de leçon
function translateLessonTitle(frenchTitle) {
  if (!isEnglish.value) return frenchTitle
  return lessonTranslations[frenchTitle] || frenchTitle
}

// Paquets de cours
const coursePackages = computed(() => [
  {
    id: "mats-elementaires",
    title: isEnglish.value ? "Basic Mates" : "Mats élémentaires",
    icon: "♔",
    description: isEnglish.value ? "Essential basic mates to know" : "Les mats de base à connaître",
    color: "#40fbdc",
    lessons: [
      {
        title: translateLessonTitle(kqHeaders.title || "Mat élémentaire : Dame et roi contre roi"),
        scripted: kingQueenVsKingPgn,
        difficulty: isEnglish.value ? "Beginner" : "Débutant"
      },
      {
        title: translateLessonTitle(twoRookHeaders.title || "Mat élémentaire : Deux tour et roi contre roi"),
        scripted: king2RookVsKingPgn,
        difficulty: isEnglish.value ? "Beginner" : "Débutant"
      }
    ]
  },
  {
    id: "finales-tour",
    title: isEnglish.value ? "Rook Endgames" : "Finales de tour",
    icon: "♜",
    description: isEnglish.value ? "Learn essential rook endgames" : "Apprends les finales de tour essentielles",
    color: "#40fbdc",
    lessons: [
      {
        title: translateLessonTitle(rookHeaders.title || "Mat élémentaire : tour et roi contre roi"),
        scripted: kingRookVsKingPgn,
        difficulty: isEnglish.value ? "Beginner" : "Débutant"
      },
      {
        title: translateLessonTitle(rookFinalsExercice1Headers.title || "Finales de tour : Exercice 1"),
        scripted: rookFinalsExercice1Pgn,
        difficulty: isEnglish.value ? "Intermediate" : "Intermédiaire"
      },
      {
        title: translateLessonTitle(rookFinalsExercice2Headers.title || "Finale de tour : Exercice 2"),
        scripted: rookFinalsExercice2Pgn,
        difficulty: isEnglish.value ? "Intermediate" : "Intermédiaire"
      },
      {
        title: translateLessonTitle(philidorPositionHeaders.title || "Position de Philidor - Défense classique"),
        scripted: philidorPositionPgn,
        difficulty: isEnglish.value ? "Advanced" : "Avancé"
      }
    ]
  },
  {
    id: "finales-pion",
    title: isEnglish.value ? "Pawn Endgames" : "Finales de pion",
    icon: "♟",
    description: isEnglish.value ? "Master fundamental pawn endgames" : "Maîtrise les finales de pion fondamentales",
    color: "#40fbdc",
    lessons: [
      {
        title: isEnglish.value ? "King and Pawn vs King" : "Roi et pion contre roi",
        scripted: kingPawnVsKingPgn,
        difficulty: isEnglish.value ? "Beginner" : "Débutant"
      },
      {
        title: translateLessonTitle(kingPawnVsKingExercice1Headers.title || "Finale de pion : exercice 1"),
        scripted: kingPawnVsKingExercice1Pgn,
        difficulty: isEnglish.value ? "Intermediate" : "Intermédiaire"
      },
      {
        title: translateLessonTitle(kingPawnVsKingExercice2Headers.title || "Finale de pion : exercice 2"),
        scripted: kingPawnVsKingExercice2Pgn,
        difficulty: isEnglish.value ? "Intermediate" : "Intermédiaire"
      }
    ]
  }
]);

// Toutes les leçons (pour compatibilité)
const lessons = computed(() => coursePackages.value.flatMap(pkg => pkg.lessons));

const currentLesson = ref(null)
const problemStartTime = ref(null)
const problemTimeout = ref(null)

// État des paquets
const selectedPackage = ref(null)
const showPackageLessons = ref(false)

// Mode sombre simple - commencer en mode sombre par défaut
const isDarkMode = ref(true)

// Langue - commencer en français par défaut
const isEnglish = ref(false)

// Sélecteur de pièces
const showPieceSelector = ref(false)
const selectedPieceSet = ref('cburnett') // Set par défaut

// Sets de pièces disponibles
const pieceSets = [
  { id: 'cburnett', name: 'Classique', description: 'Style traditionnel', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'alpha', name: 'Alpha', description: 'Style moderne', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'fantasy', name: 'Fantasy', description: 'Style fantaisie', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'pixel', name: 'Pixel', description: 'Style rétro', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'caliente', name: 'Caliente', description: 'Style chaud', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'cardinal', name: 'Cardinal', description: 'Style élégant', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'celtic', name: 'Celtic', description: 'Style celtique', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'chess7', name: 'Chess7', description: 'Style moderne', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'chessnut', name: 'Chessnut', description: 'Style naturel', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'companion', name: 'Companion', description: 'Style compagnon', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'dubrovny', name: 'Dubrovny', description: 'Style russe', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'fresca', name: 'Fresca', description: 'Style frais', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'gioco', name: 'Gioco', description: 'Style italien', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'governor', name: 'Governor', description: 'Style gouverneur', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'horsey', name: 'Horsey', description: 'Style cheval', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'icpieces', name: 'Icpieces', description: 'Style icône', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'kiwen-suwi', name: 'Kiwen Suwi', description: 'Style unique', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'kosal', name: 'Kosal', description: 'Style asiatique', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'leipzig', name: 'Leipzig', description: 'Style allemand', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'letter', name: 'Letter', description: 'Style lettre', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'libra', name: 'Libra', description: 'Style balance', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'maestro', name: 'Maestro', description: 'Style maître', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'merida', name: 'Merida', description: 'Style espagnol', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'mpchess', name: 'Mpchess', description: 'Style moderne', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'pirouetti', name: 'Pirouetti', description: 'Style danse', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'reillycraig', name: 'Reilly Craig', description: 'Style artistique', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'riohacha', name: 'Riohacha', description: 'Style colombien', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'shapes', name: 'Shapes', description: 'Style géométrique', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'spatial', name: 'Spatial', description: 'Style spatial', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'staunty', name: 'Staunty', description: 'Style robuste', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] },
  { id: 'tatiana', name: 'Tatiana', description: 'Style élégant', previewPieces: ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'] }
]

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  applyTheme()
}

function toggleLanguage() {
  isEnglish.value = !isEnglish.value
}

// Fonctions pour le sélecteur de pièces
function togglePieceSelector() {
  showPieceSelector.value = !showPieceSelector.value
}

function closePieceSelector() {
  showPieceSelector.value = false
}

function selectPieceSet(setId) {
  selectedPieceSet.value = setId
  console.log('🎯 Nouveau set de pièces sélectionné:', setId)
  console.log('🎯 selectedPieceSet.value:', selectedPieceSet.value)
  closePieceSelector()
}

function applyTheme() {
  const root = document.documentElement
  console.log('🎨 Applying theme:', isDarkMode.value ? 'DARK' : 'LIGHT')
  
  if (isDarkMode.value) {
    // Mode sombre
    root.style.setProperty('--bg-primary', '#1a1d3a')
    root.style.setProperty('--bg-secondary', '#1a1d3a')
    root.style.setProperty('--bg-tertiary', '#2a2d4a')
    root.style.setProperty('--text-primary', '#ffffff')
    root.style.setProperty('--text-secondary', '#b8bcc8')
    root.style.setProperty('--border-color', '#3a3d5a')
    root.style.setProperty('--black-color', '#314089')
    root.style.setProperty('--white-color', '#899ff7')
    root.style.setProperty('--board-bg-color', '#1a1d3a')
    root.style.setProperty('--bg-color', '#0a0d26')
    root.style.backgroundColor = '#0a0d26'
    root.style.color = 'rgba(255, 255, 255, 0.87)'
    document.body.style.backgroundColor = '#0a0d26'
    document.body.style.color = 'rgba(255, 255, 255, 0.87)'
  } else {
    // Mode clair
    root.style.setProperty('--bg-primary', '#ffffff')
    root.style.setProperty('--bg-secondary', '#fafafa')
    root.style.setProperty('--bg-tertiary', '#f5f5f5')
    root.style.setProperty('--text-primary', '#333333')
    root.style.setProperty('--text-secondary', '#6c757d')
    root.style.setProperty('--text-muted', '#808080')
    root.style.setProperty('--border-color', '#e0e0e0')
    root.style.setProperty('--black-color', '#b58863')
    root.style.setProperty('--white-color', '#f0d9b5')
    root.style.setProperty('--board-bg-color', '#f0d9b5')
    root.style.setProperty('--bg-color', '#ffffff')
    root.style.setProperty('--shadow', '0 4px 12px rgba(0, 0, 0, 0.08)')
    root.style.backgroundColor = '#ffffff'
    root.style.color = 'rgba(0, 0, 0, 0.87)'
    document.body.style.backgroundColor = '#ffffff'
    document.body.style.color = 'rgba(0, 0, 0, 0.87)'
  }
}

// Système de répétition espacée - Store
const spacedRepetitionStore = useSpacedRepetitionStore()

// Raccourcis pour la compatibilité
const srStats = computed(() => spacedRepetitionStore.stats.value)
const srProblemsToReview = spacedRepetitionStore.problems
const srProblemsToReviewToday = spacedRepetitionStore.problemsToReviewToday

function initializeSpacedRepetition() {
  // Vérifier que lessons.value est un tableau
  if (Array.isArray(lessons.value)) {
    spacedRepetition.createProblemsFromLessons(lessons.value)
    srStats.value = spacedRepetition.getStats()
    srProblemsToReview.value = spacedRepetition.getProblemsToReview()
    focusOnNextSrProblem()
  } else {
    console.warn('⚠️ lessons.value n\'est pas un tableau:', lessons.value)
  }
}

function focusOnNextSrProblem() {
  const nextProblem = spacedRepetition.getNextProblem()
  if (nextProblem) {
    // Charger la leçon correspondante
    const foundLesson = lessons.value.find(l => l.title === nextProblem.lessonTitle)
    if (foundLesson) {
      currentLesson.value = foundLesson
    }
  }
}

function startSrReview(problem) {
  // Charger la leçon correspondante
  const foundLesson = lessons.value.find(l => l.title === problem.lessonTitle)
  if (foundLesson) {
    currentLesson.value = foundLesson
    // Démarrer le chronomètre pour ce problème
    startProblemTimer(problem)
  }
}

function startProblemTimer(problem) {
  // Arrêter le timer précédent s'il existe
  if (problemTimeout.value) {
    clearTimeout(problemTimeout.value)
  }
  
  problemStartTime.value = Date.now()
  
  // Si le problème a des erreurs, donner moins de temps
  const timeLimit = problem.hasErrors ? 30000 : 60000 // 30s si erreurs, 60s sinon
  
  problemTimeout.value = setTimeout(() => {
    // Temps écoulé - marquer comme erreur automatiquement
    console.log('⏰ Temps écoulé - problème marqué avec erreurs')
    recordSrCompletion(currentLesson.value.title, true)
  }, timeLimit)
}



// Fonction appelée quand une leçon est terminée avec succès
function onLessonCompleted() {
  // Arrêter le timer
  if (problemTimeout.value) {
    clearTimeout(problemTimeout.value)
    problemTimeout.value = null
  }
  
  // Calculer le temps pris
  const timeSpent = problemStartTime.value ? Date.now() - problemStartTime.value : 0
  
  // Enregistrer la performance dans le système Anki
  recordSrCompletion(currentLesson.value.title, false, timeSpent) // Pas d'erreur
}

function recordSrCompletion(lessonTitle, hasErrors = false, timeSpent = 0) {
  console.log(`🎯 Leçon terminée: "${lessonTitle}", Erreurs: ${hasErrors}`)
  
  try {
    // Lire les problèmes actuels
    const stored = localStorage.getItem('vitechess_spaced_repetition')
    console.log('📦 Données localStorage:', stored)
    
    if (!stored) {
      console.log('⚠️ Aucune donnée de révision espacée trouvée')
      return
    }
    
    const problems = JSON.parse(stored)
    console.log('📋 Problèmes trouvés:', problems.map(p => p.lessonTitle))
    
    // Recherche exacte d'abord
    let problemIndex = problems.findIndex(p => p.lessonTitle === lessonTitle)
    console.log(`🔍 Recherche exacte de "${lessonTitle}" - Index: ${problemIndex}`)
    
    // Si pas trouvé, recherche flexible (contient les mots-clés)
    if (problemIndex === -1) {
      const keywords = lessonTitle.toLowerCase().split(' ').filter(word => word.length > 2)
      console.log(`🔍 Recherche flexible avec mots-clés:`, keywords)
      
      problemIndex = problems.findIndex(p => {
        const titleLower = p.lessonTitle.toLowerCase()
        return keywords.some(keyword => titleLower.includes(keyword))
      })
      console.log(`🔍 Recherche flexible - Index: ${problemIndex}`)
    }
    
    if (problemIndex === -1) {
      console.log(`⚠️ Problème "${lessonTitle}" non trouvé dans les révisions`)
      console.log('📝 Titres disponibles:', problems.map(p => `"${p.lessonTitle}"`))
      return
    }
    
    console.log(`✅ Problème trouvé: "${problems[problemIndex].lessonTitle}"`)
    
    // Mettre à jour le problème
    const problem = problems[problemIndex]
    problem.repetitions = (problem.repetitions || 0) + 1
    problem.lastReviewed = new Date().toISOString() // Date de dernière révision
    
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
    
    // Sauvegarder
    localStorage.setItem('vitechess_spaced_repetition', JSON.stringify(problems))
    console.log(`✅ Problème "${lessonTitle}" mis à jour - Prochaine révision: ${problem.nextReview}`)
    
    // Mettre à jour les statistiques
    // updateStats() supprimée - géré par le store
    
  } catch (e) {
    console.warn('Erreur lors de l\'enregistrement de la performance:', e)
  }
}

// Fonction pour réinitialiser les données de répétition espacée
function resetAnkiData() {
  localStorage.removeItem('vitechess_spaced_repetition')
  console.log('🗑️ Données de répétition espacée réinitialisées')
}

function selectLesson(lesson) {
  currentLesson.value = lesson
  // Arrêter le chronomètre si actif
  if (problemTimeout.value) {
    clearTimeout(problemTimeout.value)
    problemTimeout.value = null
  }
  problemStartTime.value = null
  // Ne pas fermer la vue des leçons du paquet - laisser l'utilisateur naviguer
}

function selectPackage(pkg) {
  selectedPackage.value = pkg
  showPackageLessons.value = true
}

function backToPackages() {
  showPackageLessons.value = false
  selectedPackage.value = null
}

// Fonctions pour gérer les révisions espacées
function isLessonInSpacedRepetition(lessonTitle) {
  return spacedRepetitionStore.isLessonInSpacedRepetition(lessonTitle)
}

function isProblemToReview(problem) {
  // Un problème est "à réviser" s'il a été révisé au moins une fois mais pas aujourd'hui
  if (problem.repetitions === 0) return false // Pas encore révisé
  
  const today = new Date().toISOString().split('T')[0]
  const lastReviewDate = new Date(problem.lastReviewed || problem.createdAt).toISOString().split('T')[0]
  return lastReviewDate !== today
}

// Propriété calculée pour filtrer les problèmes à réviser aujourd'hui
// problemsToReviewToday maintenant géré par le store

function toggleSpacedRepetition(lessonTitle) {
  console.log(`🔄 Toggle spaced repetition pour: "${lessonTitle}"`)
  
  const isInSR = spacedRepetitionStore.isLessonInSpacedRepetition(lessonTitle)
  console.log(`📊 État actuel: ${isInSR ? 'DANS' : 'PAS DANS'} spaced repetition`)
  
  if (isInSR) {
    // Retirer de la répétition espacée
    console.log('➖ Retrait de spaced repetition')
    spacedRepetitionStore.removeProblem(lessonTitle)
    console.log('📊 Après retrait - Stats:', spacedRepetitionStore.stats.value)
  } else {
    // Ajouter à la répétition espacée
    console.log('➕ Ajout à spaced repetition')
    spacedRepetitionStore.addProblem(lessonTitle)
    console.log('📊 Après ajout - Stats:', spacedRepetitionStore.stats.value)
  }
  
  console.log('📊 Stats finales:', spacedRepetitionStore.stats.value)
  console.log('📋 Problèmes à réviser:', spacedRepetitionStore.problems.value.length)
}


// updateStats() supprimée - maintenant gérée par le store


// resetSpacedRepetition() supprimée - maintenant gérée par le store

// Le store se charge automatiquement au démarrage

// Ancien code de reset supprimé - maintenant géré par le store


// Initialiser la première leçon
if (lessons.value.length > 0) {
  currentLesson.value = lessons.value[0]
}

// Appliquer le thème au démarrage
applyTheme()

// Forcer l'application du thème immédiatement
setTimeout(() => {
  applyTheme()
  // Initialiser le système de répétition espacée après un délai - DÉSACTIVÉ
  // initializeSpacedRepetition()
  // Mettre à jour les stats après un délai pour s'assurer que tout est chargé
  // updateStats() supprimée - géré par le store
}, 100)
</script>

<style>
/* Message pour mobile */
.mobile-message {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: var(--bg-primary);
  z-index: 9999;
  justify-content: center;
  align-items: center;
}

.mobile-content {
  text-align: center;
  padding: 20px;
  max-width: 400px;
}

.mobile-logo {
  width: 150px;
  height: 50px;
  object-fit: contain;
  margin-bottom: 20px;
}

.mobile-content h1 {
  font-size: 24px;
  color: var(--text-color);
  margin-bottom: 15px;
}

.mobile-content p {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.mobile-features {
  margin-top: 25px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.mobile-features p {
  margin: 8px 0;
  font-size: 14px;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Header avec logo et titre */
.header-logo {
  position: fixed;
  top: 20px;
  left: 0px;
  display: flex;
  align-items: center;
  gap: 0px;
  z-index: 1000;
}

.logo {
  width: 120px;
  height: 40px;
  object-fit: contain;
}

.app-name {
  font-family: 'Montserrat', sans-serif;
  font-size: 24px;
  font-weight: 700;
  font-style: normal;
  color: var(--text-color);
  letter-spacing: 1px;
  opacity: 0.9;
  margin-left: -35px;
}

/* Media queries pour responsive */
@media (max-width: 768px) {
  .mobile-message {
    display: flex;
  }
  
  .container {
    display: none;
  }
}

/* Styles globaux pour le thème */



/* Styles du layout définis dans style.css */

/* Styles pour les paquets de cours */
.packages-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 12px;
}

.package-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.package-card:hover {
  background: var(--bg-tertiary);
  border-color: var(--package-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.package-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--package-color);
  border-radius: 8px;
  color: white;
}

.package-content {
  flex: 1;
}

.package-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.package-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.package-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lesson-count {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-primary);
  padding: 2px 8px;
  border-radius: 12px;
}

/* Styles pour la vue des leçons d'un paquet */
.package-lessons {
  margin-top: 12px;
}

.package-lessons-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.back-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.package-lessons-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
}

.lessons-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lessons-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s;
  margin-bottom: 8px;
  box-shadow: var(--shadow);
  color: var(--text-primary);
}

.lessons-list li:hover {
  background: var(--bg-tertiary);
  transform: translateX(2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.lesson-content {
  flex: 1;
  cursor: pointer;
}

.lesson-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lessons-list li.active {
  border-color: var(--accent-color);
  background: var(--accent-color);
  color: #000;
  box-shadow: 0 4px 12px rgba(64, 251, 220, 0.3);
  font-weight: 700;
}

.lesson-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.lesson-title {
  font-size: 14px;
  font-weight: 500;
  color: inherit;
}

.lesson-difficulty {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.lesson-difficulty.débutant {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success-color);
}

.lesson-difficulty.intermédiaire {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning-color);
}

.lesson-difficulty.avancé {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger-color);
}

/* Styles pour les checkboxes de révisions espacées */
.sr-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.sr-checkbox:hover {
  color: var(--text-primary);
}

.sr-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--accent-color);
}

.sr-checkbox input[type="checkbox"]:checked {
  accent-color: var(--success-color);
}

.sr-label {
  font-size: 11px;
  font-weight: 500;
  user-select: none;
}

/* Responsive pour les modules */
@media (max-width: 1200px) {
  .module-selector {
    width: 100%;
    max-width: 605px;
  }
  
  .spaced-repetition {
    width: 100%;
    max-width: 605px;
  }
}

@media (max-width: 768px) {
  .module-selector {
    padding: 12px;
  }
  
  .module-selector li {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .lesson-title {
    font-size: 13px !important;
  }
  
  .spaced-repetition {
    padding: 12px;
  }
  
  .spaced-repetition h3 {
    font-size: 16px;
  }
  
  .stat-item {
    padding: 8px;
  }
  
  .stat-item .number {
    font-size: 18px;
  }
  
  .stat-item .label {
    font-size: 11px;
  }
  
  .review-item {
    padding: 8px 10px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .module-selector {
    padding: 10px;
  }
  
  .module-selector li {
    padding: 8px 10px;
    font-size: 12px;
  }
  
  .lesson-title {
    font-size: 12px !important;
  }
  
  .spaced-repetition {
    padding: 10px;
  }
  
  .spaced-repetition h3 {
    font-size: 14px;
  }
  
  .stat-item {
    padding: 6px;
  }
  
  .stat-item .number {
    font-size: 16px;
  }
  
  .stat-item .label {
    font-size: 10px;
  }
  
  .review-item {
    padding: 6px 8px;
    font-size: 12px;
  }
}

.spaced-repetition-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.module-selector {
  width: 250px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow);
}

.module-icon .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.bubble-header .titles h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.bubble-header .titles .subtitle {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.module-selector ul {
  list-style: none;
  padding: 0;
  margin: 12px 0 0 0;
}

.module-selector li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
  box-shadow: var(--shadow);
  color: var(--text-primary);
}

.module-selector li:hover {
  background: var(--bg-tertiary);
  transform: translateX(2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.module-selector li.active {
  border-color: var(--accent-color);
  background: var(--accent-color);
  color: #000;
  box-shadow: 0 4px 12px rgba(64, 251, 220, 0.3);
  font-weight: 700;
}

.module-selector li.recommended {
  border-color: var(--success-color);
  background: var(--bg-secondary);
  position: relative;
  box-shadow: var(--shadow);
}

.module-selector li.recommended:hover {
  background: var(--bg-tertiary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.module-selector li.overdue {
  border-color: var(--warning-color);
  background: var(--bg-secondary);
  box-shadow: var(--shadow);
}

.module-selector li.error {
  border-color: var(--danger-color);
  background: var(--bg-secondary);
  box-shadow: var(--shadow);
}

.module-selector .lesson-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.recommended-badge {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
}

/* Styles pour la répétition espacée */
.spaced-repetition-icon .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.spaced-repetition-icon .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.spaced-repetition {
  width: 250px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow);
}

.bubble-header .titles h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.bubble-header .titles .subtitle {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.spaced-repetition h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-item .number {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: var(--accent-color);
}

.stat-item .label {
  font-size: 12px;
  color: var(--text-secondary);
}

.lessons-to-review h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--text-primary);
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 48px;
  box-sizing: border-box;
}

.review-item:hover {
  background: var(--bg-secondary);
  transform: translateX(2px);
}

.review-item.overdue {
  border-color: #dc3545;
  background: #fff5f5;
}

.review-item.error {
  border-color: #ff6b35;
  background: #fff3e0;
}

.review-item.to-review {
  border-color: #ff0000;
  background: linear-gradient(135deg, rgba(255, 0, 0, 0.2) 0%, rgba(255, 0, 0, 0.1) 100%);
  border-left: 5px solid #ff0000;
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
  transform: scale(1.02);
}

.review-item .lesson-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
  margin-right: 8px;
}

.overdue-badge {
  background: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.due-badge {
  background: #ffc107;
  color: #333;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.error-badge {
  background: #ff6b35;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.no-reviews {
  text-align: center;
  padding: 20px 0;
}

.celebration {
  font-size: 32px;
  margin-bottom: 8px;
}

.no-reviews p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

/* Styles pour les boutons de contrôle */
.theme-toggle-btn, .language-toggle-btn, .piece-selector-btn {
  position: fixed;
  top: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  z-index: 1000;
}

.theme-toggle-btn {
  right: 20px;
}

.language-toggle-btn {
  right: 70px; /* Position entre thème et pièces */
}

.piece-selector-btn {
  right: 120px; /* Position à côté du bouton langue */
}

.theme-toggle-btn:hover, .language-toggle-btn:hover, .piece-selector-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-color);
  transform: scale(1.1);
}

.piece-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* Styles pour le sélecteur de pièces */
.piece-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.piece-selector-modal {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.piece-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.piece-selector-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.piece-sets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.piece-set-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.piece-set-card:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.piece-set-card.active {
  border-color: var(--accent-color);
  background: linear-gradient(135deg, rgba(64, 251, 220, 0.1) 0%, rgba(64, 251, 220, 0.05) 100%);
  box-shadow: 0 4px 12px rgba(64, 251, 220, 0.3);
}

.piece-set-preview {
  margin-bottom: 12px;
}

.piece-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  max-width: 120px;
  margin: 0 auto;
}

.piece-preview {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.piece-preview img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.piece-set-info h4 {
  margin: 0 0 4px 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.piece-set-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
}

</style>