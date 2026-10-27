import Phaser from 'phaser'

type Gfx = Phaser.GameObjects.Graphics
type Pt = { x: number; y: number }

// Every icon is designed in a local ±24 unit space around (0,0) and then
// scaled/offset to wherever the caller wants it drawn (hero token on the
// battlefield vs. the larger card in the Hero Shop).
function at(cx: number, cy: number, s: number) {
  return {
    p: (x: number, y: number): Pt => ({ x: cx + x * s, y: cy + y * s }),
    r: (v: number): number => v * s,
  }
}

function starPoints(cx: number, cy: number, s: number, spikes: number, outerR: number, innerR: number): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? outerR : innerR
    const a = -Math.PI / 2 + (i / (spikes * 2)) * Math.PI * 2
    pts.push({ x: cx + Math.cos(a) * rad * s, y: cy + Math.sin(a) * rad * s })
  }
  return pts
}

function bladePoints(cx: number, cy: number, s: number, angle: number, length: number, width: number): Pt[] {
  const dx = Math.cos(angle), dy = Math.sin(angle)
  const px = -dy, py = dx
  const hl = length / 2, hw = width / 2
  return [
    { x: cx + (-dx * hl + px * hw) * s, y: cy + (-dy * hl + py * hw) * s },
    { x: cx + (dx * hl + px * hw) * s, y: cy + (dy * hl + py * hw) * s },
    { x: cx + (dx * hl - px * hw) * s, y: cy + (dy * hl - py * hw) * s },
    { x: cx + (-dx * hl - px * hw) * s, y: cy + (-dy * hl - py * hw) * s },
  ]
}

/** Small gold crown badge worn by every hero, sitting above the head centre. */
export function drawHeroCrown(g: Gfx, cx: number, cy: number, s: number = 1): void {
  const { p, r } = at(cx, cy, s)
  const GOLD = 0xFFD700
  g.fillStyle(GOLD)
  const base = p(-9, -19)
  g.fillRect(base.x, base.y, r(18), r(5))
  const left = p(-8, -26)
  g.fillRect(left.x, left.y, r(4), r(8))
  const mid = p(-2, -29)
  g.fillRect(mid.x, mid.y, r(4), r(11))
  const right = p(4, -26)
  g.fillRect(right.x, right.y, r(4), r(8))
  g.fillStyle(0xFFFFFF, 0.9)
  const g1 = p(-6, -27); g.fillCircle(g1.x, g1.y, r(1.4))
  const g2 = p(0, -30); g.fillCircle(g2.x, g2.y, r(1.4))
  const g3 = p(6, -27); g.fillCircle(g3.x, g3.y, r(1.4))
}

function drawQuincy(g: Gfx, cx: number, cy: number, s: number): void {
  const { p, r } = at(cx, cy, s)
  g.lineStyle(r(2.5), 0xFFFFFF, 0.95)
  const c = p(0, 4)
  g.strokeCircle(c.x, c.y, r(13))
  g.strokeCircle(c.x, c.y, r(6))
  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    const a = p(x1, y1), b = p(x2, y2)
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.strokePath()
  }
  drawLine(0, -13, 0, -6)
  drawLine(0, 15, 0, 22)
  drawLine(-17, 4, -10, 4)
  drawLine(10, 4, 17, 4)
  g.fillStyle(0xFFFFFF)
  g.fillCircle(c.x, c.y, r(2))
}

function drawGwendolin(g: Gfx, cx: number, cy: number, s: number): void {
  const { p, r } = at(cx, cy, s)
  const outer = [p(0, -16), p(12, 10), p(-12, 10)]
  g.fillStyle(0xFFDD55)
  g.fillTriangle(outer[0].x, outer[0].y, outer[1].x, outer[1].y, outer[2].x, outer[2].y)
  const inner = [p(0, -6), p(7, 12), p(-7, 12)]
  g.fillStyle(0xFF6600)
  g.fillTriangle(inner[0].x, inner[0].y, inner[1].x, inner[1].y, inner[2].x, inner[2].y)
  const ember = p(0, 10)
  g.fillStyle(0xFFFFCC)
  g.fillCircle(ember.x, ember.y, r(3))
}

function drawStrikerJones(g: Gfx, cx: number, cy: number, s: number): void {
  const outerPts = starPoints(cx, cy, s, 5, 15, 6.5)
  g.fillStyle(0xEEDD55)
  g.fillPoints(outerPts, true)
  g.lineStyle(s * 1.5, 0x886611)
  g.strokePoints(outerPts, true)
  const { p } = at(cx, cy, s)
  const c = p(0, 0)
  g.fillStyle(0x556644)
  g.fillCircle(c.x, c.y, s * 4)
}

function drawObyn(g: Gfx, cx: number, cy: number, s: number): void {
  const { p, r } = at(cx, cy, s)
  const a = p(0, -16), b = p(12, 4), c = p(0, 20), d = p(-12, 4)
  g.fillStyle(0x33CC55)
  g.fillTriangle(a.x, a.y, b.x, b.y, c.x, c.y)
  g.fillTriangle(a.x, a.y, d.x, d.y, c.x, c.y)
  g.lineStyle(r(1.5), 0x116622)
  g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(c.x, c.y); g.strokePath()
}

function drawChurchill(g: Gfx, cx: number, cy: number, s: number): void {
  const { p, r } = at(cx, cy, s)
  const dome = p(0, -2)
  g.fillStyle(0x556644)
  g.fillCircle(dome.x, dome.y, r(13))
  const rim = p(-14, -4)
  g.fillStyle(0x334422)
  g.fillRect(rim.x, rim.y, r(28), r(6))
  const gl = p(-6, -2), gr = p(6, -2)
  g.fillStyle(0x223311)
  g.fillCircle(gl.x, gl.y, r(4))
  g.fillCircle(gr.x, gr.y, r(4))
  g.fillStyle(0x88CCFF)
  g.fillCircle(gl.x, gl.y, r(2))
  g.fillCircle(gr.x, gr.y, r(2))
}

function drawBenjamin(g: Gfx, cx: number, cy: number, s: number): void {
  const { p, r } = at(cx, cy, s)
  const a = p(0, -16), b = p(14, 14), c = p(-14, 14)
  g.fillStyle(0x223344)
  g.fillTriangle(a.x, a.y, b.x, b.y, c.x, c.y)
  const face = p(0, 2)
  g.fillStyle(0x0A0A0A)
  g.fillCircle(face.x, face.y, r(8))
  const bar = p(-6, 0)
  g.fillStyle(0x33FFCC)
  g.fillRect(bar.x, bar.y, r(12), r(3))
}

function drawEzili(g: Gfx, cx: number, cy: number, s: number): void {
  const { p, r } = at(cx, cy, s)
  const skull = p(0, 2)
  g.fillStyle(0xEEEEEE)
  g.fillCircle(skull.x, skull.y, r(12))
  g.fillStyle(0x111111)
  const le = [p(-8, 0), p(-2, 6), p(-11, 7)]
  g.fillTriangle(le[0].x, le[0].y, le[1].x, le[1].y, le[2].x, le[2].y)
  const re = [p(8, 0), p(2, 6), p(11, 7)]
  g.fillTriangle(re[0].x, re[0].y, re[1].x, re[1].y, re[2].x, re[2].y)
  const spike = p(-2, -16)
  g.fillStyle(0xAA44CC)
  g.fillRect(spike.x, spike.y, r(4), r(9))
}

function drawPatFusty(g: Gfx, cx: number, cy: number, s: number): void {
  const { p, r } = at(cx, cy, s)
  g.fillStyle(0xCC8844)
  const k1 = p(-6, 0), k2 = p(5, -3), k3 = p(10, 6), k4 = p(-2, 10)
  g.fillCircle(k1.x, k1.y, r(9))
  g.fillCircle(k2.x, k2.y, r(9))
  g.fillCircle(k3.x, k3.y, r(7))
  g.fillCircle(k4.x, k4.y, r(7))
  const cuff = p(-10, 12)
  g.fillStyle(0x996633)
  g.fillRect(cuff.x, cuff.y, r(20), r(8))
}

function drawAdora(g: Gfx, cx: number, cy: number, s: number): void {
  g.fillStyle(0xFFD700)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const tip = { x: cx + Math.cos(a) * 17 * s, y: cy + Math.sin(a) * 17 * s }
    const l = { x: cx + Math.cos(a - 0.18) * 7 * s, y: cy + Math.sin(a - 0.18) * 7 * s }
    const rgt = { x: cx + Math.cos(a + 0.18) * 7 * s, y: cy + Math.sin(a + 0.18) * 7 * s }
    g.fillTriangle(tip.x, tip.y, l.x, l.y, rgt.x, rgt.y)
  }
  g.fillStyle(0xFFEE99)
  g.fillCircle(cx, cy, 8 * s)
  g.lineStyle(1.5 * s, 0xCC8800)
  g.strokeCircle(cx, cy, 8 * s)
}

function drawBrickell(g: Gfx, cx: number, cy: number, s: number): void {
  const { p, r } = at(cx, cy, s)
  const ring = p(0, -8)
  g.lineStyle(r(3), 0xDDEEFF)
  g.strokeCircle(ring.x, ring.y, r(4))
  const shaftTop = p(0, -4), shaftBot = p(0, 14)
  g.beginPath(); g.moveTo(shaftTop.x, shaftTop.y); g.lineTo(shaftBot.x, shaftBot.y); g.strokePath()
  const flukeL = p(-9, 14), flukeTip = p(0, 20), flukeR = p(9, 14)
  g.beginPath(); g.moveTo(flukeL.x, flukeL.y); g.lineTo(flukeTip.x, flukeTip.y); g.strokePath()
  g.beginPath(); g.moveTo(flukeR.x, flukeR.y); g.lineTo(flukeTip.x, flukeTip.y); g.strokePath()
  const barL = p(-7, -1), barR = p(7, -1)
  g.beginPath(); g.moveTo(barL.x, barL.y); g.lineTo(barR.x, barR.y); g.strokePath()
}

function drawEtienne(g: Gfx, cx: number, cy: number, s: number): void {
  const { p, r } = at(cx, cy, s)
  const l = p(-7, 3), rt = p(7, 3)
  g.fillStyle(0x445566)
  g.fillCircle(l.x, l.y, r(7))
  g.fillCircle(rt.x, rt.y, r(7))
  const bridge = p(-3, 1)
  g.fillStyle(0x223344)
  g.fillRect(bridge.x, bridge.y, r(6), r(4))
  g.fillStyle(0xAADDFF)
  g.fillCircle(l.x, l.y, r(3))
  g.fillCircle(rt.x, rt.y, r(3))
  const prop = p(0, -15)
  g.lineStyle(r(2), 0xCCCCCC)
  g.strokeCircle(prop.x, prop.y, r(5))
}

function drawSauda(g: Gfx, cx: number, cy: number, s: number): void {
  const b1 = bladePoints(cx, cy, s, Math.PI / 4, 34, 4)
  const b2 = bladePoints(cx, cy, s, -Math.PI / 4, 34, 4)
  g.fillStyle(0xDDDDDD)
  g.fillPoints(b1, true)
  g.fillPoints(b2, true)
  g.lineStyle(s, 0x888888)
  g.strokePoints(b1, true)
  g.strokePoints(b2, true)
  g.fillStyle(0x881111)
  g.fillCircle(cx, cy, 3 * s)
}

function drawPsi(g: Gfx, cx: number, cy: number, s: number): void {
  const { p, r } = at(cx, cy, s)
  const eye = p(0, 2)
  g.fillStyle(0xEEDDFF)
  g.fillEllipse(eye.x, eye.y, r(26), r(14))
  g.fillStyle(0x330066)
  g.fillCircle(eye.x, eye.y, r(7))
  g.fillStyle(0xCC88FF)
  g.fillCircle(eye.x, eye.y, r(3))
  g.lineStyle(r(1.5), 0x9933EE, 0.8)
  g.strokeCircle(eye.x, eye.y, r(14))
}

function drawGeraldo(g: Gfx, cx: number, cy: number, s: number): void {
  const { p, r } = at(cx, cy, s)
  const a = p(0, -18), b = p(12, 4), c = p(-12, 4)
  g.fillStyle(0x557755)
  g.fillTriangle(a.x, a.y, b.x, b.y, c.x, c.y)
  const brim = p(-14, 2)
  g.fillStyle(0x3D5A3D)
  g.fillRect(brim.x, brim.y, r(28), r(4))
  const bag = p(-8, 10)
  g.fillStyle(0x774422)
  g.fillRect(bag.x, bag.y, r(16), r(10))
  const clasp = p(0, 15)
  g.fillStyle(0xFFCC66)
  g.fillCircle(clasp.x, clasp.y, r(2))
}

function drawCorvus(g: Gfx, cx: number, cy: number, s: number): void {
  const { p, r } = at(cx, cy, s)
  const wingTop = p(0, -14)
  const rWing = p(16, 8), rTuck = p(-4, 4)
  const lWing = p(-16, 8), lTuck = p(4, 4)
  g.fillStyle(0x221133)
  g.fillTriangle(wingTop.x, wingTop.y, rWing.x, rWing.y, rTuck.x, rTuck.y)
  g.fillTriangle(wingTop.x, wingTop.y, lWing.x, lWing.y, lTuck.x, lTuck.y)
  const head = p(0, -6)
  g.fillCircle(head.x, head.y, r(7))
  const beakA = p(6, -6), beakB = p(13, -4), beakC = p(6, -2)
  g.fillStyle(0xFFCC00)
  g.fillTriangle(beakA.x, beakA.y, beakB.x, beakB.y, beakC.x, beakC.y)
  const eye = p(3, -8)
  g.fillStyle(0xFFFFFF)
  g.fillCircle(eye.x, eye.y, r(1.5))
}

function drawRosalia(g: Gfx, cx: number, cy: number, s: number): void {
  const bolt: Pt[] = [
    { x: cx - 3 * s, y: cy - 18 * s },
    { x: cx + 6 * s, y: cy - 2 * s },
    { x: cx - 1 * s, y: cy - 2 * s },
    { x: cx + 5 * s, y: cy + 16 * s },
    { x: cx - 8 * s, y: cy - 4 * s },
    { x: cx - 1 * s, y: cy - 4 * s },
  ]
  g.fillStyle(0xFFFFAA)
  g.fillPoints(bolt, true)
  g.lineStyle(1.5 * s, 0x3399CC)
  g.strokePoints(bolt, true)
}

const ICON_DRAWERS: Record<string, (g: Gfx, cx: number, cy: number, s: number) => void> = {
  quincy: drawQuincy,
  gwendolin: drawGwendolin,
  striker_jones: drawStrikerJones,
  obyn_greenfoot: drawObyn,
  captain_churchill: drawChurchill,
  benjamin: drawBenjamin,
  ezili: drawEzili,
  pat_fusty: drawPatFusty,
  adora: drawAdora,
  admiral_brickell: drawBrickell,
  etienne: drawEtienne,
  sauda: drawSauda,
  psi: drawPsi,
  geraldo: drawGeraldo,
  corvus: drawCorvus,
  rosalia: drawRosalia,
}

/** Draws the hero's distinguishing icon centred at (cx, cy) at the given scale. */
export function drawHeroIcon(g: Gfx, id: string, cx: number, cy: number, s: number = 1): void {
  const drawer = ICON_DRAWERS[id]
  if (drawer) drawer(g, cx, cy + 4 * s, s)
}
