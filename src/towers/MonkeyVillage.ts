import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class MonkeyVillage extends BaseTower {
  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('monkey_village')!, bloonManager, projectileManager)

    this.body.setVisible(false)
    this.barrel.setVisible(false)
    this.barrelPivot.setVisible(false)

    const g = this.customGfx
    const WALL  = 0xDEB887
    const WALLD = 0x8B6040
    const WALLL = 0xF5DEB3
    const ROOF  = 0x996633
    const ROOFD = 0x6B3A1E
    const THATCH = 0xC8922A
    const WOOD  = 0x7A5030
    const WIN   = 0x88BBDD
    const FLAG  = 0xCC2222
    const STONE = 0xAA9988

    // Stone foundation ring
    g.fillStyle(STONE)
    g.fillEllipse(0, 14, 36, 8)
    g.lineStyle(1.5, WALLD)
    g.strokeEllipse(0, 14, 36, 8)
    g.lineStyle(1, WALLD, 0.4)
    g.lineBetween(-14, 14, 14, 14)

    // Hut walls (circular)
    g.fillStyle(WALL)
    g.fillCircle(0, 4, 16)
    g.lineStyle(2, WALLD)
    g.strokeCircle(0, 4, 16)

    // Wall texture bands
    g.lineStyle(1, WALLD, 0.4)
    g.strokeCircle(0, 4, 12)
    g.strokeCircle(0, 4, 7)

    // Wall highlight
    g.fillStyle(WALLL, 0.35)
    g.fillEllipse(-4, -1, 10, 14)

    // Door
    g.fillStyle(WOOD)
    g.fillRoundedRect(-4, 7, 8, 10, 2)
    g.lineStyle(1.5, ROOFD)
    g.strokeRoundedRect(-4, 7, 8, 10, 2)
    // Door handle
    g.fillStyle(0xFFCC44)
    g.fillCircle(3, 12, 1.5)

    // Windows
    g.fillStyle(WIN)
    g.fillCircle(-10, 2, 4)
    g.fillCircle(10, 2, 4)
    g.lineStyle(1.5, WALLD)
    g.strokeCircle(-10, 2, 4)
    g.strokeCircle(10, 2, 4)
    // Window cross
    g.lineStyle(1, WALLD)
    g.lineBetween(-10, -2, -10, 6)
    g.lineBetween(-14, 2, -6, 2)
    g.lineBetween(10, -2, 10, 6)
    g.lineBetween(6, 2, 14, 2)

    // Thatched roof cone
    g.fillStyle(THATCH)
    g.fillTriangle(-18, -8, 18, -8, 0, -26)
    g.lineStyle(2, ROOFD)
    g.strokeTriangle(-18, -8, 18, -8, 0, -26)

    // Thatch texture lines
    g.lineStyle(1.5, ROOF, 0.6)
    g.lineBetween(-9, -8, -4, -26)
    g.lineBetween(0, -8, 0, -26)
    g.lineBetween(9, -8, 4, -26)
    g.lineBetween(-17, -8, -8, -20)
    g.lineBetween(17, -8, 8, -20)

    // Roof eave band
    g.fillStyle(ROOF)
    g.fillRect(-19, -10, 38, 4)
    g.lineStyle(1.5, ROOFD)
    g.strokeRect(-19, -10, 38, 4)

    // Flag pole
    g.lineStyle(2.5, WOOD)
    g.lineBetween(0, -26, 0, -36)

    // Flag
    g.fillStyle(FLAG)
    g.fillTriangle(0, -36, 12, -33, 0, -30)
    g.lineStyle(1, ROOFD)
    g.strokeTriangle(0, -36, 12, -33, 0, -30)
  }

  update(delta: number, time: number): void {}

  attack(target: Bloon, allBloons: Bloon[], time: number): void {}

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
  }
}
