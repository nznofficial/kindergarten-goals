import { useCallback, useEffect, useMemo, useState } from 'react'
import { clips, play, playSequence } from '../../audio/manager'
import { RoundShell } from '../../components/RoundShell'
import { useRound, ROUND_LENGTH } from '../../components/useRound'
import type { SequenceConfig } from '../../data/goals'
import { randomInt, sample, shuffle } from '../../lib/random'
import type { EngineProps } from '../types'

interface SeqTask {
  /** The full strip; null marks a gap the child has to fill. */
  strip: (number | null)[]
  /** Values of the gaps, in left-to-right order. */
  answers: number[]
  /** Tiles offered, including a couple of near-miss distractors. */
  tiles: number[]
}

function buildTasks(cfg: SequenceConfig, levelId: string): SeqTask[] {
  const { step, windowSize } = cfg
  return Array.from({ length: ROUND_LENGTH }, () => {
    let start: number
    if (step === 10) {
      start = 10
    } else if (levelId === 'to-20') {
      start = randomInt(1, 11)
    } else {
      // Start on a decade so the strip reads like a row of the 100 chart.
      start = randomInt(0, 9) * 10 + 1
    }

    const full = Array.from({ length: windowSize }, (_, i) => start + i * step)
    // Never blank the first cell: the child needs somewhere to start counting from.
    const gapCount = 3
    const gapPositions = sample(
      Array.from({ length: windowSize - 1 }, (_, i) => i + 1),
      gapCount,
    ).sort((a, b) => a - b)
    const uniqueGaps = [...new Set(gapPositions)]

    const strip = full.map((n, i) => (uniqueGaps.includes(i) ? null : n))
    const answers = uniqueGaps.map((i) => full[i])
    const decoys = [full[0] - step, full[windowSize - 1] + step].filter((n) => n > 0)
    return { strip, answers, tiles: shuffle([...answers, ...decoys]) }
  })
}

/** Fill the missing numbers in a counting strip, left to right. */
export function Sequence({ goal, level, onComplete, onExit }: EngineProps) {
  const cfg = level.config as SequenceConfig
  const tasks = useMemo(() => buildTasks(cfg, level.id), [cfg, level.id])
  const { index, total, status, triesLeft, answer } = useRound({ total: tasks.length, onComplete })
  const task = tasks[index]

  const [filled, setFilled] = useState<number[]>([])
  const [used, setUsed] = useState<number[]>([])

  const speakPrompt = useCallback(() => {
    void play(clips.ui(cfg.step === 10 ? 'count-by-tens' : 'fill-the-gaps'))
  }, [cfg.step])

  useEffect(() => {
    setFilled([])
    setUsed([])
    speakPrompt()
  }, [index, speakPrompt])

  const placeTile = (tile: number, tileIndex: number) => {
    if (status !== 'asking' || used.includes(tileIndex)) return
    const expected = task.answers[filled.length]
    if (tile === expected) {
      const next = [...filled, tile]
      setFilled(next)
      setUsed((u) => [...u, tileIndex])
      if (next.length === task.answers.length) {
        answer(true)
        void playSequence([clips.ui('yes'), clips.number(tile)])
      } else {
        void play(clips.number(tile))
      }
      return
    }
    const result = answer(false)
    if (result === 'revealed') {
      setFilled(task.answers)
      void playSequence([clips.ui('here-it-is'), clips.number(expected)])
    } else {
      void play(clips.ui('try-again'))
    }
  }

  let gapCursor = 0

  return (
    <RoundShell
      area={goal.area}
      title={goal.shortTitle}
      index={index}
      total={total}
      triesLeft={triesLeft}
      prompt={cfg.step === 10 ? 'Count by 10s. What is missing?' : 'What numbers are missing?'}
      pose={status === 'correct' ? 'cheer' : 'think'}
      onReplay={speakPrompt}
      onExit={onExit}
    >
      <div className="seq-strip">
        {task.strip.map((n, i) => {
          if (n !== null) {
            return (
              <span key={i} className="seq-cell">
                {n}
              </span>
            )
          }
          const value = filled[gapCursor]
          gapCursor += 1
          return (
            <span key={i} className={`seq-cell seq-gap ${value !== undefined ? 'seq-gap-filled' : ''}`}>
              {value ?? ''}
            </span>
          )
        })}
      </div>

      <div className="seq-tiles">
        {task.tiles.map((tile, i) => (
          <button
            key={i}
            type="button"
            className={`tile-number ${used.includes(i) ? 'tile-number-used' : ''}`}
            onClick={() => placeTile(tile, i)}
            disabled={status !== 'asking' || used.includes(i)}
          >
            {tile}
          </button>
        ))}
      </div>
    </RoundShell>
  )
}
