import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, HUD_TOP_HEIGHT, HUD_BOTTOM_HEIGHT } from '../constants'
import { gameState } from '../game/GameState'
import { Track } from '../game/Track'
import { MAP_CONFIGS } from '../game/Maps'
import { BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { TowerManager } from '../game/TowerManager'
import { RoundSystem } from '../game/RoundSystem'
import { HUD } from '../ui/HUD'
import { TowerShop } from '../ui/TowerShop'
import { TowerPanel } from '../ui/TowerPanel'
import { FreePlaySpawner } from '../ui/FreePlaySpawner'
import { TowerConfig } from '../types'
import { TOWER_CONFIGS } from '../data/towers'
import { SaveManager } from '../game/SaveManager'

export class GameScene extends Phaser.Scene {
  private track!: Track
  private bloonManager!: BloonManager
  private projectileManager!: ProjectileManager
  private towerManager!: TowerManager
  private roundSystem!: RoundSystem
  private hud!: HUD
  private shop!: TowerShop
  private towerPanel!: TowerPanel
  private freePlaySpawner: FreePlaySpawner | null = null
  private mapGraphics!: Phaser.GameObjects.Graphics
  private pauseOverlay!: Phaser.GameObjects.Rectangle
  private pauseText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'GameScene' })
  }

  preload(): void {
    for (const cfg of TOWER_CONFIGS) {
      if (cfg.image) this.load.image(cfg.id, cfg.image)

      // Tier 5 upgrade portraits — one per path
      const wikiName = cfg.id.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join('')
      for (const prefix of ['500', '050', '005'] as const) {
        this.load.image(
          `${cfg.id}_${prefix}`,
          `/assets/towers/webp-ready/${prefix}-${wikiName}.webp`
        )
      }
    }
  }

  create(): void {
    // Map graphics
    this.mapGraphics = this.add.graphics()
    this.mapGraphics.setDepth(0)

    // Track
    const mapCfg = MAP_CONFIGS[gameState.selectedMapId]
    this.track = new Track(this, mapCfg.waypoints, mapCfg.ponds, {
      grass: mapCfg.grassColor,
      track: mapCfg.trackColor,
      border: mapCfg.borderColor,
    })
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
      () => this.togglePause(),
      () => this.exitToMenu(),
      () => this.triggerParagon(),
      () => this.towerManager.checkParagonEligibility()
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

    this.towerPanel.onSaveNeeded(() => this.saveGame())

    // Round end callback
    this.roundSystem.onRoundEnd((round) => {
      this.towerManager.notifyRoundEnd()
      this.hud.showRoundBonus(100 + round, round)
      if (gameState.isFreePlay && round === gameState.endRound) {
        this.hud.showFreePlayBanner()
      }
      this.saveGame()
    })

    // Free Play bloon spawner panel
    if (gameState.isFreePlay) {
      this.freePlaySpawner = new FreePlaySpawner(this, (type, count, camo, regrow, fortified) => {
        this.roundSystem.injectSpawns(type, count, camo, regrow, fortified)
      })
    }

    // Restore towers from a saved game if one was pending
    if (SaveManager.pendingLoad) {
      this.towerManager.loadSavedTowers(SaveManager.pendingLoad.towers)
      SaveManager.pendingLoad = null
    }

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
        if (placed) {
          this.towerManager.selectTower(placed)
          this.saveGame()
        }
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

  private triggerParagon(): void {
    const eligible = this.towerManager.checkParagonEligibility()
    if (eligible.length === 0) return
    // Merge the first eligible tower type (or the only one)
    const paragon = this.towerManager.mergeToParagon(eligible[0].configId)
    if (paragon) {
      this.towerManager.selectTower(paragon)
      this.showParagonFanfare(eligible[0].name)
    }
  }

  private showParagonFanfare(name: string): void {
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60,
      `⬟ ${name.toUpperCase()} PARAGON\nDEGREE 1`, {
      fontSize: '32px', color: '#FFD700', fontStyle: 'bold',
      align: 'center', stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(300)

    this.tweens.add({
      targets: text,
      y: text.y - 80,
      alpha: 0,
      duration: 3000,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    })
  }

  private saveGame(): void {
    if (gameState.isFreePlay) return
    const towers = this.towerManager.getTowers().map(t => ({
      configId: t.config.id,
      x: t.x,
      y: t.y,
      upgradeTiers: [...t.upgradeTiers] as [number, number, number],
      targeting: t.targeting,
      totalSpent: t.totalSpent,
      isParagon: t.isParagon,
    }))
    SaveManager.writeSave({
      version: 1,
      mapId: gameState.selectedMapId,
      difficulty: gameState.difficulty,
      round: gameState.round,
      lives: gameState.lives,
      maxLives: gameState.maxLives,
      cash: gameState.cash,
      isFreePlay: gameState.isFreePlay,
      heroId: gameState.selectedHeroId,
      heroPlacedOnMap: gameState.heroPlacedOnMap,
      towers,
      savedAt: Date.now(),
    })
  }

  private exitToMenu(): void {
    this.saveGame()
    gameState.init(gameState.difficulty)
    this.scene.start('MainMenuScene')
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
      SaveManager.deleteSave(gameState.selectedMapId)
      this.scene.launch('GameOverScene', { isVictory: true })
      this.scene.pause('GameScene')
    }
  }
}
