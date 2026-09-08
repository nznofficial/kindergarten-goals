import type { ReactNode } from 'react'
import type { GoalArea } from '../data/types'
import { Mascot, type MascotPose } from './Mascot'

interface Props {
  area: GoalArea
  title: string
  index: number
  total: number
  /** Wrong tries used on the current item, drawn as fading hearts. */
  triesLeft: number
  prompt?: string
  pose?: MascotPose
  onReplay?: () => void
  onExit: () => void
  children: ReactNode
}

/**
 * The frame every mini-game plays inside: exit, progress dots, remaining tries,
 * the mascot asking the question, and the engine's own board below.
 */
export function RoundShell({
  area,
  title,
  index,
  total,
  triesLeft,
  prompt,
  pose = 'idle',
  onReplay,
  onExit,
  children,
}: Props) {
  return (
    <div className={`round area-${area}`}>
      <header className="round-top">
        <button type="button" className="icon-button" onClick={onExit} aria-label="Back to my goals">
          ←
        </button>
        <div className="round-dots" aria-label={`Question ${index + 1} of ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`dot ${i < index ? 'dot-done' : ''} ${i === index ? 'dot-now' : ''}`} />
          ))}
        </div>
        <div className="round-tries" aria-label={`${triesLeft} tries left`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={`try ${i < triesLeft ? 'try-on' : 'try-off'}`} aria-hidden="true">
              ♥
            </span>
          ))}
        </div>
      </header>

      <h1 className="round-title">{title}</h1>

      <Mascot pose={pose} says={prompt} size="sm" onClick={onReplay} />

      <main className="round-board">{children}</main>
    </div>
  )
}
