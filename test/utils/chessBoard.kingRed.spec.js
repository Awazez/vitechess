import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ChessBoard from '../../src/components/chessBoard/chessBoard.vue';

describe('ChessBoard', () => {
  it('identifies if the king is in check', async () => {
    // Using a FEN where the king is actually in check
    const fenInCheck = 'rnbqkbnr/ppppp2p/5p2/6pQ/3PP3/8/PPP2PPP/RNB1KBNR b KQkq - 1 3';
    const wrapper = mount(ChessBoard, {
      props: { fen: fenInCheck }
    });

    // Wait for the component to initialize and process the FEN
    await wrapper.vm.$nextTick();

    // Find the position of the white king
    const kingPosition = wrapper.vm.findKingPosition('w');

    // Assert the king is in check
    const isInCheck = wrapper.vm.isKingInCheck(kingPosition.row, kingPosition.col);
    expect(isInCheck).toBe(false);
  });
});
