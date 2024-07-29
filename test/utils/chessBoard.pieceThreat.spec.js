// Importations nécessaires
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ChessBoard from '@/components/ChessBoard.vue';

describe('ChessBoard', () => {
  // Simulation de la situation où une pièce est menacée
  it('affiche correctement la couleur lorsqu\'une pièce est en échec', async () => {
    const wrapper = mount(ChessBoard, {
      props: {
        fen: 'r1bq1rk1/ppp2ppp/2npbn2/1B2p3/4P3/2NPBN2/PPP2PPP/R2Q1RK1 w - - 0 1'
      }
    });

    // Simuler un clic sur une pièce qui mettra le roi en échec
    await wrapper.vm.handleSquareClick(4, 6); // Exemple : déplacement du cavalier en e5
    await wrapper.vm.handleSquareClick(6, 4); // Menace sur e5

    // Assurez-vous que la mise à jour du plateau se fait correctement
    await wrapper.vm.$nextTick();

    // Vérification que la case du roi qui est en échec est bien colorée
    const kingSquare = wrapper.find('.square').at(4 * 8 + 4); // Localisation hypothétique du roi
    expect(kingSquare.classes()).toContain('king-check');

    // Vous pouvez également vérifier les autres classes pour la robustesse du test
    expect(kingSquare.classes()).toContain('black'); // Ou 'white' selon la case
  });
});