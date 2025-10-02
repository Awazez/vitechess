<template>
  <div class="container">
    <!-- Module actif (dynamique) -->
    <LessonModule
      :title="currentLesson.title"
      :initialFen="currentLesson.fen"
      :scriptedMoves="Array.isArray(currentLesson.scripted) ? currentLesson.scripted : []"
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
    title: "Mat élémentaire, l'escalier : Roi et deux dames contre roi",
    fen: "8/8/8/4k3/8/8/8/2K3QQ w - - 0 1",
    scripted: [
      { from: "g1", to: "g4", comment: "La Dame attaque réduit l'espace du Roi noir" },
      { from: "e5", to: "d6", comment: "Le Roi noir fuit latéralement" },
      { from: "h1", to: "h5", comment: "La deuxième dame le rejoins" },
      { from: "d6", to: "c6", comment: "Le Roi noir continue vers le bord" },
      { from: "g4", to: "g6", comment: "La Dame maintient la pression" },
      { from: "c6", to: "d7", comment: "Montée vers la bande" },
      { from: "h5", to: "h7", comment: "Votre Roi progresse" },
      { from: "d7", to: "d8", comment: "Le Roi noir oscille" },
      { from: "g6", to: "g8", comment: "✓ Échec et mat !"},
    ]
  },
  {
    title: "Mat élémentaire : Mat avec la Tour",
    fen: "8/8/3k4/8/8/8/4K3/7R w - - 0 1",
    scripted: [
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
  },
  {
    title: "Mat élémentaire : Mat avec deux Tours",
    fen: "4k3/8/8/8/8/8/8/R3K2R w - - 0 1",
    scripted: [
      { from: "a1", to: "a8", comment: "Première Tour bloque sur la 8ème rangée" },
      { from: "e8", to: "d7", comment: "Le Roi noir descend" },
      { from: "h1", to: "h7", comment: "Deuxième Tour coupe sur la 7ème" },
      { from: "d7", to: "d6", comment: "Le Roi continue de descendre" },
      { from: "a8", to: "b8", comment: "La Tour glisse pour garder le contrôle" },
      { from: "d6", to: "c5", comment: "Tentative de fuite" },
      { from: "h7", to: "h5", comment: "Coupure sur la 5ème rangée" },
      { from: "c5", to: "c4", comment: "Le Roi noir descend encore" },
      { from: "b8", to: "b4", comment: "Attaque directe" },
      { from: "c4", to: "c3", comment: "Descente forcée" },
      { from: "h5", to: "h3", comment: "L'échelle se resserre" },
      { from: "c3", to: "c2", comment: "Avant-dernière rangée" },
      { from: "b4", to: "b2", comment: "Pression maximale" },
      { from: "c2", to: "c1", comment: "Le Roi est acculé" },
      { from: "e1", to: "d2", comment: "Votre Roi s'approche" },
      { from: "c1", to: "d1", comment: "Plus aucune fuite" },
      { from: "h3", to: "h1", comment: "✓ Mat ! Technique de l'échelle parfaite" }
    ]
  },
  {
    title: "Mat élémentaire : Mat avec les deux Fous",
    fen: "8/8/8/8/4k3/8/3B4/2B1K3 w - - 0 1",
    scripted: [
      { from: "e1", to: "d2", comment: "Activez votre Roi vers le centre" },
      { from: "e4", to: "d5", comment: "Le Roi noir se déplace" },
      { from: "c1", to: "e3", comment: "Le Fou contrôle les cases noires" },
      { from: "d5", to: "c4", comment: "Tentative de fuite" },
      { from: "d2", to: "b4", comment: "Fou blanc force le Roi vers le bord" },
      { from: "c4", to: "b5", comment: "Le Roi noir va vers l'aile" },
      { from: "d2", to: "c3", comment: "Votre Roi suit le mouvement" },
      { from: "b5", to: "a5", comment: "Poussé vers le coin" },
      { from: "e3", to: "c5", comment: "Le Fou noir bloque la colonne" },
      { from: "a5", to: "a4", comment: "Descente forcée" },
      { from: "c3", to: "b2", comment: "Le Roi blanc accompagne" },
      { from: "a4", to: "a5", comment: "Oscillation du Roi noir" },
      { from: "b4", to: "c3", comment: "Les Fous créent un filet" },
      { from: "a5", to: "a6", comment: "Montée vers le bord" },
      { from: "b2", to: "b3", comment: "Le Roi blanc progresse" },
      { from: "a6", to: "a7", comment: "Avant-dernière rangée" },
      { from: "c5", to: "d6", comment: "Le Fou noir se repositionne" },
      { from: "a7", to: "a8", comment: "Le Roi noir est acculé dans le coin" },
      { from: "b3", to: "b4", comment: "Votre Roi s'approche pour le mat" },
      { from: "a8", to: "a7", comment: "Seul coup possible" },
      { from: "c3", to: "b2", comment: "Le Fou blanc contrôle" },
      { from: "a7", to: "a8", comment: "Retour forcé dans le coin" },
      { from: "d6", to: "c7", comment: "✓ Mat ! Les deux Fous dominent" }
    ]
  },
  {
    title: "Mat élémentaire : Mat avec Fou et Cavalier",
    fen: "8/8/8/8/4k3/8/3N4/2B1K3 w - - 0 1",
    scripted: [
      { from: "e1", to: "d2", comment: "Activez votre Roi" },
      { from: "e4", to: "d5", comment: "Le Roi noir au centre" },
      { from: "c1", to: "f4", comment: "Le Fou contrôle les diagonales" },
      { from: "d5", to: "c4", comment: "Le Roi noir tente de fuir" },
      { from: "d2", to: "b3", comment: "Cavalier force vers le bord" },
      { from: "c4", to: "b5", comment: "Poussé vers l'aile" },
      { from: "d2", to: "c3", comment: "Votre Roi accompagne" },
      { from: "b5", to: "a6", comment: "Vers le coin" },
      { from: "f4", to: "d6", comment: "Le Fou bloque les cases" },
      { from: "a6", to: "a7", comment: "Montée forcée" },
      { from: "b3", to: "c5", comment: "Le Cavalier crée le filet" },
      { from: "a7", to: "a8", comment: "Dans le coin !" },
      { from: "c3", to: "b4", comment: "Le Roi blanc s'approche" },
      { from: "a8", to: "b8", comment: "Fuite latérale" },
      { from: "d6", to: "c7", comment: "Le Fou contrôle c7" },
      { from: "b8", to: "a8", comment: "Retour forcé" },
      { from: "b4", to: "b5", comment: "Le Roi blanc progresse" },
      { from: "a8", to: "b8", comment: "Oscillation" },
      { from: "c5", to: "a6", comment: "Le Cavalier se repositionne" },
      { from: "b8", to: "a8", comment: "Retour dans le coin" },
      { from: "b5", to: "b6", comment: "Opposition du Roi" },
      { from: "a8", to: "b8", comment: "Dernier mouvement" },
      { from: "a6", to: "c7", comment: "✓ Mat ! Coordination Fou + Cavalier parfaite" }
    ]
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






