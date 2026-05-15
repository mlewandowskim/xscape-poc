import Phaser from 'phaser';

export interface InteractionMarkerOptions {
  radius?: number;
  strokeWidth?: number;
  color?: number;
  alpha?: number;
}

/**
 * Reusable point-and-click hover indicator (white ring with drop shadow).
 * One instance per scene — call showAt() to position it on a hovered item, hide() otherwise.
 */
export class InteractionMarker extends Phaser.GameObjects.Container {
  private readonly ring: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, opts: InteractionMarkerOptions = {}) {
    super(scene, 0, 0);

    const radius = opts.radius ?? 14;
    const strokeWidth = opts.strokeWidth ?? 2;
    const color = opts.color ?? 0xffffff;
    const alpha = opts.alpha ?? 0.6;

    this.ring = scene.add.circle(0, 0, radius);
    this.ring.setFillStyle(color, 0);
    this.ring.setStrokeStyle(strokeWidth, color, 1);
    this.add(this.ring);

    this.setAlpha(alpha);
    this.setDepth(900);
    this.setVisible(false);

    scene.add.existing(this);
  }

  showAt(x: number, y: number): void {
    this.setPosition(x, y);
    if (!this.visible) {
      this.setVisible(true);
    }
  }

  hide(): void {
    if (this.visible) {
      this.setVisible(false);
    }
  }
}
