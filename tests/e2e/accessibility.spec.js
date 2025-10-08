import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper heading structure', async ({ page }) => {
    // Vérifier que les titres sont bien structurés
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Vérifier qu'il n'y a qu'un seul h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('should have proper button labels', async ({ page }) => {
    // Vérifier que les boutons ont des labels appropriés
    await expect(page.locator('.theme-toggle-btn')).toHaveAttribute('aria-label');
    await expect(page.locator('.language-toggle-btn')).toHaveAttribute('aria-label');
    await expect(page.locator('.piece-selector-btn')).toHaveAttribute('aria-label');
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tester la navigation au clavier
    await page.keyboard.press('Tab');
    await expect(page.locator('.theme-toggle-btn')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('.language-toggle-btn')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('.piece-selector-btn')).toBeFocused();
  });

  test('should have proper contrast ratios', async ({ page }) => {
    // Vérifier que les éléments ont un contraste suffisant
    const themeButton = page.locator('.theme-toggle-btn');
    await expect(themeButton).toBeVisible();
    
    // Vérifier que le bouton est visible (contraste suffisant)
    const buttonColor = await themeButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color
      };
    });
    
    expect(buttonColor.backgroundColor).not.toBe('transparent');
    expect(buttonColor.color).not.toBe('transparent');
  });

  test('should have proper focus indicators', async ({ page }) => {
    // Tester les indicateurs de focus
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Vérifier que l'élément focalisé a un indicateur de focus
    const focusStyles = await focusedElement.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        outline: style.outline,
        boxShadow: style.boxShadow
      };
    });
    
    expect(focusStyles.outline).not.toBe('none');
  });

  test('should have proper alt text for images', async ({ page }) => {
    // Vérifier que les images ont des alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    // Ouvrir le sélecteur de pièces
    await page.locator('.piece-selector-btn').click();
    
    // Vérifier que les options ont des labels
    const pieceOptions = page.locator('.piece-set-option');
    const optionCount = await pieceOptions.count();
    
    for (let i = 0; i < optionCount; i++) {
      const option = pieceOptions.nth(i);
      const text = await option.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('should handle screen reader announcements', async ({ page }) => {
    // Vérifier que les changements d'état sont annoncés
    await page.locator('.language-toggle-btn').click();
    
    // Vérifier que le changement de langue est visible
    await expect(page.locator('h1')).toContainText(/Available Modules|Modules disponibles/);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    // Vérifier les attributs ARIA
    await expect(page.locator('.piece-selector-modal')).toHaveAttribute('role', 'dialog');
    await expect(page.locator('.piece-selector-modal')).toHaveAttribute('aria-modal', 'true');
  });

  test('should be responsive for screen readers', async ({ page }) => {
    // Vérifier que l'application fonctionne avec des tailles d'écran réduites
    await page.setViewportSize({ width: 320, height: 568 });
    
    // Vérifier que tous les éléments sont accessibles
    await expect(page.locator('.course-package')).toBeVisible();
    await expect(page.locator('.theme-toggle-btn')).toBeVisible();
    await expect(page.locator('.language-toggle-btn')).toBeVisible();
    await expect(page.locator('.piece-selector-btn')).toBeVisible();
  });
});








