import { BloonType, RoundData } from '../types'

// Round send schedule based on BTD6 reference milestones
// spacing = seconds between each bloon spawn in the group
// delay = seconds before this group starts (relative to round start)
// Groups with same delay start simultaneously

export const ROUND_DATA: RoundData[] = [
  // Round 1: Just reds
  { round: 1, groups: [{ bloonType: BloonType.Red, count: 20, spacing: 0.5 }] },

  // Round 2: More reds
  { round: 2, groups: [{ bloonType: BloonType.Red, count: 30, spacing: 0.4 }] },

  // Round 3: Reds and blues
  { round: 3, groups: [
    { bloonType: BloonType.Red, count: 20, spacing: 0.4 },
    { bloonType: BloonType.Blue, count: 10, spacing: 0.5, delay: 5 },
  ]},

  // Round 4: Mostly blues
  { round: 4, groups: [
    { bloonType: BloonType.Blue, count: 35, spacing: 0.35 },
  ]},

  // Round 5: Blues and first greens
  { round: 5, groups: [
    { bloonType: BloonType.Blue, count: 20, spacing: 0.35 },
    { bloonType: BloonType.Green, count: 8, spacing: 0.6, delay: 5 },
  ]},

  // Round 6: Greens appear
  { round: 6, groups: [
    { bloonType: BloonType.Green, count: 20, spacing: 0.4 },
    { bloonType: BloonType.Blue, count: 15, spacing: 0.35, delay: 4 },
  ]},

  // Round 7: More greens
  { round: 7, groups: [
    { bloonType: BloonType.Green, count: 30, spacing: 0.35 },
  ]},

  // Round 8: Mixed
  { round: 8, groups: [
    { bloonType: BloonType.Green, count: 15, spacing: 0.4 },
    { bloonType: BloonType.Blue, count: 20, spacing: 0.3, delay: 3 },
    { bloonType: BloonType.Red, count: 30, spacing: 0.25, delay: 8 },
  ]},

  // Round 9: Yellows appear
  { round: 9, groups: [
    { bloonType: BloonType.Yellow, count: 10, spacing: 0.6 },
    { bloonType: BloonType.Green, count: 20, spacing: 0.35, delay: 4 },
  ]},

  // Round 10: Yellows + greens
  { round: 10, groups: [
    { bloonType: BloonType.Yellow, count: 20, spacing: 0.4 },
    { bloonType: BloonType.Green, count: 15, spacing: 0.35, delay: 6 },
  ]},

  // Round 11: More yellows
  { round: 11, groups: [
    { bloonType: BloonType.Yellow, count: 30, spacing: 0.35 },
  ]},

  // Round 12: Pinks appear
  { round: 12, groups: [
    { bloonType: BloonType.Pink, count: 10, spacing: 0.5 },
    { bloonType: BloonType.Yellow, count: 20, spacing: 0.3, delay: 3 },
  ]},

  // Round 13: Pinks
  { round: 13, groups: [
    { bloonType: BloonType.Pink, count: 20, spacing: 0.4 },
    { bloonType: BloonType.Yellow, count: 10, spacing: 0.3, delay: 6 },
  ]},

  // Round 14: Pink wave
  { round: 14, groups: [
    { bloonType: BloonType.Pink, count: 35, spacing: 0.3 },
  ]},

  // Round 15: Mixed pinks and yellows
  { round: 15, groups: [
    { bloonType: BloonType.Pink, count: 25, spacing: 0.3 },
    { bloonType: BloonType.Yellow, count: 25, spacing: 0.3, delay: 5 },
  ]},

  // Round 16: Black and White appear
  { round: 16, groups: [
    { bloonType: BloonType.Black, count: 5, spacing: 1.0 },
    { bloonType: BloonType.White, count: 5, spacing: 1.0, delay: 1 },
    { bloonType: BloonType.Pink, count: 20, spacing: 0.3, delay: 6 },
  ]},

  // Round 17: More blacks/whites
  { round: 17, groups: [
    { bloonType: BloonType.Black, count: 10, spacing: 0.8 },
    { bloonType: BloonType.White, count: 10, spacing: 0.8, delay: 1 },
  ]},

  // Round 18: Blacks and pinks
  { round: 18, groups: [
    { bloonType: BloonType.Black, count: 15, spacing: 0.7 },
    { bloonType: BloonType.Pink, count: 30, spacing: 0.25, delay: 8 },
  ]},

  // Round 19: Whites and pinks
  { round: 19, groups: [
    { bloonType: BloonType.White, count: 15, spacing: 0.7 },
    { bloonType: BloonType.Pink, count: 30, spacing: 0.25, delay: 8 },
  ]},

  // Round 20: Zebras appear
  { round: 20, groups: [
    { bloonType: BloonType.Zebra, count: 5, spacing: 1.2 },
    { bloonType: BloonType.Black, count: 10, spacing: 0.6, delay: 4 },
    { bloonType: BloonType.White, count: 10, spacing: 0.6, delay: 5 },
  ]},

  // Round 21: More zebras
  { round: 21, groups: [
    { bloonType: BloonType.Zebra, count: 10, spacing: 0.9 },
    { bloonType: BloonType.Pink, count: 20, spacing: 0.3, delay: 6 },
  ]},

  // Round 22: Zebra wave
  { round: 22, groups: [
    { bloonType: BloonType.Zebra, count: 15, spacing: 0.8 },
    { bloonType: BloonType.Black, count: 10, spacing: 0.5, delay: 8 },
  ]},

  // Round 23: Mixed zebras/blacks/whites
  { round: 23, groups: [
    { bloonType: BloonType.Zebra, count: 20, spacing: 0.7 },
    { bloonType: BloonType.White, count: 10, spacing: 0.5, delay: 10 },
  ]},

  // Round 24: First Camo bloons
  { round: 24, groups: [
    { bloonType: BloonType.Pink, count: 20, spacing: 0.3, isCamo: true },
    { bloonType: BloonType.Zebra, count: 10, spacing: 0.8, delay: 5 },
  ]},

  // Round 25: Rainbows appear
  { round: 25, groups: [
    { bloonType: BloonType.Rainbow, count: 5, spacing: 1.5 },
    { bloonType: BloonType.Zebra, count: 15, spacing: 0.7, delay: 5 },
  ]},

  // Round 26: More rainbows
  { round: 26, groups: [
    { bloonType: BloonType.Rainbow, count: 10, spacing: 1.2 },
    { bloonType: BloonType.Camo+'' as never, count: 0, spacing: 0 }, // placeholder removed
    { bloonType: BloonType.Pink, count: 20, spacing: 0.3, isCamo: true, delay: 8 },
  ]},

  // Round 27: Rainbow wave
  { round: 27, groups: [
    { bloonType: BloonType.Rainbow, count: 15, spacing: 1.0 },
  ]},

  // Round 28: Regrow bloons appear
  { round: 28, groups: [
    { bloonType: BloonType.Rainbow, count: 10, spacing: 1.0 },
    { bloonType: BloonType.Green, count: 20, spacing: 0.3, isRegrow: true, delay: 8 },
  ]},

  // Round 29: Mixed
  { round: 29, groups: [
    { bloonType: BloonType.Rainbow, count: 15, spacing: 0.9 },
    { bloonType: BloonType.Zebra, count: 10, spacing: 0.7, delay: 8 },
  ]},

  // Round 30: Heavy rainbow
  { round: 30, groups: [
    { bloonType: BloonType.Rainbow, count: 25, spacing: 0.8 },
    { bloonType: BloonType.Black, count: 10, spacing: 0.5, delay: 15 },
  ]},

  // Round 31: Camo + rainbow
  { round: 31, groups: [
    { bloonType: BloonType.Rainbow, count: 10, spacing: 1.0, isCamo: true },
    { bloonType: BloonType.Zebra, count: 15, spacing: 0.7, delay: 8 },
  ]},

  // Round 32: Heavy mixed
  { round: 32, groups: [
    { bloonType: BloonType.Rainbow, count: 20, spacing: 0.7 },
    { bloonType: BloonType.Pink, count: 30, spacing: 0.25, delay: 12 },
  ]},

  // Round 33: Regrow zebras
  { round: 33, groups: [
    { bloonType: BloonType.Zebra, count: 15, spacing: 0.7, isRegrow: true },
    { bloonType: BloonType.Rainbow, count: 10, spacing: 1.0, delay: 8 },
  ]},

  // Round 34: Dense wave
  { round: 34, groups: [
    { bloonType: BloonType.Rainbow, count: 30, spacing: 0.6 },
  ]},

  // Round 35: Mixed heavy
  { round: 35, groups: [
    { bloonType: BloonType.Rainbow, count: 20, spacing: 0.7 },
    { bloonType: BloonType.Zebra, count: 20, spacing: 0.6, delay: 10 },
  ]},

  // Round 36: Camo regrow
  { round: 36, groups: [
    { bloonType: BloonType.Rainbow, count: 15, spacing: 0.8, isCamo: true, isRegrow: true },
    { bloonType: BloonType.Pink, count: 30, spacing: 0.25, delay: 10 },
  ]},

  // Round 37: First Lead bloons
  { round: 37, groups: [
    { bloonType: BloonType.Lead, count: 5, spacing: 2.0 },
    { bloonType: BloonType.Rainbow, count: 20, spacing: 0.6, delay: 5 },
  ]},

  // Round 38: More leads
  { round: 38, groups: [
    { bloonType: BloonType.Lead, count: 8, spacing: 1.5 },
    { bloonType: BloonType.Zebra, count: 20, spacing: 0.6, delay: 8 },
  ]},

  // Round 39: Pre-MOAB warmup
  { round: 39, groups: [
    { bloonType: BloonType.Lead, count: 5, spacing: 1.5 },
    { bloonType: BloonType.Rainbow, count: 30, spacing: 0.5, delay: 5 },
    { bloonType: BloonType.Pink, count: 40, spacing: 0.2, delay: 20 },
  ]},

  // Round 40: FIRST MOAB
  { round: 40, groups: [
    { bloonType: BloonType.MOAB, count: 1, spacing: 0 },
    { bloonType: BloonType.Rainbow, count: 20, spacing: 0.5, delay: 3 },
  ]},

  // Round 41: Post-MOAB recovery round
  { round: 41, groups: [
    { bloonType: BloonType.Lead, count: 10, spacing: 1.2 },
    { bloonType: BloonType.Rainbow, count: 20, spacing: 0.6, delay: 10 },
  ]},

  // Round 42: Camo leads
  { round: 42, groups: [
    { bloonType: BloonType.Lead, count: 5, spacing: 1.5, isCamo: true },
    { bloonType: BloonType.Rainbow, count: 25, spacing: 0.5, delay: 6 },
  ]},

  // Round 43: More MOABs
  { round: 43, groups: [
    { bloonType: BloonType.MOAB, count: 2, spacing: 3.0 },
    { bloonType: BloonType.Rainbow, count: 15, spacing: 0.5, delay: 5 },
  ]},

  // Round 44: Dense rainbow
  { round: 44, groups: [
    { bloonType: BloonType.Rainbow, count: 40, spacing: 0.4 },
    { bloonType: BloonType.Lead, count: 8, spacing: 1.2, delay: 15 },
  ]},

  // Round 45: Mixed + MOAB
  { round: 45, groups: [
    { bloonType: BloonType.MOAB, count: 1, spacing: 0 },
    { bloonType: BloonType.Lead, count: 8, spacing: 1.0, delay: 3 },
    { bloonType: BloonType.Rainbow, count: 20, spacing: 0.4, delay: 12 },
  ]},

  // Round 46: Camo rainbows
  { round: 46, groups: [
    { bloonType: BloonType.Rainbow, count: 30, spacing: 0.5, isCamo: true },
    { bloonType: BloonType.Lead, count: 5, spacing: 1.2, delay: 12 },
  ]},

  // Round 47: First Ceramics appear
  { round: 47, groups: [
    { bloonType: BloonType.Ceramic, count: 5, spacing: 2.0 },
    { bloonType: BloonType.Rainbow, count: 20, spacing: 0.5, delay: 8 },
  ]},

  // Round 48: More ceramics
  { round: 48, groups: [
    { bloonType: BloonType.Ceramic, count: 8, spacing: 1.5 },
    { bloonType: BloonType.MOAB, count: 1, spacing: 0, delay: 10 },
  ]},

  // Round 49: Heavy
  { round: 49, groups: [
    { bloonType: BloonType.MOAB, count: 2, spacing: 3.0 },
    { bloonType: BloonType.Ceramic, count: 10, spacing: 1.2, delay: 5 },
  ]},

  // Round 50: Milestone - heavy ceramics
  { round: 50, groups: [
    { bloonType: BloonType.Ceramic, count: 15, spacing: 1.0 },
    { bloonType: BloonType.MOAB, count: 2, spacing: 3.0, delay: 12 },
  ]},

  // Round 51: Cash penalty starts, fortified appears
  { round: 51, groups: [
    { bloonType: BloonType.Ceramic, count: 10, spacing: 1.0, isFortified: true },
    { bloonType: BloonType.Rainbow, count: 30, spacing: 0.4, delay: 8 },
  ]},

  // Round 52
  { round: 52, groups: [
    { bloonType: BloonType.MOAB, count: 3, spacing: 3.0 },
    { bloonType: BloonType.Ceramic, count: 10, spacing: 0.9, delay: 8 },
  ]},

  // Round 53
  { round: 53, groups: [
    { bloonType: BloonType.Ceramic, count: 15, spacing: 0.8, isCamo: true },
    { bloonType: BloonType.MOAB, count: 2, spacing: 3.0, delay: 10 },
  ]},

  // Round 54
  { round: 54, groups: [
    { bloonType: BloonType.MOAB, count: 4, spacing: 2.5 },
    { bloonType: BloonType.Lead, count: 10, spacing: 0.8, delay: 8 },
  ]},

  // Round 55: Heavy ceramics
  { round: 55, groups: [
    { bloonType: BloonType.Ceramic, count: 20, spacing: 0.7 },
    { bloonType: BloonType.MOAB, count: 3, spacing: 2.5, delay: 12 },
  ]},

  // Round 56: Dense ceramics
  { round: 56, groups: [
    { bloonType: BloonType.Ceramic, count: 25, spacing: 0.6 },
    { bloonType: BloonType.MOAB, count: 2, spacing: 3.0, delay: 15 },
  ]},

  // Round 57
  { round: 57, groups: [
    { bloonType: BloonType.Ceramic, count: 20, spacing: 0.6, isFortified: true },
    { bloonType: BloonType.MOAB, count: 3, spacing: 2.5, delay: 10 },
  ]},

  // Round 58
  { round: 58, groups: [
    { bloonType: BloonType.MOAB, count: 5, spacing: 2.0 },
    { bloonType: BloonType.Ceramic, count: 15, spacing: 0.6, delay: 8 },
  ]},

  // Round 59: Pre-BFB
  { round: 59, groups: [
    { bloonType: BloonType.MOAB, count: 6, spacing: 2.0 },
    { bloonType: BloonType.Ceramic, count: 20, spacing: 0.5, delay: 10 },
  ]},

  // Round 60: FIRST BFB
  { round: 60, groups: [
    { bloonType: BloonType.BFB, count: 1, spacing: 0 },
    { bloonType: BloonType.MOAB, count: 3, spacing: 2.0, delay: 5 },
  ]},

  // Round 61
  { round: 61, groups: [
    { bloonType: BloonType.MOAB, count: 6, spacing: 1.8 },
    { bloonType: BloonType.Ceramic, count: 20, spacing: 0.5, isCamo: true, delay: 8 },
  ]},

  // Round 62
  { round: 62, groups: [
    { bloonType: BloonType.BFB, count: 1, spacing: 0 },
    { bloonType: BloonType.Ceramic, count: 25, spacing: 0.4, delay: 5 },
  ]},

  // Round 63
  { round: 63, groups: [
    { bloonType: BloonType.MOAB, count: 8, spacing: 1.5 },
    { bloonType: BloonType.Ceramic, count: 20, spacing: 0.4, isFortified: true, delay: 10 },
  ]},

  // Round 64
  { round: 64, groups: [
    { bloonType: BloonType.BFB, count: 2, spacing: 5.0 },
    { bloonType: BloonType.MOAB, count: 4, spacing: 2.0, delay: 8 },
  ]},

  // Round 65
  { round: 65, groups: [
    { bloonType: BloonType.BFB, count: 1, spacing: 0 },
    { bloonType: BloonType.MOAB, count: 8, spacing: 1.5, delay: 5 },
    { bloonType: BloonType.Ceramic, count: 20, spacing: 0.4, delay: 15 },
  ]},

  // Round 66
  { round: 66, groups: [
    { bloonType: BloonType.BFB, count: 2, spacing: 5.0 },
    { bloonType: BloonType.Ceramic, count: 25, spacing: 0.4, isCamo: true, delay: 8 },
  ]},

  // Round 67
  { round: 67, groups: [
    { bloonType: BloonType.MOAB, count: 12, spacing: 1.2 },
    { bloonType: BloonType.Ceramic, count: 20, spacing: 0.4, delay: 12 },
  ]},

  // Round 68
  { round: 68, groups: [
    { bloonType: BloonType.BFB, count: 3, spacing: 4.0 },
    { bloonType: BloonType.MOAB, count: 5, spacing: 1.5, delay: 10 },
  ]},

  // Round 69
  { round: 69, groups: [
    { bloonType: BloonType.BFB, count: 2, spacing: 5.0 },
    { bloonType: BloonType.MOAB, count: 10, spacing: 1.2, delay: 8 },
    { bloonType: BloonType.Ceramic, count: 20, spacing: 0.4, isFortified: true, delay: 18 },
  ]},

  // Round 70
  { round: 70, groups: [
    { bloonType: BloonType.BFB, count: 3, spacing: 4.0 },
    { bloonType: BloonType.Ceramic, count: 30, spacing: 0.35, delay: 10 },
  ]},

  // Round 71
  { round: 71, groups: [
    { bloonType: BloonType.BFB, count: 2, spacing: 5.0 },
    { bloonType: BloonType.MOAB, count: 12, spacing: 1.0, delay: 8 },
  ]},

  // Round 72
  { round: 72, groups: [
    { bloonType: BloonType.BFB, count: 4, spacing: 3.5 },
    { bloonType: BloonType.Ceramic, count: 20, spacing: 0.4, isCamo: true, delay: 12 },
  ]},

  // Round 73
  { round: 73, groups: [
    { bloonType: BloonType.BFB, count: 3, spacing: 4.0 },
    { bloonType: BloonType.MOAB, count: 10, spacing: 1.0, delay: 10 },
    { bloonType: BloonType.Ceramic, count: 20, spacing: 0.4, delay: 20 },
  ]},

  // Round 74
  { round: 74, groups: [
    { bloonType: BloonType.BFB, count: 4, spacing: 3.5 },
    { bloonType: BloonType.MOAB, count: 8, spacing: 1.0, delay: 12 },
  ]},

  // Round 75
  { round: 75, groups: [
    { bloonType: BloonType.BFB, count: 5, spacing: 3.0 },
    { bloonType: BloonType.Ceramic, count: 30, spacing: 0.3, isFortified: true, delay: 15 },
  ]},

  // Round 76
  { round: 76, groups: [
    { bloonType: BloonType.BFB, count: 3, spacing: 3.5 },
    { bloonType: BloonType.MOAB, count: 15, spacing: 0.8, delay: 10 },
    { bloonType: BloonType.Ceramic, count: 25, spacing: 0.3, isCamo: true, delay: 20 },
  ]},

  // Round 77
  { round: 77, groups: [
    { bloonType: BloonType.BFB, count: 5, spacing: 3.0 },
    { bloonType: BloonType.MOAB, count: 10, spacing: 0.8, delay: 12 },
  ]},

  // Round 78
  { round: 78, groups: [
    { bloonType: BloonType.BFB, count: 6, spacing: 2.5 },
    { bloonType: BloonType.MOAB, count: 8, spacing: 0.8, delay: 12 },
    { bloonType: BloonType.Ceramic, count: 30, spacing: 0.3, delay: 22 },
  ]},

  // Round 79: Pre-ZOMG
  { round: 79, groups: [
    { bloonType: BloonType.BFB, count: 6, spacing: 2.5 },
    { bloonType: BloonType.MOAB, count: 12, spacing: 0.7, delay: 12 },
    { bloonType: BloonType.Ceramic, count: 30, spacing: 0.3, isFortified: true, delay: 22 },
  ]},

  // Round 80: FIRST ZOMG (Hard win condition)
  { round: 80, groups: [
    { bloonType: BloonType.ZOMG, count: 1, spacing: 0 },
    { bloonType: BloonType.BFB, count: 4, spacing: 3.0, delay: 8 },
    { bloonType: BloonType.MOAB, count: 8, spacing: 0.8, delay: 20 },
  ]},
]

// Fix round 26 (had invalid entry)
ROUND_DATA[25] = {
  round: 26,
  groups: [
    { bloonType: BloonType.Rainbow, count: 10, spacing: 1.2 },
    { bloonType: BloonType.Pink, count: 20, spacing: 0.3, isCamo: true, delay: 8 },
  ]
}
