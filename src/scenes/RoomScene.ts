import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../main';
import { ROOM_ITEMS, RoomItem } from '../data/roomItems';
import { InteractionMarker } from '../objects/InteractionMarker';
import { CustomCursor } from '../objects/CustomCursor';
import { Modal } from '../ui/Modal';

const READY_BORDER_THICKNESS = 8;
const READY_BORDER_TARGET_ALPHA = 0.4;
const READY_BORDER_FADE_MS = 600;

export class RoomScene extends Phaser.Scene {
  private marker!: InteractionMarker;
  private items: RoomItem[] = ROOM_ITEMS;
  private modalOpen = false;

  constructor() {
    super('RoomScene');
  }

  create(): void {
    this.input.setDefaultCursor('none');

    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'room')
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    this.marker = new InteractionMarker(this);
    new CustomCursor(this);

    this.createReadyBorder();

    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    this.input.on(Phaser.Input.Events.POINTER_OUT, () => this.marker.hide());
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
  }

  private createReadyBorder(): void {
    const inset = READY_BORDER_THICKNESS / 2;
    const border = this.add.graphics();
    border.lineStyle(READY_BORDER_THICKNESS, 0xffffff, 1);
    border.strokeRect(inset, inset, GAME_WIDTH - READY_BORDER_THICKNESS, GAME_HEIGHT - READY_BORDER_THICKNESS);
    border.setAlpha(0);
    border.setDepth(800);
    this.tweens.add({
      targets: border,
      alpha: READY_BORDER_TARGET_ALPHA,
      duration: READY_BORDER_FADE_MS,
      ease: 'Sine.easeOut',
    });
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.modalOpen) return;
    const hit = this.findItemNear(pointer.worldX, pointer.worldY);
    if (hit) {
      this.marker.showAt(hit.x, hit.y);
    } else {
      this.marker.hide();
    }
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.modalOpen) return;
    const hit = this.findItemNear(pointer.worldX, pointer.worldY);
    if (hit) {
      this.openItemModal(hit);
    }
  }

  private openItemModal(item: RoomItem): void {
    this.modalOpen = true;
    this.marker.hide();
    this.input.setDefaultCursor('default');
    new Modal(this, {
      title: item.label,
      body: item.description,
      onClose: () => {
        this.modalOpen = false;
        this.input.setDefaultCursor('none');
      },
    });
  }

  private findItemNear(x: number, y: number): RoomItem | null {
    let closest: RoomItem | null = null;
    let closestDist = Infinity;
    for (const item of this.items) {
      const dx = x - item.x;
      const dy = y - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= item.hoverRadius && dist < closestDist) {
        closestDist = dist;
        closest = item;
      }
    }
    return closest;
  }
}
