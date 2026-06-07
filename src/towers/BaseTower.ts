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

  // Effective stats (recalculated on upgrade)
  effectiveRange: number
  effectiveCooldown: number
  effectiveDamage: number
  effectivePierce: number
  effectiveDamageType: DamageType
  effectiveProjectileSpeed: number

  protected rangeCircle: Phaser.GameObjects.Arc
  protected body: Phaser.GameObjects.Arc
  protected barrel: Phaser.GameObjects.Rectangle
  protected barrelPivot: Phaser.GameObjects.Container
  protected rangeVisible: boolean = false

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
    this.effectiveDamage = config.damage
    this.effectivePierce = config.pierce
    this.effectiveDamageType = config.damageType
    this.effectiveProjectileSpeed = config.projectileSpeed

    this.totalSpent = gameState.scaledCost(config.cost)

    // Range circle (hidden by default)
    this.rangeCircle = scene.add.arc(0, 0, this.effectiveRange, 0, 360, false, 0xFFFFFF, 0.12)
    this.rangeCircle.setStrokeStyle(1, 0xFFFFFF, 0.5)
    this.rangeCircle.setVisible(false)
    this.add(this.rangeCircle)

    // Drop shadow
    const shadow = scene.add.arc(2, 3, 19, 0, 360, false, 0x000000, 0.28)
    this.add(shadow)

    // Circular tower body
    this.body = scene.add.arc(0, 0, 18, 0, 360, false, config.color)
    this.body.setStrokeStyle(2.5, this.darkenHex(config.color, 0.45))
    this.add(this.body)

    // Barrel in a pivot container so it rotates around tower centre
    this.barrel = scene.add.rectangle(13, 0, 18, 7, this.darkenHex(config.color, 0.35))
    this.barrel.setStrokeStyle(1.5, this.darkenHex(config.color, 0.65))
    this.barrelPivot = scene.add.container(0, 0)
    this.barrelPivot.add(this.barrel)
    this.add(this.barrelPivot)

    scene.add.existing(this)
    this.setDepth(15)

    // Make interactive
    this.setSize(40, 40)
    this.setInteractive()
  }

  setRangeVisible(visible: boolean): void {
    this.rangeVisible = visible
    this.rangeCircle.setVisible(visible)
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
        this.cooldownTimer = this.effectiveCooldown
      }
    }
  }

  protected faceTarget(target: Bloon): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.barrelPivot.setRotation(angle)
  }

  abstract attack(target: Bloon, allBloons: Bloon[], time: number): void

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
    return true
  }

  protected applyUpgradeEffect(effect: UpgradeEffect, path: 0 | 1 | 2): void {
    if (effect.damageBonus) this.effectiveDamage += effect.damageBonus
    if (effect.pierceBonus) this.effectivePierce += effect.pierceBonus
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
      this.x + Math.cos(angle) * 24,
      this.y + Math.sin(angle) * 24,
      5, 0, 360, false, 0xFFFF99, 0.9
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
