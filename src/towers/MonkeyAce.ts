import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class MonkeyAce extends BaseTower {
  private orbitAngle: number = 0
  private burstCount: number = 1
  private baseX: number = 0
  private baseY: number = 0
  private flyAngle: number = 0
  private static readonly ORBIT_RADIUS = 250
  private static readonly FLY_SPEED = 0.55 // radians per second

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('monkey_ace')!, bloonManager, projectileManager)
    this.baseX = x
    this.baseY = y

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

  update(delta: number, time: number): void {
    this.flyAngle += MonkeyAce.FLY_SPEED * (delta / 1000)
    this.x = this.baseX + Math.cos(this.flyAngle) * MonkeyAce.ORBIT_RADIUS
    this.y = this.baseY + Math.sin(this.flyAngle) * MonkeyAce.ORBIT_RADIUS
    this.setRotation(this.flyAngle + Math.PI / 2)
    super.update(delta, time)
  }

  protected faceTarget(target: Bloon): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.barrelPivot.setRotation(angle - this.rotation)
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

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let fuselage: number, dark: number, wing: number, cockpit: number, prop: number, barrelCol: number

    if (t1 >= 3) {
      // Fighter / Sky Shredder — aggressive red + white
      fuselage = 0xEE2222; dark = 0x661111; wing = 0xCC1111; cockpit = 0xFFBB44; prop = 0xAA2222; barrelCol = 0x441111
    } else if (t1 >= 1) {
      // Rapid Fire / Lots More — warm orange-white
      fuselage = 0xDDAA44; dark = 0x885522; wing = 0xCC8830; cockpit = 0x44AAFF; prop = 0x997722; barrelCol = 0x775511
    } else if (t2 >= 3) {
      // Spectre / Ground Zero — flat black stealth
      fuselage = 0x1A1A1A; dark = 0x080808; wing = 0x111111; cockpit = 0xFF4400; prop = 0x282828; barrelCol = 0x101010
    } else if (t2 >= 1) {
      // Fighter Plane / Neva-Miss — dark charcoal
      fuselage = 0x505050; dark = 0x202020; wing = 0x404040; cockpit = 0xFF8800; prop = 0x606060; barrelCol = 0x303030
    } else if (t3 >= 3) {
      // Flying Fortress — military olive
      fuselage = 0x5A7030; dark = 0x2A3818; wing = 0x4A6020; cockpit = 0x88BBDD; prop = 0x3A5010; barrelCol = 0x2A3010
    } else if (t3 >= 1) {
      // Spy Plane / Flyover — grey-olive
      fuselage = 0x8090A0; dark = 0x404858; wing = 0x6A7888; cockpit = 0x6688BB; prop = 0x708090; barrelCol = 0x404858
    } else {
      fuselage = 0xC0C0C0; dark = 0x606060; wing = 0xA8A8A8; cockpit = 0x4488CC; prop = 0x888888; barrelCol = dark
    }

    const g = this.customGfx
    g.clear()

    g.fillStyle(wing)
    g.fillTriangle(0, 16, -5, 6, 5, 6)
    g.lineStyle(1, dark)
    g.strokeTriangle(0, 16, -5, 6, 5, 6)

    g.fillStyle(wing)
    g.fillTriangle(-20, 2, 20, 2, 0, -2)
    g.lineStyle(1, dark)
    g.strokeTriangle(-20, 2, 20, 2, 0, -2)
    g.fillStyle(dark)
    g.fillCircle(-20, 2, 2)
    g.fillCircle(20, 2, 2)

    g.fillStyle(fuselage)
    g.fillEllipse(0, 0, 12, 36)
    g.lineStyle(1.5, dark)
    g.strokeEllipse(0, 0, 12, 36)

    g.lineStyle(1, dark, 0.5)
    g.lineBetween(0, -18, 0, 18)
    g.lineBetween(-5, -8, 5, -8)
    g.lineBetween(-5, 4, 5, 4)

    g.fillStyle(cockpit)
    g.fillEllipse(0, -8, 8, 10)
    g.fillStyle(0xAADDFF, 0.4)
    g.fillEllipse(-1, -9, 4, 6)

    g.fillStyle(dark)
    g.fillCircle(0, -18, 3)

    g.lineStyle(4, prop)
    g.lineBetween(-10, -18, 10, -18)
    g.lineStyle(3, dark, 0.5)
    g.lineBetween(-10, -18, 10, -18)

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1, dark)
    this.barrel.setSize(14, 4)
    this.barrel.setPosition(10, 0)
  }
}
