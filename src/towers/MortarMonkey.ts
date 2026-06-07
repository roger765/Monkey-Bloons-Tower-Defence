import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class MortarMonkey extends BaseTower {
  private blastRadius: number = 50

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('mortar_monkey')!, bloonManager, projectileManager)
    this.body.setFillStyle(0x556B2F)
    this.barrel.setFillStyle(0x2A3510)
    // Mortar barrel points upward
    this.barrelPivot.setRotation(-Math.PI / 2)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const proj = this.projectileManager.launch({
      x: this.x,
      y: this.y,
      targetX: target.x,
      targetY: target.y,
      speed: this.effectiveProjectileSpeed,
      radius: 8,
      damage: this.effectiveDamage,
      pierce: 1,
      damageType: this.effectiveDamageType,
      color: 0x333333,
    })

    if (proj) {
      const origUpdate = proj.update.bind(proj)
      const blastR = this.blastRadius
      const dmg = this.effectiveDamage
      const dtype = this.effectiveDamageType
      const pm = this.projectileManager
      let detonated = false

      proj.update = (delta: number, bloons: Bloon[], t: number) => {
        if (!proj.active) return
        const dist = Phaser.Math.Distance.Between(proj.x, proj.y, target.x, target.y)
        if (dist < 12 && !detonated) {
          detonated = true
          pm.detonateAoE(proj.x, proj.y, blastR, dmg, dtype, bloons, t)
          proj.deactivate()
        } else if (!detonated) {
          origUpdate(delta, bloons, t)
        }
      }
    }
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'bigger_blast_mortar') this.blastRadius += 15
    if (effect.specialBehavior === 'the_big_one') this.blastRadius += 20
    if (effect.specialBehavior === 'the_biggest_one_mortar') this.blastRadius += 25
  }
}
