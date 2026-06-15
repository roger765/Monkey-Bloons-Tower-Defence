import { DamageType, Upgrade, UpgradePath } from '../types'

// ============================================================
// DART MONKEY UPGRADES
// ============================================================
export const DART_PATH1: UpgradePath = [
  { name: 'Sharper Darts', cost: 140, description: '+1 pierce', effect: { pierceBonus: 1 } },
  { name: 'Razor Sharp Shots', cost: 170, description: '+1 pierce, +1 damage', effect: { pierceBonus: 1, damageBonus: 1 } },
  { name: 'Spike-o-pult', cost: 250, description: 'Shoots a spiked ball: wide radius, 18 pierce', effect: { specialBehavior: 'spikeball', pierceBonus: 16 } },
  { name: 'Juggernaut', cost: 1500, description: 'Giant spiked ball: 50 pierce, 2 damage, pops Lead', effect: { specialBehavior: 'juggernaut', pierceBonus: 48, damageBonus: 1, newDamageType: DamageType.Normal } },
  { name: 'Ultra-Juggernaut', cost: 19500, description: 'Splits into more spiked balls, massive pierce', effect: { specialBehavior: 'ultra_juggernaut', pierceBonus: 50 } },
]

export const DART_PATH2: UpgradePath = [
  { name: 'Quick Shots', cost: 100, description: 'Faster attack speed', effect: { cooldownMultiplier: 0.85 } },
  { name: 'Very Quick Shots', cost: 120, description: 'Even faster attacks', effect: { cooldownMultiplier: 0.85 } },
  { name: 'Triple Shot', cost: 400, description: 'Fires 3 darts per attack', effect: { specialBehavior: 'triple_shot', extraProjectiles: 2 } },
  { name: 'Super Monkey Fan Club', cost: 3000, description: 'Ability: 15s super fast attack rate', effect: { specialBehavior: 'smfc' } },
  { name: 'The Bloon Solver', cost: 45000, description: 'Extreme dart barrage', effect: { specialBehavior: 'bloon_solver', cooldownMultiplier: 0.5 } },
]

export const DART_PATH3: UpgradePath = [
  { name: 'Long Range Darts', cost: 100, description: 'Increased range', effect: { rangeMultiplier: 1.15 } },
  { name: 'Enhanced Eyesight', cost: 150, description: '+range, detects Camo', effect: { rangeMultiplier: 1.1, addCamoDetection: true } },
  { name: 'Crossbow', cost: 350, description: 'Faster projectile, +1 pierce', effect: { pierceBonus: 1, projectileSpeedMultiplier: 2.0 } },
  { name: 'Night Vision Goggles', cost: 500, description: 'Camo detection boost, +range', effect: { rangeMultiplier: 1.1 } },
  { name: 'Monkey Sub Commander', cost: 30000, description: 'Buffs all non-5 path towers in range', effect: { specialBehavior: 'sub_commander' } },
]

// ============================================================
// BOOMERANG MONKEY UPGRADES
// ============================================================
export const BOOM_PATH1: UpgradePath = [
  { name: 'Improved Rangs', cost: 150, description: '+1 pierce', effect: { pierceBonus: 1 } },
  { name: 'Glaives', cost: 250, description: '+1 pierce, bounces more', effect: { pierceBonus: 1 } },
  { name: 'Glaive Ricochet', cost: 400, description: '+5 pierce', effect: { pierceBonus: 5 } },
  { name: 'MOAB Press', cost: 2500, description: '+10 pierce, stuns MOABs briefly', effect: { pierceBonus: 10, specialBehavior: 'moab_press' } },
  { name: 'Glaive Lord', cost: 35000, description: 'Orbiting glaives, massive damage', effect: { specialBehavior: 'glaive_lord', pierceBonus: 20, damageBonus: 3 } },
]

export const BOOM_PATH2: UpgradePath = [
  { name: 'Faster Throwing', cost: 100, description: 'Faster attack speed', effect: { cooldownMultiplier: 0.85 } },
  { name: 'Faster Rangs', cost: 150, description: 'Even faster', effect: { cooldownMultiplier: 0.8 } },
  { name: 'Bionic Boomerang', cost: 1000, description: 'Much faster attack, +1 pierce', effect: { cooldownMultiplier: 0.5, pierceBonus: 1 } },
  { name: 'Turbo Charge', cost: 2000, description: 'Ability: hyper attack for 10s', effect: { specialBehavior: 'turbo_charge' } },
  { name: 'Master Bomber', cost: 35000, description: 'Thrown bombs deal massive area damage', effect: { specialBehavior: 'master_bomber', damageBonus: 5 } },
]

export const BOOM_PATH3: UpgradePath = [
  { name: 'Long Range Rangs', cost: 100, description: '+range', effect: { rangeMultiplier: 1.15 } },
  { name: 'Reallly Long Range', cost: 150, description: '+range', effect: { rangeMultiplier: 1.1 } },
  { name: 'Red Hot Rangs', cost: 300, description: 'Fire damage, pops Lead', effect: { newDamageType: DamageType.Fire } },
  { name: 'Perishing Potions', cost: 1200, description: 'Applies acid DoT on hit', effect: { specialBehavior: 'acid_dot' } },
  { name: 'Glaive Dominus', cost: 55000, description: 'Paragon: ultimate glaive power', effect: { specialBehavior: 'glaive_dominus', damageBonus: 10, pierceBonus: 30 } },
]

// ============================================================
// BOMB SHOOTER UPGRADES
// ============================================================
export const BOMB_PATH1: UpgradePath = [
  { name: 'Bigger Bombs', cost: 300, description: 'Larger explosion radius', effect: { specialBehavior: 'bigger_blast', pierceBonus: 5 } },
  { name: 'Heavy Bombs', cost: 500, description: 'Stuns nearby bloons', effect: { specialBehavior: 'stun_blast' } },
  { name: 'Really Big Bombs', cost: 700, description: 'Even larger blast', effect: { pierceBonus: 10 } },
  { name: 'Bloon Impact', cost: 3000, description: 'Stuns all bloons hit', effect: { specialBehavior: 'bloon_impact' } },
  { name: 'Bloon Crush', cost: 30000, description: 'Crushes all bloons in massive radius', effect: { specialBehavior: 'bloon_crush', damageBonus: 10, pierceBonus: 50 } },
]

export const BOMB_PATH2: UpgradePath = [
  { name: 'Faster Fuse', cost: 150, description: 'Faster attack speed', effect: { cooldownMultiplier: 0.85 } },
  { name: 'Missile Launcher', cost: 300, description: 'Faster projectile speed', effect: { projectileSpeedMultiplier: 1.5, cooldownMultiplier: 0.85 } },
  { name: 'MOAB Mauler', cost: 900, description: '+10 damage to MOAB-class', effect: { specialBehavior: 'moab_mauler' } },
  { name: 'MOAB Assassin', cost: 5000, description: 'Ability: massive MOAB damage missile', effect: { specialBehavior: 'moab_assassin' } },
  { name: 'The Biggest One', cost: 55000, description: 'Extreme blast, huge MOAB damage', effect: { specialBehavior: 'biggest_one', damageBonus: 20, pierceBonus: 100 } },
]

export const BOMB_PATH3: UpgradePath = [
  { name: 'Extra Range', cost: 200, description: '+range', effect: { rangeMultiplier: 1.15 } },
  { name: 'Frag Bombs', cost: 200, description: 'Shrapnel flies outward on explosion', effect: { specialBehavior: 'frag_bombs' } },
  { name: 'Cluster Bombs', cost: 500, description: 'Secondary bomblets on impact', effect: { specialBehavior: 'cluster_bombs' } },
  { name: 'Recursive Cluster', cost: 1800, description: 'Bomblets spawn more bomblets', effect: { specialBehavior: 'recursive_cluster' } },
  { name: 'Super Mines', cost: 60000, description: 'Mines on track deal massive cascading damage', effect: { specialBehavior: 'super_mines', damageBonus: 15 } },
]

// ============================================================
// TACK SHOOTER UPGRADES
// ============================================================
export const TACK_PATH1: UpgradePath = [
  { name: 'Faster Shooting', cost: 100, description: 'Faster attack speed', effect: { cooldownMultiplier: 0.8 } },
  { name: 'Even Faster Shooting', cost: 200, description: 'Even faster', effect: { cooldownMultiplier: 0.8 } },
  { name: 'Hot Shots', cost: 300, description: 'Fire damage, pops Lead', effect: { newDamageType: DamageType.Fire } },
  { name: 'Ring of Fire', cost: 2500, description: 'Continuous ring of fire, +1 damage', effect: { specialBehavior: 'ring_of_fire', damageBonus: 1 } },
  { name: 'Inferno Ring', cost: 30000, description: 'Massive fire ring, high damage', effect: { specialBehavior: 'inferno_ring', damageBonus: 3, pierceBonus: 5 } },
]

export const TACK_PATH2: UpgradePath = [
  { name: 'More Tacks', cost: 100, description: '+4 tacks (12 total)', effect: { specialBehavior: 'more_tacks' } },
  { name: 'Even More Tacks', cost: 200, description: '+4 tacks (16 total)', effect: { specialBehavior: 'even_more_tacks' } },
  { name: 'Tack Sprayer', cost: 300, description: 'Rapid multi-burst', effect: { cooldownMultiplier: 0.6, specialBehavior: 'tack_sprayer' } },
  { name: 'Overdrive', cost: 2000, description: 'Extreme fire rate', effect: { cooldownMultiplier: 0.5 } },
  { name: 'Super Maelstrom', cost: 30000, description: 'Ability: mega tack storm', effect: { specialBehavior: 'super_maelstrom' } },
]

export const TACK_PATH3: UpgradePath = [
  { name: 'Long Range Tacks', cost: 100, description: '+range', effect: { rangeMultiplier: 1.25 } },
  { name: 'Blade Shooter', cost: 175, description: 'Bigger, more damaging blades', effect: { pierceBonus: 1, damageBonus: 1 } },
  { name: 'Blade Maelstrom', cost: 700, description: 'Ability: massive tack storm', effect: { specialBehavior: 'blade_maelstrom' } },
  { name: 'Silver Wind', cost: 3000, description: 'Continuous wind wave, bypasses Camo', effect: { specialBehavior: 'silver_wind', addCamoDetection: true } },
  { name: 'Carpet of Spikes', cost: 40000, description: 'Spike carpet covers wide area', effect: { specialBehavior: 'carpet_of_spikes', damageBonus: 5, pierceBonus: 10 } },
]

// ============================================================
// ICE MONKEY UPGRADES
// ============================================================
export const ICE_PATH1: UpgradePath = [
  { name: 'Bigger Freeze', cost: 100, description: '+freeze radius', effect: { rangeMultiplier: 1.15 } },
  { name: 'Snap Freeze', cost: 200, description: 'Freeze applies instantly', effect: { specialBehavior: 'snap_freeze' } },
  { name: 'Cold Snap', cost: 300, description: 'Can freeze Black and Purple bloons', effect: { specialBehavior: 'cold_snap' } },
  { name: 'Ice Storm', cost: 2000, description: 'Ability: global freeze', effect: { specialBehavior: 'ice_storm' } },
  { name: 'Absolute Zero', cost: 30000, description: 'Ability: massive global freeze, slows MOAB-class', effect: { specialBehavior: 'absolute_zero' } },
]

export const ICE_PATH2: UpgradePath = [
  { name: 'Permafrost', cost: 100, description: 'Frozen bloons stay slowed after thaw', effect: { specialBehavior: 'permafrost' } },
  { name: 'Cold Snap', cost: 150, description: 'Faster freeze rate', effect: { cooldownMultiplier: 0.85 } },
  { name: 'Ice Shards', cost: 400, description: 'Frozen bloons explode into shards on pop', effect: { specialBehavior: 'ice_shards' } },
  { name: 'Cryo Cannon', cost: 2500, description: 'Shoots explosive freeze shells', effect: { specialBehavior: 'cryo_cannon', damageBonus: 1 } },
  { name: 'Icicle Impale', cost: 45000, description: 'Giant icicles slow and damage MOABs', effect: { specialBehavior: 'icicle_impale', damageBonus: 5 } },
]

export const ICE_PATH3: UpgradePath = [
  { name: 'Melting Point', cost: 100, description: 'Affected bloons take more damage', effect: { specialBehavior: 'melting_point' } },
  { name: 'Refreeze', cost: 150, description: 'Freeze duration is longer', effect: { specialBehavior: 'refreeze' } },
  { name: 'Super Freeze', cost: 500, description: 'Can freeze White and Zebra bloons', effect: { specialBehavior: 'super_freeze' } },
  { name: 'Arctic Wind', cost: 3000, description: 'Continuous slow aura around ice monkey', effect: { specialBehavior: 'arctic_wind' } },
  { name: 'Snowstorm', cost: 45000, description: 'Global freeze and chill, affects MOABs', effect: { specialBehavior: 'snowstorm', rangeMultiplier: 2.0 } },
]

// ============================================================
// GLUE GUNNER UPGRADES
// ============================================================
export const GLUE_PATH1: UpgradePath = [
  { name: 'Glue Soak', cost: 100, description: 'Glue soaks through to children', effect: { specialBehavior: 'glue_soak' } },
  { name: 'Corrosive Glue', cost: 150, description: 'Glue deals 1 damage per second', effect: { specialBehavior: 'corrosive_glue' } },
  { name: 'Bloon Dissolver', cost: 500, description: 'Glue deals 2 damage per second', effect: { specialBehavior: 'bloon_dissolver' } },
  { name: 'Bloon Liquefier', cost: 2500, description: 'Rapid corrosive damage', effect: { specialBehavior: 'bloon_liquefier' } },
  { name: 'The Bloon Solver', cost: 40000, description: 'Extreme DoT, instant kills weaker bloons', effect: { specialBehavior: 'glue_solver', damageBonus: 10 } },
]

export const GLUE_PATH2: UpgradePath = [
  { name: 'Bigger Globs', cost: 100, description: 'Bigger glue puddle (more pierce)', effect: { pierceBonus: 2 } },
  { name: 'White Hot Glue', cost: 200, description: 'Glue pops White and Zebra bloons', effect: { specialBehavior: 'white_hot_glue' } },
  { name: 'MOAB Glue', cost: 900, description: 'Glue slows MOAB-class at 37.5%', effect: { specialBehavior: 'moab_glue' } },
  { name: 'Relentless Glue', cost: 2500, description: 'Faster fire rate', effect: { cooldownMultiplier: 0.5 } },
  { name: 'Super Glue', cost: 45000, description: 'Ability: stops all bloons on screen', effect: { specialBehavior: 'super_glue' } },
]

export const GLUE_PATH3: UpgradePath = [
  { name: 'Longer Glue', cost: 100, description: 'Glue lasts longer', effect: { specialBehavior: 'longer_glue' } },
  { name: 'Stickier Glue', cost: 150, description: 'Even longer glue duration', effect: { specialBehavior: 'stickier_glue' } },
  { name: 'Glue Strike', cost: 500, description: 'Ability: glue all bloons on screen', effect: { specialBehavior: 'glue_strike' } },
  { name: 'Glue Storm', cost: 3000, description: 'More frequent glue strike ability', effect: { specialBehavior: 'glue_storm' } },
  { name: 'Bloon Master Alchemist', cost: 45000, description: 'Potions transform bloons to lower tiers', effect: { specialBehavior: 'bloon_master', damageBonus: 5 } },
]

// ============================================================
// SNIPER MONKEY UPGRADES
// ============================================================
export const SNIPER_PATH1: UpgradePath = [
  { name: 'Full Metal Jacket', cost: 350, description: 'Pops Lead bloons', effect: { newDamageType: DamageType.Normal } },
  { name: 'Large Calibre', cost: 500, description: '+1 damage, +stun on hit', effect: { damageBonus: 1 } },
  { name: 'Deadly Precision', cost: 1400, description: '+3 damage', effect: { damageBonus: 3 } },
  { name: 'Maim MOAB', cost: 3000, description: 'Stuns MOABs on hit', effect: { specialBehavior: 'maim_moab', damageBonus: 2 } },
  { name: 'Cripple MOAB', cost: 22000, description: 'Greatly slows MOABs, +10 damage', effect: { specialBehavior: 'cripple_moab', damageBonus: 10 } },
]

export const SNIPER_PATH2: UpgradePath = [
  { name: 'Night Vision Goggles', cost: 200, description: 'Detects Camo bloons', effect: { addCamoDetection: true } },
  { name: 'Shrapnel Shot', cost: 300, description: 'Shots create shrapnel on hit', effect: { specialBehavior: 'shrapnel_shot', pierceBonus: 3 } },
  { name: 'Bouncing Bullet', cost: 1750, description: 'Bullets bounce to nearby bloons', effect: { specialBehavior: 'bouncing_bullet', pierceBonus: 4 } },
  { name: 'Supply Drop', cost: 7000, description: 'Ability: drops $1200 cash', effect: { specialBehavior: 'supply_drop' } },
  { name: 'Elite Sniper', cost: 45000, description: 'Continual Supply Drops, global camo, +5 damage', effect: { specialBehavior: 'elite_sniper', damageBonus: 5 } },
]

export const SNIPER_PATH3: UpgradePath = [
  { name: 'Fast Firing', cost: 150, description: 'Faster attack speed', effect: { cooldownMultiplier: 0.75 } },
  { name: 'Even Faster Firing', cost: 250, description: 'Even faster attacks', effect: { cooldownMultiplier: 0.75 } },
  { name: 'Semi-Automatic', cost: 2500, description: 'Fires rapidly in bursts', effect: { cooldownMultiplier: 0.5, specialBehavior: 'semi_auto' } },
  { name: 'Full Auto Rifle', cost: 4500, description: 'Fully automatic fire', effect: { cooldownMultiplier: 0.5, pierceBonus: 1 } },
  { name: 'Elite Defender', cost: 35000, description: 'Attacks much faster as lives are lost', effect: { specialBehavior: 'elite_defender', cooldownMultiplier: 0.3, damageBonus: 5 } },
]

// ============================================================
// MONKEY SUB UPGRADES
// ============================================================
export const SUB_PATH1: UpgradePath = [
  { name: 'Longer Range', cost: 100, description: '+range', effect: { rangeMultiplier: 1.15 } },
  { name: 'Advanced Intel', cost: 500, description: 'Attacks any bloon targeted by another tower', effect: { specialBehavior: 'advanced_intel', rangeMultiplier: 1.5 } },
  { name: 'Submerge & Support', cost: 800, description: 'Removes Camo from all bloons in range', effect: { specialBehavior: 'submerge_support', addCamoDetection: true } },
  { name: 'Bloontonium Reactor', cost: 3000, description: 'Creates energy aura that damages nearby bloons', effect: { specialBehavior: 'reactor', damageBonus: 1 } },
  { name: 'Energizer', cost: 32000, description: 'Buffs nearby towers, reduces cooldowns globally', effect: { specialBehavior: 'energizer', damageBonus: 2, rangeMultiplier: 1.2 } },
]

export const SUB_PATH2: UpgradePath = [
  { name: 'Airburst Darts', cost: 400, description: 'Darts split into 3 on expiry', effect: { specialBehavior: 'airburst', extraProjectiles: 2 } },
  { name: 'Hot Shot', cost: 450, description: 'Fire damage, pops Lead', effect: { newDamageType: DamageType.Fire } },
  { name: 'Lots More Darts', cost: 650, description: '+3 pierce per shot', effect: { pierceBonus: 3 } },
  { name: 'First Strike Capability', cost: 9000, description: 'Ability: devastating missile on strongest bloon', effect: { specialBehavior: 'first_strike', damageBonus: 5 } },
  { name: 'Pre-Emptive Strike', cost: 60000, description: 'Auto first-strike every 15s, massive damage', effect: { specialBehavior: 'preemptive_strike', damageBonus: 10, pierceBonus: 10 } },
]

export const SUB_PATH3: UpgradePath = [
  { name: 'Barbed Darts', cost: 100, description: '+1 pierce', effect: { pierceBonus: 1 } },
  { name: 'Heat-tipped Darts', cost: 200, description: 'Pops Frozen bloons', effect: { specialBehavior: 'heat_tipped' } },
  { name: 'Ballistic Missile', cost: 1600, description: 'Fires a homing missile at MOAB-class', effect: { specialBehavior: 'ballistic_missile', damageBonus: 3 } },
  { name: 'Advanced Targeting', cost: 2500, description: 'Detects Camo, +range', effect: { addCamoDetection: true, rangeMultiplier: 1.2 } },
  { name: 'Sub Commander', cost: 30000, description: 'Buffs all nearby towers, +damage', effect: { specialBehavior: 'sub_commander', damageBonus: 3, pierceBonus: 3 } },
]

// ============================================================
// MONKEY BUCCANEER UPGRADES
// ============================================================
export const BUCCANEER_PATH1: UpgradePath = [
  { name: 'Faster Shooting', cost: 150, description: 'Faster attack speed', effect: { cooldownMultiplier: 0.82 } },
  { name: 'Double Shot', cost: 300, description: 'Fires 2 darts per attack', effect: { extraProjectiles: 1, pierceBonus: 1 } },
  { name: 'Destroyer', cost: 2500, description: 'Massive attack speed increase', effect: { cooldownMultiplier: 0.4 } },
  { name: 'Aircraft Carrier', cost: 7000, description: 'Launches planes that shoot darts', effect: { specialBehavior: 'aircraft_carrier', damageBonus: 2, pierceBonus: 5 } },
  { name: 'Carrier Flagship', cost: 60000, description: 'Supercharged carrier, massive damage', effect: { specialBehavior: 'carrier_flagship', damageBonus: 5, pierceBonus: 10 } },
]

export const BUCCANEER_PATH2: UpgradePath = [
  { name: 'Grape Shot', cost: 400, description: 'Also fires grapes in a spread', effect: { specialBehavior: 'grape_shot', extraProjectiles: 4 } },
  { name: 'Hot Shot', cost: 500, description: 'Fire damage, pops Lead', effect: { newDamageType: DamageType.Fire } },
  { name: 'Cannon Ship', cost: 900, description: 'Also fires cannon balls with AoE', effect: { specialBehavior: 'cannon_ship', damageBonus: 2, pierceBonus: 10 } },
  { name: 'Monkey Pirates', cost: 4500, description: 'Ability: steal MOAB-class for cash', effect: { specialBehavior: 'monkey_pirates' } },
  { name: 'Flagship', cost: 45000, description: 'Flagship fires everything at once', effect: { specialBehavior: 'flagship', damageBonus: 8, pierceBonus: 20 } },
]

export const BUCCANEER_PATH3: UpgradePath = [
  { name: 'Long Range', cost: 100, description: '+range', effect: { rangeMultiplier: 1.15 } },
  { name: "Crow's Nest", cost: 500, description: 'Detects Camo bloons', effect: { addCamoDetection: true } },
  { name: 'Merchantman', cost: 1800, description: 'Earns $200 extra cash per round', effect: { specialBehavior: 'merchantman' } },
  { name: 'Favored Trades', cost: 7500, description: 'Earns $1000 extra cash per round, +pierce', effect: { specialBehavior: 'favored_trades', pierceBonus: 3 } },
  { name: 'Trade Empire', cost: 20000, description: 'Earns $2500 cash per round, massive bonuses', effect: { specialBehavior: 'trade_empire', pierceBonus: 5, damageBonus: 2 } },
]

// ============================================================
// MONKEY ACE UPGRADES
// ============================================================
export const ACE_PATH1: UpgradePath = [
  { name: 'Rapid Fire', cost: 400, description: 'Faster attack speed', effect: { cooldownMultiplier: 0.75 } },
  { name: 'Lots More Darts', cost: 300, description: '+3 pierce per dart', effect: { pierceBonus: 3 } },
  { name: 'Fighter Plane', cost: 800, description: 'Faster plane, fires seeking missiles', effect: { specialBehavior: 'fighter_plane', damageBonus: 1, cooldownMultiplier: 0.8 } },
  { name: 'Operation: Dart Storm', cost: 2600, description: 'Fires 8 darts in all directions', effect: { specialBehavior: 'dart_storm', extraProjectiles: 7, pierceBonus: 2 } },
  { name: 'Sky Shredder', cost: 50000, description: 'Extreme fire rate, massive pierce and damage', effect: { specialBehavior: 'sky_shredder', damageBonus: 5, pierceBonus: 10, cooldownMultiplier: 0.3 } },
]

export const ACE_PATH2: UpgradePath = [
  { name: 'Lots More Darts', cost: 300, description: '+2 pierce', effect: { pierceBonus: 2 } },
  { name: 'Fighter Plane', cost: 800, description: 'Fires homing missiles at bloons', effect: { specialBehavior: 'neva_miss', damageBonus: 1 } },
  { name: 'Neva-Miss Targeting', cost: 2000, description: 'Darts home in on targets', effect: { specialBehavior: 'neva_miss_2', pierceBonus: 2 } },
  { name: 'Spectre', cost: 13000, description: 'Drops bombs and fires darts simultaneously', effect: { specialBehavior: 'spectre', damageBonus: 3, pierceBonus: 5 } },
  { name: 'Ground Zero', cost: 45000, description: 'Ability: massive bomb destroys all non-ZOMG bloons', effect: { specialBehavior: 'ground_zero', damageBonus: 10, pierceBonus: 20 } },
]

export const ACE_PATH3: UpgradePath = [
  { name: 'Lots More Darts', cost: 300, description: '+1 pierce', effect: { pierceBonus: 1 } },
  { name: 'Spy Plane', cost: 400, description: 'Detects Camo bloons', effect: { addCamoDetection: true } },
  { name: 'Flyover', cost: 600, description: 'Flies in a figure-8 covering more track', effect: { specialBehavior: 'flyover', rangeMultiplier: 1.2 } },
  { name: 'Reverse', cost: 1500, description: 'Can reverse direction, +range', effect: { specialBehavior: 'reverse', rangeMultiplier: 1.1, damageBonus: 1 } },
  { name: 'Flying Fortress', cost: 100000, description: 'Three planes, each with full attack capability', effect: { specialBehavior: 'flying_fortress', damageBonus: 8, pierceBonus: 15 } },
]

// ============================================================
// HELI PILOT UPGRADES
// ============================================================
export const HELI_PATH1: UpgradePath = [
  { name: 'Rapid Fire', cost: 500, description: 'Faster attack speed', effect: { cooldownMultiplier: 0.8 } },
  { name: 'Lots More Darts', cost: 400, description: '+2 pierce per dart', effect: { pierceBonus: 2 } },
  { name: 'Apache Dartship', cost: 3500, description: 'Fires missiles and machine guns simultaneously', effect: { specialBehavior: 'apache_dartship', damageBonus: 2, extraProjectiles: 2 } },
  { name: 'Apache Prime', cost: 21000, description: 'Plasma machine guns, devastating missiles', effect: { specialBehavior: 'apache_prime', damageBonus: 5, newDamageType: DamageType.Energy } },
  { name: 'Comanche Commander', cost: 50000, description: 'Spawns mini-comanche helicopters', effect: { specialBehavior: 'comanche_commander', damageBonus: 8, pierceBonus: 10 } },
]

export const HELI_PATH2: UpgradePath = [
  { name: 'Bigger Jets', cost: 350, description: 'Heli moves faster', effect: { specialBehavior: 'bigger_jets', cooldownMultiplier: 0.9 } },
  { name: 'IFR', cost: 400, description: 'Detects Camo bloons', effect: { addCamoDetection: true } },
  { name: 'Downdraft', cost: 2800, description: 'Pushes bloons back with rotor wash', effect: { specialBehavior: 'downdraft', pierceBonus: 5 } },
  { name: 'Support Chinook', cost: 12000, description: 'Ability: delivers extra lives or cash', effect: { specialBehavior: 'support_chinook' } },
  { name: 'Special Poperations', cost: 35000, description: 'Drops Commando monkey that attacks bloons', effect: { specialBehavior: 'special_poperations', damageBonus: 5 } },
]

export const HELI_PATH3: UpgradePath = [
  { name: 'Lots More Darts', cost: 400, description: '+1 pierce', effect: { pierceBonus: 1 } },
  { name: 'Quad Darts', cost: 600, description: 'Fires 4 darts simultaneously', effect: { extraProjectiles: 3, pierceBonus: 1 } },
  { name: 'Pursuit', cost: 1200, description: 'Heli actively follows the strongest bloon', effect: { specialBehavior: 'pursuit', cooldownMultiplier: 0.85 } },
  { name: 'Rocket Storm', cost: 3300, description: 'Ability: fires rockets in all directions', effect: { specialBehavior: 'rocket_storm', damageBonus: 2 } },
  { name: 'Aces High', cost: 35000, description: 'Heli moves very fast, attacks extremely rapidly', effect: { specialBehavior: 'aces_high', cooldownMultiplier: 0.3, damageBonus: 4, pierceBonus: 5 } },
]

// ============================================================
// MORTAR MONKEY UPGRADES
// ============================================================
export const MORTAR_PATH1: UpgradePath = [
  { name: 'Bigger Blast', cost: 250, description: 'Larger explosion radius, +10 pierce', effect: { pierceBonus: 10, specialBehavior: 'bigger_blast_mortar' } },
  { name: 'Frags', cost: 200, description: 'Shrapnel flies outward on impact', effect: { specialBehavior: 'frags', extraProjectiles: 8 } },
  { name: 'Heavy Shells', cost: 900, description: '+2 damage', effect: { damageBonus: 2 } },
  { name: 'Artillery Battery', cost: 5000, description: 'Fires 4 shells per volley, faster reload', effect: { specialBehavior: 'artillery_battery', cooldownMultiplier: 0.4, extraProjectiles: 3 } },
  { name: 'Pop & Awe', cost: 45000, description: 'Ability: massive global barrage stuns all bloons', effect: { specialBehavior: 'pop_and_awe', damageBonus: 5, pierceBonus: 20 } },
]

export const MORTAR_PATH2: UpgradePath = [
  { name: 'Faster Reload', cost: 150, description: 'Faster attack speed', effect: { cooldownMultiplier: 0.85 } },
  { name: 'Rapid Reload', cost: 250, description: 'Even faster reload', effect: { cooldownMultiplier: 0.8 } },
  { name: 'The Big One', cost: 2500, description: 'Massive explosion, +20 pierce, +2 damage', effect: { specialBehavior: 'the_big_one', damageBonus: 2, pierceBonus: 20 } },
  { name: 'The Biggest One', cost: 15000, description: 'Enormous blast, +5 damage, stuns MOABs', effect: { specialBehavior: 'the_biggest_one_mortar', damageBonus: 5, pierceBonus: 30 } },
  { name: 'Total Destruction', cost: 60000, description: 'Devastating shots destroy almost everything', effect: { specialBehavior: 'total_destruction', damageBonus: 15, pierceBonus: 50 } },
]

export const MORTAR_PATH3: UpgradePath = [
  { name: 'Extended Range', cost: 200, description: '+range for targeting', effect: { rangeMultiplier: 1.2 } },
  { name: 'Burny Stuff', cost: 300, description: 'Leaves burning ground that damages bloons', effect: { newDamageType: DamageType.Fire, specialBehavior: 'burny_stuff' } },
  { name: 'Air Burst Shells', cost: 1200, description: 'Shells burst into smaller explosions', effect: { specialBehavior: 'air_burst', extraProjectiles: 3, pierceBonus: 10 } },
  { name: 'The Air Burst MOAB', cost: 3500, description: 'Air burst deals heavy MOAB damage', effect: { specialBehavior: 'air_burst_moab', damageBonus: 3 } },
  { name: 'Blooncineration', cost: 50000, description: 'Firestorm of explosive shells, massive AoE', effect: { specialBehavior: 'blooncineration', damageBonus: 8, newDamageType: DamageType.Fire } },
]

// ============================================================
// DARTLING GUNNER UPGRADES
// ============================================================
export const DARTLING_PATH1: UpgradePath = [
  { name: 'Focused Firing', cost: 300, description: '+pierce, tighter spread', effect: { pierceBonus: 2 } },
  { name: 'Laser Shock', cost: 500, description: 'Energy damage, stuns bloons briefly', effect: { newDamageType: DamageType.Energy, specialBehavior: 'laser_shock' } },
  { name: 'Laser Cannon', cost: 3000, description: '+2 damage, large pierce', effect: { damageBonus: 2, pierceBonus: 5 } },
  { name: 'Plasma Accelerator', cost: 12000, description: 'Fires a plasma beam across the entire screen', effect: { specialBehavior: 'plasma_accelerator', damageBonus: 5, pierceBonus: 20 } },
  { name: 'Ray of Doom', cost: 95000, description: 'Permanent beam of doom, destroys all bloons', effect: { specialBehavior: 'ray_of_doom', damageBonus: 15, pierceBonus: 9999 } },
]

export const DARTLING_PATH2: UpgradePath = [
  { name: 'Advanced Targeting', cost: 350, description: 'Detects Camo bloons', effect: { addCamoDetection: true } },
  { name: 'Hydra Rocket Pods', cost: 2500, description: 'Fires explosive rockets alongside darts', effect: { specialBehavior: 'hydra_rockets', damageBonus: 2 } },
  { name: 'Rocket Storm', cost: 6000, description: 'Ability: massive rocket barrage', effect: { specialBehavior: 'dartling_rocket_storm', pierceBonus: 10, damageBonus: 2 } },
  { name: 'M.A.D', cost: 45000, description: 'Mutually Assured Destruction: massive rockets', effect: { specialBehavior: 'mad', damageBonus: 10, pierceBonus: 20 } },
  { name: 'Hyper Acceleration', cost: 180000, description: 'Extreme fire rate and damage', effect: { specialBehavior: 'hyper_acceleration', cooldownMultiplier: 0.2, damageBonus: 20 } },
]

export const DARTLING_PATH3: UpgradePath = [
  { name: 'Faster Swivel', cost: 250, description: 'Faster tracking speed', effect: { cooldownMultiplier: 0.88 } },
  { name: 'Powerful Darts', cost: 400, description: '+1 damage', effect: { damageBonus: 1 } },
  { name: 'Buckshot', cost: 3000, description: 'Fires a spread of 5 darts per shot', effect: { extraProjectiles: 4, specialBehavior: 'buckshot' } },
  { name: 'Bloon Exclusion Zone', cost: 7000, description: 'Massive spread, +range, high pierce', effect: { specialBehavior: 'bloon_exclusion_zone', pierceBonus: 10, rangeMultiplier: 1.2 } },
  { name: 'Centurion', cost: 45000, description: 'Fires huge spread of powerful darts rapidly', effect: { specialBehavior: 'centurion', damageBonus: 5, pierceBonus: 15, cooldownMultiplier: 0.5 } },
]

// ============================================================
// WIZARD MONKEY UPGRADES
// ============================================================
export const WIZARD_PATH1: UpgradePath = [
  { name: 'Guided Magic', cost: 200, description: 'Bolts home in on bloons', effect: { specialBehavior: 'guided_magic', pierceBonus: 1 } },
  { name: 'Arcane Blast', cost: 300, description: '+1 damage', effect: { damageBonus: 1 } },
  { name: 'Arcane Mastery', cost: 900, description: '+2 damage, +2 pierce', effect: { damageBonus: 2, pierceBonus: 2 } },
  { name: 'Arcane Spike', cost: 7000, description: '+5 damage, pops any bloon type', effect: { damageBonus: 5, specialBehavior: 'arcane_spike' } },
  { name: 'Archmage', cost: 80000, description: 'Extreme damage and pierce, all damage types', effect: { specialBehavior: 'archmage', damageBonus: 15, pierceBonus: 10 } },
]

export const WIZARD_PATH2: UpgradePath = [
  { name: 'Fireball', cost: 400, description: 'Also fires fireballs with AoE', effect: { specialBehavior: 'fireball', newDamageType: DamageType.Fire } },
  { name: 'Wall of Fire', cost: 650, description: 'Places a wall of fire on the track', effect: { specialBehavior: 'wall_of_fire', damageBonus: 1 } },
  { name: "Dragon's Breath", cost: 2000, description: 'Fires continuous flame, +fire damage', effect: { specialBehavior: 'dragons_breath', damageBonus: 2, cooldownMultiplier: 0.5 } },
  { name: 'Summon Phoenix', cost: 18000, description: 'Ability: summons a phoenix that attacks bloons', effect: { specialBehavior: 'summon_phoenix', damageBonus: 5 } },
  { name: 'Wizard Lord Phoenix', cost: 100000, description: 'Permanent phoenix, extreme fire damage', effect: { specialBehavior: 'wizard_lord_phoenix', damageBonus: 15, pierceBonus: 20 } },
]

export const WIZARD_PATH3: UpgradePath = [
  { name: 'Lightning Bolt', cost: 500, description: 'Also fires lightning that jumps to nearby bloons', effect: { specialBehavior: 'lightning_bolt', extraProjectiles: 1 } },
  { name: 'Tempest Tornado', cost: 900, description: 'Tornado pushes bloons back', effect: { specialBehavior: 'tempest_tornado', pierceBonus: 5 } },
  { name: 'Shimmer', cost: 2000, description: 'Removes Camo from all bloons in range', effect: { specialBehavior: 'shimmer', addCamoDetection: true } },
  { name: 'Monkey Sense', cost: 3000, description: 'Global Camo detection for nearby towers', effect: { specialBehavior: 'monkey_sense', rangeMultiplier: 1.2 } },
  { name: 'Prince of Darkness', cost: 90000, description: 'Summons undead bloons to fight for you', effect: { specialBehavior: 'prince_of_darkness', damageBonus: 10, pierceBonus: 15 } },
]

// ============================================================
// SUPER MONKEY UPGRADES
// ============================================================
export const SUPER_PATH1: UpgradePath = [
  { name: 'Laser Vision', cost: 2500, description: 'Energy damage, +pierce', effect: { newDamageType: DamageType.Energy, pierceBonus: 2 } },
  { name: 'Plasma Vision', cost: 4500, description: '+2 damage, more pierce', effect: { damageBonus: 2, pierceBonus: 3 } },
  { name: 'Sun Avatar', cost: 25000, description: 'Fires solar energy, massive pierce', effect: { specialBehavior: 'sun_avatar', damageBonus: 3, pierceBonus: 5 } },
  { name: 'Sun Temple', cost: 100000, description: 'Sacrifices nearby towers to gain power', effect: { specialBehavior: 'sun_temple', damageBonus: 10, pierceBonus: 20 } },
  { name: 'True Sun God', cost: 500000, description: 'The ultimate tower — god-tier damage', effect: { specialBehavior: 'true_sun_god', damageBonus: 30, pierceBonus: 50, cooldownMultiplier: 0.3 } },
]

export const SUPER_PATH2: UpgradePath = [
  { name: 'Super Range', cost: 1500, description: '+range', effect: { rangeMultiplier: 1.2 } },
  { name: 'Epic Range', cost: 2000, description: '+range again', effect: { rangeMultiplier: 1.15 } },
  { name: 'Robo Monkey', cost: 9000, description: 'Two barrels attack simultaneously', effect: { specialBehavior: 'robo_monkey', extraProjectiles: 1, damageBonus: 2 } },
  { name: 'Tech Terror', cost: 35000, description: 'Ability: orbital strike obliterates bloons', effect: { specialBehavior: 'tech_terror', damageBonus: 8, pierceBonus: 15 } },
  { name: 'The Anti-Bloon', cost: 200000, description: 'Extreme energy barrage, destroys anything', effect: { specialBehavior: 'anti_bloon', damageBonus: 20, pierceBonus: 30 } },
]

export const SUPER_PATH3: UpgradePath = [
  { name: 'Dark Vision', cost: 1500, description: 'Detects Camo bloons', effect: { addCamoDetection: true } },
  { name: 'Dark Shift', cost: 2000, description: 'Can teleport to optimal position', effect: { specialBehavior: 'dark_shift', rangeMultiplier: 1.15 } },
  { name: 'Dark Champion', cost: 25000, description: 'Deals magic damage, bypasses all immunities', effect: { specialBehavior: 'dark_champion', newDamageType: DamageType.Magic, damageBonus: 5 } },
  { name: 'Legend of the Night', cost: 150000, description: 'Generates cash, massive magic damage', effect: { specialBehavior: 'legend_of_night', damageBonus: 15, pierceBonus: 20 } },
  { name: 'The Big Enchilada', cost: 500000, description: 'Ultimate dark power — nothing survives', effect: { specialBehavior: 'big_enchilada', damageBonus: 30, pierceBonus: 40 } },
]

// ============================================================
// NINJA MONKEY UPGRADES
// ============================================================
export const NINJA_PATH1: UpgradePath = [
  { name: 'Ninja Discipline', cost: 200, description: 'Faster attack speed', effect: { cooldownMultiplier: 0.8 } },
  { name: 'Sharp Shurikens', cost: 300, description: '+1 pierce per shuriken', effect: { pierceBonus: 1 } },
  { name: 'Double Shot', cost: 700, description: 'Throws 2 shurikens per attack', effect: { extraProjectiles: 1, pierceBonus: 1 } },
  { name: 'Bloonjitsu', cost: 3000, description: 'Throws 5 shurikens per attack', effect: { extraProjectiles: 3, damageBonus: 1 } },
  { name: 'Grandmaster Ninja', cost: 55000, description: 'Extreme speed, seeking shurikens, +5 damage', effect: { specialBehavior: 'grandmaster_ninja', damageBonus: 5, pierceBonus: 5, cooldownMultiplier: 0.3 } },
]

export const NINJA_PATH2: UpgradePath = [
  { name: 'Distraction', cost: 200, description: 'Attacks push bloons back slightly', effect: { specialBehavior: 'distraction' } },
  { name: 'Counter-Espionage', cost: 400, description: 'Removes Camo from hit bloons', effect: { specialBehavior: 'counter_espionage' } },
  { name: 'Shinobi Tactics', cost: 900, description: 'Buffs nearby Ninjas with +attack speed', effect: { specialBehavior: 'shinobi_tactics', cooldownMultiplier: 0.85 } },
  { name: 'Bloon Sabotage', cost: 5500, description: 'Ability: all bloons slow to half speed for 15s', effect: { specialBehavior: 'bloon_sabotage' } },
  { name: 'Master Bomber', cost: 35000, description: 'Bombs deal massive area damage on each attack', effect: { specialBehavior: 'ninja_master_bomber', damageBonus: 5, pierceBonus: 20 } },
]

export const NINJA_PATH3: UpgradePath = [
  { name: 'Seeking Shuriken', cost: 200, description: 'Shurikens seek out nearest bloon', effect: { specialBehavior: 'seeking_shuriken' } },
  { name: 'Caltrops', cost: 400, description: 'Drops spiked caltrops on the track', effect: { specialBehavior: 'caltrops', extraProjectiles: 2 } },
  { name: 'Flash Bomb', cost: 1500, description: 'Throws flash bombs that stun and damage bloons', effect: { specialBehavior: 'flash_bomb', damageBonus: 1, pierceBonus: 5 } },
  { name: 'Sticky Bomb', cost: 3000, description: 'Attaches a bomb to a bloon that detonates later', effect: { specialBehavior: 'sticky_bomb', damageBonus: 3 } },
  { name: 'Perma Spike', cost: 38000, description: 'Permanently places massive spike piles on track', effect: { specialBehavior: 'perma_spike', damageBonus: 8, pierceBonus: 15 } },
]

// ============================================================
// ALCHEMIST UPGRADES
// ============================================================
export const ALCHEMIST_PATH1: UpgradePath = [
  { name: 'Acidic Mixture Dip', cost: 300, description: 'Buffs a nearby tower to pop any bloon type', effect: { specialBehavior: 'acidic_mixture_dip' } },
  { name: 'Stronger Stimulant', cost: 500, description: 'Potion buffs last longer', effect: { specialBehavior: 'stronger_stimulant' } },
  { name: 'Faster Throwing', cost: 400, description: 'Throws potions faster', effect: { cooldownMultiplier: 0.75 } },
  { name: 'Permanent Brew', cost: 5000, description: 'Buffs are permanent on affected towers', effect: { specialBehavior: 'permanent_brew', damageBonus: 2 } },
  { name: 'Transfusion', cost: 45000, description: 'Generates lives from popping bloons', effect: { specialBehavior: 'transfusion', damageBonus: 5, pierceBonus: 10 } },
]

export const ALCHEMIST_PATH2: UpgradePath = [
  { name: 'Perishing Potions', cost: 400, description: 'Potions apply acid DoT (1 dmg/sec)', effect: { specialBehavior: 'perishing_potions', damageBonus: 1 } },
  { name: 'Unstable Concoction', cost: 700, description: 'Ability: throw a blob that pops bloons on contact', effect: { specialBehavior: 'unstable_concoction', pierceBonus: 5 } },
  { name: 'Rubber to Gold', cost: 1500, description: 'Turns hit bloons to gold for bonus cash on pop', effect: { specialBehavior: 'rubber_to_gold' } },
  { name: 'Rejuvenation', cost: 5000, description: 'Restores lives over time', effect: { specialBehavior: 'rejuvenation', damageBonus: 3 } },
  { name: 'Total Transformation', cost: 45000, description: 'Ability: transforms bloons into weaker bloons', effect: { specialBehavior: 'total_transformation', damageBonus: 10, pierceBonus: 20 } },
]

export const ALCHEMIST_PATH3: UpgradePath = [
  { name: 'Bigger Potions', cost: 200, description: '+pierce, larger potion splash', effect: { pierceBonus: 4 } },
  { name: 'Stronger Acid', cost: 300, description: 'Acid DoT increased to 2 dmg/sec', effect: { specialBehavior: 'stronger_acid', damageBonus: 1 } },
  { name: 'Turbo Charge', cost: 600, description: 'Faster throw rate', effect: { cooldownMultiplier: 0.7 } },
  { name: 'Berserk Brew', cost: 3200, description: 'Buffed towers gain +attack speed and +damage', effect: { specialBehavior: 'berserk_brew', damageBonus: 2 } },
  { name: 'Viral Brew', cost: 35000, description: 'Brew spreads between towers automatically', effect: { specialBehavior: 'viral_brew', damageBonus: 5, pierceBonus: 8 } },
]

// ============================================================
// DRUID UPGRADES
// ============================================================
export const DRUID_PATH1: UpgradePath = [
  { name: 'Hard Thorns', cost: 150, description: '+1 pierce per thorn', effect: { pierceBonus: 1 } },
  { name: 'Thorn Swarm', cost: 300, description: 'Fires more thorns per attack', effect: { extraProjectiles: 2, pierceBonus: 1 } },
  { name: 'Heart of Thunder', cost: 1500, description: 'Calls lightning that jumps between bloons', effect: { specialBehavior: 'heart_of_thunder', newDamageType: DamageType.Energy, damageBonus: 2 } },
  { name: 'Superstorm', cost: 18000, description: 'Ability: massive lightning storm hits all bloons', effect: { specialBehavior: 'superstorm', damageBonus: 5, pierceBonus: 10 } },
  { name: 'Avatar of Wrath', cost: 90000, description: 'Extreme lightning, grows stronger as bloons leak', effect: { specialBehavior: 'avatar_of_wrath', damageBonus: 15, pierceBonus: 20 } },
]

export const DRUID_PATH2: UpgradePath = [
  { name: 'Druid of the Jungle', cost: 300, description: 'Vines reach out and slow nearby bloons', effect: { specialBehavior: 'druid_jungle', damageBonus: 1 } },
  { name: 'Druid of the Swamp', cost: 800, description: 'Vines deal damage and slow more bloons', effect: { specialBehavior: 'druid_swamp', pierceBonus: 3, damageBonus: 1 } },
  { name: 'Druid of the Storm', cost: 2000, description: 'Creates a lightning storm aura around the druid', effect: { specialBehavior: 'druid_storm', damageBonus: 2, rangeMultiplier: 1.2 } },
  { name: 'Ball Lightning', cost: 9000, description: 'Fires slow-moving energy balls that zap nearby bloons', effect: { specialBehavior: 'ball_lightning', damageBonus: 5, pierceBonus: 10 } },
  { name: 'Poplust', cost: 60000, description: 'Buffs all nearby druids, generates cash from pops', effect: { specialBehavior: 'poplust', damageBonus: 8, pierceBonus: 15 } },
]

export const DRUID_PATH3: UpgradePath = [
  { name: 'Thorn Wall', cost: 200, description: 'Places thorn walls on the track', effect: { specialBehavior: 'thorn_wall', pierceBonus: 3 } },
  { name: 'Druid of the Jungle', cost: 400, description: '+range, thorns also slow bloons', effect: { rangeMultiplier: 1.2, specialBehavior: 'druid_jungle_slow' } },
  { name: "Jungle's Bounty", cost: 2000, description: 'Ability: earn bonus cash at end of round', effect: { specialBehavior: 'jungles_bounty' } },
  { name: 'Spirit of the Forest', cost: 12000, description: 'Grows plants on the track that damage bloons', effect: { specialBehavior: 'spirit_of_forest', damageBonus: 3, pierceBonus: 8 } },
  { name: 'Jungle Bounty Supreme', cost: 45000, description: 'Massive income boost each round, +range', effect: { specialBehavior: 'jungle_bounty_supreme', rangeMultiplier: 1.3, damageBonus: 5 } },
]

// ============================================================
// BANANA FARM UPGRADES
// ============================================================
export const FARM_PATH1: UpgradePath = [
  { name: 'More Bananas', cost: 350, description: '+$40 cash per round', effect: { specialBehavior: 'more_bananas' } },
  { name: 'Banana Plantation', cost: 1100, description: '+$100 cash per round', effect: { specialBehavior: 'banana_plantation' } },
  { name: 'Banana Research Facility', cost: 3000, description: '+$200 cash per round', effect: { specialBehavior: 'banana_research_facility' } },
  { name: 'Banana Central', cost: 8000, description: '+$500 cash per round, buffs nearby farms', effect: { specialBehavior: 'banana_central' } },
  { name: 'Banana Absolutely', cost: 80000, description: 'Generates enormous cash each round', effect: { specialBehavior: 'banana_absolutely' } },
]

export const FARM_PATH2: UpgradePath = [
  { name: 'Increased Production', cost: 400, description: 'More bananas generated per cycle', effect: { specialBehavior: 'increased_production' } },
  { name: 'Greater Production', cost: 600, description: 'Even more bananas', effect: { specialBehavior: 'greater_production' } },
  { name: 'Monkey Bank', cost: 3500, description: 'Accumulates cash with compound interest', effect: { specialBehavior: 'monkey_bank' } },
  { name: 'IMF Loan', cost: 12000, description: 'Ability: borrow $10000 (paid back over time)', effect: { specialBehavior: 'imf_loan' } },
  { name: 'Offshore Merchant', cost: 20000, description: 'Generates massive interest every round', effect: { specialBehavior: 'offshore_merchant' } },
]

export const FARM_PATH3: UpgradePath = [
  { name: 'EZ Collect', cost: 200, description: 'Bananas collected automatically', effect: { specialBehavior: 'ez_collect' } },
  { name: 'Banana Salvage', cost: 300, description: 'Wasted bananas are partly recovered', effect: { specialBehavior: 'banana_salvage' } },
  { name: 'Marketplace', cost: 2200, description: 'Auto-collects all bananas, +income', effect: { specialBehavior: 'marketplace' } },
  { name: 'Central Market', cost: 8000, description: 'Boosts nearby farm income significantly', effect: { specialBehavior: 'central_market' } },
  { name: 'Monkey Wall Street', cost: 60000, description: 'Generates cash equal to cash spent nearby', effect: { specialBehavior: 'monkey_wall_street' } },
]

// ============================================================
// SPIKE FACTORY UPGRADES
// ============================================================
export const SPIKE_PATH1: UpgradePath = [
  { name: 'Bigger Stacks', cost: 200, description: '+5 pierce per spike pile', effect: { pierceBonus: 5 } },
  { name: 'White Hot Spikes', cost: 300, description: 'Pops any bloon type including Lead', effect: { newDamageType: DamageType.Normal } },
  { name: 'Spiked Mines', cost: 2000, description: 'Spikes explode when bloons hit them', effect: { specialBehavior: 'spiked_mines', damageBonus: 2, pierceBonus: 10 } },
  { name: 'Spiked Balls', cost: 3500, description: 'Rolls spike balls that hit multiple bloons', effect: { specialBehavior: 'spiked_balls', damageBonus: 3, pierceBonus: 10 } },
  { name: 'Super Mines', cost: 90000, description: 'Massive super mines with catastrophic damage', effect: { specialBehavior: 'super_mines_spike', damageBonus: 10, pierceBonus: 50 } },
]

export const SPIKE_PATH2: UpgradePath = [
  { name: 'Faster Production', cost: 200, description: 'Produces spike piles twice as fast', effect: { cooldownMultiplier: 0.5 } },
  { name: 'Even Faster Production', cost: 400, description: 'Doubles production speed again', effect: { cooldownMultiplier: 0.5 } },
  { name: 'Carpet of Spikes', cost: 7000, description: 'Places spikes anywhere on the track and produces much faster', effect: { specialBehavior: 'carpet_of_spikes', cooldownMultiplier: 0.4 } },
  { name: 'Viral Frost', cost: 9000, description: 'Spikes freeze bloons that touch them', effect: { specialBehavior: 'viral_frost_spike', newDamageType: DamageType.Cold } },
  { name: 'The Tack Zone', cost: 46000, description: 'Extremely rapid spike production, massive coverage', effect: { specialBehavior: 'the_tack_zone', cooldownMultiplier: 0.2, pierceBonus: 20 } },
]

export const SPIKE_PATH3: UpgradePath = [
  { name: 'Long Reach', cost: 100, description: 'Places spikes farther along the track', effect: { rangeMultiplier: 1.3 } },
  { name: 'Endless Spikes', cost: 200, description: 'Spike piles last until used up', effect: { specialBehavior: 'endless_spikes' } },
  { name: 'Long Life Spikes', cost: 400, description: 'Spikes stay on track much longer', effect: { specialBehavior: 'long_life_spikes' } },
  { name: 'Deadly Spikes', cost: 2500, description: '+2 damage per spike hit', effect: { damageBonus: 2, pierceBonus: 5 } },
  { name: 'Perma-Spike', cost: 30000, description: 'Spike piles never expire, +5 damage', effect: { specialBehavior: 'perma_spike_factory', damageBonus: 5, pierceBonus: 10 } },
]

// ============================================================
// MONKEY VILLAGE UPGRADES
// ============================================================
export const VILLAGE_PATH1: UpgradePath = [
  { name: 'Bigger Radius', cost: 300, description: 'Larger buff radius', effect: { rangeMultiplier: 1.2 } },
  { name: 'Jungle Drums', cost: 600, description: 'Nearby towers attack 15% faster', effect: { specialBehavior: 'jungle_drums' } },
  { name: 'Primary Training', cost: 1000, description: 'Primary towers in range gain +1 pierce', effect: { specialBehavior: 'primary_training' } },
  { name: 'Primary Mentoring', cost: 2000, description: 'Primary towers gain +1 damage and camo detection', effect: { specialBehavior: 'primary_mentoring' } },
  { name: 'Primary Expertise', cost: 25000, description: 'Massive buffs to all primary towers in range', effect: { specialBehavior: 'primary_expertise', rangeMultiplier: 1.3 } },
]

export const VILLAGE_PATH2: UpgradePath = [
  { name: 'Monkey Business', cost: 500, description: 'Towers in range cost 10% less to upgrade', effect: { specialBehavior: 'monkey_business' } },
  { name: 'Monkey Commerce', cost: 500, description: 'Discount increased to 15%', effect: { specialBehavior: 'monkey_commerce' } },
  { name: 'Monkey Town', cost: 5000, description: '+$1 per pop for towers in range', effect: { specialBehavior: 'monkey_town' } },
  { name: 'Monkey City', cost: 12000, description: '+$2 per pop, larger radius', effect: { specialBehavior: 'monkey_city', rangeMultiplier: 1.15 } },
  { name: 'Monkeyopolis', cost: 100000, description: 'Absorbs nearby farms for huge income', effect: { specialBehavior: 'monkeyopolis', rangeMultiplier: 1.3 } },
]

export const VILLAGE_PATH3: UpgradePath = [
  { name: 'Radar Scanner', cost: 500, description: 'Nearby towers can detect Camo bloons', effect: { specialBehavior: 'radar_scanner', addCamoDetection: true } },
  { name: 'Monkey Intelligence Bureau', cost: 2000, description: 'Nearby towers can pop any bloon type', effect: { specialBehavior: 'monkey_intelligence_bureau' } },
  { name: 'Call to Arms', cost: 10000, description: 'Ability: nearby towers attack 2× faster for 15s', effect: { specialBehavior: 'call_to_arms' } },
  { name: 'Homeland Defense', cost: 20000, description: 'Call to Arms improved, always active bonus', effect: { specialBehavior: 'homeland_defense', rangeMultiplier: 1.2 } },
  { name: 'Monkeyopolis Supreme', cost: 100000, description: 'All towers on map buffed massively', effect: { specialBehavior: 'monkeyopolis_supreme', rangeMultiplier: 1.5 } },
]

// ============================================================
// ENGINEER MONKEY UPGRADES
// ============================================================
export const ENGINEER_PATH1: UpgradePath = [
  { name: 'Sentry Gun', cost: 500, description: 'Places an auto-targeting sentry gun on the track', effect: { specialBehavior: 'sentry_gun' } },
  { name: 'Faster Engineering', cost: 300, description: 'Deploys sentries faster', effect: { cooldownMultiplier: 0.8 } },
  { name: 'Sentry Champion', cost: 1000, description: 'Sentries deal +2 damage and have more pierce', effect: { specialBehavior: 'sentry_champion', damageBonus: 2, pierceBonus: 3 } },
  { name: 'Turbo Charge', cost: 4000, description: 'Ability: sentries supercharged for 15s', effect: { specialBehavior: 'turbo_charge_eng', cooldownMultiplier: 0.5 } },
  { name: 'Ultraboost', cost: 55000, description: 'Permanently buffs a nearby tower with stacking boosts', effect: { specialBehavior: 'ultraboost', damageBonus: 5, pierceBonus: 5 } },
]

export const ENGINEER_PATH2: UpgradePath = [
  { name: 'Larger Service Area', cost: 200, description: '+range for placing sentries', effect: { rangeMultiplier: 1.2 } },
  { name: 'Faster Engineering', cost: 300, description: 'Attacks faster with nailgun', effect: { cooldownMultiplier: 0.8 } },
  { name: 'Sprockets', cost: 600, description: 'Buffs nearby towers with +attack speed', effect: { specialBehavior: 'sprockets' } },
  { name: 'Cleansing Foam', cost: 2500, description: 'Removes Camo and Regrow from bloons in range', effect: { specialBehavior: 'cleansing_foam', addCamoDetection: true } },
  { name: 'Overclock', cost: 22000, description: 'Ability: temporarily supercharges any tower', effect: { specialBehavior: 'overclock', damageBonus: 3, pierceBonus: 3 } },
]

export const ENGINEER_PATH3: UpgradePath = [
  { name: 'Nails', cost: 150, description: '+1 pierce on nailgun shots', effect: { pierceBonus: 1 } },
  { name: 'Bigger Nails', cost: 250, description: '+2 pierce', effect: { pierceBonus: 2 } },
  { name: 'Bloon Trap', cost: 1500, description: 'Places a trap that collects bloons and earns cash', effect: { specialBehavior: 'bloon_trap', pierceBonus: 5 } },
  { name: 'XXXL Trap', cost: 5000, description: 'Huge trap collects even MOAB-class bloons', effect: { specialBehavior: 'xxxl_trap', damageBonus: 2, pierceBonus: 10 } },
  { name: 'Portable Lake', cost: 40000, description: 'Creates a water tile, generates income from popped bloons', effect: { specialBehavior: 'portable_lake', damageBonus: 5, pierceBonus: 15 } },
]

// ============================================================
// BEAST HANDLER UPGRADES
// ============================================================
export const BEAST_PATH1: UpgradePath = [
  { name: 'Bigger Pets', cost: 200, description: '+1 pierce', effect: { pierceBonus: 1 } },
  { name: 'Stronger Bonds', cost: 400, description: '+1 damage', effect: { damageBonus: 1 } },
  { name: 'Aggressive Handler', cost: 1200, description: 'Beast attacks faster', effect: { cooldownMultiplier: 0.75, damageBonus: 1 } },
  { name: 'Elite Handler', cost: 5000, description: 'Beast deals +3 damage, +range', effect: { damageBonus: 3, rangeMultiplier: 1.2 } },
  { name: 'Ultra Beast', cost: 40000, description: 'Maximum beast power, massive damage', effect: { specialBehavior: 'ultra_beast', damageBonus: 10, pierceBonus: 15, cooldownMultiplier: 0.4 } },
]

export const BEAST_PATH2: UpgradePath = [
  { name: 'Piranha', cost: 350, description: 'Beast bites bloons in water (AoE)', effect: { specialBehavior: 'piranha', pierceBonus: 3 } },
  { name: 'Sauda Blade', cost: 600, description: '+1 damage, wider attack arc', effect: { damageBonus: 1, pierceBonus: 2 } },
  { name: 'Crouching Tiger', cost: 1500, description: 'Tiger beast pounces for heavy damage', effect: { specialBehavior: 'crouching_tiger', damageBonus: 3, cooldownMultiplier: 0.7 } },
  { name: 'Giant Tiger', cost: 6000, description: 'Tiger grows massive, can stun MOAB-class', effect: { specialBehavior: 'giant_tiger', damageBonus: 5, pierceBonus: 5 } },
  { name: 'Dragon Roar', cost: 45000, description: 'Dragon beast breathes fire across entire track', effect: { specialBehavior: 'dragon_roar', newDamageType: DamageType.Fire, damageBonus: 12, pierceBonus: 20 } },
]

export const BEAST_PATH3: UpgradePath = [
  { name: 'Squirrel', cost: 200, description: 'Launches acorns for extra hits', effect: { extraProjectiles: 1, pierceBonus: 1 } },
  { name: 'Hawk', cost: 500, description: 'Hawk swoops on bloons for extra damage', effect: { specialBehavior: 'hawk', damageBonus: 1, pierceBonus: 2 } },
  { name: 'Eagle', cost: 1500, description: 'Eagle detects Camo, dives on strong bloons', effect: { specialBehavior: 'eagle', addCamoDetection: true, damageBonus: 2 } },
  { name: 'Condor', cost: 5000, description: 'Condor covers huge area, deals AoE damage', effect: { specialBehavior: 'condor', rangeMultiplier: 1.3, damageBonus: 3, pierceBonus: 5 } },
  { name: 'Mega Condor', cost: 40000, description: 'Massive condor attacks entire screen', effect: { specialBehavior: 'mega_condor', damageBonus: 10, pierceBonus: 20, rangeMultiplier: 1.5 } },
]
