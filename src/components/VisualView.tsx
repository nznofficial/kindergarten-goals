import type { Visual } from '../engines/TapPick/items'
import { GlyphView } from './GlyphView'
import { Img } from './Img'

/** Renders any prompt or choice shape the engines produce. */
export function VisualView({ visual, size = 'md' }: { visual: Visual; size?: 'sm' | 'md' | 'lg' }) {
  switch (visual.type) {
    case 'glyph':
      return <GlyphView text={visual.text} className={`v-glyph v-${size}`} />
    case 'word':
      return <span className={`v-word v-${size}`}>{visual.text}</span>
    case 'image':
      return <Img src={visual.src} alt={visual.alt} className={`v-image v-${size}`} fallback={visual.alt} />
    case 'group':
      return (
        <span className="v-group" aria-label={`${visual.count} things`}>
          {Array.from({ length: visual.count }, (_, i) => (
            <Img key={i} src={`words/${visual.itemId}`} alt="" className="v-group-item" fallback="●" />
          ))}
        </span>
      )
    case 'equation':
      return (
        <span className="v-equation">
          {visual.itemId ? (
            <>
              <span className="v-group v-group-inline">
                {Array.from({ length: visual.a }, (_, i) => (
                  <Img key={i} src={`words/${visual.itemId}`} alt="" className="v-group-item" fallback="●" />
                ))}
              </span>
              <span className="v-op">{visual.op}</span>
              <span className={`v-group v-group-inline ${visual.op === '-' ? 'v-group-removed' : ''}`}>
                {Array.from({ length: visual.b }, (_, i) => (
                  <Img key={i} src={`words/${visual.itemId}`} alt="" className="v-group-item" fallback="●" />
                ))}
              </span>
              <span className="v-op">=</span>
              <span className="v-op">?</span>
            </>
          ) : (
            <span className="v-equation-text">
              <GlyphView text={String(visual.a)} className="v-glyph v-md" />
              <span className="v-op">{visual.op}</span>
              <GlyphView text={String(visual.b)} className="v-glyph v-md" />
              <span className="v-op">=</span>
              <span className="v-op">?</span>
            </span>
          )}
        </span>
      )
  }
}
