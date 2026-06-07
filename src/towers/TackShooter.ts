import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { DamageType } from '../types'

export class TackShooter extends BaseTower {
  private tackCount: number = 8

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('tack_shooter')!, bloonManager, projectileManager)
    this.body.setFillStyle(0x808080)
    // Tack shooter doesn't need a target per se — fires in all directions
    this.body.setStrokeStyle(2, 0x606060)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    // Fire in all directions equally spaced
    const angleStep = (Math.PI * 2) / this.tackCount
    for (let i = 0; i < this.tackCount; i++) {
      const angle = i * angleStep
      const tx = this.x + Math.cos(angle) * 500
      const ty = this.y + Math.sin(angle) * 500
      this.projectileManager.launch({
        x: this.x,
        y: this.y,
        targetX: tx,
        targetY: ty,
        speed: this.effectiveProjectileSpeed,
        radius: this.config.projectileRadius,
        damage: this.effectiveDamage,
        pierce: this.effectivePierce,
        damageType: this.effectiveDamageType,
        color: 0xAAAAAA,
        isStraightLine: true,
        angle,
      })
    }
  }

  // Tack shooter always fires (doesn't need specific target in range)
  update(delta: number, time: number): void {
    this.cooldownTimer -= delta / 1000

    if (this.cooldownTimer <= 0) {
      const bloons = this.bloonManager.getActiveBloons()
      // Only fire if at least one bloon is in range
      const inRange = bloons.some(b => {
        if (!b.active) return false
        const dist = Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y)
        return dist <= this.effectiveRange
      })

      if (inRange) {
        // Fire a dummy target in forward direction (will hit all bloons in range via spread)
        const dummyTarget = bloons.find(b => b.active)!
        this.attack(dummyTarget, bloons, time)
        this.showAttackAnimation()
        this.cooldownTimer = this.effectiveCooldown
      }
    }
  }

  protected showAttackAnimation(): void {
    const ring = this.scene.add.arc(this.x, this.y, 10, 0, 360, true, 0xAAAAAA, 0)
    ring.setStrokeStyle(2, 0xCCCCCC, 0.75)
    ring.setDepth(30)
    this.scene.tweens.add({
      targets: ring,
      scaleX: 2.8,
      scaleY: 2.8,
      alpha: 0,
      duration: 160,
      ease: 'Power2Out',
      onComplete: () => ring.destroy(),
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'more_tacks') this.tackCount = 12
    if (effect.specialBehavior === 'even_more_tacks') this.tackCount = 16
    if (effect.specialBehavior === 'tack_sprayer') this.tackCount = Math.max(this.tackCount, 12)
  }
}
