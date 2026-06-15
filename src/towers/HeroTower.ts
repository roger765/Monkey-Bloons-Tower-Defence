import Phaser from 'phaser'
import { TowerConfig, UpgradeEffect } from '../types'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'

export class HeroTower extends BaseTower {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: TowerConfig,
    bloonManager: BloonManager,
    projectileManager: ProjectileManager,
  ) {
    super(scene, x, y, config, bloonManager, projectileManager)

    // Heroes always cost a fixed $1000 — override the difficulty-scaled totalSpent
    this.totalSpent = config.cost

    // Upgrade body to show as a hero: gold ring, slightly larger
    this.body.setRadius(24)
    this.body.setStrokeStyle(3, 0xFFD700)

    // Gold barrel
    this.barrel.setFillStyle(0xFFD700)
    this.barrel.setStrokeStyle(1.5, 0xAA8800)

    this.drawCrown()
  }

  private drawCrown(): void {
    const g = this.customGfx
    g.clear()
    const GOLD = 0xFFD700

    // Three crown teeth and a base drawn around the body centre
    g.fillStyle(GOLD)
    g.fillRect(-12, 1, 24, 7)    // crown base band
    g.fillRect(-10, -9, 6, 11)   // left tooth
    g.fillRect(-3, -13, 6, 15)   // centre tooth (tallest)
    g.fillRect(4, -9, 6, 11)     // right tooth

    // Small gem dots on each tooth tip
    g.fillStyle(0xFFFFFF, 0.9)
    g.fillCircle(-7, -10, 2)
    g.fillCircle(0, -14, 2)
    g.fillCircle(7, -10, 2)
  }

  attack(target: Bloon, _allBloons: Bloon[], _time: number): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.projectileManager.launch({
      x: this.x,
      y: this.y,
      targetX: this.x + Math.cos(angle) * 600,
      targetY: this.y + Math.sin(angle) * 600,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: this.config.color,
      shape: 'dart',
    })
  }

  protected applyUpgradeEffect(_effect: UpgradeEffect, _path: 0 | 1 | 2): void {
    // Heroes do not use upgrade paths
  }

  canUpgradePath(_path: 0 | 1 | 2): boolean {
    return false
  }

  tryUpgrade(_path: 0 | 1 | 2): boolean {
    return false
  }
}
