import type { Point } from '../../data/strokes'

/**
 * Catmull-Rom through the authored points, emitted as cubic beziers. Letting the
 * curve pass through every point means the authored data stays readable as
 * "here is where the pencil goes" rather than as control-point soup.
 */
export function smoothPath(points: Point[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`
  if (points.length === 2) {
    return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`
  }

  const pts = points
  // A stroke that ends where it began (o, 0, 8) must borrow its neighbours from
  // the other end of the loop, or the join shows up as a sharp point.
  const closed =
    pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1] && pts.length > 3
  const before = (i: number) => (i < 0 ? (closed ? pts[pts.length - 2] : pts[0]) : pts[i])
  const after = (i: number) =>
    i > pts.length - 1 ? (closed ? pts[1] : pts[pts.length - 1]) : pts[i]

  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = before(i - 1)
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = after(i + 2)
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`
  }
  return d
}

export interface Checkpoint {
  x: number
  y: number
}

/**
 * Even samples along a rendered path. Uses the browser's own path measurement
 * rather than re-implementing bezier arc length.
 */
export function checkpointsFor(el: SVGPathElement, spacing = 7): Checkpoint[] {
  const total = el.getTotalLength()
  if (total === 0) return []
  const count = Math.max(2, Math.round(total / spacing))
  return Array.from({ length: count + 1 }, (_, i) => {
    const p = el.getPointAtLength((i / count) * total)
    return { x: p.x, y: p.y }
  })
}

/** Direction of travel at the start of a stroke, for the guiding arrow. */
export function startAngle(points: Point[]): number {
  const [a, b] = [points[0], points[1] ?? points[0]]
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI
}
