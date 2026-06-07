import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { DamageType } from '../types'
import { applyStun } from '../game/DamageSystem'
import { BLOON_CONFIGS } from '../data/bloons'

export class BombShooter extends BaseTower {
  private blastRadius: number = 40
  private causesStun: boolean = false
  private moabDamageBonus: number = 0

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('bomb_shooter')!, bloonManager, projectileManager)
    this.body.setFillStyle(0x404040)
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
      // Override update to detonate on arrival
      const origUpdate = proj.update.bind(proj)
      const blastR = this.blastRadius
      const dmg = this.effectiveDamage
      const dtype = this.effectiveDamageType
      const pm = this.projectileManager
      const stun = this.causesStun
      const moabBonus = this.moabDamageBonus
      let detonated = false

      proj.update = (delta: number, bloons: Bloon[], t: number) => {
        if (!proj.active) return
        const dist = Phaser.Math.Distance.Between(proj.x, proj.y, target.x, target.y)
        if (dist < 10 && !detonated) {
          detonated = true
          pm.detonateAoE(proj.x, proj.y, blastR, dmg, dtype, bloons, t, stun, 1.5)
          // MOAB bonus damage
          if (moabBonus > 0) {
            for (const b of bloons) {
              if (!b.active) continue
              const bd = Phaser.Math.Distance.Between(proj.x, proj.y, b.x, b.y)
              if (bd <= blastR + 30) {
                const cfg = BLOON_CONFIGS[b.bloonType]
                if (cfg.isMoabClass) {
                  b.takeDamage(moabBonus, dtype, t)
                }
              }
            }
          }
          proj.deactivate()
        } else if (!detonated) {
          origUpdate(delta, bloons, t)
        }
      }
    }
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'bigger_blast') this.blastRadius += 10
    if (effect.specialBehavior === 'stun_blast') this.causesStun = true
    if (effect.specialBehavior === 'moab_mauler') this.moabDamageBonus += 10
  }
}
