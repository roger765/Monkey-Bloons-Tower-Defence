import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class MonkeyBuccaneer extends BaseTower {
  private extraShots: number = 0

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('monkey_buccaneer')!, bloonManager, projectileManager)
    this.body.setFillStyle(0x8B4513)
    this.barrel.setFillStyle(0x4A2000)
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
      x: this.x,
      y: this.y,
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
  }
}
