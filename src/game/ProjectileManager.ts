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

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 5, 0, 360, false, 0xFFFFFF)
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

    this.setActive(true)
    this.setVisible(true)
    this.setDepth(20)
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
        // Projectile passes through immune/frozen bloons without consuming pierce,
        // but we mark it so we don't retry every frame while still overlapping.
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
    this.pierce = 0
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
