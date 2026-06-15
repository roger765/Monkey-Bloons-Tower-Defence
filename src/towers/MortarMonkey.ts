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

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let base: number, dark: number, metal: number, light: number, sand: number

    if (t1 >= 3) {
      // Artillery Battery / Pop & Awe — deep military olive
      base = 0x2A3A10; dark = 0x101808; metal = 0x1E2818; light = 0x4A5A28; sand = 0xA89858
    } else if (t1 >= 1) {
      // Bigger Blast / Frags — standard dark military
      base = 0x3A4A18; dark = 0x1A2208; metal = 0x282E10; light = 0x5A6A30; sand = 0xB8A060
    } else if (t2 >= 3) {
      // The Big One / Total Destruction — near-black iron
      base = 0x1A1A10; dark = 0x080808; metal = 0x101008; light = 0x302820; sand = 0x888060
    } else if (t2 >= 1) {
      // Faster Reload / Rapid — slightly darker
      base = 0x404828; dark = 0x202410; metal = 0x303018; light = 0x606840; sand = 0xC0A868
    } else if (t3 >= 2) {
      // Burny Stuff / Fire shells — warm orange-tinted
      base = 0x5A4020; dark = 0x2A1808; metal = 0x402810; light = 0x7A6030; sand = 0xDDA870
    } else if (t3 >= 1) {
      // Extended Range — slightly greener
      base = 0x4A5A24; dark = 0x222A10; metal = 0x363C14; light = 0x6A7A40; sand = 0xC8A860
    } else {
      base = 0x4A5C24; dark = 0x2A3010; metal = 0x383828; light = 0x6A7C44; sand = 0xC8A860
    }

    const g = this.customGfx
    g.clear()

    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      const bx = Math.cos(a) * 14
      const by = Math.sin(a) * 14
      g.fillStyle(sand)
      g.fillEllipse(bx, by, 12, 8)
      g.lineStyle(1, dark)
      g.strokeEllipse(bx, by, 12, 8)
      g.lineStyle(1, dark, 0.4)
      g.lineBetween(bx - 2, by, bx + 2, by)
    }

    g.fillStyle(base)
    g.fillCircle(0, 4, 11)
    g.lineStyle(2, dark)
    g.strokeCircle(0, 4, 11)

    g.lineStyle(3, metal)
    g.lineBetween(-6, 10, -10, 2)
    g.lineBetween(6, 10, 10, 2)
    g.lineStyle(1.5, dark)
    g.lineBetween(-6, 10, -10, 2)
    g.lineBetween(6, 10, 10, 2)

    g.fillStyle(metal)
    const tubeAngle = -Math.PI * 0.65
    const tx = Math.cos(tubeAngle)
    const ty = Math.sin(tubeAngle)
    const hw = 5, hl = 16
    const nx = -ty, ny = tx
    const tube = [
      { x: -nx * hw,             y: -ny * hw             },
      { x:  nx * hw,             y:  ny * hw             },
      { x:  nx * hw + tx * hl,   y:  ny * hw + ty * hl   },
      { x: -nx * hw + tx * hl,   y: -ny * hw + ty * hl   },
    ]
    g.fillPoints(tube, true)
    g.lineStyle(2, dark)
    g.strokePoints(tube, true)

    g.fillStyle(dark)
    g.fillCircle(tx * hl, ty * hl, 5)

    g.fillStyle(light)
    g.fillCircle(tx * 8, ty * 8, 3)

    // Fire glow for path 3 fire upgrades
    if (t3 >= 2) {
      g.lineStyle(2, 0xFF4400, 0.5)
      g.strokeCircle(tx * hl, ty * hl, 7)
    }
  }
}
