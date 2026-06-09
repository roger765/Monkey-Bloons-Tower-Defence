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
}
