import { useCallback, useEffect, useMemo, useState } from 'react'
import { clips, play, playSequence } from '../../audio/manager'
import { RoundShell } from '../../components/RoundShell'
import { useRound } from '../../components/useRound'
import type { TraceConfig } from '../../data/goals'
import { isTraceable } from '../../data/strokes'
import { sample } from '../../lib/random'
import type { EngineProps } from '../types'
import { TraceBoard } from './TraceBoard'

/** Spoken name of whatever is being traced. */
function clipsForItem(kind: TraceConfig['kind'], text: string): string[] {
  if (kind === 'numbers') return [clips.number(Number(text))]
  if (kind === 'letters') return [clips.letterName(text)]
  return [clips.name(text.includes(' ') ? 'full' : 'first')]
}

export function Trace({ goal, level, onComplete, onExit }: EngineProps) {
  const cfg = level.config as TraceConfig
  const items = useMemo(
    () => sample(cfg.items.filter(isTraceable), cfg.perRound),
    [cfg],
  )
  const { index, total, status, triesLeft, answer } = useRound({ total: items.length, onComplete })
  const text = items[index] ?? ''

  /** Bumped on every stray so the board remounts and restarts cleanly. */
  const [attemptKey, setAttemptKey] = useState(0)

  const speakPrompt = useCallback(() => {
    void playSequence([clips.ui('trace-it'), ...clipsForItem(cfg.kind, text)])
  }, [cfg.kind, text])

  useEffect(() => {
    setAttemptKey(0)
    speakPrompt()
  }, [index, speakPrompt])

  const onBoardComplete = () => {
    if (status !== 'asking') return
    answer(true, 1500)
    void playSequence([clips.ui('yes'), ...clipsForItem(cfg.kind, text)])
  }

  const onStray = () => {
    if (status !== 'asking') return
    const result = answer(false)
    setAttemptKey((k) => k + 1)
    if (result === 'revealed') {
      void play(clips.ui('watch-me'))
    } else {
      void play(clips.ui('stay-on-the-line'))
    }
  }

  return (
    <RoundShell
      area={goal.area}
      title={goal.shortTitle}
      index={index}
      total={total}
      triesLeft={triesLeft}
      prompt={`Trace: ${text}`}
      pose={status === 'correct' ? 'cheer' : 'point'}
      onReplay={speakPrompt}
      onExit={onExit}
    >
      <div className={`trace-stage trace-stage-${status}`}>
        <TraceBoard
          key={`${index}-${attemptKey}-${status === 'revealed' ? 'demo' : 'live'}`}
          text={text}
          demo={status === 'revealed'}
          onComplete={onBoardComplete}
          onStray={onStray}
        />
      </div>
    </RoundShell>
  )
}
