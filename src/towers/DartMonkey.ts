import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class DartMonkey extends BaseTower {
  private isTripleShot: boolean = false

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('dart_monkey')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const HEAD = 0xC8922A
    const SKIN = 0xE8B050
    const DARK = 0x5C3A0A

    // Ears (behind head — drawn first)
    g.fillStyle(SKIN)
    g.fillCircle(-17, 2, 6)
    g.fillCircle(17, 2, 6)
    g.fillStyle(0xD4854A)
    g.fillCircle(-17, 2, 3)
    g.fillCircle(17, 2, 3)

    // Head
    g.fillStyle(HEAD)
    g.fillCircle(0, 0, 16)
    g.lineStyle(2, DARK)
    g.strokeCircle(0, 0, 16)

    // Face muzzle
    g.fillStyle(SKIN)
    g.fillEllipse(0, 5, 14, 10)

    // Eyes
    g.fillStyle(0x1A0A00)
    g.fillCircle(-5, -2, 3)
    g.fillCircle(5, -2, 3)
    g.fillStyle(0xFFFFFF)
    g.fillCircle(-4, -3, 1.2)
    g.fillCircle(6, -3, 1.2)

    // Barrel: style as arm/dart
    this.barrel.setFillStyle(0xC8922A)
    this.barrel.setStrokeStyle(1.5, DARK)
    this.barrel.setSize(16, 6)
    this.barrel.setPosition(11, 0)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.fireDart(angle)
    if (this.isTripleShot) {
      this.fireDart(angle - 0.2)
      this.fireDart(angle + 0.2)
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
      color: 0xCCCC00,
      shape: 'dart',
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'triple_shot') this.isTripleShot = true
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let head: number, skin: number, dark: number, barrelCol: number

    if (t1 >= 4) {
      // Ultra-Juggernaut — charcoal steel, battle-worn
      head = 0x333333; skin = 0x555555; dark = 0x111111; barrelCol = 0x222222
    } else if (t1 >= 3) {
      // Juggernaut — dark steel grey
      head = 0x4A4A4A; skin = 0x666666; dark = 0x222222; barrelCol = 0x333333
    } else if (t1 >= 2) {
      // Spike-o-pult — warm gunmetal with orange tint
      head = 0x6A4A2A; skin = 0x8A6A3A; dark = 0x3A2A0A; barrelCol = 0x5A3A1A
    } else if (t2 >= 2) {
      // Triple Shot / higher path 2 — bright orange-brown, energetic
      head = 0xD89030; skin = 0xF0B050; dark = 0x6C4010; barrelCol = 0xD89030
    } else if (t3 >= 1) {
      // Long range / enhanced eyesight — slightly greener tint (goggle look)
      head = 0xA87830; skin = 0xC89848; dark = 0x5C3A0A; barrelCol = 0x889855
    } else {
      // Default brown monkey
      head = 0xC8922A; skin = 0xE8B050; dark = 0x5C3A0A; barrelCol = 0xC8922A
    }

    const g = this.customGfx
    g.clear()

    // Ears
    g.fillStyle(skin)
    g.fillCircle(-17, 2, 6)
    g.fillCircle(17, 2, 6)
    g.fillStyle(this.darkenHex(skin, 0.15))
    g.fillCircle(-17, 2, 3)
    g.fillCircle(17, 2, 3)

    // Head
    g.fillStyle(head)
    g.fillCircle(0, 0, 16)
    g.lineStyle(2, dark)
    g.strokeCircle(0, 0, 16)

    // Muzzle
    g.fillStyle(skin)
    g.fillEllipse(0, 5, 14, 10)

    // Eyes — glow red for juggernaut+
    const eyeCol = t1 >= 3 ? 0xFF2200 : 0x1A0A00
    const pupilCol = t1 >= 3 ? 0xFF6644 : 0xFFFFFF
    g.fillStyle(eyeCol)
    g.fillCircle(-5, -2, 3)
    g.fillCircle(5, -2, 3)
    g.fillStyle(pupilCol)
    g.fillCircle(-4, -3, 1.2)
    g.fillCircle(6, -3, 1.2)

    // Armour plate for juggernaut tiers
    if (t1 >= 3) {
      g.fillStyle(0x555555, 0.7)
      g.fillRect(-10, -8, 20, 6)
      g.lineStyle(1, 0x222222)
      g.strokeRect(-10, -8, 20, 6)
    }

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1.5, dark)
    this.barrel.setSize(16, 6)
    this.barrel.setPosition(11, 0)
  }
}
