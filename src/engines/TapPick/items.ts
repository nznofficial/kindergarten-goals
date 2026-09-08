import { clips } from '../../audio/manager'
import type { TapPickConfig } from '../../data/goals'
import { alphabet } from '../../data/letters'
import { byId, cvcWords, pictureWords, rhymeFamilies, counterIds } from '../../data/objects'
import { distractors, pick, randomInt, sample, shuffle } from '../../lib/random'
import { ROUND_LENGTH } from '../../components/useRound'

/** What a prompt or a choice looks like on screen. */
export type Visual =
  | { type: 'glyph'; text: string }
  | { type: 'word'; text: string }
  | { type: 'image'; src: string; alt: string }
  | { type: 'group'; count: number; itemId: string }
  | { type: 'equation'; a: number; b: number; op: '+' | '-'; itemId: string | null }

export interface Choice {
  id: string
  visual: Visual
  /** Played when this choice is tapped correctly or revealed. */
  clip?: string
}

export interface TapItem {
  id: string
  /** Spoken prompt, in order. */
  promptClips: string[]
  /** Written mirror of the spoken prompt, for the grown-up in the room. */
  promptText: string
  promptVisual?: Visual
  choices: Choice[]
  answerId: string
}

const letterChoice = (letter: string, upper: boolean): Choice => ({
  id: letter,
  visual: { type: 'glyph', text: upper ? letter.toUpperCase() : letter.toLowerCase() },
  clip: clips.letterName(letter),
})

const numberChoice = (n: number): Choice => ({
  id: String(n),
  visual: { type: 'glyph', text: String(n) },
  clip: clips.number(n),
})

const pictureChoice = (id: string): Choice => {
  const w = byId.get(id)
  return {
    id,
    visual: { type: 'image', src: `words/${id}`, alt: w?.word ?? id },
    clip: clips.word(id),
  }
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i)
}

// ---------------------------------------------------------------------------

function letterItems(cfg: TapPickConfig, sound: boolean): TapItem[] {
  const pool = (cfg.letters ?? alphabet).map((l) => l.toLowerCase())
  const upper = cfg.letterCase === 'upper'
  return sample(pool, ROUND_LENGTH).map((letter, i) => {
    const wrong = distractors(pool, letter, cfg.choices - 1, (l) => l)
    return {
      id: `${letter}-${i}`,
      promptClips: [clips.ui(sound ? 'which-sound' : 'find-letter'), sound ? clips.letterSound(letter) : clips.letterName(letter)],
      promptText: sound ? 'Which letter makes this sound?' : `Find the letter ${upper ? letter.toUpperCase() : letter}`,
      choices: shuffle([letter, ...wrong]).map((l) => letterChoice(l, upper)),
      answerId: letter,
    }
  })
}

function positionSoundItems(cfg: TapPickConfig, position: 'initial' | 'final'): TapItem[] {
  const pool = pictureWords.filter((w) => w[position] !== null)
  return sample(pool, ROUND_LENGTH).map((word, i) => {
    const answer = word[position] as string
    const wrong = distractors(alphabet, answer, cfg.choices - 1, (l) => l)
    return {
      id: `${word.id}-${i}`,
      promptClips: [clips.ui(position === 'initial' ? 'first-sound' : 'last-sound'), clips.word(word.id)],
      promptText: `What is the ${position === 'initial' ? 'first' : 'last'} sound in "${word.word}"?`,
      promptVisual: { type: 'image', src: `words/${word.id}`, alt: word.word },
      choices: shuffle([answer, ...wrong]).map((l) => letterChoice(l, false)),
      answerId: answer,
    }
  })
}

function rhymeItems(cfg: TapPickConfig): TapItem[] {
  const usable = rhymeFamilies.filter((f) => f.members.length >= 2)
  return sample(usable, ROUND_LENGTH).map((family, i) => {
    const [cue, answer] = sample(family.members, 2)
    const others = pictureWords.filter((w) => w.rime !== family.rime)
    const wrong = distractors(others, answer, cfg.choices - 1, (w) => w.id)
    return {
      id: `${family.rime}-${i}`,
      promptClips: [clips.ui('which-rhymes'), clips.word(cue.id)],
      promptText: `Which one rhymes with "${cue.word}"?`,
      promptVisual: { type: 'image', src: `words/${cue.id}`, alt: cue.word },
      choices: shuffle([answer, ...wrong]).map((w) => pictureChoice(w.id)),
      answerId: answer.id,
    }
  })
}

function sightWordItems(cfg: TapPickConfig): TapItem[] {
  const pool = [...(cfg.words ?? [])]
  return sample(pool, ROUND_LENGTH).map((word, i) => {
    const wrong = distractors(pool, word, cfg.choices - 1, (w) => w)
    return {
      id: `${word}-${i}`,
      promptClips: [clips.ui('find-word'), clips.sightWord(word)],
      promptText: `Find the word "${word}"`,
      choices: shuffle([word, ...wrong]).map((w) => ({
        id: w,
        visual: { type: 'word', text: w } as Visual,
        clip: clips.sightWord(w),
      })),
      answerId: word,
    }
  })
}

/** Reading direction: the written word is the prompt, pictures are the choices. */
function cvcItems(cfg: TapPickConfig): TapItem[] {
  return sample(cvcWords, ROUND_LENGTH).map((word, i) => {
    const wrong = distractors(cvcWords, word, cfg.choices - 1, (w) => w.id)
    return {
      id: `${word.id}-${i}`,
      promptClips: [clips.ui('read-word')],
      promptText: `Read it: "${word.word}"`,
      promptVisual: { type: 'word', text: word.word },
      choices: shuffle([word, ...wrong]).map((w) => pictureChoice(w.id)),
      answerId: word.id,
    }
  })
}

function numeralItems(cfg: TapPickConfig): TapItem[] {
  const [lo, hi] = cfg.range ?? [0, 20]
  const pool = range(lo, hi)
  return sample(pool, ROUND_LENGTH).map((n, i) => {
    const wrong = distractors(pool, n, cfg.choices - 1, (x) => String(x))
    return {
      id: `${n}-${i}`,
      promptClips: [clips.ui('find-number'), clips.number(n)],
      promptText: `Find the number ${n}`,
      choices: shuffle([n, ...wrong]).map(numberChoice),
      answerId: String(n),
    }
  })
}

function moreLessItems(cfg: TapPickConfig): TapItem[] {
  const [lo, hi] = cfg.range ?? [1, 10]
  return Array.from({ length: ROUND_LENGTH }, (_, i) => {
    const wantMore = i % 2 === 0
    let a = randomInt(lo, hi)
    let b = randomInt(lo, hi)
    // A clear gap keeps this a comparison question, not a counting question.
    while (Math.abs(a - b) < 2) b = randomInt(lo, hi)
    if (a === b) a = b + 2
    const itemId = pick(counterIds)
    const answer = wantMore ? (a > b ? 'a' : 'b') : a < b ? 'a' : 'b'
    return {
      id: `ml-${i}`,
      promptClips: [clips.ui(wantMore ? 'which-more' : 'which-less')],
      promptText: wantMore ? 'Which group has MORE?' : 'Which group has LESS?',
      choices: [
        { id: 'a', visual: { type: 'group', count: a, itemId } },
        { id: 'b', visual: { type: 'group', count: b, itemId } },
      ],
      answerId: answer,
    }
  })
}

function arithmeticItems(cfg: TapPickConfig, op: '+' | '-'): TapItem[] {
  const withPictures = cfg.choices === 3
  return Array.from({ length: ROUND_LENGTH }, (_, i) => {
    let a: number
    let b: number
    if (op === '+') {
      a = randomInt(0, 5)
      b = randomInt(0, 5 - a)
    } else {
      a = randomInt(1, 5)
      b = randomInt(0, a)
    }
    const result = op === '+' ? a + b : a - b
    const wrong = distractors(range(0, 5), result, cfg.choices - 1, (x) => String(x))
    return {
      id: `${op}-${i}`,
      promptClips: [clips.ui(op === '+' ? 'how-many-altogether' : 'how-many-left')],
      promptText: `${a} ${op} ${b} = ?`,
      promptVisual: {
        type: 'equation',
        a,
        b,
        op,
        itemId: withPictures ? pick(counterIds) : null,
      },
      choices: shuffle([result, ...wrong]).map(numberChoice),
      answerId: String(result),
    }
  })
}

/** Builds one round's worth of items for whichever TapPick variant a level asks for. */
export function buildTapItems(cfg: TapPickConfig): TapItem[] {
  switch (cfg.kind) {
    case 'letterName':
      return letterItems(cfg, false)
    case 'letterSound':
      return letterItems(cfg, true)
    case 'firstSound':
      return positionSoundItems(cfg, 'initial')
    case 'lastSound':
      return positionSoundItems(cfg, 'final')
    case 'rhymeMatch':
      return rhymeItems(cfg)
    case 'sightWord':
      return sightWordItems(cfg)
    case 'cvcWord':
      return cvcItems(cfg)
    case 'numeral':
      return numeralItems(cfg)
    case 'moreLess':
      return moreLessItems(cfg)
    case 'addWithin5':
      return arithmeticItems(cfg, '+')
    case 'subWithin5':
      return arithmeticItems(cfg, '-')
  }
}
