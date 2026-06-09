# Research Report: BTD6 Replica — GO/NO-GO Assessment

**Feature slug:** btd6-replica  
**Researcher:** Orchestrator (research phase)  
**Date:** 2026-06-07  
**Verdict:** GO — Phase 1 is technically feasible with the chosen stack

---

## 1. Technical Feasibility

### 1.1 Stack Validation: TypeScript + Phaser 3

Phaser 3 is purpose-built for exactly this class of game:

- **2D game engine** with WebGL/Canvas rendering, handles 200+ sprites at 60fps on mid-range hardware
- **Native path-following support** via Phaser.Curves.Path — directly maps to BTD6's track parameterization pseudocode in Section 22.5 of the reference doc
- **Physics-optional** — we use custom vector movement for projectiles (matching BTD6's custom movement, Section 22.3), so no physics overhead
- **TypeScript-first** — Phaser 3.60+ ships with official TS declarations
- **Browser native** — bundles to a single JS file, runs without install

Performance ceiling: Phaser 3 handles 500+ gameObjects at 60fps in WebGL mode. Phase 1 requires 200+ bloons + 50+ towers + projectiles. This is within Phaser's comfortable operating range, especially with object pooling for bloons and projectiles.

**Risk:** Canvas fallback (for older browsers) has lower throughput. Mitigation: target WebGL explicitly, with a warning for unsupported browsers.

### 1.2 Asset Strategy

BTD6 uses Unity with 3D assets. Our replica is 2D browser-based. Solution:

- **Programmatically generated graphics** using Phaser's Graphics API for all Phase 1 assets — no external art files required
- Bloons: colored circles with a specular highlight (matching the reference's "rounded balloon shape")
- Towers: colored rectangles or simple polygon shapes with a rotation indicator
- Track: rendered as a colored polygon/path strip
- This approach means zero asset loading time, no IP issues, and rapid iteration

Phase 2 can introduce proper sprite sheets.

### 1.3 Track System

BTD6 uses bezier curves or polylines (Section 3.3). Implementation:

- Define Monkey Meadow as an array of waypoints (x,y in world space)
- Use Phaser.Curves.Path with linear spline between waypoints
- Each bloon stores `distanceAlongTrack` and advances it per frame
- `path.getPoint(t)` converts normalized t (0–1) to world position
- "First" targeting = highest distanceAlongTrack; "Last" = lowest (directly matches Section 22.5)

### 1.4 Upgrade System Complexity

The 3-path, 5-tier upgrade system with crosspathing is data-driven and deterministic. Key insight: crosspathing enforcement is a simple rule (if any path >= T3, all others cap at T2). This is a few lines of validation logic, not a complex system.

Each tower's upgrade data is a static config object: 3 arrays of 5 upgrades, each upgrade containing name, cost, and a diff function that modifies tower stats.

### 1.5 Bloon Hierarchy

The cascade (popping a bloon spawns children) maps to a recursive `pop()` method. Each bloon type knows its children. Status effects (Freeze, Glue, Burn) are property flags on the bloon instance, checked during targeting and damage application.

### 1.6 Round Scripting

Rounds 1–80 require a scripted send schedule. The reference doc (Section 9.2) provides milestones but not exact send data. The BTD6 round data source (`topper64.co.uk/nk/btd6/rounds/`) was identified in Section 25 as the best external source.

**Decision:** Script Rounds 1–80 manually based on the reference milestones. This is sufficient for a faithful replica without needing exact Ninja Kiwi data. The schedule will be a TypeScript constant array with per-round bloon group definitions (type, count, spacing).

### 1.7 Line of Sight

Full LoS raycasting against arbitrary obstacle geometry is the most complex Phase 1 feature. Simplification strategy:

- Monkey Meadow (beginner map) has minimal LoS blockers per the reference
- Implement a simplified LoS system: define obstacles as rectangles, use segment intersection tests for range ring display
- Attack targeting uses a simpler "is bloon in range circle" check with an optional obstacle exclusion zone
- Full polygon LoS can be upgraded in Phase 2

---

## 2. Architecture Decisions

### 2.1 Scene Structure

```
BootScene       → Load assets (programmatic, instant)
MainMenuScene   → Difficulty/mode selection
GameScene       → Core game loop (main scene)
UIScene         → HUD overlay (parallel scene, non-pausing)
GameOverScene   → Win/loss/continue
```

Running UIScene parallel to GameScene (Phaser supports this) keeps HUD updates clean without coupling to game loop state.

### 2.2 Game State Management

Single `GameState` object owned by GameScene:
- round, lives, cash, isRunning, speed (1x/3x)
- towers: Tower[]
- bloons: Bloon[] (active)
- projectiles: Projectile[]

All systems read/write GameState. No global mutable state outside this object.

### 2.3 Object Pooling

Bloons and projectiles are the high-frequency objects. Use Phaser.GameObjects.Group with `createMultiple` and active/inactive flags. Pool size: 300 bloons, 500 projectiles.

### 2.4 Data-Driven Towers

Each tower type is a config object + a class extending `BaseTower`. No switch statements in the game loop — polymorphism handles type-specific behavior.

```typescript
interface TowerConfig {
  id: string
  name: string
  cost: number      // Medium price
  range: number
  cooldown: number  // seconds
  damage: number
  pierce: number
  damageType: DamageType
  upgrades: [UpgradePath, UpgradePath, UpgradePath]
}
```

### 2.5 Bloon Data Model

```typescript
interface BloonData {
  type: BloonType
  speed: number
  hp: number         // current HP (for Ceramics)
  maxHp: number
  children: BloonType[]
  immunities: DamageType[]
  isCamo: boolean
  isRegrow: boolean
  isFortified: boolean
  distanceAlongTrack: number
  statusEffects: StatusEffect[]
}
```

---

## 3. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Performance at 200+ bloons | Low | High | Object pooling + WebGL mode |
| Upgrade system data volume (6 towers x 3 paths x 5 tiers = 90 upgrades) | Medium | Low | Data-driven config, write once |
| Round scripting accuracy | Medium | Medium | Follow reference milestones; iterable |
| LoS blocking complexity | High | Low | Simplified rectangular LoS for Phase 1 |
| Asset quality (programmatic graphics) | Low | Low | Acceptable for Phase 1; sprites in Phase 2 |
| Browser compatibility | Low | Low | WebGL is universally supported in 2026 |
| Regrow spiral edge case | Medium | Medium | Regrow timer logic must be tested with dense bloon waves |

---

## 4. Dependencies

```json
{
  "phaser": "^3.80.0",
  "typescript": "^5.4.0",
  "vite": "^5.0.0",
  "@types/node": "^20.0.0"
}
```

Vite is chosen over Webpack for its fast HMR and zero-config TypeScript support. Phaser 3.80+ is the current stable release with full TS declarations.

---

## 5. Build Output

- `npm run dev` → localhost dev server with HMR
- `npm run build` → `dist/` folder with single HTML + JS bundle
- No server required — static file hosting (or just open `dist/index.html`)

---

## 6. GO/NO-GO Decision

**GO.**

All Phase 1 systems have clear implementation paths in Phaser 3. The highest-complexity items (track following, upgrade system, bloon hierarchy) are all well-supported by the engine or reducible to simple data structures. The timeline risk is the volume of content (90 upgrades, 80 rounds), not technical complexity.

**Recommended implementation order:**
1. Scaffold + boot + map rendering
2. Bloon movement on track
3. Tower placement + one attack type
4. Damage system + bloon hierarchy
5. Remaining 5 towers
6. Upgrade system
7. Full round schedule
8. Economy + HUD
9. Status effects
10. Game modes + win/loss
