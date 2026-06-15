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

  getAlchemistBuffs(): { speedMultiplier: number; damageBonus: number; pierceBonus: number } {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    // Slightly weaker than MonkeyVillage equivalents
    const speedMults  = [1.0, 0.97, 0.90, 0.85, 0.80, 0.70]
    const damageBonuses = [0, 0, 1, 1, 2, 4]
    const pierceBonuses = [0, 1, 1, 2, 4, 6]

    return {
      speedMultiplier: speedMults[t1] ?? 1.0,
      damageBonus:     damageBonuses[t2] ?? 0,
      pierceBonus:     pierceBonuses[t3] ?? 0,
    }
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

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let glass: number, glassl: number, dark: number, liquid: number, bubble: number, cork: number, barrelCol: number

    if (t1 >= 3) {
      // Permanent Brew / Transfusion — golden potion
      glass = 0xDDAA00; glassl = 0xFFDD44; dark = 0x664400; liquid = 0xFF8800; bubble = 0xFFCC44; cork = 0xAA8830; barrelCol = 0x884400
    } else if (t1 >= 1) {
      // Acidic Dip / Stimulant — bright yellow-green
      glass = 0x88BB00; glassl = 0xBBDD44; dark = 0x3A5000; liquid = 0xAADD00; bubble = 0xCCEE44; cork = 0x7A9020; barrelCol = 0x4A6000
    } else if (t2 >= 3) {
      // Rubber to Gold / Transformation — deep purple
      glass = 0x8822CC; glassl = 0xBB66FF; dark = 0x3A0870; liquid = 0xAA44EE; bubble = 0xCC88FF; cork = 0x6618A0; barrelCol = 0x5A1088
    } else if (t2 >= 1) {
      // Perishing Potions — green-blue acid
      glass = 0x228888; glassl = 0x44BBBB; dark = 0x0A3838; liquid = 0x44AAAA; bubble = 0x66CCCC; cork = 0x1A7070; barrelCol = 0x105050
    } else if (t3 >= 3) {
      // Berserk Brew — dark deep red
      glass = 0xAA2222; glassl = 0xDD6644; dark = 0x4A0808; liquid = 0xCC3322; bubble = 0xFF8866; cork = 0x882020; barrelCol = 0x661010
    } else if (t3 >= 1) {
      // Bigger Potions / Stronger Acid — brighter orange-red
      glass = 0xFF7060; glassl = 0xFFAA88; dark = 0x881A0A; liquid = 0xFF6644; bubble = 0xFFAA88; cork = 0xCC8040; barrelCol = 0x8B3010
    } else {
      glass = 0xFF6347; glassl = 0xFF9977; dark = 0x881A0A; liquid = 0xFF4422; bubble = 0xFF8866; cork = 0xC89040; barrelCol = 0x8B3010
    }

    const g = this.customGfx
    g.clear()

    g.fillStyle(glass)
    g.fillCircle(0, 8, 14)
    g.lineStyle(2, dark)
    g.strokeCircle(0, 8, 14)

    g.fillStyle(glassl, 0.45)
    g.fillEllipse(-4, 3, 8, 12)
    g.fillStyle(0xFFCCBB, 0.3)
    g.fillEllipse(-5, 2, 4, 7)

    g.fillStyle(bubble, 0.6)
    g.fillCircle(-5, 10, 3)
    g.fillCircle(4, 14, 2)
    g.fillCircle(-2, 16, 2.5)
    g.fillCircle(6, 8, 2)

    g.fillStyle(glass)
    g.fillRect(-4, -6, 8, 16)
    g.lineStyle(1.5, dark)
    g.lineBetween(-4, -6, -4, 10)
    g.lineBetween(4, -6, 4, 10)

    g.fillStyle(cork)
    g.fillRoundedRect(-5, -12, 10, 8, 2)
    g.lineStyle(1.5, this.darkenHex(cork, 0.3))
    g.strokeRoundedRect(-5, -12, 10, 8, 2)
    g.lineStyle(1, this.darkenHex(cork, 0.3))
    g.lineBetween(-5, -8, 5, -8)
    g.lineBetween(-5, -6, 5, -6)

    g.fillStyle(bubble, 0.7)
    g.fillCircle(-8, -14, 3)
    g.fillCircle(4, -16, 2)
    g.fillCircle(-2, -18, 2.5)

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1.5, dark)
    this.barrel.setSize(16, 5)
    this.barrel.setPosition(11, 0)
  }
}
