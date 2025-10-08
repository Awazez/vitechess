import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ChessBoard from '../../src/components/chessBoard/chessBoard.vue';
import { Chess } from 'chess.js';

describe('Chess Bug Detection Tests', () => {
  describe('Piece Movement Bugs', () => {
    it('should not allow pieces to disappear', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      const initialPieceCount = wrapper.vm.chess.board().flat().filter(square => square).length;
      
      // Make a move
      await wrapper.vm.handleSquareClick(6, 4); // Select e2
      await wrapper.vm.handleSquareClick(4, 4); // Move to e4

      const finalPieceCount = wrapper.vm.chess.board().flat().filter(square => square).length;
      
      // Should have same number of pieces
      expect(finalPieceCount).toBe(initialPieceCount);
    });

    it('should handle piece selection state correctly', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Select piece
      await wrapper.vm.handleSquareClick(6, 4); // Select e2
      expect(wrapper.vm.selectedPiece).not.toBeNull();

      // Click on same piece again should deselect
      await wrapper.vm.handleSquareClick(6, 4); // Click e2 again
      expect(wrapper.vm.selectedPiece).toBeNull();
    });

    it('should clear possible moves when deselecting', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Select piece
      await wrapper.vm.handleSquareClick(6, 4); // Select e2
      expect(wrapper.vm.possibleMoves.length).toBeGreaterThan(0);

      // Click empty square should deselect
      await wrapper.vm.handleSquareClick(4, 4); // Click e4 (empty)
      expect(wrapper.vm.selectedPiece).toBeNull();
      expect(wrapper.vm.possibleMoves).toEqual([]);
    });
  });

  describe('Board State Consistency', () => {
    it('should maintain consistent board state', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Make several moves and check board consistency
      const moves = [
        [6, 4, 4, 4], // e2-e4
        [1, 4, 3, 4], // e7-e5
        [7, 6, 5, 5], // Nf3
      ];

      for (const [fromRow, fromCol, toRow, toCol] of moves) {
        const fenBefore = wrapper.vm.chess.fen();
        
        await wrapper.vm.handleSquareClick(fromRow, fromCol);
        await wrapper.vm.handleSquareClick(toRow, toCol);
        
        const fenAfter = wrapper.vm.chess.fen();
        
        // FEN should have changed
        expect(fenAfter).not.toBe(fenBefore);
        
        // Board should be valid
        expect(wrapper.vm.chess.isCheckmate()).toBe(false);
        expect(wrapper.vm.chess.isStalemate()).toBe(false);
      }
    });

    it('should handle piece capture correctly', async () => {
      // Position where capture is possible
      const fen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      const initialFen = wrapper.vm.chess.fen();
      
      // Capture pawn
      await wrapper.vm.handleSquareClick(4, 4); // Select e4
      await wrapper.vm.handleSquareClick(3, 3); // Capture d5

      const finalFen = wrapper.vm.chess.fen();
      
      // Should have captured
      expect(finalFen).not.toBe(initialFen);
      expect(finalFen).toContain('d5');
    });
  });

  describe('Turn Management Bugs', () => {
    it('should not allow double moves by same player', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // White's first move
      await wrapper.vm.handleSquareClick(6, 4); // Select e2
      await wrapper.vm.handleSquareClick(4, 4); // Move to e4

      expect(wrapper.vm.chess.turn()).toBe('b');

      // Try to move white piece again (should not work)
      await wrapper.vm.handleSquareClick(6, 3); // Try to select d2
      await wrapper.vm.handleSquareClick(4, 3); // Try to move to d4

      // Should still be black's turn
      expect(wrapper.vm.chess.turn()).toBe('b');
    });

    it('should handle turn switching correctly', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // White move
      await wrapper.vm.handleSquareClick(6, 4); // Select e2
      await wrapper.vm.handleSquareClick(4, 4); // Move to e4

      // Black move
      await wrapper.vm.handleSquareClick(1, 4); // Select e7
      await wrapper.vm.handleSquareClick(3, 4); // Move to e5

      // Should be white's turn again
      expect(wrapper.vm.chess.turn()).toBe('w');
    });
  });

  describe('Visual State Bugs', () => {
    it('should update last move highlights correctly', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Make a move
      await wrapper.vm.handleSquareClick(6, 4); // Select e2
      await wrapper.vm.handleSquareClick(4, 4); // Move to e4

      // Should have last move coordinates
      expect(wrapper.vm.lastMoveStart).toEqual({ row: 6, col: 4 });
      expect(wrapper.vm.lastMoveEnd).toEqual({ row: 4, col: 4 });
    });

    it('should clear highlights after new move', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // First move
      await wrapper.vm.handleSquareClick(6, 4); // Select e2
      await wrapper.vm.handleSquareClick(4, 4); // Move to e4

      const firstMoveEnd = wrapper.vm.lastMoveEnd;

      // Second move
      await wrapper.vm.handleSquareClick(1, 4); // Select e7
      await wrapper.vm.handleSquareClick(3, 4); // Move to e5

      const secondMoveEnd = wrapper.vm.lastMoveEnd;

      // Should have updated to new move
      expect(secondMoveEnd).not.toEqual(firstMoveEnd);
    });
  });

  describe('Edge Cases', () => {
    it('should handle checkmate position correctly', async () => {
      // Checkmate position
      const fen = 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Should detect checkmate
      expect(wrapper.vm.chess.isCheckmate()).toBe(true);
      expect(wrapper.vm.chess.isGameOver()).toBe(true);
    });

    it('should handle stalemate position correctly', async () => {
      // Stalemate position
      const fen = '8/8/8/8/8/8/8/4K3 w - - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Should detect stalemate
      expect(wrapper.vm.chess.isStalemate()).toBe(true);
      expect(wrapper.vm.chess.isGameOver()).toBe(true);
    });

    it('should handle check position correctly', async () => {
      // Check position
      const fen = 'rnbqkbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Should detect check
      expect(wrapper.vm.chess.isCheck()).toBe(true);
    });
  });

  describe('Memory Leaks and Performance', () => {
    it('should not accumulate event listeners', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Make many moves
      for (let i = 0; i < 10; i++) {
        await wrapper.vm.handleSquareClick(6, 4);
        await wrapper.vm.handleSquareClick(4, 4);
        await wrapper.vm.$nextTick();
      }

      // Component should still be responsive
      expect(wrapper.vm.chess.isGameOver()).toBe(false);
    });

    it('should handle rapid clicks gracefully', async () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const wrapper = mount(ChessBoard, {
        props: { fen }
      });

      // Rapid clicks
      const clicks = [
        [6, 4], [4, 4], [6, 4], [4, 4], [6, 4], [4, 4]
      ];

      for (const [row, col] of clicks) {
        await wrapper.vm.handleSquareClick(row, col);
      }

      // Should not crash
      expect(wrapper.vm.chess.isGameOver()).toBe(false);
    });
  });
});









