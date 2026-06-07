import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, HUD_TOP_HEIGHT, HUD_BOTTOM_HEIGHT } from '../constants'
import { gameState } from '../game/GameState'
import { Track, MONKEY_MEADOW_WAYPOINTS } from '../game/Track'
import { BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { TowerManager } from '../game/TowerManager'
import { RoundSystem } from '../game/RoundSystem'
import { HUD } from '../ui/HUD'
import { TowerShop } from '../ui/TowerShop'
import { TowerPanel } from '../ui/TowerPanel'
import { TowerConfig } from '../types'

export class GameScene extends Phaser.Scene {
  private track!: Track
  private bloonManager!: BloonManager
  private projectileManager!: ProjectileManager
  private towerManager!: TowerManager
  private roundSystem!: RoundSystem
  private hud!: HUD
  private shop!: TowerShop
  private towerPanel!: TowerPanel
  private mapGraphics!: Phaser.GameObjects.Graphics
  private pauseOverlay!: Phaser.GameObjects.Rectangle
  private pauseText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    // Map graphics
    this.mapGraphics = this.add.graphics()
    this.mapGraphics.setDepth(0)

    // Track
    this.track = new Track(this, MONKEY_MEADOW_WAYPOINTS)
    this.track.draw(this.mapGraphics)

    // Systems
    this.bloonManager = new BloonManager(this, this.track)
    this.projectileManager = new ProjectileManager(this)
    this.towerManager = new TowerManager(this, this.bloonManager, this.projectileManager, this.track)
    this.roundSystem = new RoundSystem(this.bloonManager)

    // UI
    this.hud = new HUD(this)
    this.shop = new TowerShop(this)
    this.towerPanel = new TowerPanel(this, this.towerManager)

    // HUD callbacks
    this.hud.setCallbacks(
      () => this.startRound(),
      () => this.toggleSpeed(),
      () => this.togglePause()
    )

    // Shop selection
    this.shop.onTowerSelect((config: TowerConfig) => {
      this.towerManager.startPlacement(config)
    })

    // Tower selection callback
    this.towerManager.onTowerSelected((tower) => {
      this.towerPanel.setTower(tower)
      if (tower === null) this.shop.clearSelection()
    })

    // Round end callback
    this.roundSystem.onRoundEnd((round) => {
      this.hud.showRoundBonus(100 + round, round)
    })

    // Input
    this.setupInput()

    // Pause overlay
    this.pauseOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
    this.pauseOverlay.setDepth(200)
    this.pauseOverlay.setVisible(false)

    this.pauseText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'PAUSED\nClick or press Space to resume', {
      fontSize: '36px', color: '#FFFFFF', fontStyle: 'bold', align: 'center'
    }).setOrigin(0.5).setDepth(201).setVisible(false)

    this.pauseText.setInteractive()
    this.pauseText.on('pointerdown', () => this.togglePause())
  }

  private setupInput(): void {
    // Map click: place tower or deselect
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < HUD_TOP_HEIGHT || pointer.y > GAME_HEIGHT - HUD_BOTTOM_HEIGHT) return

      if (gameState.placingTowerId) {
        const placed = this.towerManager.placeTower(gameState.placingTowerId, pointer.x, pointer.y)
        if (placed) this.towerManager.selectTower(placed)
      } else {
        // 40×40 hit area → half-diagonal ≈ 28; use that as deselect guard radius
        const hitTower = this.towerManager.getTowers().some(t => {
          const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, t.x, t.y)
          return dist < 28
        })
        if (!hitTower) {
          this.towerManager.selectTower(null)
        }
      }
    })

    // Right-click: cancel placement
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.towerManager.cancelPlacement()
        this.shop.clearSelection()
      }
    })

    // Mouse move: update placement ring
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (gameState.placingTowerId) {
        this.towerManager.updatePlacementRing(pointer.x, pointer.y)
      }
    })

    // Keyboard
    const spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    spaceKey.on('down', () => {
      if (gameState.isPaused) {
        this.togglePause()
      } else if (!gameState.isWaveActive) {
        this.startRound()
      }
    })

    const escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    escKey.on('down', () => {
      this.towerManager.cancelPlacement()
      this.shop.clearSelection()
    })
  }

  private startRound(): void {
    if (gameState.isWaveActive || gameState.isGameOver || gameState.isVictory) return
    this.bloonManager.clear()
    this.projectileManager.clear()
    gameState.round++
    this.roundSystem.startRound(gameState.round)
  }

  private toggleSpeed(): void {
    gameState.gameSpeed = gameState.gameSpeed === 1 ? 3 : 1
    this.hud.showSpeedActive(gameState.gameSpeed === 3)
  }

  private togglePause(): void {
    gameState.isPaused = !gameState.isPaused
    this.pauseOverlay.setVisible(gameState.isPaused)
    this.pauseText.setVisible(gameState.isPaused)
  }

  update(time: number, delta: number): void {
    if (gameState.isPaused) return

    // Apply game speed to delta
    const scaledDelta = delta * gameState.gameSpeed

    // Update systems
    if (gameState.isWaveActive) {
      this.roundSystem.update(scaledDelta)
      this.bloonManager.update(scaledDelta, time)
      this.towerManager.update(scaledDelta, time)
      this.projectileManager.update(scaledDelta, this.bloonManager.getActiveBloons(), time)
    }

    // UI updates (always, for real-time feedback)
    this.hud.update()
    this.shop.update()
    this.towerPanel.update()

    // Check game over
    if (gameState.isGameOver && !this.scene.isActive('GameOverScene')) {
      this.scene.launch('GameOverScene', { isVictory: false })
      this.scene.pause('GameScene')
    }

    if (gameState.isVictory && !this.scene.isActive('GameOverScene')) {
      this.scene.launch('GameOverScene', { isVictory: true })
      this.scene.pause('GameScene')
    }
  }
}
