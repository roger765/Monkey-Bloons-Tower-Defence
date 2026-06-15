import Phaser from 'phaser'
import { TowerConfig } from '../types'
import { BaseTower } from '../towers/BaseTower'
import { DartMonkey } from '../towers/DartMonkey'
import { BoomerangMonkey } from '../towers/BoomerangMonkey'
import { BombShooter } from '../towers/BombShooter'
import { TackShooter } from '../towers/TackShooter'
import { IceMonkey } from '../towers/IceMonkey'
import { GlueGunner } from '../towers/GlueGunner'
import { SniperMonkey } from '../towers/SniperMonkey'
import { MonkeySub } from '../towers/MonkeySub'
import { MonkeyBuccaneer } from '../towers/MonkeyBuccaneer'
import { MonkeyAce } from '../towers/MonkeyAce'
import { HeliPilot } from '../towers/HeliPilot'
import { MortarMonkey } from '../towers/MortarMonkey'
import { DartlingGunner } from '../towers/DartlingGunner'
import { WizardMonkey } from '../towers/WizardMonkey'
import { SuperMonkey } from '../towers/SuperMonkey'
import { NinjaMonkey } from '../towers/NinjaMonkey'
import { Alchemist } from '../towers/Alchemist'
import { Druid } from '../towers/Druid'
import { BananaFarm } from '../towers/BananaFarm'
import { SpikeFactory } from '../towers/SpikeFactory'
import { MonkeyVillage } from '../towers/MonkeyVillage'
import { EngineerMonkey } from '../towers/EngineerMonkey'
import { BeastHandler } from '../towers/BeastHandler'
import { BloonManager } from './BloonManager'
import { ProjectileManager } from './ProjectileManager'
import { Track } from './Track'
import { gameState } from './GameState'
import { TOWER_CONFIGS } from '../data/towers'
import { HERO_CONFIGS } from '../data/heroes'
import { SavedTower } from './SaveManager'
import { HeroTower } from '../towers/HeroTower'
import { HUD_TOP_HEIGHT, HUD_BOTTOM_HEIGHT, GAME_HEIGHT } from '../constants'

export class TowerManager {
  private scene: Phaser.Scene
  private towers: BaseTower[] = []
  private bloonManager: BloonManager
  private projectileManager: ProjectileManager
  private track: Track
  private placementRing: Phaser.GameObjects.Arc | null = null
  private selectedTower: BaseTower | null = null
  private onTowerSelectedCallback: ((tower: BaseTower | null) => void) | null = null

  constructor(
    scene: Phaser.Scene,
    bloonManager: BloonManager,
    projectileManager: ProjectileManager,
    track: Track
  ) {
    this.scene = scene
    this.bloonManager = bloonManager
    this.projectileManager = projectileManager
    this.track = track

    // Placement ring (follows cursor during placement mode)
    this.placementRing = scene.add.arc(0, 0, 100, 0, 360, false, 0x00FF00, 0.15)
    this.placementRing.setStrokeStyle(2, 0x00FF00, 0.6)
    this.placementRing.setVisible(false)
    this.placementRing.setDepth(50)
  }

  onTowerSelected(callback: (tower: BaseTower | null) => void): void {
    this.onTowerSelectedCallback = callback
  }

  startPlacement(config: TowerConfig): void {
    gameState.placingTowerId = config.id
    if (this.placementRing) {
      this.placementRing.setRadius(config.range)
      this.placementRing.setVisible(true)
    }
    this.selectTower(null)
  }

  cancelPlacement(): void {
    gameState.placingTowerId = null
    if (this.placementRing) this.placementRing.setVisible(false)
  }

  updatePlacementRing(x: number, y: number): void {
    if (!gameState.placingTowerId || !this.placementRing) return
    this.placementRing.setPosition(x, y)
    const valid = this.isValidPlacement(x, y)
    this.placementRing.setFillStyle(valid ? 0x00FF00 : 0xFF0000, 0.15)
    this.placementRing.setStrokeStyle(2, valid ? 0x00FF00 : 0xFF0000, 0.6)
  }

  private isWaterTower(towerId: string | null): boolean {
    return towerId === 'monkey_sub' || towerId === 'monkey_buccaneer'
  }

  isValidPlacement(x: number, y: number): boolean {
    const onPond = this.track.isOnPond(x, y)
    const waterTower = this.isWaterTower(gameState.placingTowerId)
    // Water towers must be on water; land towers must not be on water
    if (waterTower && !onPond) return false
    if (!waterTower && onPond) return false
    // Not on track
    if (this.track.isOnTrack(x, y, 30)) return false
    // Not on HUD areas
    if (y < HUD_TOP_HEIGHT + 10) return false
    if (y > GAME_HEIGHT - HUD_BOTTOM_HEIGHT - 10) return false
    // Not overlapping another tower
    for (const tower of this.towers) {
      const dist = Phaser.Math.Distance.Between(x, y, tower.x, tower.y)
      if (dist < 34) return false
    }
    return true
  }

  placeTower(configId: string, x: number, y: number): BaseTower | null {
    if (!this.isValidPlacement(x, y)) return null

    const config = TOWER_CONFIGS.find(t => t.id === configId)
      ?? HERO_CONFIGS.find(h => h.id === configId)
    if (!config) return null

    if (config.isHero) {
      // Heroes always cost their fixed price — no difficulty scaling
      if (gameState.heroPlacedOnMap) return null
      if (gameState.cash < config.cost) return null
      gameState.cash -= config.cost
      gameState.heroPlacedOnMap = true
    } else {
      if (!gameState.canAfford(config.cost)) return null
      gameState.spend(config.cost)
    }

    const tower = this.createTower(config, x, y)
    if (!tower) return null

    this.towers.push(tower)
    tower.playPlacementAnimation()
    tower.setInteractive()
    tower.on('pointerdown', () => this.selectTower(tower))

    this.cancelPlacement()
    return tower
  }

  private createTower(config: TowerConfig, x: number, y: number): BaseTower | null {
    if (config.isHero) {
      return new HeroTower(this.scene, x, y, config, this.bloonManager, this.projectileManager)
    }
    switch (config.id) {
      case 'dart_monkey': return new DartMonkey(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'boomerang_monkey': return new BoomerangMonkey(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'bomb_shooter': return new BombShooter(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'tack_shooter': return new TackShooter(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'ice_monkey': return new IceMonkey(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'glue_gunner': return new GlueGunner(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'sniper_monkey': return new SniperMonkey(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'monkey_sub': return new MonkeySub(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'monkey_buccaneer': return new MonkeyBuccaneer(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'monkey_ace': return new MonkeyAce(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'heli_pilot': return new HeliPilot(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'mortar_monkey': return new MortarMonkey(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'dartling_gunner': return new DartlingGunner(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'wizard_monkey': return new WizardMonkey(this.scene, x, y, this.bloonManager, this.projectileManager, this.track)
      case 'super_monkey': return new SuperMonkey(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'ninja_monkey': return new NinjaMonkey(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'alchemist': return new Alchemist(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'druid': return new Druid(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'banana_farm': return new BananaFarm(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'spike_factory': return new SpikeFactory(this.scene, x, y, this.bloonManager, this.projectileManager, this.track)
      case 'monkey_village': return new MonkeyVillage(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'engineer_monkey': return new EngineerMonkey(this.scene, x, y, this.bloonManager, this.projectileManager, this.track)
      case 'beast_handler': return new BeastHandler(this.scene, x, y, this.bloonManager, this.projectileManager)
      default: return null
    }
  }

  sellTower(tower: BaseTower): number {
    const refund = tower.getSellValue()
    gameState.earn(refund)
    if (tower.config.isHero) gameState.heroPlacedOnMap = false
    const idx = this.towers.indexOf(tower)
    if (idx > -1) this.towers.splice(idx, 1)
    tower.destroy()
    if (this.selectedTower === tower) {
      this.selectedTower = null
      this.onTowerSelectedCallback?.(null)
    }
    return refund
  }

  selectTower(tower: BaseTower | null): void {
    // Hide range on previously selected
    if (this.selectedTower && this.selectedTower !== tower) {
      this.selectedTower.setRangeVisible(false)
    }
    this.selectedTower = tower
    if (tower) tower.setRangeVisible(true)
    this.onTowerSelectedCallback?.(tower)
  }

  getSelectedTower(): BaseTower | null {
    return this.selectedTower
  }

  private updateVillageBuffs(): void {
    // Reset support buffs on every tower each frame
    for (const tower of this.towers) {
      tower.villageDamageBonus = 0
      tower.villagePierceBonus = 0
      tower.villageSpeedMultiplier = 1.0
    }

    // Apply MonkeyVillage buffs
    for (const village of this.towers) {
      if (village.config.id !== 'monkey_village') continue
      const mv = village as MonkeyVillage
      const buffs = mv.getVillageBuffs()
      if (buffs.speedMultiplier === 1.0 && buffs.damageBonus === 0 && buffs.pierceBonus === 0) continue

      for (const tower of this.towers) {
        if (tower === village) continue
        const dist = Phaser.Math.Distance.Between(village.x, village.y, tower.x, tower.y)
        if (dist <= village.effectiveRange) {
          tower.villageDamageBonus += buffs.damageBonus
          tower.villagePierceBonus += buffs.pierceBonus
          tower.villageSpeedMultiplier *= buffs.speedMultiplier
        }
      }
    }

    // Apply Alchemist buffs (slightly weaker than village, stacks with village)
    for (const alch of this.towers) {
      if (alch.config.id !== 'alchemist') continue
      const a = alch as Alchemist
      const buffs = a.getAlchemistBuffs()
      if (buffs.speedMultiplier === 1.0 && buffs.damageBonus === 0 && buffs.pierceBonus === 0) continue

      for (const tower of this.towers) {
        if (tower === alch) continue
        const dist = Phaser.Math.Distance.Between(alch.x, alch.y, tower.x, tower.y)
        if (dist <= alch.effectiveRange) {
          tower.villageDamageBonus += buffs.damageBonus
          tower.villagePierceBonus += buffs.pierceBonus
          tower.villageSpeedMultiplier *= buffs.speedMultiplier
        }
      }
    }
  }

  update(delta: number, time: number): void {
    this.updateVillageBuffs()
    for (const tower of this.towers) {
      tower.update(delta, time)
    }
  }

  notifyRoundEnd(): void {
    for (const tower of this.towers) {
      tower.onRoundEnd()
    }
  }

  checkParagonEligibility(): { configId: string; name: string }[] {
    const byType = new Map<string, BaseTower[]>()
    for (const tower of this.towers) {
      if (!byType.has(tower.config.id)) byType.set(tower.config.id, [])
      byType.get(tower.config.id)!.push(tower)
    }
    const eligible: { configId: string; name: string }[] = []
    for (const [configId, towers] of byType) {
      const hasPath0 = towers.some(t => t.upgradeTiers[0] === 5)
      const hasPath1 = towers.some(t => t.upgradeTiers[1] === 5)
      const hasPath2 = towers.some(t => t.upgradeTiers[2] === 5)
      if (hasPath0 && hasPath1 && hasPath2) {
        const name = towers[0].config.id
          .split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
        eligible.push({ configId, name })
      }
    }
    return eligible
  }

  mergeToParagon(configId: string): BaseTower | null {
    const donors = this.towers.filter(t => t.config.id === configId)
    const path0 = donors.find(t => t.upgradeTiers[0] === 5)
    const path1 = donors.find(t => t.upgradeTiers[1] === 5)
    const path2 = donors.find(t => t.upgradeTiers[2] === 5)
    if (!path0 || !path1 || !path2) return null

    const cx = path0.x
    const cy = path0.y
    const totalSpent = donors.reduce((s, t) => s + t.totalSpent, 0)

    const uniqueDonors = [...new Set([path0, path1, path2])]
    for (const t of uniqueDonors) {
      const idx = this.towers.indexOf(t)
      if (idx > -1) this.towers.splice(idx, 1)
      if (this.selectedTower === t) {
        this.selectedTower = null
        this.onTowerSelectedCallback?.(null)
      }
      t.destroy()
    }

    const config = TOWER_CONFIGS.find(c => c.id === configId)
    if (!config) return null

    const paragon = this.createTower(config, cx, cy)
    if (!paragon) return null

    paragon.upgradeToParagon(totalSpent)
    this.towers.push(paragon)
    paragon.setInteractive()
    paragon.on('pointerdown', () => this.selectTower(paragon))
    return paragon
  }

  loadSavedTowers(savedTowers: SavedTower[]): void {
    for (const saved of savedTowers) {
      const config: TowerConfig | undefined =
        TOWER_CONFIGS.find(t => t.id === saved.configId) ??
        HERO_CONFIGS.find(h => h.id === saved.configId)
      if (!config) continue

      const tower = this.createTower(config, saved.x, saved.y)
      if (!tower) continue

      tower.restoreFromSave(saved.upgradeTiers, saved.targeting, saved.totalSpent, saved.isParagon)
      this.towers.push(tower)
      tower.setInteractive()
      tower.on('pointerdown', () => this.selectTower(tower))
    }
  }

  getTowers(): BaseTower[] {
    return this.towers
  }

  clear(): void {
    for (const tower of this.towers) {
      tower.destroy()
    }
    this.towers = []
    this.selectedTower = null
  }
}
