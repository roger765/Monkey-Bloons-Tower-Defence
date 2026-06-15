import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class BeastHandler extends BaseTower {
  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('beast_handler')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const CAGE  = 0x5A7A5A
    const CAGED = 0x2A4A2A
    const CAGL  = 0x88BB88
    const WOOD  = 0x8B5E30
    const WOODD = 0x5A3010
    const PAW   = 0x3A6A3A
    const CLAW  = 0xCCDDCC
    const DARK  = 0x1A2A1A

    // Cage base platform
    g.fillStyle(WOODD)
    g.fillRoundedRect(-16, 10, 32, 8, 3)
    g.lineStyle(1.5, DARK)
    g.strokeRoundedRect(-16, 10, 32, 8, 3)

    // Cage floor
    g.lineStyle(2, WOODD)
    g.lineBetween(-12, 12, 12, 12)
    g.lineBetween(-8, 10, -8, 18)
    g.lineBetween(0, 10, 0, 18)
    g.lineBetween(8, 10, 8, 18)

    // Cage back wall
    g.fillStyle(CAGED, 0.4)
    g.fillRect(-14, -10, 28, 22)

    // Cage top bar
    g.fillStyle(CAGE)
    g.fillRect(-16, -12, 32, 4)
    g.lineStyle(1.5, CAGED)
    g.strokeRect(-16, -12, 32, 4)

    // Cage vertical bars (main feature)
    const barCount = 6
    g.lineStyle(3, CAGE)
    for (let i = 0; i <= barCount; i++) {
      const bx = -14 + (i / barCount) * 28
      g.lineBetween(bx, -12, bx, 10)
    }
    // Bar highlights
    g.lineStyle(1, CAGL, 0.5)
    for (let i = 0; i <= barCount; i++) {
      const bx = -14 + (i / barCount) * 28 - 0.8
      g.lineBetween(bx, -12, bx, 10)
    }

    // Cage door on right side (slightly offset bars)
    g.fillStyle(CAGE, 0.3)
    g.fillRect(6, -10, 8, 20)
    g.lineStyle(2, CAGED)
    g.lineBetween(6, -10, 6, 10)
    g.lineBetween(14, -10, 14, 10)
    // Door latch
    g.fillStyle(0xFFCC44)
    g.fillCircle(14, 2, 3)
    g.lineStyle(1.5, 0xCC9900)
    g.strokeCircle(14, 2, 3)

    // Corner posts
    g.fillStyle(WOOD)
    g.fillRect(-16, -14, 4, 26)
    g.fillRect(12, -14, 4, 26)
    g.lineStyle(1, WOODD)
    g.strokeRect(-16, -14, 4, 26)
    g.strokeRect(12, -14, 4, 26)

    // Beast paw prints visible through bars
    g.fillStyle(PAW, 0.6)
    g.fillCircle(-4, 2, 4)
    g.fillStyle(PAW, 0.5)
    g.fillCircle(-8, -4, 2.5)
    g.fillCircle(0, -5, 2.5)
    g.fillCircle(-11, 0, 2)
    g.fillCircle(3, 1, 2)

    // Claw marks on bars
    g.lineStyle(1.5, CLAW, 0.6)
    g.lineBetween(-2, -8, 0, -2)
    g.lineBetween(0, -8, 2, -2)
    g.lineBetween(-4, -8, -2, -2)

    // Handler's prod / control rod (barrel)
    this.barrel.setFillStyle(WOODD)
    this.barrel.setStrokeStyle(1.5, DARK)
    this.barrel.setSize(18, 5)
    this.barrel.setPosition(12, 0)

    // Prod tip (electric)
    const prodTip = scene.add.arc(22, 0, 4, 0, 360, false, 0x88FF44)
    prodTip.setStrokeStyle(1, 0x44CC00)
    this.barrelPivot.add(prodTip)
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
      color: 0xAADDAA,
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let cage: number, caged: number, cagl: number, woodt: number, woodd: number, paw: number, claw: number, dark: number, latch: number, barrelCol: number

    if (t1 >= 4) {
      // Elite Handler / Ultra Beast — heavy iron cage, battle-worn
      cage = 0x2A2A2A; caged = 0x101010; cagl = 0x484848; woodt = 0x3A3A3A; woodd = 0x181818; paw = 0x484848; claw = 0xEEEEEE; dark = 0x040404; latch = 0xFF8800; barrelCol = 0x1A1A1A
    } else if (t1 >= 1) {
      // Bigger Pets / Stronger / Aggressive — slightly darker/greener
      cage = 0x4A6A4A; caged = 0x203820; cagl = 0x6A9A6A; woodt = 0x7A5030; woodd = 0x4A2A10; paw = 0x2A5A2A; claw = 0xCCDDCC; dark = 0x0A1A0A; latch = 0xFFCC44; barrelCol = 0x3A2810
    } else if (t2 >= 3) {
      // Crouching Tiger / Giant Tiger — orange-amber tiger stripes
      cage = 0xAA6600; caged = 0x5A2800; cagl = 0xDD9944; woodt = 0x8A5020; woodd = 0x4A2008; paw = 0x884400; claw = 0xFFDD88; dark = 0x1A0800; latch = 0xFFEE44; barrelCol = 0x5A2800
    } else if (t2 >= 1) {
      // Piranha / Sauda Blade — warm amber
      cage = 0x8A7040; caged = 0x483808; cagl = 0xBBAA60; woodt = 0x7A5028; woodd = 0x3A2808; paw = 0x5A4820; claw = 0xDDCC88; dark = 0x100800; latch = 0xFFCC44; barrelCol = 0x3A2808
    } else if (t3 >= 3) {
      // Eagle / Condor — sky blue cage with feather tones
      cage = 0x4888AA; caged = 0x204A6A; cagl = 0x70AACE; woodt = 0x8A6840; woodd = 0x4A3818; paw = 0x305A7A; claw = 0xCCDDEE; dark = 0x0A1820; latch = 0xFFDD44; barrelCol = 0x3A5060
    } else if (t3 >= 1) {
      // Squirrel / Hawk — earthy brown tones
      cage = 0x7A8A7A; caged = 0x3A4A3A; cagl = 0xAABBAA; woodt = 0x8B6040; woodd = 0x5A3818; paw = 0x4A5A3A; claw = 0xBBCCBB; dark = 0x101810; latch = 0xFFCC44; barrelCol = 0x4A3810
    } else {
      cage = 0x5A7A5A; caged = 0x2A4A2A; cagl = 0x88BB88; woodt = 0x8B5E30; woodd = 0x5A3010; paw = 0x3A6A3A; claw = 0xCCDDCC; dark = 0x1A2A1A; latch = 0xFFCC44; barrelCol = woodd
    }

    const g = this.customGfx
    g.clear()

    g.fillStyle(woodd)
    g.fillRoundedRect(-16, 10, 32, 8, 3)
    g.lineStyle(1.5, dark)
    g.strokeRoundedRect(-16, 10, 32, 8, 3)

    g.lineStyle(2, woodd)
    g.lineBetween(-12, 12, 12, 12)
    g.lineBetween(-8, 10, -8, 18)
    g.lineBetween(0, 10, 0, 18)
    g.lineBetween(8, 10, 8, 18)

    g.fillStyle(caged, 0.4)
    g.fillRect(-14, -10, 28, 22)

    g.fillStyle(cage)
    g.fillRect(-16, -12, 32, 4)
    g.lineStyle(1.5, caged)
    g.strokeRect(-16, -12, 32, 4)

    const barCount = 6
    g.lineStyle(3, cage)
    for (let i = 0; i <= barCount; i++) {
      const bx = -14 + (i / barCount) * 28
      g.lineBetween(bx, -12, bx, 10)
    }
    g.lineStyle(1, cagl, 0.5)
    for (let i = 0; i <= barCount; i++) {
      const bx = -14 + (i / barCount) * 28 - 0.8
      g.lineBetween(bx, -12, bx, 10)
    }

    g.fillStyle(cage, 0.3)
    g.fillRect(6, -10, 8, 20)
    g.lineStyle(2, caged)
    g.lineBetween(6, -10, 6, 10)
    g.lineBetween(14, -10, 14, 10)
    g.fillStyle(latch)
    g.fillCircle(14, 2, 3)
    g.lineStyle(1.5, this.darkenHex(latch, 0.2))
    g.strokeCircle(14, 2, 3)

    g.fillStyle(woodt)
    g.fillRect(-16, -14, 4, 26)
    g.fillRect(12, -14, 4, 26)
    g.lineStyle(1, woodd)
    g.strokeRect(-16, -14, 4, 26)
    g.strokeRect(12, -14, 4, 26)

    g.fillStyle(paw, 0.6)
    g.fillCircle(-4, 2, 4)
    g.fillStyle(paw, 0.5)
    g.fillCircle(-8, -4, 2.5)
    g.fillCircle(0, -5, 2.5)
    g.fillCircle(-11, 0, 2)
    g.fillCircle(3, 1, 2)

    g.lineStyle(1.5, claw, 0.6)
    g.lineBetween(-2, -8, 0, -2)
    g.lineBetween(0, -8, 2, -2)
    g.lineBetween(-4, -8, -2, -2)

    this.barrel.setFillStyle(barrelCol)
    this.barrel.setStrokeStyle(1.5, dark)
    this.barrel.setSize(18, 5)
    this.barrel.setPosition(12, 0)
  }
}
