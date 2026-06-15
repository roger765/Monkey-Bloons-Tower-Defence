import { MapId, GameDifficulty, TargetingMode } from '../types'

export interface SavedTower {
  configId: string
  x: number
  y: number
  upgradeTiers: [number, number, number]
  targeting: TargetingMode
  totalSpent: number
  isParagon: boolean
}

export interface SaveData {
  version: 1
  mapId: MapId
  difficulty: GameDifficulty
  round: number
  lives: number
  maxLives: number
  cash: number
  isFreePlay: boolean
  heroId: string | null
  heroPlacedOnMap: boolean
  towers: SavedTower[]
  savedAt: number
}

const SAVE_VERSION = 1
const saveKey = (mapId: MapId) => `monkey_bloons_save_${mapId}`

export class SaveManager {
  static pendingLoad: SaveData | null = null

  static hasSave(mapId: MapId): boolean {
    return localStorage.getItem(saveKey(mapId)) !== null
  }

  static getSave(mapId: MapId): SaveData | null {
    const raw = localStorage.getItem(saveKey(mapId))
    if (!raw) return null
    try {
      const data = JSON.parse(raw) as SaveData
      if (data.version !== SAVE_VERSION) {
        this.deleteSave(mapId)
        return null
      }
      return data
    } catch {
      this.deleteSave(mapId)
      return null
    }
  }

  static writeSave(data: SaveData): void {
    localStorage.setItem(saveKey(data.mapId), JSON.stringify(data))
  }

  static deleteSave(mapId: MapId): void {
    localStorage.removeItem(saveKey(mapId))
  }
}
