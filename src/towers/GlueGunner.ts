import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { DamageType } from '../types'

export class GlueGunner extends BaseTower {
  private glueDuration: number = 8.0
  private glueSlowMult: number = 0.5
  private canGlueMoab: boolean = false
  private corrosiveDps: number = 0

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('glue_gunner')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const GREEN  = 0x60B020
    const GLUE   = 0x90EE40
    const DARK   = 0x2A5008
    const NOZZLE = 0x507010

    // Glue drip blobs around base
    g.fillStyle(GLUE, 0.7)
    g.fillCircle(-14, 10, 5)
    g.fillCircle(14, 10, 5)
    g.fillCircle(0, 15, 4)
    g.fillCircle(-8, 13, 3)
    g.fillCircle(8, 13, 3)

    // Tank body
    g.fillStyle(GREEN)
    g.fillCircle(0, 0, 16)
    g.lineStyle(2.5, DARK)
    g.strokeCircle(0, 0, 16)

    // Tank shine
    g.fillStyle(GLUE, 0.5)
    g.fillCircle(-5, -6, 7)
    g.fillStyle(0xCCFF80, 0.3)
    g.fillCircle(-6, -7, 4)

    // Label stripe
    g.fillStyle(DARK, 0.4)
    g.fillRect(-12, -3, 24, 6)

    // Glue symbol
    g.fillStyle(GLUE)
    g.fillCircle(0, 0, 4)

    // Nozzle tip styled on barrel
    this.barrel.setFillStyle(NOZZLE)
    this.barrel.setStrokeStyle(1.5, DARK)
    this.barrel.setSize(18, 8)
    this.barrel.setPosition(12, 0)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: target.x, targetY: target.y,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: 0,
      pierce: this.effectivePierce,
      damageType: DamageType.Normal,
      color: 0x90EE40,
      isGlue: true,
      glueDuration: this.glueDuration,
      glueSlowMult: this.glueSlowMult,
      canGlueMoab: this.canGlueMoab,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'moab_glue') this.canGlueMoab = true
    if (effect.specialBehavior === 'corrosive_glue') this.corrosiveDps = 1.0
    if (effect.specialBehavior === 'bloon_dissolver') this.corrosiveDps = 2.0
    if (effect.specialBehavior === 'longer_glue') this.glueDuration += 4.0
    if (effect.specialBehavior === 'stickier_glue') this.glueDuration += 4.0
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let green: number, glue: number, dark: number, nozzle: number, barrelCol: number

    if (t1 >= 3) {
      // Dissolver / Liquefier — acid yellow-green toxic
      green = 0xAACC00; glue = 0xDDFF00; dark = 0x404800; nozzle = 0x888800; barrelCol = 0x606600
    } else if (t1 >= 1) {
      // Corrosive Glue — brighter lime
      green = 0x80BB00; glue = 0xBBEE20; dark = 0x384000; nozzle = 0x607000; barrelCol = 0x507000
    } else if (t2 >= 3) {
      // MOAB Glue / Super Glue — deep amber-orange
      green = 0xAA6600; glue = 0xFFAA00; dark = 0x4A2800; nozzle = 0x885500; barrelCol = 0x704400
    } else if (t2 >= 1) {
      // Bigger Globs / White Hot — warm orange
      green = 0xCC8820; glue = 0xFFCC44; dark = 0x5A3A00; nozzle = 0x906010; barrelCol = 0x7A5000
    } else if (t3 >= 3) {
      // Glue Storm / Bloon Master — very dark forest green
      green = 0x1A5A10; glue = 0x44AA20; dark = 0x082804; nozzle = 0x2A6018; barrelCol = 0x204810
    } else if (t3 >= 1) {
      // Longer / Stickier — deeper cool green
      green = 0x408828; glue = 0x70CC48; dark = 0x182808; nozzle = 0x307020; barrelCol = 0x285818
    } else {
      green = 0x60B020; glue = 0x90EE40; dark = 0x2A5008; nozzle = 0x507010; barrelCol = nozzle
    }

    const g = this.customGfx
    g.clear()

    g.fillStyle(glue, 0.7)
    g.fillCircle(-14, 10, 5)
    g.fillCircle(14, 10, 5)
    g.fillCircle(0, 15, 4)
    g.fillCircle(-8, 13, 3)
    g.fillCircle(8, 13, 3)

    g.fillStyle(green)
    g.fillCircle(0, 0, 16)
    g.lineStyle(2.5, dark)
    g.strokeCircle(0, 0, 16)

    g.fillStyle(glue, 0.5)
    g.fillCircle(-5, -6, 7)
    g.fillStyle(0xCCFF80, 0.3)
    g.fillCircle(-6, -7, 4)

    g.fillStyle(dark, 0.4)
    g.fillRect(-12, -3, 24, 6)

    g.fillStyle(glue)
    g.fillCircle(0, 0, 4)

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1.5, dark)
    this.barrel.setSize(18, 8)
    this.barrel.setPosition(12, 0)
  }
}
