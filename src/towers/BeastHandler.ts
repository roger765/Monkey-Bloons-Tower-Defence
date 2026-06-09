import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class BeastHandler extends BaseTower {
  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('beast_handler')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const CAGE  = 0x5A7A5A
    const CAGED = 0x2A4A2A
    const CAGL  = 0x88BB88
    const WOOD  = 0x8B5E30
    const WOODD = 0x5A3010
    const PAW   = 0x3A6A3A
    const CLAW  = 0xCCDDCC
    const DARK  = 0x1A2A1A

    // Cage base platform
    g.fillStyle(WOODD)
    g.fillRoundedRect(-16, 10, 32, 8, 3)
    g.lineStyle(1.5, DARK)
    g.strokeRoundedRect(-16, 10, 32, 8, 3)

    // Cage floor
    g.lineStyle(2, WOODD)
    g.lineBetween(-12, 12, 12, 12)
    g.lineBetween(-8, 10, -8, 18)
    g.lineBetween(0, 10, 0, 18)
    g.lineBetween(8, 10, 8, 18)

    // Cage back wall
    g.fillStyle(CAGED, 0.4)
    g.fillRect(-14, -10, 28, 22)

    // Cage top bar
    g.fillStyle(CAGE)
    g.fillRect(-16, -12, 32, 4)
    g.lineStyle(1.5, CAGED)
    g.strokeRect(-16, -12, 32, 4)

    // Cage vertical bars (main feature)
    const barCount = 6
    g.lineStyle(3, CAGE)
    for (let i = 0; i <= barCount; i++) {
      const bx = -14 + (i / barCount) * 28
      g.lineBetween(bx, -12, bx, 10)
    }
    // Bar highlights
    g.lineStyle(1, CAGL, 0.5)
    for (let i = 0; i <= barCount; i++) {
      const bx = -14 + (i / barCount) * 28 - 0.8
      g.lineBetween(bx, -12, bx, 10)
    }

    // Cage door on right side (slightly offset bars)
    g.fillStyle(CAGE, 0.3)
    g.fillRect(6, -10, 8, 20)
    g.lineStyle(2, CAGED)
    g.lineBetween(6, -10, 6, 10)
    g.lineBetween(14, -10, 14, 10)
    // Door latch
    g.fillStyle(0xFFCC44)
    g.fillCircle(14, 2, 3)
    g.lineStyle(1.5, 0xCC9900)
    g.strokeCircle(14, 2, 3)

    // Corner posts
    g.fillStyle(WOOD)
    g.fillRect(-16, -14, 4, 26)
    g.fillRect(12, -14, 4, 26)
    g.lineStyle(1, WOODD)
    g.strokeRect(-16, -14, 4, 26)
    g.strokeRect(12, -14, 4, 26)

    // Beast paw prints visible through bars
    g.fillStyle(PAW, 0.6)
    g.fillCircle(-4, 2, 4)
    g.fillStyle(PAW, 0.5)
    g.fillCircle(-8, -4, 2.5)
    g.fillCircle(0, -5, 2.5)
    g.fillCircle(-11, 0, 2)
    g.fillCircle(3, 1, 2)

    // Claw marks on bars
    g.lineStyle(1.5, CLAW, 0.6)
    g.lineBetween(-2, -8, 0, -2)
    g.lineBetween(0, -8, 2, -2)
    g.lineBetween(-4, -8, -2, -2)

    // Handler's prod / control rod (barrel)
    this.barrel.setFillStyle(WOODD)
    this.barrel.setStrokeStyle(1.5, DARK)
    this.barrel.setSize(18, 5)
    this.barrel.setPosition(12, 0)

    // Prod tip (electric)
    const prodTip = scene.add.arc(22, 0, 4, 0, 360, false, 0x88FF44)
    prodTip.setStrokeStyle(1, 0x44CC00)
    this.barrelPivot.add(prodTip)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: target.x, targetY: target.y,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0xAADDAA,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
  }
}
