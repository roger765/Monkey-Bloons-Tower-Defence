# UX Brief: BTD6 Replica — Phase 1

**Feature slug:** btd6-replica  
**Date:** 2026-06-07

---

## Screen Flow

```
MainMenuScene
    |
    |-- [Select Difficulty: Easy / Medium / Hard]
    |
    v
GameScene (+ parallel UIScene)
    |
    |-- [Play Rounds 1-N]
    |       |
    |       |-- [Lives reach 0] --> GameOverScene (loss)
    |       |
    |       |-- [Final round survived] --> GameOverScene (win)
    |
    v
GameOverScene
    |-- [Win] --> Victory screen + "Play Again" button
    |-- [Loss, Easy/Medium] --> "Continue?" or "Give Up" 
    |-- [Loss, Hard] --> "Game Over" + "Main Menu"
```

---

## Scene Specifications

### MainMenuScene

**Layout:**
```
+------------------------------------------+
|          TEDDY BLOONS REPLICA            |
|                                          |
|           [  Easy  ]  200 lives          |
|           [ Medium ]  150 lives          |
|           [  Hard  ]  100 lives          |
|                                          |
|         (cost multipliers shown)         |
+------------------------------------------+
```

- Title text, centered
- Three large buttons, stacked vertically
- Each button shows lives and cost note
- No animations required for Phase 1

---

### GameScene + UIScene

**Viewport:** Full browser window. Map occupies the majority. HUD anchored to top and bottom.

**Layout:**
```
+----------------------------------------------------------------+
| [Round 1/40]   [Lives: 200]   [$650]      [>>] [||]           |  <- TOP HUD BAR
+----------------------------------------------------------------+
|                                                                |
|                                                                |
|             MAP AREA (track + placeable terrain)               |
|             Tower range rings shown on hover/select            |
|                                                                |
|                                                                |
+----------------------------------------------------------------+
| TOWER SHOP: [Dart $200] [Boom $325] [Bomb $500] [Tack $360]   |
|             [Ice $500]  [Glue $275]                            |
+----------------------------------------------------------------+
| SELECTED TOWER PANEL (shown when a tower is clicked)           |
| "Dart Monkey 1-0-0"                                            |
| Path 1: [Razorblade $180] [Tier2 $...]  Path 2: ...  Path 3:  |
| [Targeting: First v]    [Sell: $140]                           |
+----------------------------------------------------------------+
```

**Top HUD Bar (always visible):**
- Left: Round label "Round X / Y" (Y = 40/60/80 by mode)
- Center-left: Lives label with heart icon, number in green/yellow/red
- Center: Cash "$X,XXX"
- Right: Fast-Forward button (>> toggles 1x/3x, highlights when active)
- Right: Pause button

**Tower Shop (bottom, always visible):**
- Horizontal scrollable row
- Each entry: tower name + cost
- Grey out (reduced opacity) when player cannot afford
- Click to enter placement mode — cursor changes, range ring follows mouse on map
- Click on map to place (if valid), right-click to cancel placement mode

**Placement Mode:**
- Translucent range circle follows cursor on map
- Circle fills: green = valid placement, red = invalid (on track, on another tower, on obstacle)
- Place on click, cancel on right-click or Escape

**Selected Tower Panel (shown when clicking a placed tower):**
- Shows tower name and current upgrade notation (e.g., "2-3-0")
- Three upgrade path columns:
  - Each shows: Tier 1 through 5 buttons
  - Purchased tiers are highlighted/checked
  - Next purchasable tier shows name + cost
  - Locked tiers (crosspath restriction or insufficient funds) are greyed and show lock icon
- Targeting dropdown/cycle button: First / Last / Strong / Close / Far
- Sell button showing "Sell: $XXX" (70% refund value)
- Click elsewhere on map to deselect tower (hides panel)

**Range Ring (on hover or select):**
- Translucent circle overlay on placed tower
- Color: dark grey (valid attack zone)
- For Phase 1: no red LoS-blocked sectors on Monkey Meadow (minimal obstacles)

---

### GameOverScene

**Win:**
```
+------------------------------------------+
|          VICTORY!                        |
|    You survived Round [N]!               |
|    Cash earned: $X,XXX                   |
|    Bloons popped: X,XXX                  |
|                                          |
|         [ Play Again ]  [ Menu ]         |
+------------------------------------------+
```

**Loss:**
```
+------------------------------------------+
|          GAME OVER                       |
|    Lives lost on Round [N]               |
|                                          |
|    [Continue?] (Easy/Medium only)        |
|    [ Main Menu ]                         |
+------------------------------------------+
```

---

## Key Interaction Flows

### Place a Tower
1. Player clicks tower in shop (if affordable)
2. Cursor enters placement mode — range ring follows mouse
3. Map highlights show green (valid) or red (invalid) under range ring
4. Player clicks valid position → tower placed, cash deducted, placement mode ends
5. Right-click or Escape cancels

### Upgrade a Tower
1. Player clicks placed tower → selected tower panel appears
2. Player reads current upgrade state and costs
3. Player clicks an upgrade button:
   - If affordable and valid (crosspath allows): upgrade purchased, stat applied, cash deducted
   - If insufficient cash: button flashes red briefly
   - If crosspath locked: button shows lock icon, click does nothing

### Start a Round
1. "Start Round" button visible between rounds
2. Player clicks → bloons begin spawning per schedule
3. Button becomes "Next Round" grayed out during wave
4. Wave ends when all bloons destroyed or leaked
5. End-of-round cash awarded, displayed briefly as floating "+$XXX" text

### Fast Forward
1. >> button in top HUD
2. Toggle: 1x → 3x → 1x
3. Active state: button highlighted, "3x" label shown
4. All movement, cooldowns, DoT ticks run at 3x speed

---

## Visual Language

**Colors (programmatic graphics, Phase 1):**

| Element | Color |
|---------|-------|
| Track | Tan / sandy brown #C8A96E |
| Grass/terrain | Green #4A7C3F |
| Red bloon | #FF2020 |
| Blue bloon | #2060FF |
| Green bloon | #20A020 |
| Yellow bloon | #FFDD00 |
| Pink bloon | #FF80C0 |
| Black bloon | #202020 |
| White bloon | #F0F0F0 |
| Zebra bloon | striped black+white |
| Rainbow bloon | multicolour gradient |
| Ceramic bloon | #C0855A |
| Lead bloon | #808090 |
| MOAB | #6080C0 (blue blimp) |
| BFB | #C06020 (orange blimp) |
| ZOMG | #C020C0 (purple blimp) |
| Tower (generic) | Dark grey base, colored circle cap by category |
| Range ring | rgba(255,255,255,0.2) outline |
| HUD background | rgba(0,0,0,0.85) |
| HUD text | #FFFFFF |
| Cash color | #FFD700 |
| Lives: full | #00FF80 |
| Lives: low (<50%) | #FFD700 |
| Lives: critical (<25%) | #FF4040 |

**Bloon size scale:**
- Red–Pink: radius 14px
- Black/White/Zebra: radius 16px
- Rainbow: radius 18px
- Ceramic: radius 20px
- Lead: radius 18px
- MOAB: 50x30px ellipse
- BFB: 80x50px ellipse
- ZOMG: 120x70px ellipse

**Tower appearance:**
- Base: 30x30px rounded rectangle in category color
- Rotation indicator: small triangle/arrow showing facing direction
- On attack: brief flash/pulse

---

## Accessibility Notes (Phase 1)

- Text minimum 14px for HUD readability
- Button hover states for all interactive elements
- Keyboard: Space to start/pause round, Escape to cancel placement
- No color-only information coding (all states have text labels too)
