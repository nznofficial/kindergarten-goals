import type { Goal, Level } from '../data/goals'
import type { Stars } from '../state/progress'

export interface EngineProps {
  goal: Goal
  level: Level
  onComplete: (stars: Stars, firstTryCorrect: number) => void
  onExit: () => void
}
