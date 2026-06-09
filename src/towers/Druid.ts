import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class Druid extends BaseTower {
  private thornCount: number = 3

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('druid')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const STUMP  = 0x6B3A1E
    const BARK   = 0x4A2010
    const RING   = 0x8B5030
    const LEAF   = 0x228B22
    const LEAFL  = 0x44CC44
    const LEAFD  = 0x145014
    const MOSS   = 0x2E7D32

    // Stump base
    g.fillStyle(STUMP)
    g.fillEllipse(0, 10, 32, 12)
    g.lineStyle(2, BARK)
    g.strokeEllipse(0, 10, 32, 12)

    // Stump cylinder body
    g.fillStyle(STUMP)
    g.fillRect(-14, -2, 28, 14)

    // Bark texture lines (vertical grain)
    g.lineStyle(1.5, BARK)
    g.lineBetween(-10, -2, -10, 12)
    g.lineBetween(-4, -2, -4, 12)
    g.lineBetween(2, -2, 2, 12)
    g.lineBetween(8, -2, 8, 12)

    // Top face (growth rings)
    g.fillStyle(RING)
    g.fillEllipse(0, -2, 28, 10)
    g.lineStyle(1, BARK)
    g.strokeEllipse(0, -2, 28, 10)
    // Inner rings
    g.lineStyle(1, BARK, 0.6)
    g.strokeEllipse(0, -2, 20, 7)
    g.strokeEllipse(0, -2, 12, 4)
    // Pith center
    g.fillStyle(0xC87840)
    g.fillEllipse(0, -2, 5, 3)

    // Moss patches on stump side
    g.fillStyle(MOSS, 0.7)
    g.fillCircle(-12, 6, 4)
    g.fillCircle(10, 8, 3)
    g.fillCircle(-6, 12, 3)

    // Leaf cluster on top (multiple overlapping circles)
    g.fillStyle(LEAFD)
    g.fillCircle(-7, -14, 9)
    g.fillCircle(7, -14, 9)
    g.fillCircle(0, -11, 9)

    g.fillStyle(LEAF)
    g.fillCircle(-8, -16, 8)
    g.fillCircle(8, -16, 8)
    g.fillCircle(0, -20, 8)
    g.fillCircle(-3, -13, 7)
    g.fillCircle(3, -13, 7)

    // Leaf highlights
    g.fillStyle(LEAFL, 0.5)
    g.fillCircle(-6, -18, 4)
    g.fillCircle(7, -19, 3)

    // Vine/branch barrel (nature tendril)
    this.barrel.setFillStyle(BARK)
    this.barrel.setStrokeStyle(1.5, LEAFD)
    this.barrel.setSize(18, 5)
    this.barrel.setPosition(12, 0)

    // Small leaf on barrel tip
    const leafTip = scene.add.arc(22, -3, 4, 0, 360, false, LEAF)
    this.barrelPivot.add(leafTip)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const baseAngle = Math.atan2(target.y - this.y, target.x - this.x)
    const halfSpread = (this.thornCount - 1) * 0.12
    for (let i = 0; i < this.thornCount; i++) {
      const angle = baseAngle - halfSpread + i * 0.24
      this.projectileManager.launch({
        x: this.x, y: this.y,
        targetX: this.x + Math.cos(angle) * 500,
        targetY: this.y + Math.sin(angle) * 500,
        speed: this.effectiveProjectileSpeed,
        radius: this.config.projectileRadius,
        damage: this.effectiveDamage,
        pierce: this.effectivePierce,
        damageType: this.effectiveDamageType,
        color: 0x44DD44,
      })
    }
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.extraProjectiles) this.thornCount += effect.extraProjectiles
  }
}
