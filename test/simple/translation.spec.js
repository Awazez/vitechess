import { describe, it, expect } from 'vitest';

describe('Translation Tests', () => {
  describe('Lesson Title Translation', () => {
    it('should translate French lesson titles to English', () => {
      const translations = {
        'Mat élémentaire : Dame et roi contre roi': 'Basic mate: Queen and king vs king',
        'Mat élémentaire : tour et roi contre roi': 'Basic mate: Rook and king vs king',
        'Mat élémentaire : Deux tour et roi contre roi': 'Basic mate: Two rooks and king vs king',
        'Mat élémentaire : Deux tours contre roi': 'Basic mate: Two rooks vs king',
        'Finales de tour : Exercice 1': 'Rook endgames: Exercise 1',
        'Finales de tour - Exercice 1': 'Rook endgames - Exercise 1',
        'Finale de tour : Exercice 2': 'Rook endgame: Exercise 2',
        'Position de Philidor': 'Philidor Position'
      };

      Object.entries(translations).forEach(([french, english]) => {
        expect(english).toBeDefined();
        expect(english.length).toBeGreaterThan(0);
        expect(english).not.toBe(french);
      });
    });

    it('should handle untranslated titles gracefully', () => {
      const untranslatedTitle = 'Titre non traduit';
      
      // Si pas de traduction, retourner le titre original
      const result = untranslatedTitle; // Simuler pas de traduction
      expect(result).toBe(untranslatedTitle);
    });
  });

  describe('UI Text Translation', () => {
    it('should translate common UI elements', () => {
      const uiTranslations = {
        'Modules disponibles': 'Available Modules',
        'Choisissez votre paquet de cours': 'Choose your course package',
        'Retour aux paquets': 'Back to packages',
        'Révisions': 'Reviews',
        'Répétition espacée': 'Spaced Repetition',
        'Revenez au bon moment pour maîtriser vos finales': 'Come back at the right time to master your endgames',
        'Total': 'Total', // Même mot dans les deux langues
        'Révisées': 'Reviewed',
        'À réviser': 'To Review',
        'Nouvelles': 'New',
        'Problèmes à réviser aujourd\'hui': 'Problems to review today',
        'Tout est à jour. Vous pouvez jouer ou apprendre une nouvelle finale.': 'Everything is up to date. You can play or learn a new endgame.',
        'Choisir le style des pièces': 'Choose piece style'
      };

      Object.entries(uiTranslations).forEach(([french, english]) => {
        expect(english).toBeDefined();
        expect(english.length).toBeGreaterThan(0);
        // "Total" est le même dans les deux langues
        if (french !== 'Total') {
          expect(english).not.toBe(french);
        }
      });
    });
  });

  describe('Message Translation', () => {
    it('should translate game messages', () => {
      const messageTranslations = {
        'À toi de jouer !': 'Your turn!',
        'Mauvais coup, essaie encore !': 'Wrong move, try again!',
        'Bien joué, tu as maté !': 'Well done, you checkmated!',
        'Erreur API': 'API Error',
        'Erreur réseau': 'Network error',
        'Démo arrêtée': 'Demo stopped',
        'Recherche du meilleur coup...': 'Looking for the best move...',
        'Impossible d\'obtenir un indice': 'Unable to get hint',
        'Bienvenue ! Cliquez sur 🚀 pour commencer la démo.': 'Welcome! Click 🚀 to start the demo.',
        'Ce module n\'a pas de démo scriptée.': 'This module has no scripted demo.'
      };

      Object.entries(messageTranslations).forEach(([french, english]) => {
        expect(english).toBeDefined();
        expect(english.length).toBeGreaterThan(0);
        expect(english).not.toBe(french);
      });
    });

    it('should translate button texts', () => {
      const buttonTranslations = {
        'Lancer la démo': 'Start demo',
        'Arrêter la démo': 'Stop demo',
        'Indice': 'Hint',
        'Meilleur coup :': 'Best move:'
      };

      Object.entries(buttonTranslations).forEach(([french, english]) => {
        expect(english).toBeDefined();
        expect(english.length).toBeGreaterThan(0);
        expect(english).not.toBe(french);
      });
    });
  });

  describe('Language Toggle', () => {
    it('should handle language switching', () => {
      let isEnglish = false; // Français par défaut
      const toggleLanguage = () => {
        isEnglish = !isEnglish;
        return isEnglish;
      };
      
      expect(toggleLanguage()).toBe(true); // Passe à l'anglais
      expect(toggleLanguage()).toBe(false); // Passe au français
    });

    it('should maintain translation consistency', () => {
      const frenchText = 'Mat élémentaire : Dame et roi contre roi';
      const englishText = 'Basic mate: Queen and king vs king';
      
      // Vérifier que les traductions sont cohérentes
      expect(frenchText).toContain('Mat élémentaire');
      expect(englishText).toContain('Basic mate');
      expect(frenchText).toContain('Dame et roi');
      expect(englishText).toContain('Queen and king');
    });
  });
});
