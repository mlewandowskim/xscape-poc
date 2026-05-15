import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../main';
import { DigitWheel } from '../objects/DigitWheel';

export interface LockerModalOptions {
  onWin: () => void;
  onClose?: () => void;
}

const CORRECT_CODE = [2, 1, 3, 7];

const LOCKER_SOURCE_SIZE = 1254;
const LOCKER_DISPLAY_SIZE = 600;
const LOCKER_SCALE = LOCKER_DISPLAY_SIZE / LOCKER_SOURCE_SIZE;

/** Slots measured from locker.png — center in source coords + source size. */
const SLOTS_SOURCE = [
  { x: 597, y: 477, w: 206, h: 60 },
  { x: 598, y: 568, w: 206, h: 60 },
  { x: 598, y: 656, w: 206, h: 60 },
  { x: 598, y: 746, w: 206, h: 60 },
];

const OVERLAY_COLOR = 0x000000;
const OVERLAY_ALPHA = 0.7;
const STATUS_WRONG_COLOR = '#d24a4a';

export class LockerModal extends Phaser.GameObjects.Container {
  private readonly wheels: DigitWheel[] = [];
  private readonly statusText: Phaser.GameObjects.Text;
  private readonly onCloseCb?: () => void;
  private readonly onWinCb: () => void;
  private escHandler?: (e: KeyboardEvent) => void;
  private finished = false;

  constructor(scene: Phaser.Scene, opts: LockerModalOptions) {
    super(scene, 0, 0);
    this.onCloseCb = opts.onClose;
    this.onWinCb = opts.onWin;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const overlay = scene.add
      .rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, OVERLAY_COLOR, OVERLAY_ALPHA)
      .setInteractive();
    let overlayArmed = false;
    overlay.on('pointerdown', () => {
      overlayArmed = true;
    });
    overlay.on('pointerup', () => {
      if (overlayArmed) {
        overlayArmed = false;
        this.close();
      }
    });

    const locker = scene.add.image(cx, cy, 'locker');
    locker.setDisplaySize(LOCKER_DISPLAY_SIZE, LOCKER_DISPLAY_SIZE);
    locker.setInteractive();
    locker.on('pointerdown', (_p: Phaser.Input.Pointer, _lx: number, _ly: number, ev: Phaser.Types.Input.EventData) => {
      ev.stopPropagation();
    });
    locker.on('pointerup', (_p: Phaser.Input.Pointer, _lx: number, _ly: number, ev: Phaser.Types.Input.EventData) => {
      ev.stopPropagation();
    });

    const lockerLeft = cx - LOCKER_DISPLAY_SIZE / 2;
    const lockerTop = cy - LOCKER_DISPLAY_SIZE / 2;

    const wheels: DigitWheel[] = [];
    SLOTS_SOURCE.forEach((s) => {
      const wx = lockerLeft + s.x * LOCKER_SCALE;
      const wy = lockerTop + s.y * LOCKER_SCALE;
      const ww = s.w * LOCKER_SCALE;
      const wh = s.h * LOCKER_SCALE;
      const wheel = new DigitWheel(scene, wx, wy, { width: ww, height: wh });
      wheels.push(wheel);
    });
    this.wheels = wheels;

    const tryBtn = this.makeButton(scene, cx, cy + LOCKER_DISPLAY_SIZE / 2 + 56, 'Try', () =>
      this.attemptCode(),
    );

    this.statusText = scene.add
      .text(cx, cy + LOCKER_DISPLAY_SIZE / 2 + 110, '', {
        fontFamily: 'serif',
        fontSize: '22px',
        color: STATUS_WRONG_COLOR,
      })
      .setOrigin(0.5);

    const closeBtn = scene.add
      .text(cx + LOCKER_DISPLAY_SIZE / 2 + 24, cy - LOCKER_DISPLAY_SIZE / 2 - 24, '×', {
        fontFamily: 'serif',
        fontSize: '40px',
        color: '#efe4c8',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    let closeArmed = false;
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout', () => {
      closeBtn.setColor('#efe4c8');
      closeArmed = false;
    });
    closeBtn.on('pointerdown', (_p: Phaser.Input.Pointer, _lx: number, _ly: number, ev: Phaser.Types.Input.EventData) => {
      ev.stopPropagation();
      closeArmed = true;
    });
    closeBtn.on('pointerup', (_p: Phaser.Input.Pointer, _lx: number, _ly: number, ev: Phaser.Types.Input.EventData) => {
      ev.stopPropagation();
      if (closeArmed) {
        closeArmed = false;
        this.close();
      }
    });

    const wheelArrows = wheels.flatMap((w) => w.arrows);
    this.add([overlay, ...wheels, locker, ...wheelArrows, tryBtn, this.statusText, closeBtn]);
    this.setDepth(5000);
    scene.add.existing(this);

    this.escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.close();
    };
    window.addEventListener('keydown', this.escHandler);

    this.setAlpha(0);
    scene.tweens.add({ targets: this, alpha: 1, duration: 180, ease: 'Sine.easeOut' });
  }

  private attemptCode(): void {
    const code = this.wheels.map((w) => w.getValue());
    const correct = code.every((d, i) => d === CORRECT_CODE[i]);
    if (correct) {
      this.statusText.setColor('#a7f3a7');
      this.statusText.setText('Unlocked!');
      this.finished = true;
      this.scene.time.delayedCall(500, () => {
        if (this.escHandler) {
          window.removeEventListener('keydown', this.escHandler);
          this.escHandler = undefined;
        }
        this.onWinCb();
        this.destroy();
      });
    } else {
      this.statusText.setColor(STATUS_WRONG_COLOR);
      this.statusText.setText('Wrong combination. Try again.');
    }
  }

  private makeButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    onPress: () => void,
  ): Phaser.GameObjects.Container {
    const w = 160;
    const h = 48;
    const container = scene.add.container(x, y);
    const bg = scene.add.rectangle(0, 0, w, h, 0xefe4c8, 1).setStrokeStyle(2, 0x5a4a2a, 1);
    const txt = scene.add
      .text(0, 0, label, {
        fontFamily: 'serif',
        fontSize: '24px',
        color: '#2a1f0a',
      })
      .setOrigin(0.5);
    container.add([bg, txt]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    let armed = false;
    container.on('pointerover', () => bg.setFillStyle(0xffffff, 1));
    container.on('pointerout', () => {
      bg.setFillStyle(0xefe4c8, 1);
      armed = false;
    });
    container.on('pointerdown', (_p: Phaser.Input.Pointer, _lx: number, _ly: number, ev: Phaser.Types.Input.EventData) => {
      ev.stopPropagation();
      armed = true;
      bg.setFillStyle(0xc7c0ac, 1);
    });
    container.on('pointerup', (_p: Phaser.Input.Pointer, _lx: number, _ly: number, ev: Phaser.Types.Input.EventData) => {
      ev.stopPropagation();
      bg.setFillStyle(0xffffff, 1);
      if (armed) {
        armed = false;
        onPress();
      }
    });
    return container;
  }

  close(): void {
    if (this.finished) return;
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
