import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class EngineerMonkey extends BaseTower {
  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('engineer_monkey')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const TAN   = 0xCD853F
    const TAND  = 0x7A4010
    const TANL  = 0xE8A860
    const HELM  = 0xFFCC00
    const HELMD = 0xCC8800
    const METAL = 0x888888
    const DARK  = 0x333333
    const GEAR  = 0x666666

    // Overalls body (dark blue bib)
    g.fillStyle(0x2255AA)
    g.fillRoundedRect(-12, 0, 24, 18, 4)
    g.lineStyle(1.5, 0x113388)
    g.strokeRoundedRect(-12, 0, 24, 18, 4)

    // Overalls straps
    g.lineStyle(3, 0x2255AA)
    g.lineBetween(-6, 0, -8, -8)
    g.lineBetween(6, 0, 8, -8)

    // Pocket on overalls
    g.fillStyle(0x113388)
    g.fillRect(-2, 4, 8, 6)
    g.lineStyle(1, 0x113388)
    g.strokeRect(-2, 4, 8, 6)

    // Monkey head/face
    g.fillStyle(TAN)
    g.fillCircle(0, -8, 12)
    g.lineStyle(1.5, TAND)
    g.strokeCircle(0, -8, 12)

    // Ears
    g.fillStyle(TAN)
    g.fillCircle(-12, -8, 5)
    g.fillCircle(12, -8, 5)
    g.fillStyle(TANL)
    g.fillCircle(-12, -8, 2.5)
    g.fillCircle(12, -8, 2.5)

    // Eyes
    g.fillStyle(0x1A0800)
    g.fillCircle(-4, -10, 2.5)
    g.fillCircle(4, -10, 2.5)
    g.fillStyle(0xFFFFFF)
    g.fillCircle(-3.2, -10.8, 1)
    g.fillCircle(4.8, -10.8, 1)

    // Muzzle
    g.fillStyle(TANL)
    g.fillEllipse(0, -4, 10, 7)

    // Hard hat
    g.fillStyle(HELM)
    g.fillEllipse(0, -18, 26, 8)
    g.fillStyle(HELMD)
    g.fillRect(-10, -21, 20, 5)
    g.fillStyle(HELM)
    g.fillEllipse(0, -21, 22, 10)
    g.lineStyle(2, HELMD)
    g.strokeEllipse(0, -18, 26, 8)
    // Hat brim stripe
    g.fillStyle(DARK, 0.3)
    g.fillRect(-12, -20, 24, 2)
    // Hat badge
    g.fillStyle(METAL)
    g.fillRect(-3, -23, 6, 4)

    // Gear on body (decorative)
    g.lineStyle(2, GEAR)
    g.strokeCircle(6, 8, 5)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      const ix = 6 + Math.cos(a) * 5
      const iy = 8 + Math.sin(a) * 5
      const ox = 6 + Math.cos(a) * 7
      const oy = 8 + Math.sin(a) * 7
      g.lineStyle(2.5, GEAR)
      g.lineBetween(ix, iy, ox, oy)
    }
    g.fillStyle(GEAR)
    g.fillCircle(6, 8, 2)

    // Nailgun barrel
    this.barrel.setFillStyle(METAL)
    this.barrel.setStrokeStyle(1.5, DARK)
    this.barrel.setSize(20, 7)
    this.barrel.setPosition(13, 0)

    // Nail magazine below barrel
    const mag = scene.add.rectangle(8, 5, 12, 5, 0x444444)
    mag.setStrokeStyle(1, DARK)
    this.barrelPivot.add(mag)
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
      color: 0xCCAA66,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
  }
}
