import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../main';

export class WinScene extends Phaser.Scene {
  constructor() {
    super('WinScene');
  }

  create(): void {
    this.input.setDefaultCursor('default');
    this.cameras.main.setBackgroundColor('#1f7a3a');

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'YOU WON THE GAME', {
        fontFamily: 'serif',
        fontSize: '84px',
        color: '#eafff0',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70, '— escaped with style —', {
        fontFamily: 'serif',
        fontSize: '28px',
        color: '#bff0c8',
      })
      .setOrigin(0.5);
  }
}
