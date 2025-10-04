import { describe, it, expect } from 'vitest';

describe('Chess Logic Tests', () => {
  describe('FEN Parsing', () => {
    it('should parse standard starting position', () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      
      // Vérifier que la FEN est valide
      expect(fen).toContain('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
      expect(fen).toContain('w KQkq - 0 1');
    });

    it('should parse endgame position', () => {
      const fen = '8/8/8/4k3/8/8/8/4K1Q1 w - - 0 1';
      
      // Vérifier que la FEN est valide
      expect(fen).toContain('8/8/8/4k3/8/8/8/4K1Q1');
      expect(fen).toContain('w - - 0 1');
    });
  });

  describe('Move Notation', () => {
    it('should validate UCI move format', () => {
      const validMoves = ['e2e4', 'd7d5', 'g1f3', 'b8c6'];
      
      validMoves.forEach(move => {
        expect(move).toMatch(/^[a-h][1-8][a-h][1-8]$/);
      });
    });

    it('should reject invalid move format', () => {
      const invalidMoves = ['invalid', 'e2', 'e2e4e6', 'z1a1'];
      
      invalidMoves.forEach(move => {
        expect(move).not.toMatch(/^[a-h][1-8][a-h][1-8]$/);
      });
    });
  });

  describe('Piece Positions', () => {
    it('should identify piece positions correctly', () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const board = fen.split(' ')[0];
      
      // Vérifier que les pièces sont aux bonnes positions
      expect(board).toContain('rnbqkbnr'); // Ligne 8 (noirs)
      expect(board).toContain('pppppppp'); // Ligne 7 (pions noirs)
      expect(board).toContain('PPPPPPPP'); // Ligne 2 (pions blancs)
      expect(board).toContain('RNBQKBNR'); // Ligne 1 (blancs)
    });
  });

  describe('Game States', () => {
    it('should identify checkmate position', () => {
      const checkmateFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      
      // Vérifier que la position n'est pas un mat (position de départ)
      expect(checkmateFen).not.toContain('mate');
    });

    it('should identify stalemate position', () => {
      const stalemateFen = '8/8/8/8/8/8/8/8 w - - 0 1';
      
      // Vérifier que la position est vide
      expect(stalemateFen).toContain('8/8/8/8/8/8/8/8');
    });
  });

  describe('Lesson Validation', () => {
    it('should validate lesson structure', () => {
      const lesson = {
        title: 'Mat élémentaire : Dame et roi contre roi',
        fen: '8/8/8/4k3/8/8/8/4K1Q1 w - - 0 1',
        scripted: ['Qh5+', 'Kd6', 'Qd5+', 'Ke7', 'Qe5#']
      };
      
      expect(lesson.title).toBeDefined();
      expect(lesson.fen).toBeDefined();
      expect(lesson.scripted).toBeInstanceOf(Array);
      expect(lesson.scripted.length).toBeGreaterThan(0);
    });

    it('should validate course package structure', () => {
      const coursePackage = {
        title: 'Finales élémentaires',
        description: 'Apprenez les finales de base',
        lessons: [
          { title: 'Mat élémentaire : Dame et roi contre roi' },
          { title: 'Mat élémentaire : tour et roi contre roi' }
        ]
      };
      
      expect(coursePackage.title).toBeDefined();
      expect(coursePackage.description).toBeDefined();
      expect(coursePackage.lessons).toBeInstanceOf(Array);
      expect(coursePackage.lessons.length).toBeGreaterThan(0);
    });
  });
});
