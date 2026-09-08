import { STROKE_BOX, glyphFor } from '../data/strokes'
import { smoothPath } from '../engines/Trace/path'

/**
 * Draws letters and numerals from the same stroke data the tracing game uses.
 *
 * This matters more than it looks: ordinary fonts render a double-story "a" and
 * "g", which are not the letterforms a kindergartner is taught to write. Showing
 * the traced form everywhere keeps recognition and handwriting consistent.
 */
export function GlyphView({ text, className }: { text: string; className?: string }) {
  const chars = [...text]
  if (!chars.every((c) => glyphFor(c))) {
    // Punctuation, operators, anything unauthored: fall back to real text.
    return <span className={className}>{text}</span>
  }

  const width = chars.length * STROKE_BOX.width
  return (
    <svg className={`glyph ${className ?? ''}`} viewBox={`0 0 ${width} ${STROKE_BOX.height}`} role="img" aria-label={text}>
      {chars.flatMap((ch, gi) =>
        (glyphFor(ch) ?? []).map((points, si) => (
          <path
            key={`${gi}-${si}`}
            className="glyph-stroke"
            d={smoothPath(points.map(([x, y]) => [x + gi * STROKE_BOX.width, y]))}
          />
        )),
      )}
    </svg>
  )
}
