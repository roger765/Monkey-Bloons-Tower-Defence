import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { Track } from '../game/Track'
import { getTowerConfig } from '../data/towers'
import { DamageType } from '../types'
import { canHit } from '../game/DamageSystem'

const WALL    = 0x7A3E1E
const BRICK   = 0x5C2E10
const WIN_COL = 0xFFDD88
const CHIMNEY = 0x4A2010
const ROOF_C  = 0x3A1808
const DARK    = 0x1A0A00
const METAL   = 0x888844

const SPIKE_LIFETIME = 25  // seconds before an unused spike pile expires
const TRACK_SAMPLE_STEP = 10  // px interval for sampling track points

interface SpikePile {
  x: number
  y: number
  pierce: number
  damage: number
  damageType: DamageType
  hitBloons: Set<Bloon>
  lifetime: number
  gfx: Phaser.GameObjects.Graphics
}

export class SpikeFactory extends BaseTower {
  private track: Track
  private spikePiles: SpikePile[] = []
  private dropIndex: number = 0
  private cachedTrackPoints: Phaser.Math.Vector2[] = []
  private carpetMode: boolean = false
  private leftRoofPivot: Phaser.GameObjects.Container
  private rightRoofPivot: Phaser.GameObjects.Container
  private roofAnimating: boolean = false

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager,
    track: Track
  ) {
    super(scene, x, y, getTowerConfig('spike_factory')!, bloonManager, projectileManager)
    this.track = track

    this.body.setVisible(false)
    this.barrel.setVisible(false)
    this.barrelPivot.setVisible(false)

    const g = this.customGfx

    // Left chimney
    g.fillStyle(CHIMNEY)
    g.fillRect(-13, -22, 5, 14)
    g.fillStyle(DARK)
    g.fillRect(-14, -24, 7, 3)

    // Right chimney
    g.fillStyle(CHIMNEY)
    g.fillRect(8, -22, 5, 14)
    g.fillStyle(DARK)
    g.fillRect(7, -24, 7, 3)

    // Main building walls
    g.fillStyle(WALL)
    g.fillRect(-16, -10, 32, 26)

    // Brick mortar lines
    g.fillStyle(BRICK)
    for (let row = -6; row <= 14; row += 5) {
      g.fillRect(-16, row, 32, 1)
    }

    // Windows
    g.fillStyle(WIN_COL)
    g.fillRect(-12, -6, 7, 6)
    g.fillRect(5, -6, 7, 6)
    g.lineStyle(1, BRICK)
    g.strokeRect(-12, -6, 7, 6)
    g.strokeRect(5, -6, 7, 6)
    g.lineBetween(-8.5, -6, -8.5, 0)
    g.lineBetween(-12, -3, -5, -3)
    g.lineBetween(8.5, -6, 8.5, 0)
    g.lineBetween(5, -3, 12, -3)

    // Door
    g.fillStyle(DARK)
    g.fillRoundedRect(-4, 5, 8, 11, 2)

    // Roof base band
    g.fillStyle(CHIMNEY)
    g.fillRect(-16, -12, 32, 4)

    // Center opening slot
    g.fillStyle(DARK)
    g.fillRect(-4, -12, 8, 4)

    // Conveyor belt strip
    g.fillStyle(METAL)
    g.fillRect(-3, -9, 6, 1)

    // Animated roof panels
    this.leftRoofPivot = scene.add.container(0, -10)
    const leftPanel = scene.add.rectangle(-8, 0, 14, 4, ROOF_C)
    leftPanel.setStrokeStyle(1, DARK)
    this.leftRoofPivot.add(leftPanel)
    this.add(this.leftRoofPivot)

    this.rightRoofPivot = scene.add.container(0, -10)
    const rightPanel = scene.add.rectangle(8, 0, 14, 4, ROOF_C)
    rightPanel.setStrokeStyle(1, DARK)
    this.rightRoofPivot.add(rightPanel)
    this.add(this.rightRoofPivot)
  }

  // Full update override: no target needed, spikes are placed proactively
  override update(delta: number, time: number): void {
    this.cooldownTimer -= delta / 1000

    if (this.cooldownTimer <= 0) {
      const spawnPos = this.nextDropPosition()
      if (spawnPos) {
        this.dropSpikePile(spawnPos.x, spawnPos.y)
        this.showAttackAnimation()
        this.cooldownTimer = this.effectiveCooldown
      }
    }

    const dt = delta / 1000
    const bloons = this.bloonManager.getActiveBloons()

    for (let i = this.spikePiles.length - 1; i >= 0; i--) {
      const pile = this.spikePiles[i]
      pile.lifetime -= dt

      if (pile.lifetime <= 0) {
        this.removePile(i)
        continue
      }

      let consumed = false
      for (const bloon of bloons) {
        if (!bloon.active) continue
        if (pile.hitBloons.has(bloon)) continue

        const dist = Phaser.Math.Distance.Between(pile.x, pile.y, bloon.x, bloon.y)
        if (dist <= 14 + bloon.bloonRadius) {
          if (canHit(pile.damageType, bloon)) {
            bloon.takeDamage(pile.damage, pile.damageType, time)
            pile.pierce--
          }
          pile.hitBloons.add(bloon)

          // Remove spike immediately on hit (same frame, not next tick)
          if (pile.pierce <= 0) {
            consumed = true
            break
          }
        }
      }

      if (consumed) this.removePile(i)
    }
  }

  // Returns track points in range, cached on first call (tower never moves after placement).
  // In carpet mode the range check is skipped — every point on the full track is valid.
  private getTrackPointsInRange(): Phaser.Math.Vector2[] {
    if (this.cachedTrackPoints.length > 0) return this.cachedTrackPoints

    for (let d = 0; d <= this.track.totalLength; d += TRACK_SAMPLE_STEP) {
      const pos = this.track.getPositionAt(d)
      const inRange = this.carpetMode ||
        Phaser.Math.Distance.Between(this.x, this.y, pos.x, pos.y) <= this.effectiveRange
      if (inRange) this.cachedTrackPoints.push(pos)
    }
    return this.cachedTrackPoints
  }

  // Round-robin across all reachable track positions so spikes spread evenly
  private nextDropPosition(): Phaser.Math.Vector2 | null {
    const points = this.getTrackPointsInRange()
    if (points.length === 0) return null
    const pos = points[this.dropIndex % points.length]
    this.dropIndex++
    return pos
  }

  private dropSpikePile(x: number, y: number): void {
    const gfx = this.scene.add.graphics()
    gfx.setDepth(9)  // sits below bloons (depth 10)

    this.drawSpikeGraphic(gfx, x, y)

    this.spikePiles.push({
      x, y,
      pierce: this.effectivePierce,
      damage: this.effectiveDamage,
      damageType: this.effectiveDamageType,
      hitBloons: new Set(),
      lifetime: SPIKE_LIFETIME,
      gfx,
    })
  }

  private drawSpikeGraphic(gfx: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // 8-point star shape
    const SPIKES = 8
    const innerR = 4
    const outerR = 9

    gfx.fillStyle(METAL, 0.95)
    gfx.beginPath()
    for (let i = 0; i < SPIKES * 2; i++) {
      const angle = (i / (SPIKES * 2)) * Math.PI * 2 - Math.PI / 2
      const r = i % 2 === 0 ? outerR : innerR
      const px = x + Math.cos(angle) * r
      const py = y + Math.sin(angle) * r
      if (i === 0) gfx.moveTo(px, py)
      else gfx.lineTo(px, py)
    }
    gfx.closePath()
    gfx.fillPath()

    // Dark center dot
    gfx.fillStyle(DARK, 0.85)
    gfx.fillCircle(x, y, 2.5)
  }

  private removePile(index: number): void {
    const pile = this.spikePiles[index]
    // Fade out then destroy graphics
    this.scene.tweens.add({
      targets: pile.gfx,
      alpha: 0,
      duration: 150,
      onComplete: () => pile.gfx.destroy(),
    })
    this.spikePiles.splice(index, 1)
  }

  // Called by base class but not used — spike placement happens in update()
  attack(_target: Bloon, _allBloons: Bloon[], _time: number): void {}

  protected showAttackAnimation(): void {
    if (this.roofAnimating) return
    this.roofAnimating = true

    const OPEN_ANGLE = Math.PI * 0.55

    this.scene.tweens.add({
      targets: this.leftRoofPivot,
      rotation: -OPEN_ANGLE,
      duration: 90,
      ease: 'Power2Out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.leftRoofPivot,
          rotation: 0,
          duration: 140,
          delay: 80,
          ease: 'Power2In',
          onComplete: () => { this.roofAnimating = false },
        })
      },
    })

    this.scene.tweens.add({
      targets: this.rightRoofPivot,
      rotation: OPEN_ANGLE,
      duration: 90,
      ease: 'Power2Out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.rightRoofPivot,
          rotation: 0,
          duration: 140,
          delay: 80,
          ease: 'Power2In',
        })
      },
    })

    const flash = this.scene.add.arc(this.x, this.y - 10, 4, 0, 360, false, METAL, 0.95)
    flash.setDepth(30)
    this.scene.tweens.add({
      targets: flash,
      y: flash.y - 18,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 160,
      ease: 'Power2Out',
      onComplete: () => flash.destroy(),
    })
  }

  onRoundEnd(): void {
    // Clear all spike piles between rounds (matches BTD6 behaviour)
    for (let i = this.spikePiles.length - 1; i >= 0; i--) {
      this.removePile(i)
    }
  }

  destroy(fromScene?: boolean): void {
    for (const pile of this.spikePiles) {
      pile.gfx.destroy()
    }
    this.spikePiles = []
    super.destroy(fromScene)
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'carpet_of_spikes') {
      this.carpetMode = true
      this.cachedTrackPoints = []  // invalidate so next tick rebuilds with full track
    }
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let wall: number, brick: number, winCol: number, chimney: number, roofC: number, dark: number, metal: number

    if (t1 >= 3) {
      // Spiked Mines / Balls / Super Mines — dark rust-orange industrial
      wall = 0x8A3A1A; brick = 0x5A1A08; winCol = 0xFF8844; chimney = 0x481008; roofC = 0x300808; dark = 0x100000; metal = 0xAA4422
    } else if (t1 >= 1) {
      // White Hot / Bigger Stacks — slightly warmer
      wall = 0x8A4A2A; brick = 0x5A2A10; winCol = 0xFFCC88; chimney = 0x4A2010; roofC = 0x3A1808; dark = 0x1A0A00; metal = 0x9A8844
    } else if (t2 >= 3) {
      // Carpet / Viral Frost / Tack Zone — icy blue-white
      wall = 0x4A6888; brick = 0x2A3858; winCol = 0xAADDFF; chimney = 0x2A3858; roofC = 0x1A2840; dark = 0x080C18; metal = 0x88AACC
    } else if (t2 >= 1) {
      // Faster Production — slightly blue-grey industrial
      wall = 0x5A6878; brick = 0x303848; winCol = 0xCCDDEE; chimney = 0x303848; roofC = 0x202838; dark = 0x0A0C10; metal = 0x8898AA
    } else if (t3 >= 3) {
      // Deadly / Perma-Spike — deep dark iron
      wall = 0x3A3A3A; brick = 0x1A1A1A; winCol = 0xFFDD88; chimney = 0x202020; roofC = 0x141414; dark = 0x040404; metal = 0x808080
    } else if (t3 >= 1) {
      // Long Reach / Endless — slightly lighter
      wall = 0x8A4A22; brick = 0x5A2A10; winCol = 0xFFCC88; chimney = 0x4A2010; roofC = 0x3A1808; dark = 0x1A0A00; metal = 0x9A9044
    } else {
      wall = 0x7A3E1E; brick = 0x5C2E10; winCol = 0xFFDD88; chimney = 0x4A2010; roofC = 0x3A1808; dark = 0x1A0A00; metal = 0x888844
    }

    const g = this.customGfx
    g.clear()

    g.fillStyle(chimney)
    g.fillRect(-13, -22, 5, 14)
    g.fillStyle(dark)
    g.fillRect(-14, -24, 7, 3)

    g.fillStyle(chimney)
    g.fillRect(8, -22, 5, 14)
    g.fillStyle(dark)
    g.fillRect(7, -24, 7, 3)

    g.fillStyle(wall)
    g.fillRect(-16, -10, 32, 26)

    g.fillStyle(brick)
    for (let row = -6; row <= 14; row += 5) {
      g.fillRect(-16, row, 32, 1)
    }

    g.fillStyle(winCol)
    g.fillRect(-12, -6, 7, 6)
    g.fillRect(5, -6, 7, 6)
    g.lineStyle(1, brick)
    g.strokeRect(-12, -6, 7, 6)
    g.strokeRect(5, -6, 7, 6)
    g.lineBetween(-8.5, -6, -8.5, 0)
    g.lineBetween(-12, -3, -5, -3)
    g.lineBetween(8.5, -6, 8.5, 0)
    g.lineBetween(5, -3, 12, -3)

    g.fillStyle(dark)
    g.fillRoundedRect(-4, 5, 8, 11, 2)

    g.fillStyle(chimney)
    g.fillRect(-16, -12, 32, 4)

    g.fillStyle(dark)
    g.fillRect(-4, -12, 8, 4)

    g.fillStyle(metal)
    g.fillRect(-3, -9, 6, 1)

    // Recolour animated roof panels (we can't easily access them, just tint the wall band)
    if (t1 >= 3) {
      g.lineStyle(2, 0xFF4400, 0.5)
      g.strokeRect(-16, -12, 32, 4)
    } else if (t2 >= 3) {
      g.lineStyle(2, 0x44AAFF, 0.5)
      g.strokeRect(-16, -12, 32, 4)
    }
  }
}
