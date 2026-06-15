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

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let stump: number, bark: number, ring: number, leaf: number, leafl: number, leafd: number, moss: number, barrelCol: number

    if (t1 >= 3) {
      // Heart of Thunder / Avatar of Wrath — charged, crackling yellow-white
      stump = 0x8A7040; bark = 0x504018; ring = 0xB09050; leaf = 0xCCDD44; leafl = 0xEEFF88; leafd = 0x6A8800; moss = 0xAABB22; barrelCol = 0x404018
    } else if (t1 >= 1) {
      // Hard Thorns / Thorn Swarm — slightly darker bark
      stump = 0x5A3018; bark = 0x3A1A08; ring = 0x7A5030; leaf = 0x228B22; leafl = 0x44CC44; leafd = 0x145014; moss = 0x2E7D32; barrelCol = 0x3A1A08
    } else if (t2 >= 3) {
      // Ball Lightning / Poplust — electric blue-purple energy
      stump = 0x3A2060; bark = 0x1A0A30; ring = 0x6050A0; leaf = 0x4466EE; leafl = 0x88AAFF; leafd = 0x2030A0; moss = 0x3050CC; barrelCol = 0x1A1040
    } else if (t2 >= 1) {
      // Druid of Jungle/Swamp/Storm — mossy swamp green
      stump = 0x3A3010; bark = 0x1A1808; ring = 0x504820; leaf = 0x2A6820; leafl = 0x55AA30; leafd = 0x104808; moss = 0x206018; barrelCol = 0x1A2A08
    } else if (t3 >= 2) {
      // Spirit of Forest / Jungle Bounty — lush deep emerald
      stump = 0x5A3A1A; bark = 0x301A08; ring = 0x7A5838; leaf = 0x0A6A20; leafl = 0x22AA48; leafd = 0x043A10; moss = 0x0A5018; barrelCol = 0x2A1008
    } else if (t3 >= 1) {
      // Thorn Wall — slightly richer green
      stump = 0x623A20; bark = 0x381A08; ring = 0x826040; leaf = 0x1A7820; leafl = 0x3ABB40; leafd = 0x0A4810; moss = 0x185A20; barrelCol = 0x281008
    } else {
      stump = 0x6B3A1E; bark = 0x4A2010; ring = 0x8B5030; leaf = 0x228B22; leafl = 0x44CC44; leafd = 0x145014; moss = 0x2E7D32; barrelCol = bark
    }

    const g = this.customGfx
    g.clear()

    g.fillStyle(stump)
    g.fillEllipse(0, 10, 32, 12)
    g.lineStyle(2, bark)
    g.strokeEllipse(0, 10, 32, 12)

    g.fillStyle(stump)
    g.fillRect(-14, -2, 28, 14)

    g.lineStyle(1.5, bark)
    g.lineBetween(-10, -2, -10, 12)
    g.lineBetween(-4, -2, -4, 12)
    g.lineBetween(2, -2, 2, 12)
    g.lineBetween(8, -2, 8, 12)

    g.fillStyle(ring)
    g.fillEllipse(0, -2, 28, 10)
    g.lineStyle(1, bark)
    g.strokeEllipse(0, -2, 28, 10)
    g.lineStyle(1, bark, 0.6)
    g.strokeEllipse(0, -2, 20, 7)
    g.strokeEllipse(0, -2, 12, 4)
    g.fillStyle(this.darkenHex(ring, 0.1))
    g.fillEllipse(0, -2, 5, 3)

    g.fillStyle(moss, 0.7)
    g.fillCircle(-12, 6, 4)
    g.fillCircle(10, 8, 3)
    g.fillCircle(-6, 12, 3)

    g.fillStyle(leafd)
    g.fillCircle(-7, -14, 9)
    g.fillCircle(7, -14, 9)
    g.fillCircle(0, -11, 9)

    g.fillStyle(leaf)
    g.fillCircle(-8, -16, 8)
    g.fillCircle(8, -16, 8)
    g.fillCircle(0, -20, 8)
    g.fillCircle(-3, -13, 7)
    g.fillCircle(3, -13, 7)

    g.fillStyle(leafl, 0.5)
    g.fillCircle(-6, -18, 4)
    g.fillCircle(7, -19, 3)

    // Lightning glow for thunder path
    if (t1 >= 3) {
      g.lineStyle(2, 0xFFFF44, 0.5)
      g.strokeCircle(0, -16, 14)
    }

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1.5, leafd)
    this.barrel.setSize(18, 5)
    this.barrel.setPosition(12, 0)
  }
}
