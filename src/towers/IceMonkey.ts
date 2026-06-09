import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class IceMonkey extends BaseTower {
  private freezeDuration: number = 2.5
  private canFreezeBlackWhite: boolean = false

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('ice_monkey')!, bloonManager, projectileManager)

    this.body.setVisible(false)
    this.barrel.setVisible(false)
    this.barrelPivot.setVisible(false)

    const g = this.customGfx
    const ICE   = 0x80D0FF
    const ICEL  = 0xC0EEFF
    const ICED  = 0x4090CC
    const WHITE = 0xEEF8FF
    const CORE  = 0xD0EEFF

    // Outer hex crystal
    const outerPts = []
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6
      outerPts.push({ x: Math.cos(a) * 18, y: Math.sin(a) * 18 })
    }
    g.fillStyle(ICE)
    g.fillPoints(outerPts, true)
    g.lineStyle(2, ICED)
    g.strokePoints(outerPts, true)

    // Facet shading — upper-left faces lighter
    g.fillStyle(ICEL, 0.55)
    g.fillTriangle(outerPts[5].x, outerPts[5].y, outerPts[0].x, outerPts[0].y, 0, 0)
    g.fillTriangle(outerPts[0].x, outerPts[0].y, outerPts[1].x, outerPts[1].y, 0, 0)

    // Sparkle lines
    g.lineStyle(1.5, WHITE, 0.8)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      g.lineBetween(0, 0, Math.cos(a) * 14, Math.sin(a) * 14)
    }

    // Inner smaller hex
    const innerPts = []
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6
      innerPts.push({ x: Math.cos(a) * 8, y: Math.sin(a) * 8 })
    }
    g.fillStyle(CORE, 0.9)
    g.fillPoints(innerPts, true)
    g.lineStyle(1.5, WHITE)
    g.strokePoints(innerPts, true)

    // Core sparkle
    g.fillStyle(WHITE)
    g.fillCircle(0, 0, 3)

    // Hex crystal slowly rotates
    scene.tweens.add({
      targets: this.customGfx,
      rotation: Math.PI * 2,
      duration: 10000,
      repeat: -1,
      ease: 'Linear',
    })
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    this.projectileManager.freezeAoE(
      this.x, this.y, this.effectiveRange,
      allBloons, this.freezeDuration, this.canFreezeBlackWhite
    )
  }

  protected showAttackAnimation(): void {
    // Three concentric ice rings expanding outward
    for (let i = 0; i < 3; i++) {
      const ring = this.scene.add.arc(this.x, this.y, 12, 0, 360, false, 0x80D0FF, 0)
      ring.setStrokeStyle(2, i === 1 ? 0xFFFFFF : 0xAAEEFF, 0.85 - i * 0.15)
      ring.setDepth(28)
      this.scene.tweens.add({
        targets: ring,
        scaleX: 3.5 - i * 0.4, scaleY: 3.5 - i * 0.4,
        alpha: 0,
        duration: 420 + i * 70,
        delay: i * 70,
        ease: 'Power2Out',
        onComplete: () => ring.destroy(),
      })
    }
    // Brief core flash
    const core = this.scene.add.arc(this.x, this.y, 8, 0, 360, false, 0xCCEEFF, 0.9)
    core.setDepth(30)
    this.scene.tweens.add({
      targets: core,
      scaleX: 2.2, scaleY: 2.2, alpha: 0,
      duration: 200,
      ease: 'Power3Out',
      onComplete: () => core.destroy(),
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'cold_snap') this.canFreezeBlackWhite = true
    if (effect.specialBehavior === 'super_freeze') this.canFreezeBlackWhite = true
    if (effect.specialBehavior === 'refreeze') this.freezeDuration += 1.0
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let iceMain: number, iceLight: number, iceDark: number, core: number, white: number

    if (t1 >= 5) {
      // Absolute Zero — deep navy with white core
      iceMain = 0x0022AA; iceLight = 0x4466DD; iceDark = 0x001166; core = 0xCCEEFF; white = 0xFFFFFF
    } else if (t1 >= 4) {
      // Ice Storm — vivid electric blue
      iceMain = 0x0088DD; iceLight = 0x44BBFF; iceDark = 0x004488; core = 0xCCF0FF; white = 0xFFFFFF
    } else if (t1 >= 2) {
      // Snap Freeze / Cold Snap — richer blue
      iceMain = 0x44AADD; iceLight = 0x88CCEE; iceDark = 0x2266AA; core = 0xDDEEFF; white = 0xF0FFFF
    } else if (t3 >= 5) {
      // Snowstorm — icy purple-white
      iceMain = 0x8899CC; iceLight = 0xBBCCEE; iceDark = 0x445588; core = 0xEEEEFF; white = 0xFFFFFF
    } else if (t3 >= 4) {
      // Arctic Wind — pale lavender ice
      iceMain = 0x99AACC; iceLight = 0xCCDDEE; iceDark = 0x556688; core = 0xEEEEFF; white = 0xFFFFFF
    } else if (t3 >= 2) {
      // Super Freeze / Refreeze — slightly violet-tinted ice
      iceMain = 0x88BBDD; iceLight = 0xBBDDEE; iceDark = 0x4488AA; core = 0xDDEEFF; white = 0xEEF8FF
    } else if (t2 >= 4) {
      // Cryo Cannon / Icicle Impale — dark teal ice
      iceMain = 0x226688; iceLight = 0x44AAAA; iceDark = 0x114455; core = 0x88CCCC; white = 0xCCEEEE
    } else {
      // Default light blue
      iceMain = 0x80D0FF; iceLight = 0xC0EEFF; iceDark = 0x4090CC; core = 0xD0EEFF; white = 0xEEF8FF
    }

    const g = this.customGfx
    g.clear()

    // Outer hex
    const outerPts = []
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6
      outerPts.push({ x: Math.cos(a) * 18, y: Math.sin(a) * 18 })
    }
    g.fillStyle(iceMain)
    g.fillPoints(outerPts, true)
    g.lineStyle(2, iceDark)
    g.strokePoints(outerPts, true)

    // Facet shading
    g.fillStyle(iceLight, 0.55)
    g.fillTriangle(outerPts[5].x, outerPts[5].y, outerPts[0].x, outerPts[0].y, 0, 0)
    g.fillTriangle(outerPts[0].x, outerPts[0].y, outerPts[1].x, outerPts[1].y, 0, 0)

    // Sparkle lines
    g.lineStyle(1.5, white, 0.8)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      g.lineBetween(0, 0, Math.cos(a) * 14, Math.sin(a) * 14)
    }

    // Inner hex
    const innerPts = []
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6
      innerPts.push({ x: Math.cos(a) * 8, y: Math.sin(a) * 8 })
    }
    g.fillStyle(core, 0.9)
    g.fillPoints(innerPts, true)
    g.lineStyle(1.5, white)
    g.strokePoints(innerPts, true)

    // Core sparkle
    g.fillStyle(white)
    g.fillCircle(0, 0, 3)

    // Glow ring for powerful tiers
    if (t1 >= 4 || t3 >= 4) {
      g.lineStyle(2.5, iceMain, 0.5)
      g.strokeCircle(0, 0, 21)
    }
  }
}
