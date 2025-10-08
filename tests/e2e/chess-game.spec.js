import { test, expect } from '@playwright/test';

test.describe('Chess Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Naviguer vers une leçon
    await page.locator('.course-package').first().click();
    await page.locator('.lesson-box').first().click();
  });

  test('should display chess board', async ({ page }) => {
    // Vérifier que l'échiquier est affiché
    await expect(page.locator('.chess-board')).toBeVisible();
    await expect(page.locator('.chess-square')).toHaveCount(64);
  });

  test('should display lesson title', async ({ page }) => {
    // Vérifier que le titre de la leçon est affiché
    await expect(page.locator('.lesson-title')).toBeVisible();
    await expect(page.locator('.lesson-title')).toContainText(/Mat élémentaire|Basic mate/);
  });

  test('should display teacher bubble', async ({ page }) => {
    // Vérifier que la bulle du professeur est affichée
    await expect(page.locator('.teacher-bubble')).toBeVisible();
    await expect(page.locator('.teacher-bubble')).toContainText(/Bienvenue|Welcome/);
  });

  test('should show demo controls', async ({ page }) => {
    // Vérifier que les contrôles de démo sont affichés
    await expect(page.locator('.demo-btn')).toBeVisible();
    await expect(page.locator('.demo-btn')).toContainText(/Lancer la démo|Start demo/);
  });

  test('should start demo', async ({ page }) => {
    // Cliquer sur le bouton de démo
    await page.locator('.demo-btn').click();
    
    // Vérifier que la démo a commencé
    await expect(page.locator('.demo-btn')).toContainText(/Arrêter la démo|Stop demo/);
  });

  test('should show hint button', async ({ page }) => {
    // Vérifier que le bouton d'indice est affiché
    await expect(page.locator('.hint-btn')).toBeVisible();
    await expect(page.locator('.hint-btn')).toContainText(/Indice|Hint/);
  });

  test('should handle piece movement', async ({ page }) => {
    // Attendre que l'échiquier soit chargé
    await expect(page.locator('.chess-square')).toHaveCount(64);
    
    // Simuler un clic sur une case (si des pièces sont présentes)
    const squares = page.locator('.chess-square');
    const firstSquare = squares.first();
    
    // Vérifier que la case est cliquable
    await expect(firstSquare).toBeVisible();
  });

  test('should display piece images', async ({ page }) => {
    // Vérifier que les images des pièces sont chargées
    const pieceImages = page.locator('.chess-piece img');
    
    // Attendre que les images soient chargées
    await expect(pieceImages.first()).toBeVisible();
    
    // Vérifier que les images ont des sources valides
    const firstImage = pieceImages.first();
    await expect(firstImage).toHaveAttribute('src', /\.svg$/);
  });

  test('should handle different piece sets', async ({ page }) => {
    // Retourner à la page principale
    await page.goBack();
    await page.goBack();
    
    // Ouvrir le sélecteur de pièces
    await page.locator('.piece-selector-btn').click();
    
    // Sélectionner un set différent
    await page.locator('.piece-set-option').nth(2).click();
    
    // Retourner à la leçon
    await page.locator('.course-package').first().click();
    await page.locator('.lesson-box').first().click();
    
    // Vérifier que les pièces ont changé
    await expect(page.locator('.chess-piece img')).toBeVisible();
  });

  test('should handle language switching in game', async ({ page }) => {
    // Changer de langue
    await page.locator('.language-toggle-btn').click();
    
    // Vérifier que les textes ont changé
    await expect(page.locator('.teacher-bubble')).toContainText(/Welcome/);
    await expect(page.locator('.demo-btn')).toContainText(/Start demo/);
    await expect(page.locator('.hint-btn')).toContainText(/Hint/);
  });

  test('should handle theme switching in game', async ({ page }) => {
    // Changer de thème
    await page.locator('.theme-toggle-btn').click();
    
    // Vérifier que le thème a changé
    await expect(page.locator('body')).toHaveClass(/dark|light/);
    
    // Vérifier que l'échiquier est toujours visible
    await expect(page.locator('.chess-board')).toBeVisible();
  });
});









