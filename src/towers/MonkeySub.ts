import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class MonkeySub extends BaseTower {
  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('monkey_sub')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const HULL  = 0x3A5ED0
    const HULLD = 0x1A2A80
    const HULLL = 0x6080F0
    const METAL = 0x2A3A90
    const PORT  = 0x80AAFF
    const YELLOW = 0xFFDD00

    // Main submarine hull — wide horizontal ellipse
    g.fillStyle(HULL)
    g.fillEllipse(0, 4, 38, 18)
    g.lineStyle(2, HULLD)
    g.strokeEllipse(0, 4, 38, 18)

    // Hull shine stripe
    g.fillStyle(HULLL, 0.45)
    g.fillEllipse(-2, 0, 28, 6)

    // Hull seam line
    g.lineStyle(1, HULLD)
    g.lineBetween(-18, 4, 18, 4)

    // Conning tower
    g.fillStyle(METAL)
    g.fillRoundedRect(-5, -12, 10, 12, 3)
    g.lineStyle(1.5, HULLD)
    g.strokeRoundedRect(-5, -12, 10, 12, 3)

    // Periscope
    g.lineStyle(2.5, HULLD)
    g.lineBetween(2, -12, 2, -20)
    g.lineStyle(2, METAL)
    g.lineBetween(2, -20, 8, -20)
    // Periscope lens
    g.fillStyle(PORT)
    g.fillCircle(8, -20, 3)
    g.fillStyle(0xCCDDFF, 0.6)
    g.fillCircle(7, -21, 1.5)

    // Portholes
    g.fillStyle(PORT)
    g.fillCircle(-10, 5, 4)
    g.fillCircle(2, 5, 4)
    g.lineStyle(1.5, HULLD)
    g.strokeCircle(-10, 5, 4)
    g.strokeCircle(2, 5, 4)
    g.fillStyle(0xCCDDFF, 0.5)
    g.fillCircle(-9, 4, 1.8)
    g.fillCircle(3, 4, 1.8)

    // Propeller fins at back
    g.fillStyle(METAL)
    g.fillTriangle(-20, 0, -16, 7, -22, 7)
    g.fillTriangle(-20, 8, -16, 1, -22, 1)

    // Torpedo tube barrel
    this.barrel.setFillStyle(METAL)
    this.barrel.setStrokeStyle(1.5, HULLD)
    this.barrel.setSize(14, 6)
    this.barrel.setPosition(10, 0)
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
      color: 0x88AAFF,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
  }
}
