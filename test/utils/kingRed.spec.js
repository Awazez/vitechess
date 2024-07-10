import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ChessBoard from '../../src/components/chessBoard/chessBoard.vue';
import { Chess } from 'chess.js';

describe('ChessBoard', () => {
  it('identifies if the king is in check', async () => {
    // Using a FEN where the king is actually in check
    const fenInCheck = 'rnbqkbnr/ppppp2p/5p2/6pQ/3PP3/8/PPP2PPP/RNB1KBNR w KQkq - 0 1';
    const wrapper = mount(ChessBoard, {
      props: { fen: fenInCheck }
    });

    // Wait for the component to initialize and process the FEN
    await wrapper.vm.$nextTick();

    // Assume isKingInCheck is calculated after FEN is loaded and based on internal chess.js state
    const isInCheck = wrapper.vm.isKingInCheck(0, 4); // Example row and column for the king

    // Assert the king is in check
    expect(isInCheck).toBe(true);
  });
});
