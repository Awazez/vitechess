import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import ChessBoard from '../../src/components/chessBoard/chessBoard.vue';

describe('Simple Debug Tests', () => {
  it('should select piece on first click', async () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const wrapper = mount(ChessBoard, {
      props: { fen }
    });

    // Click on e2 (row 6, col 4) - should be a white pawn
    await wrapper.vm.handleSquareClick(6, 4);

    // Check if piece was selected
    expect(wrapper.vm.selectedPiece).not.toBeNull();
    expect(wrapper.vm.selectedPiece).toEqual({ row: 6, col: 4 });
  });

  it('should have possible moves after selection', async () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const wrapper = mount(ChessBoard, {
      props: { fen }
    });

    // Click on e2 (row 6, col 4)
    await wrapper.vm.handleSquareClick(6, 4);

    // Check if possible moves were calculated
    expect(wrapper.vm.possibleMoves.length).toBeGreaterThan(0);
  });

  it('should make a valid move', async () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const wrapper = mount(ChessBoard, {
      props: { fen }
    });

    const initialFen = wrapper.vm.chess.fen();

    // Click on e2 (row 6, col 4)
    await wrapper.vm.handleSquareClick(6, 4);
    
    // Click on e4 (row 4, col 4)
    await wrapper.vm.handleSquareClick(4, 4);

    const finalFen = wrapper.vm.chess.fen();

    // FEN should have changed
    expect(finalFen).not.toBe(initialFen);
  });
});






