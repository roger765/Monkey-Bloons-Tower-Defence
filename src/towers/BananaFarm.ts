import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { gameState } from '../game/GameState'

export class BananaFarm extends BaseTower {
  private incomePerRound: number = 80

  constructor(scene: Phaser.Scene, x: number, y: number, bloonManager: BloonManager, projectileManager: ProjectileManager) {
    super(scene, x, y, getTowerConfig('banana_farm')!, bloonManager, projectileManager)
    this.body.setFillStyle(0xFFFF00)
    this.body.setStrokeStyle(2.5, 0xCCAA00)
    // Remove barrel — farms don't shoot
    this.barrel.setVisible(false)
    this.barrelPivot.setVisible(false)
  }

  // Override update to skip the attack loop entirely
  update(delta: number, time: number): void {
    // No attacking — income is granted via onRoundEnd()
  }

  // Called by GameScene at the end of each round
  onRoundEnd(): void {
    gameState.earn(this.incomePerRound)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    // No-op
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'more_bananas') this.incomePerRound += 40
    if (effect.specialBehavior === 'banana_plantation') this.incomePerRound += 100
    if (effect.specialBehavior === 'banana_research_facility') this.incomePerRound += 200
    if (effect.specialBehavior === 'banana_central') this.incomePerRound += 500
    if (effect.specialBehavior === 'banana_absolutely') this.incomePerRound += 1000
    if (effect.specialBehavior === 'increased_production') this.incomePerRound += 60
    if (effect.specialBehavior === 'greater_production') this.incomePerRound += 80
    if (effect.specialBehavior === 'marketplace') this.incomePerRound += 100
    if (effect.specialBehavior === 'central_market') this.incomePerRound += 200
  }
}
