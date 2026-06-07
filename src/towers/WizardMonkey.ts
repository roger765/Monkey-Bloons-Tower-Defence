import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { DamageType } from '../types'

export class WizardMonkey extends BaseTower {
  private firesFireball: boolean = false

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('wizard_monkey')!, bloonManager, projectileManager)
    this.body.setFillStyle(0x9370DB)
    this.barrel.setFillStyle(0x5A30A0)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    // Main magic bolt
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
      color: 0xCC88FF,
    })

    // Fireball: AoE detonating projectile (same pattern as BombShooter)
    if (this.firesFireball) {
      const proj = this.projectileManager.launch({
        x: this.x,
        y: this.y,
        targetX: target.x,
        targetY: target.y,
        speed: this.effectiveProjectileSpeed * 0.7,
        radius: 9,
        damage: this.effectiveDamage + 1,
        pierce: 1,
        damageType: DamageType.Fire,
        color: 0xFF6600,
      })

      if (proj) {
        const origUpdate = proj.update.bind(proj)
        const pm = this.projectileManager
        const dmg = this.effectiveDamage + 1
        let detonated = false
        proj.update = (delta: number, bloons: Bloon[], t: number) => {
          if (!proj.active) return
          const dist = Phaser.Math.Distance.Between(proj.x, proj.y, target.x, target.y)
          if (dist < 12 && !detonated) {
            detonated = true
            pm.detonateAoE(proj.x, proj.y, 30, dmg, DamageType.Fire, bloons, t)
            proj.deactivate()
          } else if (!detonated) {
            origUpdate(delta, bloons, t)
          }
        }
      }
    }
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'fireball') this.firesFireball = true
  }
}
