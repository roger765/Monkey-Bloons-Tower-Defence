import { MapId } from '../types'
import { Waypoint, Pond } from './Track'
import { GAME_WIDTH, GAME_HEIGHT, HUD_TOP_HEIGHT, HUD_BOTTOM_HEIGHT } from '../constants'

const T = HUD_TOP_HEIGHT
const B = GAME_HEIGHT - HUD_BOTTOM_HEIGHT
const H = B - T   // 560
const W = GAME_WIDTH  // 1280

export interface MapConfig {
  id: MapId
  name: string
  description: string
  difficulty: string
  difficultyColor: string
  grassColor: number
  trackColor: number
  borderColor: number
  waypoints: Waypoint[]
  ponds: Pond[]
}

export const MAP_CONFIGS: Record<MapId, MapConfig> = {
  // ─── Beginner ───────────────────────────────────────────────────────────────

  [MapId.MonkeyMeadow]: {
    id: MapId.MonkeyMeadow,
    name: 'Monkey Meadow',
    description: 'Gentle serpentine path',
    difficulty: 'Beginner',
    difficultyColor: '#44CC44',
    grassColor: 0x4A7C3F,
    trackColor: 0xC8A96E,
    borderColor: 0xA0804A,
    waypoints: [
      { x: -10,       y: T + H * 0.50 },
      { x: 160,       y: T + H * 0.50 },
      { x: 160,       y: T + H * 0.25 },
      { x: 460,       y: T + H * 0.25 },
      { x: 460,       y: T + H * 0.75 },
      { x: 760,       y: T + H * 0.75 },
      { x: 760,       y: T + H * 0.35 },
      { x: 1060,      y: T + H * 0.35 },
      { x: 1060,      y: T + H * 0.65 },
      { x: W + 10,    y: T + H * 0.65 },
    ],
    ponds: [
      { x: W * 0.24, y: T + H * 0.62, radius: 58 },
      { x: W * 0.87, y: T + H * 0.17, radius: 48 },
    ],
  },

  [MapId.SunsetSavanna]: {
    id: MapId.SunsetSavanna,
    name: 'Sunset Savanna',
    description: 'Long sweeping diagonals',
    difficulty: 'Beginner',
    difficultyColor: '#44CC44',
    grassColor: 0xC07818,
    trackColor: 0xE8D060,
    borderColor: 0x905010,
    waypoints: [
      { x: -10,       y: T + H * 0.40 },
      { x: W * 0.12,  y: T + H * 0.38 },
      { x: W * 0.30,  y: T + H * 0.62 },
      { x: W * 0.50,  y: T + H * 0.50 },
      { x: W * 0.68,  y: T + H * 0.32 },
      { x: W * 0.86,  y: T + H * 0.62 },
      { x: W + 10,    y: T + H * 0.62 },
    ],
    ponds: [
      { x: W * 0.08, y: T + H * 0.82, radius: 55 },
      { x: W * 0.92, y: T + H * 0.15, radius: 50 },
    ],
  },

  // ─── Intermediate ───────────────────────────────────────────────────────────

  [MapId.FrozenTundra]: {
    id: MapId.FrozenTundra,
    name: 'Frozen Tundra',
    description: 'Comb teeth through ice',
    difficulty: 'Intermediate',
    difficultyColor: '#44AAFF',
    grassColor: 0x5D8099,
    trackColor: 0xD8EEF8,
    borderColor: 0x3A607A,
    waypoints: [
      { x: -10,       y: T + H * 0.28 },
      { x: W * 0.18,  y: T + H * 0.28 },
      { x: W * 0.18,  y: T + H * 0.78 },
      { x: W * 0.42,  y: T + H * 0.78 },
      { x: W * 0.42,  y: T + H * 0.22 },
      { x: W * 0.66,  y: T + H * 0.22 },
      { x: W * 0.66,  y: T + H * 0.72 },
      { x: W * 0.88,  y: T + H * 0.72 },
      { x: W + 10,    y: T + H * 0.72 },
    ],
    ponds: [
      { x: W * 0.30, y: T + H * 0.50, radius: 62 },
      { x: W * 0.54, y: T + H * 0.50, radius: 52 },
    ],
  },

  [MapId.CandyCanyon]: {
    id: MapId.CandyCanyon,
    name: 'Candy Canyon',
    description: 'Flowing wave through candy',
    difficulty: 'Intermediate',
    difficultyColor: '#44AAFF',
    grassColor: 0x7A3A7A,
    trackColor: 0xFF88CC,
    borderColor: 0xCC44AA,
    waypoints: [
      { x: -10,       y: T + H * 0.45 },
      { x: W * 0.10,  y: T + H * 0.22 },
      { x: W * 0.22,  y: T + H * 0.58 },
      { x: W * 0.33,  y: T + H * 0.78 },
      { x: W * 0.45,  y: T + H * 0.52 },
      { x: W * 0.57,  y: T + H * 0.22 },
      { x: W * 0.68,  y: T + H * 0.50 },
      { x: W * 0.78,  y: T + H * 0.78 },
      { x: W * 0.90,  y: T + H * 0.48 },
      { x: W + 10,    y: T + H * 0.32 },
    ],
    ponds: [
      { x: W * 0.12, y: T + H * 0.82, radius: 55 },
      { x: W * 0.88, y: T + H * 0.75, radius: 52 },
    ],
  },

  [MapId.AncientRuins]: {
    id: MapId.AncientRuins,
    name: 'Ancient Ruins',
    description: 'Winding through ruined halls',
    difficulty: 'Intermediate',
    difficultyColor: '#44AAFF',
    grassColor: 0x3A4A28,
    trackColor: 0xB0A090,
    borderColor: 0x605040,
    waypoints: [
      { x: -10,       y: T + H * 0.50 },
      { x: W * 0.10,  y: T + H * 0.50 },
      { x: W * 0.10,  y: T + H * 0.20 },
      { x: W * 0.48,  y: T + H * 0.20 },
      { x: W * 0.48,  y: T + H * 0.55 },
      { x: W * 0.28,  y: T + H * 0.55 },
      { x: W * 0.28,  y: T + H * 0.82 },
      { x: W * 0.70,  y: T + H * 0.82 },
      { x: W * 0.70,  y: T + H * 0.35 },
      { x: W * 0.90,  y: T + H * 0.35 },
      { x: W + 10,    y: T + H * 0.35 },
    ],
    ponds: [
      { x: W * 0.58, y: T + H * 0.45, radius: 58 },
      { x: W * 0.85, y: T + H * 0.68, radius: 48 },
    ],
  },

  // ─── Advanced ───────────────────────────────────────────────────────────────

  [MapId.LavaLair]: {
    id: MapId.LavaLair,
    name: 'Lava Lair',
    description: 'Diagonal slashes over molten rock',
    difficulty: 'Advanced',
    difficultyColor: '#FF6622',
    grassColor: 0x1A0800,
    trackColor: 0xDD4400,
    borderColor: 0x771100,
    waypoints: [
      { x: -10,       y: T + H * 0.78 },
      { x: W * 0.18,  y: T + H * 0.78 },
      { x: W * 0.55,  y: T + H * 0.18 },
      { x: W * 0.80,  y: T + H * 0.18 },
      { x: W * 0.80,  y: T + H * 0.60 },
      { x: W + 10,    y: T + H * 0.60 },
    ],
    ponds: [
      { x: W * 0.08, y: T + H * 0.25, radius: 52 },
      { x: W * 0.90, y: T + H * 0.82, radius: 58 },
    ],
  },

  [MapId.DeepSea]: {
    id: MapId.DeepSea,
    name: 'Deep Sea',
    description: 'Inward spiral through the abyss',
    difficulty: 'Advanced',
    difficultyColor: '#FF6622',
    grassColor: 0x0A1828,
    trackColor: 0x1A8A9A,
    borderColor: 0x0A4A58,
    waypoints: [
      { x: -10,       y: T + H * 0.22 },
      { x: W * 0.78,  y: T + H * 0.22 },
      { x: W * 0.78,  y: T + H * 0.80 },
      { x: W * 0.22,  y: T + H * 0.80 },
      { x: W * 0.22,  y: T + H * 0.40 },
      { x: W * 0.60,  y: T + H * 0.40 },
      { x: W * 0.60,  y: T + H * 0.62 },
      { x: W + 10,    y: T + H * 0.62 },
    ],
    ponds: [
      { x: W * 0.88, y: T + H * 0.55, radius: 62 },
      { x: W * 0.10, y: T + H * 0.65, radius: 52 },
    ],
  },

  [MapId.DarkCastle]: {
    id: MapId.DarkCastle,
    name: 'Dark Castle',
    description: 'Deep battlement turns',
    difficulty: 'Advanced',
    difficultyColor: '#FF6622',
    grassColor: 0x222035,
    trackColor: 0x7A6A9A,
    borderColor: 0x181528,
    waypoints: [
      { x: -10,       y: T + H * 0.50 },
      { x: W * 0.08,  y: T + H * 0.50 },
      { x: W * 0.08,  y: T + H * 0.18 },
      { x: W * 0.25,  y: T + H * 0.18 },
      { x: W * 0.25,  y: T + H * 0.82 },
      { x: W * 0.45,  y: T + H * 0.82 },
      { x: W * 0.45,  y: T + H * 0.18 },
      { x: W * 0.65,  y: T + H * 0.18 },
      { x: W * 0.65,  y: T + H * 0.82 },
      { x: W * 0.82,  y: T + H * 0.82 },
      { x: W * 0.82,  y: T + H * 0.40 },
      { x: W + 10,    y: T + H * 0.40 },
    ],
    ponds: [
      { x: W * 0.35, y: T + H * 0.50, radius: 48 },
      { x: W * 0.92, y: T + H * 0.62, radius: 52 },
    ],
  },

  // ─── Expert ─────────────────────────────────────────────────────────────────

  [MapId.StormRidge]: {
    id: MapId.StormRidge,
    name: 'Storm Ridge',
    description: 'Relentless lightning zigzags',
    difficulty: 'Expert',
    difficultyColor: '#FF2244',
    grassColor: 0x252530,
    trackColor: 0xAABBDD,
    borderColor: 0x151520,
    waypoints: [
      { x: -10,       y: T + H * 0.50 },
      { x: W * 0.08,  y: T + H * 0.20 },
      { x: W * 0.18,  y: T + H * 0.80 },
      { x: W * 0.29,  y: T + H * 0.20 },
      { x: W * 0.40,  y: T + H * 0.80 },
      { x: W * 0.51,  y: T + H * 0.20 },
      { x: W * 0.62,  y: T + H * 0.80 },
      { x: W * 0.74,  y: T + H * 0.20 },
      { x: W * 0.86,  y: T + H * 0.55 },
      { x: W + 10,    y: T + H * 0.55 },
    ],
    ponds: [
      { x: W * 0.04, y: T + H * 0.10, radius: 38 },
      { x: W * 0.93, y: T + H * 0.78, radius: 52 },
    ],
  },

  [MapId.NeonCity]: {
    id: MapId.NeonCity,
    name: 'Neon City',
    description: 'Sharp urban grid at night',
    difficulty: 'Expert',
    difficultyColor: '#FF2244',
    grassColor: 0x080810,
    trackColor: 0xFF2288,
    borderColor: 0xCC0055,
    waypoints: [
      { x: -10,       y: T + H * 0.70 },
      { x: W * 0.18,  y: T + H * 0.70 },
      { x: W * 0.18,  y: T + H * 0.28 },
      { x: W * 0.42,  y: T + H * 0.28 },
      { x: W * 0.42,  y: T + H * 0.60 },
      { x: W * 0.62,  y: T + H * 0.60 },
      { x: W * 0.62,  y: T + H * 0.30 },
      { x: W * 0.85,  y: T + H * 0.30 },
      { x: W * 0.85,  y: T + H * 0.62 },
      { x: W + 10,    y: T + H * 0.62 },
    ],
    ponds: [
      { x: W * 0.09, y: T + H * 0.45, radius: 52 },
      { x: W * 0.30, y: T + H * 0.83, radius: 48 },
    ],
  },
}
