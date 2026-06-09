import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { DamageType } from '../types'

export class WizardMonkey extends BaseTower {
  private firesFireball: boolean = false

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('wizard_monkey')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const ROBE  = 0x7A50C0
    const ROBED = 0x4A2880
    const ROBEL = 0xAA80F0
    const HAT   = 0x5A38A8
    const GOLD  = 0xFFCC22
    const STAR  = 0xFFEE88
    const SKIN  = 0xD4B080

    // Robe body (wide circle base)
    g.fillStyle(ROBE)
    g.fillCircle(0, 4, 16)
    g.lineStyle(2, ROBED)
    g.strokeCircle(0, 4, 16)

    // Robe front crease
    g.lineStyle(1.5, ROBED)
    g.lineBetween(0, -8, 0, 18)
    // Star pattern on robe
    g.fillStyle(GOLD, 0.7)
    g.fillCircle(-6, 6, 2)
    g.fillCircle(6, 6, 2)
    g.fillCircle(0, 12, 2)

    // Robe highlight
    g.fillStyle(ROBEL, 0.3)
    g.fillEllipse(-4, -2, 10, 14)

    // Head (skin)
    g.fillStyle(SKIN)
    g.fillCircle(0, -6, 9)
    g.lineStyle(1.5, ROBED)
    g.strokeCircle(0, -6, 9)

    // Eyes
    g.fillStyle(0x2A1060)
    g.fillCircle(-3, -7, 2.2)
    g.fillCircle(3, -7, 2.2)
    g.fillStyle(0xFFFFFF)
    g.fillCircle(-2.2, -7.8, 0.9)
    g.fillCircle(3.8, -7.8, 0.9)

    // Wizard hat (pointy triangle)
    g.fillStyle(HAT)
    g.fillTriangle(-10, -12, 10, -12, 0, -30)
    g.lineStyle(1.5, ROBED)
    g.strokeTriangle(-10, -12, 10, -12, 0, -30)

    // Hat brim
    g.fillStyle(ROBED)
    g.fillRect(-12, -15, 24, 5)
    g.lineStyle(1, ROBED)
    g.strokeRect(-12, -15, 24, 5)

    // Hat star
    g.fillStyle(GOLD)
    g.fillCircle(0, -22, 3)

    // Floating stars around hat
    g.fillStyle(STAR, 0.8)
    g.fillCircle(-14, -18, 2)
    g.fillCircle(14, -20, 1.5)
    g.fillCircle(-12, -8, 1.5)

    // Wand barrel (thin and mystical)
    this.barrel.setFillStyle(0x8B6020)
    this.barrel.setStrokeStyle(1, ROBED)
    this.barrel.setSize(22, 4)
    this.barrel.setPosition(13, 0)

    // Wand tip orb
    const wand_orb = scene.add.arc(24, 0, 4, 0, 360, false, 0xCC88FF)
    wand_orb.setStrokeStyle(1, GOLD)
    this.barrelPivot.add(wand_orb)
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
      color: 0xCC88FF,
    })

    if (this.firesFireball) {
      const proj = this.projectileManager.launch({
        x: this.x, y: this.y,
        targetX: target.x, targetY: target.y,
        speed: this.effectiveProjectileSpeed * 0.7,
        radius: 9, damage: this.effectiveDamage + 1, pierce: 1,
        damageType: DamageType.Fire, color: 0xFF6600,
      })
      if (proj) {
        const origUpdate = proj.update.bind(proj)
        const pm = this.projectileManager
        const dmg = this.effectiveDamage + 1
        let detonated = false
        proj.update = (delta: number, bloons: Bloon[], t: number) => {
          if (!proj.active) return
          const dist = Phaser.Math.Distance.Between(proj.x, proj.y, target.x, target.y)
          if (dist < 12 && !detonated) {
            detonated = true
            pm.detonateAoE(proj.x, proj.y, 30, dmg, DamageType.Fire, bloons, t)
            proj.deactivate()
          } else if (!detonated) origUpdate(delta, bloons, t)
        }
      }
    }
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'fireball') this.firesFireball = true
  }
}
