import Phaser from 'phaser'
import { TowerConfig } from '../types'
import { TOWER_CONFIGS } from '../data/towers'
import { HERO_CONFIGS } from '../data/heroes'
import { gameState } from '../game/GameState'
import { GAME_WIDTH, GAME_HEIGHT, HUD_BOTTOM_HEIGHT } from '../constants'

export class TowerShop {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private scrollContainer: Phaser.GameObjects.Container
  private buttons: { config: TowerConfig, bg: Phaser.GameObjects.Rectangle, label: Phaser.GameObjects.Text, costText: Phaser.GameObjects.Text, portrait: Phaser.GameObjects.Image | null }[] = []
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

    // Prepend selected hero (if any) before the regular tower list
    const heroConfig = gameState.selectedHeroId
      ? HERO_CONFIGS.find(h => h.id === gameState.selectedHeroId) ?? null
      : null
    const allConfigs: TowerConfig[] = heroConfig ? [heroConfig, ...TOWER_CONFIGS] : [...TOWER_CONFIGS]

    const totalContentWidth = startX + allConfigs.length * (btnW + padding) - padding + startX
    this.maxScroll = Math.max(0, totalContentWidth - GAME_WIDTH)

    // Touch-drag scroll state — shared across all button closures below.
    // isDragging stays true through the pointerup frame so button handlers can check it
    // before scene-level pointerup clears it (game object events fire first in Phaser 3).
    let touchInShop = false
    let touchStartX = 0
    let touchStartScrollX = 0
    let isDragging = false
    const DRAG_THRESHOLD = 8

    allConfigs.forEach((config, i) => {
      const x = startX + i * (btnW + padding) + btnW / 2
      const y = shopY + shopH / 2

      const isHero = config.isHero === true
      const btnBg = scene.add.rectangle(x, y, btnW, btnH, isHero ? 0x1a1400 : 0x1a2a3a)
        .setStrokeStyle(1, isHero ? 0xAA8800 : 0x3a5a7a)
        .setInteractive({ useHandCursor: true })

      // Portrait image (left side, 36×36)
      const imgX = x - 36
      let portrait: Phaser.GameObjects.Image | null = null
      if (config.image && scene.textures.exists(config.id)) {
        portrait = scene.add.image(imgX, y, config.id)
        portrait.setDisplaySize(36, 36)
      }

      // Text shifted right to make room for portrait
      const textX = x + 18
      const nameLabel = scene.add.text(textX, y - 8, config.name, {
        fontSize: '10px', color: '#FFFFFF',
      }).setOrigin(0.5)

      const costStr = isHero ? `$${config.cost}` : `$${gameState.scaledCost(config.cost)}`
      const costLabel = scene.add.text(textX, y + 8, costStr, {
        fontSize: '11px', color: isHero ? '#FFD700' : '#FFD700', fontStyle: 'bold',
      }).setOrigin(0.5)

      // Hero badge label (top-left corner of button) — added to scrollContainer so it scrolls
      let heroTag: Phaser.GameObjects.Text | null = null
      if (isHero) {
        heroTag = scene.add.text(x - btnW / 2 + 4, y - btnH / 2 + 3, 'HERO', {
          fontSize: '8px', color: '#FFD700', fontStyle: 'bold',
        })
      }

      // Selection fires on pointerup so a horizontal drag doesn't accidentally place a tower.
      btnBg.on('pointerup', () => {
        if (isDragging) return
        if (isHero) {
          if (gameState.heroPlacedOnMap) return
          if (gameState.cash < config.cost) return
        } else {
          if (!gameState.canAfford(config.cost)) return
        }
        this.selectedConfigId = config.id
        this.onSelectTower?.(config)
      })
      btnBg.on('pointerover', () => btnBg.setFillStyle(isHero ? 0x2a2000 : 0x2a3a4a))
      btnBg.on('pointerout', () => {
        const selColor = isHero ? 0x1a4a00 : 0x1a4a2a
        const defColor = isHero ? 0x1a1400 : 0x1a2a3a
        btnBg.setFillStyle(this.selectedConfigId === config.id ? selColor : defColor)
      })

      const toAdd: Phaser.GameObjects.GameObject[] = [btnBg, nameLabel, costLabel]
      if (portrait) toAdd.push(portrait)
      if (heroTag) toAdd.push(heroTag)
      this.scrollContainer.add(toAdd)
      this.buttons.push({ config, bg: btnBg, label: nameLabel, costText: costLabel, portrait })
    })

    // Touch-drag scroll: record where the touch started in the shop strip.
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < shopY || pointer.y > shopY + shopH) return
      touchInShop = true
      touchStartX = pointer.x
      touchStartScrollX = this.scrollX
      isDragging = false
    })

    // Drag the shop contents while the pointer is held and moving horizontally.
    // touchInShop stays true even if the finger drifts outside the strip vertically.
    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || !touchInShop) return
      const dx = touchStartX - pointer.x
      if (Math.abs(dx) > DRAG_THRESHOLD) {
        isDragging = true
        this.scrollX = Phaser.Math.Clamp(touchStartScrollX + dx, 0, this.maxScroll)
        this.scrollContainer.x = -this.scrollX
      }
    })

    // Reset drag state. Game-object pointerup fires before scene pointerup in Phaser 3,
    // so button handlers above can safely read isDragging before it clears here.
    scene.input.on('pointerup', () => {
      touchInShop = false
      isDragging = false
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
      const isHero = btn.config.isHero === true

      let affordable: boolean
      let costStr: string
      if (isHero) {
        affordable = !gameState.heroPlacedOnMap && gameState.cash >= btn.config.cost
        costStr = gameState.heroPlacedOnMap ? 'ON MAP' : `$${btn.config.cost}`
      } else {
        affordable = gameState.canAfford(btn.config.cost)
        costStr = `$${gameState.scaledCost(btn.config.cost)}`
      }

      const alpha = affordable ? 1.0 : 0.45
      btn.costText.setText(costStr)
      btn.bg.setAlpha(alpha)
      btn.label.setAlpha(alpha)
      btn.costText.setColor(affordable ? '#FFD700' : '#AA7700')
      if (btn.portrait) btn.portrait.setAlpha(alpha)

      if (this.selectedConfigId === btn.config.id) {
        btn.bg.setFillStyle(isHero ? 0x1a4a00 : 0x1a4a2a)
      }
    }
  }
}
