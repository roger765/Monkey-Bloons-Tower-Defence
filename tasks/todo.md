# BTD6 Replica — Task Plan

## RPI Workflow: btd6-replica

### Phase: Research
- [x] Read REQUEST.md and BTD6-REFERENCE.md
- [ ] Write rpi/btd6-replica/research.md (feasibility, tech decisions, risk flags)

### Phase: Planning
- [ ] Write rpi/btd6-replica/pm.md (product brief, acceptance criteria)
- [ ] Write rpi/btd6-replica/ux.md (HUD layout, interaction flows, state diagrams)
- [ ] Write rpi/btd6-replica/eng.md (architecture, data models, implementation slices)
- [ ] Write rpi/btd6-replica/PLAN.md (consolidated build plan)

### Phase: Implementation
- [ ] Project scaffold: package.json, tsconfig, webpack/vite config, index.html
- [ ] Phaser 3 boot scene and asset loader
- [ ] Map: Monkey Meadow (single-path track with waypoints)
- [ ] Bloon system: all types, hierarchy, properties (Camo/Regrow/Fortified), movement
- [ ] MOAB-class bloons (MOAB, BFB, ZOMG)
- [ ] Damage system: types, immunities, pierce, status effects
- [ ] Tower base class and 6 Primary towers with all 3 upgrade paths
- [ ] Targeting system (First/Last/Strong/Close/Far)
- [ ] Round system: Rounds 1-80 scripted schedule
- [ ] Economy: cash per pop, end-of-round bonus, sell refund
- [ ] HUD: lives, cash, round, fast-forward, tower shop, selection panel
- [ ] Game modes: Easy/Medium/Hard
- [ ] Win/loss/continue logic
- [ ] Line of sight (simplified)
- [ ] Polish: visual feedback, range rings, status effect visuals

### Review
- [ ] Verify all Phase 1 success criteria from REQUEST.md
