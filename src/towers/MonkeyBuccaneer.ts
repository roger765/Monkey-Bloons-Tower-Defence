import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { gameState } from '../game/GameState'
import { showCashPopup } from '../ui/CashPopup'

export class MonkeyBuccaneer extends BaseTower {
  private extraShots: number = 0
  private roundCashBonus: number = 0

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('monkey_buccaneer')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const WOOD  = 0x8B4513
    const WOODL = 0xC07040
    const WOODD = 0x4A1E08
    const SAIL  = 0xF0EAD0
    const ROPE  = 0x8B6040
    const RED   = 0xCC2020

    // Ship hull — rounded bottom
    const hull = [
      { x: -18, y:  6 },
      { x: -20, y:  2 },
      { x: -18, y: -4 },
      { x:  18, y: -4 },
      { x:  20, y:  2 },
      { x:  18, y:  6 },
    ]
    g.fillStyle(WOOD)
    g.fillPoints(hull, true)
    g.lineStyle(2, WOODD)
    g.strokePoints(hull, true)

    // Deck planks
    g.lineStyle(1, WOODD, 0.6)
    for (let px = -14; px <= 14; px += 7) {
      g.lineBetween(px, -4, px, 6)
    }

    // Hull stripe
    g.fillStyle(RED)
    g.fillRect(-20, 0, 40, 3)

    // Waterline
    g.lineStyle(1.5, WOODL)
    g.lineBetween(-20, 4, 20, 4)

    // Main mast
    g.lineStyle(3, WOODD)
    g.lineBetween(0, -4, 0, -22)

    // Crow's nest
    g.fillStyle(WOODD)
    g.fillRect(-3, -22, 6, 4)

    // Sail
    g.fillStyle(SAIL)
    g.fillTriangle(-10, -6, 10, -6, 0, -20)
    g.lineStyle(1, ROPE)
    g.strokeTriangle(-10, -6, 10, -6, 0, -20)

    // Pirate flag
    g.fillStyle(0x111111)
    g.fillRect(0, -26, 8, 5)
    g.fillStyle(0xFFFFFF)
    g.fillCircle(4, -24, 1.5)
    g.lineBetween(2, -22, 6, -22)

    // Cannon barrel
    this.barrel.setFillStyle(WOODD)
    this.barrel.setStrokeStyle(1.5, 0x1A0A00)
    this.barrel.setSize(16, 8)
    this.barrel.setPosition(11, 0)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.fireDart(angle)
    for (let i = 0; i < this.extraShots; i++) {
      const spread = (i + 1) * 0.15
      this.fireDart(angle + spread)
      this.fireDart(angle - spread)
    }
  }

  private fireDart(angle: number): void {
    this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: this.x + Math.cos(angle) * 500,
      targetY: this.y + Math.sin(angle) * 500,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0xCC8844,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.extraProjectiles) this.extraShots += Math.floor(effect.extraProjectiles / 2)
    if (effect.specialBehavior === 'favored_trades') this.roundCashBonus = 1000
    if (effect.specialBehavior === 'trade_empire') this.roundCashBonus = 2500
  }

  onRoundEnd(): void {
    if (this.roundCashBonus > 0) {
      gameState.earn(this.roundCashBonus)
      showCashPopup(this.scene, this.x, this.y, this.roundCashBonus)
    }
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let wood: number, woodl: number, woodd: number, sail: number, rope: number, red: number, barrelCol: number

    if (t1 >= 3) {
      // Destroyer / Aircraft Carrier — naval grey warship
      wood = 0x606870; woodl = 0x808898; woodd = 0x303840; sail = 0xE0E8F0; rope = 0x606870; red = 0x222222; barrelCol = 0x282830
    } else if (t1 >= 1) {
      // Faster / Double Shot — darker wood, more military
      wood = 0x704030; woodl = 0xA06050; woodd = 0x381808; sail = 0xE8E4C8; rope = 0x786040; red = 0xAA1818; barrelCol = 0x381808
    } else if (t2 >= 3) {
      // Cannon Ship / Pirates / Flagship — black + orange fire
      wood = 0x1A1A1A; woodl = 0x404040; woodd = 0x080808; sail = 0xFF8800; rope = 0xCC6600; red = 0xFF4400; barrelCol = 0x101010
    } else if (t2 >= 1) {
      // Grape Shot / Hot Shot — warm red/fire accented
      wood = 0x7A3A20; woodl = 0xAA6040; woodd = 0x3A1808; sail = 0xEEDDCC; rope = 0x7A5030; red = 0xDD2222; barrelCol = 0x3A1808
    } else if (t3 >= 3) {
      // Merchantman / Trade Empire — gold and polished
      wood = 0xAA8830; woodl = 0xDDAA50; woodd = 0x5A4010; sail = 0xFFFAD8; rope = 0xCCAA40; red = 0xCC8800; barrelCol = 0x5A4010
    } else if (t3 >= 1) {
      // Long Range / Crow's Nest — lighter, sea-ready
      wood = 0x9A6040; woodl = 0xC88060; woodd = 0x501E08; sail = 0xF4EDD8; rope = 0x8A6850; red = 0xCC2020; barrelCol = 0x4A1E08
    } else {
      wood = 0x8B4513; woodl = 0xC07040; woodd = 0x4A1E08; sail = 0xF0EAD0; rope = 0x8B6040; red = 0xCC2020; barrelCol = woodd
    }

    const g = this.customGfx
    g.clear()

    const hull = [
      { x: -18, y:  6 },
      { x: -20, y:  2 },
      { x: -18, y: -4 },
      { x:  18, y: -4 },
      { x:  20, y:  2 },
      { x:  18, y:  6 },
    ]
    g.fillStyle(wood)
    g.fillPoints(hull, true)
    g.lineStyle(2, woodd)
    g.strokePoints(hull, true)

    g.lineStyle(1, woodd, 0.6)
    for (let px = -14; px <= 14; px += 7) {
      g.lineBetween(px, -4, px, 6)
    }

    g.fillStyle(red)
    g.fillRect(-20, 0, 40, 3)

    g.lineStyle(1.5, woodl)
    g.lineBetween(-20, 4, 20, 4)

    g.lineStyle(3, woodd)
    g.lineBetween(0, -4, 0, -22)

    g.fillStyle(woodd)
    g.fillRect(-3, -22, 6, 4)

    g.fillStyle(sail)
    g.fillTriangle(-10, -6, 10, -6, 0, -20)
    g.lineStyle(1, rope)
    g.strokeTriangle(-10, -6, 10, -6, 0, -20)

    // Flag colour shifts with path
    const flagCol = t3 >= 3 ? 0xFFCC00 : (t2 >= 3 ? 0xFF4400 : 0x111111)
    g.fillStyle(flagCol)
    g.fillRect(0, -26, 8, 5)
    g.fillStyle(0xFFFFFF)
    g.fillCircle(4, -24, 1.5)
    g.lineBetween(2, -22, 6, -22)

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1.5, woodd)
    this.barrel.setSize(16, 8)
    this.barrel.setPosition(11, 0)
  }
}
