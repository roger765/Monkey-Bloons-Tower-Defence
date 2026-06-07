import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class Alchemist extends BaseTower {
  private splashRadius: number = 25

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('alchemist')!, bloonManager, projectileManager)
    this.body.setFillStyle(0xFF6347)
    this.barrel.setFillStyle(0xAA2010)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const proj = this.projectileManager.launch({
      x: this.x,
      y: this.y,
      targetX: target.x,
      targetY: target.y,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage,
      pierce: 1,
      damageType: this.effectiveDamageType,
      color: 0xFF8866,
    })

    if (proj) {
      const origUpdate = proj.update.bind(proj)
      const pm = this.projectileManager
      const splashR = this.splashRadius
      const dmg = this.effectiveDamage
      const dtype = this.effectiveDamageType
      let detonated = false
      proj.update = (delta: number, bloons: Bloon[], t: number) => {
        if (!proj.active) return
        const dist = Phaser.Math.Distance.Between(proj.x, proj.y, target.x, target.y)
        if (dist < 12 && !detonated) {
          detonated = true
          pm.detonateAoE(proj.x, proj.y, splashR, dmg, dtype, bloons, t)
          proj.deactivate()
        } else if (!detonated) {
          origUpdate(delta, bloons, t)
        }
      }
    }
  }

  protected showAttackAnimation(): void {
    const angle = this.barrelPivot.rotation
    const flask = this.scene.add.arc(
      this.x + Math.cos(angle) * 22,
      this.y + Math.sin(angle) * 22,
      7, 0, 360, false, 0xFF6347, 0.85
    )
    flask.setDepth(28)
    this.scene.tweens.add({
      targets: flask,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 120,
      ease: 'Power2Out',
      onComplete: () => flask.destroy(),
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'bigger_potions') this.splashRadius += 10
  }
}
