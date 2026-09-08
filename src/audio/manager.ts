/**
 * Playback for the pre-generated voice clips.
 *
 * iOS Safari refuses to play audio that was not started from inside a user
 * gesture, and the failure is silent — the single most likely way this game
 * ships broken on an iPad. So nothing plays until `unlock()` has been called
 * from a real tap (see AudioGate), and every clip afterwards reuses elements
 * that were primed during that gesture.
 */

const BASE = import.meta.env.BASE_URL

let unlocked = false
let current: HTMLAudioElement | null = null

const cache = new Map<string, HTMLAudioElement>()

/** Resolve a clip id like 'letters/name-a' to a full URL under the Pages base path. */
function urlFor(clip: string): string {
  return `${BASE}assets/audio/${clip}.mp3`
}

function element(clip: string): HTMLAudioElement {
  let el = cache.get(clip)
  if (!el) {
    el = new Audio(urlFor(clip))
    el.preload = 'auto'
    cache.set(clip, el)
  }
  return el
}

/**
 * Must be called synchronously inside a touch/click handler. Plays a silent
 * buffer to satisfy the autoplay policy for the rest of the session.
 */
export async function unlock(): Promise<void> {
  if (unlocked) return
  try {
    const silent = new Audio(
      'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYbCLuBwAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    )
    silent.volume = 0
    await silent.play()
    unlocked = true
  } catch {
    // Some browsers reject the silent primer but still allow real clips later.
    unlocked = true
  }
}

export function isUnlocked(): boolean {
  return unlocked
}

/** Stop whatever is speaking. Called before every new prompt so clips never overlap. */
export function stop(): void {
  if (!current) return
  current.pause()
  current.currentTime = 0
  current = null
}

/**
 * Play one clip. Resolves when it finishes, or immediately if the file is
 * missing — a missing clip must never block a child from continuing.
 */
export function play(clip: string): Promise<void> {
  stop()
  const el = element(clip)
  current = el
  el.currentTime = 0
  return new Promise((resolve) => {
    const done = () => {
      el.removeEventListener('ended', done)
      el.removeEventListener('error', done)
      if (current === el) current = null
      resolve()
    }
    el.addEventListener('ended', done)
    el.addEventListener('error', done)
    el.play().catch(done)
  })
}

/** Play clips back to back, e.g. an instruction followed by the item itself. */
export async function playSequence(clips: string[], gapMs = 180): Promise<void> {
  for (const [i, clip] of clips.entries()) {
    if (i > 0) await new Promise((r) => setTimeout(r, gapMs))
    await play(clip)
  }
}

/** Warm the cache for a round so the first tap is not silent while it downloads. */
export function preload(clips: string[]): void {
  for (const clip of clips) element(clip).load()
}

// --- clip id helpers: the single source of truth for asset filenames ---------
export const clips = {
  letterName: (letter: string) => `letters/name-${letter.toLowerCase()}`,
  letterSound: (letter: string) => `letters/sound-${letter.toLowerCase()}`,
  word: (id: string) => `words/${id}`,
  sightWord: (word: string) => `sight/${word.toLowerCase()}`,
  number: (n: number) => `numbers/${n}`,
  ui: (key: string) => `ui/${key}`,
  goal: (goalId: string) => `instructions/${goalId}`,
  name: (part: 'first' | 'last' | 'full') => `name/${part}`,
} as const
