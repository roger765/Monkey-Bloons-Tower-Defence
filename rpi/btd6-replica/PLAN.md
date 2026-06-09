# PLAN.md: BTD6 Replica — Phase 1

**Feature slug:** btd6-replica  
**Date:** 2026-06-07  
**Status:** Ready to implement

---

## Summary

Build a browser-playable BTD6-faithful tower defence game using TypeScript + Phaser 3 + Vite. Phase 1 delivers 6 Primary towers, 14 bloon types, 80 scripted rounds, 3 game modes, and full HUD — playable end-to-end from Round 1 to win condition.

---

## Documents

| Doc | Location | Purpose |
|-----|----------|---------|
| Research | `rpi/btd6-replica/research.md` | Feasibility, stack validation, risk register |
| PM Brief | `rpi/btd6-replica/pm.md` | Success criteria, scope, user stories |
| UX Brief | `rpi/btd6-replica/ux.md` | Screen flows, layouts, color language |
| Eng Spec | `rpi/btd6-replica/eng.md` | Architecture, data models, build slices |
| Reference | `BTD6-REFERENCE.md` | System specs, stat values, source of truth |

---

## Build Slices (ordered)

| # | Slice | Key deliverable |
|---|-------|----------------|
| 1 | Scaffold | Vite + TS project boots, main menu shows |
| 2 | Map | Monkey Meadow track renders |
| 3 | Bloons | Red bloon moves along track, exits, drains life |
| 4 | Tower placement | Dart Monkey places, attacks, projectile fires |
| 5 | Damage | Bloon hierarchy cascade, immunity checks |
| 6 | Targeting | All 5 targeting modes work on Dart Monkey |
| 7 | All 6 towers | Each tower fires correctly (bomb AoE, tack 8-dir, ice freeze, glue slow) |
| 8 | Upgrades | All 90 upgrades purchasable, crosspath enforced |
| 9 | Status effects | Freeze, Glue, Stun, Burn DoT all function with correct immunities |
| 10 | MOAB-class | MOAB/BFB/ZOMG spawn, take damage, release children |
| 11 | Rounds 1-80 | Full scripted schedule, wave end detection |
| 12 | Economy + HUD | Cash, lives, sell, end-of-round bonus, full HUD |
| 13 | Game modes | Easy/Medium/Hard lives/costs, win/loss/continue |
| 14 | Polish | Fast-forward, pause, range rings, difficulty selector |

---

## Success Criteria Checklist

From REQUEST.md:

- [ ] 1. Complete game session from Round 1 to Round 40 (Easy) without crash
- [ ] 2. All 6 Primary towers place, attack, upgrade correctly; crosspathing enforced
- [ ] 3. Bloon hierarchy spawns correct children on pop with correct immunities
- [ ] 4. MOAB, BFB, ZOMG appear on correct rounds with correct HP
- [ ] 5. Economy matches reference (cash/pop, end-of-round, 70% sell refund)
- [ ] 6. All 5 targeting modes function correctly
- [ ] 7. Freeze/glue/stun/burn interactions respect immunity rules
- [ ] 8. HUD displays correct live values throughout session

---

## Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Engine | Phaser 3.80 | Purpose-built 2D game engine, WebGL, path curves, TS native |
| Bundler | Vite 5 | Zero-config TS, fast HMR, static output |
| Assets | Programmatic (Phaser Graphics API) | No IP issues, no load time, Phase 1 sufficient |
| Track | Waypoint array + linear interpolation | Simple, accurate, easy to edit |
| Bloons | Object pool (Group) | 300 bloon pool handles peak wave density |
| Projectiles | Object pool (Group) | 500 projectile pool handles burst fire |
| LoS | Simplified rectangular blockers | Full polygon LoS deferred to Phase 2 |
| Round data | Handcrafted TypeScript constants | Based on reference milestones, iterable |

---

## Phase 2 Backlog Items (do not implement now)

- Military towers (Sniper, Sub, Buccaneer)
- Magic towers (Wizard, Ninja)
- Support towers (Banana Farm, Village)
- DDT and BAD bloon types
- CHIMPS mode
- 2 additional maps
- Hero system (Quincy)
- Sandbox mode
- Freeplay scaling (Round 81+)
- Sound effects and music
- Proper sprite art
- Mobile touch controls
