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

  // Returns track points in range, cached on first call (tower never moves after placement)
  private getTrackPointsInRange(): Phaser.Math.Vector2[] {
    if (this.cachedTrackPoints.length > 0) return this.cachedTrackPoints

    for (let d = 0; d <= this.track.totalLength; d += TRACK_SAMPLE_STEP) {
      const pos = this.track.getPositionAt(d)
      if (Phaser.Math.Distance.Between(this.x, this.y, pos.x, pos.y) <= this.effectiveRange) {
        this.cachedTrackPoints.push(pos)
      }
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
  }
}
