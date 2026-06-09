import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class SuperMonkey extends BaseTower {
  private dualBarrel: boolean = false
  private secondBarrel!: Phaser.GameObjects.Rectangle

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('super_monkey')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const GOLD  = 0xFFD700
    const GOLDD = 0xCC7700
    const GOLDB = 0xFFEE55
    const CAPE  = 0xCC2222
    const CORE  = 0xFFFFAA
    const SKIN  = 0xF0C060

    // Cape/wings flaring out
    g.fillStyle(CAPE)
    g.fillTriangle(-8, 4, -22, 18, -4, 18)
    g.fillTriangle(8, 4, 22, 18, 4, 18)
    g.lineStyle(1.5, 0x881111)
    g.strokeTriangle(-8, 4, -22, 18, -4, 18)
    g.strokeTriangle(8, 4, 22, 18, 4, 18)

    // Star burst rays (8 directions)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const ox = Math.cos(a) * 10
      const oy = Math.sin(a) * 10
      const tx = Math.cos(a) * 20
      const ty = Math.sin(a) * 20
      const lx = Math.cos(a - 0.25) * 9
      const ly = Math.sin(a - 0.25) * 9
      const rx = Math.cos(a + 0.25) * 9
      const ry = Math.sin(a + 0.25) * 9
      g.fillStyle(i % 2 === 0 ? GOLD : GOLDB)
      g.fillTriangle(tx, ty, lx, ly, rx, ry)
    }

    // Body circle
    g.fillStyle(GOLD)
    g.fillCircle(0, 0, 14)
    g.lineStyle(2.5, GOLDD)
    g.strokeCircle(0, 0, 14)

    // Chest symbol (S-like shape suggestion — just a bright inner ring)
    g.lineStyle(2, GOLDD)
    g.strokeCircle(0, 0, 8)
    g.fillStyle(GOLDB, 0.6)
    g.fillCircle(0, 0, 8)

    // Energy core glow
    g.fillStyle(CORE)
    g.fillCircle(0, 0, 4)
    g.fillStyle(0xFFFFFF, 0.8)
    g.fillCircle(-1, -1, 2)

    // Energy beam barrel
    this.barrel.setFillStyle(GOLDD)
    this.barrel.setStrokeStyle(1.5, 0xAA6600)
    this.barrel.setSize(18, 5)
    this.barrel.setPosition(12, 0)

    // Secondary barrel (slightly below for visual thickness)
    const b2 = scene.add.rectangle(12, 0, 16, 3, GOLDB)
    this.barrelPivot.add(b2)
    this.secondBarrel = b2

    // Star burst rays slowly orbit
    scene.tweens.add({
      targets: this.customGfx,
      rotation: Math.PI * 2,
      duration: 6000,
      repeat: -1,
      ease: 'Linear',
    })
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const angle = Math.atan2(target.y - this.y, target.x - this.x)
    this.fireBeam(angle)
    if (this.dualBarrel) {
      this.fireBeam(angle + 0.15)
      this.fireBeam(angle - 0.15)
    }
  }

  private fireBeam(angle: number): void {
    this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: this.x + Math.cos(angle) * 500,
      targetY: this.y + Math.sin(angle) * 500,
      speed: this.effectiveProjectileSpeed,
      radius: this.config.projectileRadius,
      damage: this.effectiveDamage,
      pierce: this.effectivePierce,
      damageType: this.effectiveDamageType,
      color: 0xFFEE00,
    })
  }

  protected showAttackAnimation(): void {
    const pulse = this.scene.add.arc(this.x, this.y, 20, 0, 360, false, 0xFFD700, 0.3)
    pulse.setDepth(20)
    this.scene.tweens.add({
      targets: pulse,
      scaleX: 1.8, scaleY: 1.8, alpha: 0,
      duration: 80, ease: 'Power2Out',
      onComplete: () => pulse.destroy(),
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'robo_monkey') this.dualBarrel = true
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    // Determine visual theme — path 1 (sun) > path 3 (dark) > path 2 (tech)
    let bodyColor: number, bodyDark: number, bodyLight: number
    let capeColor: number = 0xCC2222, showCape: boolean
    let rayColor1: number, rayColor2: number
    let coreColor: number, coreGlow: number
    let barrelColor: number
    let outerGlow: boolean = false

    if (t1 >= 5) {
      // True Sun God — blinding white-gold divinity
      bodyColor = 0xFFFFDD; bodyDark = 0xCCCC00; bodyLight = 0xFFFFFF
      showCape = false
      rayColor1 = 0xFFFFFF; rayColor2 = 0xFFEE00
      coreColor = 0xFFFFFF; coreGlow = 0xFFFFFF
      barrelColor = 0xFFEE00; outerGlow = true
    } else if (t1 >= 4) {
      // Sun Temple — deep molten gold
      bodyColor = 0xCC8800; bodyDark = 0x774400; bodyLight = 0xFFBB00
      showCape = false
      rayColor1 = 0xFF8800; rayColor2 = 0xFFCC00
      coreColor = 0xFF8800; coreGlow = 0xFFDD00
      barrelColor = 0xCC7700; outerGlow = true
    } else if (t1 >= 3) {
      // Sun Avatar — blazing orange solar
      bodyColor = 0xFF6600; bodyDark = 0xAA3300; bodyLight = 0xFF9933
      showCape = false
      rayColor1 = 0xFFAA00; rayColor2 = 0xFF6600
      coreColor = 0xFF6600; coreGlow = 0xFFCC00
      barrelColor = 0xFF4400
    } else if (t1 >= 2) {
      // Plasma Vision — gold body with magenta core
      bodyColor = 0xFFD700; bodyDark = 0xCC7700; bodyLight = 0xFFEE55
      showCape = true; capeColor = 0xCC2222
      rayColor1 = 0xFF00FF; rayColor2 = 0xFFDD00
      coreColor = 0xFF00FF; coreGlow = 0xFF88FF
      barrelColor = 0xCC00CC
    } else if (t1 >= 1) {
      // Laser Vision — gold body with cyan core
      bodyColor = 0xFFD700; bodyDark = 0xCC7700; bodyLight = 0xFFEE55
      showCape = true; capeColor = 0xCC2222
      rayColor1 = 0xFFD700; rayColor2 = 0xFFEE55
      coreColor = 0x00FFFF; coreGlow = 0x88FFFF
      barrelColor = 0x00BBBB
    } else if (t3 >= 5) {
      // The Big Enchilada — black void
      bodyColor = 0x0A0010; bodyDark = 0x000000; bodyLight = 0x220033
      showCape = false
      rayColor1 = 0x440066; rayColor2 = 0x220033
      coreColor = 0x8800FF; coreGlow = 0xAA44FF
      barrelColor = 0x440088; outerGlow = true
    } else if (t3 >= 4) {
      // Legend of the Night — near-black with purple aura
      bodyColor = 0x1A0033; bodyDark = 0x0A0011; bodyLight = 0x440066
      showCape = true; capeColor = 0x330055
      rayColor1 = 0x6600AA; rayColor2 = 0x440066
      coreColor = 0xAA00FF; coreGlow = 0xCC44FF
      barrelColor = 0x660099; outerGlow = true
    } else if (t3 >= 3) {
      // Dark Champion — dark purple
      bodyColor = 0x330044; bodyDark = 0x1A0022; bodyLight = 0x660088
      showCape = true; capeColor = 0x440055
      rayColor1 = 0x8800CC; rayColor2 = 0x550088
      coreColor = 0xCC00FF; coreGlow = 0xEE66FF
      barrelColor = 0x660099
    } else if (t2 >= 5) {
      // The Anti-Bloon — dark navy devastator
      bodyColor = 0x001A44; bodyDark = 0x000A22; bodyLight = 0x003388
      showCape = false
      rayColor1 = 0x0044AA; rayColor2 = 0x0022FF
      coreColor = 0x0088FF; coreGlow = 0x44CCFF
      barrelColor = 0x003399; outerGlow = true
    } else if (t2 >= 4) {
      // Tech Terror — blue neon tech
      bodyColor = 0x001166; bodyDark = 0x000A33; bodyLight = 0x0033CC
      showCape = false
      rayColor1 = 0x0055FF; rayColor2 = 0x88AAFF
      coreColor = 0x0088FF; coreGlow = 0x66CCFF
      barrelColor = 0x0044BB
    } else if (t2 >= 2) {
      // Robo Monkey — silver chrome
      bodyColor = 0x888888; bodyDark = 0x444444; bodyLight = 0xCCCCCC
      showCape = false
      rayColor1 = 0xAAAAAA; rayColor2 = 0xCCCCCC
      coreColor = 0x00CCFF; coreGlow = 0x88EEFF
      barrelColor = 0x666666
    } else {
      // Default gold with red cape
      bodyColor = 0xFFD700; bodyDark = 0xCC7700; bodyLight = 0xFFEE55
      showCape = true; capeColor = 0xCC2222
      rayColor1 = 0xFFD700; rayColor2 = 0xFFEE55
      coreColor = 0xFFFFAA; coreGlow = 0xFFFFFF
      barrelColor = 0xCC7700
    }

    const g = this.customGfx
    g.clear()

    // Cape wings
    if (showCape) {
      g.fillStyle(capeColor)
      g.fillTriangle(-8, 4, -22, 18, -4, 18)
      g.fillTriangle(8, 4, 22, 18, 4, 18)
      g.lineStyle(1.5, this.darkenHex(capeColor, 0.3))
      g.strokeTriangle(-8, 4, -22, 18, -4, 18)
      g.strokeTriangle(8, 4, 22, 18, 4, 18)
    }

    // Star burst rays — wider for tier 4+
    const rayRadius = t1 >= 4 ? 23 : 20
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const tx = Math.cos(a) * rayRadius; const ty = Math.sin(a) * rayRadius
      const lx = Math.cos(a - 0.25) * 9;  const ly = Math.sin(a - 0.25) * 9
      const rx = Math.cos(a + 0.25) * 9;  const ry = Math.sin(a + 0.25) * 9
      g.fillStyle(i % 2 === 0 ? rayColor1 : rayColor2)
      g.fillTriangle(tx, ty, lx, ly, rx, ry)
    }

    // Body circle
    g.fillStyle(bodyColor)
    g.fillCircle(0, 0, 14)
    g.lineStyle(2.5, bodyDark)
    g.strokeCircle(0, 0, 14)

    // Inner ring
    g.lineStyle(2, bodyDark)
    g.strokeCircle(0, 0, 8)
    g.fillStyle(bodyLight, 0.6)
    g.fillCircle(0, 0, 8)

    // Energy core
    g.fillStyle(coreColor)
    g.fillCircle(0, 0, 4)
    g.fillStyle(coreGlow, 0.8)
    g.fillCircle(-1, -1, 2)

    // Outer glow halo for powerful tiers
    if (outerGlow) {
      g.lineStyle(3, coreColor, 0.45)
      g.strokeCircle(0, 0, 19)
    }

    this.barrel.setFillStyle(barrelColor)
    this.barrel.setStrokeStyle(1.5, bodyDark)
    this.secondBarrel.setFillStyle(bodyLight)
  }
}
