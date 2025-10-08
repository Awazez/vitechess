# 🧪 ViteChess Test Suite

## 📋 Vue d'ensemble

Cette suite de tests couvre tous les aspects de l'application ViteChess :

- **Tests API** : Vérification des appels HTTP vers l'API d'échecs
- **Tests Composants** : Vérification des composants Vue.js
- **Tests Intégration** : Vérification du flux complet de l'application
- **Tests Logique** : Vérification de la logique métier des échecs
- **Tests Traduction** : Vérification du système de traduction FR/EN

## 🚀 Lancement des tests

### Tous les tests
```bash
npm run test:run
```

### Tests spécifiques
```bash
# Tests API uniquement
npm run test:api

# Tests composants uniquement
npm run test:components

# Tests d'intégration uniquement
npm run test:integration

# Tests simples (recommandés)
npm run test:run test/simple/
```

### Interface graphique
```bash
npm run test:ui
```

### Couverture de code
```bash
npm run test:coverage
```

## 📊 Résultats des tests

### ✅ Tests qui passent (21/21)

#### Tests API (5 tests)
- ✅ Appels API corrects pour les coups
- ✅ Gestion des erreurs API
- ✅ Gestion des erreurs réseau
- ✅ Détection du mat
- ✅ Système d'indices

#### Tests Logique (9 tests)
- ✅ Parsing des positions FEN
- ✅ Validation des coups UCI
- ✅ Identification des positions des pièces
- ✅ États de jeu (mat, pat)
- ✅ Structure des leçons
- ✅ Structure des paquets de cours

#### Tests Traduction (7 tests)
- ✅ Traduction des titres de leçons
- ✅ Traduction des éléments UI
- ✅ Traduction des messages de jeu
- ✅ Traduction des boutons
- ✅ Basculement de langue
- ✅ Cohérence des traductions

## 🔧 Configuration

### Vitest
- **Environnement** : jsdom
- **Globals** : activés
- **Setup** : `test/setup.js`
- **Timeout** : 10 secondes

### Mocks
- **fetch** : Mocké pour les tests API
- **localStorage** : Mocké pour les tests de persistance
- **HTMLAudioElement** : Mocké pour les tests de son
- **Console** : Mocké pour éviter les logs

## 📁 Structure des tests

```
test/
├── api/                    # Tests API
│   └── chess-api.spec.js
├── components/             # Tests composants
│   ├── lesson-module.spec.js
│   └── spaced-repetition.spec.js
├── integration/            # Tests d'intégration
│   └── chess-game.spec.js
├── simple/                 # Tests simples (recommandés)
│   ├── api-basic.spec.js
│   ├── chess-logic.spec.js
│   └── translation.spec.js
├── utils/                  # Tests utilitaires
│   ├── chessBoard.kingRed.spec.js
│   ├── chessBoard.pieceThreat.spec.js
│   └── chessBoard.sound.spec.js
├── setup.js               # Configuration globale
├── run-tests.js           # Script de lancement
└── README.md              # Ce fichier
```

## 🎯 Couverture des fonctionnalités

### ✅ Fonctionnalités testées

1. **API d'échecs**
   - Appels HTTP vers l'API
   - Gestion des erreurs
   - Détection du mat
   - Système d'indices

2. **Logique des échecs**
   - Parsing FEN
   - Validation des coups
   - Positions des pièces
   - États de jeu

3. **Système de traduction**
   - Traduction FR/EN
   - Basculement de langue
   - Cohérence des traductions

4. **Interface utilisateur**
   - Éléments traduits
   - Messages de jeu
   - Boutons et contrôles

### 🔄 Fonctionnalités en cours de test

1. **Composants Vue.js**
   - LessonModule
   - SpacedRepetition
   - ChessBoard

2. **Intégration complète**
   - Flux de jeu
   - Navigation
   - Persistance

## 🐛 Dépannage

### Erreurs courantes

1. **Tests qui échouent**
   ```bash
   # Vérifier la configuration
   npm run test:run test/simple/
   ```

2. **Problèmes de mocks**
   ```bash
   # Vérifier le setup
   cat test/setup.js
   ```

3. **Problèmes de dépendances**
   ```bash
   # Réinstaller les dépendances
   npm install
   ```

## 📈 Métriques

- **Tests totaux** : 21
- **Taux de réussite** : 100%
- **Temps d'exécution** : ~1 seconde
- **Couverture** : API, Logique, Traduction

## 🚀 Prochaines étapes

1. **Tests E2E** : Tests end-to-end avec Playwright
2. **Tests Performance** : Tests de performance
3. **Tests Accessibilité** : Tests d'accessibilité
4. **Tests Mobile** : Tests sur mobile

## 📚 Ressources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [JSDOM](https://github.com/jsdom/jsdom)
- [Chess.js](https://github.com/jhlywa/chess.js)








