import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { DamageType } from '../types'
import { Track } from '../game/Track'

const PHOENIX_ORBIT_RADIUS = 110
const PHOENIX_FLY_SPEED    = 1.4   // radians/s
const PHOENIX_RANGE        = 200
const PHOENIX_COOLDOWN     = 0.75  // seconds between fire shots
const PHOENIX_DAMAGE       = 4
const PHOENIX_PIERCE       = 6
const PHOENIX_SPLASH       = 40
const PHOENIX_DURATION     = 15    // seconds active (Summon Phoenix)
const PHOENIX_RESPAWN_GAP  = 10   // seconds before it re-appears

const ZOMBIE_SPEED = 45
const ZOMBIE_DAMAGE_RADIUS = 14
const ZOMBIE_SPAWN_INTERVAL = 3.5
const ZOMBIE_MAX = 8

// ─── Phoenix ──────────────────────────────────────────────────
class Phoenix extends Phaser.GameObjects.Container {
  private bloonManager: BloonManager
  private projectileManager: ProjectileManager
  private flyAngle: number = 0
  private attackTimer: number = 0
  private lifeTimer: number   // Infinity = permanent
  isDone: boolean = false
  private trailTimer: number = 0
  private gfx: Phaser.GameObjects.Graphics
  private wingFlap: number = 0

  constructor(
    scene: Phaser.Scene,
    bloonManager: BloonManager,
    projectileManager: ProjectileManager,
    startAngle: number,
    duration: number
  ) {
    super(scene, 0, 0)
    this.bloonManager = bloonManager
    this.projectileManager = projectileManager
    this.flyAngle = startAngle
    this.lifeTimer = duration

    this.gfx = scene.add.graphics()
    this.add(this.gfx)
    this.drawPhoenix(0)

    scene.add.existing(this)
    this.setDepth(20)

    // Burst-in animation
    this.setScale(0)
    this.setAlpha(0)
    scene.tweens.add({
      targets: this,
      scaleX: 1.3, scaleY: 1.3, alpha: 1, duration: 300, ease: 'Back.Out',
      onComplete: () => scene.tweens.add({ targets: this, scaleX: 1, scaleY: 1, duration: 150 }),
    })
  }

  private drawPhoenix(wingPhase: number): void {
    const g = this.gfx
    g.clear()

    const flap = Math.sin(wingPhase) * 5

    // Left wing
    g.fillStyle(0xFF6600, 0.9)
    g.fillTriangle(-6, 0, -22, -10 - flap, -14, 8)
    g.fillStyle(0xFF9900, 0.7)
    g.fillTriangle(-6, 0, -18, -5 - flap, -10, 6)

    // Right wing
    g.fillStyle(0xFF6600, 0.9)
    g.fillTriangle(6, 0, 22, -10 - flap, 14, 8)
    g.fillStyle(0xFF9900, 0.7)
    g.fillTriangle(6, 0, 18, -5 - flap, 10, 6)

    // Tail feathers
    g.fillStyle(0xFF3300, 0.85)
    g.fillTriangle(-4, 6, 4, 6, 0, 18)
    g.fillStyle(0xFF8800, 0.7)
    g.fillTriangle(-2, 6, 2, 6, -5, 15)
    g.fillStyle(0xFF8800, 0.7)
    g.fillTriangle(-2, 6, 2, 6, 5, 15)

    // Body
    g.fillStyle(0xFFAA00)
    g.fillEllipse(0, 0, 14, 10)
    g.lineStyle(1.5, 0xFF4400)
    g.strokeEllipse(0, 0, 14, 10)

    // Head
    g.fillStyle(0xFFCC44)
    g.fillCircle(0, -7, 6)
    g.lineStyle(1, 0xFF6600)
    g.strokeCircle(0, -7, 6)

    // Crest feathers
    g.fillStyle(0xFF4400)
    g.fillTriangle(-3, -11, 0, -20, 3, -11)
    g.fillStyle(0xFF8800)
    g.fillTriangle(-1, -11, 2, -17, 4, -11)

    // Eye
    g.fillStyle(0x220000)
    g.fillCircle(2, -8, 2)
    g.fillStyle(0xFF4400, 0.8)
    g.fillCircle(2.5, -8.5, 0.8)

    // Inner glow aura
    g.fillStyle(0xFFFF88, 0.18)
    g.fillCircle(0, 0, 20)
  }

  update(delta: number, wizardX: number, wizardY: number): void {
    if (this.isDone) return

    // Life timer (skip decrement if infinite)
    if (this.lifeTimer !== Infinity) {
      this.lifeTimer -= delta / 1000
      if (this.lifeTimer <= 0) {
        this.expire()
        return
      }
    }

    // Orbit around the wizard
    this.flyAngle += PHOENIX_FLY_SPEED * (delta / 1000)
    const px = wizardX + Math.cos(this.flyAngle) * PHOENIX_ORBIT_RADIUS
    const py = wizardY + Math.sin(this.flyAngle) * PHOENIX_ORBIT_RADIUS
    this.setPosition(px, py)
    this.setRotation(this.flyAngle + Math.PI / 2)

    // Wing flap animation
    this.wingFlap += 6 * (delta / 1000)
    this.drawPhoenix(this.wingFlap)

    // Fire trail particles
    this.trailTimer += delta / 1000
    if (this.trailTimer >= 0.08) {
      this.trailTimer = 0
      this.spawnTrailParticle()
    }

    // Attack nearest bloon in range
    this.attackTimer -= delta / 1000
    if (this.attackTimer <= 0) {
      this.tryAttack()
      this.attackTimer = PHOENIX_COOLDOWN
    }
  }

  private spawnTrailParticle(): void {
    const colors = [0xFF6600, 0xFF9900, 0xFFCC00, 0xFF4400]
    const c = colors[Math.floor(Math.random() * colors.length)]
    const spark = this.scene.add.arc(
      this.x + (Math.random() - 0.5) * 12,
      this.y + (Math.random() - 0.5) * 12,
      2 + Math.random() * 3, 0, 360, false, c, 0.9
    )
    spark.setDepth(19)
    this.scene.tweens.add({
      targets: spark,
      scaleX: 0, scaleY: 0, alpha: 0,
      y: spark.y - 14 - Math.random() * 10,
      duration: 350 + Math.random() * 200,
      ease: 'Power2Out',
      onComplete: () => spark.destroy(),
    })
  }

  private tryAttack(): void {
    const bloons = this.bloonManager.getActiveBloons()
    let nearest: Bloon | null = null
    let nearestDist = PHOENIX_RANGE

    for (const bloon of bloons) {
      if (!bloon.active) continue
      const d = Phaser.Math.Distance.Between(this.x, this.y, bloon.x, bloon.y)
      if (d < nearestDist) { nearestDist = d; nearest = bloon }
    }

    if (!nearest) return

    const proj = this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: nearest.x, targetY: nearest.y,
      speed: 380,
      radius: 8,
      damage: PHOENIX_DAMAGE,
      pierce: PHOENIX_PIERCE,
      damageType: DamageType.Fire,
      color: 0xFF6600,
    })

    // AoE on arrival
    if (proj) {
      const pm   = this.projectileManager
      const tx   = nearest.x
      const ty   = nearest.y
      let hit    = false
      const orig = proj.update.bind(proj)
      proj.update = (dt: number, bl: Bloon[], t: number) => {
        if (!proj.active) return
        const d = Phaser.Math.Distance.Between(proj.x, proj.y, tx, ty)
        if (d < 14 && !hit) {
          hit = true
          pm.detonateAoE(proj.x, proj.y, PHOENIX_SPLASH, PHOENIX_DAMAGE, DamageType.Fire, bl, t)
          proj.deactivate()
          // Burst flash
          const flash = this.scene.add.arc(proj.x, proj.y, 14, 0, 360, false, 0xFF9900, 0.85)
          flash.setDepth(28)
          this.scene.tweens.add({
            targets: flash, scaleX: 2.5, scaleY: 2.5, alpha: 0, duration: 180, ease: 'Power2Out',
            onComplete: () => flash.destroy(),
          })
        } else if (!hit) orig(dt, bl, t)
      }
    }

    // Muzzle burst at phoenix position
    const muzzle = this.scene.add.arc(this.x, this.y, 6, 0, 360, false, 0xFFCC00, 0.9)
    muzzle.setDepth(28)
    this.scene.tweens.add({
      targets: muzzle, scaleX: 2, scaleY: 2, alpha: 0, duration: 120, ease: 'Power2Out',
      onComplete: () => muzzle.destroy(),
    })
  }

  expire(): void {
    this.isDone = true
    this.scene.tweens.add({
      targets: this, alpha: 0, scaleX: 2, scaleY: 0,
      duration: 400, ease: 'Power2In',
      onComplete: () => this.destroy(),
    })
  }
}

class ZombieBloon extends Phaser.GameObjects.Container {
  private bloonManager: BloonManager
  private track: Track
  distanceAlongTrack: number
  isDone: boolean = false
  private speed: number
  private hitBloons: Set<Bloon> = new Set()
  private gfx: Phaser.GameObjects.Graphics

  constructor(
    scene: Phaser.Scene,
    bloonManager: BloonManager,
    track: Track,
    startDistance: number,
    speed: number = ZOMBIE_SPEED
  ) {
    super(scene, 0, 0)
    this.bloonManager = bloonManager
    this.track = track
    this.distanceAlongTrack = startDistance
    this.speed = speed

    this.gfx = scene.add.graphics()
    this.drawZombie()
    this.add(this.gfx)

    scene.add.existing(this)
    this.setDepth(15)

    // Summon pop-in
    this.setScale(0)
    this.setAlpha(0)
    scene.tweens.add({
      targets: this,
      scaleX: 1.3, scaleY: 1.3, alpha: 1,
      duration: 200, ease: 'Back.Out',
      onComplete: () => scene.tweens.add({
        targets: this, scaleX: 1, scaleY: 1, duration: 120,
      }),
    })
  }

  private drawZombie(): void {
    const g = this.gfx
    g.clear()

    // Sickly green body
    g.fillStyle(0x228833)
    g.fillCircle(0, 0, 10)
    g.lineStyle(2, 0x114422)
    g.strokeCircle(0, 0, 10)

    // Dark purple inner glow / shadow ring
    g.lineStyle(2, 0x551188, 0.6)
    g.strokeCircle(0, 0, 7)

    // Skull-like eye slits
    g.fillStyle(0x882211)
    g.fillRect(-5, -3, 3, 3)
    g.fillRect(2, -3, 3, 3)

    // Crack marks
    g.lineStyle(1, 0x114422, 0.8)
    g.lineBetween(-2, 1, 1, 5)
    g.lineBetween(3, -1, 5, 3)

    // Purple haze particles
    g.fillStyle(0x9933CC, 0.4)
    g.fillCircle(-8, -6, 3)
    g.fillCircle(9, -8, 2)
    g.fillCircle(-5, 9, 2.5)
  }

  update(delta: number): void {
    if (this.isDone) return

    this.distanceAlongTrack -= (this.speed * delta) / 1000

    if (this.distanceAlongTrack <= 0) {
      this.expire()
      return
    }

    const pos = this.track.getPositionAt(this.distanceAlongTrack)
    this.setPosition(pos.x, pos.y)
    this.setDepth(15 + this.distanceAlongTrack * 0.001)

    // Pop bloons in proximity (once per bloon per pass)
    const bloons = this.bloonManager.getActiveBloons()
    for (const bloon of bloons) {
      if (!bloon.active) continue
      if (this.hitBloons.has(bloon)) continue
      const dist = Phaser.Math.Distance.Between(this.x, this.y, bloon.x, bloon.y)
      if (dist <= ZOMBIE_DAMAGE_RADIUS) {
        bloon.takeDamage(1, DamageType.Normal, 0)
        this.hitBloons.add(bloon)
        // Clear the hit set after 500ms so the zombie can hit again if bloon is still alive
        this.scene.time.delayedCall(500, () => this.hitBloons.delete(bloon))
        // Quick flash
        this.scene.tweens.add({
          targets: this, scaleX: 1.2, scaleY: 0.85, duration: 60, yoyo: true,
        })
      }
    }
  }

  private expire(): void {
    this.isDone = true
    this.scene.tweens.add({
      targets: this, alpha: 0, scaleX: 1.5, scaleY: 0,
      duration: 250, ease: 'Power2In',
      onComplete: () => this.destroy(),
    })
  }
}

export class WizardMonkey extends BaseTower {
  private firesFireball: boolean = false
  private hasPrinceOfDarkness: boolean = false
  private zombieSpawnTimer: number = 0
  private zombies: ZombieBloon[] = []
  private track: Track | null = null
  private hasSummonPhoenix: boolean = false
  private hasWizardLordPhoenix: boolean = false
  private phoenix: Phoenix | null = null
  private phoenixRespawnTimer: number = 0

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager,
    track?: Track
  ) {
    super(scene, x, y, getTowerConfig('wizard_monkey')!, bloonManager, projectileManager)
    this.track = track ?? null

    this.body.setVisible(false)

    const g = this.customGfx
    const ROBE  = 0x7A50C0
    const ROBED = 0x4A2880
    const ROBEL = 0xAA80F0
    const HAT   = 0x5A38A8
    const GOLD  = 0xFFCC22
    const STAR  = 0xFFEE88
    const SKIN  = 0xD4B080

    // Robe body (wide circle base)
    g.fillStyle(ROBE)
    g.fillCircle(0, 4, 16)
    g.lineStyle(2, ROBED)
    g.strokeCircle(0, 4, 16)

    // Robe front crease
    g.lineStyle(1.5, ROBED)
    g.lineBetween(0, -8, 0, 18)
    // Star pattern on robe
    g.fillStyle(GOLD, 0.7)
    g.fillCircle(-6, 6, 2)
    g.fillCircle(6, 6, 2)
    g.fillCircle(0, 12, 2)

    // Robe highlight
    g.fillStyle(ROBEL, 0.3)
    g.fillEllipse(-4, -2, 10, 14)

    // Head (skin)
    g.fillStyle(SKIN)
    g.fillCircle(0, -6, 9)
    g.lineStyle(1.5, ROBED)
    g.strokeCircle(0, -6, 9)

    // Eyes
    g.fillStyle(0x2A1060)
    g.fillCircle(-3, -7, 2.2)
    g.fillCircle(3, -7, 2.2)
    g.fillStyle(0xFFFFFF)
    g.fillCircle(-2.2, -7.8, 0.9)
    g.fillCircle(3.8, -7.8, 0.9)

    // Wizard hat (pointy triangle)
    g.fillStyle(HAT)
    g.fillTriangle(-10, -12, 10, -12, 0, -30)
    g.lineStyle(1.5, ROBED)
    g.strokeTriangle(-10, -12, 10, -12, 0, -30)

    // Hat brim
    g.fillStyle(ROBED)
    g.fillRect(-12, -15, 24, 5)
    g.lineStyle(1, ROBED)
    g.strokeRect(-12, -15, 24, 5)

    // Hat star
    g.fillStyle(GOLD)
    g.fillCircle(0, -22, 3)

    // Floating stars around hat
    g.fillStyle(STAR, 0.8)
    g.fillCircle(-14, -18, 2)
    g.fillCircle(14, -20, 1.5)
    g.fillCircle(-12, -8, 1.5)

    // Wand barrel (thin and mystical)
    this.barrel.setFillStyle(0x8B6020)
    this.barrel.setStrokeStyle(1, ROBED)
    this.barrel.setSize(22, 4)
    this.barrel.setPosition(13, 0)

    // Wand tip orb
    const wand_orb = scene.add.arc(24, 0, 4, 0, 360, false, 0xCC88FF)
    wand_orb.setStrokeStyle(1, GOLD)
    this.barrelPivot.add(wand_orb)
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
      color: 0xCC88FF,
    })

    if (this.firesFireball) {
      const proj = this.projectileManager.launch({
        x: this.x, y: this.y,
        targetX: target.x, targetY: target.y,
        speed: this.effectiveProjectileSpeed * 0.7,
        radius: 9, damage: this.effectiveDamage + 1, pierce: 1,
        damageType: DamageType.Fire, color: 0xFF6600,
      })
      if (proj) {
        const origUpdate = proj.update.bind(proj)
        const pm = this.projectileManager
        const dmg = this.effectiveDamage + 1
        let detonated = false
        proj.update = (delta: number, bloons: Bloon[], t: number) => {
          if (!proj.active) return
          const dist = Phaser.Math.Distance.Between(proj.x, proj.y, target.x, target.y)
          if (dist < 12 && !detonated) {
            detonated = true
            pm.detonateAoE(proj.x, proj.y, 30, dmg, DamageType.Fire, bloons, t)
            proj.deactivate()
          } else if (!detonated) origUpdate(delta, bloons, t)
        }
      }
    }
  }

  override update(delta: number, time: number): void {
    super.update(delta, time)

    // Phoenix logic
    if (this.hasSummonPhoenix || this.hasWizardLordPhoenix) {
      if (this.phoenix && !this.phoenix.isDone) {
        this.phoenix.update(delta, this.x, this.y)
      } else {
        // Phoenix expired or not yet created
        if (this.hasWizardLordPhoenix) {
          // Permanent — re-spawn immediately
          this.spawnPhoenix(Infinity)
        } else {
          // Summon Phoenix: wait for respawn gap then re-summon
          this.phoenixRespawnTimer -= delta / 1000
          if (this.phoenixRespawnTimer <= 0) {
            this.spawnPhoenix(PHOENIX_DURATION)
            this.phoenixRespawnTimer = PHOENIX_DURATION + PHOENIX_RESPAWN_GAP
          }
        }
      }
    }

    // Zombie bloon logic
    if (this.hasPrinceOfDarkness && this.track) {
      this.zombies = this.zombies.filter(z => !z.isDone && z.active)
      this.zombieSpawnTimer -= delta / 1000
      if (this.zombieSpawnTimer <= 0) {
        this.spawnZombie()
        this.zombieSpawnTimer = ZOMBIE_SPAWN_INTERVAL
      }
      for (const zombie of this.zombies) zombie.update(delta)
    }
  }

  private spawnPhoenix(duration: number): void {
    if (this.phoenix && !this.phoenix.isDone) {
      this.phoenix.expire()
    }
    const startAngle = Math.random() * Math.PI * 2
    this.phoenix = new Phoenix(
      this.scene, this.bloonManager, this.projectileManager,
      startAngle, duration
    )
  }

  private spawnZombie(): void {
    if (!this.track) return

    // Find track points within this tower's range
    const points: number[] = []
    for (let d = 20; d <= this.track.totalLength - 10; d += 12) {
      const pos = this.track.getPositionAt(d)
      if (Phaser.Math.Distance.Between(this.x, this.y, pos.x, pos.y) <= this.effectiveRange) {
        points.push(d)
      }
    }
    if (points.length === 0) return

    // Remove oldest zombie if at cap
    if (this.zombies.length >= ZOMBIE_MAX) {
      const oldest = this.zombies.shift()!
      oldest.isDone = true
    }

    const startDist = points[Math.floor(Math.random() * points.length)]
    const zombie = new ZombieBloon(this.scene, this.bloonManager, this.track, startDist)
    this.zombies.push(zombie)
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'fireball') this.firesFireball = true
    if (effect.specialBehavior === 'summon_phoenix') {
      this.hasSummonPhoenix = true
      this.phoenixRespawnTimer = 0  // spawn immediately
    }
    if (effect.specialBehavior === 'wizard_lord_phoenix') {
      this.hasWizardLordPhoenix = true
      // Expire temporary phoenix and let update() re-spawn a permanent one
      if (this.phoenix && !this.phoenix.isDone) this.phoenix.expire()
      this.phoenix = null
    }
    if (effect.specialBehavior === 'prince_of_darkness') {
      this.hasPrinceOfDarkness = true
      this.zombieSpawnTimer = 0
    }
  }

  destroy(fromScene?: boolean): void {
    if (this.phoenix && !this.phoenix.isDone) this.phoenix.expire()
    this.phoenix = null
    for (const z of this.zombies) z.destroy()
    this.zombies = []
    super.destroy(fromScene)
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let robe: number, robed: number, robel: number, hat: number, gold: number, skin: number, barrelCol: number

    if (t1 >= 4) {
      // Arcane Spike / Archmage — deep indigo with gold
      robe = 0x2A1060; robed = 0x100830; robel = 0x6040C0; hat = 0x180848; gold = 0xFFCC22; skin = 0xC8A070; barrelCol = 0x5A3000
    } else if (t1 >= 2) {
      // Arcane Blast / Mastery — bright electric purple
      robe = 0x6030B0; robed = 0x301860; robel = 0x9060E0; hat = 0x4820A0; gold = 0xFFCC22; skin = 0xD0A878; barrelCol = 0x6A3A00
    } else if (t2 >= 3) {
      // Dragon's Breath / Phoenix — fiery crimson-orange
      robe = 0xAA2800; robed = 0x5A0E00; robel = 0xFF6622; hat = 0x881800; gold = 0xFF8800; skin = 0xD0A878; barrelCol = 0x882200
    } else if (t2 >= 1) {
      // Fireball / Wall of Fire — warm orange-red
      robe = 0xCC4400; robed = 0x6A1800; robel = 0xFF8844; hat = 0xAA2800; gold = 0xFFAA00; skin = 0xD0A878; barrelCol = 0x7A2800
    } else if (t3 >= 4) {
      // Prince of Darkness — near-black with sickly purple
      robe = 0x100818; robed = 0x040406; robel = 0x4A2060; hat = 0x080410; gold = 0x8844CC; skin = 0xB08868; barrelCol = 0x221040
    } else if (t3 >= 1) {
      // Lightning / Shimmer — electric yellow-white
      robe = 0x5050A8; robed = 0x282858; robel = 0x9090E8; hat = 0x383880; gold = 0xFFEE44; skin = 0xD0A878; barrelCol = 0x706020
    } else {
      robe = 0x7A50C0; robed = 0x4A2880; robel = 0xAA80F0; hat = 0x5A38A8; gold = 0xFFCC22; skin = 0xD4B080; barrelCol = 0x8B6020
    }

    const g = this.customGfx
    g.clear()

    g.fillStyle(robe)
    g.fillCircle(0, 4, 16)
    g.lineStyle(2, robed)
    g.strokeCircle(0, 4, 16)

    g.lineStyle(1.5, robed)
    g.lineBetween(0, -8, 0, 18)
    g.fillStyle(gold, 0.7)
    g.fillCircle(-6, 6, 2)
    g.fillCircle(6, 6, 2)
    g.fillCircle(0, 12, 2)

    g.fillStyle(robel, 0.3)
    g.fillEllipse(-4, -2, 10, 14)

    g.fillStyle(skin)
    g.fillCircle(0, -6, 9)
    g.lineStyle(1.5, robed)
    g.strokeCircle(0, -6, 9)

    const eyeCol = t3 >= 4 ? 0xFF2200 : (t1 >= 4 ? 0x8844FF : 0x2A1060)
    g.fillStyle(eyeCol)
    g.fillCircle(-3, -7, 2.2)
    g.fillCircle(3, -7, 2.2)
    g.fillStyle(0xFFFFFF)
    g.fillCircle(-2.2, -7.8, 0.9)
    g.fillCircle(3.8, -7.8, 0.9)

    g.fillStyle(hat)
    g.fillTriangle(-10, -12, 10, -12, 0, -30)
    g.lineStyle(1.5, robed)
    g.strokeTriangle(-10, -12, 10, -12, 0, -30)

    g.fillStyle(robed)
    g.fillRect(-12, -15, 24, 5)
    g.lineStyle(1, robed)
    g.strokeRect(-12, -15, 24, 5)

    g.fillStyle(gold)
    g.fillCircle(0, -22, 3)

    const starCol = t2 >= 3 ? 0xFF8800 : (t3 >= 4 ? 0x8844CC : 0xFFEE88)
    g.fillStyle(starCol, 0.8)
    g.fillCircle(-14, -18, 2)
    g.fillCircle(14, -20, 1.5)
    g.fillCircle(-12, -8, 1.5)

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1, robed)
    this.barrel.setSize(22, 4)
    this.barrel.setPosition(13, 0)
  }
}
