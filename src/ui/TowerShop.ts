import Phaser from 'phaser'
import { TowerConfig } from '../types'
import { TOWER_CONFIGS } from '../data/towers'
import { gameState } from '../game/GameState'
import { GAME_WIDTH, GAME_HEIGHT, HUD_BOTTOM_HEIGHT } from '../constants'

export class TowerShop {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private scrollContainer: Phaser.GameObjects.Container
  private buttons: { config: TowerConfig, bg: Phaser.GameObjects.Rectangle, label: Phaser.GameObjects.Text, costText: Phaser.GameObjects.Text }[] = []
  private onSelectTower: ((config: TowerConfig) => void) | null = null
  private selectedConfigId: string | null = null
  private scrollX: number = 0
  private maxScroll: number = 0

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.container = scene.add.container(0, 0)
    this.container.setDepth(90)

    const shopY = GAME_HEIGHT - HUD_BOTTOM_HEIGHT
    const shopH = 55

    // Background (stays fixed while buttons scroll beneath it)
    const bg = scene.add.rectangle(GAME_WIDTH / 2, shopY + shopH / 2, GAME_WIDTH, shopH, 0x0d1b2a)
    bg.setStrokeStyle(1, 0x334466)
    this.container.add(bg)

    const btnW = 120
    const btnH = 46
    const padding = 8
    const startX = 10

    // Separate container so we can translate it horizontally for scrolling
    this.scrollContainer = scene.add.container(0, 0)
    this.scrollContainer.setDepth(91)

    // Mask clips the scrollable buttons to the shop strip — created with add:false so it
    // writes only to the stencil buffer and never appears as a visible rectangle.
    const maskShape = scene.make.graphics({ add: false } as Phaser.Types.GameObjects.Graphics.Options)
    maskShape.fillRect(0, shopY, GAME_WIDTH, shopH)
    this.scrollContainer.setMask(maskShape.createGeometryMask())

    const totalContentWidth = startX + TOWER_CONFIGS.length * (btnW + padding) - padding + startX
    this.maxScroll = Math.max(0, totalContentWidth - GAME_WIDTH)

    TOWER_CONFIGS.forEach((config, i) => {
      const x = startX + i * (btnW + padding) + btnW / 2
      const y = shopY + shopH / 2

      const btnBg = scene.add.rectangle(x, y, btnW, btnH, 0x1a2a3a)
        .setStrokeStyle(1, 0x3a5a7a)
        .setInteractive({ useHandCursor: true })

      const nameLabel = scene.add.text(x, y - 8, config.name, {
        fontSize: '11px', color: '#FFFFFF',
      }).setOrigin(0.5)

      const costLabel = scene.add.text(x, y + 8, `$${gameState.scaledCost(config.cost)}`, {
        fontSize: '12px', color: '#FFD700', fontStyle: 'bold',
      }).setOrigin(0.5)

      btnBg.on('pointerdown', () => {
        if (!gameState.canAfford(config.cost)) return
        this.selectedConfigId = config.id
        this.onSelectTower?.(config)
      })
      btnBg.on('pointerover', () => btnBg.setFillStyle(0x2a3a4a))
      btnBg.on('pointerout', () => {
        btnBg.setFillStyle(this.selectedConfigId === config.id ? 0x1a4a2a : 0x1a2a3a)
      })

      this.scrollContainer.add([btnBg, nameLabel, costLabel])
      this.buttons.push({ config, bg: btnBg, label: nameLabel, costText: costLabel })
    })

    // Scroll horizontally when the mouse wheel fires over the shop strip.
    // deltaX handles trackpad two-finger swipes; deltaY handles regular scroll wheels.
    scene.input.on('wheel', (
      pointer: Phaser.Input.Pointer,
      _gameObjects: unknown[],
      deltaX: number,
      deltaY: number,
    ) => {
      if (pointer.y < shopY || pointer.y > shopY + shopH) return
      const delta = deltaX !== 0 ? deltaX : deltaY
      this.scrollX = Phaser.Math.Clamp(this.scrollX + delta, 0, this.maxScroll)
      this.scrollContainer.x = -this.scrollX
    })
  }

  onTowerSelect(callback: (config: TowerConfig) => void): void {
    this.onSelectTower = callback
  }

  clearSelection(): void {
    this.selectedConfigId = null
    for (const btn of this.buttons) {
      btn.bg.setFillStyle(0x1a2a3a)
    }
  }

  update(): void {
    for (const btn of this.buttons) {
      const affordable = gameState.canAfford(btn.config.cost)
      btn.costText.setText(`$${gameState.scaledCost(btn.config.cost)}`)
      btn.bg.setAlpha(affordable ? 1.0 : 0.45)
      btn.label.setAlpha(affordable ? 1.0 : 0.45)
      btn.costText.setColor(affordable ? '#FFD700' : '#AA7700')

      if (this.selectedConfigId === btn.config.id) {
        btn.bg.setFillStyle(0x1a4a2a)
      }
    }
  }
}
