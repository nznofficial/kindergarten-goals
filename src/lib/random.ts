export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/**
 * `count` items, without repeats. If the pool is smaller than `count` it is
 * reshuffled and dealt again so a short pool (like the 11 Quarter 1 sight words
 * against an 8-item round) still fills the round without repeating early.
 */
export function sample<T>(items: readonly T[], count: number): T[] {
  const out: T[] = []
  while (out.length < count) {
    for (const item of shuffle(items)) {
      out.push(item)
      if (out.length === count) break
    }
    if (items.length === 0) break
  }
  return out
}

/** `count` distractors drawn from `pool`, never equal to `answer`. */
export function distractors<T>(pool: readonly T[], answer: T, count: number, key: (t: T) => string): T[] {
  const answerKey = key(answer)
  return sample(
    pool.filter((p) => key(p) !== answerKey),
    count,
  )
}

export function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}
