import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { DamageType, StatusEffectType } from '../types'
import { applyGlue } from '../game/DamageSystem'

export class GlueGunner extends BaseTower {
  private glueDuration: number = 8.0
  private glueSlowMult: number = 0.5
  private canGlueMoab: boolean = false
  private corrosiveDps: number = 0

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('glue_gunner')!, bloonManager, projectileManager)
    this.body.setFillStyle(0x80C040)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const proj = this.projectileManager.launch({
      x: this.x,
      y: this.y,
      targetX: target.x,
      targetY: target.y,
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
