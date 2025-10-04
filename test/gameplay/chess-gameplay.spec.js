import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ChessBoard from '../../src/components/chessBoard/chessBoard.vue';
import { Chess } from 'chess.js';

describe('Chess Gameplay Tests', () => {
  describe('Basic Game Flow', () => {
    it('should handle valid moves correctly', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Test e2-e4 (white pawn)
      await wrapper.vm.handleSquareClick(6, 4); // Select e2
      await wrapper.vm.handleSquareClick(4, 4); // Move to e4

      expect(wrapper.vm.chess.fen()).toContain('e4');
    });

    it('should prevent invalid moves', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Try invalid move: e2-e5 (too far for pawn)
      await wrapper.vm.handleSquareClick(6, 4); // Select e2
      await wrapper.vm.handleSquareClick(2, 4); // Try to move to e5

      // Should still be on e2
      expect(wrapper.vm.chess.fen()).toContain('e2');
    });

    it('should handle piece selection correctly', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Select a piece
      await wrapper.vm.handleSquareClick(6, 4); // Select e2
      
      expect(wrapper.vm.selectedPiece).toEqual({ row: 6, col: 4 });
      expect(wrapper.vm.possibleMoves.length).toBeGreaterThan(0);
    });
  });

  describe('Turn Management', () => {
    it('should alternate turns correctly', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // White's turn - should be able to move
      expect(wrapper.vm.chess.turn()).toBe('w');
      
      // Make white move
      await wrapper.vm.handleSquareClick(6, 4); // Select e2
      await wrapper.vm.handleSquareClick(4, 4); // Move to e4

      // Should be black's turn now
      expect(wrapper.vm.chess.turn()).toBe('b');
    });

    it('should prevent moving opponent pieces', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Try to select black piece (should not work on white's turn)
      await wrapper.vm.handleSquareClick(1, 4); // Try to select e7 (black pawn)
      
      expect(wrapper.vm.selectedPiece).toBeNull();
    });
  });

  describe('Special Moves', () => {
    it('should handle castling correctly', async () => {
      // Position with castling available
      const fen = 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Try kingside castling
      await wrapper.vm.handleSquareClick(7, 4); // Select king
      await wrapper.vm.handleSquareClick(7, 6); // Move to g1

      // Should have castled
      expect(wrapper.vm.chess.fen()).toContain('O-O');
    });

    it('should handle en passant correctly', async () => {
      // Position for en passant
      const fen = 'rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Make en passant move
      await wrapper.vm.handleSquareClick(4, 4); // Select e5
      await wrapper.vm.handleSquareClick(3, 3); // Move to d6

      // Should have captured en passant
      expect(wrapper.vm.chess.fen()).toContain('d6');
    });

    it('should handle pawn promotion', async () => {
      // Position for promotion
      const fen = '8/4P3/8/8/8/8/8/8 w - - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Promote pawn
      await wrapper.vm.handleSquareClick(1, 4); // Select e7
      await wrapper.vm.handleSquareClick(0, 4); // Move to e8

      // Should have promoted (default to queen)
      expect(wrapper.vm.chess.fen()).toContain('Q');
    });
  });

  describe('Game State Management', () => {
    it('should update board state after moves', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      const initialFen = wrapper.vm.chess.fen();
      
      // Make a move
      await wrapper.vm.handleSquareClick(6, 4); // Select e2
      await wrapper.vm.handleSquareClick(4, 4); // Move to e4

      const newFen = wrapper.vm.chess.fen();
      expect(newFen).not.toBe(initialFen);
    });

    it('should clear selection after move', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Make a move
      await wrapper.vm.handleSquareClick(6, 4); // Select e2
      await wrapper.vm.handleSquareClick(4, 4); // Move to e4

      // Selection should be cleared
      expect(wrapper.vm.selectedPiece).toBeNull();
      expect(wrapper.vm.possibleMoves).toEqual([]);
    });

    it('should handle undo moves correctly', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      const initialFen = wrapper.vm.chess.fen();
      
      // Make a move
      await wrapper.vm.handleSquareClick(6, 4); // Select e2
      await wrapper.vm.handleSquareClick(4, 4); // Move to e4

      // Undo the move
      wrapper.vm.undoMove();

      // Should be back to initial position
      expect(wrapper.vm.chess.fen()).toBe(initialFen);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid FEN gracefully', () => {
      const invalidFen = 'invalid fen string';
      
      expect(() => {
        mount(ChessBoard, {
          props: { fen: invalidFen }
        });
      }).not.toThrow();
    });

    it('should handle click outside board bounds', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Try to click outside board
      expect(() => {
        wrapper.vm.handleSquareClick(-1, 0);
      }).not.toThrow();

      expect(() => {
        wrapper.vm.handleSquareClick(8, 8);
      }).not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid moves without issues', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Make several moves quickly
      const moves = [
        [6, 4, 4, 4], // e2-e4
        [1, 4, 3, 4], // e7-e5
        [7, 6, 5, 5], // Nf3
        [0, 6, 2, 5], // Nc6
      ];

      for (const [fromRow, fromCol, toRow, toCol] of moves) {
        await wrapper.vm.handleSquareClick(fromRow, fromCol);
        await wrapper.vm.handleSquareClick(toRow, toCol);
        await wrapper.vm.$nextTick();
      }

      // Should still be in a valid state
      expect(wrapper.vm.chess.isGameOver()).toBe(false);
    });
  });
});



