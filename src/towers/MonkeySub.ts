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

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let hull: number, hulld: number, hulll: number, metal: number, port: number, barrelCol: number

    if (t1 >= 4) {
      // Energizer — glowing nuclear green
      hull = 0x1A8040; hulld = 0x0A4020; hulll = 0x44CC80; metal = 0x0A5028; port = 0x88FFAA; barrelCol = 0x0A5028
    } else if (t1 >= 2) {
      // Submerge & Support / Reactor — teal/cyan
      hull = 0x1A6A6A; hulld = 0x0A3838; hulll = 0x44AAAA; metal = 0x0A4848; port = 0x88DDDD; barrelCol = 0x0A4848
    } else if (t2 >= 3) {
      // First Strike / Pre-Emptive — dark navy with orange
      hull = 0x1A2050; hulld = 0x080C28; hulll = 0x4060A0; metal = 0x101838; port = 0xFF8800; barrelCol = 0x181828
    } else if (t2 >= 1) {
      // Hot Shot / Fire — fiery orange hull accent
      hull = 0x5060A0; hulld = 0x282840; hulll = 0x8090D0; metal = 0x383868; port = 0xFF6600; barrelCol = 0x383860
    } else if (t3 >= 3) {
      // Ballistic Missile / Sub Commander — military grey
      hull = 0x505868; hulld = 0x282C38; hulll = 0x7880A0; metal = 0x383C50; port = 0xAABBCC; barrelCol = 0x303848
    } else if (t3 >= 1) {
      // Heat-tipped / Barbed — slightly darker
      hull = 0x3060B8; hulld = 0x183070; hulll = 0x5890D8; metal = 0x203878; port = 0x88BBFF; barrelCol = 0x203878
    } else {
      hull = 0x3A5ED0; hulld = 0x1A2A80; hulll = 0x6080F0; metal = 0x2A3A90; port = 0x80AAFF; barrelCol = metal
    }

    const g = this.customGfx
    g.clear()

    g.fillStyle(hull)
    g.fillEllipse(0, 4, 38, 18)
    g.lineStyle(2, hulld)
    g.strokeEllipse(0, 4, 38, 18)

    g.fillStyle(hulll, 0.45)
    g.fillEllipse(-2, 0, 28, 6)

    g.lineStyle(1, hulld)
    g.lineBetween(-18, 4, 18, 4)

    g.fillStyle(metal)
    g.fillRoundedRect(-5, -12, 10, 12, 3)
    g.lineStyle(1.5, hulld)
    g.strokeRoundedRect(-5, -12, 10, 12, 3)

    g.lineStyle(2.5, hulld)
    g.lineBetween(2, -12, 2, -20)
    g.lineStyle(2, metal)
    g.lineBetween(2, -20, 8, -20)
    g.fillStyle(port)
    g.fillCircle(8, -20, 3)
    g.fillStyle(0xCCDDFF, 0.6)
    g.fillCircle(7, -21, 1.5)

    g.fillStyle(port)
    g.fillCircle(-10, 5, 4)
    g.fillCircle(2, 5, 4)
    g.lineStyle(1.5, hulld)
    g.strokeCircle(-10, 5, 4)
    g.strokeCircle(2, 5, 4)
    g.fillStyle(0xCCDDFF, 0.5)
    g.fillCircle(-9, 4, 1.8)
    g.fillCircle(3, 4, 1.8)

    g.fillStyle(metal)
    g.fillTriangle(-20, 0, -16, 7, -22, 7)
    g.fillTriangle(-20, 8, -16, 1, -22, 1)

    // Nuclear glow for energizer tier
    if (t1 >= 4) {
      g.lineStyle(2, 0x44FF88, 0.4)
      g.strokeEllipse(0, 4, 42, 22)
    }

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1.5, hulld)
    this.barrel.setSize(14, 6)
    this.barrel.setPosition(10, 0)
  }
}
