import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.image('room', 'assets/room.png');
    this.load.video('intro', 'assets/intro.mp4', true);
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}
