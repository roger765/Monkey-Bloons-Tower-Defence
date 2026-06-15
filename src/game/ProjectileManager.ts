import Phaser from 'phaser'
import { DamageType, StatusEffectType } from '../types'
import { Bloon, BloonManager } from './BloonManager'
import { canHit, applyFreeze, applyGlue, applyStun } from './DamageSystem'

export interface ProjectileConfig {
  x: number
  y: number
  targetX: number
  targetY: number
  speed: number
  radius: number
  damage: number
  pierce: number
  damageType: DamageType
  color: number
  shape?: 'circle' | 'dart' | 'boomerang' | 'tack' | 'bomb' | 'bullet'
  isAoE?: boolean
  aoERadius?: number
  isStraightLine?: boolean
  angle?: number
  // For boomerang
  isBoomerang?: boolean
  originX?: number
  originY?: number
  // For glue
  isGlue?: boolean
  glueDuration?: number
  glueSlowMult?: number
  canGlueMoab?: boolean
  // For freeze
  isFreeze?: boolean
  freezeDuration?: number
  canFreezeBlackWhite?: boolean
  // For stun
  causesStun?: boolean
  stunDuration?: number
}

export class Projectile extends Phaser.GameObjects.Arc {
  speed: number = 300
  damage: number = 1
  pierce: number = 1
  damageType: DamageType = DamageType.Sharp
  velocityX: number = 0
  velocityY: number = 0
  hitBloons: Set<Bloon> = new Set()
  isAoE: boolean = false
  aoERadius: number = 40
  isStraightLine: boolean = false
  isBoomerang: boolean = false
  originX: number = 0
  originY: number = 0
  boomerangPhase: number = 0  // 0 = outgoing, 1 = returning
  isGlue: boolean = false
  glueDuration: number = 8
  glueSlowMult: number = 0.5
  canGlueMoab: boolean = false
  isFreeze: boolean = false
  freezeDuration: number = 2.5
  canFreezeBlackWhite: boolean = false
  causesStun: boolean = false
  stunDuration: number = 1.5
  active: boolean = false
  collisionRadius: number = 5

  private shapeGfx: Phaser.GameObjects.Graphics
  private currentShape: string = 'circle'

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 5, 0, 360, false, 0xFFFFFF)
    this.shapeGfx = scene.add.graphics()
    this.shapeGfx.setActive(false).setVisible(false)
    this.setActive(false)
    this.setVisible(false)
    scene.add.existing(this)
  }

  launch(cfg: ProjectileConfig): void {
    this.setPosition(cfg.x, cfg.y)
    this.setRadius(cfg.radius)
    this.collisionRadius = cfg.radius
    this.setFillStyle(cfg.color)
    this.speed = cfg.speed
    this.damage = cfg.damage
    this.pierce = cfg.pierce
    this.damageType = cfg.damageType
    this.hitBloons = new Set()
    this.isAoE = cfg.isAoE ?? false
    this.aoERadius = cfg.aoERadius ?? 40
    this.isStraightLine = cfg.isStraightLine ?? false
    this.isBoomerang = cfg.isBoomerang ?? false
    this.originX = cfg.originX ?? cfg.x
    this.originY = cfg.originY ?? cfg.y
    this.boomerangPhase = 0
    this.isGlue = cfg.isGlue ?? false
    this.glueDuration = cfg.glueDuration ?? 8
    this.glueSlowMult = cfg.glueSlowMult ?? 0.5
    this.canGlueMoab = cfg.canGlueMoab ?? false
    this.isFreeze = cfg.isFreeze ?? false
    this.freezeDuration = cfg.freezeDuration ?? 2.5
    this.canFreezeBlackWhite = cfg.canFreezeBlackWhite ?? false
    this.causesStun = cfg.causesStun ?? false
    this.stunDuration = cfg.stunDuration ?? 1.5

    const dx = cfg.targetX - cfg.x
    const dy = cfg.targetY - cfg.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 0) {
      this.velocityX = (dx / dist) * cfg.speed
      this.velocityY = (dy / dist) * cfg.speed
    } else {
      this.velocityX = cfg.speed
      this.velocityY = 0
    }

    // Shape rendering: hide the Arc and draw a custom shape if requested
    this.currentShape = cfg.shape ?? 'circle'
    if (this.currentShape !== 'circle') {
      this.setAlpha(0)
      this.shapeGfx.clear()
      this.drawShape(this.currentShape, cfg.color)
      this.shapeGfx.setPosition(cfg.x, cfg.y)
      this.shapeGfx.setRotation(0)
      this.shapeGfx.setActive(true).setVisible(true).setDepth(20)
    } else {
      this.setAlpha(1)
      this.shapeGfx.setActive(false).setVisible(false)
    }

    this.setActive(true)
    this.setVisible(true)
    this.setDepth(20)
  }

  private drawShape(shape: string, color: number): void {
    const g = this.shapeGfx
    g.clear()
    switch (shape) {
      case 'dart':
        // Shaft (golden rod)
        g.fillStyle(0xCC9900, 1)
        g.fillRect(-5, -1.5, 9, 3)
        // Pointed tip (brighter yellow)
        g.fillStyle(0xEEEE22, 1)
        g.fillTriangle(9, 0, 2, -2.5, 2, 2.5)
        // Orange tail fins
        g.fillStyle(0xFF8800, 1)
        g.fillTriangle(-5, -1.5, -9, -4, -6, 0)
        g.fillTriangle(-5,  1.5, -9,  4, -6, 0)
        break

      case 'boomerang':
        // Outer arc — thick wooden crescent
        g.lineStyle(5, 0xC87820, 1)
        g.beginPath()
        g.arc(0, 2, 8, Phaser.Math.DegToRad(205), Phaser.Math.DegToRad(335))
        g.strokePath()
        // Inner highlight
        g.lineStyle(2, 0xDDAA40, 1)
        g.beginPath()
        g.arc(0, 2, 5, Phaser.Math.DegToRad(210), Phaser.Math.DegToRad(330))
        g.strokePath()
        break

      case 'tack':
        // Four sharp points radiating outward
        g.fillStyle(0xCCCCCC, 1)
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2
          const tx = Math.cos(a) * 6,  ty = Math.sin(a) * 6
          const lx = Math.cos(a - 0.45) * 2.5, ly = Math.sin(a - 0.45) * 2.5
          const rx = Math.cos(a + 0.45) * 2.5, ry = Math.sin(a + 0.45) * 2.5
          g.fillTriangle(tx, ty, lx, ly, rx, ry)
        }
        g.fillStyle(0x888888, 1)
        g.fillCircle(0, 0, 2)
        break

      case 'bomb':
        // Dark cannonball with glint and fuse
        g.fillStyle(0x1A1A1A, 1)
        g.fillCircle(0, 1, 6)
        g.fillStyle(0x505050, 1)
        g.fillCircle(-2, -1, 2.5)
        g.lineStyle(1.5, 0xAA8800, 1)
        g.lineBetween(0, -5, 2, -9)
        g.fillStyle(0xFFDD00, 1)
        g.fillCircle(2, -9, 2)
        g.fillStyle(0xFF6600, 1)
        g.fillCircle(2, -9, 1)
        break

      case 'bullet':
        // Brass casing + lead tip
        g.fillStyle(0xAA7700, 1)
        g.fillRect(-6, -2, 3, 4)      // base
        g.fillStyle(0xCCAA00, 1)
        g.fillRect(-3, -2, 7, 4)      // brass body
        g.fillStyle(0xDDDDAA, 1)
        g.fillTriangle(7, 0, 3, -2, 3, 2)  // lead tip
        break
    }
  }

  update(delta: number, bloons: Bloon[], time: number): void {
    if (!this.active) return

    const dt = delta / 1000

    if (this.isBoomerang) {
      this.updateBoomerang(dt, bloons, time)
    } else {
      this.x += this.velocityX * dt
      this.y += this.velocityY * dt
    }

    // Sync shape graphic position and orientation
    if (this.shapeGfx.active) {
      this.shapeGfx.setPosition(this.x, this.y)
      if (this.currentShape === 'dart' || this.currentShape === 'bullet') {
        // Face direction of travel
        this.shapeGfx.setRotation(Math.atan2(this.velocityY, this.velocityX))
      } else if (this.currentShape === 'boomerang') {
        // Spin continuously
        this.shapeGfx.setRotation(this.shapeGfx.rotation + 6 * dt)
      } else if (this.currentShape === 'tack') {
        // Slow spin
        this.shapeGfx.setRotation(this.shapeGfx.rotation + 4 * dt)
      }
    }

    // Check bloon collisions
    for (const bloon of bloons) {
      if (!bloon.active) continue
      if (this.hitBloons.has(bloon)) continue
      if (this.pierce <= 0) break

      const dist = Phaser.Math.Distance.Between(this.x, this.y, bloon.x, bloon.y)
      const bloonR = bloon.bloonRadius ?? 14

      if (dist <= this.collisionRadius + bloonR) {
        this.onHitBloon(bloon, time)
      }
    }

    // AoE detonation on reaching target (for bombs)
    // Handled in BombShooter

    // Despawn if off screen
    if (this.x < -100 || this.x > 1380 || this.y < -100 || this.y > 820) {
      this.deactivate()
    }
  }

  onHitBloon(bloon: Bloon, time: number): void {
    if (this.isFreeze) {
      applyFreeze(bloon, this.freezeDuration, this.canFreezeBlackWhite, this.canFreezeBlackWhite)
    } else if (this.isGlue) {
      applyGlue(bloon, this.glueDuration, this.glueSlowMult, this.canGlueMoab)
    } else {
      if (!canHit(this.damageType, bloon)) {
        // Projectile passes through immune bloons without consuming pierce
        this.hitBloons.add(bloon)
        return
      }
      bloon.takeDamage(this.damage, this.damageType, time)
    }

    if (this.causesStun) {
      applyStun(bloon, this.stunDuration)
    }

    this.hitBloons.add(bloon)
    this.pierce--

    if (this.pierce <= 0) {
      this.deactivate()
    }
  }

  private updateBoomerang(dt: number, bloons: Bloon[], time: number): void {
    this.x += this.velocityX * dt
    this.y += this.velocityY * dt

    const distFromOrigin = Phaser.Math.Distance.Between(this.x, this.y, this.originX, this.originY)

    if (this.boomerangPhase === 0 && distFromOrigin > 150) {
      this.boomerangPhase = 1
      this.velocityX = -this.velocityX
      this.velocityY = -this.velocityY
      this.hitBloons.clear()  // can rehit on return
    }

    if (this.boomerangPhase === 1 && distFromOrigin < 20) {
      this.deactivate()
    }
  }

  deactivate(): void {
    this.setActive(false)
    this.setVisible(false)
    this.setAlpha(1)  // reset for pool reuse
    this.pierce = 0
    this.shapeGfx.setActive(false).setVisible(false)
    this.shapeGfx.clear()
  }

}

export class ProjectileManager {
  private scene: Phaser.Scene
  private pool: Projectile[] = []
  readonly POOL_SIZE = 600

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.initPool()
  }

  private initPool(): void {
    for (let i = 0; i < this.POOL_SIZE; i++) {
      this.pool.push(new Projectile(this.scene))
    }
  }

  private getFromPool(): Projectile | null {
    for (const p of this.pool) {
      if (!p.active) return p
    }
    return null
  }

  launch(cfg: ProjectileConfig): Projectile | null {
    const proj = this.getFromPool()
    if (!proj) return null
    proj.launch(cfg)
    return proj
  }

  update(delta: number, bloons: Bloon[], time: number): void {
    for (const proj of this.pool) {
      if (proj.active) {
        proj.update(delta, bloons, time)
      }
    }
  }

  clear(): void {
    for (const proj of this.pool) {
      if (proj.active) proj.deactivate()
    }
  }

  detonateAoE(
    x: number,
    y: number,
    radius: number,
    damage: number,
    damageType: DamageType,
    bloons: Bloon[],
    time: number,
    causesStun: boolean = false,
    stunDuration: number = 1.5
  ): void {
    let pierce = 40
    for (const bloon of bloons) {
      if (!bloon.active) continue
      if (pierce <= 0) break
      const dist = Phaser.Math.Distance.Between(x, y, bloon.x, bloon.y)
      const bloonRadius = bloon.bloonRadius ?? 14
      if (dist <= radius + bloonRadius) {
        if (canHit(damageType, bloon)) {
          bloon.takeDamage(damage, damageType, time)
          if (causesStun) applyStun(bloon, stunDuration)
          pierce--
        }
      }
    }

    // Visual explosion
    const circle = this.scene.add.arc(x, y, 4, 0, 360, false, 0xFF8800, 0.8)
    circle.setDepth(25)
    this.scene.tweens.add({
      targets: circle,
      scaleX: radius / 4,
      scaleY: radius / 4,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => circle.destroy(),
    })
  }

  freezeAoE(
    x: number,
    y: number,
    radius: number,
    bloons: Bloon[],
    freezeDuration: number,
    canFreezeBlackWhite: boolean
  ): void {
    for (const bloon of bloons) {
      if (!bloon.active) continue
      const dist = Phaser.Math.Distance.Between(x, y, bloon.x, bloon.y)
      const bloonRadius = bloon.bloonRadius ?? 14
      if (dist <= radius + bloonRadius) {
        applyFreeze(bloon, freezeDuration, canFreezeBlackWhite, canFreezeBlackWhite)
      }
    }

    // Visual freeze
    const circle = this.scene.add.arc(x, y, 4, 0, 360, false, 0x80DDFF, 0.6)
    circle.setDepth(25)
    this.scene.tweens.add({
      targets: circle,
      scaleX: radius / 4,
      scaleY: radius / 4,
      alpha: 0,
      duration: 400,
      ease: 'Linear',
      onComplete: () => circle.destroy(),
    })
  }
}
