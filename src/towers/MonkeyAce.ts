import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class MonkeyAce extends BaseTower {
  private orbitAngle: number = 0
  private burstCount: number = 1

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('monkey_ace')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const FUSELAGE = 0xC0C0C0
    const DARK     = 0x606060
    const WING     = 0xA8A8A8
    const COCKPIT  = 0x4488CC
    const PROP     = 0x888888

    // Tail fin (vertical)
    g.fillStyle(WING)
    g.fillTriangle(0, 16, -5, 6, 5, 6)
    g.lineStyle(1, DARK)
    g.strokeTriangle(0, 16, -5, 6, 5, 6)

    // Main wings (horizontal, largest)
    g.fillStyle(WING)
    g.fillTriangle(-20, 2, 20, 2, 0, -2)
    g.lineStyle(1, DARK)
    g.strokeTriangle(-20, 2, 20, 2, 0, -2)
    // Wing tips
    g.fillStyle(DARK)
    g.fillCircle(-20, 2, 2)
    g.fillCircle(20, 2, 2)

    // Fuselage body
    g.fillStyle(FUSELAGE)
    g.fillEllipse(0, 0, 12, 36)
    g.lineStyle(1.5, DARK)
    g.strokeEllipse(0, 0, 12, 36)

    // Fuselage panel lines
    g.lineStyle(1, DARK, 0.5)
    g.lineBetween(0, -18, 0, 18)
    g.lineBetween(-5, -8, 5, -8)
    g.lineBetween(-5, 4, 5, 4)

    // Cockpit canopy
    g.fillStyle(COCKPIT)
    g.fillEllipse(0, -8, 8, 10)
    g.fillStyle(0xAADDFF, 0.4)
    g.fillEllipse(-1, -9, 4, 6)

    // Propeller hub
    g.fillStyle(DARK)
    g.fillCircle(0, -18, 3)

    // Propeller blades (as thin rects via lines for now)
    g.lineStyle(4, PROP)
    g.lineBetween(-10, -18, 10, -18)
    g.lineStyle(3, DARK, 0.5)
    g.lineBetween(-10, -18, 10, -18)

    // Barrel: nose gun
    this.barrel.setFillStyle(DARK)
    this.barrel.setStrokeStyle(1, 0x333333)
    this.barrel.setSize(14, 4)
    this.barrel.setPosition(10, 0)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const spread = Math.PI * 2 / (this.burstCount * 2 + 1)
    for (let i = 0; i < this.burstCount; i++) {
      const angle = this.orbitAngle + (i - Math.floor(this.burstCount / 2)) * spread
      this.projectileManager.launch({
        x: this.x, y: this.y,
        targetX: this.x + Math.cos(angle) * 600,
        targetY: this.y + Math.sin(angle) * 600,
        speed: this.effectiveProjectileSpeed,
        radius: this.config.projectileRadius,
        damage: this.effectiveDamage,
        pierce: this.effectivePierce,
        damageType: this.effectiveDamageType,
        color: 0xDDDDDD,
      })
    }
    this.orbitAngle += 0.4
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.extraProjectiles) this.burstCount += effect.extraProjectiles
  }
}
