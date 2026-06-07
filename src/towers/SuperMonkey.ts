import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class SuperMonkey extends BaseTower {
  private dualBarrel: boolean = false

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('super_monkey')!, bloonManager, projectileManager)
    this.body.setFillStyle(0xFFD700)
    this.body.setStrokeStyle(2.5, 0xCC9900)
    this.barrel.setFillStyle(0xAA7700)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.fireBeam(angle)
    if (this.dualBarrel) {
      this.fireBeam(angle + 0.15)
      this.fireBeam(angle - 0.15)
    }
  }

  private fireBeam(angle: number): void {
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
      color: 0xFFEE00,
    })
  }

  protected showAttackAnimation(): void {
    // Subtle golden pulse instead of muzzle flash
    const pulse = this.scene.add.arc(this.x, this.y, 20, 0, 360, false, 0xFFD700, 0.3)
    pulse.setDepth(20)
    this.scene.tweens.add({
      targets: pulse,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 80,
      ease: 'Power2Out',
      onComplete: () => pulse.destroy(),
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'robo_monkey') this.dualBarrel = true
  }
}
