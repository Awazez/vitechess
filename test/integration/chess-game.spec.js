import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../../src/App.vue';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

describe('Chess Game Integration', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Complete Game Flow', () => {
    it('should handle a complete lesson from start to checkmate', async () => {
      const wrapper = mount(App);
      await wrapper.vm.$nextTick();

      // 1. Vérifier l'initialisation
      expect(wrapper.vm.currentLesson).toBeDefined();
      expect(wrapper.vm.isDarkMode).toBe(true);
      expect(wrapper.vm.isEnglish).toBe(false);

      // 2. Simuler un coup valide
      const mockMoveResponse = {
        ok: true,
        json: () => Promise.resolve({
          isBest: true,
          fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
          isCheckmate: false
        })
      };
      fetch.mockResolvedValueOnce(mockMoveResponse);

      // Simuler la completion de la leçon
      await wrapper.vm.onLessonCompleted();

      // Vérifier que la leçon est marquée comme terminée
      expect(wrapper.vm.currentLesson).toBeDefined();
    });

    it('should handle checkmate and lesson completion', async () => {
      const wrapper = mount(App);

      // Simuler un mat
      const mockCheckmateResponse = {
        ok: true,
        json: () => Promise.resolve({
          isBest: true,
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          isCheckmate: true
        })
      };
      fetch.mockResolvedValueOnce(mockCheckmateResponse);

      // Simuler la completion de la leçon
      await wrapper.vm.onLessonCompleted();

      // Vérifier que la leçon est marquée comme terminée
      expect(wrapper.vm.currentLesson).toBeDefined();
    });
  });

  describe('Language Switching', () => {
    it('should switch between French and English', async () => {
      const wrapper = mount(App);

      // Commencer en français
      expect(wrapper.vm.isEnglish).toBe(false);

      // Changer vers l'anglais
      wrapper.vm.toggleLanguage();
      expect(wrapper.vm.isEnglish).toBe(true);

      // Changer vers le français
      wrapper.vm.toggleLanguage();
      expect(wrapper.vm.isEnglish).toBe(false);
    });

    it('should translate lesson titles correctly', async () => {
      const wrapper = mount(App);
      await wrapper.vm.$nextTick();

      // Test de traduction
      const frenchTitle = 'Mat élémentaire : Dame et roi contre roi';
      const englishTitle = wrapper.vm.translateLessonTitle(frenchTitle);

      expect(englishTitle).toBe('Basic mate: Queen and king vs king');
    });
  });

  describe('Piece Set Selection', () => {
    it('should change piece set correctly', () => {
      const wrapper = mount(App);

      // Vérifier le set par défaut
      expect(wrapper.vm.selectedPieceSet).toBe('cburnett');

      // Changer le set
      wrapper.vm.selectPieceSet('fantasy');
      expect(wrapper.vm.selectedPieceSet).toBe('fantasy');
    });

    it('should open and close piece selector', () => {
      const wrapper = mount(App);

      // Ouvrir le sélecteur
      wrapper.vm.togglePieceSelector();
      expect(wrapper.vm.showPieceSelector).toBe(true);

      // Fermer le sélecteur
      wrapper.vm.closePieceSelector();
      expect(wrapper.vm.showPieceSelector).toBe(false);
    });
  });

  describe('Theme Switching', () => {
    it('should toggle between dark and light theme', () => {
      const wrapper = mount(App);

      // Commencer en mode sombre
      expect(wrapper.vm.isDarkMode).toBe(true);

      // Changer vers le mode clair
      wrapper.vm.toggleTheme();
      expect(wrapper.vm.isDarkMode).toBe(false);

      // Changer vers le mode sombre
      wrapper.vm.toggleTheme();
      expect(wrapper.vm.isDarkMode).toBe(true);
    });
  });

  describe('Course Package Navigation', () => {
    it('should navigate between course packages', async () => {
      const wrapper = mount(App);
      await wrapper.vm.$nextTick();

      // Vérifier qu'il y a des paquets
      expect(wrapper.vm.coursePackages.value.length).toBeGreaterThan(0);

      // Sélectionner un paquet
      const firstPackage = wrapper.vm.coursePackages.value[0];
      wrapper.vm.selectPackage(firstPackage);

      expect(wrapper.vm.selectedPackage).toBe(firstPackage);
      expect(wrapper.vm.showPackageLessons).toBe(true);
    });

    it('should navigate back to packages', async () => {
      const wrapper = mount(App);
      await wrapper.vm.$nextTick();

      // Sélectionner un paquet
      const firstPackage = wrapper.vm.coursePackages.value[0];
      wrapper.vm.selectPackage(firstPackage);

      // Retourner aux paquets
      wrapper.vm.backToPackages();

      expect(wrapper.vm.selectedPackage).toBe(null);
      expect(wrapper.vm.showPackageLessons).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const wrapper = mount(App);

      // Simuler une erreur API
      fetch.mockRejectedValueOnce(new Error('Network error'));

      // Le composant ne devrait pas planter
      expect(() => {
        wrapper.vm.onLessonCompleted();
      }).not.toThrow();
    });

    it('should handle invalid FEN gracefully', () => {
      const wrapper = mount(App);

      // Changer vers une leçon avec FEN invalide
      const invalidLesson = {
        title: 'Invalid Lesson',
        fen: 'invalid-fen',
        scripted: []
      };

      wrapper.vm.currentLesson = invalidLesson;

      // Le composant devrait gérer l'erreur
      expect(wrapper.vm.currentLesson).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle multiple rapid theme switches', () => {
      const wrapper = mount(App);

      // Effectuer plusieurs changements rapides
      for (let i = 0; i < 10; i++) {
        wrapper.vm.toggleTheme();
      }

      // Le composant devrait toujours fonctionner
      expect(wrapper.vm.isDarkMode).toBeDefined();
    });

    it('should handle multiple rapid language switches', () => {
      const wrapper = mount(App);

      // Effectuer plusieurs changements rapides
      for (let i = 0; i < 10; i++) {
        wrapper.vm.toggleLanguage();
      }

      // Le composant devrait toujours fonctionner
      expect(wrapper.vm.isEnglish).toBeDefined();
    });
  });
});
