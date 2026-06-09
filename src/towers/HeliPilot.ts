import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class HeliPilot extends BaseTower {
  private extraShots: number = 0
  private rotorAngle: number = 0

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('heli_pilot')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const BODY  = 0x708090
    const DARK  = 0x303848
    const GLASS = 0x88BBDD
    const METAL = 0x505A68
    const RED   = 0xDD2222

    // Tail boom (extends right)
    g.fillStyle(METAL)
    g.fillRect(8, -3, 18, 6)
    // Tail rotor hub
    g.fillStyle(DARK)
    g.fillCircle(26, 0, 3)

    // Tail vertical fin
    g.fillStyle(METAL)
    g.fillTriangle(18, -3, 24, -3, 22, -10)
    g.lineStyle(1, DARK)
    g.strokeTriangle(18, -3, 24, -3, 22, -10)

    // Landing skids
    g.lineStyle(2.5, DARK)
    g.lineBetween(-12, 12, 10, 12)
    g.lineBetween(-8, 6, -8, 12)
    g.lineBetween(6, 6, 6, 12)

    // Main body cabin (rounded rect)
    g.fillStyle(BODY)
    g.fillRoundedRect(-14, -8, 24, 16, 6)
    g.lineStyle(2, DARK)
    g.strokeRoundedRect(-14, -8, 24, 16, 6)

    // Cockpit glass bubble
    g.fillStyle(GLASS)
    g.fillEllipse(-4, -2, 16, 14)
    g.lineStyle(1.5, DARK)
    g.strokeEllipse(-4, -2, 16, 14)
    g.fillStyle(0xCCEEFF, 0.5)
    g.fillEllipse(-6, -4, 8, 7)

    // Side panel detail
    g.lineStyle(1, DARK, 0.5)
    g.lineBetween(4, -6, 8, -6)
    g.lineBetween(4, 0, 8, 0)
    g.lineBetween(4, 6, 8, 6)

    // Warning light
    g.fillStyle(RED)
    g.fillCircle(-10, -7, 2)

    // Rotor mast
    g.fillStyle(DARK)
    g.fillRect(-2, -14, 4, 8)

    // Static rotor blades (two crossed lines; would spin in a full game)
    g.lineStyle(4, METAL)
    g.lineBetween(-20, -10, 20, -10)
    g.lineStyle(4, METAL)
    g.lineBetween(0, -20, 0, 0)
    // Rotor hub
    g.fillStyle(DARK)
    g.fillCircle(0, -10, 4)

    // Chin gun barrel
    this.barrel.setFillStyle(DARK)
    this.barrel.setStrokeStyle(1, 0x1A1E24)
    this.barrel.setSize(14, 5)
    this.barrel.setPosition(10, 0)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.fireDart(angle)
    for (let i = 1; i <= this.extraShots; i++) {
      this.fireDart(angle + i * 0.2)
      this.fireDart(angle - i * 0.2)
    }
  }

  private fireDart(angle: number): void {
    this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: this.x + Math.cos(angle) * 600,
      targetY: this.y + Math.sin(angle) * 600,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0xAABBCC,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.extraProjectiles) this.extraShots += Math.floor(effect.extraProjectiles / 2)
  }
}
