import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'
import { DamageType } from '../types'
import { BLOON_CONFIGS } from '../data/bloons'

export class BombShooter extends BaseTower {
  private blastRadius: number = 40
  private causesStun: boolean = false
  private moabDamageBonus: number = 0

  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('bomb_shooter')!, bloonManager, projectileManager)

    this.body.setVisible(false)

    const g = this.customGfx
    const STONE  = 0x585858
    const DARK   = 0x303030
    const LIGHT  = 0x787878
    const METAL  = 0x484848
    const FUSE   = 0xCC8822

    // Stone base platform
    g.fillStyle(STONE)
    g.fillRoundedRect(-18, 6, 36, 12, 4)
    g.lineStyle(2, DARK)
    g.strokeRoundedRect(-18, 6, 36, 12, 4)
    // Platform detail lines
    g.lineStyle(1, LIGHT)
    g.lineBetween(-12, 10, -12, 16)
    g.lineBetween(0, 10, 0, 16)
    g.lineBetween(12, 10, 12, 16)

    // Cannon body (cylinder)
    g.fillStyle(METAL)
    g.fillRoundedRect(-14, -8, 28, 16, 6)
    g.lineStyle(2, DARK)
    g.strokeRoundedRect(-14, -8, 28, 16, 6)
    // Cannon bands
    g.lineStyle(3, DARK)
    g.lineBetween(-8, -8, -8, 8)
    g.lineBetween(2, -8, 2, 8)

    // Cannon muzzle ring
    g.fillStyle(DARK)
    g.fillCircle(16, 0, 8)
    g.fillStyle(0x222222)
    g.fillCircle(16, 0, 5)

    // Fuse
    g.lineStyle(2, FUSE)
    g.lineBetween(-2, -8, 4, -14)
    g.lineBetween(4, -14, 2, -18)
    // Fuse spark
    g.fillStyle(0xFFDD00)
    g.fillCircle(2, -18, 3)
    g.fillStyle(0xFF6600)
    g.fillCircle(2, -18, 1.5)

    // Wheels
    g.fillStyle(DARK)
    g.fillCircle(-10, 14, 5)
    g.fillCircle(10, 14, 5)
    g.lineStyle(2, 0x888888)
    g.strokeCircle(-10, 14, 5)
    g.strokeCircle(10, 14, 5)
    g.lineBetween(-10, 9, -10, 19)
    g.lineBetween(-15, 14, -5, 14)
    g.lineBetween(10, 9, 10, 19)
    g.lineBetween(5, 14, 15, 14)

    // Barrel is the cannon bore — hide it (cannon is fully drawn in customGfx)
    this.barrel.setVisible(false)
    this.barrelPivot.setVisible(false)
  }

  attack(target: Bloon, allBloons: Bloon[], time: number): void {
    const proj = this.projectileManager.launch({
      x: this.x, y: this.y,
      targetX: target.x, targetY: target.y,
      speed: this.effectiveProjectileSpeed,
      radius: 8, damage: this.effectiveDamage, pierce: 1,
      damageType: this.effectiveDamageType, color: 0x333333, shape: 'bomb',
    })

    if (proj) {
      const origUpdate = proj.update.bind(proj)
      const blastR = this.blastRadius
      const dmg = this.effectiveDamage
      const dtype = this.effectiveDamageType
      const pm = this.projectileManager
      const stun = this.causesStun
      const moabBonus = this.moabDamageBonus
      let detonated = false

      proj.update = (delta: number, bloons: Bloon[], t: number) => {
        if (!proj.active) return
        const dist = Phaser.Math.Distance.Between(proj.x, proj.y, target.x, target.y)
        if (dist < 10 && !detonated) {
          detonated = true
          pm.detonateAoE(proj.x, proj.y, blastR, dmg, dtype, bloons, t, stun, 1.5)
          if (moabBonus > 0) {
            for (const b of bloons) {
              if (!b.active) continue
              const bd = Phaser.Math.Distance.Between(proj.x, proj.y, b.x, b.y)
              if (bd <= blastR + 30 && BLOON_CONFIGS[b.bloonType].isMoabClass)
                b.takeDamage(moabBonus, dtype, t)
            }
          }
          proj.deactivate()
        } else if (!detonated) {
          origUpdate(delta, bloons, t)
        }
      }
    }
  }

  protected showAttackAnimation(): void {
    const angle = this.barrelPivot.rotation
    const flash = this.scene.add.arc(
      this.x + Math.cos(angle) * 20,
      this.y + Math.sin(angle) * 20,
      8, 0, 360, false, 0xFF8800, 0.9
    )
    flash.setDepth(30)
    this.scene.tweens.add({
      targets: flash,
      scaleX: 3, scaleY: 3, alpha: 0,
      duration: 120, ease: 'Power2Out',
      onComplete: () => flash.destroy(),
    })
  }

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
    if (effect.specialBehavior === 'bigger_blast') this.blastRadius += 10
    if (effect.specialBehavior === 'stun_blast') this.causesStun = true
    if (effect.specialBehavior === 'moab_mauler') this.moabDamageBonus += 10
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let stone: number, dark: number, light: number, metal: number, fuse: number, spark: number

    if (t1 >= 4) {
      // Bloon Crush — obsidian black siege cannon
      stone = 0x1A1A1A; dark = 0x0A0A0A; light = 0x333333; metal = 0x111111; fuse = 0xFF4400; spark = 0xFF8800
    } else if (t1 >= 2) {
      // Heavy Bombs / Stun — iron-dark heavy artillery
      stone = 0x383838; dark = 0x181818; light = 0x505050; metal = 0x282828; fuse = 0xDD6600; spark = 0xFFAA00
    } else if (t2 >= 4) {
      // MOAB Assassin / Biggest One — sleek black + orange
      stone = 0x282828; dark = 0x101010; light = 0x404040; metal = 0x202020; fuse = 0xFF6600; spark = 0xFFCC00
    } else if (t2 >= 2) {
      // Missile Launcher / MOAB Mauler — silver steel
      stone = 0x707070; dark = 0x383838; light = 0x909090; metal = 0x585858; fuse = 0xCC6600; spark = 0xFFDD00
    } else if (t3 >= 2) {
      // Cluster Bombs — olive military green
      stone = 0x4A5A2A; dark = 0x2A3010; light = 0x6A7A3A; metal = 0x3A4A1A; fuse = 0xAACC00; spark = 0xDDFF00
    } else if (t3 >= 1) {
      // Frag Bombs — muted olive
      stone = 0x5A6A3A; dark = 0x303818; light = 0x7A8A4A; metal = 0x4A5A2A; fuse = 0xBBCC00; spark = 0xEEFF44
    } else {
      // Default grey cannon
      stone = 0x585858; dark = 0x303030; light = 0x787878; metal = 0x484848; fuse = 0xCC8822; spark = 0xFFDD00
    }

    const g = this.customGfx
    g.clear()

    g.fillStyle(stone)
    g.fillRoundedRect(-18, 6, 36, 12, 4)
    g.lineStyle(2, dark)
    g.strokeRoundedRect(-18, 6, 36, 12, 4)
    g.lineStyle(1, light)
    g.lineBetween(-12, 10, -12, 16)
    g.lineBetween(0, 10, 0, 16)
    g.lineBetween(12, 10, 12, 16)

    g.fillStyle(metal)
    g.fillRoundedRect(-14, -8, 28, 16, 6)
    g.lineStyle(2, dark)
    g.strokeRoundedRect(-14, -8, 28, 16, 6)
    g.lineStyle(3, dark)
    g.lineBetween(-8, -8, -8, 8)
    g.lineBetween(2, -8, 2, 8)

    g.fillStyle(dark)
    g.fillCircle(16, 0, 8)
    g.fillStyle(0x111111)
    g.fillCircle(16, 0, 5)

    g.lineStyle(2, fuse)
    g.lineBetween(-2, -8, 4, -14)
    g.lineBetween(4, -14, 2, -18)
    g.fillStyle(spark)
    g.fillCircle(2, -18, 3)
    g.fillStyle(fuse)
    g.fillCircle(2, -18, 1.5)

    g.fillStyle(dark)
    g.fillCircle(-10, 14, 5)
    g.fillCircle(10, 14, 5)
    g.lineStyle(2, light)
    g.strokeCircle(-10, 14, 5)
    g.strokeCircle(10, 14, 5)
    g.lineBetween(-10, 9, -10, 19)
    g.lineBetween(-15, 14, -5, 14)
    g.lineBetween(10, 9, 10, 19)
    g.lineBetween(5, 14, 15, 14)

    // Heavy armour plate for high P1
    if (t1 >= 3) {
      g.fillStyle(0x222222, 0.7)
      g.fillRect(-14, -4, 28, 8)
      g.lineStyle(1, dark)
      g.strokeRect(-14, -4, 28, 8)
    }
  }
}
