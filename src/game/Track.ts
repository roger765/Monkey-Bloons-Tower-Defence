import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, TRACK_COLOR, TRACK_WIDTH, GRASS_COLOR, HUD_TOP_HEIGHT, HUD_BOTTOM_HEIGHT } from '../constants'

export interface Waypoint {
  x: number
  y: number
}

interface Segment {
  start: Phaser.Math.Vector2
  end: Phaser.Math.Vector2
  length: number
  angle: number  // radians
}

// Monkey Meadow: single path, beginner layout
// Map area: 0 to GAME_WIDTH, HUD_TOP_HEIGHT to GAME_HEIGHT - HUD_BOTTOM_HEIGHT
const MAP_TOP = HUD_TOP_HEIGHT
const MAP_BOTTOM = GAME_HEIGHT - HUD_BOTTOM_HEIGHT
const MAP_HEIGHT_ACTUAL = MAP_BOTTOM - MAP_TOP
const MID_Y = MAP_TOP + MAP_HEIGHT_ACTUAL / 2

export const MONKEY_MEADOW_WAYPOINTS: Waypoint[] = [
  { x: -10, y: MID_Y },
  { x: 160, y: MID_Y },
  { x: 160, y: MAP_TOP + MAP_HEIGHT_ACTUAL * 0.25 },
  { x: 460, y: MAP_TOP + MAP_HEIGHT_ACTUAL * 0.25 },
  { x: 460, y: MAP_TOP + MAP_HEIGHT_ACTUAL * 0.75 },
  { x: 760, y: MAP_TOP + MAP_HEIGHT_ACTUAL * 0.75 },
  { x: 760, y: MAP_TOP + MAP_HEIGHT_ACTUAL * 0.35 },
  { x: 1060, y: MAP_TOP + MAP_HEIGHT_ACTUAL * 0.35 },
  { x: 1060, y: MAP_TOP + MAP_HEIGHT_ACTUAL * 0.65 },
  { x: GAME_WIDTH + 10, y: MAP_TOP + MAP_HEIGHT_ACTUAL * 0.65 },
]

export class Track {
  private segments: Segment[] = []
  totalLength: number = 0
  waypoints: Phaser.Math.Vector2[]
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene, waypoints: Waypoint[]) {
    this.scene = scene
    this.waypoints = waypoints.map(w => new Phaser.Math.Vector2(w.x, w.y))
    this.buildSegments()
  }

  private buildSegments(): void {
    this.segments = []
    this.totalLength = 0

    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const start = this.waypoints[i]
      const end = this.waypoints[i + 1]
      const dx = end.x - start.x
      const dy = end.y - start.y
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx)
      this.segments.push({ start, end, length, angle })
      this.totalLength += length
    }
  }

  getPositionAt(distance: number): Phaser.Math.Vector2 {
    let remaining = Math.max(0, distance)

    for (const seg of this.segments) {
      if (remaining <= seg.length) {
        const t = remaining / seg.length
        return new Phaser.Math.Vector2(
          seg.start.x + (seg.end.x - seg.start.x) * t,
          seg.start.y + (seg.end.y - seg.start.y) * t
        )
      }
      remaining -= seg.length
    }

    // Past end
    const last = this.waypoints[this.waypoints.length - 1]
    return new Phaser.Math.Vector2(last.x, last.y)
  }

  getAngleAt(distance: number): number {
    let remaining = Math.max(0, distance)
    for (const seg of this.segments) {
      if (remaining <= seg.length) {
        return seg.angle
      }
      remaining -= seg.length
    }
    return this.segments[this.segments.length - 1].angle
  }

  isOnTrack(x: number, y: number, margin: number = TRACK_WIDTH / 2 + 5): boolean {
    for (const seg of this.segments) {
      if (this.pointToSegmentDistance(x, y, seg.start, seg.end) < margin) {
        return true
      }
    }
    return false
  }

  private pointToSegmentDistance(px: number, py: number, a: Phaser.Math.Vector2, b: Phaser.Math.Vector2): number {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const lenSq = dx * dx + dy * dy
    if (lenSq === 0) return Math.sqrt((px - a.x) ** 2 + (py - a.y) ** 2)
    let t = ((px - a.x) * dx + (py - a.y) * dy) / lenSq
    t = Math.max(0, Math.min(1, t))
    const closestX = a.x + t * dx
    const closestY = a.y + t * dy
    return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2)
  }

  draw(graphics: Phaser.GameObjects.Graphics): void {
    // Draw grass background for map area
    const mapTop = HUD_TOP_HEIGHT
    const mapBottom = GAME_HEIGHT - HUD_BOTTOM_HEIGHT
    graphics.fillStyle(GRASS_COLOR, 1)
    graphics.fillRect(0, mapTop, GAME_WIDTH, mapBottom - mapTop)

    // Draw track border (slightly wider, darker)
    graphics.lineStyle(TRACK_WIDTH + 8, 0xA0804A, 1)
    graphics.beginPath()
    graphics.moveTo(this.waypoints[0].x, this.waypoints[0].y)
    for (let i = 1; i < this.waypoints.length; i++) {
      graphics.lineTo(this.waypoints[i].x, this.waypoints[i].y)
    }
    graphics.strokePath()

    // Draw main track
    graphics.lineStyle(TRACK_WIDTH, TRACK_COLOR, 1)
    graphics.beginPath()
    graphics.moveTo(this.waypoints[0].x, this.waypoints[0].y)
    for (let i = 1; i < this.waypoints.length; i++) {
      graphics.lineTo(this.waypoints[i].x, this.waypoints[i].y)
    }
    graphics.strokePath()

    // Draw start arrow
    const first = this.waypoints[0]
    const second = this.waypoints[1]
    const arrowAngle = Math.atan2(second.y - first.y, second.x - first.x)
    graphics.fillStyle(0xFFFFFF, 0.7)
    const ax = first.x + 30 * Math.cos(arrowAngle)
    const ay = first.y + 30 * Math.sin(arrowAngle)
    graphics.fillTriangle(
      ax + 12 * Math.cos(arrowAngle), ay + 12 * Math.sin(arrowAngle),
      ax + 8 * Math.cos(arrowAngle + 2.4), ay + 8 * Math.sin(arrowAngle + 2.4),
      ax + 8 * Math.cos(arrowAngle - 2.4), ay + 8 * Math.sin(arrowAngle - 2.4)
    )
  }
}
