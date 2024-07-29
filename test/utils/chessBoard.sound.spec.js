import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ChessBoard from '../../src/components/chessBoard/chessBoard.vue';
import { Chess } from 'chess.js';

describe('ChessBoard.vue', () => {
  it('plays sound on piece move', async () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const wrapper = mount(ChessBoard, {
      props: { fen }
    });

    // Mock the audio play method
    const playMock = vi.fn();
    wrapper.vm.$refs.moveSound.play = playMock;

    // Select a piece (e.g., white pawn at e2) and move it to e4
    await wrapper.vm.handleSquareClick(6, 4); // Select e2
    await wrapper.vm.handleSquareClick(4, 4); // Move to e4

    // Assert that the play method was called
    expect(playMock).toHaveBeenCalled();
  });
});