import { GameDifficulty, TargetingMode } from '../types'
import { DIFFICULTIES } from '../constants'

export class GameState {
  difficulty: GameDifficulty = GameDifficulty.Easy
  lives: number = 200
  maxLives: number = 200
  cash: number = 650
  round: number = 0
  endRound: number = 40
  isWaveActive: boolean = false
  isGameOver: boolean = false
  isVictory: boolean = false
  isPaused: boolean = false
  gameSpeed: number = 1
  totalBloonsPoppedAllTime: number = 0
  totalCashEarned: number = 0
  selectedTowerId: string | null = null
  placingTowerId: string | null = null

  init(difficulty: GameDifficulty): void {
    const config = DIFFICULTIES[difficulty]
    this.difficulty = difficulty
    this.lives = config.lives
    this.maxLives = config.lives
    this.cash = 650
    this.round = 0
    this.endRound = config.endRound
    this.isWaveActive = false
    this.isGameOver = false
    this.isVictory = false
    this.isPaused = false
    this.gameSpeed = 1
    this.totalBloonsPoppedAllTime = 0
    this.totalCashEarned = 650
    this.selectedTowerId = null
    this.placingTowerId = null
  }

  getCostMultiplier(): number {
    return DIFFICULTIES[this.difficulty].costMultiplier
  }

  getBloonSpeedMultiplier(): number {
    return DIFFICULTIES[this.difficulty].bloonSpeedMultiplier
  }

  scaledCost(baseCost: number): number {
    return Math.ceil(baseCost * this.getCostMultiplier())
  }

  canAfford(baseCost: number): boolean {
    return this.cash >= this.scaledCost(baseCost)
  }

  spend(baseCost: number): void {
    this.cash -= this.scaledCost(baseCost)
  }

  earn(amount: number): void {
    this.cash += amount
    this.totalCashEarned += amount
  }

  loseLife(count: number = 1): void {
    this.lives = Math.max(0, this.lives - count)
    if (this.lives <= 0) {
      this.isGameOver = true
    }
  }

  getCashPerPopMultiplier(): number {
    const r = this.round
    if (r <= 50) return 1.0
    if (r <= 60) return 0.5
    if (r <= 85) return 0.4
    if (r <= 100) return 0.36
    return 0.29
  }
}

export const gameState = new GameState()
