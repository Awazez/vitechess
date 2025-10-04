import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ChessBoard from '../../src/components/chessBoard/chessBoard.vue';

describe('Chess Debug Tests', () => {
  it('should debug piece selection', async () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const wrapper = mount(ChessBoard, {
      props: { fen }
    });

    console.log("🔍 Initial state:");
    console.log("- selectedPiece:", wrapper.vm.selectedPiece);
    console.log("- possibleMoves:", wrapper.vm.possibleMoves);
    console.log("- chess.turn():", wrapper.vm.chess.turn());
    console.log("- board[6][4]:", wrapper.vm.board[6][4]);

    // Test click on e2 (row 6, col 4)
    console.log("🎯 Clicking on e2 (6,4)...");
    await wrapper.vm.handleSquareClick(6, 4);

    console.log("🔍 After first click:");
    console.log("- selectedPiece:", wrapper.vm.selectedPiece);
    console.log("- possibleMoves:", wrapper.vm.possibleMoves);
    console.log("- chess.turn():", wrapper.vm.chess.turn());

    // Test click on e4 (row 4, col 4)
    console.log("🎯 Clicking on e4 (4,4)...");
    await wrapper.vm.handleSquareClick(4, 4);

    console.log("🔍 After second click:");
    console.log("- selectedPiece:", wrapper.vm.selectedPiece);
    console.log("- possibleMoves:", wrapper.vm.possibleMoves);
    console.log("- chess.turn():", wrapper.vm.chess.turn());
    console.log("- chess.fen():", wrapper.vm.chess.fen());

    // Check if selection worked
    expect(wrapper.vm.selectedPiece).toBeNull(); // Should be null after move
  });

  it('should debug board state', async () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const wrapper = mount(ChessBoard, {
      props: { fen }
    });

    console.log("🔍 Board state:");
    console.log("- Board:", wrapper.vm.board);
    console.log("- Chess board:", wrapper.vm.chess.board());
    console.log("- FEN:", wrapper.vm.chess.fen());

    // Check if board is properly initialized
    expect(wrapper.vm.board).toBeDefined();
    expect(wrapper.vm.board.length).toBe(8);
    expect(wrapper.vm.board[0].length).toBe(8);
  });
});
