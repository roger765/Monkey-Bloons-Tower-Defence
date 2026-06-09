import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class BoomerangMonkey extends BaseTower {
  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('boomerang_monkey')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const HEAD = 0x7A5430
    const SKIN = 0xA07040
    const DARK = 0x3C1A08
    const BOOM = 0xC87820

    // Ears
    g.fillStyle(SKIN)
    g.fillCircle(-17, 2, 6)
    g.fillCircle(17, 2, 6)
    g.fillStyle(0x8B5E30)
    g.fillCircle(-17, 2, 3)
    g.fillCircle(17, 2, 3)

    // Head
    g.fillStyle(HEAD)
    g.fillCircle(0, 0, 16)
    g.lineStyle(2, DARK)
    g.strokeCircle(0, 0, 16)

    // Muzzle
    g.fillStyle(SKIN)
    g.fillEllipse(0, 5, 14, 10)

    // Eyes
    g.fillStyle(0x1A0800)
    g.fillCircle(-5, -2, 3)
    g.fillCircle(5, -2, 3)
    g.fillStyle(0xFFFFFF)
    g.fillCircle(-4, -3, 1.2)
    g.fillCircle(6, -3, 1.2)

    // Boomerang floating above head
    g.lineStyle(3, BOOM)
    g.beginPath()
    g.arc(-4, -18, 8, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340))
    g.strokePath()
    g.lineStyle(2, 0x8B5A10)
    g.beginPath()
    g.arc(-4, -18, 5, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340))
    g.strokePath()

    // Barrel styled as throwing arm
    this.barrel.setFillStyle(HEAD)
    this.barrel.setStrokeStyle(1.5, DARK)
    this.barrel.setSize(14, 7)
    this.barrel.setPosition(11, 0)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    const perpAngle = angle + Math.PI / 4
    this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: this.x + Math.cos(perpAngle) * 200,
      targetY: this.y + Math.sin(perpAngle) * 200,
      speed: this.effectiveProjectileSpeed,
      radius: 8,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0x8B4513,
      isBoomerang: true,
      originX: this.x,
      originY: this.y,
    })
  }
}
