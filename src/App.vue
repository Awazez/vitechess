<template>
  <div class="container">
    <!-- Module actif (dynamique) -->
    <LessonModule
      :title="currentLesson.title"
      :initialFen="currentLesson.fen"
      :scripted="currentLesson.scripted"
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

const lessons = [
  {
    title: "Mat élémentaire : Mat avec la Dame",
    fen: "8/8/3k4/8/4Q3/8/4K3/8 w - - 0 1",
    scripted: false // Mode libre
  },
  {
    title: "Mat élémentaire : Mat avec la Tour",
    fen: "8/8/3k4/8/8/8/4K3/7R w - - 0 1",
    scripted: [
      // Exemple de finale Tour + Roi vs Roi
      { from: "h1", to: "h6", comment: "Coupez le roi adverse sur la 6ème rangée" },
      { from: "d6", to: "d5", comment: "Les Noirs tentent de s'échapper" },
      { from: "e2", to: "e3", comment: "Activez votre Roi pour l'accompagner" },
      { from: "d5", to: "e5", comment: "Le Roi noir cherche le centre" },
      { from: "h6", to: "h5", comment: "Réduisez l'espace du Roi adverse" },
      { from: "e5", to: "d6", comment: "Approche du Roi noir" },
      { from: "e3", to: "e4", comment: "Opposition : approchez votre Roi" },
      { from: "d6", to: "c6", comment: "Fuite latérale" },
      { from: "h5", to: "h6", comment: "Maintenez la pression" },
      { from: "c6", to: "d7", comment: "Retour en arrière" },
      { from: "e4", to: "e5", comment: "Prenez l'opposition" },
      { from: "d7", to: "c7", comment: "Fuite sur l'aile" },
      { from: "h6", to: "h7", comment: "Poussez le Roi sur la bande" },
      { from: "c7", to: "d8", comment: "Acculé !" },
      { from: "e5", to: "e6", comment: "Opposition finale" },
      { from: "d8", to: "c8", comment: "Dernière case" },
      { from: "h7", to: "h8", comment: "✓ Échec et mat !" }
    ]
  }
]

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






