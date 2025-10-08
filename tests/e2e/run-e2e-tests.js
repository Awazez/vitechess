#!/usr/bin/env node

/**
 * Script pour lancer les tests E2E de ViteChess
 * 
 * Ce script lance tous les tests E2E et affiche un rapport détaillé
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🧪 ViteChess E2E Test Suite');
console.log('============================\n');

// Vérifier que Playwright est installé
try {
  execSync('npx playwright --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Playwright n\'est pas installé. Installez-le avec: npm install -D @playwright/test');
  process.exit(1);
}

// Vérifier que l'application est en cours d'exécution
console.log('🔍 Vérification que l\'application est en cours d\'exécution...');
try {
  execSync('curl -s http://localhost:5174 > /dev/null', { stdio: 'pipe' });
  console.log('✅ Application détectée sur http://localhost:5174');
} catch (error) {
  console.error('❌ L\'application n\'est pas en cours d\'exécution. Lancez d\'abord: npm run dev');
  process.exit(1);
}

// Lancer les tests E2E
console.log('🚀 Lancement des tests E2E...\n');

try {
  // Lancer tous les tests E2E
  execSync('npx playwright test', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ Tous les tests E2E sont passés !');
} catch (error) {
  console.error('\n❌ Certains tests E2E ont échoué');
  console.log('\n📊 Pour voir le rapport détaillé: npm run test:e2e:report');
  process.exit(1);
}

console.log('\n📊 Résumé des tests E2E:');
console.log('- Tests Application: Vérification de l\'interface utilisateur');
console.log('- Tests Jeu d\'échecs: Vérification du flux de jeu');
console.log('- Tests Répétition espacée: Vérification du système Anki');
console.log('- Tests Accessibilité: Vérification de l\'accessibilité');
console.log('- Tests Performance: Vérification des performances');








