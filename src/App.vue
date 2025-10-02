<template>
  <div class="container">
    <!-- Module actif (dynamique) -->
    <LessonModule
      :title="currentLesson.title"
      :initialFen="currentLesson.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'"
      :scriptedMoves="Array.isArray(currentLesson.scripted) ? currentLesson.scripted : []"
      :scriptedPgn="typeof currentLesson.scripted === 'string' ? currentLesson.scripted : ''"
    />
    
    <!-- Sélecteur de modules -->
    <div class="module-selector">
      <h3>📚 Modules disponibles</h3>
      <ul>
        <li
          v-for="lesson in lessons"
          :key="lesson.title"
          :class="{ active: lesson.title === currentLesson.title }"
          @click="currentLesson = lesson"
        >
          {{ lesson.title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import LessonModule from "./components/Lesson/LessonModule.vue"
import kingRookVsKingPgn from "./assets/pgn/king_rook_vs_king.pgn?raw"
import kingQueenVsKingPgn from "./assets/pgn/king_queen_vs_king.pgn?raw"
import king2RookVsKingPgn from "./assets/pgn/king_2rook_vs_king.pgn?raw"

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

const lessons = [
  {
    title: kqHeaders.title || "Leçon PGN 1",
    scripted: kingQueenVsKingPgn
  },

  {
    title: rookHeaders.title || "Leçon PGN 2",
    scripted: kingRookVsKingPgn
  },

  {
    title: twoRookHeaders.title || "Leçon PGN 3",
    scripted: king2RookVsKingPgn
  }
];

const currentLesson = ref(lessons[0])
</script>

<style scoped>
.container {
  display: flex;
  gap: 40px;
  justify-content: center;
  align-items: flex-start;
  margin-top: 40px;
}

.module-selector {
  width: 250px;
  background: #fafafa;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.module-selector h3 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.module-selector ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.module-selector li {
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: #f5f5f5;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.module-selector li:hover {
  background: #e0e0e0;
  transform: translateX(2px);
}

.module-selector li.active {
  background: #d1e7ff;
  font-weight: 600;
  border: 1px solid #90caf9;
}
</style>