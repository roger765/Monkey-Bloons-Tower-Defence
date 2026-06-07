import { DamageType, BloonType, StatusEffectType, StatusEffect } from '../types'
import { Bloon } from './BloonManager'
import { BLOON_CONFIGS } from '../data/bloons'

export function canHit(damageType: DamageType, bloon: Bloon): boolean {
  if (damageType === DamageType.Normal) return true

  // Immunity
  if (bloon.isImmuneTo(damageType)) return false

  // Frozen + Sharp
  if (bloon.isFrozen() && damageType === DamageType.Sharp) return false

  return true
}

export function applyFreeze(bloon: Bloon, duration: number = 2.5, canFreezeBlack = false, canFreezeWhite = false): void {
  const cfg = BLOON_CONFIGS[bloon.bloonType]

  // Base Ice Monkey cannot freeze White/Zebra
  if (!canFreezeWhite && (bloon.bloonType === BloonType.White || bloon.bloonType === BloonType.Zebra)) return
  if (!canFreezeBlack && bloon.bloonType === BloonType.Black) return

  bloon.applyStatusEffect({
    type: StatusEffectType.Freeze,
    duration,
  })
}

export function applyGlue(
  bloon: Bloon,
  duration: number = 8.0,
  slowMultiplier: number = 0.5,
  canSlowMoab: boolean = false
): void {
  const cfg = BLOON_CONFIGS[bloon.bloonType]

  if (cfg.isMoabClass && !canSlowMoab) return

  bloon.applyStatusEffect({
    type: StatusEffectType.Glue,
    duration,
    slowMultiplier,
  })
}

export function applyStun(bloon: Bloon, duration: number = 1.5): void {
  const cfg = BLOON_CONFIGS[bloon.bloonType]
  // BAD immune to stun - not in Phase 1
  bloon.applyStatusEffect({
    type: StatusEffectType.Stun,
    duration,
  })
}

export function applyBurn(bloon: Bloon, dps: number = 1.0, duration: number = 3.0): void {
  const cfg = BLOON_CONFIGS[bloon.bloonType]
  if (cfg.immunities.includes(DamageType.Fire)) return

  bloon.applyStatusEffect({
    type: StatusEffectType.Burn,
    duration,
    damagePerSecond: dps,
  })
}
