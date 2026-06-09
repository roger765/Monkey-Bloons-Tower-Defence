import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants'

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' })
  }

  create(): void {
    // Immediately hand off to map selection — kept as the entry point so
    // "Main Menu" buttons in other scenes have a stable target.
    this.scene.start('MapSelectScene')
  }
}
