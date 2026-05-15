import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../main';

export interface ModalOptions {
  title: string;
  body: string;
  onClose?: () => void;
  width?: number;
  height?: number;
}

const PAPER_COLOR = 0xefe4c8;
const PAPER_BORDER_COLOR = 0x5a4a2a;
const INK_COLOR = '#2a1f0a';
const INK_MUTED = '#5a4a2a';
const OVERLAY_COLOR = 0x000000;
const OVERLAY_ALPHA = 0.6;

/**
 * Reusable centered modal with a paper-style card, dim overlay, and close button.
 * Closes on: X click, overlay click, or ESC. Calls onClose then destroys itself.
 */
export class Modal extends Phaser.GameObjects.Container {
  private readonly onCloseCb?: () => void;
  private escHandler?: (e: KeyboardEvent) => void;

  constructor(scene: Phaser.Scene, opts: ModalOptions) {
    super(scene, 0, 0);
    this.onCloseCb = opts.onClose;

    const w = opts.width ?? 640;
    const h = opts.height ?? 380;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const overlay = scene.add
      .rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, OVERLAY_COLOR, OVERLAY_ALPHA)
      .setInteractive();
    overlay.on('pointerup', () => this.close());

    const shadow = scene.add
      .rectangle(cx + 6, cy + 8, w, h, 0x000000, 0.45);
    shadow.setOrigin(0.5);

    const card = scene.add.rectangle(cx, cy, w, h, PAPER_COLOR, 1);
    card.setStrokeStyle(2, PAPER_BORDER_COLOR, 1);
    card.setInteractive();
    // Swallow clicks so they don't reach the overlay.
    card.on('pointerup', (_p: Phaser.Input.Pointer, _lx: number, _ly: number, ev: Phaser.Types.Input.EventData) => {
      ev.stopPropagation();
    });

    const title = scene.add
      .text(cx - w / 2 + 36, cy - h / 2 + 36, opts.title, {
        fontFamily: 'serif',
        fontSize: '32px',
        color: INK_COLOR,
        fontStyle: 'bold',
      })
      .setOrigin(0, 0);

    const rule = scene.add
      .rectangle(cx, cy - h / 2 + 88, w - 72, 1, PAPER_BORDER_COLOR, 0.5)
      .setOrigin(0.5);

    const body = scene.add
      .text(cx - w / 2 + 36, cy - h / 2 + 110, opts.body, {
        fontFamily: 'serif',
        fontSize: '20px',
        color: INK_COLOR,
        wordWrap: { width: w - 72 },
        lineSpacing: 6,
      })
      .setOrigin(0, 0);

    const closeBtn = scene.add
      .text(cx + w / 2 - 22, cy - h / 2 + 12, '×', {
        fontFamily: 'serif',
        fontSize: '36px',
        color: INK_MUTED,
      })
      .setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor(INK_COLOR));
    closeBtn.on('pointerout', () => closeBtn.setColor(INK_MUTED));
    closeBtn.on('pointerup', (_p: Phaser.Input.Pointer, _lx: number, _ly: number, ev: Phaser.Types.Input.EventData) => {
      ev.stopPropagation();
      this.close();
    });

    this.add([overlay, shadow, card, title, rule, body, closeBtn]);
    this.setDepth(5000);
    scene.add.existing(this);

    this.escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.close();
    };
    window.addEventListener('keydown', this.escHandler);

    // Fade in
    this.setAlpha(0);
    scene.tweens.add({ targets: this, alpha: 1, duration: 180, ease: 'Sine.easeOut' });
  }

  close(): void {
    if (this.escHandler) {
      window.removeEventListener('keydown', this.escHandler);
      this.escHandler = undefined;
    }
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 140,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.onCloseCb?.();
        this.destroy();
      },
    });
  }
}
