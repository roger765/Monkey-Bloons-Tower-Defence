import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { gameState } from '../game/GameState'
import { showCashPopup } from '../ui/CashPopup'

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
      showCashPopup(this.scene, this.x, this.y, this.payoutAmount)
    }
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {}

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'more_bananas') this.payoutAmount += 10
    if (effect.specialBehavior === 'banana_plantation') this.payoutAmount += 25
    if (effect.specialBehavior === 'banana_research_facility') this.payoutAmount += 50
    if (effect.specialBehavior === 'banana_central') this.payoutAmount += 125
    if (effect.specialBehavior === 'banana_absolutely') this.payoutAmount += 250
    if (effect.specialBehavior === 'increased_production') this.payoutInterval = Math.max(2000, this.payoutInterval - 2000)
    if (effect.specialBehavior === 'greater_production') this.payoutInterval = Math.max(2000, this.payoutInterval - 2000)
    if (effect.specialBehavior === 'marketplace') this.payoutAmount += 25
    if (effect.specialBehavior === 'central_market') this.payoutAmount += 50
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let wall: number, walll: number, walld: number, roof: number, roofl: number, wood: number, woodd: number, bana: number, banas: number

    if (t1 >= 4) {
      // Banana Central / Absolutely — rich gold barn
      wall = 0xDDAA00; walll = 0xFFDD44; walld = 0x6A4800; roof = 0xCC8800; roofl = 0xEEAA22; wood = 0xAA7700; woodd = 0x6A4400; bana = 0xFFFF00; banas = 0xDDCC00
    } else if (t1 >= 2) {
      // Plantation / Research — brighter yellow
      wall = 0xDDB830; walll = 0xFFDD66; walld = 0x7A5800; roof = 0xAA7000; roofl = 0xCC9022; wood = 0x8A5A00; woodd = 0x5A3A00; bana = 0xFFEE00; banas = 0xCCBB00
    } else if (t2 >= 3) {
      // Monkey Bank / IMF Loan / Offshore — blue financial
      wall = 0x2244AA; walll = 0x4466CC; walld = 0x0A1A5A; roof = 0x112288; roofl = 0x2244AA; wood = 0x1A3A8A; woodd = 0x0A1A5A; bana = 0xFFCC00; banas = 0xCCAA00
    } else if (t2 >= 1) {
      // Greater Production — slightly blue-grey
      wall = 0x6688CC; walll = 0x88AAEE; walld = 0x2A3A7A; roof = 0x4466AA; roofl = 0x6688CC; wood = 0x4A5A9A; woodd = 0x2A3A6A; bana = 0xFFEE44; banas = 0xDDCC00
    } else if (t3 >= 3) {
      // Marketplace / Wall Street — sleek dark grey
      wall = 0x3A3A3A; walll = 0x5A5A5A; walld = 0x1A1A1A; roof = 0x282828; roofl = 0x404040; wood = 0x2A2A2A; woodd = 0x101010; bana = 0xFFDD00; banas = 0xCCBB00
    } else if (t3 >= 1) {
      // EZ Collect / Salvage — slightly cleaner look
      wall = 0xCC5533; walll = 0xEE7755; walld = 0x7A2A14; roof = 0x7A5520; roofl = 0x9A7030; wood = 0x7A5030; woodd = 0x4A2800; bana = 0xFFEE00; banas = 0xCCAA00
    } else {
      wall = 0xCC4422; walll = 0xEE6644; walld = 0x881A0A; roof = 0x886622; roofl = 0xAA8833; wood = 0x8B5E30; woodd = 0x5A3010; bana = 0xFFEE00; banas = 0xCCAA00
    }

    const g = this.customGfx
    g.clear()

    g.fillStyle(woodd)
    g.fillRect(-17, 12, 34, 6)

    g.fillStyle(wall)
    g.fillRect(-17, -6, 34, 20)
    g.lineStyle(1, walld, 0.5)
    for (let py = -3; py <= 12; py += 5) {
      g.lineBetween(-17, py, 17, py)
    }
    g.fillStyle(wood)
    g.fillRect(-17, -6, 3, 20)
    g.fillRect(14, -6, 3, 20)

    g.fillStyle(walll)
    g.fillTriangle(-17, -6, 17, -6, 0, -18)
    g.lineStyle(1.5, wood)
    g.strokeTriangle(-17, -6, 17, -6, 0, -18)
    g.fillStyle(0x88AACC)
    g.fillCircle(0, -10, 4)
    g.lineStyle(1, wood)
    g.strokeCircle(0, -10, 4)
    g.lineStyle(1, wood)
    g.lineBetween(0, -14, 0, -6)
    g.lineBetween(-4, -10, 4, -10)

    g.fillStyle(roof)
    g.fillTriangle(-19, -5, 19, -5, 0, -20)
    g.lineStyle(2, roofl)
    g.strokeTriangle(-19, -5, 19, -5, 0, -20)
    g.lineStyle(3, roofl)
    g.lineBetween(-19, -5, 0, -20)
    g.lineBetween(19, -5, 0, -20)

    g.fillStyle(woodd)
    g.fillRect(-7, 1, 14, 17)
    g.lineStyle(1.5, wood)
    g.strokeRect(-7, 1, 14, 17)
    g.lineStyle(1, wood)
    g.lineBetween(-7, 1, 7, 18)
    g.lineBetween(7, 1, -7, 18)

    g.fillStyle(0x88AACC)
    g.fillRect(-15, -1, 5, 5)
    g.fillRect(10, -1, 5, 5)
    g.lineStyle(1, wood)
    g.strokeRect(-15, -1, 5, 5)
    g.strokeRect(10, -1, 5, 5)
    g.lineBetween(-12.5, -1, -12.5, 4)
    g.lineBetween(12.5, -1, 12.5, 4)

    g.fillStyle(bana)
    g.fillEllipse(-20, 4, 7, 10)
    g.fillEllipse(-18, 0, 5, 8)
    g.fillEllipse(-22, 0, 5, 8)
    g.lineStyle(1, banas)
    g.strokeEllipse(-20, 4, 7, 10)

    g.fillStyle(bana)
    g.fillEllipse(20, 4, 7, 10)
    g.fillEllipse(18, 0, 5, 8)
    g.fillEllipse(22, 0, 5, 8)
    g.lineStyle(1, banas)
    g.strokeEllipse(20, 4, 7, 10)

    g.lineStyle(2, banas)
    g.lineBetween(-20, -4, -20, -1)
    g.lineBetween(20, -4, 20, -1)
  }
}
