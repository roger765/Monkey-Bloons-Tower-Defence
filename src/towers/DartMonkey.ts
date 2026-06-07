import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { DamageType } from '../types'

export class DartMonkey extends BaseTower {
  private isTripleShot: boolean = false

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('dart_monkey')!, bloonManager, projectileManager)
    // Dart monkey color indicator
    this.body.setFillStyle(0x8B6914)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.fireDart(angle, target)

    if (this.isTripleShot) {
      this.fireDart(angle - 0.2, null)
      this.fireDart(angle + 0.2, null)
    }
  }

  private fireDart(angle: number, target: Bloon | null): void {
    const speed = this.effectiveProjectileSpeed
    const targetX = this.x + Math.cos(angle) * 500
    const targetY = this.y + Math.sin(angle) * 500

    this.projectileManager.launch({
      x: this.x,
      y: this.y,
      targetX,
      targetY,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0xCCCC00,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'triple_shot') {
      this.isTripleShot = true
    }
  }
}
