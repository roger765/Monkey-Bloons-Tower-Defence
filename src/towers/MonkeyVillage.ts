import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class MonkeyVillage extends BaseTower {
  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('monkey_village')!, bloonManager, projectileManager)
    this.body.setFillStyle(0xDEB887)
    this.body.setStrokeStyle(2.5, 0x996633)
    // No barrel — village doesn't shoot
    this.barrel.setVisible(false)
    this.barrelPivot.setVisible(false)
  }

  // Override update to skip attack loop — village buffs are passive
  update(delta: number, time: number): void {
    // Passive tower: no attack logic
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    // No-op
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
  }
}
