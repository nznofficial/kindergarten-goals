/**
 * Star progress, kept in localStorage so it survives closing the tab.
 *
 * Stored per goal AND per level; the map tile shows the best star count across
 * that goal's levels, which is what makes the board feel like the paper sheet.
 */
import { useCallback, useSyncExternalStore } from 'react'

const KEY = 'kg-goals-progress'
const VERSION = 1

export type Stars = 0 | 1 | 2 | 3

interface ProgressData {
  version: number
  /** `${goalId}:${levelId}` -> best stars earned */
  levels: Record<string, Stars>
}

const empty: ProgressData = { version: VERSION, levels: {} }

function read(): ProgressData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty
    const parsed = JSON.parse(raw) as unknown
    // Anything unexpected — an old schema, a truncated write, a hand-edited value —
    // resets to empty rather than white-screening a five-year-old's game.
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      (parsed as ProgressData).version !== VERSION ||
      typeof (parsed as ProgressData).levels !== 'object'
    ) {
      return empty
    }
    return parsed as ProgressData
  } catch {
    return empty
  }
}

let cached: ProgressData = read()
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function write(next: ProgressData) {
  cached = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Private mode or a full quota: keep playing with in-memory progress only.
  }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function snapshot() {
  return cached
}

export function useProgress() {
  const data = useSyncExternalStore(subscribe, snapshot, snapshot)

  const recordStars = useCallback((goalId: string, levelId: string, stars: Stars) => {
    const key = `${goalId}:${levelId}`
    const best = cached.levels[key] ?? 0
    if (stars <= best) return
    write({ ...cached, levels: { ...cached.levels, [key]: stars } })
  }, [])

  const levelStars = useCallback(
    (goalId: string, levelId: string): Stars => data.levels[`${goalId}:${levelId}`] ?? 0,
    [data],
  )

  const goalStars = useCallback(
    (goalId: string, levelIds: string[]): Stars => {
      let best: Stars = 0
      for (const id of levelIds) {
        const s = data.levels[`${goalId}:${id}`] ?? 0
        if (s > best) best = s
      }
      return best
    },
    [data],
  )

  const reset = useCallback(() => write({ version: VERSION, levels: {} }), [])

  return { levelStars, goalStars, recordStars, reset }
}

/** Stars for a round: 3 for a clean run, 2 for mostly first-try, 1 for finishing. */
export function starsFor(firstTryCorrect: number, total: number): Stars {
  if (total === 0) return 0
  const ratio = firstTryCorrect / total
  if (ratio === 1) return 3
  if (ratio >= 0.75) return 2
  return 1
}
