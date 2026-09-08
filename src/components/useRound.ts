import { useCallback, useEffect, useRef, useState } from 'react'
import { starsFor, type Stars } from '../state/progress'

export const ROUND_LENGTH = 8
export const MAX_TRIES = 3

export type ItemStatus = 'asking' | 'correct' | 'revealed'

interface Options {
  total: number
  onComplete: (stars: Stars, firstTryCorrect: number) => void
}

/**
 * The rules every mini-game shares: eight items, three tries each, then the
 * answer is revealed and we move on. Stars come from first-try accuracy, so
 * a revealed answer costs a star but never ends the round.
 */
export function useRound({ total, onComplete }: Options) {
  const [index, setIndex] = useState(0)
  const [wrongTries, setWrongTries] = useState(0)
  const [status, setStatus] = useState<ItemStatus>('asking')
  const firstTryCorrect = useRef(0)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    advanceTimer.current = null
  }
  useEffect(() => clearTimer, [])

  const advance = useCallback(() => {
    clearTimer()
    const next = index + 1
    if (next >= total) {
      onComplete(starsFor(firstTryCorrect.current, total), firstTryCorrect.current)
      return
    }
    setIndex(next)
    setWrongTries(0)
    setStatus('asking')
  }, [index, total, onComplete])

  /**
   * Report one answer. Returns the resulting status so the engine can play the
   * matching sound and animation without duplicating this logic.
   */
  const answer = useCallback(
    (correct: boolean, holdMs = 1200): ItemStatus => {
      if (status !== 'asking') return status
      if (correct) {
        if (wrongTries === 0) firstTryCorrect.current += 1
        setStatus('correct')
        advanceTimer.current = setTimeout(advance, holdMs)
        return 'correct'
      }
      const tries = wrongTries + 1
      setWrongTries(tries)
      if (tries >= MAX_TRIES) {
        setStatus('revealed')
        advanceTimer.current = setTimeout(advance, holdMs + 1400)
        return 'revealed'
      }
      return 'asking'
    },
    [status, wrongTries, advance],
  )

  return {
    index,
    total,
    status,
    wrongTries,
    triesLeft: MAX_TRIES - wrongTries,
    answer,
    advance,
    /** For engines like tracing that succeed as a whole rather than by choice. */
    complete: (clean: boolean, holdMs = 1200) => answer(clean, holdMs),
  }
}
