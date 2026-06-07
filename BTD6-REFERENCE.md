# BTD6 Design Reference Document

**Version scope:** BTD6 from launch (June 2018) through approximately Version 42.x (mid-2025)
**Purpose:** Developer blueprint for a faithful clone
**Confidence key:** `[CONFIRMED]` = verified from wiki/official sources; `[INFERRED]` = logically derived; `[APPROX]` = value is approximate

---

## Table of Contents

1. [Game Overview & Core Loop](#1-game-overview--core-loop)
2. [Bloon System](#2-bloon-system)
3. [Track & Map System](#3-track--map-system)
4. [Tower System](#4-tower-system)
5. [Hero System](#5-hero-system)
6. [Damage System](#6-damage-system)
7. [Targeting System](#7-targeting-system)
8. [Economy & Pricing System](#8-economy--pricing-system)
9. [Round System & Progression](#9-round-system--progression)
10. [Game Modes & Difficulty](#10-game-modes--difficulty)
11. [Hero Activated Abilities](#11-hero-activated-abilities)
12. [Monkey Knowledge System](#12-monkey-knowledge-system)
13. [Powers & Consumables](#13-powers--consumables)
14. [Map Obstacles & Line of Sight](#14-map-obstacles--line-of-sight)
15. [Buff & Synergy System](#15-buff--synergy-system)
16. [Boss Bloon Events](#16-boss-bloon-events)
17. [Co-op Mode](#17-co-op-mode)
18. [Player Progression System](#18-player-progression-system)
19. [Challenge Editor & Community Modes](#19-challenge-editor--community-modes)
20. [Visual Design & Art Direction](#20-visual-design--art-direction)
21. [Audio Design](#21-audio-design)
22. [Technical Architecture (Observed Patterns)](#22-technical-architecture-observed-patterns)
23. [Edge Cases & Known Design Quirks](#23-edge-cases--known-design-quirks)
24. [Systems Interaction Map](#24-systems-interaction-map)
25. [Gaps & Items Requiring Verification](#25-gaps--items-requiring-verification)

---

## 1. Game Overview & Core Loop

### 1.1 Premise

Bloons TD 6 (BTD6) is a tower-defence game developed and published by Ninja Kiwi, released June 13, 2018 (iOS/Android), later on Steam, PC, and consoles. The player places monkey-themed towers on fixed terrain to pop waves of enemy balloons ("Bloons") before they traverse a track and exit, draining lives. The game ends when all lives are lost, or when the final required round is beaten.

### 1.2 Core Loop (per round)

1. **Preparation phase** (between rounds): place or upgrade towers, sell unwanted towers, activate powers, set targeting priorities. A "Start Round" button begins the wave.
2. **Wave phase**: a scripted sequence of Bloons enters from the track entrance, moving toward the exit. Towers attack automatically based on their targeting settings.
3. **Round end**: surviving Bloons that exited drained lives. Cash is awarded based on Bloons popped (per-pop bounty) plus a flat end-of-round bonus. Income generators (Banana Farms, etc.) pay out.
4. **Repeat**: the next round begins with a harder set of Bloons.

### 1.3 Win/Loss Conditions

- **Win:** Survive all required rounds (Round 40 for Easy, Round 60 for Medium, Round 80 for Hard, Round 100 for Impoppable/CHIMPS).
- **Loss:** Lives reach zero at any point during a wave.
- **Continue:** On Easy/Medium/Hard (non-CHIMPS), players can spend Monkey Money to continue after a loss — restoring lives and rewinding to the round start.

### 1.4 Fast Forward

Players can toggle 3x game speed at any time. This affects all animation, movement, and attack timing simultaneously. `[CONFIRMED]`

---

## 2. Bloon System

### 2.1 Bloon Tiers — Basic Types

Bloons form a layered hierarchy. Each Bloon (except Red) contains one or more children released upon death. RBE (Red Bloon Equivalent) is the total damage required to eliminate a Bloon and all its descendants, assuming 1 damage per hit and 1 pierce.

| Bloon | Speed (units/sec) | Children on pop | RBE | Notes |
|-------|------------------|-----------------|-----|-------|
| Red | 25 | None | 1 | Slowest base bloon |
| Blue | 30 | 1 Red | 2 | |
| Green | 35 | 1 Blue | 3 | |
| Yellow | 53 | 1 Green | 4 | |
| Pink | 72 | 1 Yellow | 5 | Fastest non-special base bloon |
| Black | 34 | 2 Pink | 11 | Immune to explosions |
| White | 34 | 2 Pink | 11 | Immune to freeze/cold |
| Purple | 72 | 2 Pink | 11 | Immune to fire/energy (laser, plasma, magic) |
| Zebra | 34 | 1 Black + 1 White | 23 | Immune to both explosions and freeze |
| Rainbow | 45 | 2 Zebra | 47 | |
| Ceramic | 25 | 2 Rainbow | 104 | Has 10 HP; spawns children from each hit until destroyed |
| Lead | 25 | 2 Black | 23 | Immune to sharp projectiles; explosions, fire, energy bypass |

`[CONFIRMED]` Speed values are relative; exact units/sec may vary slightly by source. The proportional relationships above are accurate.

### 2.2 MOAB-Class Bloons

MOAB-class Bloons are blimp-type enemies with large hitboxes, significant health pools, and resistance to most crowd-control effects.

| Bloon | HP (base) | Speed | Children on pop | First appearance |
|-------|-----------|-------|-----------------|-----------------|
| MOAB | 200 | ~25 | 4 Ceramics | Round 40 |
| BFB | 700 | ~8 | 4 MOABs | Round 60 |
| ZOMG | 4,000 | ~4.5 | 4 BFBs | Round 80 |
| DDT | 400 (480 on R90+) | ~55 | 4 Camo Regen Ceramics | Round 90 |
| BAD | 20,000 (28,000 on R100) | ~5 | 2 ZOMGs + 3 DDTs | Round 100 |

**Health scaling in freeplay (Round 80+):** MOAB-class health scales upward each round beyond the scripted range. Scaling is continuous and theoretically infinite. `[CONFIRMED]`

**DDT properties:** Combines Camo + Lead + Black — immune to explosions, sharp damage, and invisible to most towers simultaneously. Moves faster than Pink. `[CONFIRMED]`

**BAD properties:** Immune to all stuns, glue slowdown, and freeze. Only damage-based attacks are effective. `[CONFIRMED]`

### 2.3 Bloon Properties (Modifiers)

Properties are stackable modifiers applied on top of a Bloon type. Multiple properties can exist simultaneously (e.g., Camo Regrow Fortified Ceramic).

| Property | Visual Indicator | Effect |
|----------|-----------------|--------|
| **Camo** | Camouflage pattern overlay | Only towers with Camo detection can target it |
| **Regrow** | Green veins/glowing effect | Regenerates to prior tier after ~3 seconds if not fully destroyed |
| **Fortified** | Metallic/shield visual overlay | Doubles HP of Lead, Ceramic, and MOAB-class Bloons only |

**Regrow mechanics:** A partially damaged Regrow Bloon regenerates back to original layer tier after ~3 seconds. If fully destroyed, it spawns children normally. Regrow Ceramics regenerate to full 10 HP if not continuously pressured. `[CONFIRMED]`

**Fortified stacking:** Applies to Leads, Ceramics, and MOAB-class only. Fortified Ceramic = 20 HP. Fortified MOAB = 400 HP. `[CONFIRMED]`

### 2.4 Bloon Speed Multipliers by Difficulty

- Easy: ~0.85x (slower than Medium) `[APPROX]`
- Medium: 1.0x (baseline)
- Hard/Impoppable: ~1.05x (faster) `[APPROX]`

### 2.5 Super Ceramic (Late Game)

From Round 81 onward, Ceramics become Super Ceramics: still 10 HP but spawn only 1 Rainbow Bloon per layer instead of 2, halving the child cascade. `[CONFIRMED]`

---

## 3. Track & Map System

### 3.1 Map Structure

Each map consists of:
- **Track(s):** One or more defined paths that Bloons follow from entrance(s) to exit(s).
- **Placeable terrain:** Land and water tiles.
- **Obstacles:** Objects that block line of sight or restrict placement.
- **Removable objects:** Destroyable for a cash cost ($500 or $1,000) to open new placement zones.

### 3.2 Map Difficulty Categories

| Category | Count (approx.) | Characteristics |
|----------|----------------|-----------------|
| Beginner | ~24 | Single path, generous placement space |
| Intermediate | ~23 | May have 2 paths, moderate restrictions |
| Advanced | ~20 | Multiple paths, limited space, LoS blockers |
| Expert | ~12 | Extreme restrictions — limited space, severe LoS issues |

Plus 2 hidden maps unlocked through specific in-game actions. `[CONFIRMED]`

XP multiplier by difficulty: Intermediate +10%, Advanced +20%, Expert +30%. `[CONFIRMED]`

### 3.3 Map Geometry

Tracks are defined as bezier curves or polylines. Bloons move along the track at their designated speed. Track length determines how much time a Bloon has before reaching the exit.

**Multi-lane maps:** Some maps have independent lanes with separate entrances. Each lane is its own path. `[CONFIRMED]`

### 3.4 Line of Sight (LoS)

Unique to BTD6. When a tower is placed near an obstacle, portions of its range circle are blocked — displayed as red segments within the range preview. Towers cannot attack Bloons in blocked LoS zones even if within stated range radius.

**Elevation rules:** A tower can only see past objects with lower elevation than its own placement terrain. `[CONFIRMED]`

**Ignore LoS:** Some upgrades explicitly bypass LoS. `[CONFIRMED]`

### 3.5 Water Terrain

Monkey Sub and Monkey Buccaneer can only be placed on water tiles. Other towers can access water via specific upgrades (e.g., Pontoon). `[CONFIRMED]`

### 3.6 Terrain Coordinate System

Map units with floating-point precision (no fixed pixel grid). All positions scale with game viewport. `[CONFIRMED — NZGDC18 dev talk]`

---

## 4. Tower System

### 4.1 Tower Categories

| Category | Towers |
|----------|--------|
| **Primary** | Dart Monkey, Boomerang Monkey, Bomb Shooter, Tack Shooter, Ice Monkey, Glue Gunner |
| **Military** | Sniper Monkey, Monkey Sub, Monkey Buccaneer, Monkey Ace, Heli Pilot, Mortar Monkey, Dartling Gunner |
| **Magic** | Wizard Monkey, Super Monkey, Ninja Monkey, Alchemist, Druid |
| **Support** | Banana Farm, Spike Factory, Monkey Village, Engineer Monkey |

### 4.2 Tower Base Stats

Each tower has:

- **Cost** (difficulty-scaled)
- **Range** (radius in map units)
- **Attack cooldown** (seconds between shots — lower = faster)
- **Fire delay** (animation delay before projectile launches)
- **Damage** (HP removed per hit)
- **Pierce** (number of Bloons a single projectile can hit before expiring)
- **Projectile speed**
- **Attack type** (determines Bloon immunity interactions)

**Attack frequency formula:** `attacks/sec = 1 / (cooldown + fire_delay)`
Example — Dart Monkey: cooldown 0.7s + fire delay 0.2s = 0.9s cycle = ~1.11 atk/s. `[CONFIRMED]`

### 4.3 Primary Tower Profiles

**Dart Monkey** — $200 (Medium). Single dart, 2 pierce, sharp damage type.
- Path 1 (damage): Razor Sharp → Spike-o-pult → Juggernaut → Ultra-Juggernaut
- Path 2 (speed): Quick Shots → Triple Shot → Super Monkey Fan Club → The Bloon Solver
- Path 3 (special): Crossbow → Eagle Eye → Sub Commander

**Boomerang Monkey** — Throws boomerang arcs with 3 pierce. Sharp damage.
- Path 1 T5: Glaive Lord
- Path 2 T5: Master Bomber (via Bionic Boomerang)
- Path 3 T5: Glaive Dominus (Paragon base)

**Bomb Shooter** — Explosive AoE projectiles. Cannot pop Purple by default. Can pop Lead (explosion type).

**Tack Shooter** — Fires 8 tacks simultaneously at fixed 45-degree angles, full 360 coverage, very short range. Attack every 1.12s. Cannot pop Lead or Frozen at base.
- Path 1 T5: Super Maelstrom
- Path 3 T5: Inferno Ring

**Ice Monkey** — AoE freeze within range. Very slow attack rate, high pierce, hits everything in radius simultaneously. No damage at base — only freezes. Frozen Bloons cannot be hurt by sharp attacks.
- Cannot affect White, Zebra, or MOAB-class at base.

**Glue Gunner** — Slows Bloons by 50% for a duration. No damage at base.
- Path 1: Corrosive glue (adds DoT damage)
- Path 2: MOAB Glue (slows MOAB-class at 37.5%)

### 4.4 Military Tower Profiles

**Sniper Monkey** — Infinite range. Sharp damage, 1 pierce. Targets anywhere on track regardless of placement position.
- Path 1 T5: Elite Sniper
- Path 2 T5: Maim MOAB (stuns MOABs)
- Path 3 T5: Deadly Precision

**Monkey Sub** — Water only. Auto-attacks with darts, high pierce.
- Path 2 T3: Bloontonium Reactor (generates income + damages nearby Bloons)

**Monkey Buccaneer** — Water only. Cannon + dart attacks.
- Path 1 T5: Pirate Lord (grabs MOAB-class, pulls them backward) `[CONFIRMED]`
- Path 3 T5: Aircraft Carrier (generates patrol planes)

**Monkey Ace** — Flies a circuit pattern around a fixed point. Range is based on flight path, not a circle.
- Path 2 T5: Flying Fortress

**Heli Pilot** — Mobile tower. Moves autonomously; can follow cursor. Unique targeting modes: Follow Mouse, Patrol Point, Pursuit.
- Path 3 T4: Support Chinook (moves towers, provides lives/cash)

**Mortar Monkey** — Fixed placement, unlimited range. Fires shells at manually targeted ground position. Area-of-effect blast on impact. Cannot be evaded by Camo (targets ground, not Bloons).

**Dartling Gunner** — Follows cursor in real-time or auto-target mode. Fires continuous dart stream in aimed direction. No traditional range radius — fires in a straight line until projectiles expire.

### 4.5 Magic Tower Profiles

**Wizard Monkey** — Magic bolts, damages Purple Bloons.
- Path 1: Fireball/Wall of Fire/Dragon's Breath (fire damage)
- Path 2: Arcane upgrades; Shimmer de-camos nearby Bloons
- Path 3 T4: Necromancer (reanimates popped Bloons as zombie Bloons). T5: Archmage

**Super Monkey** — Very fast attack rate, excellent range. Most expensive base tower.
- Path 1 T4/T5: Sun Temple/True Sun God (sacrifice mechanic — consumes nearby towers for permanent bonuses)
- Path 2 T5: Prince of Darkness
- Path 3 T5: Legend of the Night

**Ninja Monkey** — Fast, sharp shurikens, 2 pierce, innate Camo detection.
- Path 2: Distraction (blows back Bloons); T5: Master Bomber
- Path 3 T5: Grand Saboteur

**Alchemist** — Throws potions buffing towers or damaging/de-layering Bloons.
- Path 1 T5: Perma Brew (permanently buffs nearby towers) `[CONFIRMED]`
- Path 3: Lead to Gold/Rubber to Gold (cash from Lead Bloons)

**Druid** — Lightning and thorn attacks. Lightning has AoE chain damage.
- Path 1 T5: Superstorm
- Path 2 T5: Spirit of the Forest (income generation)

### 4.6 Support Tower Profiles

**Banana Farm** — Produces banana bunches each round. No combat.
- Base: 4 bunches x $20 = $80/round. Bananas despawn after ~15 seconds.
- Path 1 T5: Banana Central
- Path 2 T3: Monkey Bank (auto-collect + 15% interest, max $7,000/$9,500)
- Path 2 T5: Monkey-Nomics (ability grants $9,000, 60s cooldown, max 2 uses/round) `[CONFIRMED]`
- Path 3 T4: IMF Loan ($10,000 loan, repaid from future income)
- Path 3 T5: Monkeyopolis (absorbs nearby Farms for compounded output)

**Spike Factory** — Deposits spikes on track that pop passing Bloons. Spikes persist between rounds until popped or expired.
- Path 3 T5: Perma-Spike (spikes never expire)

**Monkey Village** — Support aura. Does not attack at base.
- Base: +10% range to all towers in radius
- Path 1 T1: Primary Training (+1 pierce, +10% range, +25% proj speed to Primary towers in radius)
- Path 2: 10–15% discount on T1–T3 upgrades in radius
- Path 3 T4: Monkey Intelligence Bureau — grants all towers in radius "normal" damage type (pops everything) `[CONFIRMED]`

**Engineer Monkey** — Places sentries and spike/nail traps.
- Path 2 T2: Bloon Trap (captures Bloons for cash payout)
- Path 3 T4: Ultraboost (permanently buffs nearby tower attack speed, up to 5 stacks)

### 4.7 Upgrade Path System

**3-path structure:** Each tower has three independent upgrade paths with 5 tiers each.

**Crosspathing rules:**
- A tower may have upgrades on all three paths, but once any path reaches T3+, all other paths are capped at T2.
- Notation: path1-path2-path3 (e.g., "5-2-0" = T5 on path 1, T2 on path 2, no upgrades on path 3).
- Valid: 5-2-0, 5-0-2, 0-5-2, 2-5-0, 0-2-5, 2-0-5, 2-2-0, 2-0-2, 0-2-2
- Invalid: 3-3-0, 5-3-0, 3-0-3, etc. (two paths both at T3+) `[CONFIRMED]`

### 4.8 Paragon System

Paragons are special Tier 6 upgrades that fuse all three T5 paths (introduced Version 27.0).

**Requirements:**
1. Three different T5 variants of the same tower must be present simultaneously on the map.
2. All three are consumed (absorbed) into the Paragon.

**Paragon Degree (1–100):** Determined by:
- Total cash invested in all absorbed towers
- Total upgrade tiers of non-T5 absorbed towers
- Number of additional T5 towers absorbed beyond the minimum three
- Total damage dealt and cash generated by absorbed towers `[CONFIRMED]`

**Limits:** One per tower type per game. In Boss Events and Contested Territory, cap is 4. `[CONFIRMED]`

---

## 5. Hero System

### 5.1 Overview

- One Hero per game (selected before game start).
- Levels up automatically via round-end XP, up to level 20.
- Gains passive stat improvements and Activated Abilities as it levels.
- Cannot be upgraded via the standard tower upgrade system.

### 5.2 Hero XP Ratios

| XP Ratio | Heroes |
|----------|--------|
| 1.0x (fastest) | Quincy, Gwendolin, Striker Jones, Obyn Greenfoot, Etienne, Geraldo |
| 1.425x | Ezili, Pat Fusty, Admiral Brickell, Sauda, Corvus, Rosalia |
| 1.5x | Benjamin, Psi, Silas |
| 1.71x (slowest) | Captain Churchill, Adora |

Higher ratio = more XP required per level. `[CONFIRMED]`

### 5.3 Ability Unlock Schedule

| Level | Unlock |
|-------|--------|
| 1 | Placed; basic passive attack |
| 3 | First Activated Ability (shorter cooldown, moderate power) |
| 7 | Second Activated Ability (some heroes only; situational) |
| 10 | Final Activated Ability (longer cooldown, high power) |
| 11–20 | Passive stat improvements, cooldown reductions |

### 5.4 Hero Roster

| Hero | Role | Special Mechanic |
|------|------|-----------------|
| Quincy | Archer, rapid multi-shot | Bonus XP from Bloons popped (unique) |
| Gwendolin | Pyromancer, AoE fire | Heat It Up passively buffs nearby tower attack speed |
| Striker Jones | Artillery/MOAB specialist | Passively buffs Bomb Shooters and Mortars |
| Obyn Greenfoot | Nature/support druid | Buffs Magic towers in range |
| Captain Churchill | Tank/MOAB damage | High-damage cannon; slow leveling |
| Benjamin | Hacker/economy | Generates income mid-round; Syphon Funding ability |
| Ezili | Voodoo/de-buff | MOAB Hex DoT; Sacrificial Totem |
| Pat Fusty | Giant monkey, MOAB stun | Rallying Roar buffs nearby towers passively |
| Adora | Sun priestess, sacrifice | Blood Sacrifice consumes nearby towers for permanent upgrades |
| Admiral Brickell | Naval commander | Only effective near water; buffs water towers |
| Etienne | Drone operator | Global Camo detection via drone; UCAV ability |
| Sauda | Blademaster (melee) | Very short range, extremely high DPS |
| Psi | Psychic | Psionically destroys single targets; can hold Bloons in place |
| Geraldo | Merchant/shop | Places a shop with per-round purchasable consumables |
| Corvus | Spellcaster | Spell-combo system; effects based on spell sequence |
| Rosalia | Engineer heroine | Places equipment and traps on the track |
| Silas Drumlin | Logistician | Buffs income and support towers |

`[INFERRED — verify current hero count and abilities against latest patch notes]`

---

## 6. Damage System

### 6.1 Damage Types

| Damage Type | Cannot pop by default | Notes |
|-------------|----------------------|-------|
| **Sharp** | Lead, Frozen | Darts, tacks, shurikens, glaives |
| **Explosion** | Purple | Bombs, mortars. Can pop Lead and Frozen. |
| **Fire** | Purple, White, Zebra | Wizard fire, Gwendolin. Can pop Lead. |
| **Cold/Freeze** | White, Zebra, MOAB-class | Ice attacks |
| **Energy/Laser** | Lead (base) | Laser beams, plasma |
| **Magic** | Few immunities at base | Wizard bolts, Druid thorns |
| **Normal** | None | Bypasses all immunities — granted by MIB |

Monkey Intelligence Bureau (Village T4, Path 3) grants all towers in radius the "normal" damage type. `[CONFIRMED]`

### 6.2 Pierce Mechanics

Pierce is the number of Bloons a single projectile can hit before expiring. Consumed per Bloon hit.

| Tower | Base Pierce |
|-------|------------|
| Dart Monkey dart | 2 |
| Tack Shooter tack | 1 |
| Bomb explosion | 40 (AoE) |
| Ninja shuriken | 2 |

### 6.3 Damage Values

Most base Bloons take 1 damage per hit (one layer removed). Ceramics have 10 HP. Upgrades can increase damage to 2, 3, or more per hit — dealing that many layers of damage simultaneously.

### 6.4 Status Effects

| Effect | Source | Behavior | Immunity |
|--------|--------|----------|----------|
| **Freeze** | Ice Monkey | Stops movement + adds Frozen layer; blocks sharp damage | White, Zebra, MOAB-class (base) |
| **Glue (slow)** | Glue Gunner | -50% speed (upgradeable to -75%; -37.5% for MOABs) | BAD |
| **Burn/Fire DoT** | Wizard, Gwendolin, Alchemist | Damage over time | Purple, White, Zebra |
| **Stun** | Bomb explosions, Churchill | Stops movement; all damage types still work (unlike Freeze) | BAD |
| **Corrosive** | Corrosive Glue upgrade | Slow + damage over time | BAD |

**Freeze vs. Stun:** Frozen Bloons block sharp attacks. Stunned Bloons do not — all damage types work on stun. `[CONFIRMED]`

**DoT stacking:** Different DoT sources stack independently. `[CONFIRMED]`

---

## 7. Targeting System

### 7.1 Standard Targeting Options

| Priority | Behavior |
|----------|----------|
| **First** | Target Bloon furthest along track (closest to exit) |
| **Last** | Target Bloon furthest from exit |
| **Strong** | Target Bloon with highest RBE; ties default to First |
| **Close** | Target Bloon physically closest to tower center |
| **Far** | Target Bloon farthest from tower center |

**Tie-breaking:** When Bloons qualify equally, the one furthest along the track wins. `[CONFIRMED]`

### 7.2 Special Targeting Modes

- **Mortar:** Set Target (fixed ground point), Strong, First, Close, track-relative options.
- **Dartling Gunner:** Follows cursor by default; auto-targeting available.
- **Heli Pilot:** Follow, Patrol Point, Pursuit, Support Chinook.
- **Camo Prioritization:** Towers with Camo detection can toggle "Prioritize Camo." `[CONFIRMED]`
- **MOAB Prioritization:** Some upgrade paths add an optional MOAB-focus toggle. `[CONFIRMED]`

---

## 8. Economy & Pricing System

### 8.1 Tower Cost Difficulty Multipliers

| Difficulty | Cost Multiplier |
|------------|----------------|
| Easy | 0.85x |
| Medium | 1.0x (baseline) |
| Hard | 1.08x |
| Impoppable | 1.2x |

All community guide prices are stated in Medium (1.0x) values. `[CONFIRMED]`

### 8.2 Cash-Per-Pop Income

Base rate: $1 per Bloon HP removed.

**End-of-round bonus:** `$100 + R` where R = round number. Round 20 = $120. `[CONFIRMED]`

**Cash-per-pop tax (Round 51+):**

| Round Range | Cash/pop multiplier |
|-------------|-------------------|
| 1–50 | 1.0x |
| 51–60 | 0.5x |
| 61–85 | 0.4x |
| 86–100 | 0.36x |
| 101–120 | ~0.29x |
| 121–140 | ~0.18x |
| 141+ | ~0.07x |

`[CONFIRMED — approximate values from wiki]`

### 8.3 Selling Towers

- Default sell refund: **70%** of total spent on tower + all upgrades. `[CONFIRMED]`
- Better Sell Deals (MK): +5% = 75%.
- Favored Trades (Village T3, P2): +4% per stacked Village in range, up to +12%.
- Soft cap: 95%. `[CONFIRMED]`

### 8.4 Banana Farm Income

| Upgrade | Income/Round | Notes |
|---------|-------------|-------|
| Base (0-0-0) | $80 | 4x $20 bunches, manual collection |
| Banana Plantation (T1, P1) | $120 | More bunches |
| Banana Research Facility (T3, P1) | $200 | Auto-collect option |
| Banana Central (T5, P1) | $2,700+ | Massively increased output |
| Monkey Bank (T3, P2) | $180 + 15% interest | Auto-accumulates, max $7,000 |
| Bigger Banks (T4, P2) | Same + max $9,500 | Increased cap |
| Monkey-Nomics (T5, P2) | $9,000/ability | 60s cooldown, 2 uses/round max |
| Marketplace (T3, P3) | $200 | Auto-collect |
| IMF Loan (T4, P3) | $10,000 loan | Repaid at 2x rate from income |
| Monkeyopolis (T5, P3) | Variable | Absorbs nearby Farms |

Banana despawn timer: ~15 seconds. Uncollected bananas are lost. `[CONFIRMED]`

### 8.5 Other Income Sources

- Merchantman (Buccaneer T3, P3): income per round from naval trade.
- Rubber to Gold (Alchemist): golden Bloons drop extra cash.
- Pirate Lord ability (Buccaneer T5, P1): grabs MOAB-class Bloons, converts to cash.
- Bloon Trap (Engineer T2, P2): captures Bloons for cash payout.

---

## 9. Round System & Progression

### 9.1 Round Structure

Each round sends a scripted set of Bloons with defined:
- **Bloon types and counts**
- **Send spacing:** Time gap in tenths of seconds between each spawn. Spacing=20 = 2 seconds between Bloons.
- **Groups:** Multiple Bloon types can be sent simultaneously.

### 9.2 Key Round Milestones

| Round | Notable Content |
|-------|----------------|
| 1–5 | Red and Blue only |
| 6 | Green appears |
| ~16 | First Black/White |
| ~24 | First Camo Bloons |
| ~28 | First Regrow Bloons |
| ~37 | First Lead Bloons |
| ~40 | First MOAB |
| 51 | Cash-per-pop penalty begins |
| ~56 | First Ceramic Bloons |
| ~60 | First BFB |
| ~78 | First DDT |
| ~80 | First ZOMG |
| 81 | Freeplay scaling begins; Super Ceramics replace Ceramics |
| ~90 | DDT with boosted HP (400 -> 480) |
| 100 | First BAD |
| 140 | First Fortified BAD |
| 200 | Two Fortified BADs |

### 9.3 Mode Start/End Rounds

| Mode | Start Round | End Round |
|------|-------------|-----------|
| Easy Deflation | 30 | 60 |
| Easy | 1 | 40 |
| Medium | 1 | 60 |
| Hard | 3 | 80 |
| Impoppable | 6 | 100 |
| CHIMPS | 6 | 100 |
| Freeplay | After win | Infinite |

### 9.4 Freeplay Mode

After the win condition is met, players continue indefinitely. Bloon health and speed scale upward each round using multipliers. Cash-per-pop continues to decrease. Freeplay waves are procedurally generated. `[CONFIRMED]`

---

## 10. Game Modes & Difficulty

### 10.1 Difficulty Settings

| Setting | Lives | Cost | Continues |
|---------|-------|------|-----------|
| Easy | 200 | 0.85x | Yes (free) |
| Medium | 150 | 1.0x | Yes (Monkey Money) |
| Hard | 100 | 1.08x | Yes (Monkey Money) |
| Impoppable | 1 | 1.2x | No |

### 10.2 Sub-modes

**Easy:**
- **Deflation:** Fixed starting cash ($20,000); no income of any kind. Ends Round 60. `[CONFIRMED]`

**Medium:**
- **Apopalypse:** Continuous Bloon stream; rounds advance when enough Bloons are popped. `[CONFIRMED]`
- **Reverse:** Bloons travel the track backwards. `[CONFIRMED]`

**Hard:**
- **ABR (Alternate Bloons Rounds):** Non-standard compositions with heavier Camo/Regrow. `[CONFIRMED]`
- **Half Cash:** All cash from all sources halved. `[CONFIRMED]`
- **Double HP MOABs:** MOAB-class have double HP. `[CONFIRMED]`

### 10.3 CHIMPS Mode

CHIMPS = **No Continues, Hearts lost, Income, Monkey Knowledge, Powers, or Selling.**

Full rules:
1. 1 life; no life restoration of any kind.
2. No income except Bloon pop cash (Banana Farms and other income generators disabled).
   - *Exception:* Bloon Trap and Pirate Lord work because their cash comes from popping Bloons. `[CONFIRMED]`
3. No Monkey Knowledge bonuses.
4. No Powers or Insta-Monkeys.
5. Towers cannot be sold.
6. No Continues.
7. Hard difficulty pricing (1.08x).
8. Starts Round 6, ends Round 100.

Completing CHIMPS = Black medal. Considered the benchmark skill challenge. `[CONFIRMED]`

### 10.4 Sandbox Mode

Available after beating a map once. Freely set round, cash, lives, Bloon type for experimentation. Does not count toward medals or progression. `[CONFIRMED]`

---

## 11. Hero Activated Abilities

### 11.1 Mechanics

- Abilities have a **full initial cooldown** on unlock.
- Cooldowns count down continuously.
- Some abilities have per-round use limits (e.g., Monkey-Nomics: 2 uses/round).
- Cooldown timer shown as a circular overlay on the Hero icon in HUD. `[CONFIRMED]`

### 11.2 Sample Ability Data

| Hero | Level | Ability | Approx. Cooldown |
|------|-------|---------|-----------------|
| Striker Jones | 3 | Concussive Shell (homing stun) | ~20s (6s at L20) |
| Striker Jones | 10 | Artillery Command (+3 speed to Bombs/Mortars) | ~60s |
| Gwendolin | 3 | Cocktail of Fire | ~35s |
| Gwendolin | 10 | Firestorm | ~60s |
| Benjamin | 3 | Syphon Funding ($200/round passive) | ~60s |
| Adora | 10 | Blood Sacrifice | — |

`[APPROX — values subject to balance patches]`

---

## 12. Monkey Knowledge System

### 12.1 Overview

Persistent meta-upgrade system. Unlocked at player Level 30. Disabled in CHIMPS. Provides passive bonuses across all games. `[CONFIRMED]`

### 12.2 Knowledge Trees

| Tree | Focus |
|------|-------|
| Primary | Buffs to Primary Monkeys |
| Military | Buffs to Military Monkeys |
| Magic | Buffs to Magic Monkeys |
| Support | Buffs to Support Monkeys |
| Heroes | Cheaper Heroes, faster XP, spawn with extra levels |
| Powers | Powers-related perks |

### 12.3 Knowledge Points

- 1 point per player level after Level 30.
- Total points to unlock all upgrades: **134**. `[CONFIRMED]`
- Points are spent and not refunded (except via paid Monkey Money reset).

### 12.4 Sample Perks

- Primary: extra starting pierce, cheaper early upgrades.
- Heroes: Hero Favourites (Heroes spawn at level 3 instead of 1).
- Powers: Longer Boosts (Monkey Boost duration 15s → 20s). `[CONFIRMED]`

---

## 13. Powers & Consumables

### 13.1 Overview

One-use consumable items. Purchased with Monkey Money outside of games or earned as rewards. **Disabled in CHIMPS.** `[CONFIRMED]`

### 13.2 Power Types

| Power | Effect | Duration/Notes |
|-------|--------|---------------|
| Monkey Boost | All towers attack at 2x speed | 15s (20s with MK) |
| Banana Farmer | Auto-collects all cash items on map | Periodic sweep |
| Pontoon | Converts water area to land | Temporary `[APPROX]` |
| Ground Zero | Massive bomb strike, pops most Bloons | Single detonation |
| Bloonsday Device | Destroys all Bloons on map | Very powerful |
| Energizing Totem | Speeds up ability cooldowns | Brief duration `[APPROX]` |
| Super Monkey Storm | Super Monkey sweeps entire map | Single use |
| MOAB Mine | Track mine detonates on MOAB-class contact | — |

### 13.3 Insta-Monkeys

Pre-built towers with preset upgrades placed without spending in-game cash. Earned from Round 100 completion, events, Daily Rewards. Disabled in CHIMPS. `[CONFIRMED]`

---

## 14. Map Obstacles & Line of Sight

### 14.1 Removable Obstacles

Most maps have 1–5 removable objects costing $500 (small) or $1,000 (large). Removal is an economic decision — opens placement land or removes LoS blockers. `[CONFIRMED]`

### 14.2 Permanent Obstacles

Logs, stumps, hedgerows, buildings — serve as permanent LoS blockers. Cannot be removed. Blocked LoS zones shown as red in range ring display. `[CONFIRMED]`

### 14.3 LoS Range Display

- When selecting or placing a tower, range ring shows:
  - Dark grey: valid attack zone
  - Red: blocked by LoS obstacle
- Placement circle: white/light when valid, red when invalid. `[CONFIRMED]`

---

## 15. Buff & Synergy System

### 15.1 Stacking Rules

- Most buffs are **additive** within the same category.
- Some buffs are **multiplicative** with each other.
- Village buff radius: only towers within its range circle receive the benefit. `[CONFIRMED]`

### 15.2 Key Tower-to-Tower Synergies

| Buffer | Target | Effect |
|--------|--------|--------|
| Monkey Village (base) | All in range | +10% range |
| Primary Training (V T1, P1) | Primary in range | +1 pierce, +10% range, +25% proj speed |
| MIB (V T4, P3) | All in range | Normal damage type (pops everything) |
| Alchemist Berserker Brew (T3, P1) | Single tower | +speed, +damage, +pierce (temporary) |
| Alchemist Perma Brew (T5, P1) | Single tower | Permanent Berserker Brew |
| Pat Fusty Rallying Roar | All in range | +attack speed (passive) |
| Gwendolin Heat It Up | Nearby towers | +attack speed while Gwendolin attacks |

---

## 16. Boss Bloon Events

### 16.1 Overview

Timed limited events. A unique Boss Bloon appears on a chosen map. `[CONFIRMED]`

### 16.2 Boss Mechanics

- Move along track like normal Bloons, but far more slowly.
- **Skull health system:** At defined HP thresholds, Boss triggers special retaliations.
- 5 tiers of HP.
- Two modes: **Normal** and **Elite** (higher HP, stronger abilities, better rewards). `[CONFIRMED]`

### 16.3 Boss Profiles

**Bloonarius the Inflator**
- Continuously spawns Bloon waves in front of itself while taking damage.
- Skull trigger: Massive Bloon wave spawns immediately ahead of it.

**Lych the Soul Stealer**
- Resurrects defeated towers as zombie monkeys for its side.
- Can steal activated abilities temporarily.
- Each skull permanently removes a recently-placed tower type for the rest of the encounter.

**Vortex: Deadly Master of Air**
- Fast-moving relative to other bosses.
- Skull trigger: Stuns all towers on map for several seconds; resets its own speed.

**Dreadbloon: Armored Behemoth**
- Armored exterior that regenerates.
- Skull trigger: Temporary invincibility + Ceramic wave spawn.
- Rock Bloons orbit it as shields.

**Phayze: Reality Warper**
- Reality Shield: extra HP buffer that regenerates after each skull.
- Skull trigger: Shield restored, speed boost, portal spawns to reposition Bloon entry point.
- At Skull 1: Gains a slow aura reducing all on-screen tower attack speed. Aura persists and strengthens at each subsequent skull. `[CONFIRMED]`

### 16.4 Tier System

Each Boss has 5 HP tiers. Completing a tier grants rewards. Paragon limit of 4 applies in Boss Events. `[CONFIRMED]`

---

## 17. Co-op Mode

### 17.1 Setup

2–4 players, peer-to-peer. Divided territories (usually quadrant-based). `[CONFIRMED]`

### 17.2 Territory Rules

- Players can only place towers in their own territory.
- Other players cannot interact with another's towers except for Sun Temple/True Sun God/Paragon absorptions (consent required). `[CONFIRMED]`

### 17.3 Starting Cash

Reduced per extra player: -$100 per additional player (-$50 in Half Cash). `[CONFIRMED]`

### 17.4 Cash Sharing

| Player has | Amount sent |
|------------|------------|
| $500+ | 20% of current cash |
| $100–$499 | $100 |
| <$100 | All cash |

Income buff extra cash (Monkey Town, etc.) distributes proportionally to all players. `[CONFIRMED]`

### 17.5 Shared Mechanics

- Lives are shared among all players.
- XP: Tower XP to tower owner; player level XP to all equally. `[CONFIRMED]`
- Tower limits in challenge modes count all players' towers combined. `[CONFIRMED]`

---

## 18. Player Progression System

### 18.1 Player Level (Account Rank)

- XP earned from round completions only (not Bloon pops directly).
- Map difficulty multiplies XP: Intermediate +10%, Advanced +20%, Expert +30%. `[CONFIRMED]`
- Level cap: **155**. After 155, Veteran Levels begin (cosmetic only, every 20,000,000 XP). `[CONFIRMED]`

### 18.2 Tower XP

- Each of the 22 towers has its own independent XP track.
- Tower XP unlocks upgrade tiers in order (T1 before T2, etc.).
- 22 towers x 3 paths x 5 tiers = 330 unlockable upgrades. `[CONFIRMED]`

### 18.3 Monkey Money

Premium meta-currency. Earned from:
- First completions of map/mode combinations
- Daily Challenges, Odysseys, Races
- Events
- Real-money purchase

Spent on:
- Heroes (300–600 MM each)
- Powers
- Continues after death (Hard/Medium)
- Cosmetics (tower/hero skins, music, map art)
- Monkey Knowledge reset `[CONFIRMED]`

### 18.4 Medals

One medal per map per mode combination:
- Bronze: Easy
- Silver: Medium
- Gold: Hard
- Black: CHIMPS `[CONFIRMED]`

---

## 19. Challenge Editor & Community Modes

### 19.1 Challenge Editor (Version 9.0+)

Allows custom challenges with: fixed map/difficulty, custom cash/lives/round range, tower whitelist/blacklist, max tower counts, forced hero selection, custom round modifiers. Shareable via code. Daily Challenges are curated from community submissions. `[CONFIRMED]`

### 19.2 Odyssey Mode

Multi-map campaign with linked health pool. Towers carry over between maps; lost towers are gone. Odyssey Creator (Version 26.0+) allows player-made Odysseys. `[CONFIRMED]`

### 19.3 Contested Territory

Online asynchronous competitive mode. Players compete on shared territory tiles by posting scores. Trophies awarded for territorial control. Paragon cap of 4. `[CONFIRMED — limited detail]`

### 19.4 Races

Time-trial events. Players compete to complete a specific map/challenge fastest. Trophy Points awarded. `[CONFIRMED]`

---

## 20. Visual Design & Art Direction

### 20.1 Rendering

- First BTD game with full **3D graphics** — significant departure from all prior 2D entries.
- **Fixed top-down perspective** (no camera rotation or zoom in standard play).
- Art direction led by **Aimee Cairns** (concept artist and art lead). Presented at NZGDC18. `[CONFIRMED]`
- Design challenge: transitioning a beloved 2D IP to 3D while preserving mobile performance. `[CONFIRMED]`

### 20.2 Art Style

- **Cartoon 3D** — rounded forms, exaggerated proportions, bright saturated colors.
- Bloons: 3D rounded balloon shape with a signature specular highlight.
- Monkeys: stylized animal characters with large expressive features and readable silhouettes.
- Tower visual language by category:
  - Primary: simple, mechanical, budget feel
  - Military: camo, metal, military-industrial
  - Magic: glowing, ornate, arcane
  - Support: functional, industrial, agricultural

### 20.3 Scale Reference

- Bloons are roughly beach-ball sized relative to a track segment. `[INFERRED]`
- MOAB-class scale up dramatically: MOAB is ~4–6x the diameter of a Ceramic. BAD spans nearly the full track width. `[INFERRED]`

### 20.4 Animation

- Towers: idle (rotation, fidgeting) + attack animations.
- Projectiles: travel animation + impact effects (explosions, freeze clouds, fire particles).
- Bloon pops: burst animation revealing colour-matched children.
- MOAB-class pops: dramatic explosion + debris.
- Hero abilities: distinct VFX per hero.

### 20.5 HUD Layout

```
+------------------------------------------------------------+
| [Round X/Y]   [Lives: ♥ ###]   [$$$]          [Pause] [>>]|  <- Top bar
+------------------------------------------------------------+
|                                                            |
|                   MAP / GAMEPLAY AREA                      |
|                                                            |
+------------------------------------------------------------+
| [Tower shop panel]                                         |
| [Selected tower panel — upgrade paths, targeting, sell]    |
+------------------------------------------------------------+
```

**Top bar elements:**
- Round counter (current / total)
- Lives (heart icon + number; colour: green → yellow → red as lives drop)
- Cash ($ icon + live-updating number)
- Fast-Forward toggle
- Pause button

**Tower shop:** Scrollable list/grid. Towers grey out when insufficient cash. Drag to map to enter placement mode with range ring.

**Tower selection panel (on click):**
- Tower name + current upgrade notation (e.g., "2-3-0")
- Three upgrade path columns: current tier, next upgrade name, cost, locked state
- Targeting priority selector (dropdown or cycle)
- Sell button with refund value shown

**Hero panel:** Portrait + level + XP bar + ability buttons with cooldown overlay. `[CONFIRMED — layout inferred from gameplay footage]`

### 20.6 Range Display

When tower selected or during placement:
- Translucent circle overlay on map.
- Dark grey = valid attack zone; red = LoS blocked.
- Placement: white/light = valid; red = invalid position. `[CONFIRMED]`

---

## 21. Audio Design

### 21.1 Music

- Composer: **Tim Haywood**. Soundtrack available as standalone Steam DLC, continuously updated.
- Signature instrument: **the zither** — appears as a recurring motif across nearly all tracks.
- Adaptive style: upbeat during early rounds, escalating during late-game, orchestral during MOAB-heavy rounds.
- Boss theme "Primal One": C minor — strings, electric guitar, horns, bass guitar, zither, drums, synthesizer, vibraphone. `[CONFIRMED]`
- Each map has its own ambient/music track reflecting visual theme.

### 21.2 Sound Design

- Each Bloon type has a distinct pop sound:
  - Red: soft pop
  - Lead: heavy metallic clunk
  - Ceramic: cracking/shattering
  - MOAB: large boom
  - BAD: massive explosion + rumble
- Each tower has a distinct firing sound:
  - Tack Shooter: rapid ticks
  - Mortar: distant thunk + whistle + impact boom
  - Ice Monkey: crystalline freeze chime
  - Dartling Gunner: rapid mechanical gunfire
- Hero voice lines: each Hero has unique voiced attack and ability quotes. `[CONFIRMED]`
- Distinct audio stings mark round start and round end transitions.

---

## 22. Technical Architecture (Observed Patterns)

### 22.1 Engine

Unity. `[CONFIRMED via build artifacts and developer references]`

### 22.2 Coordinate System

Map units with floating-point subpixel accuracy. No fixed resolution — scales to device viewport. All game logic in world space. `[CONFIRMED — NZGDC18]`

### 22.3 Physics / Collision

- Projectiles: custom vector movement (not Unity physics).
- Bloon movement: scripted path-following via parameterized track position.
- Bloon-projectile collision: circle-circle overlap tests. `[INFERRED]`
- Pierce consumed per-Bloon-hit. Area-persistence effects have a re-hit delay (Wall of Fire: 0.15s). `[CONFIRMED]`

### 22.4 Attack Cooldown Implementation

```
// Pseudocode
tower.cooldownTimer -= deltaTime
if tower.cooldownTimer <= 0 and targetInRange:
    beginAttackAnimation()
    // After fireDelayTime seconds:
    spawnProjectile()
    tower.cooldownTimer = tower.cooldownTime
```

`[CONFIRMED — from wiki mechanic descriptions]`

### 22.5 Track Parameterization

```
// Pseudocode
bloon.distanceAlongTrack += bloon.speed * deltaTime
bloon.position = trackCurve.evaluateAt(bloon.distanceAlongTrack)
```

- "First" targeting = highest distanceAlongTrack value
- "Last" targeting = lowest distanceAlongTrack value

`[INFERRED — confirmed by observed BTD6 behavior]`

---

## 23. Edge Cases & Known Design Quirks

1. **Purple immunity scope:** Energy/laser/magic cannot pop Purple, but explosions can. Purple appears exclusively in BTD6 (new to this entry). `[CONFIRMED]`

2. **DDT triple immunity:** Camo + Lead + Black simultaneously requires defeating all three resistances. MIB or specific upgrade paths are key counters. `[CONFIRMED]`

3. **BAD immune to all CC:** Only raw damage is effective against the BAD. `[CONFIRMED]`

4. **Fortified scope:** Cannot apply to Red–Pink tier Bloons. Only Lead, Ceramic, and MOAB-class. `[CONFIRMED]`

5. **Regrow spiral:** Continuously damaged Regrow Bloons that are not fully destroyed will fill the track. Must deal enough consistent DPS to prevent regrow loop. `[CONFIRMED]`

6. **Sun Temple sacrifice is permanent:** Towers sacrificed to Sun Temple are consumed forever. Sacrifice category determines which buff category the Temple receives. `[CONFIRMED]`

7. **Sell value includes upgrades:** 70% refund applies to base cost + all upgrades spent. `[CONFIRMED]`

8. **CHIMPS income technicality:** Bloon Trap and Pirate Lord work in CHIMPS because their cash source is Bloon pops, not direct income generation. Intentional. `[CONFIRMED]`

9. **Paragon Degree cap at 100:** Additional investment beyond Degree 100 has no effect. `[CONFIRMED]`

10. **Co-op territory boundaries:** A tower placed on a boundary belongs to the player who placed it. The other player cannot interact with it. `[CONFIRMED]`

11. **Fast Forward and ability durations:** Activating Fast Forward during a timed ability does not reduce its real-time duration. Effects still last stated real-world seconds. `[INFERRED]`

12. **Geared map misclassification:** Categorized as Advanced but historically considered Expert-level by the community. `[CONFIRMED]`

---

## 24. Systems Interaction Map

| System A | Interacts with | System B | Relationship |
|----------|---------------|----------|-------------|
| Bloon Properties | → | Damage Types | Camo blocks targeting; Lead blocks Sharp; Frozen blocks Sharp; Purple blocks Energy/Fire/Magic |
| Tower Upgrade Paths | → | Damage Types | Upgrades change damage type (e.g., Wizard fire path unlocks Fire type) |
| Monkey Village MIB | → | All Towers in radius | Overrides all immunity by granting Normal damage type |
| Hero Level | → | Ability Cooldowns | Higher level reduces ability cooldown time |
| Round Number | → | Cash per Pop | Higher rounds = less income per pop (tax schedule) |
| Round Number | → | MOAB HP Scaling | Freeplay rounds exponentially scale MOAB-class HP |
| Difficulty | → | Tower Cost | Multiplier applied to all purchase prices |
| CHIMPS Mode | → | Economy | Disables all income except pop-based cash |
| Banana Farm | → | Player Action | Bananas must be manually collected or auto-collect upgraded; despawn on 15s timer |
| Alchemist Perma Brew | → | Tower Stats | Permanently overwrites buffed tower's base stats (up to 5 stacks) |
| Paragon Degree | → | Paragon Power | Degree 1–100 scales damage, range, pierce |
| Co-op Player Count | → | Starting Cash | Each additional player reduces starting cash proportionally |
| Regrow Property | → | Tower DPS | Insufficient DPS allows Bloons to regrow, potentially filling track |
| Crosspathing | → | Upgrade Cost | Secondary path upgrades (T1–T2) are cheaper than primary path equivalents |
| Fortified Property | → | Bloon HP | Doubles HP of eligible Bloon types only |

---

## 25. Gaps & Items Requiring Verification

The following areas have limited confirmed data and must be verified against current game files or the Bloons Wiki before implementation:

1. **Exact base stats for all 22 towers** (range, cooldown, damage, pierce at 0-0-0). Best source: individual Stats pages on Blooncyclopedia.
2. **Exact bloon send data for Rounds 1–100** (type, count, spacing per sub-group). Best sources: `https://topper64.co.uk/nk/btd6/rounds/` and the Blooncyclopedia round list.
3. **Freeplay scaling formula** (exact HP multiplier per round beyond Round 81).
4. **Exact difficulty speed multipliers** for Bloons on Easy vs Hard.
5. **Paragon Degree formula weights** (contribution of each factor to degree calculation).
6. **Current Hero list and full ability specs** — Corvus, Rosalia, and Silas are recent additions; verify all ability values against current patch notes.
7. **Boss HP values for all 5 tiers** of each boss (Normal and Elite).
8. **Contested Territory full scoring mechanics**.
9. **All 134 Monkey Knowledge node values**.
10. **Per-map obstacle removal costs**.

---

## Sources

- [Bloons TD 6 | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Bloons_TD_6)
- [MOAB-Class Bloon | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/MOAB-Class_Bloon)
- [Heroes (BTD6) | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Heroes_(BTD6))
- [C.H.I.M.P.S. | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/C.H.I.M.P.S.)
- [Paragons | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Paragons)
- [Crosspathing | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Crosspathing)
- [Maps | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Maps)
- [Status Effects | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Status_Effects)
- [Targeting Priority | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Targeting_Priority)
- [Rounds (BTD6) | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Rounds_(BTD6))
- [Late Game and Freeplay (BTD6) | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Late_Game_and_Freeplay_(BTD6))
- [Monkey Knowledge (BTD6) | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Monkey_Knowledge_(BTD6))
- [Income Farming (BTD6) | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Income_Farming_(BTD6))
- [Co-Op Mode (BTD6) | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Co-Op_Mode_(BTD6))
- [Bloon Properties | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Bloon_Properties)
- [Line of Sight | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Line_of_Sight)
- [Attack Interactions | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Attack_Interactions)
- [Selling | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Selling)
- [Boss Bloon | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Boss_Bloon)
- [The Art of BTD6: You're Making it 3D!? — NZGDC18](https://nzgdc18.sched.com/event/FXWy/the-art-of-btd6-youre-making-it-3d)
- [List of music in BTD6 — Blooncyclopedia](https://www.bloonswiki.com/List_of_music_in_BTD6)
- [All BTD6 Monkeys & Upgrades — Basically Average](https://basicallyaverage.com/btd6-monkeys/)
- [Attack speed — Blooncyclopedia](https://www.bloonswiki.com/Attack_speed)
- [Banana Farm (BTD6) — Blooncyclopedia](https://www.bloonswiki.com/Banana_Farm_(BTD6))
- [BTD6 Rounds — topper64.co.uk](https://topper64.co.uk/nk/btd6/rounds/)
- [Experience Points | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Experience_Points)
- [Powers (BTD6) | Bloons Wiki | Fandom](https://bloons.fandom.com/wiki/Powers_(BTD6))
