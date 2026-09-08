import { useCallback, useEffect, useMemo, useState } from 'react'
import { clips, play, playSequence } from '../../audio/manager'
import { GlyphView } from '../../components/GlyphView'
import { Img } from '../../components/Img'
import { RoundShell } from '../../components/RoundShell'
import { useRound, ROUND_LENGTH } from '../../components/useRound'
import type { CountItConfig } from '../../data/goals'
import { counterIds } from '../../data/objects'
import { distractors, pick, randomInt, shuffle } from '../../lib/random'
import type { EngineProps } from '../types'

interface CountTask {
  count: number
  itemId: string
  choices: number[]
}

function buildTasks(cfg: CountItConfig): CountTask[] {
  const [lo, hi] = cfg.range
  return Array.from({ length: ROUND_LENGTH }, () => {
    const count = randomInt(lo, hi)
    const pool = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
    return {
      count,
      itemId: pick(counterIds),
      choices: shuffle([count, ...distractors(pool, count, 2, String)]),
    }
  })
}

/**
 * Touch-to-count: every object must be tapped once, and each tap speaks the next
 * number. Only after the child has actually counted them do the numerals appear,
 * so this stays a one-to-one correspondence exercise rather than a guess.
 */
export function CountIt({ goal, level, onComplete, onExit }: EngineProps) {
  const cfg = level.config as CountItConfig
  const tasks = useMemo(() => buildTasks(cfg), [cfg])
  const { index, total, status, triesLeft, answer } = useRound({ total: tasks.length, onComplete })
  const task = tasks[index]

  const [tapped, setTapped] = useState<number[]>([])
  const counted = tapped.length === task.count

  const speakPrompt = useCallback(() => {
    void play(clips.ui('count-them'))
  }, [])

  useEffect(() => {
    setTapped([])
    speakPrompt()
  }, [index, speakPrompt])

  const tapObject = (i: number) => {
    if (tapped.includes(i) || status !== 'asking') return
    const next = [...tapped, i]
    setTapped(next)
    void play(clips.number(next.length))
  }

  const chooseNumber = (n: number) => {
    if (status !== 'asking') return
    const correct = n === task.count
    const result = answer(correct)
    if (correct) {
      void playSequence([clips.ui('yes'), clips.number(n)])
    } else if (result === 'revealed') {
      void playSequence([clips.ui('here-it-is'), clips.number(task.count)])
    } else {
      void play(clips.ui('count-again'))
    }
  }

  return (
    <RoundShell
      area={goal.area}
      title={goal.shortTitle}
      index={index}
      total={total}
      triesLeft={triesLeft}
      prompt={counted ? 'How many did you count?' : 'Tap each one to count them.'}
      pose={status === 'correct' ? 'cheer' : 'point'}
      onReplay={speakPrompt}
      onExit={onExit}
    >
      <div className="count-field">
        {Array.from({ length: task.count }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`count-item ${tapped.includes(i) ? 'count-item-done' : ''}`}
            onClick={() => tapObject(i)}
            aria-label={`Object ${i + 1}`}
          >
            <Img src={`words/${task.itemId}`} alt="" fallback="●" />
            {tapped.includes(i) ? <span className="count-badge">{tapped.indexOf(i) + 1}</span> : null}
          </button>
        ))}
      </div>

      {counted ? (
        <div className="tap-choices tap-choices-3">
          {task.choices.map((n) => {
            const isAnswer = n === task.count
            const state =
              status !== 'asking' && isAnswer ? (status === 'correct' ? 'correct' : 'revealed') : 'idle'
            return (
              <button
                key={n}
                type="button"
                className={`choice choice-${state}`}
                onClick={() => chooseNumber(n)}
                disabled={status !== 'asking'}
              >
                <GlyphView text={String(n)} className="v-glyph v-md" />
              </button>
            )
          })}
        </div>
      ) : null}
    </RoundShell>
  )
}
