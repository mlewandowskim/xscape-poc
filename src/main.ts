import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { IntroScene } from './scenes/IntroScene';
import { RoomScene } from './scenes/RoomScene';
import { WinScene } from './scenes/WinScene';

export const GAME_WIDTH = 1376;
export const GAME_HEIGHT = 768;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, IntroScene, RoomScene, WinScene],
};

const game = new Phaser.Game(config);

if (import.meta.env.DEV) {
  (window as unknown as { game: Phaser.Game }).game = game;
}
