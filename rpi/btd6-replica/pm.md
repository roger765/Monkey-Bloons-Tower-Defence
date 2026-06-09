# Product Brief: BTD6 Replica — Phase 1

**Feature slug:** btd6-replica  
**PM:** Planning phase  
**Date:** 2026-06-07  
**Scope:** Phase 1 (Playable Core MVP)

---

## Problem Statement

Build a faithful, browser-playable replica of Bloons TD 6's core experience. Target user is Roger White (and future players) who want to play a BTD6-style game without installing anything. All code written by Claude.

---

## Success Criteria (Phase 1 Definition of Done)

1. A complete game session runs from Round 1 to Round 40 (Easy win condition) without crashing
2. All 6 Primary towers (Dart, Boomerang, Bomb, Tack, Ice, Glue) can be placed, attack correctly, and upgrade through all 3 paths with crosspathing enforced
3. Bloon hierarchy spawns correct children on pop: correct type, count, and property inheritance
4. MOAB, BFB, and ZOMG appear on correct rounds with correct HP values
5. Economy matches reference: $1/HP-removed, end-of-round bonus ($100+R), 70% sell refund
6. All 5 targeting modes (First, Last, Strong, Close, Far) select the correct target
7. Status effects (Freeze, Glue, Stun, Burn DoT) apply correctly and respect all immunity rules
8. HUD displays accurate live values (lives, cash, round) throughout a session
9. Easy/Medium/Hard modes apply correct lives and cost multipliers
10. Loss condition (lives = 0) triggers game over; win condition (round 40/60/80) triggers win screen

---

## Scope

### In Scope (Phase 1)

**Map:** 1 map — Monkey Meadow equivalent (single-path, beginner difficulty, generous placement space)

**Towers (6 Primary):**
- Dart Monkey — single dart, 2 pierce, Sharp damage
- Boomerang Monkey — arc throw, 3 pierce, Sharp damage
- Bomb Shooter — explosive AoE, Explosion damage, pops Lead
- Tack Shooter — 8 tacks at 45-degree intervals, 360 coverage
- Ice Monkey — AoE freeze, no base damage, Cold damage type
- Glue Gunner — 50% slow, no base damage, Normal damage type

Each tower: all 3 upgrade paths, 5 tiers each = 15 upgrades per tower = 90 upgrades total

**Bloon types:**
- Basic: Red, Blue, Green, Yellow, Pink, Black, White, Zebra, Rainbow, Ceramic, Lead
- MOAB-class: MOAB (R40), BFB (R60), ZOMG (R80)
- Properties: Camo, Regrow, Fortified

**Damage system:** Sharp, Explosion, Fire, Cold, Energy/Laser, Normal — with all immunity interactions per reference Section 6.1

**Targeting:** First, Last, Strong, Close, Far

**Status effects:** Freeze (stops movement + Sharp immunity), Glue slow (50%), Stun (stops movement, no Sharp immunity), Burn DoT

**Economy:** $1/HP-removed (per-pop), end-of-round bonus ($100+R), 70% sell refund, cash-per-pop tax (Round 51+)

**Round schedule:** Rounds 1–80 scripted

**Game modes:** Easy (200 lives, 0.85x cost), Medium (150 lives, 1.0x), Hard (100 lives, 1.08x)

**HUD:** Round counter, lives, cash, fast-forward (3x), pause, tower shop, tower selection panel (upgrades, targeting, sell), range ring on hover/select

**Win/Loss/Continue:** Win screen on final round, loss on lives=0, continue option on Easy/Medium

**Line of Sight:** Simplified rectangular LoS blockers

### Out of Scope (Phase 1)

- Heroes
- Military, Magic, Support towers
- DDT, BAD bloon types
- CHIMPS mode, Apopalypse, Reverse, ABR, Half Cash, Double HP MOABs
- Banana Farm income
- Co-op
- Monkey Knowledge
- Powers/Insta-Monkeys
- Additional maps
- Freeplay scaling (Round 81+)
- Sound effects and music
- Proper sprite art (programmatic graphics for Phase 1)
- Mobile touch controls (best-effort only)

---

## User Stories

**As a player, I want to:**
- Select a difficulty (Easy/Medium/Hard) before starting a game
- Place a tower by clicking it in the shop then clicking a valid position on the map
- See the tower's range ring before and after placement
- Attack automatically once the round starts
- Upgrade a placed tower by clicking it and selecting an upgrade tier
- See crosspathing restrictions enforced (can't buy T3 on two paths)
- See bloons move along the track and take damage from towers
- Watch bloons pop and spawn correct children
- Lose lives when bloons exit the track
- Earn cash from pops and end-of-round bonus
- Win when I survive to the final round
- Lose and be offered a continue (Easy/Medium) or game over (Hard)
- Toggle 3x speed at any time during a round

---

## Risk Flags

- Content volume: 90 upgrades and 80 rounds of data must be accurate — test core mechanics before filling all data
- LoS simplification is acceptable for Phase 1 but will need upgrade for Intermediate/Advanced maps in Phase 2
- Round 51+ cash penalty must be implemented to prevent late-game economy from being trivially easy
