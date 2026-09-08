import { useCallback, useState } from 'react'
import { AudioGate } from './components/AudioGate'
import { goalById } from './data/goals'
import { BuildIt } from './engines/BuildIt/BuildIt'
import { CountIt } from './engines/CountIt/CountIt'
import { Sequence } from './engines/Sequence/Sequence'
import { SortBin } from './engines/SortBin/SortBin'
import { TapPick } from './engines/TapPick/TapPick'
import { Trace } from './engines/Trace/Trace'
import type { EngineProps } from './engines/types'
import { LevelScreen } from './screens/LevelScreen'
import { MapScreen } from './screens/MapScreen'
import { ResultScreen } from './screens/ResultScreen'
import { useProgress, type Stars } from './state/progress'
import type { EngineId } from './data/types'

const engines: Record<EngineId, (props: EngineProps) => React.ReactElement> = {
  tapPick: TapPick,
  trace: Trace,
  countIt: CountIt,
  sequence: Sequence,
  sortBin: SortBin,
  buildIt: BuildIt,
}

type Screen =
  | { name: 'gate' }
  | { name: 'map' }
  | { name: 'levels'; goalId: string }
  | { name: 'play'; goalId: string; levelId: string; attempt: number }
  | { name: 'result'; goalId: string; levelId: string; stars: Stars; firstTryCorrect: number; total: number }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'gate' })
  const { recordStars } = useProgress()

  const openGoal = useCallback((goalId: string) => {
    const goal = goalById.get(goalId)
    if (!goal) return
    // Skip the level picker when there is nothing to pick.
    if (goal.levels.length === 1) {
      setScreen({ name: 'play', goalId, levelId: goal.levels[0].id, attempt: 0 })
    } else {
      setScreen({ name: 'levels', goalId })
    }
  }, [])

  if (screen.name === 'gate') {
    return <AudioGate onReady={() => setScreen({ name: 'map' })} />
  }

  if (screen.name === 'map') {
    return <MapScreen onPick={openGoal} />
  }

  const goal = goalById.get(screen.goalId)
  if (!goal) return <MapScreen onPick={openGoal} />

  if (screen.name === 'levels') {
    return (
      <LevelScreen
        goal={goal}
        onPick={(levelId) => setScreen({ name: 'play', goalId: goal.id, levelId, attempt: 0 })}
        onExit={() => setScreen({ name: 'map' })}
      />
    )
  }

  const level = goal.levels.find((l) => l.id === screen.levelId)
  if (!level) return <MapScreen onPick={openGoal} />

  if (screen.name === 'result') {
    return (
      <ResultScreen
        stars={screen.stars}
        firstTryCorrect={screen.firstTryCorrect}
        total={screen.total}
        onAgain={() =>
          setScreen({ name: 'play', goalId: goal.id, levelId: level.id, attempt: Date.now() })
        }
        onMap={() => setScreen({ name: 'map' })}
      />
    )
  }

  const Engine = engines[goal.engine]
  return (
    <Engine
      // Remounting on replay gives every engine a fresh, freshly-shuffled round.
      key={`${goal.id}-${level.id}-${screen.attempt}`}
      goal={goal}
      level={level}
      onComplete={(stars, firstTryCorrect) => {
        recordStars(goal.id, level.id, stars)
        setScreen({
          name: 'result',
          goalId: goal.id,
          levelId: level.id,
          stars,
          firstTryCorrect,
          total: 8,
        })
      }}
      onExit={() => setScreen({ name: 'map' })}
    />
  )
}
