import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../main';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  create(): void {
    this.input.setDefaultCursor('default');

    const video = this.add.video(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'intro');

    video.on('locked', () => {
      this.showTapToPlay(video);
    });

    video.play(false);

    video.once(Phaser.GameObjects.Events.VIDEO_COMPLETE, () => this.goToRoom());

    this.scaleVideoToFit(video);
    this.createSkipButton();
  }

  private createSkipButton(): void {
    const skip = this.add
      .text(GAME_WIDTH - 40, GAME_HEIGHT - 40, 'Skip', {
        fontFamily: 'serif',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(1, 1)
      .setAlpha(0.5)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true });

    skip.on('pointerover', () => skip.setAlpha(0.9));
    skip.on('pointerout', () => skip.setAlpha(0.5));
    skip.once('pointerup', () => this.goToRoom());
  }

  private goToRoom(): void {
    this.scene.start('RoomScene');
  }

  private scaleVideoToFit(video: Phaser.GameObjects.Video): void {
    video.once(Phaser.GameObjects.Events.VIDEO_CREATED, () => {
      const vw = video.width || GAME_WIDTH;
      const vh = video.height || GAME_HEIGHT;
      const scale = Math.min(GAME_WIDTH / vw, GAME_HEIGHT / vh);
      video.setScale(scale);
    });
  }

  private showTapToPlay(video: Phaser.GameObjects.Video): void {
    const hint = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Click to play', {
        fontFamily: 'serif',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    hint.once('pointerup', () => {
      hint.destroy();
      video.play(false);
    });
  }
}
