import { child } from '../config/child'
import { goals } from '../data/goals'
import { useProgress } from '../state/progress'
import { Img } from '../components/Img'
import { Stars } from '../components/Stars'
import { Mascot } from '../components/Mascot'

interface Props {
  onPick: (goalId: string) => void
}

const areaLabel = { letters: 'Letters', words: 'Words', numbers: 'Numbers' } as const

/**
 * The home board — the paper goals sheet, one tile per goal, filling up with
 * stars as the child works through it.
 */
export function MapScreen({ onPick }: Props) {
  const { goalStars } = useProgress()

  return (
    <div className="map">
      <header className="map-top">
        <Mascot pose="wave" size="sm" />
        <div>
          <h1 className="map-title">
            My <em>BIG</em> List of Kindergarten Goals!
          </h1>
          <p className="map-sub">{child.firstName}, pick something to play.</p>
        </div>
      </header>

      <div className="map-grid">
        {goals.map((goal) => {
          const stars = goalStars(
            goal.id,
            goal.levels.map((l) => l.id),
          )
          return (
            <button
              key={goal.id}
              type="button"
              className={`tile area-${goal.area} ${stars === 3 ? 'tile-mastered' : ''}`}
              onClick={() => onPick(goal.id)}
            >
              <span className="tile-area">{areaLabel[goal.area]}</span>
              <Img src={`goals/${goal.icon}`} alt="" className="tile-icon" fallback="●" />
              <span className="tile-label">{goal.shortTitle}</span>
              <Stars count={stars} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
