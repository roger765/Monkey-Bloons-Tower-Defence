import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class SniperMonkey extends BaseTower {
  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('sniper_monkey')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const BAG  = 0x7A6840
    const BAGD = 0x4A3818
    const SAND = 0xC8A860
    const DARK = 0x2A1808

    // Sandbag fortification — four stacked bags in a ring
    const bags = [
      { x: 0,   y: -14, rx: 14, ry: 5 },
      { x: -13, y:  -2, rx:  5, ry: 12 },
      { x:  13, y:  -2, rx:  5, ry: 12 },
      { x: 0,   y:  12, rx: 14, ry: 5 },
    ]
    for (const b of bags) {
      g.fillStyle(SAND)
      g.fillEllipse(b.x, b.y, b.rx * 2, b.ry * 2)
      g.fillStyle(BAG)
      g.fillEllipse(b.x, b.y, b.rx * 2 - 3, b.ry * 2 - 3)
      g.lineStyle(1.5, BAGD)
      g.strokeEllipse(b.x, b.y, b.rx * 2, b.ry * 2)
      // Bag tie marks
      g.lineStyle(1, DARK)
      g.lineBetween(b.x - 2, b.y, b.x + 2, b.y)
    }

    // Dark recessed center (firing position)
    g.fillStyle(DARK, 0.7)
    g.fillCircle(0, 0, 7)

    // Rifle barrel — long and thin
    this.barrel.setFillStyle(0x252525)
    this.barrel.setStrokeStyle(1, 0x111111)
    this.barrel.setSize(28, 4)
    this.barrel.setPosition(16, 0)

    // Scope on barrel
    const scope = scene.add.rectangle(8, -5, 10, 4, 0x303030)
    scope.setStrokeStyle(1, 0x111111)
    this.barrelPivot.add(scope)
    const scopeLens = scene.add.arc(13, -5, 2, 0, 360, false, 0x4466AA)
    this.barrelPivot.add(scopeLens)
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
      color: 0xFFFF88,
      shape: 'bullet',
    })
  }

  protected showAttackAnimation(): void {
    const angle = this.barrelPivot.rotation
    const flash = this.scene.add.arc(
      this.x + Math.cos(angle) * 30,
      this.y + Math.sin(angle) * 30,
      3, 0, 360, false, 0xFFFFAA, 0.95
    )
    flash.setDepth(30)
    this.scene.tweens.add({
      targets: flash,
      scaleX: 3, scaleY: 1.2, alpha: 0,
      duration: 80, ease: 'Power3Out',
      onComplete: () => flash.destroy(),
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let bag: number, bagd: number, sand: number, dark: number, barrelCol: number

    if (t1 >= 3) {
      // Maim/Cripple MOAB — dark military camo
      bag = 0x4A4830; bagd = 0x242210; sand = 0x7A7850; dark = 0x101008; barrelCol = 0x181810
    } else if (t1 >= 1) {
      // Full Metal Jacket / Large Calibre — medium military
      bag = 0x606040; bagd = 0x303020; sand = 0xA0A060; dark = 0x181810; barrelCol = 0x202018
    } else if (t2 >= 3) {
      // Bouncing Bullet / Elite Sniper — dark olive night-ops
      bag = 0x2A4020; bagd = 0x102010; sand = 0x5A7840; dark = 0x081008; barrelCol = 0x101808
    } else if (t2 >= 1) {
      // Night Vision — dark green
      bag = 0x3A5030; bagd = 0x1A2818; sand = 0x6A8050; dark = 0x0A1808; barrelCol = 0x181A10
    } else if (t3 >= 3) {
      // Semi-Auto / Full Auto — lighter warm tan
      bag = 0x907850; bagd = 0x584830; sand = 0xD8B870; dark = 0x281808; barrelCol = 0x303020
    } else if (t3 >= 1) {
      // Fast Firing — slightly lighter
      bag = 0x8A7448; bagd = 0x503820; sand = 0xC8A860; dark = 0x281808; barrelCol = 0x282818
    } else {
      bag = 0x7A6840; bagd = 0x4A3818; sand = 0xC8A860; dark = 0x2A1808; barrelCol = 0x252525
    }

    const g = this.customGfx
    g.clear()

    const bags = [
      { x: 0,   y: -14, rx: 14, ry: 5 },
      { x: -13, y:  -2, rx:  5, ry: 12 },
      { x:  13, y:  -2, rx:  5, ry: 12 },
      { x: 0,   y:  12, rx: 14, ry: 5 },
    ]
    for (const b of bags) {
      g.fillStyle(sand)
      g.fillEllipse(b.x, b.y, b.rx * 2, b.ry * 2)
      g.fillStyle(bag)
      g.fillEllipse(b.x, b.y, b.rx * 2 - 3, b.ry * 2 - 3)
      g.lineStyle(1.5, bagd)
      g.strokeEllipse(b.x, b.y, b.rx * 2, b.ry * 2)
      g.lineStyle(1, dark)
      g.lineBetween(b.x - 2, b.y, b.x + 2, b.y)
    }

    g.fillStyle(dark, 0.7)
    g.fillCircle(0, 0, 7)

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1, this.darkenHex(barrelCol, 0.4))
    this.barrel.setSize(28, 4)
    this.barrel.setPosition(16, 0)
  }
}
