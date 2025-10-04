import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import ChessBoard from '../../src/components/chessBoard/chessBoard.vue';

describe('Direct Debug Tests', () => {
  it('should have correct initial state', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const wrapper = mount(ChessBoard, {
      props: { fen }
    });

    // Check initial state
    expect(wrapper.vm.selectedPiece).toBeNull();
    expect(wrapper.vm.possibleMoves).toEqual([]);
    expect(wrapper.vm.chess.turn()).toBe('w');
    expect(wrapper.vm.board[6][4]).toBe('wP'); // e2 should be white pawn
  });

  it('should have handleSquareClick method', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const wrapper = mount(ChessBoard, {
      props: { fen }
    });

    // Check if method exists
    expect(typeof wrapper.vm.handleSquareClick).toBe('function');
  });

  it('should call handleSquareClick directly', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const wrapper = mount(ChessBoard, {
      props: { fen }
    });

    // Call method directly
    wrapper.vm.handleSquareClick(6, 4);

    // Check if it worked
    expect(wrapper.vm.selectedPiece).not.toBeNull();
  });
});










