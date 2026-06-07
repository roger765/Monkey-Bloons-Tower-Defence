import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants'
import { gameState } from '../game/GameState'
import { GameDifficulty } from '../types'

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' })
  }

  create(data: { isVictory: boolean }): void {
    const isVictory = data?.isVictory ?? gameState.isVictory

    // Semi-transparent overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75)

    if (isVictory) {
      this.showVictory()
    } else {
      this.showGameOver()
    }
  }

  private showVictory(): void {
    this.add.text(GAME_WIDTH / 2, 200, 'VICTORY!', {
      fontSize: '72px', color: '#FFD700', fontStyle: 'bold',
      stroke: '#AA7700', strokeThickness: 6,
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 290, `You survived Round ${gameState.round}!`, {
      fontSize: '24px', color: '#FFFFFF',
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 335, `Bloons Popped: ${gameState.totalBloonsPoppedAllTime.toLocaleString()}`, {
      fontSize: '18px', color: '#AAFFAA',
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 365, `Cash Earned: $${gameState.totalCashEarned.toLocaleString()}`, {
      fontSize: '18px', color: '#FFD700',
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 395, `Lives Remaining: ${gameState.lives}`, {
      fontSize: '18px', color: '#00FF80',
    }).setOrigin(0.5)

    this.makeButton(GAME_WIDTH / 2 - 120, 480, 'Play Again', 0x1a5a1a, () => {
      this.scene.start('GameScene')
    })
    this.makeButton(GAME_WIDTH / 2 + 120, 480, 'Main Menu', 0x1a2a5a, () => {
      this.scene.start('MainMenuScene')
    })
  }

  private showGameOver(): void {
    this.add.text(GAME_WIDTH / 2, 200, 'GAME OVER', {
      fontSize: '72px', color: '#FF4040', fontStyle: 'bold',
      stroke: '#AA0000', strokeThickness: 6,
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 290, `Lost on Round ${gameState.round}`, {
      fontSize: '24px', color: '#FFFFFF',
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 335, `Bloons Popped: ${gameState.totalBloonsPoppedAllTime.toLocaleString()}`, {
      fontSize: '18px', color: '#FFAAAA',
    }).setOrigin(0.5)

    const canContinue = gameState.difficulty !== GameDifficulty.Hard

    if (canContinue) {
      this.makeButton(GAME_WIDTH / 2 - 130, 430, 'Continue (+50 lives)', 0x1a5a1a, () => {
        gameState.lives = Math.min(gameState.maxLives, gameState.lives + 50)
        gameState.isGameOver = false
        this.scene.stop()
        this.scene.resume('GameScene')
        this.scene.stop('GameOverScene')
      })
    }

    this.makeButton(canContinue ? GAME_WIDTH / 2 + 110 : GAME_WIDTH / 2 - 90, 430, 'Retry', 0x3a2a1a, () => {
      this.scene.start('GameScene')
    })
    this.makeButton(canContinue ? GAME_WIDTH / 2 + 240 : GAME_WIDTH / 2 + 90, 430, 'Main Menu', 0x1a2a5a, () => {
      this.scene.start('MainMenuScene')
    })
  }

  private makeButton(x: number, y: number, label: string, color: number, callback: () => void): void {
    const btn = this.add.rectangle(x, y, 200, 50, color)
      .setStrokeStyle(2, 0x888888)
      .setInteractive({ useHandCursor: true })

    this.add.text(x, y, label, {
      fontSize: '16px', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5)

    btn.on('pointerdown', callback)
    btn.on('pointerover', () => btn.setFillStyle(color + 0x111111))
    btn.on('pointerout', () => btn.setFillStyle(color))
  }
}
