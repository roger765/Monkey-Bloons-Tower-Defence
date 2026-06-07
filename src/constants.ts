import { GameDifficulty, DifficultyConfig } from './types'

export const GAME_WIDTH = 1280
export const GAME_HEIGHT = 720
export const HUD_TOP_HEIGHT = 50
export const HUD_BOTTOM_HEIGHT = 110
export const MAP_HEIGHT = GAME_HEIGHT - HUD_TOP_HEIGHT - HUD_BOTTOM_HEIGHT

export const TRACK_WIDTH = 44
export const TRACK_COLOR = 0xC8A96E
export const TRACK_BORDER_COLOR = 0xA0804A
export const GRASS_COLOR = 0x4A7C3F

export const SELL_REFUND_RATE = 0.7

export const DIFFICULTIES: Record<GameDifficulty, DifficultyConfig> = {
  [GameDifficulty.Easy]: {
    lives: 200,
    costMultiplier: 0.85,
    endRound: 40,
    label: 'Easy',
    bloonSpeedMultiplier: 0.85,
  },
  [GameDifficulty.Medium]: {
    lives: 150,
    costMultiplier: 1.0,
    endRound: 60,
    label: 'Medium',
    bloonSpeedMultiplier: 1.0,
  },
  [GameDifficulty.Hard]: {
    lives: 100,
    costMultiplier: 1.08,
    endRound: 80,
    label: 'Hard',
    bloonSpeedMultiplier: 1.05,
  },
}

export const TARGETING_MODES = ['First', 'Last', 'Strong', 'Close', 'Far']

export const COLORS = {
  hudBg: 0x1a1a2e,
  hudText: '#FFFFFF',
  cashColor: '#FFD700',
  livesHigh: '#00FF80',
  livesMid: '#FFD700',
  livesLow: '#FF4040',
  rangeRingValid: 0xFFFFFF,
  rangeRingBlocked: 0xFF0000,
  placementValid: 0x00FF00,
  placementInvalid: 0xFF0000,
  buttonBg: 0x2d4a2d,
  buttonHover: 0x3d6a3d,
  buttonBorder: 0x5a8a5a,
  shopBg: 0x111122,
  panelBg: 0x0d1b2a,
  upgradePurchased: 0x2a5a2a,
  upgradeAvailable: 0x1a3a5a,
  upgradeLocked: 0x2a2a2a,
}
