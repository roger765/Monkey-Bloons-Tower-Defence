import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, HUD_TOP_HEIGHT, HUD_BOTTOM_HEIGHT, TRACK_WIDTH } from '../constants'
import { MapId } from '../types'
import { gameState } from '../game/GameState'
import { MAP_CONFIGS, MapConfig } from '../game/Maps'

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
      this.scene.start('DifficultyScene')
    })
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
