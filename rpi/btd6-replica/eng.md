# Engineering Spec: BTD6 Replica — Phase 1

**Feature slug:** btd6-replica  
**Date:** 2026-06-07  
**Stack:** TypeScript 5.4 + Phaser 3.80 + Vite 5

---

## Directory Structure

```
Teddy Bloons Replica/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.ts                    # Phaser game config + boot
    ├── constants.ts               # Game constants (colors, sizes)
    ├── types.ts                   # All TypeScript interfaces/enums
    ├── data/
    │   ├── bloons.ts              # BloonType configs
    │   ├── towers.ts              # TowerConfig objects for all 6 towers
    │   ├── upgrades.ts            # All 90 upgrade definitions
    │   └── rounds.ts              # Rounds 1-80 send schedules
    ├── scenes/
    │   ├── BootScene.ts
    │   ├── MainMenuScene.ts
    │   ├── GameScene.ts
    │   ├── UIScene.ts
    │   └── GameOverScene.ts
    ├── game/
    │   ├── GameState.ts           # Central state object
    │   ├── Track.ts               # Map/path definition + drawing
    │   ├── BloonManager.ts        # Bloon spawning, pooling, movement
    │   ├── TowerManager.ts        # Tower placement, selling, range rings
    │   ├── ProjectileManager.ts   # Projectile pooling, movement, hit detection
    │   ├── DamageSystem.ts        # Immunity checks, status application
    │   ├── TargetingSystem.ts     # Target selection per tower
    │   ├── EconomySystem.ts       # Cash, sells, end-of-round bonus
    │   └── RoundSystem.ts         # Round scheduling, wave spawning
    ├── towers/
    │   ├── BaseTower.ts
    │   ├── DartMonkey.ts
    │   ├── BoomerangMonkey.ts
    │   ├── BombShooter.ts
    │   ├── TackShooter.ts
    │   ├── IceMonkey.ts
    │   └── GlueGunner.ts
    └── ui/
        ├── HUD.ts                 # Top bar rendering
        ├── TowerShop.ts           # Bottom shop panel
        └── TowerPanel.ts          # Selected tower upgrade/sell panel
```

---

## Core Data Types (types.ts)

```typescript
export enum DamageType {
  Sharp = 'sharp',
  Explosion = 'explosion',
  Fire = 'fire',
  Cold = 'cold',
  Energy = 'energy',
  Magic = 'magic',
  Normal = 'normal',
}

export enum BloonType {
  Red = 'red', Blue = 'blue', Green = 'green', Yellow = 'yellow',
  Pink = 'pink', Black = 'black', White = 'white', Zebra = 'zebra',
  Rainbow = 'rainbow', Ceramic = 'ceramic', Lead = 'lead',
  MOAB = 'moab', BFB = 'bfb', ZOMG = 'zomg',
}

export enum TargetingMode {
  First = 'first', Last = 'last', Strong = 'strong',
  Close = 'close', Far = 'far',
}

export enum StatusEffectType {
  Freeze = 'freeze', Glue = 'glue', Stun = 'stun', Burn = 'burn',
}

export interface StatusEffect {
  type: StatusEffectType
  duration: number        // seconds remaining
  slowMultiplier?: number // for glue
  damagePerSecond?: number // for burn
}

export interface BloonConfig {
  type: BloonType
  baseSpeed: number
  baseHp: number          // 1 for most, 10 for Ceramic, 200/700/4000 for MOABs
  children: BloonType[]   // spawned on death
  immunities: DamageType[]
  isMoabClass: boolean
  color: number           // Phaser color int
  radius: number
}

export interface UpgradeEffect {
  damageBonus?: number
  pierceBonus?: number
  rangeMultiplier?: number
  cooldownMultiplier?: number
  newDamageType?: DamageType
  addCamoDetection?: boolean
  specialBehavior?: string  // key for special behaviors handled in tower class
}

export interface Upgrade {
  name: string
  cost: number           // Medium price
  effect: UpgradeEffect
}

export type UpgradePath = [Upgrade, Upgrade, Upgrade, Upgrade, Upgrade]

export interface TowerConfig {
  id: string
  name: string
  cost: number
  range: number          // pixels
  cooldown: number       // seconds
  damage: number
  pierce: number
  damageType: DamageType
  projectileSpeed: number
  upgrades: [UpgradePath, UpgradePath, UpgradePath]
}

export interface RoundGroup {
  bloonType: BloonType
  count: number
  spacing: number        // seconds between spawns
  isCamo?: boolean
  isRegrow?: boolean
  isFortified?: boolean
  delay?: number         // seconds before this group starts (within round)
}

export interface RoundData {
  round: number
  groups: RoundGroup[]
}
```

---

## Bloon System (BloonManager.ts)

### Bloon Instance

```typescript
class Bloon extends Phaser.GameObjects.Arc {
  bloonType: BloonType
  distanceAlongTrack: number
  currentSpeed: number
  currentHp: number
  maxHp: number
  isCamo: boolean
  isRegrow: boolean
  isFortified: boolean
  statusEffects: StatusEffect[]
  regrowTimer: number     // counts up; at 3s, regrow triggers
  
  update(delta: number): void {
    // Apply speed multiplier from status effects
    const speedMult = this.getSpeedMultiplier()
    this.distanceAlongTrack += (this.currentSpeed * speedMult * delta) / 1000
    // Update world position from track
    const pos = track.getPositionAt(this.distanceAlongTrack)
    this.setPosition(pos.x, pos.y)
    // Tick status effects
    this.tickStatusEffects(delta)
    // Check if exited track
    if (this.distanceAlongTrack >= track.totalLength) {
      this.onExitTrack()
    }
  }
  
  takeDamage(amount: number, damageType: DamageType, source: Tower): void {
    if (this.isImmuneTo(damageType)) return
    if (this.isFrozen() && damageType === DamageType.Sharp) return
    
    this.currentHp -= amount
    if (this.currentHp <= 0) {
      this.pop()
    }
  }
  
  pop(): void {
    // Spawn children
    const config = BLOON_CONFIGS[this.bloonType]
    for (const childType of config.children) {
      bloonManager.spawnChild(childType, this)
    }
    // Award cash
    economySystem.awardPopCash(this)
    // Deactivate in pool
    this.setActive(false).setVisible(false)
  }
}
```

### Regrow Logic

```typescript
tickStatusEffects(delta: number): void {
  // Regrow: if HP < max and no active damage in last 3s
  if (this.isRegrow && this.currentHp < this.maxHp) {
    this.regrowTimer += delta / 1000
    if (this.regrowTimer >= 3.0) {
      this.currentHp = Math.min(this.maxHp, this.currentHp + 1)
      this.regrowTimer = 0
    }
  }
  // Tick burn DoT
  for (const effect of this.statusEffects) {
    if (effect.type === StatusEffectType.Burn) {
      effect.duration -= delta / 1000
      // deal burn damage per tick (every 0.1s handled by timer)
    }
  }
  // Remove expired effects
  this.statusEffects = this.statusEffects.filter(e => e.duration > 0)
}
```

---

## Track System (Track.ts)

```typescript
class Track {
  waypoints: Phaser.Math.Vector2[]
  segments: { start: Vector2, end: Vector2, length: number, cumLength: number }[]
  totalLength: number

  constructor(waypoints: {x: number, y: number}[]) {
    this.waypoints = waypoints.map(p => new Phaser.Math.Vector2(p.x, p.y))
    this.buildSegments()
  }

  getPositionAt(distance: number): Phaser.Math.Vector2 {
    // Walk segments to find which segment contains this distance
    // Interpolate within that segment
    let remaining = distance
    for (const seg of this.segments) {
      if (remaining <= seg.length) {
        const t = remaining / seg.length
        return seg.start.clone().lerp(seg.end, t)
      }
      remaining -= seg.length
    }
    return this.waypoints[this.waypoints.length - 1].clone()
  }

  draw(graphics: Phaser.GameObjects.Graphics): void {
    // Draw track as wide tan-colored strip
    graphics.lineStyle(40, 0xC8A96E, 1)
    graphics.beginPath()
    graphics.moveTo(this.waypoints[0].x, this.waypoints[0].y)
    for (let i = 1; i < this.waypoints.length; i++) {
      graphics.lineTo(this.waypoints[i].x, this.waypoints[i].y)
    }
    graphics.strokePath()
  }
}
```

**Monkey Meadow waypoints (1280x720 viewport):**
```typescript
const MONKEY_MEADOW_WAYPOINTS = [
  { x: 0, y: 360 },       // entrance (left edge, center)
  { x: 200, y: 360 },
  { x: 200, y: 180 },
  { x: 500, y: 180 },
  { x: 500, y: 540 },
  { x: 800, y: 540 },
  { x: 800, y: 270 },
  { x: 1080, y: 270 },
  { x: 1080, y: 450 },
  { x: 1280, y: 450 },    // exit (right edge)
]
```

---

## Tower System

### BaseTower.ts

```typescript
abstract class BaseTower extends Phaser.GameObjects.Container {
  config: TowerConfig
  upgrades: [number, number, number]   // current tier per path [0-5]
  targetingMode: TargetingMode
  cooldownTimer: number
  currentTarget: Bloon | null
  hasCamoDetection: boolean
  
  // Derived stats (recomputed on upgrade)
  effectiveRange: number
  effectiveCooldown: number
  effectiveDamage: number
  effectivePierce: number
  effectiveDamageType: DamageType
  
  update(delta: number, bloons: Bloon[]): void {
    this.cooldownTimer -= delta / 1000
    if (this.cooldownTimer <= 0) {
      const target = targetingSystem.findTarget(this, bloons)
      if (target) {
        this.attack(target)
        this.cooldownTimer = this.effectiveCooldown
      }
    }
  }
  
  abstract attack(target: Bloon): void
  
  applyUpgrade(path: 0|1|2): boolean {
    const tier = this.upgrades[path]
    if (tier >= 5) return false
    // Crosspath enforcement
    const otherPaths = [0,1,2].filter(p => p !== path) as (0|1|2)[]
    if (tier >= 2 && otherPaths.some(p => this.upgrades[p] >= 3)) return false
    if (otherPaths.some(p => this.upgrades[p] >= 3) && tier >= 2) return false
    
    const upgrade = this.config.upgrades[path][tier]
    if (!economySystem.canAfford(upgrade.cost)) return false
    
    economySystem.spend(upgrade.cost)
    this.upgrades[path]++
    this.recomputeStats()
    return true
  }
  
  getSellValue(): number {
    return Math.floor(this.totalSpent * 0.7)
  }
}
```

---

## Damage System (DamageSystem.ts)

```typescript
const IMMUNITY_TABLE: Record<BloonType, DamageType[]> = {
  [BloonType.Lead]: [DamageType.Sharp, DamageType.Energy],
  [BloonType.Black]: [DamageType.Explosion],
  [BloonType.White]: [DamageType.Cold],
  [BloonType.Zebra]: [DamageType.Explosion, DamageType.Cold],
  [BloonType.Purple]: [DamageType.Fire, DamageType.Energy, DamageType.Magic],
  // MOAB-class: not immune to damage types, but immune to Cold/Freeze
  [BloonType.MOAB]: [DamageType.Cold],
  [BloonType.BFB]: [DamageType.Cold],
  [BloonType.ZOMG]: [DamageType.Cold],
  // others: no immunities
}

function canHit(damageType: DamageType, bloon: Bloon): boolean {
  // Normal damage type bypasses all
  if (damageType === DamageType.Normal) return true
  
  const immunities = IMMUNITY_TABLE[bloon.bloonType] ?? []
  if (immunities.includes(damageType)) return false
  
  // Frozen bloons block Sharp
  if (bloon.isFrozen() && damageType === DamageType.Sharp) return false
  
  return true
}
```

---

## Targeting System (TargetingSystem.ts)

```typescript
function findTarget(tower: BaseTower, bloons: Bloon[]): Bloon | null {
  // Filter: in range, not frozen (for non-freeze towers), camo check
  const candidates = bloons.filter(b => {
    if (!b.active) return false
    const dist = Phaser.Math.Distance.Between(tower.x, tower.y, b.x, b.y)
    if (dist > tower.effectiveRange) return false
    if (b.isCamo && !tower.hasCamoDetection) return false
    return true
  })
  
  if (candidates.length === 0) return null
  
  switch (tower.targetingMode) {
    case TargetingMode.First:
      return candidates.reduce((a, b) => a.distanceAlongTrack > b.distanceAlongTrack ? a : b)
    case TargetingMode.Last:
      return candidates.reduce((a, b) => a.distanceAlongTrack < b.distanceAlongTrack ? a : b)
    case TargetingMode.Strong:
      return candidates.reduce((a, b) => {
        const rbeA = getRBE(a), rbeB = getRBE(b)
        if (rbeA !== rbeB) return rbeA > rbeB ? a : b
        return a.distanceAlongTrack > b.distanceAlongTrack ? a : b // tie: First
      })
    case TargetingMode.Close:
      return candidates.reduce((a, b) => {
        const dA = Phaser.Math.Distance.Between(tower.x, tower.y, a.x, a.y)
        const dB = Phaser.Math.Distance.Between(tower.x, tower.y, b.x, b.y)
        return dA < dB ? a : b
      })
    case TargetingMode.Far:
      return candidates.reduce((a, b) => {
        const dA = Phaser.Math.Distance.Between(tower.x, tower.y, a.x, a.y)
        const dB = Phaser.Math.Distance.Between(tower.x, tower.y, b.x, b.y)
        return dA > dB ? a : b
      })
  }
}
```

---

## Round System (RoundSystem.ts)

```typescript
class RoundSystem {
  currentRound: number = 0
  private spawnQueue: SpawnEvent[] = []
  private timer: number = 0
  
  startRound(round: number): void {
    this.currentRound = round
    const data = ROUND_DATA[round - 1]
    this.spawnQueue = this.buildSpawnQueue(data)
    this.timer = 0
    gameState.isWaveActive = true
  }
  
  update(delta: number): void {
    if (!gameState.isWaveActive) return
    this.timer += delta / 1000
    
    // Process spawn queue
    while (this.spawnQueue.length > 0 && this.spawnQueue[0].time <= this.timer) {
      const event = this.spawnQueue.shift()!
      bloonManager.spawn(event.bloonType, event.isCamo, event.isRegrow, event.isFortified)
    }
    
    // Check if wave is complete
    if (this.spawnQueue.length === 0 && bloonManager.activeCount === 0) {
      this.onRoundEnd()
    }
  }
  
  private onRoundEnd(): void {
    gameState.isWaveActive = false
    const bonus = 100 + this.currentRound
    economySystem.award(bonus)
    uiScene.showRoundEndBonus(bonus)
    
    if (this.currentRound >= gameState.endRound) {
      gameState.triggerWin()
    }
  }
}
```

---

## Economy System (EconomySystem.ts)

```typescript
class EconomySystem {
  awardPopCash(bloon: Bloon): void {
    const round = roundSystem.currentRound
    const multiplier = this.getCashMultiplier(round)
    const hpRemoved = 1  // per layer popped (Ceramics track HP removed)
    const cash = Math.floor(hpRemoved * multiplier)
    gameState.cash += cash
  }
  
  getCashMultiplier(round: number): number {
    if (round <= 50) return 1.0
    if (round <= 60) return 0.5
    if (round <= 85) return 0.4
    if (round <= 100) return 0.36
    return 0.29
  }
  
  getSellValue(tower: BaseTower): number {
    return Math.floor(tower.totalSpent * 0.7)
  }
}
```

---

## Implementation Slices (Build Order)

### Slice 1: Scaffold and Boot
- package.json, tsconfig.json, vite.config.ts, index.html
- main.ts: Phaser config, scene list
- BootScene: instant (no assets to load, programmatic graphics)
- MainMenuScene: 3 difficulty buttons

### Slice 2: Map and Track
- Track.ts: Monkey Meadow waypoints, draw method
- GameScene: renders map background and track

### Slice 3: Bloon Movement
- types.ts: BloonType, BloonConfig, StatusEffect types
- data/bloons.ts: all bloon configs
- BloonManager.ts: spawn, pool, movement update
- One test bloon (Red) moving along track, exiting, draining life

### Slice 4: Tower Placement
- BaseTower.ts: base class
- DartMonkey.ts: first tower implementation
- TowerManager.ts: placement validation, range ring
- UIScene: tower shop (Dart only), selected tower panel skeleton

### Slice 5: Projectiles and Damage
- ProjectileManager.ts: pool, movement
- DamageSystem.ts: immunity table, canHit
- Dart projectile hits bloon, bloon pops, spawns children

### Slice 6: Targeting
- TargetingSystem.ts: all 5 modes
- Wire up to DartMonkey

### Slice 7: All 6 Towers
- data/towers.ts: all 6 tower configs
- BoomerangMonkey, BombShooter, TackShooter, IceMonkey, GlueGunner
- Special behaviors: bomb AoE, tack 8-direction, ice AoE freeze, glue slow

### Slice 8: Upgrade System
- data/upgrades.ts: all 90 upgrades
- BaseTower.applyUpgrade with crosspath enforcement
- UIScene TowerPanel: upgrade buttons, crosspath display

### Slice 9: Full Bloon Hierarchy + Status Effects
- All bloon types active
- Freeze (IceMoney), Glue (GlueGunner), Stun (Bomb), Burn DoT
- Regrow timer logic
- Fortified HP doubling
- Camo detection requirements

### Slice 10: MOAB-Class
- MOAB, BFB, ZOMG configs
- Scaled hitbox visuals

### Slice 11: Round Schedule
- data/rounds.ts: Rounds 1-80
- RoundSystem.ts: spawn queue, wave end detection
- Start Round button, round counter

### Slice 12: Economy + HUD
- EconomySystem.ts: full cash logic
- HUD.ts: all top bar elements
- TowerShop: grey out on insufficient funds
- Floating cash text on pop, round-end bonus display

### Slice 13: Game Modes + Win/Loss
- GameState: mode selection, lives, end round
- Loss condition, continue mechanic
- Win condition, GameOverScene

### Slice 14: Polish
- Fast-forward toggle (3x)
- Pause
- Lives color transitions
- Range ring during placement and selection
- Basic LoS simplified obstacle (if time permits)

---

## Testing Checkpoints

After each slice, verify:
1. No console errors
2. Core mechanic of that slice works as expected
3. No regression in prior slices

Key integration tests:
- Pop a Ceramic: verify 10 hits required, 2 Rainbow children spawn each hit at 0 HP
- Pop a MOAB: verify 4 Ceramic children
- Freeze + Sharp: sharp projectile passes through frozen bloon
- Glue + MOAB-class: base glue has no effect on MOAB-class (needs MOAB Glue upgrade)
- End of Round 80: ZOMG spawns
- Crosspath: verify T3 on Path 1 prevents T3 on Path 2
