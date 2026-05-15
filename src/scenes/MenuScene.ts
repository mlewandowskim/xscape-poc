import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../main';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.input.setDefaultCursor('default');

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add
      .text(cx, cy - 140, 'ESCAPE ROOM', {
        fontFamily: 'serif',
        fontSize: '64px',
        color: '#e9e2cf',
      })
      .setOrigin(0.5);

    const buttonWidth = 360;
    const buttonHeight = 96;

    const button = this.add.container(cx, cy + 30);
    const bg = this.add
      .rectangle(0, 0, buttonWidth, buttonHeight, 0xe9e2cf, 1)
      .setStrokeStyle(2, 0x000000, 0.4);
    const label = this.add
      .text(0, 0, 'START GAME', {
        fontFamily: 'serif',
        fontSize: '36px',
        color: '#111111',
      })
      .setOrigin(0.5);

    button.add([bg, label]);
    button.setSize(buttonWidth, buttonHeight);
    button.setInteractive({ useHandCursor: true });

    button.on('pointerover', () => bg.setFillStyle(0xffffff, 1));
    button.on('pointerout', () => bg.setFillStyle(0xe9e2cf, 1));
    button.on('pointerdown', () => bg.setFillStyle(0xc7c0ac, 1));
    button.on('pointerup', () => {
      this.scene.start('IntroScene');
    });
  }
}
