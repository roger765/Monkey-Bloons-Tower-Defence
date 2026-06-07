import { RoundData, BloonType } from '../types'
import { ROUND_DATA } from '../data/rounds'
import { BloonManager } from './BloonManager'
import { gameState } from './GameState'

interface SpawnEvent {
  time: number
  bloonType: BloonType
  isCamo: boolean
  isRegrow: boolean
  isFortified: boolean
}

const POST_DRAIN_TIMEOUT = 15 // seconds to wait after last spawn before force-ending

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
    if (round < 1 || round > 80) return
    const data = ROUND_DATA[round - 1]
    if (!data) return

    this.timer = 0
    this.queueDrainedAt = null
    this.spawnQueue = this.buildSpawnQueue(data)
    gameState.isWaveActive = true
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

    // Check win condition
    if (gameState.round >= gameState.endRound) {
      gameState.isVictory = true
    }
  }

  reset(): void {
    this.spawnQueue = []
    this.timer = 0
    this.queueDrainedAt = null
  }
}
