import Phaser from 'phaser'
import { BloonType } from '../types'
import { GAME_WIDTH, GAME_HEIGHT, HUD_TOP_HEIGHT } from '../constants'

const BLOON_COLORS: Record<BloonType, number> = {
  [BloonType.Red]:     0xFF3333,
  [BloonType.Blue]:    0x3399FF,
  [BloonType.Green]:   0x33BB33,
  [BloonType.Yellow]:  0xFFDD00,
  [BloonType.Pink]:    0xFF88CC,
  [BloonType.Black]:   0x444444,
  [BloonType.White]:   0xCCCCCC,
  [BloonType.Zebra]:   0x999999,
  [BloonType.Rainbow]: 0xFF8800,
  [BloonType.Ceramic]: 0xCC8833,
  [BloonType.Lead]:    0x778899,
  [BloonType.MOAB]:    0x2255CC,
  [BloonType.BFB]:     0xCCCC22,
  [BloonType.ZOMG]:    0xAA22CC,
}

const BLOON_ORDER: BloonType[] = [
  BloonType.Red, BloonType.Blue, BloonType.Green, BloonType.Yellow,
  BloonType.Pink, BloonType.Black, BloonType.White,
  BloonType.Zebra, BloonType.Rainbow, BloonType.Ceramic, BloonType.Lead,
  BloonType.MOAB, BloonType.BFB, BloonType.ZOMG,
]

export class FreePlaySpawner {
  private scene: Phaser.Scene
  private panel: Phaser.GameObjects.Container
  private onSpawn: (type: BloonType, count: number, camo: boolean, regrow: boolean, fortified: boolean) => void

  private selectedType: BloonType = BloonType.Red
  private selectedCount = 1
  private camo = false
  private regrow = false
  private fortified = false

  private typeRects = new Map<BloonType, Phaser.GameObjects.Rectangle>()
  private countBtns = new Map<number, Phaser.GameObjects.Text>()
  private camoBtn!: Phaser.GameObjects.Text
  private regrowBtn!: Phaser.GameObjects.Text
  private fortifiedBtn!: Phaser.GameObjects.Text

  constructor(
    scene: Phaser.Scene,
    onSpawn: (type: BloonType, count: number, camo: boolean, regrow: boolean, fortified: boolean) => void
  ) {
    this.scene = scene
    this.onSpawn = onSpawn

    this.panel = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10)
      .setDepth(150)
      .setVisible(false)

    this.buildPanel()

    const toggleBtn = scene.add.text(570, HUD_TOP_HEIGHT / 2, '✦ Spawn', {
      fontSize: '14px', color: '#DD88FF',
      backgroundColor: '#3a1a4a',
      padding: { x: 8, y: 4 },
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true }).setDepth(101)

    toggleBtn.on('pointerover', () => toggleBtn.setBackgroundColor('#5a2a7a'))
    toggleBtn.on('pointerout', () => toggleBtn.setBackgroundColor('#3a1a4a'))
    toggleBtn.on('pointerdown', () => this.panel.setVisible(!this.panel.visible))
  }

  private buildPanel(): void {
    const W = 520
    const H = 290
    const halfH = H / 2

    // Background — also swallows clicks so they don't fall to the game world
    const bg = this.scene.add.rectangle(0, 0, W, H, 0x120a22)
      .setStrokeStyle(2, 0x9966cc)
      .setInteractive()
    this.panel.add(bg)

    // Title
    this.panel.add(
      this.scene.add.text(0, -halfH + 18, 'BLOON SPAWNER', {
        fontSize: '16px', color: '#DD88FF', fontStyle: 'bold',
      }).setOrigin(0.5)
    )

    // Close button
    const closeBtn = this.scene.add.text(W / 2 - 14, -halfH + 14, '✕', {
      fontSize: '16px', color: '#AAAAAA',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    closeBtn.on('pointerover', () => closeBtn.setColor('#FFFFFF'))
    closeBtn.on('pointerout', () => closeBtn.setColor('#AAAAAA'))
    closeBtn.on('pointerdown', () => this.panel.setVisible(false))
    this.panel.add(closeBtn)

    // ── Bloon type buttons — 2 rows of 7 ──────────────────────────────────
    const btnW = 62
    const btnH = 32
    const gap = 4
    const step = btnW + gap
    const startX = -(7 * btnW + 6 * gap) / 2 + btnW / 2  // -198

    BLOON_ORDER.forEach((type, i) => {
      const col = i % 7
      const row = Math.floor(i / 7)
      const x = startX + col * step
      const y = -halfH + 52 + row * (btnH + gap)

      const color = BLOON_COLORS[type]
      const isSelected = type === this.selectedType
      const rect = this.scene.add.rectangle(x, y, btnW, btnH, color)
        .setStrokeStyle(isSelected ? 2 : 1, isSelected ? 0xFFFFFF : 0x555555)
        .setInteractive({ useHandCursor: true })

      const label = this.scene.add.text(x, y, type.slice(0, 4).toUpperCase(), {
        fontSize: '11px', color: '#FFFFFF', fontStyle: 'bold',
      }).setOrigin(0.5)

      rect.on('pointerover', () => { if (type !== this.selectedType) rect.setAlpha(0.75) })
      rect.on('pointerout',  () => rect.setAlpha(1))
      rect.on('pointerdown', () => this.selectType(type))

      this.typeRects.set(type, rect)
      this.panel.add([rect, label])
    })

    // ── Count buttons ──────────────────────────────────────────────────────
    const counts = [1, 5, 10, 20, 50]
    const countY = -halfH + 52 + 2 * (btnH + gap) + 36

    this.panel.add(
      this.scene.add.text(0, countY - 18, 'Count', {
        fontSize: '12px', color: '#AAAAAA',
      }).setOrigin(0.5)
    )

    const countStep = 72
    const countStartX = -(counts.length - 1) * countStep / 2

    counts.forEach((count, i) => {
      const x = countStartX + i * countStep
      const active = count === this.selectedCount
      const btn = this.scene.add.text(x, countY, `×${count}`, {
        fontSize: '14px',
        color: active ? '#FFFFFF' : '#888888',
        backgroundColor: active ? '#553388' : '#2a2a2a',
        padding: { x: 8, y: 4 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })

      btn.on('pointerdown', () => this.selectCount(count))
      this.countBtns.set(count, btn)
      this.panel.add(btn)
    })

    // ── Modifier toggles ───────────────────────────────────────────────────
    const modY = countY + 44

    this.panel.add(
      this.scene.add.text(0, modY - 18, 'Modifiers', {
        fontSize: '12px', color: '#AAAAAA',
      }).setOrigin(0.5)
    )

    const modStyle = { fontSize: '13px', color: '#888888', backgroundColor: '#222222', padding: { x: 10, y: 5 } }

    this.camoBtn = this.scene.add.text(-130, modY, 'Camo', modStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
    this.camoBtn.on('pointerdown', () => { this.camo = !this.camo; this.refreshMods() })

    this.regrowBtn = this.scene.add.text(0, modY, 'Regrow', modStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
    this.regrowBtn.on('pointerdown', () => { this.regrow = !this.regrow; this.refreshMods() })

    this.fortifiedBtn = this.scene.add.text(130, modY, 'Fortified', modStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
    this.fortifiedBtn.on('pointerdown', () => { this.fortified = !this.fortified; this.refreshMods() })

    this.panel.add([this.camoBtn, this.regrowBtn, this.fortifiedBtn])

    // ── Send button ────────────────────────────────────────────────────────
    const sendY = modY + 44

    const sendBtn = this.scene.add.text(0, sendY, '▶  SEND BLOONS', {
      fontSize: '15px', color: '#FFFFFF', fontStyle: 'bold',
      backgroundColor: '#5a1a8a',
      padding: { x: 24, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    sendBtn.on('pointerover', () => sendBtn.setBackgroundColor('#7a2aaa'))
    sendBtn.on('pointerout',  () => sendBtn.setBackgroundColor('#5a1a8a'))
    sendBtn.on('pointerdown', () =>
      this.onSpawn(this.selectedType, this.selectedCount, this.camo, this.regrow, this.fortified)
    )
    this.panel.add(sendBtn)
  }

  private selectType(type: BloonType): void {
    this.typeRects.get(this.selectedType)?.setStrokeStyle(1, 0x555555)
    this.selectedType = type
    this.typeRects.get(type)?.setStrokeStyle(2, 0xFFFFFF)
  }

  private selectCount(count: number): void {
    const prev = this.countBtns.get(this.selectedCount)
    if (prev) { prev.setColor('#888888'); prev.setBackgroundColor('#2a2a2a') }
    this.selectedCount = count
    const next = this.countBtns.get(count)
    if (next) { next.setColor('#FFFFFF'); next.setBackgroundColor('#553388') }
  }

  private refreshMods(): void {
    const on = (btn: Phaser.GameObjects.Text, active: boolean) => {
      btn.setColor(active ? '#88FFBB' : '#888888')
      btn.setBackgroundColor(active ? '#1a4a2a' : '#222222')
    }
    on(this.camoBtn, this.camo)
    on(this.regrowBtn, this.regrow)
    on(this.fortifiedBtn, this.fortified)
  }
}
