import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class SpikeFactory extends BaseTower {
  // Drops spikes ahead on the track at a fixed offset from tower position
  private readonly DROP_OFFSET = 60

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('spike_factory')!, bloonManager, projectileManager)
    this.body.setFillStyle(0xA0522D)
    this.barrel.setFillStyle(0x602010)
    // Point barrel downward toward track
    this.barrelPivot.setRotation(Math.PI / 2)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    // Drop a slow-moving spike pile toward the target
    this.projectileManager.launch({
      x: this.x,
      y: this.y + this.DROP_OFFSET,
      targetX: target.x,
      targetY: target.y,
      speed: 1,   // nearly stationary — acts like a placed spike
      radius: 8,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0x888844,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
  }
}
