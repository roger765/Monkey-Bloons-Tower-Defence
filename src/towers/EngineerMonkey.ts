import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class EngineerMonkey extends BaseTower {
  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('engineer_monkey')!, bloonManager, projectileManager)
    this.body.setFillStyle(0xCD853F)
    this.barrel.setFillStyle(0x7A4010)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    this.projectileManager.launch({
      x: this.x,
      y: this.y,
      targetX: target.x,
      targetY: target.y,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0xCCAA66,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
  }
}
