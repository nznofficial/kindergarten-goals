import { child } from '../config/child'
import { sightWordQuarters } from './sightWords'
import type { EngineId, GoalArea } from './types'

// ---------------------------------------------------------------------------
// Engine configs. Each goal below picks one engine and hands it one of these.
// ---------------------------------------------------------------------------

export interface TapPickConfig {
  kind:
    | 'letterName'
    | 'letterSound'
    | 'firstSound'
    | 'lastSound'
    | 'rhymeMatch'
    | 'sightWord'
    | 'cvcWord'
    | 'numeral'
    | 'moreLess'
    | 'addWithin5'
    | 'subWithin5'
  /** Which letterform to show, for the letter games. */
  letterCase?: 'upper' | 'lower'
  /** Restricts the item pool: letters, sight words, or a numeric range. */
  letters?: string[]
  words?: readonly string[]
  range?: [number, number]
  choices: 2 | 3 | 4
}

export interface TraceConfig {
  kind: 'name' | 'numbers' | 'letters'
  /** Each entry is one thing to trace end to end - a whole name, or "17". */
  items: string[]
  /** Items per round; short pools repeat to fill it. */
  perRound: number
}

export interface CountItConfig {
  range: [number, number]
}

export interface SequenceConfig {
  step: 1 | 10
  /** How many numbers are shown in the strip the child completes. */
  windowSize: number
}

export interface SortBinConfig {
  kind: 'category' | 'color' | 'size'
}

export interface BuildItConfig {
  kind: 'rhyme' | 'sentence'
}

export type EngineConfig =
  | TapPickConfig
  | TraceConfig
  | CountItConfig
  | SequenceConfig
  | SortBinConfig
  | BuildItConfig

export interface Level {
  id: string
  label: string
  config: EngineConfig
}

export interface Goal {
  id: string
  /** Wording as printed on the goals sheet. */
  title: string
  /** Two or three words, for the map tile. */
  shortTitle: string
  area: GoalArea
  engine: EngineId
  /** Illustration stem: assets/images/goals/<icon>.webp */
  icon: string
  levels: Level[]
}

const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const lower = 'abcdefghijklmnopqrstuvwxyz'.split('')

const half = <T,>(arr: T[], which: 'first' | 'second') =>
  which === 'first' ? arr.slice(0, 13) : arr.slice(13)

export const goals: Goal[] = [
  {
    id: 'write-name',
    title: 'I can write my first and last name!',
    shortTitle: 'Write my name',
    area: 'letters',
    engine: 'trace',
    icon: 'write-name',
    levels: [
      {
        id: 'first',
        label: child.firstName,
        config: { kind: 'name', items: [child.firstName], perRound: 3 } satisfies TraceConfig,
      },
      {
        id: 'last',
        label: child.lastName,
        config: { kind: 'name', items: [child.lastName], perRound: 3 } satisfies TraceConfig,
      },
      {
        id: 'both',
        label: 'Both names',
        config: { kind: 'name', items: [child.firstName, child.lastName], perRound: 4 } satisfies TraceConfig,
      },
    ],
  },
  {
    id: 'capitals',
    title: 'I know all 26 CAPITAL letters!',
    shortTitle: 'Capital letters',
    area: 'letters',
    engine: 'tapPick',
    icon: 'capitals',
    levels: [
      { id: 'a-m', label: 'A - M', config: { kind: 'letterName', letterCase: 'upper', letters: half(upper, 'first'), choices: 3 } satisfies TapPickConfig },
      { id: 'n-z', label: 'N - Z', config: { kind: 'letterName', letterCase: 'upper', letters: half(upper, 'second'), choices: 3 } satisfies TapPickConfig },
      { id: 'all', label: 'All 26', config: { kind: 'letterName', letterCase: 'upper', letters: upper, choices: 4 } satisfies TapPickConfig },
    ],
  },
  {
    id: 'lowercase',
    title: 'I know all 26 lowercase letters!',
    shortTitle: 'Lowercase letters',
    area: 'letters',
    engine: 'tapPick',
    icon: 'lowercase',
    levels: [
      { id: 'a-m', label: 'a - m', config: { kind: 'letterName', letterCase: 'lower', letters: half(lower, 'first'), choices: 3 } satisfies TapPickConfig },
      { id: 'n-z', label: 'n - z', config: { kind: 'letterName', letterCase: 'lower', letters: half(lower, 'second'), choices: 3 } satisfies TapPickConfig },
      { id: 'all', label: 'All 26', config: { kind: 'letterName', letterCase: 'lower', letters: lower, choices: 4 } satisfies TapPickConfig },
    ],
  },
  {
    id: 'letter-sounds',
    title: 'I know all letter sounds!',
    shortTitle: 'Letter sounds',
    area: 'letters',
    engine: 'tapPick',
    icon: 'letter-sounds',
    levels: [
      { id: 'a-m', label: 'a - m', config: { kind: 'letterSound', letterCase: 'lower', letters: half(lower, 'first'), choices: 3 } satisfies TapPickConfig },
      { id: 'n-z', label: 'n - z', config: { kind: 'letterSound', letterCase: 'lower', letters: half(lower, 'second'), choices: 3 } satisfies TapPickConfig },
      { id: 'all', label: 'All 26', config: { kind: 'letterSound', letterCase: 'lower', letters: lower, choices: 4 } satisfies TapPickConfig },
    ],
  },
  {
    id: 'first-sounds',
    title: 'I identify the first sounds!',
    shortTitle: 'First sounds',
    area: 'letters',
    engine: 'tapPick',
    icon: 'first-sounds',
    levels: [
      { id: 'play', label: 'Play', config: { kind: 'firstSound', choices: 3 } satisfies TapPickConfig },
      { id: 'hard', label: 'Challenge', config: { kind: 'firstSound', choices: 4 } satisfies TapPickConfig },
    ],
  },
  {
    id: 'last-sounds',
    title: 'I identify the last sounds!',
    shortTitle: 'Last sounds',
    area: 'letters',
    engine: 'tapPick',
    icon: 'last-sounds',
    levels: [
      { id: 'play', label: 'Play', config: { kind: 'lastSound', choices: 3 } satisfies TapPickConfig },
      { id: 'hard', label: 'Challenge', config: { kind: 'lastSound', choices: 4 } satisfies TapPickConfig },
    ],
  },
  {
    id: 'recognize-rhymes',
    title: 'I recognize rhymes!',
    shortTitle: 'Recognize rhymes',
    area: 'words',
    engine: 'tapPick',
    icon: 'recognize-rhymes',
    levels: [
      { id: 'play', label: 'Play', config: { kind: 'rhymeMatch', choices: 3 } satisfies TapPickConfig },
      { id: 'hard', label: 'Challenge', config: { kind: 'rhymeMatch', choices: 4 } satisfies TapPickConfig },
    ],
  },
  {
    id: 'produce-rhyme',
    title: 'I produce a rhyme!',
    shortTitle: 'Make a rhyme',
    area: 'words',
    engine: 'buildIt',
    icon: 'produce-rhyme',
    levels: [{ id: 'play', label: 'Play', config: { kind: 'rhyme' } satisfies BuildItConfig }],
  },
  {
    id: 'sight-words',
    title: 'I can read all my sight words!',
    shortTitle: 'Sight words',
    area: 'words',
    engine: 'tapPick',
    icon: 'sight-words',
    levels: sightWordQuarters.map((q) => ({
      id: q.id,
      label: q.label,
      config: { kind: 'sightWord', words: q.words, choices: 3 } satisfies TapPickConfig,
    })),
  },
  {
    id: 'cvc-words',
    title: 'I can read CVC words!',
    shortTitle: 'CVC words',
    area: 'words',
    engine: 'tapPick',
    icon: 'cvc-words',
    levels: [
      { id: 'play', label: 'Play', config: { kind: 'cvcWord', choices: 3 } satisfies TapPickConfig },
      { id: 'hard', label: 'Challenge', config: { kind: 'cvcWord', choices: 4 } satisfies TapPickConfig },
    ],
  },
  {
    id: 'write-sentence',
    title: 'I can write a sentence!',
    shortTitle: 'Write a sentence',
    area: 'words',
    engine: 'buildIt',
    icon: 'write-sentence',
    levels: [{ id: 'play', label: 'Play', config: { kind: 'sentence' } satisfies BuildItConfig }],
  },
  {
    id: 'count-100-by-1',
    title: 'I can count to 100 by 1s!',
    shortTitle: 'Count by 1s',
    area: 'numbers',
    engine: 'sequence',
    icon: 'count-by-1',
    levels: [
      { id: 'to-20', label: 'To 20', config: { step: 1, windowSize: 10 } satisfies SequenceConfig },
      { id: 'to-100', label: 'To 100', config: { step: 1, windowSize: 10 } satisfies SequenceConfig },
    ],
  },
  {
    id: 'count-100-by-10',
    title: 'I can count to 100 by 10s!',
    shortTitle: 'Count by 10s',
    area: 'numbers',
    engine: 'sequence',
    icon: 'count-by-10',
    levels: [{ id: 'play', label: 'Play', config: { step: 10, windowSize: 10 } satisfies SequenceConfig }],
  },
  {
    id: 'more-less',
    title: 'I can tell which group has more and which has less!',
    shortTitle: 'More and less',
    area: 'numbers',
    engine: 'tapPick',
    icon: 'more-less',
    levels: [
      { id: 'play', label: 'Play', config: { kind: 'moreLess', range: [1, 10], choices: 2 } satisfies TapPickConfig },
      { id: 'hard', label: 'Challenge', config: { kind: 'moreLess', range: [1, 20], choices: 2 } satisfies TapPickConfig },
    ],
  },
  {
    id: 'count-objects',
    title: 'I can count any number of objects 1-20!',
    shortTitle: 'Count objects',
    area: 'numbers',
    engine: 'countIt',
    icon: 'count-objects',
    levels: [
      { id: '1-10', label: '1 - 10', config: { range: [1, 10] } satisfies CountItConfig },
      { id: '11-20', label: '11 - 20', config: { range: [11, 20] } satisfies CountItConfig },
    ],
  },
  {
    id: 'identify-numbers',
    title: 'I identify numbers 0-20!',
    shortTitle: 'Find the number',
    area: 'numbers',
    engine: 'tapPick',
    icon: 'identify-numbers',
    levels: [
      { id: '0-10', label: '0 - 10', config: { kind: 'numeral', range: [0, 10], choices: 3 } satisfies TapPickConfig },
      { id: '11-20', label: '11 - 20', config: { kind: 'numeral', range: [11, 20], choices: 3 } satisfies TapPickConfig },
      { id: '0-20', label: '0 - 20', config: { kind: 'numeral', range: [0, 20], choices: 4 } satisfies TapPickConfig },
    ],
  },
  {
    id: 'classify-objects',
    title: 'I compare and classify objects!',
    shortTitle: 'Sort objects',
    area: 'numbers',
    engine: 'sortBin',
    icon: 'classify-objects',
    levels: [
      { id: 'color', label: 'By color', config: { kind: 'color' } satisfies SortBinConfig },
      { id: 'size', label: 'By size', config: { kind: 'size' } satisfies SortBinConfig },
      { id: 'category', label: 'By kind', config: { kind: 'category' } satisfies SortBinConfig },
    ],
  },
  {
    id: 'add-within-5',
    title: 'I can fluently add within 5!',
    shortTitle: 'Adding',
    area: 'numbers',
    engine: 'tapPick',
    icon: 'add-within-5',
    levels: [
      { id: 'pictures', label: 'With pictures', config: { kind: 'addWithin5', range: [0, 5], choices: 3 } satisfies TapPickConfig },
      { id: 'numbers', label: 'Numbers only', config: { kind: 'addWithin5', range: [0, 5], choices: 4 } satisfies TapPickConfig },
    ],
  },
  {
    id: 'subtract-within-5',
    title: 'I can fluently subtract within 5!',
    shortTitle: 'Subtracting',
    area: 'numbers',
    engine: 'tapPick',
    icon: 'subtract-within-5',
    levels: [
      { id: 'pictures', label: 'With pictures', config: { kind: 'subWithin5', range: [0, 5], choices: 3 } satisfies TapPickConfig },
      { id: 'numbers', label: 'Numbers only', config: { kind: 'subWithin5', range: [0, 5], choices: 4 } satisfies TapPickConfig },
    ],
  },
  {
    id: 'write-numbers',
    title: 'I can write numbers 0-20!',
    shortTitle: 'Write numbers',
    area: 'numbers',
    engine: 'trace',
    icon: 'write-numbers',
    levels: [
      {
        id: '0-9',
        label: '0 - 9',
        config: { kind: 'numbers', items: '0123456789'.split(''), perRound: 8 } satisfies TraceConfig,
      },
      {
        id: '10-20',
        label: '10 - 20',
        config: {
          kind: 'numbers',
          items: Array.from({ length: 11 }, (_, i) => String(i + 10)),
          perRound: 8,
        } satisfies TraceConfig,
      },
    ],
  },
]

export const goalById = new Map(goals.map((g) => [g.id, g]))
