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

  isValidPlacement(x: number, y: number): boolean {
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
    if (!config) return null

    if (!gameState.canAfford(config.cost)) return null
    gameState.spend(config.cost)

    const tower = this.createTower(config, x, y)
    if (!tower) return null

    this.towers.push(tower)
    tower.setInteractive()
    tower.on('pointerdown', () => this.selectTower(tower))

    this.cancelPlacement()
    return tower
  }

  private createTower(config: TowerConfig, x: number, y: number): BaseTower | null {
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
      case 'wizard_monkey': return new WizardMonkey(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'super_monkey': return new SuperMonkey(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'ninja_monkey': return new NinjaMonkey(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'alchemist': return new Alchemist(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'druid': return new Druid(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'banana_farm': return new BananaFarm(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'spike_factory': return new SpikeFactory(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'monkey_village': return new MonkeyVillage(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'engineer_monkey': return new EngineerMonkey(this.scene, x, y, this.bloonManager, this.projectileManager)
      case 'beast_handler': return new BeastHandler(this.scene, x, y, this.bloonManager, this.projectileManager)
      default: return null
    }
  }

  sellTower(tower: BaseTower): number {
    const refund = tower.getSellValue()
    gameState.earn(refund)
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

  update(delta: number, time: number): void {
    for (const tower of this.towers) {
      tower.update(delta, time)
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
