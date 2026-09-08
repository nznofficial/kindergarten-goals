/**
 * The complete inventory of generated assets, derived from the same data files
 * the app reads. Both generator scripts work from this, so adding a word to
 * objects.ts is all it takes for its picture and its voice clip to be queued.
 */
import { child } from '../src/config/child'
import { alphabet, letterKeyword } from '../src/data/letters'
import { pictureWords } from '../src/data/objects'
import { allSightWords } from '../src/data/sightWords'
import { goals } from '../src/data/goals'

export interface ImageAsset {
  /** Path under public/assets/images, without extension. */
  key: string
  prompt: string
  /** Style anchors passed as reference images; the anchor itself has none. */
  isAnchor?: boolean
}

export interface AudioAsset {
  /** Path under public/assets/audio, without extension. */
  key: string
  text: string
  /** Delivery note passed to the TTS model. */
  instructions?: string
}

// ---------------------------------------------------------------------------
// Art direction. Repeated verbatim in every prompt so 150 separate generations
// still look like one book.
// ---------------------------------------------------------------------------

const STYLE = [
  "Children's picture-book illustration for a kindergarten learning game.",
  'Soft rounded shapes with clean confident outlines, warm friendly colors,',
  'flat shading with a little texture, cheerful and gentle, never scary.',
  'Centered subject, generous margins, plain transparent background,',
  'no text, no letters, no numbers, no watermark, no border.',
].join(' ')

const CAST =
  'The cast are friendly cartoon animals: Pip a small orange fox with a cream chest ' +
  'and a bushy white-tipped tail, Hoot a round green-and-brown owl, ' +
  'Bramble a soft brown bear, and Clover a cream-colored rabbit.'

const MASCOT_POSES: Record<string, string> = {
  idle: 'standing, relaxed, smiling warmly at the viewer, front view',
  cheer: 'jumping with both arms up, delighted, eyes closed in a big happy smile',
  think: 'one paw on chin, head tilted, curious and thoughtful',
  wave: 'waving one paw hello, welcoming, bright open smile',
  point: 'pointing forward and down with one paw, encouraging, looking where it points',
}

const HOSTS: Record<string, string> = {
  owl: 'Hoot the round green-and-brown owl, perched and friendly, hosting the letters area',
  rabbit: 'Clover the cream-colored rabbit, sitting up cheerfully, hosting the words area',
  bear: 'Bramble the soft brown bear, sitting and waving, hosting the numbers area',
}

/** A short scene for each goal tile, in the same world as the cast. */
const GOAL_SCENES: Record<string, string> = {
  'write-name': 'Pip the fox holding an oversized pencil over a name tag',
  capitals: 'three big wooden alphabet blocks stacked, blank faces, no letters drawn on them',
  lowercase: 'a handful of small smooth pebbles arranged in a row on grass',
  'letter-sounds': 'Hoot the owl with one wing cupped behind an ear, listening',
  'first-sounds':
    'three round grey pebbles in a row on grass; only the leftmost pebble is bright yellow and glowing with a warm halo',
  'last-sounds':
    'three round grey pebbles in a row on grass; only the rightmost pebble is bright yellow and glowing with a warm halo',
  'recognize-rhymes': 'two matching bells side by side, ringing together with sound waves',
  'produce-rhyme': 'Clover the rabbit singing happily with musical notes floating up',
  'sight-words': 'an open storybook with blank pages, glowing softly',
  'cvc-words': 'three smooth stones in a row on a wooden tray',
  'write-sentence': 'a feather quill resting on a blank ruled notepad',
  'count-by-1': 'a line of ten acorns laid out one after another',
  'count-by-10': 'ten small bundles of ten sticks tied with twine',
  'more-less': 'a wooden balance scale with more apples on one side than the other',
  'count-objects': 'a wicker basket spilling over with round red apples',
  'identify-numbers': 'wooden number tiles face down in a neat grid, blank faces',
  'classify-objects': 'two woven baskets, one holding fruit and one holding leaves',
  'add-within-5': 'two small piles of acorns being pushed together into one pile',
  'subtract-within-5': 'a pile of acorns with a few rolling away to the side',
  'write-numbers': 'Bramble the bear holding a big crayon over a blank sheet of paper',
}

/**
 * Subjects whose plain name generates something ambiguous, wrong, or with text
 * baked into it. Each of these replaced a generation that failed review.
 */
// Deliberately absent from objects.ts, each after a failed generation review:
//   six, ten - came back as numerals or the wrong count, and this app also
//              teaches counting, so a picture labelled "ten" showing twelve
//              acorns is worse than not having the word at all.
//   up       - not a picturable object; generated an owl.
//   fin      - indistinguishable from the existing "fish" illustration.
//   red, hop, run, cut, pop, tip, zip
//            - verbs and adjectives, which an image model has no way to draw.
//              Asked for "a single red" it drew the reference fox; "run" became
//              a rabbit, "cut" a cat, "zip" a duplicate of the zipper. Replaced
//              with shed / stop / ship / chip, which keep the -ed, -op and -ip
//              rhyme families alive and are actually picturable.
const WORD_SUBJECT: Record<string, string> = {
  milk: 'a tall clear drinking glass full of white milk. No carton, no label, absolutely no writing anywhere in the image.',
  ten: 'exactly ten acorns arranged in two neat rows of five. Do not draw a numeral.',
  dot: 'one single round bright red painted dot in the middle of a plain white square of paper.',
  gum: 'a stick of chewing gum, half slid out of its opened paper wrapper. No writing on the wrapper.',
  fin: 'a blue fish seen from the side with one large triangular dorsal fin clearly raised on its back.',
  leg: 'a whole human leg from hip to foot, side view, wearing a short sock.',
  map: 'a folded paper treasure map with a winding dotted trail and a red X. No readable writing.',
  bag: 'a brown paper grocery bag, open at the top, standing upright.',
  tail: 'a fluffy orange fox tail with a white tip, on its own.',
  wig: 'a curly wig on a plain wooden wig stand.',
  ax: 'an axe with a wooden handle and a grey metal head.',
  shed: 'a small wooden garden shed with a pitched roof and one window.',
  stop: 'a red octagonal stop sign on a short post. No writing on the sign.',
  ship: 'a cargo ship on the sea, side view, with a tall funnel.',
  chip: 'a single golden potato chip crisp.',
}

const defaultSubject = (word: string) =>
  `a single ${word}, the most typical and instantly recognizable version a ` +
  `five-year-old would draw. One object only, no scene around it.`

export const anchorKey = 'mascot/idle'

export function imageAssets(): ImageAsset[] {
  const out: ImageAsset[] = []

  out.push({
    key: anchorKey,
    prompt: `${STYLE} ${CAST} Subject: Pip the fox, ${MASCOT_POSES.idle}.`,
    isAnchor: true,
  })

  for (const [pose, desc] of Object.entries(MASCOT_POSES)) {
    if (pose === 'idle') continue
    out.push({ key: `mascot/${pose}`, prompt: `${STYLE} Subject: Pip the fox, ${desc}.` })
  }

  for (const [host, desc] of Object.entries(HOSTS)) {
    out.push({ key: `hosts/${host}`, prompt: `${STYLE} Subject: ${desc}.` })
  }

  for (const goal of goals) {
    const scene = GOAL_SCENES[goal.icon]
    if (!scene) continue
    out.push({
      key: `goals/${goal.icon}`,
      prompt: `${STYLE} A simple icon-like illustration: ${scene}. Single clear subject, readable at thumbnail size.`,
    })
  }

  for (const word of pictureWords) {
    out.push({
      key: `words/${word.id}`,
      prompt: `${STYLE} Subject: ${WORD_SUBJECT[word.id] ?? defaultSubject(word.word)}`,
    })
  }

  return out
}

// ---------------------------------------------------------------------------
// Voice. One narrator throughout: Pip the fox.
// ---------------------------------------------------------------------------

const WARM = 'Warm, gentle and encouraging, like a favorite kindergarten teacher. Unhurried, clear, never babyish.'
const CRISP = 'Very clear and deliberate, slightly slower than normal, so a five-year-old can hear every sound.'

const UI_LINES: Record<string, string> = {
  'find-letter': 'Find this letter.',
  'which-sound': 'Which letter makes this sound?',
  'first-sound': 'What sound does this start with?',
  'last-sound': 'What sound does this end with?',
  'which-rhymes': 'Which one rhymes with this?',
  'find-word': 'Find this word.',
  'read-word': 'Read this word. Which picture is it?',
  'find-number': 'Find this number.',
  'which-more': 'Which group has more?',
  'which-less': 'Which group has less?',
  'how-many-altogether': 'How many altogether?',
  'how-many-left': 'How many are left?',
  'count-them': 'Tap each one to count them.',
  'count-again': 'Not quite. Count them again.',
  'count-by-tens': "Let's count by tens. What is missing?",
  'fill-the-gaps': 'What numbers are missing?',
  'sort-color': 'Put each one in its color box.',
  'sort-size': 'Put the big ones and the little ones where they go.',
  'sort-kind': 'Put each one where it belongs.',
  'make-a-rhyme': 'Make a word that rhymes with this.',
  'build-sentence': 'Build the sentence. Tap the words in order.',
  'trace-it': "Let's trace it. Start at the green dot.",
  'watch-me': 'Watch me do it.',
  'stay-on-the-line': 'Ooh, stay on the line. Try again.',
  yes: 'Yes!',
  nice: 'Nice!',
  'try-again': 'Almost. Try again.',
  'here-it-is': 'Here it is.',
  celebrate: 'Great job!',
  'celebrate-perfect': 'Wow, perfect! You got every single one!',
}

export function audioAssets(): AudioAsset[] {
  const out: AudioAsset[] = []

  for (const [key, text] of Object.entries(UI_LINES)) {
    out.push({ key: `ui/${key}`, text, instructions: WARM })
  }

  for (const letter of alphabet) {
    out.push({ key: `letters/name-${letter}`, text: `${letter.toUpperCase()}.`, instructions: CRISP })
    // TTS will not produce a bare phoneme on request, so every sound clip uses
    // the classroom pattern instead: letter, keyword, then the sound in context.
    out.push({
      key: `letters/sound-${letter}`,
      text: `${letter.toUpperCase()}. ${letterKeyword[letter]}. ${letterKeyword[letter]}.`,
      instructions: `${CRISP} Say the letter name, then the keyword twice, leaning on the very first sound of the keyword.`,
    })
  }

  for (const word of pictureWords) {
    out.push({ key: `words/${word.id}`, text: `${word.word}.`, instructions: CRISP })
  }

  for (const word of allSightWords) {
    out.push({ key: `sight/${word.toLowerCase()}`, text: `${word}.`, instructions: CRISP })
  }

  // 0-100 covers counting objects, the number games and every 100-chart strip.
  for (let n = 0; n <= 101; n++) {
    out.push({ key: `numbers/${n}`, text: `${n}.`, instructions: CRISP })
  }

  out.push({ key: 'name/first', text: `${child.firstName}.`, instructions: CRISP })
  out.push({ key: 'name/last', text: `${child.lastName}.`, instructions: CRISP })
  out.push({
    key: 'name/full',
    text: `${child.firstName} ${child.lastName}.`,
    instructions: CRISP,
  })

  return out
}
