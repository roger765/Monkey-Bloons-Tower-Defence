import Phaser from 'phaser'
import { TowerConfig, TargetingMode, DamageType, UpgradeEffect } from '../types'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { findTarget } from '../game/TargetingSystem'
import { gameState } from '../game/GameState'
import { TARGETING_MODES } from '../constants'

export abstract class BaseTower extends Phaser.GameObjects.Container {
  config: TowerConfig
  upgradeTiers: [number, number, number] = [0, 0, 0]
  targeting: TargetingMode = TargetingMode.First
  cooldownTimer: number = 0
  totalSpent: number = 0
  hasCamoDetection: boolean = false
  isParagon: boolean = false

  // Effective stats (recalculated on upgrade)
  effectiveRange: number
  effectiveCooldown: number
  effectiveDamageType: DamageType
  effectiveProjectileSpeed: number

  // Backing fields — write here during upgrades to avoid baking in village bonuses
  protected _effectiveDamage: number = 0
  protected _effectivePierce: number = 0

  // Set each frame by TowerManager based on nearby MonkeyVillage upgrades
  villageDamageBonus: number = 0
  villagePierceBonus: number = 0
  villageSpeedMultiplier: number = 1.0

  get effectiveDamage(): number { return this._effectiveDamage + this.villageDamageBonus }
  set effectiveDamage(v: number) { this._effectiveDamage = v }

  get effectivePierce(): number { return this._effectivePierce + this.villagePierceBonus }
  set effectivePierce(v: number) { this._effectivePierce = v }

  protected rangeCircle: Phaser.GameObjects.Arc
  protected body: Phaser.GameObjects.Arc
  protected sprite: Phaser.GameObjects.Image | null = null
  protected barrel: Phaser.GameObjects.Rectangle
  protected barrelPivot: Phaser.GameObjects.Container
  protected customGfx: Phaser.GameObjects.Graphics
  protected rangeVisible: boolean = false
  private idleTween: Phaser.Tweens.Tween | null = null

  protected bloonManager: BloonManager
  protected projectileManager: ProjectileManager
  protected scene: Phaser.Scene

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: TowerConfig,
    bloonManager: BloonManager,
    projectileManager: ProjectileManager
  ) {
    super(scene, x, y)
    this.scene = scene
    this.config = config
    this.bloonManager = bloonManager
    this.projectileManager = projectileManager

    this.effectiveRange = config.range
    this.effectiveCooldown = config.cooldown
    this._effectiveDamage = config.damage
    this._effectivePierce = config.pierce
    this.effectiveDamageType = config.damageType
    this.effectiveProjectileSpeed = config.projectileSpeed

    this.totalSpent = gameState.scaledCost(config.cost)

    // Range circle (hidden by default)
    this.rangeCircle = scene.add.arc(0, 0, this.effectiveRange, 0, 360, false, 0xFFFFFF, 0.12)
    this.rangeCircle.setStrokeStyle(1, 0xFFFFFF, 0.5)
    this.rangeCircle.setVisible(false)
    this.add(this.rangeCircle)

    // Drop shadow
    const shadow = scene.add.arc(2, 4, 24, 0, 360, false, 0x000000, 0.28)
    this.add(shadow)

    // Circular tower body (hidden when a portrait sprite is available)
    this.body = scene.add.arc(0, 0, 22, 0, 360, false, config.color)
    this.body.setStrokeStyle(3, this.darkenHex(config.color, 0.45))
    this.add(this.body)

    // Create sprite now but defer adding to container — it must sit above customGfx
    if (scene.textures.exists(config.id)) {
      this.body.setVisible(false)
      this.sprite = scene.add.image(0, 0, config.id)
      this.sprite.setDisplaySize(50, 50)
    }

    // Custom graphics layer — subclasses draw their unique shape here
    this.customGfx = scene.add.graphics()
    this.add(this.customGfx)

    // Barrel in a pivot container so it rotates around tower centre
    this.barrel = scene.add.rectangle(16, 0, 22, 8, this.darkenHex(config.color, 0.35))
    this.barrel.setStrokeStyle(1.5, this.darkenHex(config.color, 0.65))
    this.barrelPivot = scene.add.container(0, 0)
    this.barrelPivot.add(this.barrel)
    this.add(this.barrelPivot)

    // Add sprite last so it renders on top of body, customGfx, and barrel
    if (this.sprite) {
      this.barrelPivot.setVisible(false)
      this.add(this.sprite)
    }

    scene.add.existing(this)
    this.setDepth(15)

    // Make interactive
    this.setSize(50, 50)
    this.setInteractive()
  }

  setRangeVisible(visible: boolean): void {
    this.rangeVisible = visible
    this.rangeCircle.setVisible(visible)
  }

  playPlacementAnimation(): void {
    this.setScale(0)
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.22, scaleY: 1.22,
      duration: 220,
      ease: 'Back.Out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          scaleX: 1, scaleY: 1,
          duration: 130,
          ease: 'Power2.Out',
          onComplete: () => this.startIdleAnimation(),
        })
      },
    })
  }

  protected startIdleAnimation(): void {
    this.idleTween = this.scene.tweens.add({
      targets: this,
      scaleX: 1.04, scaleY: 1.04,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })
  }

  playUpgradeAnimation(): void {
    this.idleTween?.pause()

    // Expanding gold ring
    const ring = this.scene.add.arc(this.x, this.y, 22, 0, 360, false, 0xFFD700, 0)
    ring.setStrokeStyle(3, 0xFFD700, 1)
    ring.setDepth(40)
    this.scene.tweens.add({
      targets: ring,
      scaleX: 3.5, scaleY: 3.5, alpha: 0,
      duration: 450,
      ease: 'Power2Out',
      onComplete: () => ring.destroy(),
    })

    // Tower scale bounce
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3, scaleY: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Power3Out',
      onComplete: () => {
        this.setScale(1)
        this.idleTween?.resume()
      },
    })

    // Gold flash overlay
    const flash = this.scene.add.arc(this.x, this.y, 28, 0, 360, false, 0xFFD700, 0.5)
    flash.setDepth(40)
    this.scene.tweens.add({
      targets: flash, alpha: 0,
      duration: 300,
      ease: 'Power2Out',
      onComplete: () => flash.destroy(),
    })
  }

  update(delta: number, time: number): void {
    this.cooldownTimer -= delta / 1000

    if (this.cooldownTimer <= 0) {
      const bloons = this.bloonManager.getActiveBloons()
      const target = findTarget(
        this.x, this.y,
        this.effectiveRange,
        this.targeting,
        this.hasCamoDetection,
        this.effectiveDamageType,
        bloons
      )

      if (target) {
        this.faceTarget(target)
        this.attack(target, bloons, time)
        this.showAttackAnimation()
        this.cooldownTimer = this.effectiveCooldown * this.villageSpeedMultiplier
      }
    }
  }

  protected faceTarget(target: Bloon): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.barrelPivot.setRotation(angle)
  }

  abstract attack(target: Bloon, allBloons: Bloon[], time: number): void

  onRoundEnd(): void {}

  tryUpgrade(path: 0 | 1 | 2): boolean {
    const tier = this.upgradeTiers[path]
    if (tier >= 5) return false

    // Crosspathing check
    const otherPaths = [0, 1, 2].filter(p => p !== path) as (0 | 1 | 2)[]
    const maxOther = Math.max(...otherPaths.map(p => this.upgradeTiers[p]))

    if (tier >= 2 && maxOther >= 3) return false
    if (maxOther >= 3 && tier >= 2) return false

    const upgrade = this.config.upgrades[path][tier]
    if (!gameState.canAfford(upgrade.cost)) return false

    const scaledCost = gameState.scaledCost(upgrade.cost)
    gameState.spend(upgrade.cost)
    this.totalSpent += scaledCost
    this.upgradeTiers[path]++
    this.applyUpgradeEffect(upgrade.effect, path)
    this.recomputeStats()
    this.updateVisuals()
    this.updateTier5Portrait()
    this.playUpgradeAnimation()
    return true
  }

  protected applyUpgradeEffect(effect: UpgradeEffect, path: 0 | 1 | 2): void {
    if (effect.damageBonus) this._effectiveDamage += effect.damageBonus
    if (effect.pierceBonus) this._effectivePierce += effect.pierceBonus
    if (effect.rangeMultiplier) {
      this.effectiveRange *= effect.rangeMultiplier
      this.rangeCircle.setRadius(this.effectiveRange)
    }
    if (effect.cooldownMultiplier) this.effectiveCooldown *= effect.cooldownMultiplier
    if (effect.newDamageType) this.effectiveDamageType = effect.newDamageType
    if (effect.addCamoDetection) this.hasCamoDetection = true
    if (effect.projectileSpeedMultiplier) this.effectiveProjectileSpeed *= effect.projectileSpeedMultiplier
  }

  protected recomputeStats(): void {
    // Called after any upgrade — subclasses can override for special behavior
    this.rangeCircle.setRadius(this.effectiveRange)
  }

  protected updateVisuals(): void {
    // Subclasses override to redraw customGfx and recolor barrels on upgrade
  }

  private updateTier5Portrait(): void {
    const tier5Path = this.upgradeTiers.findIndex(t => t === 5)
    if (tier5Path === -1) return

    const prefix = tier5Path === 0 ? '500' : tier5Path === 1 ? '050' : '005'
    const key = `${this.config.id}_${prefix}`

    if (!this.scene.textures.exists(key)) return

    if (this.sprite) {
      this.sprite.setTexture(key)
      this.sprite.setDisplaySize(55, 55)
    } else {
      this.sprite = this.scene.add.image(0, 0, key)
      this.sprite.setDisplaySize(55, 55)
      this.add(this.sprite)
      this.body.setVisible(false)
      this.barrelPivot.setVisible(false)
    }
  }

  protected darkenHex(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xFF) * (1 - factor))
    const g = Math.floor(((color >> 8) & 0xFF) * (1 - factor))
    const b = Math.floor((color & 0xFF) * (1 - factor))
    return (r << 16) | (g << 8) | b
  }

  protected showAttackAnimation(): void {
    // Barrel recoil
    const origX = this.barrel.x
    this.scene.tweens.add({
      targets: this.barrel,
      x: origX - 3,
      duration: 35,
      yoyo: true,
      ease: 'Power1',
    })
    // Muzzle flash at barrel tip
    const angle = this.barrelPivot.rotation
    const flash = this.scene.add.arc(
      this.x + Math.cos(angle) * 30,
      this.y + Math.sin(angle) * 30,
      6, 0, 360, false, 0xFFFF99, 0.9
    )
    flash.setDepth(30)
    this.scene.tweens.add({
      targets: flash,
      scaleX: 2.2,
      scaleY: 2.2,
      alpha: 0,
      duration: 90,
      ease: 'Power2Out',
      onComplete: () => flash.destroy(),
    })
  }

  upgradeToParagon(totalSpentAcrossDonors: number): void {
    this.isParagon = true
    this.totalSpent = totalSpentAcrossDonors
    this.upgradeTiers = [5, 5, 5]
    this.hasCamoDetection = true
    this._effectiveDamage = this.config.damage * 10
    this._effectivePierce = this.config.pierce * 5
    this.effectiveRange = this.config.range * 1.5
    this.effectiveCooldown = this.config.cooldown * 0.25
    this.effectiveProjectileSpeed = this.config.projectileSpeed * 1.5
    this.effectiveDamageType = DamageType.Normal

    // Gold paragon body / sprite tint
    if (this.sprite) {
      this.sprite.setTint(0xFFD700)
      this.sprite.setDisplaySize(60, 60)
    } else {
      this.body.setFillStyle(0xFFD700)
      this.body.setStrokeStyle(3, 0xFF8800)
      this.body.setRadius(30)
    }
    this.rangeCircle.setRadius(this.effectiveRange)

    // Paragon animation — triple ring burst + continuous glow
    this.idleTween?.destroy()
    for (let i = 0; i < 3; i++) {
      const r = this.scene.add.arc(this.x, this.y, 30, 0, 360, false, 0xFF8800, 0)
      r.setStrokeStyle(3, i === 1 ? 0xFFFFFF : 0xFFD700, 1)
      r.setDepth(40)
      this.scene.tweens.add({
        targets: r,
        scaleX: 4, scaleY: 4, alpha: 0,
        duration: 600,
        delay: i * 120,
        ease: 'Power2Out',
        onComplete: () => r.destroy(),
      })
    }
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5, scaleY: 1.5,
      duration: 200,
      yoyo: true,
      ease: 'Power3Out',
      onComplete: () => {
        this.setScale(1)
        this.startIdleAnimation()
      },
    })

    // Diamond star marker
    this.customGfx.clear()
    this.customGfx.fillStyle(0xFF8800, 1)
    this.customGfx.fillTriangle(-8, 0, 0, -14, 8, 0)
    this.customGfx.fillTriangle(-8, 0, 0, 14, 8, 0)
    this.barrel.setFillStyle(0xFF4400)
    this.barrel.setStrokeStyle(1.5, 0x882200)
  }

  restoreFromSave(
    tiers: [number, number, number],
    targeting: TargetingMode,
    savedTotalSpent: number,
    paragon: boolean,
  ): void {
    if (paragon) {
      this.upgradeToParagon(savedTotalSpent)
      this.targeting = targeting
      return
    }
    for (let path = 0; path <= 2; path++) {
      for (let tier = 0; tier < tiers[path as 0 | 1 | 2]; tier++) {
        const upgrade = this.config.upgrades[path as 0 | 1 | 2][tier]
        this.applyUpgradeEffect(upgrade.effect, path as 0 | 1 | 2)
      }
      this.upgradeTiers[path as 0 | 1 | 2] = tiers[path as 0 | 1 | 2]
    }
    this.totalSpent = savedTotalSpent
    this.targeting = targeting
    this.recomputeStats()
    this.updateVisuals()
    this.updateTier5Portrait()
  }

  getSellValue(): number {
    return Math.floor(this.totalSpent * 0.7)
  }

  getUpgradeNotation(): string {
    return `${this.upgradeTiers[0]}-${this.upgradeTiers[1]}-${this.upgradeTiers[2]}`
  }

  canUpgradePath(path: 0 | 1 | 2): boolean {
    const tier = this.upgradeTiers[path]
    if (tier >= 5) return false
    const otherPaths = [0, 1, 2].filter(p => p !== path) as (0 | 1 | 2)[]
    const maxOther = Math.max(...otherPaths.map(p => this.upgradeTiers[p]))
    if (tier >= 2 && maxOther >= 3) return false
    return true
  }

  cycleTargeting(): void {
    const modes = Object.values(TargetingMode)
    const idx = modes.indexOf(this.targeting)
    this.targeting = modes[(idx + 1) % modes.length]
  }

  setTargeting(mode: TargetingMode): void {
    this.targeting = mode
  }
}
