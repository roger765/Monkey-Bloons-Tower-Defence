import Phaser from 'phaser'
import { BloonType, StatusEffectType, StatusEffect, DamageType } from '../types'
import { BLOON_CONFIGS } from '../data/bloons'
import { Track } from './Track'
import { gameState } from './GameState'

const FREEZE_DURATION = 2.5
const GLUE_DURATION = 8.0
const STUN_DURATION = 1.5
const BURN_DPS = 1.0
const BURN_DURATION = 3.0
const REGROW_INTERVAL = 3.0

export class Bloon extends Phaser.GameObjects.Container {
  bloonType: BloonType
  distanceAlongTrack: number = 0
  baseSpeed: number
  currentHp: number
  maxHp: number
  isCamo: boolean = false
  isRegrow: boolean = false
  isFortified: boolean = false
  statusEffects: StatusEffect[] = []
  regrowTimer: number = 0
  lastDamageTime: number = 0
  track: Track
  manager: BloonManager
  private circle: Phaser.GameObjects.Arc
  private moabRect: Phaser.GameObjects.Rectangle | null = null
  private camoOverlay: Phaser.GameObjects.Arc | null = null
  private regrowOverlay: Phaser.GameObjects.Arc | null = null
  private fortifiedOverlay: Phaser.GameObjects.Arc | null = null
  private hpBar: Phaser.GameObjects.Rectangle | null = null
  private hpBarBg: Phaser.GameObjects.Rectangle | null = null
  private balloonGfx: Phaser.GameObjects.Graphics | null = null

  constructor(scene: Phaser.Scene, track: Track, manager: BloonManager) {
    super(scene, 0, 0)
    this.track = track
    this.manager = manager
    this.bloonType = BloonType.Red
    this.baseSpeed = 25
    this.currentHp = 1
    this.maxHp = 1

    const cfg = BLOON_CONFIGS[BloonType.Red]
    if (cfg.isMoabClass) {
      this.moabRect = scene.add.rectangle(0, 0, cfg.radius * 2.5, cfg.radius * 1.5, cfg.color)
      this.moabRect.setStrokeStyle(3, cfg.outlineColor)
      this.add(this.moabRect)
    }
    this.circle = scene.add.arc(0, 0, cfg.radius, 0, 360, false, cfg.color)
    this.circle.setStrokeStyle(2, cfg.outlineColor)
    this.add(this.circle)
    this.balloonGfx = scene.add.graphics()
    this.add(this.balloonGfx)
    scene.add.existing(this)
  }

  spawn(
    bloonType: BloonType,
    distanceOffset: number = 0,
    isCamo: boolean = false,
    isRegrow: boolean = false,
    isFortified: boolean = false
  ): void {
    const cfg = BLOON_CONFIGS[bloonType]
    this.bloonType = bloonType
    this.isCamo = isCamo
    this.isRegrow = isRegrow
    this.isFortified = isFortified
    this.statusEffects = []
    this.regrowTimer = 0
    this.lastDamageTime = 0
    this.distanceAlongTrack = distanceOffset

    // Apply fortified HP
    const speedMult = gameState.getBloonSpeedMultiplier()
    this.baseSpeed = cfg.baseSpeed * speedMult

    if (cfg.isMoabClass) {
      this.maxHp = isFortified ? cfg.baseHp * 2 : cfg.baseHp
    } else if (bloonType === BloonType.Ceramic) {
      this.maxHp = isFortified ? 20 : 10
    } else {
      this.maxHp = 1
    }
    this.currentHp = this.maxHp

    // Update visuals
    this.updateVisuals()
    this.setActive(true)
    this.setVisible(true)

    const pos = this.track.getPositionAt(this.distanceAlongTrack)
    this.setPosition(pos.x, pos.y)
    this.setDepth(10 + this.distanceAlongTrack * 0.001)
  }

  private updateVisuals(): void {
    const cfg = BLOON_CONFIGS[this.bloonType]

    // Resize/recolor circle
    if (this.moabRect) {
      this.remove(this.moabRect)
      this.moabRect.destroy()
      this.moabRect = null
    }

    this.circle.setRadius(cfg.radius)
    this.circle.setFillStyle(cfg.color)
    this.circle.setStrokeStyle(2, cfg.outlineColor)

    if (cfg.isMoabClass) {
      this.moabRect = this.scene.add.rectangle(0, 0, cfg.radius * 2.8, cfg.radius * 1.6, cfg.color)
      this.moabRect.setStrokeStyle(4, cfg.outlineColor)
      this.addAt(this.moabRect, 0)
      // Label for MOAB class
      const label = this.scene.add.text(0, 0, cfg.displayName.split('.').join(''), {
        fontSize: `${Math.max(8, cfg.radius * 0.4)}px`,
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5)
      this.add(label)
      this.circle.setAlpha(0) // hide circle for moabs
    }

    // HP bar for multi-HP bloons
    if (this.hpBarBg) { this.remove(this.hpBarBg); this.hpBarBg.destroy(); this.hpBarBg = null }
    if (this.hpBar) { this.remove(this.hpBar); this.hpBar.destroy(); this.hpBar = null }

    if (this.maxHp > 1) {
      const barW = cfg.radius * 2.5
      const barY = -cfg.radius - 8
      this.hpBarBg = this.scene.add.rectangle(0, barY, barW, 6, 0x333333)
      this.hpBar = this.scene.add.rectangle(-barW / 2, barY, barW, 6, 0x00FF00).setOrigin(0, 0.5)
      this.add(this.hpBarBg)
      this.add(this.hpBar)
    }

    // Property overlays
    if (this.camoOverlay) { this.remove(this.camoOverlay); this.camoOverlay.destroy(); this.camoOverlay = null }
    if (this.regrowOverlay) { this.remove(this.regrowOverlay); this.regrowOverlay.destroy(); this.regrowOverlay = null }
    if (this.fortifiedOverlay) { this.remove(this.fortifiedOverlay); this.fortifiedOverlay.destroy(); this.fortifiedOverlay = null }

    if (this.isCamo) {
      this.camoOverlay = this.scene.add.arc(0, 0, cfg.radius + 2, 0, 360, false, 0x00FF80, 0.35)
      this.add(this.camoOverlay)
    }
    if (this.isRegrow) {
      this.regrowOverlay = this.scene.add.arc(0, 0, cfg.radius - 3, 0, 360, false, 0x00CC40, 0.4)
      this.add(this.regrowOverlay)
    }
    if (this.isFortified) {
      this.fortifiedOverlay = this.scene.add.arc(0, 0, cfg.radius + 4, 0, 360, false, 0xFFAA00, 0.25)
      this.add(this.fortifiedOverlay)
    }

    this.drawBalloonDetails()
  }

  private drawBalloonDetails(): void {
    if (!this.balloonGfx) return
    const cfg = BLOON_CONFIGS[this.bloonType]
    const r = cfg.radius
    this.balloonGfx.clear()

    if (cfg.isMoabClass) {
      // Shine stripe across upper portion of blimp
      this.balloonGfx.fillStyle(0xFFFFFF, 0.18)
      this.balloonGfx.fillRoundedRect(-r * 1.1, -r * 0.72, r * 2.2, r * 0.32, 4)
      this.balloonGfx.fillStyle(0xFFFFFF, 0.08)
      this.balloonGfx.fillRoundedRect(-r * 0.8, -r * 0.35, r * 1.6, r * 0.18, 3)
      return
    }

    const frozen = this.isFrozen()

    // Crisp outline
    this.balloonGfx.lineStyle(2.5, frozen ? 0x5599BB : cfg.outlineColor, 1.0)
    this.balloonGfx.strokeCircle(0, 0, r)

    // Dark shade at lower portion (depth)
    this.balloonGfx.fillStyle(0x000000, frozen ? 0.1 : 0.2)
    this.balloonGfx.fillCircle(0, r * 0.28, r * 0.82)

    // White specular highlight (upper-left)
    this.balloonGfx.fillStyle(0xFFFFFF, frozen ? 0.65 : 0.5)
    this.balloonGfx.fillEllipse(-r * 0.26, -r * 0.32, r * 0.46, r * 0.32)

    if (!frozen) {
      // Knot at bottom
      this.balloonGfx.fillStyle(cfg.outlineColor, 1.0)
      this.balloonGfx.fillCircle(0, r + 3, 3.5)
      this.balloonGfx.lineStyle(2, cfg.outlineColor, 1.0)
      this.balloonGfx.beginPath()
      this.balloonGfx.moveTo(0, r)
      this.balloonGfx.lineTo(0, r + 1)
      this.balloonGfx.strokePath()
    } else {
      // Ice crystal sparkles
      this.balloonGfx.fillStyle(0xAADDFF, 0.7)
      this.balloonGfx.fillTriangle(-r * 0.5, -r * 0.08, 0, -r * 0.42, r * 0.5, -r * 0.08)
      this.balloonGfx.fillStyle(0xCCEEFF, 0.55)
      this.balloonGfx.fillTriangle(-r * 0.3, r * 0.12, 0, -r * 0.18, r * 0.3, r * 0.12)
    }
  }

  update(delta: number, time: number): void {
    if (!this.active) return

    const speedMultiplier = this.getSpeedMultiplier()
    const effectiveSpeed = this.baseSpeed * speedMultiplier
    this.distanceAlongTrack += (effectiveSpeed * delta) / 1000

    const pos = this.track.getPositionAt(this.distanceAlongTrack)
    this.setPosition(pos.x, pos.y)
    this.setDepth(10 + this.distanceAlongTrack * 0.001)

    // Tick status effects
    this.tickStatusEffects(delta, time)

    // Check regrow
    if (this.isRegrow && this.currentHp < this.maxHp && this.maxHp > 1) {
      if (time - this.lastDamageTime > REGROW_INTERVAL * 1000) {
        this.currentHp = Math.min(this.maxHp, this.currentHp + 1)
        this.updateHpBar()
      }
    }

    // Check if exited
    if (this.distanceAlongTrack >= this.track.totalLength) {
      this.onExitTrack()
    }
  }

  private tickStatusEffects(delta: number, time: number): void {
    const toRemove: number[] = []

    for (let i = 0; i < this.statusEffects.length; i++) {
      const effect = this.statusEffects[i]
      effect.duration -= delta / 1000

      if (effect.type === StatusEffectType.Burn && effect.damagePerSecond) {
        effect.burnTickTimer = (effect.burnTickTimer ?? 0) + delta / 1000
        if (effect.burnTickTimer >= 0.5) {
          effect.burnTickTimer -= 0.5
          const dmg = effect.damagePerSecond * 0.5
          this.applyDamageInternal(dmg, DamageType.Fire, time)
        }
      }

      if (effect.duration <= 0) {
        toRemove.push(i)
      }
    }

    for (let i = toRemove.length - 1; i >= 0; i--) {
      this.statusEffects.splice(toRemove[i], 1)
    }

    // Update freeze visual
    if (this.isFrozen()) {
      this.circle.setFillStyle(0xAAAAAA)
    } else {
      const cfg = BLOON_CONFIGS[this.bloonType]
      this.circle.setFillStyle(cfg.color)
    }
    this.drawBalloonDetails()
  }

  getSpeedMultiplier(): number {
    if (this.isFrozen() || this.isStunned()) return 0
    let mult = 1.0
    for (const effect of this.statusEffects) {
      if (effect.type === StatusEffectType.Glue && effect.slowMultiplier !== undefined) {
        mult *= effect.slowMultiplier
      }
    }
    return mult
  }

  get bloonRadius(): number {
    return BLOON_CONFIGS[this.bloonType].radius
  }

  isFrozen(): boolean {
    return this.statusEffects.some(e => e.type === StatusEffectType.Freeze && e.duration > 0)
  }

  isStunned(): boolean {
    return this.statusEffects.some(e => e.type === StatusEffectType.Stun && e.duration > 0)
  }

  isImmuneTo(damageType: DamageType): boolean {
    if (damageType === DamageType.Normal) return false
    const cfg = BLOON_CONFIGS[this.bloonType]
    return cfg.immunities.includes(damageType)
  }

  takeDamage(amount: number, damageType: DamageType, time: number): boolean {
    // Immunity check
    if (this.isImmuneTo(damageType)) return false
    // Frozen + sharp = no hit
    if (this.isFrozen() && damageType === DamageType.Sharp) return false

    this.lastDamageTime = time
    this.applyDamageInternal(amount, damageType, time)
    return true
  }

  private applyDamageInternal(amount: number, damageType: DamageType, time: number): void {
    const cfg = BLOON_CONFIGS[this.bloonType]

    if (this.maxHp === 1) {
      // Layer-based bloons: each hit pops one layer
      this.pop(time)
    } else {
      // HP-based bloons (Ceramic, MOAB-class)
      this.currentHp -= amount
      this.updateHpBar()
      if (this.currentHp <= 0) {
        this.pop(time)
      }
    }
  }

  applyStatusEffect(effect: StatusEffect): void {
    const cfg = BLOON_CONFIGS[this.bloonType]

    // Immunity checks for status effects
    if (effect.type === StatusEffectType.Freeze) {
      if (cfg.immunities.includes(DamageType.Cold)) return
      if (cfg.isMoabClass) return
    }
    if (effect.type === StatusEffectType.Glue) {
      // BAD is immune but not in Phase 1
      if (effect.slowMultiplier !== undefined && cfg.isMoabClass) {
        // Only MOAB Glue upgrade can slow MOAB-class
        if (effect.slowMultiplier > 0.375 + 0.01) return  // base glue can't slow MOAB-class
      }
    }
    if (effect.type === StatusEffectType.Burn) {
      if (cfg.immunities.includes(DamageType.Fire)) return
    }

    // Refresh or add
    const existing = this.statusEffects.find(e => e.type === effect.type)
    if (existing) {
      existing.duration = Math.max(existing.duration, effect.duration)
      if (effect.slowMultiplier !== undefined) existing.slowMultiplier = effect.slowMultiplier
      if (effect.damagePerSecond !== undefined) existing.damagePerSecond = Math.max(existing.damagePerSecond ?? 0, effect.damagePerSecond)
    } else {
      this.statusEffects.push({ ...effect })
    }
  }

  pop(time: number): void {
    const cfg = BLOON_CONFIGS[this.bloonType]

    // Spawn children
    for (const childType of cfg.children) {
      this.manager.spawnChild(childType, this, time)
    }

    // Award cash
    const cashMult = gameState.getCashPerPopMultiplier()
    const cashEarned = Math.max(1, Math.floor(cashMult))
    gameState.earn(cashEarned)
    gameState.totalBloonsPoppedAllTime++

    this.showPopEffect()
    this.deactivate()
  }

  private showPopEffect(): void {
    const cfg = BLOON_CONFIGS[this.bloonType]
    const scene = this.scene
    const x = this.x
    const y = this.y
    const r = cfg.radius
    const color = cfg.color

    // Expanding ring burst
    const ring = scene.add.arc(x, y, r * 0.5, 0, 360, true, color, 0)
    ring.setStrokeStyle(3, color, 0.9)
    ring.setDepth(22)
    scene.tweens.add({
      targets: ring,
      scaleX: cfg.isMoabClass ? 5 : 3.5,
      scaleY: cfg.isMoabClass ? 5 : 3.5,
      alpha: 0,
      duration: cfg.isMoabClass ? 450 : 260,
      ease: 'Power2Out',
      onComplete: () => ring.destroy(),
    })

    // Scatter particles
    const count = cfg.isMoabClass ? 10 : 5
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.8
      const dist = r * (1.5 + Math.random() * 2.5)
      const pSize = 2 + Math.random() * 3
      const p = scene.add.arc(x, y, pSize, 0, 360, false, color, 0.95)
      p.setDepth(23)
      scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        scaleX: 0.1,
        scaleY: 0.1,
        alpha: 0,
        duration: 220 + Math.random() * 180,
        ease: 'Power1Out',
        onComplete: () => p.destroy(),
      })
    }
  }

  private updateHpBar(): void {
    if (!this.hpBar) return
    const cfg = BLOON_CONFIGS[this.bloonType]
    const barW = cfg.radius * 2.5
    const pct = Math.max(0, this.currentHp / this.maxHp)
    this.hpBar.setSize(barW * pct, 6)
    const color = pct > 0.5 ? 0x00FF00 : pct > 0.25 ? 0xFFAA00 : 0xFF0000
    this.hpBar.setFillStyle(color)
  }

  deactivate(): void {
    this.setActive(false)
    this.setVisible(false)
    this.statusEffects = []
    this.balloonGfx?.clear()
  }

  private onExitTrack(): void {
    const cfg = BLOON_CONFIGS[this.bloonType]
    // Lives lost = 1 per bloon layer (MOAB-class = 1 life per child)
    const livesLost = cfg.isMoabClass ? 1 : 1
    gameState.loseLife(livesLost)
    this.deactivate()
  }
}

export class BloonManager {
  private scene: Phaser.Scene
  private track: Track
  private pool: Bloon[] = []
  private activeBloons: Bloon[] = []
  readonly POOL_SIZE = 400

  constructor(scene: Phaser.Scene, track: Track) {
    this.scene = scene
    this.track = track
    this.initPool()
  }

  private initPool(): void {
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const bloon = new Bloon(this.scene, this.track, this)
      bloon.setActive(false).setVisible(false)
      this.pool.push(bloon)
    }
  }

  private getFromPool(): Bloon | null {
    for (const b of this.pool) {
      if (!b.active) return b
    }
    return null
  }

  spawn(
    bloonType: BloonType,
    isCamo: boolean = false,
    isRegrow: boolean = false,
    isFortified: boolean = false,
    distanceOffset: number = 0
  ): Bloon | null {
    const bloon = this.getFromPool()
    if (!bloon) return null
    bloon.spawn(bloonType, distanceOffset, isCamo, isRegrow, isFortified)
    if (!this.activeBloons.includes(bloon)) {
      this.activeBloons.push(bloon)
    }
    return bloon
  }

  spawnChild(bloonType: BloonType, parent: Bloon, time: number): Bloon | null {
    return this.spawn(bloonType, parent.isCamo && false, parent.isRegrow, false, parent.distanceAlongTrack)
    // Note: Camo property does NOT pass to children in standard BTD6
  }

  getActiveBloons(): Bloon[] {
    return this.pool.filter(b => b.active)
  }

  get activeCount(): number {
    return this.pool.filter(b => b.active).length
  }

  update(delta: number, time: number): void {
    for (const bloon of this.pool) {
      if (bloon.active) {
        bloon.update(delta, time)
      }
    }
  }

  clear(): void {
    for (const bloon of this.pool) {
      if (bloon.active) bloon.deactivate()
    }
  }
}
