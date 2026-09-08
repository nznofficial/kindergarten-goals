import { useCallback, useEffect, useMemo, useState } from 'react'
import { clips, play, playSequence, preload } from '../../audio/manager'
import { RoundShell } from '../../components/RoundShell'
import { VisualView } from '../../components/VisualView'
import { useRound } from '../../components/useRound'
import type { TapPickConfig } from '../../data/goals'
import type { EngineProps } from '../types'
import { buildTapItems } from './items'

export function TapPick({ goal, level, onComplete, onExit }: EngineProps) {
  const cfg = level.config as TapPickConfig
  const items = useMemo(() => buildTapItems(cfg), [cfg])
  const { index, total, status, triesLeft, answer } = useRound({
    total: items.length,
    onComplete,
  })
  const item = items[index]

  /** Choices the child has already ruled out this item — dimmed, not removed. */
  const [ruledOut, setRuledOut] = useState<string[]>([])

  const speakPrompt = useCallback(() => {
    void playSequence(item.promptClips)
  }, [item])

  useEffect(() => {
    setRuledOut([])
    speakPrompt()
    // Get the next item's audio on disk while this one is being answered.
    const next = items[index + 1]
    if (next) preload(next.promptClips)
  }, [index, items, speakPrompt])

  const onChoice = (choiceId: string) => {
    if (status !== 'asking' || ruledOut.includes(choiceId)) return
    const correct = choiceId === item.answerId
    const result = answer(correct)

    if (correct) {
      const chosen = item.choices.find((c) => c.id === choiceId)
      void playSequence([clips.ui('yes'), ...(chosen?.clip ? [chosen.clip] : [])])
      return
    }

    setRuledOut((prev) => [...prev, choiceId])
    if (result === 'revealed') {
      const right = item.choices.find((c) => c.id === item.answerId)
      void playSequence([clips.ui('here-it-is'), ...(right?.clip ? [right.clip] : [])])
    } else {
      void play(clips.ui('try-again'))
    }
  }

  return (
    <RoundShell
      area={goal.area}
      title={goal.shortTitle}
      index={index}
      total={total}
      triesLeft={triesLeft}
      prompt={item.promptText}
      pose={status === 'correct' ? 'cheer' : 'idle'}
      onReplay={speakPrompt}
      onExit={onExit}
    >
      {item.promptVisual ? (
        <div className="tap-prompt">
          <VisualView visual={item.promptVisual} size="lg" />
        </div>
      ) : null}

      <div className={`tap-choices tap-choices-${item.choices.length}`}>
        {item.choices.map((choice) => {
          const isAnswer = choice.id === item.answerId
          const state =
            status !== 'asking' && isAnswer
              ? status === 'correct'
                ? 'correct'
                : 'revealed'
              : ruledOut.includes(choice.id)
                ? 'ruled-out'
                : 'idle'
          return (
            <button
              key={choice.id}
              type="button"
              className={`choice choice-${state}`}
              onClick={() => onChoice(choice.id)}
              disabled={status !== 'asking'}
            >
              <VisualView visual={choice.visual} />
            </button>
          )
        })}
      </div>
    </RoundShell>
  )
}
