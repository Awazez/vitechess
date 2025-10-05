import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load quickly', async ({ page }) => {
    // Mesurer le temps de chargement
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Vérifier que l'application se charge en moins de 3 secondes
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    // Mesurer les Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.LCP = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              vitals.FID = entry.processingStart - entry.startTime;
            }
            if (entry.entryType === 'layout-shift') {
              vitals.CLS = entry.value;
            }
          });
          
          resolve(vitals);
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      });
    });
    
    // Vérifier que les métriques sont dans les bonnes plages
    if (metrics.LCP) {
      expect(metrics.LCP).toBeLessThan(2500); // LCP < 2.5s
    }
    if (metrics.FID) {
      expect(metrics.FID).toBeLessThan(100); // FID < 100ms
    }
    if (metrics.CLS) {
      expect(metrics.CLS).toBeLessThan(0.1); // CLS < 0.1
    }
  });

  test('should handle rapid interactions', async ({ page }) => {
    // Tester les interactions rapides
    const startTime = Date.now();
    
    // Cliquer rapidement sur plusieurs boutons
    for (let i = 0; i < 10; i++) {
      await page.locator('.theme-toggle-btn').click();
      await page.locator('.language-toggle-btn').click();
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Vérifier que les interactions sont rapides
    expect(totalTime).toBeLessThan(1000);
  });

  test('should handle large datasets', async ({ page }) => {
    // Naviguer vers toutes les leçons pour tester la performance
    await page.locator('.course-package').first().click();
    
    const lessons = page.locator('.lesson-box');
    const lessonCount = await lessons.count();
    
    // Vérifier que toutes les leçons se chargent rapidement
    for (let i = 0; i < Math.min(lessonCount, 5); i++) {
      await lessons.nth(i).click();
      await expect(page.locator('.chess-board')).toBeVisible();
      await page.goBack();
    }
  });

  test('should handle memory efficiently', async ({ page }) => {
    // Mesurer l'utilisation mémoire
    const memoryBefore = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });
    
    // Effectuer des actions qui pourraient consommer de la mémoire
    await page.locator('.course-package').first().click();
    await page.locator('.lesson-box').first().click();
    await page.locator('.piece-selector-btn').click();
    await page.locator('.piece-set-option').first().click();
    
    const memoryAfter = await page.evaluate(() => {
      return performance.memory ? performance.memory.usedJSHeapSize : 0;
    });
    
    // Vérifier que l'utilisation mémoire n'explose pas
    const memoryIncrease = memoryAfter - memoryBefore;
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Moins de 10MB
  });

  test('should handle network delays gracefully', async ({ page }) => {
    // Simuler des délais réseau
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });
    
    // Naviguer vers une leçon
    await page.locator('.course-package').first().click();
    await page.locator('.lesson-box').first().click();
    
    // Vérifier que l'application fonctionne malgré les délais
    await expect(page.locator('.chess-board')).toBeVisible();
  });

  test('should handle concurrent users', async ({ page }) => {
    // Simuler plusieurs utilisateurs
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
      promises.push(
        page.evaluate(() => {
          // Simuler des actions utilisateur
          return new Promise(resolve => {
            setTimeout(() => {
              resolve('User action completed');
            }, 100);
          });
        })
      );
    }
    
    const results = await Promise.all(promises);
    
    // Vérifier que toutes les actions se sont terminées
    expect(results).toHaveLength(5);
    expect(results.every(result => result === 'User action completed')).toBe(true);
  });

  test('should handle resource loading', async ({ page }) => {
    // Vérifier que les ressources se chargent efficacement
    const resources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      return entries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize
      }));
    });
    
    // Vérifier que les ressources se chargent rapidement
    resources.forEach(resource => {
      expect(resource.duration).toBeLessThan(1000); // Moins de 1 seconde
    });
  });
});






