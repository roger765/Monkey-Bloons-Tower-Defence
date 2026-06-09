import Phaser from 'phaser'
import { gameState } from '../game/GameState'
import { GAME_WIDTH, GAME_HEIGHT, HUD_TOP_HEIGHT, COLORS } from '../constants'

export class HUD {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private roundText: Phaser.GameObjects.Text
  private livesText: Phaser.GameObjects.Text
  private cashText: Phaser.GameObjects.Text
  private speedBtn: Phaser.GameObjects.Text
  private pauseBtn: Phaser.GameObjects.Text
  private startBtn: Phaser.GameObjects.Text
  private onStartRound: (() => void) | null = null
  private onToggleSpeed: (() => void) | null = null
  private onPause: (() => void) | null = null
  private onExit: (() => void) | null = null
  private onParagonMerge: (() => void) | null = null
  private getParagonEligible: (() => { configId: string; name: string }[]) | null = null
  private paragonBtn: Phaser.GameObjects.Text
  private floatingTexts: Phaser.GameObjects.Text[] = []

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.container = scene.add.container(0, 0)
    this.container.setDepth(100)

    // Background bar
    const bg = scene.add.rectangle(GAME_WIDTH / 2, HUD_TOP_HEIGHT / 2, GAME_WIDTH, HUD_TOP_HEIGHT, 0x1a1a2e)
    bg.setStrokeStyle(1, 0x334466)
    this.container.add(bg)

    // Round text
    this.roundText = scene.add.text(20, HUD_TOP_HEIGHT / 2, 'Round 0/40', {
      fontSize: '16px', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0, 0.5)
    this.container.add(this.roundText)

    // Lives text
    this.livesText = scene.add.text(220, HUD_TOP_HEIGHT / 2, '♥ 200', {
      fontSize: '16px', color: '#00FF80', fontStyle: 'bold'
    }).setOrigin(0, 0.5)
    this.container.add(this.livesText)

    // Cash text — click to set a custom amount
    this.cashText = scene.add.text(380, HUD_TOP_HEIGHT / 2, '$ 650', {
      fontSize: '16px', color: '#FFD700', fontStyle: 'bold'
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
    this.cashText.on('pointerover', () => this.cashText.setColor('#FFEE88'))
    this.cashText.on('pointerout', () => this.cashText.setColor('#FFD700'))
    this.cashText.on('pointerdown', () => {
      const input = window.prompt('Set cash amount:', String(gameState.cash))
      if (input === null) return
      const value = parseInt(input, 10)
      if (!isNaN(value) && value >= 0) gameState.cash = value
    })
    this.container.add(this.cashText)

    // Exit button
    const exitBtn = scene.add.text(GAME_WIDTH - 270, HUD_TOP_HEIGHT / 2, '✕ Menu', {
      fontSize: '15px', color: '#FF6666',
      backgroundColor: '#3a1a1a',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    exitBtn.on('pointerdown', () => this.onExit?.())
    exitBtn.on('pointerover', () => exitBtn.setColor('#FF9999'))
    exitBtn.on('pointerout', () => exitBtn.setColor('#FF6666'))
    this.container.add(exitBtn)

    // Speed button
    this.speedBtn = scene.add.text(GAME_WIDTH - 160, HUD_TOP_HEIGHT / 2, '>> 1x', {
      fontSize: '15px', color: '#AAAAAA',
      backgroundColor: '#2a2a4a',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    this.speedBtn.on('pointerdown', () => this.onToggleSpeed?.())
    this.speedBtn.on('pointerover', () => this.speedBtn.setColor('#FFFFFF'))
    this.speedBtn.on('pointerout', () => this.updateSpeedBtn())
    this.container.add(this.speedBtn)

    // Pause button
    this.pauseBtn = scene.add.text(GAME_WIDTH - 70, HUD_TOP_HEIGHT / 2, '|| Pause', {
      fontSize: '15px', color: '#AAAAAA',
      backgroundColor: '#2a2a4a',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    this.pauseBtn.on('pointerdown', () => this.onPause?.())
    this.container.add(this.pauseBtn)

    // Start round button (centered, shows between rounds)
    this.startBtn = scene.add.text(GAME_WIDTH / 2, HUD_TOP_HEIGHT / 2, '▶ Start Round 1', {
      fontSize: '16px', color: '#FFFFFF',
      backgroundColor: '#1a5a1a',
      padding: { x: 12, y: 6 },
      fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    this.startBtn.on('pointerdown', () => this.onStartRound?.())
    this.startBtn.on('pointerover', () => this.startBtn.setBackgroundColor('#2a8a2a'))
    this.startBtn.on('pointerout', () => this.startBtn.setBackgroundColor('#1a5a1a'))
    this.container.add(this.startBtn)

    // Paragon merge button (hidden until 3 matching tier-5 towers are placed)
    this.paragonBtn = scene.add.text(GAME_WIDTH / 2 + 150, HUD_TOP_HEIGHT / 2, '⬟ Paragon', {
      fontSize: '15px', color: '#1a1a00',
      backgroundColor: '#FFD700',
      padding: { x: 10, y: 5 },
      fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false)
    this.paragonBtn.on('pointerdown', () => this.onParagonMerge?.())
    this.paragonBtn.on('pointerover', () => this.paragonBtn.setBackgroundColor('#FFEE44'))
    this.paragonBtn.on('pointerout', () => this.paragonBtn.setBackgroundColor('#FFD700'))
    this.container.add(this.paragonBtn)
  }

  setCallbacks(
    onStart: () => void,
    onSpeed: () => void,
    onPause: () => void,
    onExit: () => void,
    onParagon: () => void,
    getParagonEligible: () => { configId: string; name: string }[]
  ): void {
    this.onStartRound = onStart
    this.onToggleSpeed = onSpeed
    this.onPause = onPause
    this.onExit = onExit
    this.onParagonMerge = onParagon
    this.getParagonEligible = getParagonEligible
  }

  update(): void {
    // Round
    if (gameState.isFreePlay) {
      this.roundText.setText(`Round ${gameState.round} ∞`)
      this.roundText.setColor('#FF88FF')
    } else {
      this.roundText.setText(`Round ${gameState.round}/${gameState.endRound}`)
      this.roundText.setColor('#FFFFFF')
    }

    // Lives with color
    const pct = gameState.lives / gameState.maxLives
    const livesColor = pct > 0.5 ? '#00FF80' : pct > 0.25 ? '#FFD700' : '#FF4040'
    this.livesText.setColor(livesColor)
    this.livesText.setText(`♥ ${gameState.lives}`)

    // Cash
    this.cashText.setText(`$ ${gameState.cash.toLocaleString()}`)

    // Start button
    const canStart = !gameState.isWaveActive && !gameState.isGameOver && !gameState.isVictory && !gameState.isPaused
    this.startBtn.setVisible(canStart)
    if (!gameState.isWaveActive) {
      this.startBtn.setText(`▶ Start Round ${gameState.round + 1}`)
    }

    // Paragon button
    const eligible = this.getParagonEligible?.() ?? []
    const showParagon = canStart && eligible.length > 0
    this.paragonBtn.setVisible(showParagon)
    if (showParagon) {
      const label = eligible.length === 1 ? `⬟ ${eligible[0].name} Paragon` : `⬟ Paragon (${eligible.length})`
      this.paragonBtn.setText(label)
    }
  }

  showFreePlayBanner(): void {
    const banner = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '🎉 FREE PLAY UNLOCKED!\nKeep going until you fall!', {
      fontSize: '28px',
      color: '#FF88FF',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(300)

    this.scene.tweens.add({
      targets: banner,
      y: banner.y - 60,
      alpha: 0,
      duration: 3000,
      ease: 'Power2',
      onComplete: () => banner.destroy(),
    })
  }

  private updateSpeedBtn(): void {
    const isfast = gameState.gameSpeed > 1
    this.speedBtn.setText(isfast ? '>> 3x' : '>> 1x')
    this.speedBtn.setColor(isfast ? '#FFD700' : '#AAAAAA')
  }

  showSpeedActive(active: boolean): void {
    this.speedBtn.setText(active ? '>> 3x' : '>> 1x')
    this.speedBtn.setColor(active ? '#FFD700' : '#AAAAAA')
  }

  showRoundBonus(amount: number, round: number): void {
    const text = this.scene.add.text(
      GAME_WIDTH / 2, 80,
      `+$${amount} (Round ${round} bonus)`,
      { fontSize: '18px', color: '#FFD700', fontStyle: 'bold' }
    ).setOrigin(0.5).setDepth(200)

    this.scene.tweens.add({
      targets: text,
      y: 40,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    })
  }

  showFloatingCash(amount: number, x: number, y: number): void {
    if (amount <= 0) return
    const text = this.scene.add.text(x, y, `+$${amount}`, {
      fontSize: '13px', color: '#FFD700'
    }).setOrigin(0.5).setDepth(200)

    this.scene.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 800,
      ease: 'Power1',
      onComplete: () => text.destroy(),
    })
  }
}
