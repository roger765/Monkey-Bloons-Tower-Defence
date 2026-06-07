import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class DartlingGunner extends BaseTower {
  private spreadShots: number = 0

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('dartling_gunner')!, bloonManager, projectileManager)
    this.body.setFillStyle(0x4A4A4A)
    this.barrel.setFillStyle(0x222222)
    // Wider barrel for the gunner look
    this.barrel.setSize(22, 9)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.fireBeam(angle)
    for (let i = 1; i <= this.spreadShots; i++) {
      const spread = i * 0.12
      this.fireBeam(angle + spread)
      this.fireBeam(angle - spread)
    }
  }

  private fireBeam(angle: number): void {
    this.projectileManager.launch({
      x: this.x,
      y: this.y,
      targetX: this.x + Math.cos(angle) * 800,
      targetY: this.y + Math.sin(angle) * 800,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0x00FFFF,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'buckshot') this.spreadShots += 2
    if (effect.specialBehavior === 'bloon_exclusion_zone') this.spreadShots += 1
  }
}
