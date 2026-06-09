import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { gameState } from '../game/GameState'

export class BananaFarm extends BaseTower {
  private payoutAmount: number = 20       // $ earned each payout tick
  private payoutInterval: number = 8000   // ms between payouts (8 s)
  private payoutTimer: number = 0

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('banana_farm')!, bloonManager, projectileManager)

    this.body.setVisible(false)
    this.barrel.setVisible(false)
    this.barrelPivot.setVisible(false)

    const g = this.customGfx
    const WALL  = 0xCC4422
    const WALLL = 0xEE6644
    const WALLD = 0x881A0A
    const ROOF  = 0x886622
    const ROOFL = 0xAA8833
    const WOOD  = 0x8B5E30
    const WOODD = 0x5A3010
    const LOFT  = 0xEEDDAA
    const BANA  = 0xFFEE00
    const BANAS = 0xCCAA00

    // Barn foundation
    g.fillStyle(WOODD)
    g.fillRect(-17, 12, 34, 6)

    // Barn main walls
    g.fillStyle(WALL)
    g.fillRect(-17, -6, 34, 20)
    // Siding planks
    g.lineStyle(1, WALLD, 0.5)
    for (let py = -3; py <= 12; py += 5) {
      g.lineBetween(-17, py, 17, py)
    }
    // Wall corners
    g.fillStyle(WOOD)
    g.fillRect(-17, -6, 3, 20)
    g.fillRect(14, -6, 3, 20)

    // Loft gable / upper triangle
    g.fillStyle(LOFT)
    g.fillTriangle(-17, -6, 17, -6, 0, -18)
    g.lineStyle(1.5, WOOD)
    g.strokeTriangle(-17, -6, 17, -6, 0, -18)
    // Loft window
    g.fillStyle(0x88AACC)
    g.fillCircle(0, -10, 4)
    g.lineStyle(1, WOOD)
    g.strokeCircle(0, -10, 4)
    // Cross pane
    g.lineStyle(1, WOOD)
    g.lineBetween(0, -14, 0, -6)
    g.lineBetween(-4, -10, 4, -10)

    // Roof
    g.fillStyle(ROOF)
    g.fillTriangle(-19, -5, 19, -5, 0, -20)
    g.lineStyle(2, ROOFL)
    g.strokeTriangle(-19, -5, 19, -5, 0, -20)
    // Roof ridge beam
    g.lineStyle(3, ROOFL)
    g.lineBetween(-19, -5, 0, -20)
    g.lineBetween(19, -5, 0, -20)

    // Barn door
    g.fillStyle(WOODD)
    g.fillRect(-7, 1, 14, 17)
    g.lineStyle(1.5, WOOD)
    g.strokeRect(-7, 1, 14, 17)
    // Door X brace
    g.lineStyle(1, WOOD)
    g.lineBetween(-7, 1, 7, 18)
    g.lineBetween(7, 1, -7, 18)

    // Windows on sides
    g.fillStyle(0x88AACC)
    g.fillRect(-15, -1, 5, 5)
    g.fillRect(10, -1, 5, 5)
    g.lineStyle(1, WOOD)
    g.strokeRect(-15, -1, 5, 5)
    g.strokeRect(10, -1, 5, 5)
    g.lineBetween(-12.5, -1, -12.5, 4)
    g.lineBetween(12.5, -1, 12.5, 4)

    // Banana bunches on sides
    g.fillStyle(BANA)
    g.fillEllipse(-20, 4, 7, 10)
    g.fillEllipse(-18, 0, 5, 8)
    g.fillEllipse(-22, 0, 5, 8)
    g.lineStyle(1, BANAS)
    g.strokeEllipse(-20, 4, 7, 10)

    g.fillStyle(BANA)
    g.fillEllipse(20, 4, 7, 10)
    g.fillEllipse(18, 0, 5, 8)
    g.fillEllipse(22, 0, 5, 8)
    g.lineStyle(1, BANAS)
    g.strokeEllipse(20, 4, 7, 10)

    // Bunch stems
    g.lineStyle(2, BANAS)
    g.lineBetween(-20, -4, -20, -1)
    g.lineBetween(20, -4, 20, -1)
  }

  update(delta: number, time: number): void {
    if (!gameState.isWaveActive) return
    this.payoutTimer += delta
    if (this.payoutTimer >= this.payoutInterval) {
      this.payoutTimer -= this.payoutInterval
      gameState.earn(this.payoutAmount)
    }
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {}

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    // Path 1 upgrades: increase payout amount per tick
    if (effect.specialBehavior === 'more_bananas') this.payoutAmount += 10
    if (effect.specialBehavior === 'banana_plantation') this.payoutAmount += 25
    if (effect.specialBehavior === 'banana_research_facility') this.payoutAmount += 50
    if (effect.specialBehavior === 'banana_central') this.payoutAmount += 125
    if (effect.specialBehavior === 'banana_absolutely') this.payoutAmount += 250
    // Path 2 upgrades: shorten the payout interval (more frequent ticks)
    if (effect.specialBehavior === 'increased_production') this.payoutInterval = Math.max(2000, this.payoutInterval - 2000)
    if (effect.specialBehavior === 'greater_production') this.payoutInterval = Math.max(2000, this.payoutInterval - 2000)
    if (effect.specialBehavior === 'marketplace') this.payoutAmount += 25
    if (effect.specialBehavior === 'central_market') this.payoutAmount += 50
  }
}
