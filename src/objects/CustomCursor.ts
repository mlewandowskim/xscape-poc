import Phaser from 'phaser';

export interface CustomCursorOptions {
  radius?: number;
  color?: number;
  alpha?: number;
}

/**
 * A small dot that replaces the native cursor inside the canvas.
 * Set `canvas.style.cursor = 'none'` on the scene where this is used.
 */
export class CustomCursor extends Phaser.GameObjects.Arc {
  constructor(scene: Phaser.Scene, opts: CustomCursorOptions = {}) {
    const radius = opts.radius ?? 3;
    const color = opts.color ?? 0xffffff;
    const alpha = opts.alpha ?? 0.9;

    super(scene, -100, -100, radius, 0, 360, false, color, 1);
    scene.add.existing(this);

    this.setAlpha(alpha);
    this.setDepth(2000);

    if (this.postFX) {
      this.postFX.addShadow(0, 1, 0.05, 1, 0x000000, 4, 1);
    }

    scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    this.setPosition(pointer.worldX, pointer.worldY);
  }

  private cleanup(): void {
    this.scene?.input.off(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
  }
}
