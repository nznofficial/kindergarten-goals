import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { STROKE_BOX, glyphFor, type Point } from '../../data/strokes'
import { checkpointsFor, smoothPath, startAngle, type Checkpoint } from './path'

/** How close a finger must come to a checkpoint to claim it (SVG units). */
const HIT = 16
/** How far off the path counts as wandering away and resets the stroke. */
const MISS = 34
/** Look this far ahead so a fast swipe doesn't get stuck on a skipped point. */
const LOOKAHEAD = 4

interface FlatStroke {
  /** Index of the glyph this stroke belongs to, for the per-letter x offset. */
  glyph: number
  points: Point[]
}

interface Props {
  /** Text to trace, e.g. "Mia" or "17". Spaces are skipped. */
  text: string
  /** Called once every stroke has been traced in order. */
  onComplete: () => void
  /** Called when the finger wanders far off the path. */
  onStray: () => void
  /** Play the whole thing back as a demonstration, then reset. */
  demo: boolean
}

export function TraceBoard({ text, onComplete, onStray, demo }: Props) {
  const chars = useMemo(() => [...text].filter((c) => c !== ' '), [text])

  const strokes = useMemo<FlatStroke[]>(() => {
    const out: FlatStroke[] = []
    chars.forEach((ch, gi) => {
      const glyph = glyphFor(ch)
      if (!glyph) return
      for (const points of glyph) {
        out.push({ glyph: gi, points: points.map(([x, y]) => [x + gi * STROKE_BOX.width, y] as Point) })
      }
    })
    return out
  }, [chars])

  const svgRef = useRef<SVGSVGElement | null>(null)
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  const [checkpoints, setCheckpoints] = useState<Checkpoint[][]>([])

  const [strokeIndex, setStrokeIndex] = useState(0)
  const [progress, setProgress] = useState(0) // checkpoints claimed on the active stroke
  const drawing = useRef(false)

  // Measure after the paths exist; re-measure if the text changes.
  useEffect(() => {
    setCheckpoints(pathRefs.current.map((el) => (el ? checkpointsFor(el) : [])))
    setStrokeIndex(0)
    setProgress(0)
  }, [strokes])

  const width = Math.max(1, chars.length) * STROKE_BOX.width

  const toSvg = useCallback((e: React.PointerEvent): Checkpoint | null => {
    const svg = svgRef.current
    if (!svg) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const local = pt.matrixTransform(ctm.inverse())
    return { x: local.x, y: local.y }
  }, [])

  const dist = (a: Checkpoint, b: Checkpoint) => Math.hypot(a.x - b.x, a.y - b.y)

  const handleMove = (e: React.PointerEvent) => {
    if (!drawing.current) return
    const cps = checkpoints[strokeIndex]
    if (!cps || cps.length === 0) return
    const p = toSvg(e)
    if (!p) return

    // Claim the furthest checkpoint within reach, so a quick swipe still counts.
    let claimed = progress
    for (let i = progress; i < Math.min(cps.length, progress + LOOKAHEAD); i++) {
      if (dist(p, cps[i]) <= HIT) claimed = i + 1
    }

    if (claimed > progress) {
      if (claimed >= cps.length) {
        finishStroke()
        return
      }
      setProgress(claimed)
      return
    }

    // Nothing claimed: decide between "still on the line" and "wandered off".
    let nearest = Infinity
    for (let i = Math.max(0, progress - 2); i < Math.min(cps.length, progress + LOOKAHEAD); i++) {
      nearest = Math.min(nearest, dist(p, cps[i]))
    }
    if (nearest > MISS) {
      drawing.current = false
      setProgress(0)
      onStray()
    }
  }

  const finishStroke = () => {
    drawing.current = false
    const next = strokeIndex + 1
    if (next >= strokes.length) {
      setProgress(checkpoints[strokeIndex]?.length ?? 0)
      onComplete()
      return
    }
    setStrokeIndex(next)
    setProgress(0)
  }

  const handleDown = (e: React.PointerEvent) => {
    const cps = checkpoints[strokeIndex]
    if (!cps || cps.length === 0) return
    const p = toSvg(e)
    if (!p) return
    // Must start at the green dot; starting mid-stroke is what we're teaching against.
    if (dist(p, cps[0]) > HIT * 1.6) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    setProgress(1)
  }

  const handleUp = () => {
    // Lifting early just restarts this stroke - children lift constantly and it
    // should not cost them a try.
    if (drawing.current) setProgress(0)
    drawing.current = false
  }

  // Demonstration: sweep through every stroke so the child sees where it goes.
  useEffect(() => {
    if (!demo || checkpoints.length === 0) return
    let cancelled = false
    let s = 0
    let i = 0
    setStrokeIndex(0)
    setProgress(0)
    const tick = () => {
      if (cancelled) return
      const cps = checkpoints[s]
      if (!cps) return
      i += 2
      if (i >= cps.length) {
        s += 1
        i = 0
        if (s >= checkpoints.length) return
        setStrokeIndex(s)
        setProgress(0)
      } else {
        setProgress(i)
      }
      timer = setTimeout(tick, 26)
    }
    let timer = setTimeout(tick, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [demo, checkpoints])

  return (
    <svg
      ref={svgRef}
      className="trace-svg"
      viewBox={`0 0 ${width} ${STROKE_BOX.height}`}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
    >
      {/* Handwriting guide lines, the same ones printed on kindergarten paper. */}
      <line className="rule rule-solid" x1="0" y1={STROKE_BOX.capTop} x2={width} y2={STROKE_BOX.capTop} />
      <line className="rule rule-dashed" x1="0" y1={STROKE_BOX.xHeight} x2={width} y2={STROKE_BOX.xHeight} />
      <line className="rule rule-solid" x1="0" y1={STROKE_BOX.baseline} x2={width} y2={STROKE_BOX.baseline} />

      {strokes.map((stroke, i) => {
        const d = smoothPath(stroke.points)
        const done = i < strokeIndex
        const active = i === strokeIndex
        const cps = checkpoints[i] ?? []
        const ratio = active && cps.length > 1 ? progress / (cps.length - 1) : done ? 1 : 0
        return (
          <g key={i}>
            <path
              ref={(el) => {
                pathRefs.current[i] = el
              }}
              className={`trace-guide ${active ? 'trace-guide-active' : ''}`}
              d={d}
            />
            <path
              className="trace-ink"
              d={d}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - Math.min(1, ratio)}
            />
          </g>
        )
      })}

      {/* Start dot and direction arrow for the stroke the child is on now. */}
      {strokes[strokeIndex] ? (
        <g className="trace-start">
          <circle cx={strokes[strokeIndex].points[0][0]} cy={strokes[strokeIndex].points[0][1]} r="9" />
          <polygon
            points="-5,-5 7,0 -5,5"
            transform={`translate(${strokes[strokeIndex].points[0][0]} ${strokes[strokeIndex].points[0][1]}) rotate(${startAngle(strokes[strokeIndex].points)}) translate(14 0)`}
          />
        </g>
      ) : null}
    </svg>
  )
}
