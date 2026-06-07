import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { DamageType } from '../types'

export class BoomerangMonkey extends BaseTower {
  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('boomerang_monkey')!, bloonManager, projectileManager)
    this.body.setFillStyle(0x5A3E28)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    const perpAngle = angle + Math.PI / 4

    this.projectileManager.launch({
      x: this.x,
      y: this.y,
      targetX: this.x + Math.cos(perpAngle) * 200,
      targetY: this.y + Math.sin(perpAngle) * 200,
      speed: this.effectiveProjectileSpeed,
      radius: 8,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0x8B4513,
      isBoomerang: true,
      originX: this.x,
      originY: this.y,
    })
  }
}
