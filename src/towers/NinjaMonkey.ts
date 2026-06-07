import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class NinjaMonkey extends BaseTower {
  private extraShurikens: number = 0

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('ninja_monkey')!, bloonManager, projectileManager)
    this.body.setFillStyle(0x2F4F4F)
    this.barrel.setFillStyle(0x102020)
    // Ninja can always see camo
    this.hasCamoDetection = true
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
      x: this.x,
      y: this.y,
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
}
