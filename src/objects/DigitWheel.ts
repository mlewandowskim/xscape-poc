import Phaser from 'phaser';
import {
  CODE_WHEEL_CELLS,
  CODE_WHEEL_CELL_HEIGHT,
  CODE_WHEEL_DIGIT_BOTTOM,
  CODE_WHEEL_DIGIT_TOP,
  CODE_WHEEL_TOTAL_WIDTH,
} from '../data/codeWheel';

export interface DigitWheelOptions {
  /** Slot width in canvas pixels — the visible window. */
  width: number;
  /** Slot height in canvas pixels. */
  height: number;
  /**
   * Override scale by specifying how many digit cells fit across the slot width.
   * If omitted, the wheel is scaled so the digit glyph height matches the slot
   * height — yields a fully visible digit and ~2.5 cells across the slot.
   */
  cellsVisible?: number;
  arrowGap?: number;
  arrowSize?: number;
  arrowColor?: string;
  arrowHoverColor?: string;
  scrollDurationMs?: number;
  /**
   * Fine vertical offset for the wheel sprite, in canvas pixels.
   * Negative nudges the digit up; positive nudges it down. Default 0.
   */
  verticalNudge?: number;
}

const AVG_CELL_WIDTH = CODE_WHEEL_CELLS.reduce((s, c) => s + c.w, 0) / CODE_WHEEL_CELLS.length;
const DIGIT_GLYPH_HEIGHT = CODE_WHEEL_DIGIT_BOTTOM - CODE_WHEEL_DIGIT_TOP;
const DIGIT_GLYPH_CENTER_Y = (CODE_WHEEL_DIGIT_TOP + CODE_WHEEL_DIGIT_BOTTOM) / 2;
const WHEEL_CENTER_X = CODE_WHEEL_TOTAL_WIDTH / 2;
const WHEEL_CENTER_Y = CODE_WHEEL_CELL_HEIGHT / 2;

/**
 * A digit display backed by code_wheel.png. The slot is a fixed window; the
 * wheel sprite slides horizontally inside it, with two wrap copies positioned
 * one wheel-width to each side so 9 → 0 (and 0 → 9) wrap seamlessly.
 */
export class DigitWheel extends Phaser.GameObjects.Container {
  private value = 0;
  private readonly sprites: Phaser.GameObjects.Image[];
  private readonly maskGfx: Phaser.GameObjects.Graphics;
  /**
   * Up/down arrows. Created at scene level (NOT children of this container)
   * so callers can layer them independently — e.g., place wheel sprites under
   * the locker but keep the arrows on top.
   */
  public readonly arrows: Phaser.GameObjects.Text[];
  private readonly K: number;
  private readonly slotW: number;
  private readonly slotH: number;
  private readonly scrollMs: number;
  private readonly verticalNudge: number;
  private readonly wheelDisplayWidth: number;
  private activeTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, opts: DigitWheelOptions) {
    super(scene, x, y);

    this.slotW = opts.width;
    this.slotH = opts.height;
    this.scrollMs = opts.scrollDurationMs ?? 220;
    this.verticalNudge = opts.verticalNudge ?? -4;

    if (opts.cellsVisible != null) {
      this.K = this.slotW / (opts.cellsVisible * AVG_CELL_WIDTH);
    } else {
      this.K = this.slotH / DIGIT_GLYPH_HEIGHT;
    }

    this.wheelDisplayWidth = CODE_WHEEL_TOTAL_WIDTH * this.K;

    const wheelY = this.computeWheelY();
    const baseX = this.computeWheelX(0);

    const main = scene.add.image(baseX, wheelY, 'code_wheel', '__BASE');
    main.setScale(this.K);
    const left = scene.add.image(baseX - this.wheelDisplayWidth, wheelY, 'code_wheel', '__BASE');
    left.setScale(this.K);
    const right = scene.add.image(baseX + this.wheelDisplayWidth, wheelY, 'code_wheel', '__BASE');
    right.setScale(this.K);

    this.sprites = [main, left, right];
    this.add(this.sprites);

    this.maskGfx = scene.add.graphics();
    this.maskGfx.fillStyle(0xffffff, 1);
    this.maskGfx.fillRect(x - this.slotW / 2, y - this.slotH / 2, this.slotW, this.slotH);
    this.maskGfx.setVisible(false);
    const mask = this.maskGfx.createGeometryMask();
    for (const s of this.sprites) s.setMask(mask);
    this.once(Phaser.GameObjects.Events.DESTROY, () => this.maskGfx.destroy());

    const arrowGap = opts.arrowGap ?? 18;
    const arrowSize = opts.arrowSize ?? 24;
    const arrowColor = opts.arrowColor ?? '#efe4c8';
    const arrowHoverColor = opts.arrowHoverColor ?? '#ffffff';

    // Arrows live at scene level (world coords) so the caller can re-layer
    // them above the locker without dragging the wheel sprites with them.
    const lArr = this.makeArrow(scene, x - this.slotW / 2 - arrowGap, y, '◀', arrowSize, arrowColor, arrowHoverColor);
    lArr.on('pointerup', () => this.setValue(this.value - 1));
    const rArr = this.makeArrow(scene, x + this.slotW / 2 + arrowGap, y, '▶', arrowSize, arrowColor, arrowHoverColor);
    rArr.on('pointerup', () => this.setValue(this.value + 1));
    this.arrows = [lArr, rArr];
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      for (const a of this.arrows) a.destroy();
    });

    scene.add.existing(this);
  }

  private computeWheelX(digit: number): number {
    const cell = CODE_WHEEL_CELLS[digit];
    const cellCenterSrc = cell.x + cell.w / 2;
    return -(cellCenterSrc - WHEEL_CENTER_X) * this.K;
  }

  private computeWheelY(): number {
    return -(DIGIT_GLYPH_CENTER_Y - WHEEL_CENTER_Y) * this.K + this.verticalNudge;
  }

  private makeArrow(
    scene: Phaser.Scene,
    x: number,
    y: number,
    glyph: string,
    size: number,
    color: string,
    hoverColor: string,
  ): Phaser.GameObjects.Text {
    const arrow = scene.add
      .text(x, y, glyph, { fontFamily: 'serif', fontSize: `${size}px`, color })
      .setOrigin(0.5)
      .setAlpha(0.85)
      .setInteractive({ useHandCursor: true });
    arrow.on('pointerover', () => {
      arrow.setColor(hoverColor);
      arrow.setAlpha(1);
    });
    arrow.on('pointerout', () => {
      arrow.setColor(color);
      arrow.setAlpha(0.85);
    });
    return arrow;
  }

  setValue(n: number): void {
    const next = ((n % 10) + 10) % 10;
    if (next === this.value && !this.activeTween) return;
    this.value = next;

    const [main, left, right] = this.sprites;
    const canonicalTarget = this.computeWheelX(this.value);
    let delta = canonicalTarget - main.x;

    // Choose shortest visual direction; the off-screen wrap copy provides
    // continuous content when we cross either end of the strip.
    if (delta > this.wheelDisplayWidth / 2) {
      delta -= this.wheelDisplayWidth;
    } else if (delta < -this.wheelDisplayWidth / 2) {
      delta += this.wheelDisplayWidth;
    }

    if (this.activeTween) this.activeTween.stop();
    this.activeTween = this.scene.tweens.add({
      targets: this.sprites,
      x: `+=${delta}`,
      duration: this.scrollMs,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.activeTween = undefined;
        // Snap to canonical positions so subsequent operations don't drift.
        main.x = canonicalTarget;
        left.x = canonicalTarget - this.wheelDisplayWidth;
        right.x = canonicalTarget + this.wheelDisplayWidth;
      },
    });
  }

  getValue(): number {
    return this.value;
  }
}
