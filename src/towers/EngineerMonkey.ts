import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { BLOON_CONFIGS } from '../data/bloons'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { Track } from '../game/Track'
import { findTarget } from '../game/TargetingSystem'
import { TargetingMode, DamageType } from '../types'
import { gameState } from '../game/GameState'

const SENTRY_RANGE = 80
const SENTRY_COOLDOWN = 1.5
const SENTRY_DEPLOY_INTERVAL = 8.0
const SENTRY_MAX = 4
const TRACK_SAMPLE_STEP = 10

const TRAP_CAPACITY_NORMAL = 10
const TRAP_CAPACITY_XXXL = 30
const TRAP_ABSORB_RADIUS = 18
const TRAP_DEPLOY_INTERVAL = 12.0
const TRAP_MAX = 3

// Small auto-targeting turret deployed on the track by the Engineer Monkey
class SentryGun extends Phaser.GameObjects.Container {
  private bloonManager: BloonManager
  private projectileManager: ProjectileManager
  private cooldownTimer: number = 0
  private barrelPivot: Phaser.GameObjects.Container
  damage: number = 1
  pierce: number = 2

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    bloonManager: BloonManager,
    projectileManager: ProjectileManager
  ) {
    super(scene, x, y)
    this.bloonManager = bloonManager
    this.projectileManager = projectileManager

    const g = scene.add.graphics()

    // Base plate
    g.fillStyle(0x2A2A2A)
    g.fillRect(-8, -6, 16, 12)
    g.lineStyle(1.5, 0x111111)
    g.strokeRect(-8, -6, 16, 12)

    // Top highlight strip
    g.fillStyle(0x484848)
    g.fillRect(-6, -5, 12, 4)

    // Center pivot bolt
    g.fillStyle(0x888888)
    g.fillCircle(0, 0, 3)
    g.lineStyle(1, 0x333333)
    g.strokeCircle(0, 0, 3)

    this.add(g)

    // Barrel on a pivot so it rotates toward targets
    const barrel = scene.add.rectangle(9, 0, 12, 4, 0x888888)
    barrel.setStrokeStyle(1, 0x333333)
    this.barrelPivot = scene.add.container(0, 0)
    this.barrelPivot.add(barrel)
    this.add(this.barrelPivot)

    scene.add.existing(this)
    this.setDepth(14)

    // Drop-in bounce animation
    this.setScale(0)
    scene.tweens.add({
      targets: this,
      scaleX: 1.25, scaleY: 1.25,
      duration: 180,
      ease: 'Back.Out',
      onComplete: () => {
        scene.tweens.add({
          targets: this,
          scaleX: 1, scaleY: 1,
          duration: 110,
          ease: 'Power2.Out',
        })
      },
    })
  }

  update(delta: number): void {
    this.cooldownTimer -= delta / 1000
    if (this.cooldownTimer > 0) return

    const bloons = this.bloonManager.getActiveBloons()
    const target = findTarget(this.x, this.y, SENTRY_RANGE, TargetingMode.First, false, DamageType.Normal, bloons)
    if (!target) return

    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.barrelPivot.setRotation(angle)

    this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: target.x, targetY: target.y,
      speed: 300,
      radius: 4,
      damage: this.damage,
      pierce: this.pierce,
      damageType: DamageType.Normal,
      color: 0xAAAAAA,
    })

    // Muzzle flash
    const flash = this.scene.add.arc(
      this.x + Math.cos(angle) * 16,
      this.y + Math.sin(angle) * 16,
      4, 0, 360, false, 0xFFFF99, 0.9
    )
    flash.setDepth(30)
    this.scene.tweens.add({
      targets: flash,
      scaleX: 2, scaleY: 2, alpha: 0,
      duration: 80,
      ease: 'Power2Out',
      onComplete: () => flash.destroy(),
    })

    this.cooldownTimer = SENTRY_COOLDOWN
  }
}

class BloonTrap extends Phaser.GameObjects.Container {
  private bloonManager: BloonManager
  private capacity: number
  private canAbsorbMoab: boolean
  private bloonsAbsorbed: number = 0
  private label: Phaser.GameObjects.Text
  isDepleted: boolean = false

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, capacity: number, canAbsorbMoab: boolean
  ) {
    super(scene, x, y)
    this.bloonManager = bloonManager
    this.capacity = capacity
    this.canAbsorbMoab = canAbsorbMoab

    const g = scene.add.graphics()

    // Blue box body
    g.fillStyle(0x2288EE)
    g.fillRoundedRect(-13, -9, 26, 18, 3)
    g.lineStyle(2, 0x004488)
    g.strokeRoundedRect(-13, -9, 26, 18, 3)

    // Dark interior
    g.fillStyle(0x002244, 0.75)
    g.fillRoundedRect(-9, -5, 18, 10, 2)

    // Intake arrow
    g.fillStyle(0x88CCFF)
    g.fillTriangle(-5, 2, 5, 2, 0, -3)

    // Gold outline for XXXL
    if (canAbsorbMoab) {
      g.lineStyle(2.5, 0xFFCC00)
      g.strokeRoundedRect(-13, -9, 26, 18, 3)
    }

    this.add(g)

    this.label = scene.add.text(0, -15, `0/${capacity}`, {
      fontSize: '9px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5, 1)
    this.add(this.label)

    scene.add.existing(this)
    this.setDepth(13)

    // Pop-in
    this.setScale(0)
    scene.tweens.add({
      targets: this,
      scaleX: 1.2, scaleY: 1.2, duration: 160, ease: 'Back.Out',
      onComplete: () => scene.tweens.add({ targets: this, scaleX: 1, scaleY: 1, duration: 100 }),
    })
  }

  update(): void {
    if (this.isDepleted) return

    const bloons = this.bloonManager.getActiveBloons()
    for (const bloon of bloons) {
      if (this.bloonsAbsorbed >= this.capacity) break
      if (!bloon.active) continue

      const cfg = BLOON_CONFIGS[bloon.bloonType]
      if (cfg.isMoabClass && !this.canAbsorbMoab) continue

      const dist = Phaser.Math.Distance.Between(this.x, this.y, bloon.x, bloon.y)
      if (dist <= TRAP_ABSORB_RADIUS) {
        // Absorb without spawning children; award cash
        gameState.earn(Math.max(1, Math.floor(gameState.getCashPerPopMultiplier())))
        bloon.deactivate()
        this.bloonsAbsorbed++
        this.label.setText(`${this.bloonsAbsorbed}/${this.capacity}`)

        this.scene.tweens.add({
          targets: this, scaleX: 1.2, scaleY: 0.8, duration: 55, yoyo: true,
        })
      }
    }

    if (this.bloonsAbsorbed >= this.capacity) {
      this.isDepleted = true
      this.scene.tweens.add({
        targets: this, alpha: 0, scaleY: 0, duration: 280, ease: 'Power2In',
        onComplete: () => this.destroy(),
      })
    }
  }
}

export class EngineerMonkey extends BaseTower {
  private track: Track
  private hasSentryGun: boolean = false
  private sentryDeployInterval: number = SENTRY_DEPLOY_INTERVAL
  private sentryDeployTimer: number = 0
  private sentries: SentryGun[] = []
  private cachedTrackPoints: Phaser.Math.Vector2[] | null = null
  private hasBloonTrap: boolean = false
  private hasXXXLTrap: boolean = false
  private trapDeployInterval: number = TRAP_DEPLOY_INTERVAL
  private trapDeployTimer: number = 0
  private traps: BloonTrap[] = []

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager,
    track: Track
  ) {
    super(scene, x, y, getTowerConfig('engineer_monkey')!, bloonManager, projectileManager)
    this.track = track

    this.body.setVisible(false)

    const g = this.customGfx
    const TAN   = 0xCD853F
    const TAND  = 0x7A4010
    const TANL  = 0xE8A860
    const HELM  = 0xFFCC00
    const HELMD = 0xCC8800
    const METAL = 0x888888
    const DARK  = 0x333333
    const GEAR  = 0x666666

    // Overalls body (dark blue bib)
    g.fillStyle(0x2255AA)
    g.fillRoundedRect(-12, 0, 24, 18, 4)
    g.lineStyle(1.5, 0x113388)
    g.strokeRoundedRect(-12, 0, 24, 18, 4)

    // Overalls straps
    g.lineStyle(3, 0x2255AA)
    g.lineBetween(-6, 0, -8, -8)
    g.lineBetween(6, 0, 8, -8)

    // Pocket on overalls
    g.fillStyle(0x113388)
    g.fillRect(-2, 4, 8, 6)
    g.lineStyle(1, 0x113388)
    g.strokeRect(-2, 4, 8, 6)

    // Monkey head/face
    g.fillStyle(TAN)
    g.fillCircle(0, -8, 12)
    g.lineStyle(1.5, TAND)
    g.strokeCircle(0, -8, 12)

    // Ears
    g.fillStyle(TAN)
    g.fillCircle(-12, -8, 5)
    g.fillCircle(12, -8, 5)
    g.fillStyle(TANL)
    g.fillCircle(-12, -8, 2.5)
    g.fillCircle(12, -8, 2.5)

    // Eyes
    g.fillStyle(0x1A0800)
    g.fillCircle(-4, -10, 2.5)
    g.fillCircle(4, -10, 2.5)
    g.fillStyle(0xFFFFFF)
    g.fillCircle(-3.2, -10.8, 1)
    g.fillCircle(4.8, -10.8, 1)

    // Muzzle
    g.fillStyle(TANL)
    g.fillEllipse(0, -4, 10, 7)

    // Hard hat
    g.fillStyle(HELM)
    g.fillEllipse(0, -18, 26, 8)
    g.fillStyle(HELMD)
    g.fillRect(-10, -21, 20, 5)
    g.fillStyle(HELM)
    g.fillEllipse(0, -21, 22, 10)
    g.lineStyle(2, HELMD)
    g.strokeEllipse(0, -18, 26, 8)
    // Hat brim stripe
    g.fillStyle(DARK, 0.3)
    g.fillRect(-12, -20, 24, 2)
    // Hat badge
    g.fillStyle(METAL)
    g.fillRect(-3, -23, 6, 4)

    // Gear on body (decorative)
    g.lineStyle(2, GEAR)
    g.strokeCircle(6, 8, 5)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      const ix = 6 + Math.cos(a) * 5
      const iy = 8 + Math.sin(a) * 5
      const ox = 6 + Math.cos(a) * 7
      const oy = 8 + Math.sin(a) * 7
      g.lineStyle(2.5, GEAR)
      g.lineBetween(ix, iy, ox, oy)
    }
    g.fillStyle(GEAR)
    g.fillCircle(6, 8, 2)

    // Nailgun barrel
    this.barrel.setFillStyle(METAL)
    this.barrel.setStrokeStyle(1.5, DARK)
    this.barrel.setSize(20, 7)
    this.barrel.setPosition(13, 0)

    // Nail magazine below barrel
    const mag = scene.add.rectangle(8, 5, 12, 5, 0x444444)
    mag.setStrokeStyle(1, DARK)
    this.barrelPivot.add(mag)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: target.x, targetY: target.y,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0xCCAA66,
    })
  }

  override update(delta: number, time: number): void {
    super.update(delta, time)

    if (this.hasSentryGun) {
      this.sentryDeployTimer -= delta / 1000
      if (this.sentryDeployTimer <= 0) {
        this.deploySentry()
        this.sentryDeployTimer = this.sentryDeployInterval
      }
      for (const sentry of this.sentries) sentry.update(delta)
    }

    if (this.hasBloonTrap) {
      // Cull depleted or destroyed traps
      this.traps = this.traps.filter(t => !t.isDepleted && t.active)

      this.trapDeployTimer -= delta / 1000
      if (this.trapDeployTimer <= 0) {
        this.deployTrap()
        this.trapDeployTimer = this.trapDeployInterval
      }
      for (const trap of this.traps) trap.update()
    }
  }

  private getTrackPointsInRange(): Phaser.Math.Vector2[] {
    if (this.cachedTrackPoints) return this.cachedTrackPoints
    const points: Phaser.Math.Vector2[] = []
    for (let d = 0; d <= this.track.totalLength; d += TRACK_SAMPLE_STEP) {
      const pos = this.track.getPositionAt(d)
      if (Phaser.Math.Distance.Between(this.x, this.y, pos.x, pos.y) <= this.effectiveRange) {
        points.push(pos)
      }
    }
    this.cachedTrackPoints = points
    return points
  }

  private deploySentry(): void {
    const points = this.getTrackPointsInRange()
    if (points.length === 0) return

    const pos = points[Math.floor(Math.random() * points.length)]

    if (this.sentries.length >= SENTRY_MAX) {
      const oldest = this.sentries.shift()!
      // Fade out before destroying
      this.scene.tweens.add({
        targets: oldest,
        alpha: 0, scaleX: 0.5, scaleY: 0.5,
        duration: 200,
        ease: 'Power2In',
        onComplete: () => oldest.destroy(),
      })
    }

    const sentry = new SentryGun(this.scene, pos.x, pos.y, this.bloonManager, this.projectileManager)
    this.sentries.push(sentry)
  }

  private deployTrap(): void {
    const points = this.getTrackPointsInRange()
    if (points.length === 0) return

    if (this.traps.length >= TRAP_MAX) {
      const oldest = this.traps.shift()!
      this.scene.tweens.add({
        targets: oldest, alpha: 0, scaleX: 0.5, scaleY: 0.5, duration: 200, ease: 'Power2In',
        onComplete: () => oldest.destroy(),
      })
    }

    const pos = points[Math.floor(Math.random() * points.length)]
    const capacity = this.hasXXXLTrap ? TRAP_CAPACITY_XXXL : TRAP_CAPACITY_NORMAL
    const canAbsorbMoab = this.hasXXXLTrap
    const trap = new BloonTrap(this.scene, pos.x, pos.y, this.bloonManager, capacity, canAbsorbMoab)
    this.traps.push(trap)
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)

    if (effect.specialBehavior === 'sentry_gun') {
      this.hasSentryGun = true
      this.sentryDeployTimer = 0
    }

    if (path === 0 && effect.cooldownMultiplier) {
      this.sentryDeployInterval *= effect.cooldownMultiplier
    }

    if (effect.specialBehavior === 'sentry_champion') {
      for (const sentry of this.sentries) {
        sentry.damage += 2
        sentry.pierce += 3
      }
    }

    if (effect.specialBehavior === 'bloon_trap') {
      this.hasBloonTrap = true
      this.trapDeployTimer = 0
    }

    if (effect.specialBehavior === 'xxxl_trap') {
      this.hasXXXLTrap = true
    }
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let tan: number, tand: number, tanl: number, helm: number, helmd: number, metal: number, dark: number, gear: number, overalls: number, barrelCol: number

    if (t1 >= 3) {
      // Sentry Champion / Turbo / Ultraboost — military grey uniform
      tan = 0xA08060; tand = 0x604830; tanl = 0xC0A080; helm = 0x888888; helmd = 0x555555; metal = 0xAAAAAA; dark = 0x222222; gear = 0x888888; overalls = 0x404040; barrelCol = 0x666666
    } else if (t1 >= 1) {
      // Sentry Gun / Faster Engineering — slightly darker hard hat
      tan = 0xBB7840; tand = 0x703810; tanl = 0xD89860; helm = 0xDDDD00; helmd = 0xBB9900; metal = 0x999999; dark = 0x333333; gear = 0x777777; overalls = 0x224499; barrelCol = 0x777777
    } else if (t2 >= 3) {
      // Cleansing Foam / Overclock — electric cyan glowing
      tan = 0xB08860; tand = 0x705030; tanl = 0xD8A880; helm = 0x00CCFF; helmd = 0x0088CC; metal = 0x88DDFF; dark = 0x002244; gear = 0x44AADD; overalls = 0x003388; barrelCol = 0x0066AA
    } else if (t2 >= 1) {
      // Larger Service Area / Sprockets — blue accent
      tan = 0xBB8850; tand = 0x704020; tanl = 0xD8A870; helm = 0xFFCC00; helmd = 0xCC8800; metal = 0x8899BB; dark = 0x2233AA; gear = 0x5566AA; overalls = 0x1144BB; barrelCol = 0x5566AA
    } else if (t3 >= 2) {
      // Bloon Trap / XXXL Trap — earthy brown trap aesthetic
      tan = 0xB08050; tand = 0x683820; tanl = 0xD0A870; helm = 0xFFCC00; helmd = 0xCC8800; metal = 0xAA8866; dark = 0x3A2010; gear = 0x886644; overalls = 0x1A4A88; barrelCol = 0x885544
    } else if (t3 >= 1) {
      // Nails / Bigger Nails — same default look
      tan = 0xC07A3A; tand = 0x703810; tanl = 0xD89860; helm = 0xFFCC00; helmd = 0xCC8800; metal = 0x909090; dark = 0x333333; gear = 0x707070; overalls = 0x2255AA; barrelCol = 0x888888
    } else {
      tan = 0xCD853F; tand = 0x7A4010; tanl = 0xE8A860; helm = 0xFFCC00; helmd = 0xCC8800; metal = 0x888888; dark = 0x333333; gear = 0x666666; overalls = 0x2255AA; barrelCol = metal
    }

    const g = this.customGfx
    g.clear()

    g.fillStyle(overalls)
    g.fillRoundedRect(-12, 0, 24, 18, 4)
    g.lineStyle(1.5, this.darkenHex(overalls, 0.3))
    g.strokeRoundedRect(-12, 0, 24, 18, 4)

    g.lineStyle(3, overalls)
    g.lineBetween(-6, 0, -8, -8)
    g.lineBetween(6, 0, 8, -8)

    g.fillStyle(this.darkenHex(overalls, 0.3))
    g.fillRect(-2, 4, 8, 6)
    g.lineStyle(1, this.darkenHex(overalls, 0.3))
    g.strokeRect(-2, 4, 8, 6)

    g.fillStyle(tan)
    g.fillCircle(0, -8, 12)
    g.lineStyle(1.5, tand)
    g.strokeCircle(0, -8, 12)

    g.fillStyle(tan)
    g.fillCircle(-12, -8, 5)
    g.fillCircle(12, -8, 5)
    g.fillStyle(tanl)
    g.fillCircle(-12, -8, 2.5)
    g.fillCircle(12, -8, 2.5)

    g.fillStyle(0x1A0800)
    g.fillCircle(-4, -10, 2.5)
    g.fillCircle(4, -10, 2.5)
    g.fillStyle(0xFFFFFF)
    g.fillCircle(-3.2, -10.8, 1)
    g.fillCircle(4.8, -10.8, 1)

    g.fillStyle(tanl)
    g.fillEllipse(0, -4, 10, 7)

    g.fillStyle(helm)
    g.fillEllipse(0, -18, 26, 8)
    g.fillStyle(helmd)
    g.fillRect(-10, -21, 20, 5)
    g.fillStyle(helm)
    g.fillEllipse(0, -21, 22, 10)
    g.lineStyle(2, helmd)
    g.strokeEllipse(0, -18, 26, 8)
    g.fillStyle(dark, 0.3)
    g.fillRect(-12, -20, 24, 2)
    g.fillStyle(metal)
    g.fillRect(-3, -23, 6, 4)

    g.lineStyle(2, gear)
    g.strokeCircle(6, 8, 5)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      const ix = 6 + Math.cos(a) * 5
      const iy = 8 + Math.sin(a) * 5
      const ox = 6 + Math.cos(a) * 7
      const oy = 8 + Math.sin(a) * 7
      g.lineStyle(2.5, gear)
      g.lineBetween(ix, iy, ox, oy)
    }
    g.fillStyle(gear)
    g.fillCircle(6, 8, 2)

    // Cyan glow ring for overclock
    if (t2 >= 3) {
      g.lineStyle(2, 0x00CCFF, 0.5)
      g.strokeCircle(0, 0, 18)
    }

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1.5, dark)
    this.barrel.setSize(20, 7)
    this.barrel.setPosition(13, 0)
  }

  destroy(fromScene?: boolean): void {
    for (const sentry of this.sentries) sentry.destroy()
    this.sentries = []
    for (const trap of this.traps) trap.destroy()
    this.traps = []
    super.destroy(fromScene)
  }
}
