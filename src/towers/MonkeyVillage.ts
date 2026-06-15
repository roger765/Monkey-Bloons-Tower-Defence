import Phaser from 'phaser'
import { BaseTower } from './BaseTower'
import { Bloon, BloonManager } from '../game/BloonManager'
import { ProjectileManager } from '../game/ProjectileManager'
import { getTowerConfig } from '../data/towers'

export class MonkeyVillage extends BaseTower {
  constructor(
    scene: Phaser.Scene, x: number, y: number,
    bloonManager: BloonManager, projectileManager: ProjectileManager
  ) {
    super(scene, x, y, getTowerConfig('monkey_village')!, bloonManager, projectileManager)

    this.body.setVisible(false)
    this.barrel.setVisible(false)
    this.barrelPivot.setVisible(false)

    const g = this.customGfx
    const WALL  = 0xDEB887
    const WALLD = 0x8B6040
    const WALLL = 0xF5DEB3
    const ROOF  = 0x996633
    const ROOFD = 0x6B3A1E
    const THATCH = 0xC8922A
    const WOOD  = 0x7A5030
    const WIN   = 0x88BBDD
    const FLAG  = 0xCC2222
    const STONE = 0xAA9988

    // Stone foundation ring
    g.fillStyle(STONE)
    g.fillEllipse(0, 14, 36, 8)
    g.lineStyle(1.5, WALLD)
    g.strokeEllipse(0, 14, 36, 8)
    g.lineStyle(1, WALLD, 0.4)
    g.lineBetween(-14, 14, 14, 14)

    // Hut walls (circular)
    g.fillStyle(WALL)
    g.fillCircle(0, 4, 16)
    g.lineStyle(2, WALLD)
    g.strokeCircle(0, 4, 16)

    // Wall texture bands
    g.lineStyle(1, WALLD, 0.4)
    g.strokeCircle(0, 4, 12)
    g.strokeCircle(0, 4, 7)

    // Wall highlight
    g.fillStyle(WALLL, 0.35)
    g.fillEllipse(-4, -1, 10, 14)

    // Door
    g.fillStyle(WOOD)
    g.fillRoundedRect(-4, 7, 8, 10, 2)
    g.lineStyle(1.5, ROOFD)
    g.strokeRoundedRect(-4, 7, 8, 10, 2)
    // Door handle
    g.fillStyle(0xFFCC44)
    g.fillCircle(3, 12, 1.5)

    // Windows
    g.fillStyle(WIN)
    g.fillCircle(-10, 2, 4)
    g.fillCircle(10, 2, 4)
    g.lineStyle(1.5, WALLD)
    g.strokeCircle(-10, 2, 4)
    g.strokeCircle(10, 2, 4)
    // Window cross
    g.lineStyle(1, WALLD)
    g.lineBetween(-10, -2, -10, 6)
    g.lineBetween(-14, 2, -6, 2)
    g.lineBetween(10, -2, 10, 6)
    g.lineBetween(6, 2, 14, 2)

    // Thatched roof cone
    g.fillStyle(THATCH)
    g.fillTriangle(-18, -8, 18, -8, 0, -26)
    g.lineStyle(2, ROOFD)
    g.strokeTriangle(-18, -8, 18, -8, 0, -26)

    // Thatch texture lines
    g.lineStyle(1.5, ROOF, 0.6)
    g.lineBetween(-9, -8, -4, -26)
    g.lineBetween(0, -8, 0, -26)
    g.lineBetween(9, -8, 4, -26)
    g.lineBetween(-17, -8, -8, -20)
    g.lineBetween(17, -8, 8, -20)

    // Roof eave band
    g.fillStyle(ROOF)
    g.fillRect(-19, -10, 38, 4)
    g.lineStyle(1.5, ROOFD)
    g.strokeRect(-19, -10, 38, 4)

    // Flag pole
    g.lineStyle(2.5, WOOD)
    g.lineBetween(0, -26, 0, -36)

    // Flag
    g.fillStyle(FLAG)
    g.fillTriangle(0, -36, 12, -33, 0, -30)
    g.lineStyle(1, ROOFD)
    g.strokeTriangle(0, -36, 12, -33, 0, -30)
  }

  getVillageBuffs(): { speedMultiplier: number; damageBonus: number; pierceBonus: number } {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    // Path 1 → attack speed (lower cooldown multiplier = faster)
    const speedMults = [1.0, 0.95, 0.85, 0.80, 0.75, 0.65]
    // Path 2 → flat damage bonus
    const damageBonuses = [0, 1, 1, 2, 3, 5]
    // Path 3 → flat pierce bonus
    const pierceBonuses = [0, 1, 2, 3, 5, 8]

    return {
      speedMultiplier: speedMults[t1] ?? 1.0,
      damageBonus: damageBonuses[t2] ?? 0,
      pierceBonus: pierceBonuses[t3] ?? 0,
    }
  }

  update(delta: number, time: number): void {}

  attack(target: Bloon, allBloons: Bloon[], time: number): void {}

  protected applyUpgradeEffect(effect: any, path: 0 | 1 | 2): void {
    super.applyUpgradeEffect(effect, path)
  }

  protected updateVisuals(): void {
    const t1 = this.upgradeTiers[0]
    const t2 = this.upgradeTiers[1]
    const t3 = this.upgradeTiers[2]

    let wall: number, walld: number, walll: number, roof: number, roofd: number, thatch: number, wood: number, win: number, flag: number, stone: number

    if (t1 >= 3) {
      // Primary Training / Mentoring / Expertise — deep blue command post
      wall = 0x3A5A9A; walld = 0x1A2A5A; walll = 0x5A8ACC; roof = 0x2A3A7A; roofd = 0x0A1A4A; thatch = 0x4A6AA0; wood = 0x2A4A80; win = 0x88CCFF; flag = 0xFFDD00; stone = 0x7080A0
    } else if (t1 >= 1) {
      // Bigger Radius / Jungle Drums — medium blue
      wall = 0x7898C8; walld = 0x3A5880; walll = 0x9AB8E0; roof = 0x5068A8; roofd = 0x283870; thatch = 0x7090C0; wood = 0x4A6898; win = 0x99CCFF; flag = 0xFFCC00; stone = 0x8090A8
    } else if (t2 >= 3) {
      // Monkey Town / City / Monkeyopolis — gold commerce
      wall = 0xDDAA22; walld = 0x7A5808; walll = 0xFFDD66; roof = 0xBB8800; roofd = 0x6A4400; thatch = 0xCCAA30; wood = 0xAA8020; win = 0xFFEE88; flag = 0xCC2222; stone = 0xBBAA80
    } else if (t2 >= 1) {
      // Monkey Business / Commerce — warm amber
      wall = 0xCC9940; walld = 0x704A10; walll = 0xEEBB66; roof = 0xAA7820; roofd = 0x5A3A08; thatch = 0xBB9030; wood = 0x906A18; win = 0xFFDD88; flag = 0xCC2222; stone = 0xAA9878
    } else if (t3 >= 3) {
      // Call to Arms / Homeland Defense — bright red military
      wall = 0xCC3333; walld = 0x6A0A0A; walll = 0xEE6666; roof = 0x881111; roofd = 0x440404; thatch = 0xAA2222; wood = 0x882222; win = 0xFFCCCC; flag = 0xFFFFFF; stone = 0xAA8888
    } else if (t3 >= 1) {
      // Radar Scanner / Intel Bureau — teal radar theme
      wall = 0x4A8888; walld = 0x204444; walll = 0x70AAAA; roof = 0x2A6060; roofd = 0x0A3030; thatch = 0x508888; wood = 0x306060; win = 0x88DDDD; flag = 0xFF8800; stone = 0x709898
    } else {
      wall = 0xDEB887; walld = 0x8B6040; walll = 0xF5DEB3; roof = 0x996633; roofd = 0x6B3A1E; thatch = 0xC8922A; wood = 0x7A5030; win = 0x88BBDD; flag = 0xCC2222; stone = 0xAA9988
    }

    const g = this.customGfx
    g.clear()

    g.fillStyle(stone)
    g.fillEllipse(0, 14, 36, 8)
    g.lineStyle(1.5, walld)
    g.strokeEllipse(0, 14, 36, 8)
    g.lineStyle(1, walld, 0.4)
    g.lineBetween(-14, 14, 14, 14)

    g.fillStyle(wall)
    g.fillCircle(0, 4, 16)
    g.lineStyle(2, walld)
    g.strokeCircle(0, 4, 16)

    g.lineStyle(1, walld, 0.4)
    g.strokeCircle(0, 4, 12)
    g.strokeCircle(0, 4, 7)

    g.fillStyle(walll, 0.35)
    g.fillEllipse(-4, -1, 10, 14)

    g.fillStyle(wood)
    g.fillRoundedRect(-4, 7, 8, 10, 2)
    g.lineStyle(1.5, roofd)
    g.strokeRoundedRect(-4, 7, 8, 10, 2)
    g.fillStyle(0xFFCC44)
    g.fillCircle(3, 12, 1.5)

    g.fillStyle(win)
    g.fillCircle(-10, 2, 4)
    g.fillCircle(10, 2, 4)
    g.lineStyle(1.5, walld)
    g.strokeCircle(-10, 2, 4)
    g.strokeCircle(10, 2, 4)
    g.lineStyle(1, walld)
    g.lineBetween(-10, -2, -10, 6)
    g.lineBetween(-14, 2, -6, 2)
    g.lineBetween(10, -2, 10, 6)
    g.lineBetween(6, 2, 14, 2)

    g.fillStyle(thatch)
    g.fillTriangle(-18, -8, 18, -8, 0, -26)
    g.lineStyle(2, roofd)
    g.strokeTriangle(-18, -8, 18, -8, 0, -26)

    g.lineStyle(1.5, roof, 0.6)
    g.lineBetween(-9, -8, -4, -26)
    g.lineBetween(0, -8, 0, -26)
    g.lineBetween(9, -8, 4, -26)
    g.lineBetween(-17, -8, -8, -20)
    g.lineBetween(17, -8, 8, -20)

    g.fillStyle(roof)
    g.fillRect(-19, -10, 38, 4)
    g.lineStyle(1.5, roofd)
    g.strokeRect(-19, -10, 38, 4)

    g.lineStyle(2.5, wood)
    g.lineBetween(0, -26, 0, -36)

    g.fillStyle(flag)
    g.fillTriangle(0, -36, 12, -33, 0, -30)
    g.lineStyle(1, roofd)
    g.strokeTriangle(0, -36, 12, -33, 0, -30)
  }
}
