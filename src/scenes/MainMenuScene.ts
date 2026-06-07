import Phaser from 'phaser'
import { GameDifficulty } from '../types'
import { DIFFICULTIES, GAME_WIDTH, GAME_HEIGHT } from '../constants'
import { gameState } from '../game/GameState'

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' })
  }

  create(): void {
    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a2a1a)

    // Decorative elements
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH)
      const y = Phaser.Math.Between(0, GAME_HEIGHT)
      const r = Phaser.Math.Between(4, 18)
      const colors = [0xFF2020, 0x2060FF, 0x20A020, 0xFFDD00, 0xFF80C0]
      this.add.arc(x, y, r, 0, 360, false, colors[Phaser.Math.Between(0, 4)], 0.3)
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 120, 'TEDDY BLOONS', {
      fontSize: '64px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#AA7700',
      strokeThickness: 4,
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 190, 'TOWER DEFENCE', {
      fontSize: '32px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 240, 'Select Difficulty', {
      fontSize: '18px',
      color: '#AAAAAA',
    }).setOrigin(0.5)

    // Difficulty buttons
    const difficulties = [GameDifficulty.Easy, GameDifficulty.Medium, GameDifficulty.Hard]
    const btnColors = [0x1a5a1a, 0x1a3a5a, 0x5a1a1a]
    const hoverColors = [0x2a8a2a, 0x2a5a8a, 0x8a2a2a]
    const labels = ['EASY', 'MEDIUM', 'HARD']
    const notes = ['200 lives · 0.85x cost · Win at Round 40', '150 lives · 1.0x cost · Win at Round 60', '100 lives · 1.08x cost · Win at Round 80']

    difficulties.forEach((diff, i) => {
      const y = 320 + i * 90
      const btn = this.add.rectangle(GAME_WIDTH / 2, y, 400, 70, btnColors[i])
        .setStrokeStyle(2, 0x666666)
        .setInteractive({ useHandCursor: true })

      const label = this.add.text(GAME_WIDTH / 2, y - 12, labels[i], {
        fontSize: '24px',
        color: '#FFFFFF',
        fontStyle: 'bold',
      }).setOrigin(0.5)

      const note = this.add.text(GAME_WIDTH / 2, y + 14, notes[i], {
        fontSize: '13px',
        color: '#CCCCCC',
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

    // Version note
    this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 10, 'Phase 1 · v0.1', {
      fontSize: '11px', color: '#555555'
    }).setOrigin(1, 1)
  }
}
