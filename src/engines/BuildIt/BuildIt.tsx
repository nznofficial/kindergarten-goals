import { useCallback, useEffect, useMemo, useState } from 'react'
import { clips, play, playSequence } from '../../audio/manager'
import { Img } from '../../components/Img'
import { RoundShell } from '../../components/RoundShell'
import { useRound, ROUND_LENGTH } from '../../components/useRound'
import type { BuildItConfig } from '../../data/goals'
import { alphabet } from '../../data/letters'
import { rhymeFamilies } from '../../data/objects'
import { sentences } from '../../data/sentences'
import { distractors, sample, shuffle } from '../../lib/random'
import type { EngineProps } from '../types'

// ---------------------------------------------------------------------------
// Rhyme building: swap the beginning sound to make a new word that rhymes.
// ---------------------------------------------------------------------------

interface RhymeTask {
  cueId: string
  cueWord: string
  rime: string
  /** letter -> the word it makes, for every tile that produces a real rhyme. */
  valid: Record<string, { id: string; word: string }>
  tiles: string[]
}

function buildRhymeTasks(): RhymeTask[] {
  const usable = rhymeFamilies.filter(
    (f) => f.members.filter((m) => m.initial && m.word.length === m.rime!.length + 1).length >= 2,
  )
  return sample(usable, ROUND_LENGTH).map((family) => {
    const onsetMembers = family.members.filter(
      (m) => m.initial && m.word.length === family.rime.length + 1,
    )
    const [cue, ...rest] = shuffle(onsetMembers)
    const valid: RhymeTask['valid'] = {}
    for (const m of rest) valid[m.initial as string] = { id: m.id, word: m.word }
    const validLetters = Object.keys(valid)
    const wrong = distractors(
      alphabet.filter((l) => !validLetters.includes(l) && l !== cue.initial),
      '',
      Math.max(1, 4 - validLetters.length),
      (l) => l,
    )
    return {
      cueId: cue.id,
      cueWord: cue.word,
      rime: family.rime,
      valid,
      tiles: shuffle([...validLetters, ...wrong]).slice(0, 4),
    }
  })
}

function RhymeGame({ goal, level, onComplete, onExit }: EngineProps) {
  const tasks = useMemo(buildRhymeTasks, [level.id])
  const { index, total, status, triesLeft, answer } = useRound({ total: tasks.length, onComplete })
  const task = tasks[index]
  const [made, setMade] = useState<string | null>(null)

  const speakPrompt = useCallback(() => {
    void playSequence([clips.ui('make-a-rhyme'), clips.word(task.cueId)])
  }, [task])

  useEffect(() => {
    setMade(null)
    speakPrompt()
  }, [index, speakPrompt])

  const tapLetter = (letter: string) => {
    if (status !== 'asking') return
    const hit = task.valid[letter]
    if (hit) {
      setMade(hit.word)
      answer(true, 1800)
      void playSequence([clips.ui('yes'), clips.word(hit.id)])
      return
    }
    const result = answer(false)
    if (result === 'revealed') {
      const first = Object.values(task.valid)[0]
      setMade(first.word)
      void playSequence([clips.ui('here-it-is'), clips.word(first.id)])
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
      prompt={`Make a word that rhymes with "${task.cueWord}"`}
      pose={status === 'correct' ? 'cheer' : 'think'}
      onReplay={speakPrompt}
      onExit={onExit}
    >
      <div className="rhyme-cue">
        <Img src={`words/${task.cueId}`} alt={task.cueWord} fallback={task.cueWord} />
        <span className="rhyme-cue-word">{task.cueWord}</span>
      </div>

      <div className="rhyme-slot">
        <span className="rhyme-onset">{made ? made[0] : '?'}</span>
        <span className="rhyme-rime">{task.rime}</span>
      </div>

      <div className="rhyme-tiles">
        {task.tiles.map((letter) => (
          <button
            key={letter}
            type="button"
            className="tile-letter"
            onClick={() => tapLetter(letter)}
            disabled={status !== 'asking'}
          >
            {letter}
          </button>
        ))}
      </div>
    </RoundShell>
  )
}

// ---------------------------------------------------------------------------
// Sentence building: tap the words in order, then the punctuation.
// ---------------------------------------------------------------------------

function SentenceGame({ goal, level, onComplete, onExit }: EngineProps) {
  const tasks = useMemo(() => sample(sentences, 6), [level.id])
  const { index, total, status, triesLeft, answer } = useRound({ total: tasks.length, onComplete })
  const task = tasks[index]

  const target = useMemo(() => [...task.words, task.end], [task])
  const tiles = useMemo(() => shuffle(target), [target])

  const [built, setBuilt] = useState<number[]>([])

  const speakPrompt = useCallback(() => {
    void play(clips.ui('build-sentence'))
  }, [])

  useEffect(() => {
    setBuilt([])
    speakPrompt()
  }, [index, speakPrompt])

  const tapTile = (tileIndex: number) => {
    if (status !== 'asking' || built.includes(tileIndex)) return
    const expected = target[built.length]
    if (tiles[tileIndex] === expected) {
      const next = [...built, tileIndex]
      setBuilt(next)
      if (next.length === target.length) {
        answer(true, 1800)
        void play(clips.ui('yes'))
      }
      return
    }
    const result = answer(false)
    if (result === 'revealed') {
      // Show the finished sentence by replaying it in the correct order.
      const order: number[] = []
      const taken = new Set<number>()
      for (const word of target) {
        const i = tiles.findIndex((t, idx) => t === word && !taken.has(idx))
        taken.add(i)
        order.push(i)
      }
      setBuilt(order)
      void play(clips.ui('here-it-is'))
    } else {
      void play(clips.ui('try-again'))
    }
  }

  const rules = [
    { label: 'Capital letter', ok: built.length > 0 },
    { label: 'Spaces between words', ok: built.length > 1 },
    { label: 'Ends with a mark', ok: built.length === target.length },
  ]

  return (
    <RoundShell
      area={goal.area}
      title={goal.shortTitle}
      index={index}
      total={total}
      triesLeft={triesLeft}
      prompt="Build the sentence, word by word."
      pose={status === 'correct' ? 'cheer' : 'think'}
      onReplay={speakPrompt}
      onExit={onExit}
    >
      <div className="sentence-line">
        {built.length === 0 ? <span className="sentence-empty">Tap the first word…</span> : null}
        {built.map((t) => (
          <span key={t} className="sentence-word">
            {tiles[t]}
          </span>
        ))}
      </div>

      <ul className="sentence-rules">
        {rules.map((r) => (
          <li key={r.label} className={r.ok ? 'rule-ok' : ''}>
            {r.ok ? '✓' : '○'} {r.label}
          </li>
        ))}
      </ul>

      <div className="sentence-tiles">
        {tiles.map((tile, i) => (
          <button
            key={i}
            type="button"
            className={`tile-word ${built.includes(i) ? 'tile-word-used' : ''}`}
            onClick={() => tapTile(i)}
            disabled={status !== 'asking' || built.includes(i)}
          >
            {tile}
          </button>
        ))}
      </div>
    </RoundShell>
  )
}

export function BuildIt(props: EngineProps) {
  const cfg = props.level.config as BuildItConfig
  return cfg.kind === 'rhyme' ? <RhymeGame {...props} /> : <SentenceGame {...props} />
}
