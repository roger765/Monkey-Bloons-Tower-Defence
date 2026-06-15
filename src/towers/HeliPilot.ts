import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class HeliPilot extends BaseTower {
  private extraShots: number = 0
  private rotorAngle: number = 0
  private baseX: number = 0
  private baseY: number = 0
  private flyAngle: number = 0
  private static readonly ORBIT_RADIUS = 160
  private static readonly FLY_SPEED = 0.45 // radians per second

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('heli_pilot')!, bloonManager, projectileManager)
    this.baseX = x
    this.baseY = y

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

  update(delta: number, time: number): void {
    this.flyAngle += HeliPilot.FLY_SPEED * (delta / 1000)
    this.x = this.baseX + Math.cos(this.flyAngle) * HeliPilot.ORBIT_RADIUS
    this.y = this.baseY + Math.sin(this.flyAngle) * HeliPilot.ORBIT_RADIUS
    this.setRotation(this.flyAngle + Math.PI / 2)
    super.update(delta, time)
  }

  protected faceTarget(target: Bloon): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.barrelPivot.setRotation(angle - this.rotation)
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

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let body: number, dark: number, glass: number, metal: number, red: number, barrelCol: number

    if (t1 >= 3) {
      // Apache Dartship / Prime — military olive
      body = 0x4A5C20; dark = 0x222A0C; glass = 0x44AA44; metal = 0x303C14; red = 0xFF4400; barrelCol = 0x202A0A
    } else if (t1 >= 1) {
      // Rapid Fire / More Darts — darker grey-olive
      body = 0x607040; dark = 0x283018; glass = 0x66AA88; metal = 0x405030; red = 0xDD3322; barrelCol = 0x303820
    } else if (t2 >= 3) {
      // Support Chinook — khaki / sand yellow
      body = 0xC8A040; dark = 0x604808; glass = 0x88BBDD; metal = 0x907030; red = 0xFF6600; barrelCol = 0x604808
    } else if (t2 >= 1) {
      // IFR / Bigger Jets — blue-grey
      body = 0x607888; dark = 0x283848; glass = 0xAADDFF; metal = 0x405868; red = 0xFF5500; barrelCol = 0x283848
    } else if (t3 >= 3) {
      // Rocket Storm / Aces High — bright scarlet
      body = 0xCC2222; dark = 0x5A0A0A; glass = 0xFF8888; metal = 0x881818; red = 0xFF4400; barrelCol = 0x440808
    } else if (t3 >= 1) {
      // Quad Darts — slight blue accent
      body = 0x6878A8; dark = 0x303858; glass = 0x99CCFF; metal = 0x484868; red = 0xDD2222; barrelCol = 0x303050
    } else {
      body = 0x708090; dark = 0x303848; glass = 0x88BBDD; metal = 0x505A68; red = 0xDD2222; barrelCol = dark
    }

    const g = this.customGfx
    g.clear()

    g.fillStyle(metal)
    g.fillRect(8, -3, 18, 6)
    g.fillStyle(dark)
    g.fillCircle(26, 0, 3)

    g.fillStyle(metal)
    g.fillTriangle(18, -3, 24, -3, 22, -10)
    g.lineStyle(1, dark)
    g.strokeTriangle(18, -3, 24, -3, 22, -10)

    g.lineStyle(2.5, dark)
    g.lineBetween(-12, 12, 10, 12)
    g.lineBetween(-8, 6, -8, 12)
    g.lineBetween(6, 6, 6, 12)

    g.fillStyle(body)
    g.fillRoundedRect(-14, -8, 24, 16, 6)
    g.lineStyle(2, dark)
    g.strokeRoundedRect(-14, -8, 24, 16, 6)

    g.fillStyle(glass)
    g.fillEllipse(-4, -2, 16, 14)
    g.lineStyle(1.5, dark)
    g.strokeEllipse(-4, -2, 16, 14)
    g.fillStyle(0xCCEEFF, 0.5)
    g.fillEllipse(-6, -4, 8, 7)

    g.lineStyle(1, dark, 0.5)
    g.lineBetween(4, -6, 8, -6)
    g.lineBetween(4, 0, 8, 0)
    g.lineBetween(4, 6, 8, 6)

    g.fillStyle(red)
    g.fillCircle(-10, -7, 2)

    g.fillStyle(dark)
    g.fillRect(-2, -14, 4, 8)

    g.lineStyle(4, metal)
    g.lineBetween(-20, -10, 20, -10)
    g.lineStyle(4, metal)
    g.lineBetween(0, -20, 0, 0)
    g.fillStyle(dark)
    g.fillCircle(0, -10, 4)

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1, dark)
    this.barrel.setSize(14, 5)
    this.barrel.setPosition(10, 0)
  }
}
