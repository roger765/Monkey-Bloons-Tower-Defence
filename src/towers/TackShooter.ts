import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class TackShooter extends BaseTower {
  private tackCount: number = 8

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('tack_shooter')!, bloonManager, projectileManager)

    this.body.setVisible(false)
    this.barrel.setVisible(false)
    this.barrelPivot.setVisible(false)

    const g = this.customGfx
    const SILVER = 0x909090
    const DARK   = 0x484848
    const HUB    = 0x606060
    const TIP    = 0xCCCCCC

    // 8 spike points radiating outward
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const tipX  = Math.cos(angle) * 19
      const tipY  = Math.sin(angle) * 19
      const lx    = Math.cos(angle - 0.32) * 9
      const ly    = Math.sin(angle - 0.32) * 9
      const rx    = Math.cos(angle + 0.32) * 9
      const ry    = Math.sin(angle + 0.32) * 9
      g.fillStyle(SILVER)
      g.fillTriangle(tipX, tipY, lx, ly, rx, ry)
      // Tip highlight
      g.fillStyle(TIP)
      g.fillTriangle(tipX, tipY, (tipX + lx) / 2, (tipY + ly) / 2, (tipX + rx) / 2, (tipY + ry) / 2)
    }

    // Outer ring
    g.lineStyle(2, DARK)
    g.strokeCircle(0, 0, 9)

    // Center hub
    g.fillStyle(HUB)
    g.fillCircle(0, 0, 9)
    g.lineStyle(1.5, DARK)
    g.strokeCircle(0, 0, 9)

    // Hub cross bolts
    g.lineStyle(1.5, DARK)
    g.lineBetween(-6, 0, 6, 0)
    g.lineBetween(0, -6, 0, 6)

    // Center rivet
    g.fillStyle(0xAAAAAA)
    g.fillCircle(0, 0, 3)
    g.fillStyle(TIP)
    g.fillCircle(-0.8, -0.8, 1.2)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const step = (Math.PI * 2) / this.tackCount
    for (let i = 0; i < this.tackCount; i++) {
      const angle = i * step
      this.projectileManager.launch({
        x: this.x, y: this.y,
        targetX: this.x + Math.cos(angle) * 500,
        targetY: this.y + Math.sin(angle) * 500,
        speed: this.effectiveProjectileSpeed,
        radius: this.config.projectileRadius,
        damage: this.effectiveDamage,
        pierce: this.effectivePierce,
        damageType: this.effectiveDamageType,
        color: 0xAAAAAA,
        shape: 'tack',
        isStraightLine: true,
        angle,
      })
    }
  }

  update(delta: number, time: number): void {
    this.cooldownTimer -= delta / 1000
    if (this.cooldownTimer <= 0) {
      const bloons = this.bloonManager.getActiveBloons()
      const inRange = bloons.some(b => {
        if (!b.active) return false
        return Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y) <= this.effectiveRange
      })
      if (inRange) {
        const dummy = bloons.find(b => b.active)!
        this.attack(dummy, bloons, time)
        this.showAttackAnimation()
        this.cooldownTimer = this.effectiveCooldown
      }
    }
  }

  protected showAttackAnimation(): void {
    const ring = this.scene.add.arc(this.x, this.y, 10, 0, 360, true, 0xAAAAAA, 0)
    ring.setStrokeStyle(2, 0xCCCCCC, 0.75)
    ring.setDepth(30)
    this.scene.tweens.add({
      targets: ring,
      scaleX: 2.8, scaleY: 2.8, alpha: 0,
      duration: 160, ease: 'Power2Out',
      onComplete: () => ring.destroy(),
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'more_tacks') this.tackCount = 12
    if (effect.specialBehavior === 'even_more_tacks') this.tackCount = 16
    if (effect.specialBehavior === 'tack_sprayer') this.tackCount = Math.max(this.tackCount, 12)
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let silver: number, dark: number, hub: number, tip: number

    if (t1 >= 4) {
      // Inferno Ring — deep crimson and char-black
      silver = 0xCC2200; dark = 0x550000; hub = 0x880000; tip = 0xFF6622
    } else if (t1 >= 2) {
      // Hot Shots — orange-red fire tones
      silver = 0xDD5500; dark = 0x662200; hub = 0xAA3300; tip = 0xFF9944
    } else if (t2 >= 4) {
      // Overdrive / Super Maelstrom — electric chrome
      silver = 0xCCDDFF; dark = 0x3344AA; hub = 0x7788CC; tip = 0xEEFFFF
    } else if (t2 >= 2) {
      // Tack Sprayer — bright polished silver
      silver = 0xC0C8D8; dark = 0x404858; hub = 0x808898; tip = 0xE8F0FF
    } else if (t3 >= 2) {
      // Blade Maelstrom / Silver Wind — steel blue
      silver = 0x7090B8; dark = 0x304060; hub = 0x506080; tip = 0xA0C0E0
    } else if (t3 >= 1) {
      // Blade Shooter — light steel
      silver = 0x9AAABB; dark = 0x405060; hub = 0x607080; tip = 0xCCDDEE
    } else {
      silver = 0x909090; dark = 0x484848; hub = 0x606060; tip = 0xCCCCCC
    }

    const g = this.customGfx
    g.clear()

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const tipX  = Math.cos(angle) * 19
      const tipY  = Math.sin(angle) * 19
      const lx    = Math.cos(angle - 0.32) * 9
      const ly    = Math.sin(angle - 0.32) * 9
      const rx    = Math.cos(angle + 0.32) * 9
      const ry    = Math.sin(angle + 0.32) * 9
      g.fillStyle(silver)
      g.fillTriangle(tipX, tipY, lx, ly, rx, ry)
      g.fillStyle(tip)
      g.fillTriangle(tipX, tipY, (tipX + lx) / 2, (tipY + ly) / 2, (tipX + rx) / 2, (tipY + ry) / 2)
    }

    g.lineStyle(2, dark)
    g.strokeCircle(0, 0, 9)

    g.fillStyle(hub)
    g.fillCircle(0, 0, 9)
    g.lineStyle(1.5, dark)
    g.strokeCircle(0, 0, 9)

    g.lineStyle(1.5, dark)
    g.lineBetween(-6, 0, 6, 0)
    g.lineBetween(0, -6, 0, 6)

    g.fillStyle(tip)
    g.fillCircle(0, 0, 3)
    g.fillStyle(0xFFFFFF)
    g.fillCircle(-0.8, -0.8, 1.2)

    // Glow ring for fire/inferno
    if (t1 >= 3) {
      g.lineStyle(2, 0xFF4400, 0.6)
      g.strokeCircle(0, 0, 21)
    }
  }
}
