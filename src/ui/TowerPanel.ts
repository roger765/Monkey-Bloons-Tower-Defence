import Phaser from 'phaser'
import { TargetingMode } from '../types'
import { BaseTower } from '../towers/BaseTower'
import { TowerManager } from '../game/TowerManager'
import { gameState } from '../game/GameState'
import { GAME_WIDTH, GAME_HEIGHT, HUD_BOTTOM_HEIGHT } from '../constants'
import { TARGETING_MODES } from '../constants'

const PANEL_Y = GAME_HEIGHT - HUD_BOTTOM_HEIGHT + 56
const PANEL_H = HUD_BOTTOM_HEIGHT - 56

export class TowerPanel {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private towerManager: TowerManager
  private currentTower: BaseTower | null = null
  private saveCallback: (() => void) | null = null
  private nameText: Phaser.GameObjects.Text
  private notationText: Phaser.GameObjects.Text
  private sellBtn: Phaser.GameObjects.Text
  private targetBtn: Phaser.GameObjects.Text
  private upgradeButtons: {
    path: 0 | 1 | 2
    tier: number
    bg: Phaser.GameObjects.Rectangle
    nameText: Phaser.GameObjects.Text
    costText: Phaser.GameObjects.Text
  }[] = []

  constructor(scene: Phaser.Scene, towerManager: TowerManager) {
    this.scene = scene
    this.towerManager = towerManager
    this.container = scene.add.container(0, 0)
    this.container.setDepth(90)

    // Background
    const bg = scene.add.rectangle(GAME_WIDTH / 2, PANEL_Y + PANEL_H / 2, GAME_WIDTH, PANEL_H, 0x0d1520)
    bg.setStrokeStyle(1, 0x334466)
    this.container.add(bg)

    // Tower name
    this.nameText = scene.add.text(10, PANEL_Y + 6, '', {
      fontSize: '13px', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0, 0)
    this.container.add(this.nameText)

    // Upgrade notation
    this.notationText = scene.add.text(10, PANEL_Y + 22, '', {
      fontSize: '11px', color: '#AAAAAA'
    }).setOrigin(0, 0)
    this.container.add(this.notationText)

    // Targeting button
    this.targetBtn = scene.add.text(GAME_WIDTH - 220, PANEL_Y + 14, 'Target: First', {
      fontSize: '12px', color: '#AAFFAA',
      backgroundColor: '#1a3a1a',
      padding: { x: 6, y: 3 },
    }).setOrigin(0, 0).setInteractive({ useHandCursor: true })
    this.targetBtn.on('pointerdown', () => {
      if (this.currentTower) {
        this.currentTower.cycleTargeting()
        this.refresh()
      }
    })
    this.container.add(this.targetBtn)

    // Sell button
    this.sellBtn = scene.add.text(GAME_WIDTH - 100, PANEL_Y + 14, 'Sell $0', {
      fontSize: '12px', color: '#FFAAAA',
      backgroundColor: '#3a1a1a',
      padding: { x: 6, y: 3 },
    }).setOrigin(0, 0).setInteractive({ useHandCursor: true })
    this.sellBtn.on('pointerdown', () => {
      if (this.currentTower) {
        this.towerManager.sellTower(this.currentTower)
        this.setTower(null)
        this.saveCallback?.()
      }
    })
    this.container.add(this.sellBtn)

    // Upgrade path buttons: 3 paths, showing next tier each
    this.buildUpgradeButtons()

    this.container.setVisible(false)
  }

  private buildUpgradeButtons(): void {
    const paths: (0 | 1 | 2)[] = [0, 1, 2]
    const pathLabels = ['Path 1', 'Path 2', 'Path 3']
    const pathColors = [0x1a3a5a, 0x3a1a5a, 0x1a5a3a]

    paths.forEach((path, pi) => {
      const baseX = 120 + pi * 340
      const baseY = PANEL_Y + 4

      // Label
      const label = this.scene.add.text(baseX, baseY, pathLabels[pi], {
        fontSize: '10px', color: '#888888'
      }).setOrigin(0, 0)
      this.container.add(label)

      // 5 tier buttons per path
      for (let tier = 0; tier < 5; tier++) {
        const btnX = baseX + tier * 62
        const btnY = baseY + 14
        const bg = this.scene.add.rectangle(btnX + 28, btnY + 14, 56, 26, pathColors[pi])
          .setStrokeStyle(1, 0x4a4a6a)
          .setInteractive({ useHandCursor: true })

        const nameText = this.scene.add.text(btnX + 28, btnY + 8, `T${tier + 1}`, {
          fontSize: '9px', color: '#CCCCCC'
        }).setOrigin(0.5)

        const costText = this.scene.add.text(btnX + 28, btnY + 20, '$--', {
          fontSize: '9px', color: '#FFD700'
        }).setOrigin(0.5)

        const p = path
        const t = tier
        bg.on('pointerdown', () => this.onUpgradeClick(p, t))
        bg.on('pointerover', () => bg.setFillStyle(pathColors[pi] + 0x101010))
        bg.on('pointerout', () => this.refreshBtnColor(p, t))

        this.container.add([bg, nameText, costText])
        this.upgradeButtons.push({ path, tier, bg, nameText, costText })
      }
    })
  }

  private onUpgradeClick(path: 0 | 1 | 2, tier: number): void {
    if (!this.currentTower) return
    const currentTier = this.currentTower.upgradeTiers[path]
    if (tier !== currentTier) return  // must buy in order

    const success = this.currentTower.tryUpgrade(path)
    if (!success) {
      // Flash red
      const btn = this.upgradeButtons.find(b => b.path === path && b.tier === tier)
      if (btn) {
        btn.bg.setFillStyle(0x5a1a1a)
        this.scene.time.delayedCall(300, () => this.refreshBtnColor(path, tier))
      }
    } else {
      this.refresh()
      this.saveCallback?.()
    }
  }

  private refreshBtnColor(path: 0 | 1 | 2, tier: number): void {
    if (!this.currentTower) return
    const btn = this.upgradeButtons.find(b => b.path === path && b.tier === tier)
    if (!btn) return
    const pathColors = [0x1a3a5a, 0x3a1a5a, 0x1a5a3a]
    const purchased = this.currentTower.upgradeTiers[path] > tier
    const available = this.currentTower.upgradeTiers[path] === tier
    if (purchased) btn.bg.setFillStyle(0x2a5a2a)
    else if (available && this.currentTower.canUpgradePath(path)) btn.bg.setFillStyle(pathColors[path])
    else btn.bg.setFillStyle(0x2a2a2a)
  }

  onSaveNeeded(cb: () => void): void {
    this.saveCallback = cb
  }

  setTower(tower: BaseTower | null): void {
    this.currentTower = tower
    if (!tower) {
      this.container.setVisible(false)
      return
    }
    this.container.setVisible(true)
    this.refresh()
  }

  private refresh(): void {
    if (!this.currentTower) return
    this.nameText.setText(this.currentTower.config.name)
    this.notationText.setText(`[${this.currentTower.getUpgradeNotation()}]`)
    this.targetBtn.setText(`Target: ${this.currentTower.targeting}`)
    this.sellBtn.setText(`Sell $${this.currentTower.getSellValue()}`)

    // Update upgrade buttons
    for (const btn of this.upgradeButtons) {
      const tower = this.currentTower!
      const upgrade = tower.config.upgrades[btn.path][btn.tier]
      const purchased = tower.upgradeTiers[btn.path] > btn.tier
      const isNext = tower.upgradeTiers[btn.path] === btn.tier
      const canUpgrade = tower.canUpgradePath(btn.path)

      btn.nameText.setText(upgrade.name.substring(0, 8))
      btn.costText.setText(purchased ? '✓' : isNext ? `$${gameState.scaledCost(upgrade.cost)}` : '')

      // Colors
      if (purchased) {
        btn.bg.setFillStyle(0x2a5a2a)
        btn.bg.setAlpha(0.8)
      } else if (isNext && canUpgrade) {
        const affordable = gameState.canAfford(upgrade.cost)
        btn.bg.setFillStyle(affordable ? [0x1a3a5a, 0x3a1a5a, 0x1a5a3a][btn.path] : 0x3a3a1a)
        btn.bg.setAlpha(1.0)
      } else {
        btn.bg.setFillStyle(0x2a2a2a)
        btn.bg.setAlpha(0.4)
      }
    }
  }

  update(): void {
    if (this.currentTower && this.container.visible) {
      this.refresh()
    }
  }
}
