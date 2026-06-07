import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { DamageType } from '../types'

export class IceMonkey extends BaseTower {
  private freezeDuration: number = 2.5
  private canFreezeBlackWhite: boolean = false
  private permafrostSlow: boolean = false

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('ice_monkey')!, bloonManager, projectileManager)
    this.body.setFillStyle(0x80D0FF)
    // targeting defaults to First via BaseTower — no override needed
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    this.projectileManager.freezeAoE(
      this.x,
      this.y,
      this.effectiveRange,
      allBloons,
      this.freezeDuration,
      this.canFreezeBlackWhite
    )
  }

  protected showAttackAnimation(): void {
    const ring = this.scene.add.arc(this.x, this.y, this.effectiveRange * 0.25, 0, 360, true, 0x80D0FF, 0)
    ring.setStrokeStyle(2.5, 0xAAEEFF, 0.7)
    ring.setDepth(30)
    this.scene.tweens.add({
      targets: ring,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 380,
      ease: 'Sine.easeOut',
      onComplete: () => ring.destroy(),
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'cold_snap') this.canFreezeBlackWhite = true
    if (effect.specialBehavior === 'super_freeze') this.canFreezeBlackWhite = true
    if (effect.specialBehavior === 'permafrost') this.permafrostSlow = true
    if (effect.specialBehavior === 'refreeze') this.freezeDuration += 1.0
  }
}
