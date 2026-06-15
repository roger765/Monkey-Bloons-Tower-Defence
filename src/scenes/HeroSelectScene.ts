import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants'
import { gameState } from '../game/GameState'
import { HERO_CONFIGS } from '../data/heroes'
import { TowerConfig } from '../types'

const CARD_W = 226
const CARD_H = 452
const GAP = 16
const START_X = 20
const SCROLL_Y = 138
const SCROLL_H = GAME_HEIGHT - SCROLL_Y - 68   // 514
const DRAG_THRESHOLD = 8

interface CardEntry {
  config: TowerConfig
  card: Phaser.GameObjects.Rectangle
  selectBtn: Phaser.GameObjects.Rectangle
  selectText: Phaser.GameObjects.Text
}

export class HeroSelectScene extends Phaser.Scene {
  entries: CardEntry[] = []
  private scrollContainer!: Phaser.GameObjects.Container
  private scrollX: number = 0
  private maxScroll: number = 0
  private isDragging: boolean = false

  constructor() {
    super({ key: 'HeroSelectScene' })
  }

  create(): void {
    this.scrollX = 0
    this.isDragging = false

    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x080d18)

    // Star field
    for (let i = 0; i < 40; i++) {
      this.add.arc(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 3),
        0, 360, false, 0xFFD700,
        Phaser.Math.FloatBetween(0.08, 0.35),
      )
    }

    this.add.text(GAME_WIDTH / 2, 38, 'HERO SHOP', {
      fontSize: '46px', color: '#FFD700', fontStyle: 'bold',
      stroke: '#AA7700', strokeThickness: 4,
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 84, 'All heroes are free to select', {
      fontSize: '16px', color: '#BBBBBB',
    }).setOrigin(0.5)

    this.add.text(GAME_WIDTH / 2, 108, 'Your chosen hero appears in the shop for $1,000 to place', {
      fontSize: '12px', color: '#777777',
    }).setOrigin(0.5)

    // Scroll container — cards live in here and slide left/right together
    this.scrollContainer = this.add.container(0, 0)
    this.scrollContainer.setDepth(10)

    // Mask: clips visible area so cards don't bleed outside the panel
    const maskShape = this.make.graphics({ add: false } as Phaser.Types.GameObjects.Graphics.Options)
    maskShape.fillRect(0, SCROLL_Y, GAME_WIDTH, SCROLL_H)
    this.scrollContainer.setMask(maskShape.createGeometryMask())

    const totalWidth = START_X + HERO_CONFIGS.length * (CARD_W + GAP) - GAP + START_X
    this.maxScroll = Math.max(0, totalWidth - GAME_WIDTH)

    this.entries = []
    const cardY = SCROLL_Y + Math.floor((SCROLL_H - CARD_H) / 2)
    HERO_CONFIGS.forEach((hero, i) => {
      const cardX = START_X + i * (CARD_W + GAP)
      this.createHeroCard(hero, cardX, cardY)
    })

    this.createScrollHints()
    this.setupScrollInput()

    // Back button — fixed, above scroll container depth
    const backBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 34, 210, 44, 0x111a11)
      .setStrokeStyle(2, 0x446644)
      .setInteractive({ useHandCursor: true })
      .setDepth(20)
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 34, '← Back to Maps', {
      fontSize: '15px', color: '#DDDDDD',
    }).setOrigin(0.5).setDepth(20)

    backBg.on('pointerover', () => backBg.setFillStyle(0x1a2e1a))
    backBg.on('pointerout', () => backBg.setFillStyle(0x111a11))
    backBg.on('pointerdown', () => this.scene.start('MapSelectScene'))
  }

  private createHeroCard(hero: TowerConfig, cardX: number, cardY: number): void {
    const selected = gameState.selectedHeroId === hero.id
    const toAdd: Phaser.GameObjects.GameObject[] = []

    // Card background
    const card = this.add.rectangle(
      cardX + CARD_W / 2, cardY + CARD_H / 2, CARD_W, CARD_H, 0x0d1b2a,
    ).setStrokeStyle(2, selected ? 0xFFD700 : 0x253550)
    toAdd.push(card)

    // Hero icon — arc objects scroll cleanly in containers
    const iconX = cardX + CARD_W / 2
    const iconY = cardY + 90
    const glow = this.add.arc(iconX, iconY, 44, 0, 360, false, hero.color, 0.18)
    const body = this.add.arc(iconX, iconY, 34, 0, 360, false, hero.color, 1)
    body.setStrokeStyle(3, 0xFFD700)
    toAdd.push(glow, body)

    // Crown drawn on a graphics object at (0,0); draws at world coords
    const crownGfx = this.add.graphics()
    crownGfx.fillStyle(0xFFD700)
    crownGfx.fillRect(iconX - 13, iconY + 4, 26, 8)    // base band
    crownGfx.fillRect(iconX - 11, iconY - 10, 7, 14)   // left tooth
    crownGfx.fillRect(iconX - 3,  iconY - 14, 7, 18)   // centre tooth
    crownGfx.fillRect(iconX + 4,  iconY - 10, 7, 14)   // right tooth
    crownGfx.fillStyle(0xFFFFFF, 0.9)
    crownGfx.fillCircle(iconX - 8,  iconY - 11, 2.5)   // gem dots
    crownGfx.fillCircle(iconX,      iconY - 15, 2.5)
    crownGfx.fillCircle(iconX + 8,  iconY - 11, 2.5)
    toAdd.push(crownGfx)

    // Name
    const nameText = this.add.text(iconX, iconY + 55, hero.name, {
      fontSize: '17px', color: '#FFFFFF', fontStyle: 'bold',
    }).setOrigin(0.5)
    toAdd.push(nameText)

    // Description
    const descText = this.add.text(iconX, iconY + 80, hero.description, {
      fontSize: '11px', color: '#9AABBB',
      wordWrap: { width: CARD_W - 24 }, align: 'center',
    }).setOrigin(0.5)
    toAdd.push(descText)

    // Stats
    const statY = cardY + CARD_H - 128
    const typeColors: Record<string, string> = {
      sharp: '#CCDDFF', fire: '#FF9944', explosion: '#FFCC44',
      magic: '#CC88FF', energy: '#44FFDD', normal: '#DDDDDD',
    }
    const tc = typeColors[hero.damageType] ?? '#FFFFFF'

    const stat1 = this.add.text(iconX, statY, `DMG ${hero.damage}   RNG ${hero.range}`, {
      fontSize: '12px', color: '#6699AA',
    }).setOrigin(0.5)
    const stat2 = this.add.text(iconX, statY + 20, hero.damageType.toUpperCase(), {
      fontSize: '12px', color: tc, fontStyle: 'bold',
    }).setOrigin(0.5)
    toAdd.push(stat1, stat2)

    // SELECT button
    const btnColor = selected ? 0x1a4a00 : 0x152030
    const btnBorder = selected ? 0xFFD700 : 0x2a4a6a
    const selectBtn = this.add.rectangle(
      cardX + CARD_W / 2, cardY + CARD_H - 30, CARD_W - 20, 38, btnColor,
    ).setStrokeStyle(2, btnBorder).setInteractive({ useHandCursor: true })

    const selectText = this.add.text(
      cardX + CARD_W / 2, cardY + CARD_H - 30,
      selected ? '✓  SELECTED' : 'SELECT',
      { fontSize: '13px', color: selected ? '#FFD700' : '#CCCCCC', fontStyle: selected ? 'bold' : 'normal' },
    ).setOrigin(0.5)

    toAdd.push(selectBtn, selectText)
    this.scrollContainer.add(toAdd)
    this.entries.push({ config: hero, card, selectBtn, selectText })

    selectBtn.on('pointerover', () => {
      if (gameState.selectedHeroId !== hero.id) selectBtn.setFillStyle(0x1e3040)
    })
    selectBtn.on('pointerout', () => {
      if (gameState.selectedHeroId !== hero.id) selectBtn.setFillStyle(0x152030)
    })
    // pointerup fires BEFORE scene-level pointerup, so isDragging is still set when we check it
    selectBtn.on('pointerup', () => {
      if (this.isDragging) return
      gameState.selectedHeroId = hero.id
      this.refreshSelectionState()
    })
  }

  private createScrollHints(): void {
    if (this.maxScroll <= 0) return

    // Right arrow hint
    const arrowY = SCROLL_Y + SCROLL_H / 2
    const rightArrow = this.add.text(GAME_WIDTH - 14, arrowY, '›', {
      fontSize: '36px', color: '#FFD700',
    }).setOrigin(0.5).setDepth(20).setAlpha(0.6)

    // Subtle left edge shadow to imply more content
    const leftGrad = this.add.graphics().setDepth(15)
    leftGrad.fillStyle(0x080d18, 0.5)
    leftGrad.fillRect(0, SCROLL_Y, 18, SCROLL_H)

    const rightGrad = this.add.graphics().setDepth(15)
    rightGrad.fillStyle(0x080d18, 0.5)
    rightGrad.fillRect(GAME_WIDTH - 18, SCROLL_Y, 18, SCROLL_H)

    // Pulse the arrow once to hint scrollability
    this.tweens.add({
      targets: rightArrow, x: GAME_WIDTH - 8,
      duration: 600, yoyo: true, repeat: 2, ease: 'Sine.InOut',
    })
  }

  private setupScrollInput(): void {
    let touchIn = false
    let touchStartX = 0
    let touchStartScrollX = 0

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < SCROLL_Y || pointer.y > SCROLL_Y + SCROLL_H) return
      touchIn = true
      touchStartX = pointer.x
      touchStartScrollX = this.scrollX
      this.isDragging = false
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || !touchIn) return
      const dx = touchStartX - pointer.x
      if (Math.abs(dx) > DRAG_THRESHOLD) {
        this.isDragging = true
        this.scrollX = Phaser.Math.Clamp(touchStartScrollX + dx, 0, this.maxScroll)
        this.scrollContainer.x = -this.scrollX
      }
    })

    this.input.on('pointerup', () => {
      touchIn = false
      this.isDragging = false
    })

    this.input.on('wheel', (
      pointer: Phaser.Input.Pointer,
      _objs: unknown[],
      deltaX: number,
      deltaY: number,
    ) => {
      if (pointer.y < SCROLL_Y || pointer.y > SCROLL_Y + SCROLL_H) return
      const delta = deltaX !== 0 ? deltaX : deltaY
      this.scrollX = Phaser.Math.Clamp(this.scrollX + delta, 0, this.maxScroll)
      this.scrollContainer.x = -this.scrollX
    })
  }

  refreshSelectionState(): void {
    for (const e of this.entries) {
      const sel = gameState.selectedHeroId === e.config.id
      e.card.setStrokeStyle(2, sel ? 0xFFD700 : 0x253550)
      e.selectBtn.setFillStyle(sel ? 0x1a4a00 : 0x152030)
      e.selectBtn.setStrokeStyle(2, sel ? 0xFFD700 : 0x2a4a6a)
      e.selectText.setText(sel ? '✓  SELECTED' : 'SELECT')
      e.selectText.setColor(sel ? '#FFD700' : '#CCCCCC')
      e.selectText.setFontStyle(sel ? 'bold' : 'normal')
    }
  }
}
