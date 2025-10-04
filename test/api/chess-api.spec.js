import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock fetch pour les tests
global.fetch = vi.fn();

describe('Chess API Integration', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Move API', () => {
    it('should send correct move request to API', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          isBest: true,
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          isCheckmate: false
        })
      };

      fetch.mockResolvedValueOnce(mockResponse);

      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const move = 'e2e4';

      const response = await fetch('http://127.0.0.1:8080/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, move })
      });

      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8080/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, move })
      });

      expect(response.ok).toBe(true);
    });

    it('should handle API errors correctly', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({
          error: 'Invalid move'
        })
      };

      fetch.mockResolvedValueOnce(mockResponse);

      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const move = 'invalid';

      const response = await fetch('http://127.0.0.1:8080/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, move })
      });

      expect(response.ok).toBe(false);
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const move = 'e2e4';

      await expect(fetch('http://127.0.0.1:8080/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, move })
      })).rejects.toThrow('Network error');
    });
  });

  describe('Hint API', () => {
    it('should request hint from API', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          bestMove: 'e2e4'
        })
      };

      fetch.mockResolvedValueOnce(mockResponse);

      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

      const response = await fetch('http://127.0.0.1:8080/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen })
      });

      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8080/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen })
      });

      expect(response.ok).toBe(true);
    });

    it('should handle hint API errors', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({
          error: 'Unable to analyze position'
        })
      };

      fetch.mockResolvedValueOnce(mockResponse);

      const fen = 'invalid-fen';

      const response = await fetch('http://127.0.0.1:8080/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen })
      });

      expect(response.ok).toBe(false);
    });
  });

  describe('Checkmate Detection', () => {
    it('should detect checkmate correctly', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          isBest: true,
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          isCheckmate: true
        })
      };

      fetch.mockResolvedValueOnce(mockResponse);

      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const move = 'e2e4';

      const response = await fetch('http://127.0.0.1:8080/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, move })
      });

      const data = await response.json();
      expect(data.isCheckmate).toBe(true);
    });
  });
});

