import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class Alchemist extends BaseTower {
  private splashRadius: number = 25

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('alchemist')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const GLASS  = 0xFF6347
    const GLASSL = 0xFF9977
    const DARK   = 0x881A0A
    const LIQUID = 0xFF4422
    const BUBBLE = 0xFF8866
    const CORK   = 0xC89040

    // Flask round bottom
    g.fillStyle(GLASS)
    g.fillCircle(0, 8, 14)
    g.lineStyle(2, DARK)
    g.strokeCircle(0, 8, 14)

    // Glass shine on flask
    g.fillStyle(GLASSL, 0.45)
    g.fillEllipse(-4, 3, 8, 12)
    g.fillStyle(0xFFCCBB, 0.3)
    g.fillEllipse(-5, 2, 4, 7)

    // Liquid bubbles in flask
    g.fillStyle(BUBBLE, 0.6)
    g.fillCircle(-5, 10, 3)
    g.fillCircle(4, 14, 2)
    g.fillCircle(-2, 16, 2.5)
    g.fillCircle(6, 8, 2)

    // Flask neck
    g.fillStyle(GLASS)
    g.fillRect(-4, -6, 8, 16)
    g.lineStyle(1.5, DARK)
    g.lineBetween(-4, -6, -4, 10)
    g.lineBetween(4, -6, 4, 10)

    // Cork stopper
    g.fillStyle(CORK)
    g.fillRoundedRect(-5, -12, 10, 8, 2)
    g.lineStyle(1.5, 0x7A5820)
    g.strokeRoundedRect(-5, -12, 10, 8, 2)
    // Cork rings
    g.lineStyle(1, 0x7A5820)
    g.lineBetween(-5, -8, 5, -8)
    g.lineBetween(-5, -6, 5, -6)

    // Bubbles popping out of neck
    g.fillStyle(BUBBLE, 0.7)
    g.fillCircle(-8, -14, 3)
    g.fillCircle(4, -16, 2)
    g.fillCircle(-2, -18, 2.5)

    // Barrel: throwing arm (ladle)
    this.barrel.setFillStyle(0x8B3010)
    this.barrel.setStrokeStyle(1.5, DARK)
    this.barrel.setSize(16, 5)
    this.barrel.setPosition(11, 0)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const proj = this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: target.x, targetY: target.y,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage, pierce: 1,
      damageType: this.effectiveDamageType,
      color: 0xFF8866,
    })

    if (proj) {
      const origUpdate = proj.update.bind(proj)
      const pm = this.projectileManager
      const splashR = this.splashRadius
      const dmg = this.effectiveDamage
      const dtype = this.effectiveDamageType
      let detonated = false
      proj.update = (delta: number, bloons: Bloon[], t: number) => {
        if (!proj.active) return
        const dist = Phaser.Math.Distance.Between(proj.x, proj.y, target.x, target.y)
        if (dist < 12 && !detonated) {
          detonated = true
          pm.detonateAoE(proj.x, proj.y, splashR, dmg, dtype, bloons, t)
          proj.deactivate()
        } else if (!detonated) origUpdate(delta, bloons, t)
      }
    }
  }

  protected showAttackAnimation(): void {
    const angle = this.barrelPivot.rotation
    const flask = this.scene.add.arc(
      this.x + Math.cos(angle) * 22,
      this.y + Math.sin(angle) * 22,
      7, 0, 360, false, 0xFF6347, 0.85
    )
    flask.setDepth(28)
    this.scene.tweens.add({
      targets: flask,
      scaleX: 1.5, scaleY: 1.5, alpha: 0,
      duration: 120, ease: 'Power2Out',
      onComplete: () => flask.destroy(),
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'bigger_potions') this.splashRadius += 10
  }
}
