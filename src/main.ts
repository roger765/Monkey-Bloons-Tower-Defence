import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from './constants'
import { MainMenuScene } from './scenes/MainMenuScene'
import { MapSelectScene } from './scenes/MapSelectScene'
import { HeroSelectScene } from './scenes/HeroSelectScene'
import { DifficultyScene } from './scenes/DifficultyScene'
import { GameScene } from './scenes/GameScene'
import { GameOverScene } from './scenes/GameOverScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  parent: document.body,
  scene: [MainMenuScene, MapSelectScene, HeroSelectScene, DifficultyScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: false,
    antialias: true,
    antialiasGL: true,
  },
}

const game = new Phaser.Game(config)
export default game
