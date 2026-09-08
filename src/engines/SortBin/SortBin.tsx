import { useCallback, useEffect, useMemo, useState } from 'react'
import { clips, play } from '../../audio/manager'
import { Img } from '../../components/Img'
import { RoundShell } from '../../components/RoundShell'
import { useRound } from '../../components/useRound'
import type { SortBinConfig } from '../../data/goals'
import { pictureWords, type Category } from '../../data/objects'
import { pick, sample, shuffle } from '../../lib/random'
import type { EngineProps } from '../types'

/** One thing to sort: either a generated illustration or a drawn shape. */
type Piece =
  | { kind: 'image'; id: string; src: string; alt: string; bin: string }
  | { kind: 'shape'; id: string; color: string; scale: number; bin: string }

interface SortTask {
  question: string
  promptClip: string
  bins: { id: string; label: string }[]
  pieces: Piece[]
}

const COLORS = [
  { id: 'red', label: 'Red', hex: '#e2574c' },
  { id: 'blue', label: 'Blue', hex: '#3d8ed9' },
  { id: 'yellow', label: 'Yellow', hex: '#f2c33c' },
  { id: 'green', label: 'Green', hex: '#4aa96c' },
]

const CATEGORY_LABEL: Partial<Record<Category, string>> = {
  animal: 'Animals',
  food: 'Food',
  vehicle: 'Things that go',
  clothing: 'Clothes',
  toy: 'Toys',
}

/**
 * Color and size sorting use drawn shapes rather than illustrations. A red ball
 * and a blue ball would be two more generated images each; a circle we can draw
 * costs nothing and makes the attribute being sorted unmistakable.
 */
function buildTasks(cfg: SortBinConfig): SortTask[] {
  const rounds = 4

  if (cfg.kind === 'color') {
    return Array.from({ length: rounds }, (_, r) => {
      const chosen = sample(COLORS, 2)
      return {
        question: 'Put each one in its color box.',
        promptClip: clips.ui('sort-color'),
        bins: chosen.map((c) => ({ id: c.id, label: c.label })),
        pieces: shuffle(
          Array.from({ length: 6 }, (_, i) => {
            const c = chosen[i % 2]
            return { kind: 'shape' as const, id: `p${r}-${i}`, color: c.hex, scale: 1, bin: c.id }
          }),
        ),
      }
    })
  }

  if (cfg.kind === 'size') {
    const color = pick(COLORS)
    return Array.from({ length: rounds }, (_, r) => ({
      question: 'Put the big ones and the little ones in their boxes.',
      promptClip: clips.ui('sort-size'),
      bins: [
        { id: 'big', label: 'Big' },
        { id: 'small', label: 'Little' },
      ],
      pieces: shuffle(
        Array.from({ length: 6 }, (_, i) => {
          const big = i % 2 === 0
          return {
            kind: 'shape' as const,
            id: `p${r}-${i}`,
            color: color.hex,
            scale: big ? 1 : 0.45,
            bin: big ? 'big' : 'small',
          }
        }),
      ),
    }))
  }

  const categories = Object.keys(CATEGORY_LABEL) as Category[]
  return Array.from({ length: rounds }, () => {
    const chosen = sample(categories, 2)
    const pieces = chosen.flatMap((cat) =>
      sample(
        pictureWords.filter((w) => w.category === cat),
        3,
      ).map((w) => ({ kind: 'image' as const, id: w.id, src: `words/${w.id}`, alt: w.word, bin: cat })),
    )
    return {
      question: 'Put each one where it belongs.',
      promptClip: clips.ui('sort-kind'),
      bins: chosen.map((c) => ({ id: c, label: CATEGORY_LABEL[c] ?? c })),
      pieces: shuffle(pieces),
    }
  })
}

/**
 * Tap a thing, then tap a box. Deliberately not drag-and-drop: tapping is far
 * more forgiving of small hands on a tablet, and it can't be started by accident
 * while scrolling.
 */
export function SortBin({ goal, level, onComplete, onExit }: EngineProps) {
  const cfg = level.config as SortBinConfig
  const tasks = useMemo(() => buildTasks(cfg), [cfg])
  const { index, total, status, triesLeft, answer } = useRound({ total: tasks.length, onComplete })
  const task = tasks[index]

  const [placed, setPlaced] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)

  const speakPrompt = useCallback(() => {
    void play(task.promptClip)
  }, [task])

  useEffect(() => {
    setPlaced({})
    setSelected(null)
    speakPrompt()
  }, [index, speakPrompt])

  const dropInto = (binId: string) => {
    if (status !== 'asking' || !selected) return
    const piece = task.pieces.find((p) => p.id === selected)
    if (!piece) return
    setSelected(null)

    if (piece.bin === binId) {
      const next = { ...placed, [piece.id]: binId }
      setPlaced(next)
      if (Object.keys(next).length === task.pieces.length) {
        answer(true)
        void play(clips.ui('yes'))
      } else {
        void play(clips.ui('nice'))
      }
      return
    }

    const result = answer(false)
    if (result === 'revealed') {
      setPlaced(Object.fromEntries(task.pieces.map((p) => [p.id, p.bin])))
      void play(clips.ui('here-it-is'))
    } else {
      void play(clips.ui('try-again'))
    }
  }

  const renderPiece = (piece: Piece) =>
    piece.kind === 'image' ? (
      <Img src={piece.src} alt={piece.alt} fallback={piece.alt} />
    ) : (
      <span
        className="sort-shape"
        style={{ background: piece.color, transform: `scale(${piece.scale})` }}
        aria-hidden="true"
      />
    )

  const loose = task.pieces.filter((p) => !(p.id in placed))

  return (
    <RoundShell
      area={goal.area}
      title={goal.shortTitle}
      index={index}
      total={total}
      triesLeft={triesLeft}
      prompt={task.question}
      pose={status === 'correct' ? 'cheer' : 'think'}
      onReplay={speakPrompt}
      onExit={onExit}
    >
      <div className="sort-tray">
        {loose.map((piece) => (
          <button
            key={piece.id}
            type="button"
            className={`sort-piece ${selected === piece.id ? 'sort-piece-selected' : ''}`}
            onClick={() => setSelected(piece.id)}
            disabled={status !== 'asking'}
          >
            {renderPiece(piece)}
          </button>
        ))}
      </div>

      <div className="sort-bins">
        {task.bins.map((bin) => (
          <button
            key={bin.id}
            type="button"
            className={`sort-bin ${selected ? 'sort-bin-ready' : ''}`}
            onClick={() => dropInto(bin.id)}
            disabled={status !== 'asking' || !selected}
          >
            <span className="sort-bin-label">{bin.label}</span>
            <span className="sort-bin-contents">
              {task.pieces
                .filter((p) => placed[p.id] === bin.id)
                .map((p) => (
                  <span key={p.id} className="sort-bin-item">
                    {renderPiece(p)}
                  </span>
                ))}
            </span>
          </button>
        ))}
      </div>
    </RoundShell>
  )
}
