import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class HeliPilot extends BaseTower {
  private extraShots: number = 0

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('heli_pilot')!, bloonManager, projectileManager)
    this.body.setFillStyle(0x708090)
    this.barrel.setFillStyle(0x3A4050)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.fireDart(angle)
    for (let i = 1; i <= this.extraShots; i++) {
      this.fireDart(angle + i * 0.2)
      this.fireDart(angle - i * 0.2)
    }
  }

  private fireDart(angle: number): void {
    this.projectileManager.launch({
      x: this.x,
      y: this.y,
      targetX: this.x + Math.cos(angle) * 600,
      targetY: this.y + Math.sin(angle) * 600,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0xAABBCC,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.extraProjectiles) this.extraShots += Math.floor(effect.extraProjectiles / 2)
  }
}
