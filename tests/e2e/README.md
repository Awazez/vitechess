# 🎭 ViteChess E2E Test Suite

## 📋 Vue d'ensemble

Cette suite de tests E2E (End-to-End) couvre tous les aspects de l'application ViteChess du point de vue de l'utilisateur final :

- **Tests Application** : Vérification de l'interface utilisateur complète
- **Tests Jeu d'échecs** : Vérification du flux de jeu et des interactions
- **Tests Répétition espacée** : Vérification du système Anki
- **Tests Accessibilité** : Vérification de l'accessibilité et de l'ergonomie
- **Tests Performance** : Vérification des performances et de la réactivité

## 🚀 Lancement des tests

### Prérequis
```bash
# Lancer l'application en mode développement
npm run dev
```

### Tests E2E
```bash
# Tous les tests E2E
npm run test:e2e

# Interface graphique
npm run test:e2e:ui

# Mode debug
npm run test:e2e:debug

# Mode headed (avec navigateur visible)
npm run test:e2e:headed

# Voir le rapport
npm run test:e2e:report
```

### Script personnalisé
```bash
# Script de lancement avec vérifications
node tests/e2e/run-e2e-tests.js
```

## 📊 Types de tests

### 🏠 Tests Application (`app.spec.js`)
- ✅ Chargement de l'application
- ✅ Affichage des paquets de cours
- ✅ Navigation vers les leçons
- ✅ Démarrage d'une leçon
- ✅ Basculement de thème
- ✅ Basculement de langue
- ✅ Ouverture du sélecteur de pièces
- ✅ Changement de set de pièces
- ✅ Design responsive

### ♟️ Tests Jeu d'échecs (`chess-game.spec.js`)
- ✅ Affichage de l'échiquier
- ✅ Affichage du titre de leçon
- ✅ Affichage de la bulle du professeur
- ✅ Contrôles de démo
- ✅ Démarrage de démo
- ✅ Bouton d'indice
- ✅ Gestion des mouvements de pièces
- ✅ Affichage des images de pièces
- ✅ Gestion des différents sets de pièces
- ✅ Basculement de langue dans le jeu
- ✅ Basculement de thème dans le jeu

### 🧠 Tests Répétition espacée (`spaced-repetition.spec.js`)
- ✅ Affichage des statistiques
- ✅ Ajout de leçons à la répétition espacée
- ✅ Retrait de leçons de la répétition espacée
- ✅ Affichage des problèmes à réviser
- ✅ Gestion de la completion
- ✅ Reset de la répétition espacée
- ✅ Traduction des textes
- ✅ Persistance des données

### ♿ Tests Accessibilité (`accessibility.spec.js`)
- ✅ Structure des titres
- ✅ Labels des boutons
- ✅ Navigation au clavier
- ✅ Ratios de contraste
- ✅ Indicateurs de focus
- ✅ Textes alternatifs des images
- ✅ Labels des formulaires
- ✅ Annonces pour lecteurs d'écran
- ✅ Attributs ARIA
- ✅ Responsive pour lecteurs d'écran

### ⚡ Tests Performance (`performance.spec.js`)
- ✅ Temps de chargement
- ✅ Core Web Vitals
- ✅ Interactions rapides
- ✅ Gestion des gros datasets
- ✅ Efficacité mémoire
- ✅ Gestion des délais réseau
- ✅ Utilisateurs concurrents
- ✅ Chargement des ressources

## 🔧 Configuration

### Playwright
- **Navigateurs** : Chromium, Firefox, WebKit
- **Mobile** : Chrome Mobile, Safari Mobile
- **Base URL** : http://localhost:5174
- **Timeout** : 30 secondes
- **Retry** : 2 tentatives en CI

### Serveur de développement
- **Commande** : `npm run dev`
- **URL** : http://localhost:5174
- **Reuse** : Serveur existant réutilisé
- **Timeout** : 120 secondes

## 📁 Structure des tests

```
tests/e2e/
├── app.spec.js              # Tests application
├── chess-game.spec.js       # Tests jeu d'échecs
├── spaced-repetition.spec.js # Tests répétition espacée
├── accessibility.spec.js    # Tests accessibilité
├── performance.spec.js      # Tests performance
├── run-e2e-tests.js         # Script de lancement
└── README.md                # Ce fichier
```

## 🎯 Couverture des fonctionnalités

### ✅ Fonctionnalités testées

1. **Interface utilisateur**
   - Chargement et affichage
   - Navigation entre les pages
   - Basculement de thème/langue
   - Sélecteur de pièces
   - Design responsive

2. **Jeu d'échecs**
   - Affichage de l'échiquier
   - Interactions avec les pièces
   - Système de démo
   - Système d'indices
   - Gestion des sets de pièces

3. **Système de répétition espacée**
   - Ajout/retrait de leçons
   - Affichage des statistiques
   - Gestion des problèmes
   - Persistance des données
   - Reset du système

4. **Accessibilité**
   - Navigation au clavier
   - Lecteurs d'écran
   - Contraste des couleurs
   - Structure sémantique
   - Attributs ARIA

5. **Performance**
   - Temps de chargement
   - Core Web Vitals
   - Gestion mémoire
   - Interactions rapides
   - Chargement des ressources

## 🐛 Dépannage

### Erreurs courantes

1. **Application non lancée**
   ```bash
   # Lancer l'application
   npm run dev
   ```

2. **Tests qui échouent**
   ```bash
   # Mode debug pour voir ce qui se passe
   npm run test:e2e:debug
   ```

3. **Problèmes de navigateur**
   ```bash
   # Réinstaller les navigateurs
   npx playwright install
   ```

4. **Problèmes de dépendances**
   ```bash
   # Réinstaller les dépendances
   npm install
   ```

## 📈 Métriques

- **Tests totaux** : 50+ tests E2E
- **Navigateurs** : 5 (Chrome, Firefox, Safari, Chrome Mobile, Safari Mobile)
- **Temps d'exécution** : ~5-10 minutes
- **Couverture** : Interface complète, flux utilisateur, accessibilité, performance

## 🚀 Prochaines étapes

1. **Tests de charge** : Tests avec de nombreux utilisateurs
2. **Tests de sécurité** : Tests de sécurité de l'application
3. **Tests de compatibilité** : Tests sur différents navigateurs
4. **Tests de régression** : Tests automatisés en CI/CD

## 📚 Ressources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test](https://playwright.dev/docs/test-intro)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [Performance Testing](https://playwright.dev/docs/test-performance)
- [Mobile Testing](https://playwright.dev/docs/test-mobile)




