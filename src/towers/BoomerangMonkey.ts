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

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let head: number, skin: number, dark: number, boom: number, barrelCol: number

    if (t1 >= 4) {
      // Glaive Lord — mirror-chrome silver with dark outlines
      head = 0x9090A0; skin = 0xB8B8C8; dark = 0x303040; boom = 0xD0D8E8; barrelCol = 0x8888A0
    } else if (t1 >= 2) {
      // Glaives / Ricochet — steel silver
      head = 0x787888; skin = 0x989898; dark = 0x383840; boom = 0xBBBBCC; barrelCol = 0x707080
    } else if (t2 >= 3) {
      // Bionic Boomerang / Turbo — electric blue
      head = 0x2244AA; skin = 0x4488DD; dark = 0x112266; boom = 0x66AAFF; barrelCol = 0x3366CC
    } else if (t2 >= 1) {
      // Faster Throwing — blue-tinted
      head = 0x4A6A8A; skin = 0x6A8AAA; dark = 0x1A3050; boom = 0x88AACC; barrelCol = 0x3A5A7A
    } else if (t3 >= 2) {
      // Red Hot Rangs — fire orange-red
      head = 0x8A3010; skin = 0xAA5028; dark = 0x3A0A00; boom = 0xFF5500; barrelCol = 0x882200
    } else if (t3 >= 1) {
      // Long Range — slightly warmer
      head = 0x8A6440; skin = 0xAA8450; dark = 0x3C2008; boom = 0xDD9020; barrelCol = 0x7A5020
    } else {
      head = 0x7A5430; skin = 0xA07040; dark = 0x3C1A08; boom = 0xC87820; barrelCol = head
    }

    const g = this.customGfx
    g.clear()

    g.fillStyle(skin)
    g.fillCircle(-17, 2, 6)
    g.fillCircle(17, 2, 6)
    g.fillStyle(this.darkenHex(skin, 0.2))
    g.fillCircle(-17, 2, 3)
    g.fillCircle(17, 2, 3)

    g.fillStyle(head)
    g.fillCircle(0, 0, 16)
    g.lineStyle(2, dark)
    g.strokeCircle(0, 0, 16)

    g.fillStyle(skin)
    g.fillEllipse(0, 5, 14, 10)

    const eyeCol = t2 >= 3 ? 0x44AAFF : 0x1A0800
    g.fillStyle(eyeCol)
    g.fillCircle(-5, -2, 3)
    g.fillCircle(5, -2, 3)
    g.fillStyle(0xFFFFFF)
    g.fillCircle(-4, -3, 1.2)
    g.fillCircle(6, -3, 1.2)

    g.lineStyle(3, boom)
    g.beginPath()
    g.arc(-4, -18, 8, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340))
    g.strokePath()
    g.lineStyle(2, this.darkenHex(boom, 0.3))
    g.beginPath()
    g.arc(-4, -18, 5, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340))
    g.strokePath()

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1.5, dark)
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
      shape: 'boomerang',
      isBoomerang: true,
      originX: this.x,
      originY: this.y,
    })
  }
}
