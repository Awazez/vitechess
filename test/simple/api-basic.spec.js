import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('Basic API Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Move API', () => {
    it('should make correct API call for move', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          isBest: true,
          fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
          isCheckmate: false
        })
      };

      fetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('http://127.0.0.1:8080/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 
          move: 'e2e4' 
        })
      });

      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8080/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 
          move: 'e2e4' 
        })
      });

      expect(response.ok).toBe(true);
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({
          error: 'Invalid move'
        })
      };

      fetch.mockResolvedValueOnce(mockResponse);

      const response = await fetch('http://127.0.0.1:8080/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fen: 'invalid-fen', 
          move: 'invalid' 
        })
      });

      expect(response.ok).toBe(false);
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetch('http://127.0.0.1:8080/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 
          move: 'e2e4' 
        })
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

      const response = await fetch('http://127.0.0.1:8080/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' 
        })
      });

      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8080/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' 
        })
      });

      expect(response.ok).toBe(true);
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

      const response = await fetch('http://127.0.0.1:8080/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 
          move: 'e2e4' 
        })
      });

      const data = await response.json();
      expect(data.isCheckmate).toBe(true);
    });
  });
});




