import { useEffect } from 'react'
import type { Stars as StarCount } from '../state/progress'
import { Stars } from '../components/Stars'
import { Mascot } from '../components/Mascot'
import { clips, play } from '../audio/manager'

interface Props {
  stars: StarCount
  firstTryCorrect: number
  total: number
  onAgain: () => void
  onMap: () => void
}

const line: Record<StarCount, string> = {
  0: 'Good try!',
  1: 'Nice work!',
  2: 'Great job!',
  3: 'Perfect!',
}

export function ResultScreen({ stars, firstTryCorrect, total, onAgain, onMap }: Props) {
  useEffect(() => {
    void play(clips.ui(stars === 3 ? 'celebrate-perfect' : 'celebrate'))
  }, [stars])

  return (
    <div className="result">
      <Mascot pose="cheer" size="lg" />
      <h1 className="result-title">{line[stars]}</h1>
      <Stars count={stars} size="lg" animate />
      <p className="result-score">
        {firstTryCorrect} of {total} on the first try
      </p>
      <div className="result-buttons">
        <button type="button" className="big-button" onClick={onAgain}>
          Play again
        </button>
        <button type="button" className="big-button big-button-quiet" onClick={onMap}>
          My goals
        </button>
      </div>
    </div>
  )
}
