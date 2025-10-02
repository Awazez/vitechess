<template>
  <div class="lesson-box">
    <h2>Mat avec la Dame</h2>
    <p>
      🎯 Objectif : Apprendre à mater avec Dame + Roi contre Roi seul.  
      Le but est de coincer le Roi adverse contre le bord de l’échiquier, puis de donner échec et mat.
    </p>

    <p>
      🧩 Étape 1 : La Dame contrôle rangées et colonnes.  
      Place-la pour réduire l’espace de fuite du Roi ennemi.  
      Ne donne pas échec trop vite : ton but est de l’enfermer.
    </p>

    <p>
      🟦 Étape 2 : Le principe du “L de la Dame”.  
      La Dame doit contrôler une rangée entière et une colonne entière.  
      ➡️ Cela forme une barrière en “L” qui limite les mouvements du Roi.
    </p>

    <p>
      🕹️ Étape 3 : Réduis progressivement l’espace.  
      Commence par enfermer le Roi dans un grand carré, puis rapproche le “L” pas à pas.  
      Quand le Roi est au bord, amène ton Roi.
    </p>

    <p>
      ⏹️ Étape 4 : Le mat final.  
      La Dame coupe la dernière rangée, ton Roi soutient, et le mat est forcé.
    </p>

    <p>
      ⚡ À retenir :  
      – Ne donne pas échec inutilement.  
      – Pense à la Dame comme à un mur en L.  
      – Ton Roi doit participer au mat.
    </p>
  </div>
</template>

<style scoped>
.lesson-box {
  max-width: 600px;
  height: 70vh;        /* occupe 70% de l’écran */
  margin: 20px auto;
  padding: 20px;
  overflow-y: auto;    /* active le scroll vertical */
  background: #fdfdfd;
  border: 2px solid #ccc;
  border-radius: 12px;
  line-height: 1.6;
  font-size: 1.1rem;
  color: #333;
}
</style>

