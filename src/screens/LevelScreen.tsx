import type { Goal } from '../data/goals'
import { useProgress } from '../state/progress'
import { Img } from '../components/Img'
import { Stars } from '../components/Stars'

interface Props {
  goal: Goal
  onPick: (levelId: string) => void
  onExit: () => void
}

/** Shown between the map and a game when a goal has more than one way in. */
export function LevelScreen({ goal, onPick, onExit }: Props) {
  const { levelStars } = useProgress()

  return (
    <div className={`levels area-${goal.area}`}>
      <header className="round-top">
        <button type="button" className="icon-button" onClick={onExit} aria-label="Back to my goals">
          ←
        </button>
      </header>

      <Img src={`goals/${goal.icon}`} alt="" className="levels-icon" fallback="●" />
      <h1 className="levels-title">{goal.title}</h1>

      <div className="levels-grid">
        {goal.levels.map((level) => (
          <button key={level.id} type="button" className="level-card" onClick={() => onPick(level.id)}>
            <span className="level-label">{level.label}</span>
            <Stars count={levelStars(goal.id, level.id)} />
          </button>
        ))}
      </div>
    </div>
  )
}
