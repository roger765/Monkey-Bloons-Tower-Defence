# Feature Request: BTD6 Faithful Replica

## Summary

Build a faithful browser-based replica of Bloons TD 6 (BTD6) by Ninja Kiwi. The game is a tower-defence title where the player places monkey-themed towers on a map to pop waves of enemy balloons (Bloons) before they exit the track and drain lives.

## Context

- **Developer:** Solo — Roger White (no coding experience). All code written by Claude.
- **Platform:** Web browser (no install required). TypeScript + Phaser 3.
- **Reference document:** `BTD6-REFERENCE.md` in project root — a 25-section research document covering all game systems, mechanics, visual design, audio, and technical architecture. This is the primary source of truth for implementation decisions.
- **Assets:** Original art and audio — inspired by BTD6's style but built from scratch (no Ninja Kiwi assets used).

## Definition of "Faithful"

The replica should reproduce BTD6's core experience with fidelity to its systems, feel, and progression. Specifically:

- Bloons move along a defined track at typed speeds, layered hierarchy, correct immunities
- Towers have ranges, cooldowns, pierce, damage, and damage types that match the reference
- The 3-path upgrade system with crosspathing rules (max T2 on secondary paths when primary is T3+)
- Economy: cash per pop, end-of-round bonus, Banana Farm income, sell refund at 70%
- Game modes: at minimum Easy/Medium/Hard/CHIMPS with correct lives/cost multipliers
- Targeting priorities: First, Last, Strong, Close, Far
- Status effects: Freeze, Glue (slow), Stun, Burn/DoT with correct immunity interactions

## Scope — Phased Approach

### Phase 1 — Playable Core (MVP)
- 1 map (Monkey Meadow equivalent — simple beginner single-path layout)
- 6 Primary towers: Dart Monkey, Boomerang Monkey, Bomb Shooter, Tack Shooter, Ice Monkey, Glue Gunner
- All 3 upgrade paths per tower (5 tiers each), crosspathing rules enforced
- Full Bloon hierarchy: Red → Blue → Green → Yellow → Pink → Black → White → Zebra → Rainbow → Ceramic → Lead
- Bloon properties: Camo, Regrow, Fortified
- MOAB-class: MOAB, BFB, ZOMG
- Targeting system: First, Last, Strong, Close, Far
- Economy: cash per pop, end-of-round bonus, sell at 70%
- Damage types and immunities (Sharp, Explosion, Fire, Cold, Energy, Normal)
- Status effects: Freeze, Glue slow, Stun, Burn DoT
- Game modes: Easy, Medium, Hard (lives + cost multipliers)
- Rounds 1–80 scripted bloon send schedule
- HUD: round counter, lives, cash, fast-forward toggle, tower shop, tower selection panel with upgrade paths
- Line of sight (LoS) blocking by obstacles
- Win/loss conditions, continue mechanic

### Phase 2 — Extended Content
- 3 Military towers: Sniper Monkey, Monkey Sub, Monkey Buccaneer
- 2 Magic towers: Wizard Monkey, Ninja Monkey
- 2 Support towers: Banana Farm, Monkey Village (with MIB buff)
- DDT and BAD bloon types
- CHIMPS mode
- 2 additional maps (one Intermediate, one Advanced)
- 1 Hero (Quincy — simplest hero, 1.0x XP ratio)
- Sandbox mode
- Freeplay scaling (Round 81+)

### Phase 3 — Full Parity
- Remaining towers (Heli Pilot, Mortar, Dartling, Super Monkey, Alchemist, Druid, Spike Factory, Engineer)
- All remaining Heroes
- Paragon system
- Monkey Knowledge system
- Powers and Insta-Monkeys
- Co-op mode
- Boss Bloon events
- Additional maps (full complement)
- Challenge Editor

## Key Constraints

- Must run in a modern browser without installation
- Performance target: 60fps with 50+ towers and 200+ Bloons on screen simultaneously
- Mobile-friendly layout desirable but not Phase 1 blocker
- No Ninja Kiwi IP — original assets only (art style inspired, not copied)
- All code written by Claude; user interacts via the project

## Success Criteria (Phase 1)

1. A game session can be started, played to Round 40 (Easy win), and lost correctly
2. All 6 Primary towers place, attack, and upgrade correctly with crosspathing enforced
3. Bloon hierarchy spawns correct children on pop with correct immunities
4. MOAB, BFB, ZOMG appear on correct rounds with correct HP
5. Economy (cash/pop, end-of-round, sell refund) matches reference values
6. All 5 targeting modes function correctly
7. Freeze/glue/stun/burn interactions respect immunity rules
8. HUD displays correct live values throughout a game session

## Reference

See `BTD6-REFERENCE.md` in the project root for complete system specifications including exact stat values, round schedules, damage type tables, upgrade path details, and known gaps requiring verification.
