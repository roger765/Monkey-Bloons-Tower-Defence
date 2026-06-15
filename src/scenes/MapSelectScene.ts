import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, HUD_TOP_HEIGHT, HUD_BOTTOM_HEIGHT, TRACK_WIDTH } from '../constants'
import { MapId } from '../types'
import { gameState } from '../game/GameState'
import { MAP_CONFIGS, MapConfig } from '../game/Maps'
import { HERO_CONFIGS } from '../data/heroes'
import { SaveManager } from '../game/SaveManager'

const MAP_TOP = HUD_TOP_HEIGHT
const MAP_H = (GAME_HEIGHT - HUD_BOTTOM_HEIGHT) - MAP_TOP  // 560

// Grid: 5 columns × 2 rows
const COLS = 5
const CARD_W = 236
const CARD_H = 190
const GAP_X = 15
const GAP_Y = 16
const PREV_W = CARD_W - 20       // 216
const PREV_H = 95                // ≈ 216/1280 * 560
const PREV_PAD_X = 10
const PREV_PAD_Y = 8
const GRID_START_X = (GAME_WIDTH - (COLS * CARD_W + (COLS - 1) * GAP_X)) / 2
const GRID_START_Y = 158

// Display order: difficulty progression left-to-right, top-to-bottom
const MAP_ORDER: MapId[] = [
  MapId.MonkeyMeadow, MapId.SunsetSavanna,
  MapId.FrozenTundra, MapId.CandyCanyon, MapId.AncientRuins,
  MapId.LavaLair, MapId.DeepSea, MapId.DarkCastle,
  MapId.StormRidge, MapId.NeonCity,
]

export class MapSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MapSelectScene' })
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a2a1a)

    // Decorative bloons
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH)
      const y = Phaser.Math.Between(0, GAME_HEIGHT)
      const r = Phaser.Math.Between(4, 18)
      const colors = [0xFF2020, 0x2060FF, 0x20A020, 0xFFDD00, 0xFF80C0]
      this.add.arc(x, y, r, 0, 360, false, colors[Phaser.Math.Between(0, 4)], 0.3)
    }

    this.add.text(GAME_WIDTH / 2, 42, 'MONKEY BLOONS', {
      fontSize: '48px', color: '#FFD700', fontStyle: 'bold',
      stroke: '#AA7700', strokeThickness: 4,
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 94, 'TOWER DEFENCE', {
      fontSize: '22px', color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 130, 'Select a Map', {
      fontSize: '16px', color: '#AAAAAA',
    }).setOrigin(0.5)

    MAP_ORDER.forEach((id, i) => {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const cardX = GRID_START_X + col * (CARD_W + GAP_X)
      const cardY = GRID_START_Y + row * (CARD_H + GAP_Y)
      this.createCard(MAP_CONFIGS[id], cardX, cardY)
    })

    this.createHeroShopButton()

    this.add.text(GAME_WIDTH - 10, GAME_HEIGHT - 10, 'Phase 1 · v0.1', {
      fontSize: '11px', color: '#555555',
    }).setOrigin(1, 1)
  }

  private createCard(cfg: MapConfig, cardX: number, cardY: number): void {
    const card = this.add.rectangle(
      cardX + CARD_W / 2,
      cardY + CARD_H / 2,
      CARD_W, CARD_H,
      0x111a11,
    ).setStrokeStyle(2, 0x446644).setInteractive({ useHandCursor: true })

    // Mini preview
    const gfx = this.add.graphics()
    this.drawMiniPreview(gfx, cfg, cardX + PREV_PAD_X, cardY + PREV_PAD_Y)

    // Preview border frame
    this.add.rectangle(
      cardX + PREV_PAD_X + PREV_W / 2,
      cardY + PREV_PAD_Y + PREV_H / 2,
      PREV_W, PREV_H,
    ).setStrokeStyle(1, 0x446644).setFillStyle(0, 0)

    const cx = cardX + CARD_W / 2
    const textTop = cardY + PREV_PAD_Y + PREV_H

    this.add.text(cx, textTop + 14, cfg.name, {
      fontSize: '13px', color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(cx, textTop + 31, cfg.description, {
      fontSize: '10px', color: '#999999',
    }).setOrigin(0.5)

    // Difficulty badge
    const badgeY = textTop + 58
    const diffColor = parseInt(cfg.difficultyColor.slice(1), 16)
    this.add.rectangle(cx, badgeY, 110, 20, 0x1a1a1a).setStrokeStyle(1, diffColor)
    this.add.text(cx, badgeY, cfg.difficulty, {
      fontSize: '10px', color: cfg.difficultyColor, fontStyle: 'bold',
    }).setOrigin(0.5)

    // Save-slot indicator — green dot on cards that have a save
    if (SaveManager.hasSave(cfg.id)) {
      this.add.arc(cardX + CARD_W - 14, cardY + 14, 6, 0, 360, false, 0x44FF44, 1)
        .setStrokeStyle(1, 0x008800)
      this.add.text(cardX + CARD_W - 14, cardY + 14, '●', {
        fontSize: '8px', color: '#44FF44',
      }).setOrigin(0.5).setVisible(false)
    }

    // Hover + click
    card.on('pointerover', () => {
      card.setFillStyle(0x1a2e1a).setStrokeStyle(2, diffColor)
      this.tweens.add({ targets: card, scaleX: 1.02, scaleY: 1.02, duration: 80 })
    })
    card.on('pointerout', () => {
      card.setFillStyle(0x111a11).setStrokeStyle(2, 0x446644)
      this.tweens.add({ targets: card, scaleX: 1.0, scaleY: 1.0, duration: 80 })
    })
    card.on('pointerdown', () => {
      gameState.selectedMapId = cfg.id
      if (SaveManager.hasSave(cfg.id)) {
        this.showContinueDialog(cfg)
      } else {
        this.scene.start('DifficultyScene')
      }
    })
  }

  private createHeroShopButton(): void {
    const selectedHero = gameState.selectedHeroId
      ? HERO_CONFIGS.find(h => h.id === gameState.selectedHeroId)
      : null

    const label = selectedHero ? `♛  Hero: ${selectedHero.name}` : '♛  Hero Shop'
    const hasBg = selectedHero ? 0x1a1600 : 0x111a11
    const hasBorder = selectedHero ? 0xFFD700 : 0x886644
    const textColor = selectedHero ? '#FFD700' : '#CCAA66'

    const btnY = GRID_START_Y + 2 * (CARD_H + GAP_Y) - GAP_Y + 30

    const btn = this.add.rectangle(GAME_WIDTH / 2, btnY, 290, 42, hasBg)
      .setStrokeStyle(2, hasBorder)
      .setInteractive({ useHandCursor: true })

    this.add.text(GAME_WIDTH / 2, btnY, label, {
      fontSize: '15px', color: textColor, fontStyle: selectedHero ? 'bold' : 'normal',
    }).setOrigin(0.5)

    btn.on('pointerover', () => btn.setFillStyle(selectedHero ? 0x2a2400 : 0x1a2e1a))
    btn.on('pointerout', () => btn.setFillStyle(hasBg))
    btn.on('pointerdown', () => this.scene.start('HeroSelectScene'))
  }

  private showContinueDialog(cfg: MapConfig): void {
    const save = SaveManager.getSave(cfg.id)!
    const saved = new Date(save.savedAt)
    const timeStr = saved.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      + ' ' + saved.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

    const cx = GAME_WIDTH / 2
    const cy = GAME_HEIGHT / 2

    // All dialog objects live in one container — dialog.destroy() cleans everything
    const dialog = this.add.container(0, 0).setDepth(500)

    const backdrop = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setInteractive()
    dialog.add(backdrop)

    dialog.add(this.add.rectangle(cx, cy, 440, 230, 0x111a11).setStrokeStyle(2, 0x88cc88))

    dialog.add(this.add.text(cx, cy - 78, `Continue "${cfg.name}"?`, {
      fontSize: '20px', color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5))

    const diffLabel = save.difficulty.replace('_', ' ').toUpperCase()
    dialog.add(this.add.text(cx, cy - 44,
      `Round ${save.round}  ·  $${save.cash.toLocaleString()}  ·  ${save.lives} lives  ·  ${diffLabel}`, {
      fontSize: '13px', color: '#AAAAAA',
    }).setOrigin(0.5))

    dialog.add(this.add.text(cx, cy - 20,
      `Saved ${timeStr}  ·  ${save.towers.length} tower${save.towers.length !== 1 ? 's' : ''}`, {
      fontSize: '12px', color: '#777777',
    }).setOrigin(0.5))

    // Continue button
    const contBtn = this.add.rectangle(cx - 90, cy + 55, 160, 48, 0x1a5a1a)
      .setStrokeStyle(2, 0x44cc44).setInteractive({ useHandCursor: true })
    dialog.add(contBtn)
    dialog.add(this.add.text(cx - 90, cy + 55, 'Continue', {
      fontSize: '18px', color: '#44FF44', fontStyle: 'bold',
    }).setOrigin(0.5))

    contBtn.on('pointerover', () => contBtn.setFillStyle(0x2a8a2a))
    contBtn.on('pointerout', () => contBtn.setFillStyle(0x1a5a1a))
    contBtn.on('pointerdown', () => {
      SaveManager.pendingLoad = save
      gameState.init(save.difficulty)
      gameState.selectedMapId = save.mapId
      gameState.round = save.round
      gameState.lives = save.lives
      gameState.maxLives = save.maxLives
      gameState.cash = save.cash
      gameState.isFreePlay = save.isFreePlay
      gameState.selectedHeroId = save.heroId
      gameState.heroPlacedOnMap = save.heroPlacedOnMap
      this.scene.start('GameScene')
    })

    // New Game button
    const newBtn = this.add.rectangle(cx + 90, cy + 55, 160, 48, 0x3a1a1a)
      .setStrokeStyle(2, 0xcc4444).setInteractive({ useHandCursor: true })
    dialog.add(newBtn)
    dialog.add(this.add.text(cx + 90, cy + 55, 'New Game', {
      fontSize: '18px', color: '#FF6666', fontStyle: 'bold',
    }).setOrigin(0.5))

    newBtn.on('pointerover', () => newBtn.setFillStyle(0x5a2a2a))
    newBtn.on('pointerout', () => newBtn.setFillStyle(0x3a1a1a))
    newBtn.on('pointerdown', () => {
      SaveManager.deleteSave(cfg.id)
      dialog.destroy()
      this.scene.start('DifficultyScene')
    })

    backdrop.on('pointerdown', () => dialog.destroy())
  }

  private drawMiniPreview(gfx: Phaser.GameObjects.Graphics, cfg: MapConfig, px: number, py: number): void {
    const scaleX = PREV_W / GAME_WIDTH
    const scaleY = PREV_H / MAP_H

    const toMini = (wx: number, wy: number) => ({
      x: px + wx * scaleX,
      y: py + (wy - MAP_TOP) * scaleY,
    })

    gfx.fillStyle(cfg.grassColor, 1)
    gfx.fillRect(px, py, PREV_W, PREV_H)

    const strokeW = Math.max(3, TRACK_WIDTH * scaleX)

    gfx.lineStyle(strokeW + 2, cfg.borderColor, 1)
    gfx.beginPath()
    const first = toMini(cfg.waypoints[0].x, cfg.waypoints[0].y)
    gfx.moveTo(first.x, first.y)
    for (let i = 1; i < cfg.waypoints.length; i++) {
      const p = toMini(cfg.waypoints[i].x, cfg.waypoints[i].y)
      gfx.lineTo(p.x, p.y)
    }
    gfx.strokePath()

    gfx.lineStyle(strokeW, cfg.trackColor, 1)
    gfx.beginPath()
    gfx.moveTo(first.x, first.y)
    for (let i = 1; i < cfg.waypoints.length; i++) {
      const p = toMini(cfg.waypoints[i].x, cfg.waypoints[i].y)
      gfx.lineTo(p.x, p.y)
    }
    gfx.strokePath()
  }
}
