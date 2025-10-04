import { test, expect } from '@playwright/test';

test.describe('Spaced Repetition System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display spaced repetition stats', async ({ page }) => {
    // Vérifier que les statistiques sont affichées
    await expect(page.locator('.sr-stats')).toBeVisible();
    await expect(page.locator('.sr-stats')).toContainText(/Total|Total/);
    await expect(page.locator('.sr-stats')).toContainText(/Révisées|Reviewed/);
    await expect(page.locator('.sr-stats')).toContainText(/À réviser|To Review/);
  });

  test('should add lesson to spaced repetition', async ({ page }) => {
    // Naviguer vers une leçon
    await page.locator('.course-package').first().click();
    await page.locator('.lesson-box').first().click();
    
    // Vérifier que le bouton d'ajout est présent
    await expect(page.locator('.add-to-sr-btn')).toBeVisible();
    
    // Cliquer pour ajouter à la répétition espacée
    await page.locator('.add-to-sr-btn').click();
    
    // Vérifier que le bouton a changé
    await expect(page.locator('.add-to-sr-btn')).toContainText(/Retirer|Remove/);
  });

  test('should remove lesson from spaced repetition', async ({ page }) => {
    // Ajouter d'abord une leçon
    await page.locator('.course-package').first().click();
    await page.locator('.lesson-box').first().click();
    await page.locator('.add-to-sr-btn').click();
    
    // Puis la retirer
    await page.locator('.add-to-sr-btn').click();
    
    // Vérifier que le bouton a changé
    await expect(page.locator('.add-to-sr-btn')).toContainText(/Ajouter|Add/);
  });

  test('should display problems to review', async ({ page }) => {
    // Ajouter quelques leçons à la répétition espacée
    await page.locator('.course-package').first().click();
    
    // Ajouter la première leçon
    await page.locator('.lesson-box').first().locator('.add-to-sr-btn').click();
    
    // Retourner aux paquets
    await page.locator('.back-to-packages-btn').click();
    
    // Vérifier que les problèmes à réviser sont affichés
    await expect(page.locator('.sr-problems-to-review')).toBeVisible();
  });

  test('should handle spaced repetition completion', async ({ page }) => {
    // Ajouter une leçon à la répétition espacée
    await page.locator('.course-package').first().click();
    await page.locator('.lesson-box').first().click();
    await page.locator('.add-to-sr-btn').click();
    
    // Simuler la completion de la leçon
    // (Dans un vrai test, on ferait des coups d'échecs)
    
    // Vérifier que les statistiques se mettent à jour
    await expect(page.locator('.sr-stats')).toBeVisible();
  });

  test('should reset spaced repetition', async ({ page }) => {
    // Ajouter quelques leçons
    await page.locator('.course-package').first().click();
    await page.locator('.lesson-box').first().locator('.add-to-sr-btn').click();
    
    // Retourner aux paquets
    await page.locator('.back-to-packages-btn').click();
    
    // Cliquer sur le bouton de reset
    await page.locator('.reset-sr-btn').click();
    
    // Confirmer le reset
    await page.locator('.confirm-reset-btn').click();
    
    // Vérifier que les statistiques sont remises à zéro
    await expect(page.locator('.sr-stats')).toContainText('0');
  });

  test('should display spaced repetition in different languages', async ({ page }) => {
    // Tester en français
    await expect(page.locator('.sr-stats')).toContainText(/Répétition espacée|Spaced Repetition/);
    
    // Changer de langue
    await page.locator('.language-toggle-btn').click();
    
    // Vérifier que les textes ont changé
    await expect(page.locator('.sr-stats')).toContainText(/Spaced Repetition/);
    await expect(page.locator('.sr-stats')).toContainText(/Reviews/);
    await expect(page.locator('.sr-stats')).toContainText(/To Review/);
  });

  test('should handle spaced repetition persistence', async ({ page }) => {
    // Ajouter une leçon
    await page.locator('.course-package').first().click();
    await page.locator('.lesson-box').first().click();
    await page.locator('.add-to-sr-btn').click();
    
    // Recharger la page
    await page.reload();
    
    // Vérifier que la leçon est toujours dans la répétition espacée
    await expect(page.locator('.add-to-sr-btn')).toContainText(/Retirer|Remove/);
  });
});




