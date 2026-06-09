import { RoundData, BloonType } from '../types'
import { ROUND_DATA } from '../data/rounds'

const MAX_SCRIPTED_ROUND = 80
import { BloonManager } from './BloonManager'
import { gameState } from './GameState'

interface SpawnEvent {
  time: number
  bloonType: BloonType
  isCamo: boolean
  isRegrow: boolean
  isFortified: boolean
}

const POST_DRAIN_TIMEOUT = 120 // seconds to wait after last spawn before force-ending

export class RoundSystem {
  private bloonManager: BloonManager
  private spawnQueue: SpawnEvent[] = []
  private timer: number = 0
  private queueDrainedAt: number | null = null
  private onRoundEndCallback: ((round: number) => void) | null = null

  constructor(bloonManager: BloonManager) {
    this.bloonManager = bloonManager
  }

  onRoundEnd(callback: (round: number) => void): void {
    this.onRoundEndCallback = callback
  }

  startRound(round: number): void {
    if (round < 1) return
    const data = round <= MAX_SCRIPTED_ROUND
      ? ROUND_DATA[round - 1]
      : this.generateFreePlayRound(round)
    if (!data) return

    this.timer = 0
    this.queueDrainedAt = null
    this.spawnQueue = this.buildSpawnQueue(data)
    gameState.isWaveActive = true
  }

  private generateFreePlayRound(round: number): RoundData {
    const excess = round - MAX_SCRIPTED_ROUND
    const groups: RoundData['groups'] = []

    const zomgCount = Math.max(1, Math.floor(excess * 0.3))
    const spacing = Math.max(0.8, 5.0 - excess * 0.1)
    groups.push({ bloonType: BloonType.ZOMG, count: zomgCount, spacing })

    const bfbCount = Math.max(2, Math.floor(excess * 0.6))
    groups.push({ bloonType: BloonType.BFB, count: bfbCount, spacing: Math.max(0.5, 3.0 - excess * 0.05), delay: 15 })

    if (excess >= 5) {
      const ceramicCount = Math.min(30 + excess * 3, 120)
      groups.push({
        bloonType: BloonType.Ceramic,
        count: ceramicCount,
        spacing: Math.max(0.15, 0.4 - excess * 0.005),
        isFortified: true,
        delay: 30,
      })
    }

    return { round, groups }
  }

  private buildSpawnQueue(data: RoundData): SpawnEvent[] {
    const events: SpawnEvent[] = []

    for (const group of data.groups) {
      const startDelay = group.delay ?? 0
      for (let i = 0; i < group.count; i++) {
        events.push({
          time: startDelay + i * group.spacing,
          bloonType: group.bloonType,
          isCamo: group.isCamo ?? false,
          isRegrow: group.isRegrow ?? false,
          isFortified: group.isFortified ?? false,
        })
      }
    }

    events.sort((a, b) => a.time - b.time)
    return events
  }

  update(delta: number): void {
    if (!gameState.isWaveActive) return
    this.timer += delta / 1000

    // Process spawn events
    while (this.spawnQueue.length > 0 && this.spawnQueue[0].time <= this.timer) {
      const event = this.spawnQueue.shift()!
      this.bloonManager.spawn(event.bloonType, event.isCamo, event.isRegrow, event.isFortified)
    }

    // Track when spawn queue drains so we can force-end if bloons get stuck
    if (this.spawnQueue.length === 0 && this.queueDrainedAt === null) {
      this.queueDrainedAt = this.timer
    }

    // Check wave complete
    if (this.spawnQueue.length === 0 && this.bloonManager.activeCount === 0) {
      this.endRound()
      return
    }

    // Safety: if bloons are stuck active too long after spawning ends, force-end
    if (this.queueDrainedAt !== null && this.timer - this.queueDrainedAt > POST_DRAIN_TIMEOUT) {
      this.bloonManager.clear()
      this.endRound()
    }
  }

  private endRound(): void {
    gameState.isWaveActive = false
    const bonus = 100 + gameState.round
    gameState.earn(bonus)

    if (this.onRoundEndCallback) {
      this.onRoundEndCallback(gameState.round)
    }

    // After endRound, enter free play instead of ending the game
    if (gameState.round >= gameState.endRound && !gameState.isFreePlay) {
      gameState.isFreePlay = true
    }
  }

  injectSpawns(
    type: BloonType,
    count: number,
    camo: boolean,
    regrow: boolean,
    fortified: boolean,
    spacing: number = 0.3
  ): void {
    for (let i = 0; i < count; i++) {
      this.spawnQueue.push({
        time: this.timer + 0.1 + i * spacing,
        bloonType: type,
        isCamo: camo,
        isRegrow: regrow,
        isFortified: fortified,
      })
    }
    this.spawnQueue.sort((a, b) => a.time - b.time)
    this.queueDrainedAt = null
    gameState.isWaveActive = true
  }

  reset(): void {
    this.spawnQueue = []
    this.timer = 0
    this.queueDrainedAt = null
  }
}
