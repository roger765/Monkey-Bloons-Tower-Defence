import Phaser from 'phaser'
import { GameDifficulty } from '../types'
import { DIFFICULTIES, GAME_WIDTH, GAME_HEIGHT } from '../constants'
import { gameState } from '../game/GameState'
import { MAP_CONFIGS } from '../game/Maps'

export class DifficultyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DifficultyScene' })
  }

  create(): void {
    const mapCfg = MAP_CONFIGS[gameState.selectedMapId]

    // Background matching map grass colour (tinted dark)
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a2a1a)

    // Decorative bloons
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH)
      const y = Phaser.Math.Between(0, GAME_HEIGHT)
      const r = Phaser.Math.Between(4, 18)
      const colors = [0xFF2020, 0x2060FF, 0x20A020, 0xFFDD00, 0xFF80C0]
      this.add.arc(x, y, r, 0, 360, false, colors[Phaser.Math.Between(0, 4)], 0.3)
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 100, 'MONKEY BLOONS', {
      fontSize: '56px', color: '#FFD700', fontStyle: 'bold',
      stroke: '#AA7700', strokeThickness: 4,
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 160, 'TOWER DEFENCE', {
      fontSize: '26px', color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5)

    // Map badge
    this.add.text(GAME_WIDTH / 2, 215, `Map: ${mapCfg.name}`, {
      fontSize: '15px', color: mapCfg.difficultyColor,
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 255, 'Select Difficulty', {
      fontSize: '18px', color: '#AAAAAA',
    }).setOrigin(0.5)

    // Back button
    const backBtn = this.add.text(60, 30, '← Back', {
      fontSize: '16px', color: '#AAAAAA',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
    backBtn.on('pointerover', () => backBtn.setColor('#FFFFFF'))
    backBtn.on('pointerout', () => backBtn.setColor('#AAAAAA'))
    backBtn.on('pointerdown', () => this.scene.start('MapSelectScene'))

    // Difficulty buttons
    const difficulties = [GameDifficulty.Easy, GameDifficulty.Medium, GameDifficulty.Hard]
    const btnColors = [0x1a5a1a, 0x1a3a5a, 0x5a1a1a]
    const hoverColors = [0x2a8a2a, 0x2a5a8a, 0x8a2a2a]
    const labels = ['EASY', 'MEDIUM', 'HARD']
    const notes = [
      '200 lives · 0.85x cost · Win at Round 40',
      '150 lives · 1.0x cost · Win at Round 60',
      '100 lives · 1.08x cost · Win at Round 80',
    ]

    difficulties.forEach((diff, i) => {
      const y = 330 + i * 95
      const btn = this.add.rectangle(GAME_WIDTH / 2, y, 420, 74, btnColors[i])
        .setStrokeStyle(2, 0x666666)
        .setInteractive({ useHandCursor: true })

      this.add.text(GAME_WIDTH / 2, y - 13, labels[i], {
        fontSize: '24px', color: '#FFFFFF', fontStyle: 'bold',
      }).setOrigin(0.5)

      this.add.text(GAME_WIDTH / 2, y + 15, notes[i], {
        fontSize: '13px', color: '#CCCCCC',
      }).setOrigin(0.5)

      btn.on('pointerover', () => {
        btn.setFillStyle(hoverColors[i])
        this.tweens.add({ targets: btn, scaleX: 1.03, scaleY: 1.03, duration: 100 })
      })
      btn.on('pointerout', () => {
        btn.setFillStyle(btnColors[i])
        this.tweens.add({ targets: btn, scaleX: 1.0, scaleY: 1.0, duration: 100 })
      })
      btn.on('pointerdown', () => {
        gameState.init(diff)
        this.scene.start('GameScene')
      })
    })

    // Free Play button
    const fpY = 330 + 3 * 95
    const fpBtn = this.add.rectangle(GAME_WIDTH / 2, fpY, 420, 74, 0x4a2a6a)
      .setStrokeStyle(2, 0x9966cc)
      .setInteractive({ useHandCursor: true })

    this.add.text(GAME_WIDTH / 2, fpY - 13, 'FREE PLAY', {
      fontSize: '24px', color: '#DD88FF', fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, fpY + 15, '∞ lives · free towers · no game over', {
      fontSize: '13px', color: '#CCCCCC',
    }).setOrigin(0.5)

    fpBtn.on('pointerover', () => {
      fpBtn.setFillStyle(0x6a3a9a)
      this.tweens.add({ targets: fpBtn, scaleX: 1.03, scaleY: 1.03, duration: 100 })
    })
    fpBtn.on('pointerout', () => {
      fpBtn.setFillStyle(0x4a2a6a)
      this.tweens.add({ targets: fpBtn, scaleX: 1.0, scaleY: 1.0, duration: 100 })
    })
    fpBtn.on('pointerdown', () => {
      gameState.init(GameDifficulty.FreePlay)
      this.scene.start('GameScene')
    })
  }
}
