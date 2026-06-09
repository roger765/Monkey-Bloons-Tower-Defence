import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class NinjaMonkey extends BaseTower {
  private extraShurikens: number = 0

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('ninja_monkey')!, bloonManager, projectileManager)

    this.body.setVisible(false)
    this.hasCamoDetection = true

    const g = this.customGfx
    const DARK  = 0x1A2A2A
    const TEAL  = 0x2F5050
    const METAL = 0x88AABB
    const EDGE  = 0xCCDDEE
    const RED   = 0xCC2222
    const WHITE = 0xF0F0F0

    // Shuriken — two overlapping squares rotated 45° from each other
    // Square 1 (axis-aligned diamond)
    const sq1 = [
      { x:  0, y: -18 },
      { x: 18, y:   0 },
      { x:  0, y:  18 },
      { x:-18, y:   0 },
    ]
    g.fillStyle(TEAL)
    g.fillPoints(sq1, true)
    g.lineStyle(1.5, DARK)
    g.strokePoints(sq1, true)

    // Square 2 (rotated 45° = regular square)
    const s = 13
    const sq2 = [
      { x: -s, y: -s },
      { x:  s, y: -s },
      { x:  s, y:  s },
      { x: -s, y:  s },
    ]
    g.fillStyle(DARK)
    g.fillPoints(sq2, true)
    g.lineStyle(1.5, TEAL)
    g.strokePoints(sq2, true)

    // Blade edges (lighter tips on each point)
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2
      const tx = Math.cos(a) * 18
      const ty = Math.sin(a) * 18
      const lx = Math.cos(a - 0.28) * 11
      const ly = Math.sin(a - 0.28) * 11
      const rx = Math.cos(a + 0.28) * 11
      const ry = Math.sin(a + 0.28) * 11
      g.fillStyle(METAL)
      g.fillTriangle(tx, ty, lx, ly, rx, ry)
      g.fillStyle(EDGE, 0.6)
      g.fillTriangle(tx, ty, (tx+lx)/2, (ty+ly)/2, (tx+rx)/2, (ty+ry)/2)
    }

    // Center hub (ninja mask eye-slit)
    g.fillStyle(DARK)
    g.fillCircle(0, 0, 6)
    g.fillStyle(RED)
    g.fillRect(-4, -1.5, 8, 3)  // Red eye slit
    g.fillStyle(WHITE, 0.7)
    g.fillRect(-3, -1, 2, 2)
    g.fillRect(1, -1, 2, 2)

    // Barrel: shuriken throwing direction indicator
    this.barrel.setFillStyle(METAL)
    this.barrel.setStrokeStyle(1, DARK)
    this.barrel.setSize(14, 3)
    this.barrel.setPosition(10, 0)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.throwShuriken(angle)
    for (let i = 1; i <= this.extraShurikens; i++) {
      const spread = i * 0.18
      this.throwShuriken(angle + spread)
      this.throwShuriken(angle - spread)
    }
  }

  private throwShuriken(angle: number): void {
    this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: this.x + Math.cos(angle) * 500,
      targetY: this.y + Math.sin(angle) * 500,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0x88BBBB,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.extraProjectiles) this.extraShurikens += Math.floor(effect.extraProjectiles / 2)
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let outer: number, inner: number, dark: number, blade: number, edge: number, eyeColor: number, barrelCol: number

    if (t1 >= 4) {
      // Grandmaster Ninja — deep purple void, gold blade tips
      outer = 0x220033; inner = 0x0A0011; dark = 0x000000; blade = 0xAA88CC; edge = 0xFFDD88; eyeColor = 0xFF4400; barrelCol = 0xAA88CC
    } else if (t1 >= 3) {
      // Bloonjitsu — purple shuriken
      outer = 0x3A1A4A; inner = 0x1A0022; dark = 0x0A0010; blade = 0x8855AA; edge = 0xDDAAFF; eyeColor = 0xFF3300; barrelCol = 0x8855AA
    } else if (t2 >= 3) {
      // Shinobi Tactics / Bloon Sabotage — teal enhanced
      outer = 0x1A4A4A; inner = 0x0A2222; dark = 0x041010; blade = 0x44AAAA; edge = 0x88DDDD; eyeColor = 0xFF2222; barrelCol = 0x44AAAA
    } else if (t3 >= 2) {
      // Caltrops / Flash Bomb path — olive/green shadow
      outer = 0x2A3A1A; inner = 0x0A1A0A; dark = 0x081008; blade = 0x66AA44; edge = 0xBBDD88; eyeColor = 0xFF2222; barrelCol = 0x66AA44
    } else {
      // Default dark teal
      outer = 0x2F5050; inner = 0x1A2A2A; dark = 0x1A2A2A; blade = 0x88AABB; edge = 0xCCDDEE; eyeColor = 0xCC2222; barrelCol = 0x88AABB
    }

    const g = this.customGfx
    g.clear()

    // Shuriken outer diamond
    const sq1 = [{ x: 0, y: -18 }, { x: 18, y: 0 }, { x: 0, y: 18 }, { x: -18, y: 0 }]
    g.fillStyle(outer)
    g.fillPoints(sq1, true)
    g.lineStyle(1.5, dark)
    g.strokePoints(sq1, true)

    // Inner square
    const s = 13
    const sq2 = [{ x: -s, y: -s }, { x: s, y: -s }, { x: s, y: s }, { x: -s, y: s }]
    g.fillStyle(inner)
    g.fillPoints(sq2, true)
    g.lineStyle(1.5, outer)
    g.strokePoints(sq2, true)

    // Blade edges at each tip
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2
      const tx = Math.cos(a) * 18; const ty = Math.sin(a) * 18
      const lx = Math.cos(a - 0.28) * 11; const ly = Math.sin(a - 0.28) * 11
      const rx = Math.cos(a + 0.28) * 11; const ry = Math.sin(a + 0.28) * 11
      g.fillStyle(blade)
      g.fillTriangle(tx, ty, lx, ly, rx, ry)
      g.fillStyle(edge, 0.6)
      g.fillTriangle(tx, ty, (tx + lx) / 2, (ty + ly) / 2, (tx + rx) / 2, (ty + ry) / 2)
    }

    // Hub + eye slit
    g.fillStyle(dark)
    g.fillCircle(0, 0, 6)
    g.fillStyle(eyeColor)
    g.fillRect(-4, -1.5, 8, 3)
    g.fillStyle(0xFFFFFF, 0.7)
    g.fillRect(-3, -1, 2, 2)
    g.fillRect(1, -1, 2, 2)

    // Purple glow ring for grandmaster
    if (t1 >= 4) {
      g.lineStyle(2, 0xAA44FF, 0.5)
      g.strokeCircle(0, 0, 20)
    }

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1, dark)
  }
}
