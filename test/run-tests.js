#!/usr/bin/env node

/**
 * Script pour lancer les tests de l'application ViteChess
 * 
 * Ce script lance tous les tests et affiche un rapport détaillé
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🧪 ViteChess Test Suite');
console.log('========================\n');

// Vérifier que Vitest est installé
try {
  execSync('npx vitest --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Vitest n\'est pas installé. Installez-le avec: npm install -D vitest');
  process.exit(1);
}

// Lancer les tests
console.log('🚀 Lancement des tests...\n');

try {
  // Lancer tous les tests
  execSync('npx vitest run --reporter=verbose', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ Tous les tests sont passés !');
} catch (error) {
  console.error('\n❌ Certains tests ont échoué');
  process.exit(1);
}

console.log('\n📊 Résumé des tests:');
console.log('- Tests API: Vérification des appels HTTP');
console.log('- Tests Composants: Vérification des composants Vue');
console.log('- Tests Intégration: Vérification du flux complet');
console.log('- Tests Spaced Repetition: Vérification du système Anki');

