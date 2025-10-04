import { test, expect } from '@playwright/test';

test.describe('ViteChess Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application', async ({ page }) => {
    // Vérifier que l'application se charge
    await expect(page).toHaveTitle(/ViteChess/);
    
    // Vérifier que les éléments principaux sont présents
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.theme-toggle-btn')).toBeVisible();
    await expect(page.locator('.language-toggle-btn')).toBeVisible();
    await expect(page.locator('.piece-selector-btn')).toBeVisible();
  });

  test('should display course packages', async ({ page }) => {
    // Vérifier que les paquets de cours sont affichés
    await expect(page.locator('.course-package')).toBeVisible();
    await expect(page.locator('.course-package').first()).toContainText('Finales élémentaires');
  });

  test('should navigate to lessons', async ({ page }) => {
    // Cliquer sur le premier paquet
    await page.locator('.course-package').first().click();
    
    // Vérifier que les leçons sont affichées
    await expect(page.locator('.lesson-box')).toBeVisible();
    await expect(page.locator('.back-to-packages-btn')).toBeVisible();
  });

  test('should start a lesson', async ({ page }) => {
    // Naviguer vers une leçon
    await page.locator('.course-package').first().click();
    await page.locator('.lesson-box').first().click();
    
    // Vérifier que l'échiquier est affiché
    await expect(page.locator('.chess-board')).toBeVisible();
    await expect(page.locator('.lesson-title')).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    // Vérifier le bouton de thème
    const themeButton = page.locator('.theme-toggle-btn');
    await expect(themeButton).toBeVisible();
    
    // Cliquer pour changer de thème
    await themeButton.click();
    
    // Vérifier que le thème a changé (vérification du body class)
    await expect(page.locator('body')).toHaveClass(/dark|light/);
  });

  test('should toggle language', async ({ page }) => {
    // Vérifier le bouton de langue
    const languageButton = page.locator('.language-toggle-btn');
    await expect(languageButton).toBeVisible();
    
    // Cliquer pour changer de langue
    await languageButton.click();
    
    // Vérifier que la langue a changé
    await expect(page.locator('h1')).toContainText(/Available Modules|Modules disponibles/);
  });

  test('should open piece selector', async ({ page }) => {
    // Vérifier le bouton de sélection des pièces
    const pieceButton = page.locator('.piece-selector-btn');
    await expect(pieceButton).toBeVisible();
    
    // Cliquer pour ouvrir le sélecteur
    await pieceButton.click();
    
    // Vérifier que le modal est ouvert
    await expect(page.locator('.piece-selector-modal')).toBeVisible();
    await expect(page.locator('.piece-set-option')).toBeVisible();
  });

  test('should change piece set', async ({ page }) => {
    // Ouvrir le sélecteur de pièces
    await page.locator('.piece-selector-btn').click();
    
    // Sélectionner un nouveau set
    await page.locator('.piece-set-option').nth(1).click();
    
    // Vérifier que le modal se ferme
    await expect(page.locator('.piece-selector-modal')).not.toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Tester sur mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Vérifier que l'application fonctionne sur mobile
    await expect(page.locator('.course-package')).toBeVisible();
    await expect(page.locator('.theme-toggle-btn')).toBeVisible();
  });
});




