export enum DamageType {
  Sharp = 'sharp',
  Explosion = 'explosion',
  Fire = 'fire',
  Cold = 'cold',
  Energy = 'energy',
  Magic = 'magic',
  Normal = 'normal',
}

export enum BloonType {
  Red = 'red',
  Blue = 'blue',
  Green = 'green',
  Yellow = 'yellow',
  Pink = 'pink',
  Black = 'black',
  White = 'white',
  Zebra = 'zebra',
  Rainbow = 'rainbow',
  Ceramic = 'ceramic',
  Lead = 'lead',
  MOAB = 'moab',
  BFB = 'bfb',
  ZOMG = 'zomg',
}

export enum TargetingMode {
  First = 'First',
  Last = 'Last',
  Strong = 'Strong',
  Close = 'Close',
  Far = 'Far',
}

export enum StatusEffectType {
  Freeze = 'freeze',
  Glue = 'glue',
  Stun = 'stun',
  Burn = 'burn',
}

export interface StatusEffect {
  type: StatusEffectType
  duration: number
  slowMultiplier?: number
  damagePerSecond?: number
  burnTickTimer?: number
}

export interface BloonConfig {
  type: BloonType
  baseSpeed: number
  baseHp: number
  rbe: number
  children: BloonType[]
  immunities: DamageType[]
  isMoabClass: boolean
  color: number
  outlineColor: number
  radius: number
  displayName: string
}

export interface UpgradeEffect {
  damageBonus?: number
  pierceBonus?: number
  rangeMultiplier?: number
  cooldownMultiplier?: number
  newDamageType?: DamageType
  addCamoDetection?: boolean
  projectileSpeedMultiplier?: number
  specialBehavior?: string
  extraProjectiles?: number
}

export interface Upgrade {
  name: string
  cost: number
  effect: UpgradeEffect
  description: string
}

export type UpgradePath = [Upgrade, Upgrade, Upgrade, Upgrade, Upgrade]

export interface TowerConfig {
  id: string
  name: string
  cost: number
  range: number
  cooldown: number
  damage: number
  pierce: number
  damageType: DamageType
  projectileSpeed: number
  projectileRadius: number
  color: number
  description: string
  upgrades: [UpgradePath, UpgradePath, UpgradePath]
  image?: string
  isHero?: boolean
}

export interface RoundGroup {
  bloonType: BloonType
  count: number
  spacing: number
  isCamo?: boolean
  isRegrow?: boolean
  isFortified?: boolean
  delay?: number
}

export interface RoundData {
  round: number
  groups: RoundGroup[]
}

export enum GameDifficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
  FreePlay = 'free_play',
}

export enum MapId {
  MonkeyMeadow = 'monkey_meadow',
  FrozenTundra = 'frozen_tundra',
  LavaLair = 'lava_lair',
  SunsetSavanna = 'sunset_savanna',
  CandyCanyon = 'candy_canyon',
  DarkCastle = 'dark_castle',
  DeepSea = 'deep_sea',
  StormRidge = 'storm_ridge',
  AncientRuins = 'ancient_ruins',
  NeonCity = 'neon_city',
}

export interface DifficultyConfig {
  lives: number
  costMultiplier: number
  endRound: number
  label: string
  bloonSpeedMultiplier: number
}
