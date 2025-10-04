import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../../src/App.vue';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

describe('Spaced Repetition System', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('Problem Creation', () => {
    it('should create problems from lessons', async () => {
      const wrapper = mount(App);
      
      // Attendre que les leçons soient chargées
      await wrapper.vm.$nextTick();
      
      // Simuler l'ajout d'une leçon aux révisions
      wrapper.vm.toggleSpacedRepetition('Mat élémentaire : Dame et roi contre roi');

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should initialize with empty stats', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const wrapper = mount(App);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.srStats.total).toBe(0);
      expect(wrapper.vm.srStats.newToday).toBe(0);
      expect(wrapper.vm.srStats.reviewedToday).toBe(0);
      expect(wrapper.vm.srStats.toReview).toBe(0);
    });
  });

  describe('Problem Management', () => {
    it('should add lesson to spaced repetition', async () => {
      const wrapper = mount(App);
      await wrapper.vm.$nextTick();
      
      const lessonTitle = 'Mat élémentaire : Dame et roi contre roi';

      wrapper.vm.toggleSpacedRepetition(lessonTitle);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should remove lesson from spaced repetition', () => {
      const existingProblems = [
        { lessonTitle: 'Test Lesson', repetitions: 0, interval: 1 }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingProblems));

      const wrapper = mount(App);
      const lessonTitle = 'Test Lesson';

      // D'abord ajouter
      wrapper.vm.toggleSpacedRepetition(lessonTitle);
      // Puis retirer
      wrapper.vm.toggleSpacedRepetition(lessonTitle);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should check if lesson is in spaced repetition', () => {
      const existingProblems = [
        { lessonTitle: 'Test Lesson', repetitions: 0, interval: 1 }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingProblems));

      const wrapper = mount(App);

      expect(wrapper.vm.isLessonInSpacedRepetition('Test Lesson')).toBe(true);
      expect(wrapper.vm.isLessonInSpacedRepetition('Non-existent Lesson')).toBe(false);
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate correct stats for new problems', () => {
      const today = new Date().toISOString().split('T')[0];
      const problems = [
        {
          lessonTitle: 'New Lesson',
          createdAt: today,
          repetitions: 0,
          lastReviewed: null
        }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(problems));

      const wrapper = mount(App);
      wrapper.vm.updateStats();

      expect(wrapper.vm.srStats.total).toBe(1);
      expect(wrapper.vm.srStats.newToday).toBe(1);
      expect(wrapper.vm.srStats.reviewedToday).toBe(0);
      expect(wrapper.vm.srStats.toReview).toBe(0);
    });

    it('should calculate correct stats for reviewed problems', () => {
      const today = new Date().toISOString().split('T')[0];
      const problems = [
        {
          lessonTitle: 'Reviewed Lesson',
          createdAt: today,
          repetitions: 1,
          lastReviewed: today
        }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(problems));

      const wrapper = mount(App);
      wrapper.vm.updateStats();

      expect(wrapper.vm.srStats.total).toBe(1);
      expect(wrapper.vm.srStats.newToday).toBe(0);
      expect(wrapper.vm.srStats.reviewedToday).toBe(1);
      expect(wrapper.vm.srStats.toReview).toBe(0);
    });

    it('should calculate correct stats for problems to review', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const problems = [
        {
          lessonTitle: 'To Review Lesson',
          createdAt: yesterday,
          repetitions: 1,
          lastReviewed: yesterday
        }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(problems));

      const wrapper = mount(App);
      wrapper.vm.updateStats();

      expect(wrapper.vm.srStats.total).toBe(1);
      expect(wrapper.vm.srStats.newToday).toBe(0);
      expect(wrapper.vm.srStats.reviewedToday).toBe(0);
      expect(wrapper.vm.srStats.toReview).toBe(1);
    });
  });

  describe('Problem Completion', () => {
    it('should record successful completion', () => {
      const problems = [
        {
          lessonTitle: 'Test Lesson',
          repetitions: 0,
          interval: 1,
          ease: 2.5
        }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(problems));

      const wrapper = mount(App);
      wrapper.vm.recordSrCompletion('Test Lesson', false);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should record failed completion', () => {
      const problems = [
        {
          lessonTitle: 'Test Lesson',
          repetitions: 1,
          interval: 3,
          ease: 2.5
        }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(problems));

      const wrapper = mount(App);
      wrapper.vm.recordSrCompletion('Test Lesson', true);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should handle lesson not found in problems', () => {
      const problems = [
        {
          lessonTitle: 'Other Lesson',
          repetitions: 0,
          interval: 1,
          ease: 2.5
        }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(problems));

      const wrapper = mount(App);
      
      // Ne devrait pas lever d'erreur
      expect(() => {
        wrapper.vm.recordSrCompletion('Non-existent Lesson', false);
      }).not.toThrow();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset spaced repetition data', async () => {
      const wrapper = mount(App);
      await wrapper.vm.$nextTick();
      
      wrapper.vm.resetSpacedRepetition();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('vitechess_spaced_repetition');
      expect(wrapper.vm.srStats.total).toBe(0);
      expect(wrapper.vm.srProblemsToReview.value).toEqual([]);
    });
  });
});
