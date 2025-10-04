/**
 * Configuration globale pour les tests Vitest
 * 
 * Ce fichier configure l'environnement de test pour ViteChess
 */

import { vi } from 'vitest'

// Mock global fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
global.localStorage = localStorageMock

// Mock window.matchMedia pour les tests de thème
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock console pour éviter les logs pendant les tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Mock des modules SVG
vi.mock('*.svg', () => ({
  default: 'svg-mock'
}))

// Mock des modules PGN
vi.mock('*.pgn?raw', () => ({
  default: '[Event "Test Game"]\n[Site "Test"]\n[Result "*"]\n\n1. e4 e5 2. Nf3 Nc6 *'
}))

// Mock HTMLAudioElement
Object.defineProperty(HTMLAudioElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined)
})

Object.defineProperty(HTMLAudioElement.prototype, 'pause', {
  writable: true,
  value: vi.fn()
})

Object.defineProperty(HTMLAudioElement.prototype, 'load', {
  writable: true,
  value: vi.fn()
})

// Configuration des timeouts
vi.setConfig({
  testTimeout: 10000,
  hookTimeout: 10000
})
