import Phaser from 'phaser'
import { TargetingMode } from '../types'
import { Bloon } from './BloonManager'
import { BLOON_CONFIGS, getBloonRBE } from '../data/bloons'
import { canHit } from './DamageSystem'
import { DamageType } from '../types'

export function findTarget(
  towerX: number,
  towerY: number,
  range: number,
  targeting: TargetingMode,
  hasCamoDetection: boolean,
  damageType: DamageType,
  bloons: Bloon[]
): Bloon | null {
  const candidates = bloons.filter(b => {
    if (!b.active) return false
    const dist = Phaser.Math.Distance.Between(towerX, towerY, b.x, b.y)
    if (dist > range) return false
    if (b.isCamo && !hasCamoDetection) return false
    if (!canHit(damageType, b)) return false
    return true
  })

  if (candidates.length === 0) return null

  switch (targeting) {
    case TargetingMode.First:
      return candidates.reduce((a, b) =>
        a.distanceAlongTrack >= b.distanceAlongTrack ? a : b
      )

    case TargetingMode.Last:
      return candidates.reduce((a, b) =>
        a.distanceAlongTrack <= b.distanceAlongTrack ? a : b
      )

    case TargetingMode.Strong: {
      return candidates.reduce((a, b) => {
        const rbeA = BLOON_CONFIGS[a.bloonType].rbe
        const rbeB = BLOON_CONFIGS[b.bloonType].rbe
        if (rbeA !== rbeB) return rbeA > rbeB ? a : b
        // Tie-break: First
        return a.distanceAlongTrack >= b.distanceAlongTrack ? a : b
      })
    }

    case TargetingMode.Close:
      return candidates.reduce((a, b) => {
        const dA = Phaser.Math.Distance.Between(towerX, towerY, a.x, a.y)
        const dB = Phaser.Math.Distance.Between(towerX, towerY, b.x, b.y)
        return dA <= dB ? a : b
      })

    case TargetingMode.Far:
      return candidates.reduce((a, b) => {
        const dA = Phaser.Math.Distance.Between(towerX, towerY, a.x, a.y)
        const dB = Phaser.Math.Distance.Between(towerX, towerY, b.x, b.y)
        return dA >= dB ? a : b
      })
  }
}
