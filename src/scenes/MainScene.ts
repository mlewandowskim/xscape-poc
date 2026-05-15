import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload(): void {}

  create(): void {
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'Phaser is alive ✨', {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
  }

  update(_time: number, _delta: number): void {}
}
