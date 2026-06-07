import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class Druid extends BaseTower {
  private thornCount: number = 3

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('druid')!, bloonManager, projectileManager)
    this.body.setFillStyle(0x228B22)
    this.barrel.setFillStyle(0x104510)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const baseAngle = Math.atan2(target.y - this.y, target.x - this.x)
    const halfSpread = (this.thornCount - 1) * 0.12
    for (let i = 0; i < this.thornCount; i++) {
      const angle = baseAngle - halfSpread + i * 0.24
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
        color: 0x44DD44,
      })
    }
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.extraProjectiles) this.thornCount += effect.extraProjectiles
  }
}
