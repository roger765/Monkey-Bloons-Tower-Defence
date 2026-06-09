import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class MonkeyBuccaneer extends BaseTower {
  private extraShots: number = 0

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('monkey_buccaneer')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const WOOD  = 0x8B4513
    const WOODL = 0xC07040
    const WOODD = 0x4A1E08
    const SAIL  = 0xF0EAD0
    const ROPE  = 0x8B6040
    const RED   = 0xCC2020

    // Ship hull — rounded bottom
    const hull = [
      { x: -18, y:  6 },
      { x: -20, y:  2 },
      { x: -18, y: -4 },
      { x:  18, y: -4 },
      { x:  20, y:  2 },
      { x:  18, y:  6 },
    ]
    g.fillStyle(WOOD)
    g.fillPoints(hull, true)
    g.lineStyle(2, WOODD)
    g.strokePoints(hull, true)

    // Deck planks
    g.lineStyle(1, WOODD, 0.6)
    for (let px = -14; px <= 14; px += 7) {
      g.lineBetween(px, -4, px, 6)
    }

    // Hull stripe
    g.fillStyle(RED)
    g.fillRect(-20, 0, 40, 3)

    // Waterline
    g.lineStyle(1.5, WOODL)
    g.lineBetween(-20, 4, 20, 4)

    // Main mast
    g.lineStyle(3, WOODD)
    g.lineBetween(0, -4, 0, -22)

    // Crow's nest
    g.fillStyle(WOODD)
    g.fillRect(-3, -22, 6, 4)

    // Sail
    g.fillStyle(SAIL)
    g.fillTriangle(-10, -6, 10, -6, 0, -20)
    g.lineStyle(1, ROPE)
    g.strokeTriangle(-10, -6, 10, -6, 0, -20)

    // Pirate flag
    g.fillStyle(0x111111)
    g.fillRect(0, -26, 8, 5)
    g.fillStyle(0xFFFFFF)
    g.fillCircle(4, -24, 1.5)
    g.lineBetween(2, -22, 6, -22)

    // Cannon barrel
    this.barrel.setFillStyle(WOODD)
    this.barrel.setStrokeStyle(1.5, 0x1A0A00)
    this.barrel.setSize(16, 8)
    this.barrel.setPosition(11, 0)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.fireDart(angle)
    for (let i = 0; i < this.extraShots; i++) {
      const spread = (i + 1) * 0.15
      this.fireDart(angle + spread)
      this.fireDart(angle - spread)
    }
  }

  private fireDart(angle: number): void {
    this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: this.x + Math.cos(angle) * 500,
      targetY: this.y + Math.sin(angle) * 500,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0xCC8844,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.extraProjectiles) this.extraShots += Math.floor(effect.extraProjectiles / 2)
  }
}
