import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class DartlingGunner extends BaseTower {
  private spreadShots: number = 0
  private sideBarrel1!: Phaser.GameObjects.Rectangle
  private sideBarrel2!: Phaser.GameObjects.Rectangle

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('dartling_gunner')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const CHASSIS = 0x4A4A4A
    const DARK    = 0x222222
    const METAL   = 0x666666
    const LIGHT   = 0x888888
    const CYAN    = 0x00CCCC

    // Tripod legs
    g.lineStyle(3, DARK)
    g.lineBetween(0, 6, -14, 18)
    g.lineBetween(0, 6, 14, 18)
    g.lineBetween(0, 6, 0, 20)
    // Foot pads
    g.fillStyle(DARK)
    g.fillCircle(-14, 18, 3)
    g.fillCircle(14, 18, 3)
    g.fillCircle(0, 20, 3)

    // Central turret body
    g.fillStyle(CHASSIS)
    g.fillCircle(0, 2, 13)
    g.lineStyle(2, DARK)
    g.strokeCircle(0, 2, 13)

    // Turret panel lines
    g.lineStyle(1, DARK, 0.6)
    g.lineBetween(-8, -4, 8, -4)
    g.lineBetween(-8, 8, 8, 8)

    // Energy coils (glowing cyan rings)
    g.lineStyle(1.5, CYAN, 0.5)
    g.strokeCircle(0, 2, 8)
    g.lineStyle(1, CYAN, 0.3)
    g.strokeCircle(0, 2, 11)

    // Central energy core
    g.fillStyle(CYAN, 0.8)
    g.fillCircle(0, 2, 4)
    g.fillStyle(0x88FFFF, 0.6)
    g.fillCircle(-1, 1, 2)

    // Side secondary barrels (parallel to main barrel)
    const b1 = scene.add.rectangle(12, -4, 20, 4, DARK)
    b1.setStrokeStyle(1, 0x111111)
    this.barrelPivot.add(b1)
    this.sideBarrel1 = b1
    const b2 = scene.add.rectangle(12, 4, 20, 4, DARK)
    b2.setStrokeStyle(1, 0x111111)
    this.barrelPivot.add(b2)
    this.sideBarrel2 = b2

    // Main central barrel (larger)
    this.barrel.setFillStyle(METAL)
    this.barrel.setStrokeStyle(1.5, DARK)
    this.barrel.setSize(24, 6)
    this.barrel.setPosition(15, 0)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.fireBeam(angle)
    for (let i = 1; i <= this.spreadShots; i++) {
      this.fireBeam(angle + i * 0.12)
      this.fireBeam(angle - i * 0.12)
    }
  }

  private fireBeam(angle: number): void {
    this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: this.x + Math.cos(angle) * 800,
      targetY: this.y + Math.sin(angle) * 800,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0x00FFFF,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'buckshot') this.spreadShots += 2
    if (effect.specialBehavior === 'bloon_exclusion_zone') this.spreadShots += 1
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]

    let chassis: number, dark: number, coreColor: number, coreGlow: number, barrelCol: number, sideCol: number

    if (t1 >= 4) {
      // Ray of Doom — deep crimson
      chassis = 0x5C0000; dark = 0x2A0000; coreColor = 0xFF0000; coreGlow = 0xFF6666; barrelCol = 0xAA0000; sideCol = 0x770000
    } else if (t1 >= 3) {
      // Plasma Accelerator — magenta plasma
      chassis = 0x44004A; dark = 0x1A001E; coreColor = 0xFF00FF; coreGlow = 0xFF88FF; barrelCol = 0xAA00BB; sideCol = 0x660088
    } else if (t1 >= 2) {
      // Laser Cannon — electric blue
      chassis = 0x001A44; dark = 0x000A22; coreColor = 0x0088FF; coreGlow = 0x66CCFF; barrelCol = 0x0055CC; sideCol = 0x003388
    } else if (t1 >= 1) {
      // Laser Shock — bright cyan
      chassis = 0x1A3A3A; dark = 0x0A1A1A; coreColor = 0x00FFEE; coreGlow = 0x88FFEE; barrelCol = 0x00AAAA; sideCol = 0x007777
    } else if (t2 >= 2) {
      // Hydra Rocket Pods — military olive
      chassis = 0x3A4A1A; dark = 0x1A2A0A; coreColor = 0xFF8800; coreGlow = 0xFFCC44; barrelCol = 0x556622; sideCol = 0x334411
    } else {
      // Default grey
      chassis = 0x4A4A4A; dark = 0x222222; coreColor = 0x00CCCC; coreGlow = 0x88FFFF; barrelCol = 0x666666; sideCol = 0x444444
    }

    const g = this.customGfx
    g.clear()

    // Tripod legs
    g.lineStyle(3, dark)
    g.lineBetween(0, 6, -14, 18)
    g.lineBetween(0, 6, 14, 18)
    g.lineBetween(0, 6, 0, 20)
    g.fillStyle(dark)
    g.fillCircle(-14, 18, 3)
    g.fillCircle(14, 18, 3)
    g.fillCircle(0, 20, 3)

    // Central turret body
    g.fillStyle(chassis)
    g.fillCircle(0, 2, 13)
    g.lineStyle(2, dark)
    g.strokeCircle(0, 2, 13)

    // Panel lines
    g.lineStyle(1, dark, 0.6)
    g.lineBetween(-8, -4, 8, -4)
    g.lineBetween(-8, 8, 8, 8)

    // Energy coils
    g.lineStyle(1.5, coreColor, 0.5)
    g.strokeCircle(0, 2, 8)
    g.lineStyle(1, coreColor, 0.3)
    g.strokeCircle(0, 2, 11)

    // Outer glow ring for plasma+ tiers
    if (t1 >= 3) {
      g.lineStyle(2.5, coreColor, 0.7)
      g.strokeCircle(0, 2, 14)
    }

    // Core — larger for Ray of Doom
    g.fillStyle(coreColor, 0.9)
    g.fillCircle(0, 2, t1 >= 4 ? 6 : 4)
    g.fillStyle(coreGlow, 0.6)
    g.fillCircle(-1, 1, 2)

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1.5, dark)
    this.sideBarrel1.setFillStyle(sideCol)
    this.sideBarrel2.setFillStyle(sideCol)
  }
}
