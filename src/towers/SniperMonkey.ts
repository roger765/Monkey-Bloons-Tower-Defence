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
}
