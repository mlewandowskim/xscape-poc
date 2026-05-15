import Phaser from 'phaser';
import { CODE_WHEEL_CELLS, CODE_WHEEL_CELL_HEIGHT } from '../data/codeWheel';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.image('room', 'assets/room.png');
    this.load.video('intro', 'assets/intro.mp4', false);
    this.load.image('locker', 'assets/locker.png');
    this.load.image('code_wheel', 'assets/code_wheel.png');
  }

  create(): void {
    const tex = this.textures.get('code_wheel');
    CODE_WHEEL_CELLS.forEach((cell, i) => {
      tex.add(`d${i}`, 0, cell.x, 0, cell.w, CODE_WHEEL_CELL_HEIGHT);
    });
    this.scene.start('MenuScene');
  }
}
