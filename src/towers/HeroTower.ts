import Phaser from 'phaser'
import { TowerConfig, UpgradeEffect } from '../types'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { drawHeroCrown, drawHeroIcon } from '../data/heroIcons'

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

    const g = this.customGfx
    g.clear()
    drawHeroIcon(g, config.id, 0, 0)
    drawHeroCrown(g, 0, 0)
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
