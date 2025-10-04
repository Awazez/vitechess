import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ChessBoard from '../../src/components/chessBoard/chessBoard.vue';

describe('ChessBoard.vue', () => {
  it('has sound methods available', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    
    const wrapper = mount(ChessBoard, {
      props: { fen }
    });

    // Check that sound methods exist
    expect(typeof wrapper.vm.playMoveSound).toBe('function');
    expect(typeof wrapper.vm.playCaptureSound).toBe('function');
  });

  it('calls playMoveSound when move is made', async () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    
    const wrapper = mount(ChessBoard, {
      props: { fen }
    });

    // Mock the playMoveSound method
    const playMoveSoundSpy = vi.spyOn(wrapper.vm, 'playMoveSound');
    const playCaptureSoundSpy = vi.spyOn(wrapper.vm, 'playCaptureSound');

    // Mock the refs
    wrapper.vm.$refs.moveSound = { play: vi.fn() };
    wrapper.vm.$refs.captureSound = { play: vi.fn() };

    // Wait for component to be ready
    await wrapper.vm.$nextTick();

    // Make a move by calling the method directly
    await wrapper.vm.handleSquareClick(6, 4); // Select e2
    await wrapper.vm.handleSquareClick(4, 4); // Move to e4

    // Wait for any async operations
    await wrapper.vm.$nextTick();

    // Check that sound methods were called
    expect(playMoveSoundSpy).toHaveBeenCalled();
  });
});