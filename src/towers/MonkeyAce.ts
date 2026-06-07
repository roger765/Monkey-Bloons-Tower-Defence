import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class MonkeyAce extends BaseTower {
  private orbitAngle: number = 0
  private burstCount: number = 1

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('monkey_ace')!, bloonManager, projectileManager)
    this.body.setFillStyle(0xC0C0C0)
    this.barrel.setFillStyle(0x888888)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    // Fire in spreading arcs around the orbit angle
    const spread = Math.PI * 2 / (this.burstCount * 2 + 1)
    for (let i = 0; i < this.burstCount; i++) {
      const angle = this.orbitAngle + (i - Math.floor(this.burstCount / 2)) * spread
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
        color: 0xDDDDDD,
      })
    }
    this.orbitAngle += 0.4
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.extraProjectiles) this.burstCount += effect.extraProjectiles
  }
}
