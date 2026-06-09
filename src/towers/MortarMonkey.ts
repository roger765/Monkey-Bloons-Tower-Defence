import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class MortarMonkey extends BaseTower {
  private blastRadius: number = 50

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('mortar_monkey')!, bloonManager, projectileManager)

    this.body.setVisible(false)
    this.barrel.setVisible(false)
    this.barrelPivot.setVisible(false)

    const g = this.customGfx
    const BASE  = 0x4A5C24
    const DARK  = 0x2A3010
    const METAL = 0x383828
    const LIGHT = 0x6A7C44
    const SAND  = 0xC8A860

    // Sandbag ring around base
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      const bx = Math.cos(a) * 14
      const by = Math.sin(a) * 14
      g.fillStyle(SAND)
      g.fillEllipse(bx, by, 12, 8)
      g.lineStyle(1, DARK)
      g.strokeEllipse(bx, by, 12, 8)
      g.lineStyle(1, DARK, 0.4)
      g.lineBetween(bx - 2, by, bx + 2, by)
    }

    // Mortar base plate
    g.fillStyle(BASE)
    g.fillCircle(0, 4, 11)
    g.lineStyle(2, DARK)
    g.strokeCircle(0, 4, 11)

    // Bipod legs
    g.lineStyle(3, METAL)
    g.lineBetween(-6, 10, -10, 2)
    g.lineBetween(6, 10, 10, 2)
    g.lineStyle(1.5, DARK)
    g.lineBetween(-6, 10, -10, 2)
    g.lineBetween(6, 10, 10, 2)

    // Mortar tube (angled upward-left for fixed-position look)
    g.fillStyle(METAL)
    const tubeAngle = -Math.PI * 0.65
    const tx = Math.cos(tubeAngle)
    const ty = Math.sin(tubeAngle)
    // Draw tube as a thick line via a rotated rectangle using fillPoints
    const hw = 5, hl = 16
    const nx = -ty, ny = tx  // perpendicular
    const tube = [
      { x: -nx * hw,         y: -ny * hw         },
      { x:  nx * hw,         y:  ny * hw         },
      { x:  nx * hw + tx * hl, y:  ny * hw + ty * hl },
      { x: -nx * hw + tx * hl, y: -ny * hw + ty * hl },
    ]
    g.fillStyle(METAL)
    g.fillPoints(tube, true)
    g.lineStyle(2, DARK)
    g.strokePoints(tube, true)

    // Muzzle opening
    g.fillStyle(DARK)
    g.fillCircle(tx * hl, ty * hl, 5)

    // Elevation adjustment knob
    g.fillStyle(LIGHT)
    g.fillCircle(tx * 8, ty * 8, 3)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const proj = this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: target.x, targetY: target.y,
      speed: this.effectiveProjectileSpeed,
      radius: 8, damage: this.effectiveDamage, pierce: 1,
      damageType: this.effectiveDamageType, color: 0x333333,
    })

    if (proj) {
      const origUpdate = proj.update.bind(proj)
      const blastR = this.blastRadius
      const dmg = this.effectiveDamage
      const dtype = this.effectiveDamageType
      const pm = this.projectileManager
      let detonated = false

      proj.update = (delta: number, bloons: Bloon[], t: number) => {
        if (!proj.active) return
        const dist = Phaser.Math.Distance.Between(proj.x, proj.y, target.x, target.y)
        if (dist < 12 && !detonated) {
          detonated = true
          pm.detonateAoE(proj.x, proj.y, blastR, dmg, dtype, bloons, t)
          proj.deactivate()
        } else if (!detonated) {
          origUpdate(delta, bloons, t)
        }
      }
    }
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'bigger_blast_mortar') this.blastRadius += 15
    if (effect.specialBehavior === 'the_big_one') this.blastRadius += 20
    if (effect.specialBehavior === 'the_biggest_one_mortar') this.blastRadius += 25
  }
}
