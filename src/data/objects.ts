/**
 * The picture vocabulary. One entry per illustration we generate, tagged with
 * everything the phonics games need so a single image set serves the first-sound,
 * last-sound, rhyming, CVC, counting and sorting goals.
 *
 * `initial` / `final` are the LETTERS that make the first and last *sounds*, not
 * simply the first and last characters — they are null where the sound is a vowel
 * or a digraph a kindergartner is not expected to segment.
 */
export type Category = 'animal' | 'food' | 'vehicle' | 'clothing' | 'toy' | 'home' | 'nature'

export interface PictureWord {
  /** Also the asset filename stem: assets/images/words/<id>.webp, assets/audio/words/<id>.mp3 */
  id: string
  word: string
  /** Letter making the first sound, or null if not cleanly segmentable. */
  initial: string | null
  /** Letter making the last sound, or null if it ends in a vowel sound. */
  final: string | null
  /** Rhyme family (the rime), or null if it has no partners in this set. */
  rime: string | null
  category: Category
  /** True for consonant-vowel-consonant words safe for decoding practice. */
  cvc: boolean
}

export const pictureWords: PictureWord[] = [
  // -- a --
  { id: 'apple', word: 'apple', initial: 'a', final: null, rime: null, category: 'food', cvc: false },
  { id: 'ant', word: 'ant', initial: 'a', final: 't', rime: null, category: 'animal', cvc: false },
  { id: 'ax', word: 'ax', initial: 'a', final: 'x', rime: 'ax', category: 'home', cvc: false },
  // -- b --
  { id: 'ball', word: 'ball', initial: 'b', final: 'l', rime: 'all', category: 'toy', cvc: false },
  { id: 'bat', word: 'bat', initial: 'b', final: 't', rime: 'at', category: 'toy', cvc: true },
  { id: 'bed', word: 'bed', initial: 'b', final: 'd', rime: 'ed', category: 'home', cvc: true },
  { id: 'bee', word: 'bee', initial: 'b', final: null, rime: 'ee', category: 'animal', cvc: false },
  { id: 'bell', word: 'bell', initial: 'b', final: 'l', rime: 'ell', category: 'home', cvc: false },
  { id: 'bug', word: 'bug', initial: 'b', final: 'g', rime: 'ug', category: 'animal', cvc: true },
  { id: 'bun', word: 'bun', initial: 'b', final: 'n', rime: 'un', category: 'food', cvc: true },
  { id: 'bag', word: 'bag', initial: 'b', final: 'g', rime: 'ag', category: 'home', cvc: true },
  { id: 'bin', word: 'bin', initial: 'b', final: 'n', rime: 'in', category: 'home', cvc: true },
  { id: 'box', word: 'box', initial: 'b', final: 'x', rime: 'ox', category: 'home', cvc: true },
  { id: 'bus', word: 'bus', initial: 'b', final: 's', rime: 'us', category: 'vehicle', cvc: true },
  // -- c --
  { id: 'cat', word: 'cat', initial: 'c', final: 't', rime: 'at', category: 'animal', cvc: true },
  { id: 'can', word: 'can', initial: 'c', final: 'n', rime: 'an', category: 'home', cvc: true },
  { id: 'cap', word: 'cap', initial: 'c', final: 'p', rime: 'ap', category: 'clothing', cvc: true },
  { id: 'cake', word: 'cake', initial: 'c', final: 'k', rime: 'ake', category: 'food', cvc: false },
  { id: 'car', word: 'car', initial: 'c', final: null, rime: 'ar', category: 'vehicle', cvc: false },
  { id: 'cup', word: 'cup', initial: 'c', final: 'p', rime: 'up', category: 'home', cvc: true },
  { id: 'corn', word: 'corn', initial: 'c', final: 'n', rime: null, category: 'food', cvc: false },
  { id: 'cow', word: 'cow', initial: 'c', final: null, rime: null, category: 'animal', cvc: false },
  { id: 'clock', word: 'clock', initial: 'c', final: 'k', rime: 'ock', category: 'home', cvc: false },
  // -- d --
  { id: 'dog', word: 'dog', initial: 'd', final: 'g', rime: 'og', category: 'animal', cvc: true },
  { id: 'duck', word: 'duck', initial: 'd', final: 'k', rime: 'uck', category: 'animal', cvc: false },
  { id: 'doll', word: 'doll', initial: 'd', final: 'l', rime: null, category: 'toy', cvc: false },
  { id: 'dot', word: 'dot', initial: 'd', final: 't', rime: 'ot', category: 'home', cvc: true },
  { id: 'drum', word: 'drum', initial: 'd', final: 'm', rime: null, category: 'toy', cvc: false },
  // -- e --
  { id: 'egg', word: 'egg', initial: 'e', final: 'g', rime: null, category: 'food', cvc: false },
  { id: 'elephant', word: 'elephant', initial: 'e', final: 't', rime: null, category: 'animal', cvc: false },
  // -- f --
  { id: 'fish', word: 'fish', initial: 'f', final: null, rime: null, category: 'animal', cvc: false },
  { id: 'fan', word: 'fan', initial: 'f', final: 'n', rime: 'an', category: 'home', cvc: true },
  { id: 'fox', word: 'fox', initial: 'f', final: 'x', rime: 'ox', category: 'animal', cvc: true },
  { id: 'fig', word: 'fig', initial: 'f', final: 'g', rime: 'ig', category: 'food', cvc: true },
  { id: 'frog', word: 'frog', initial: 'f', final: 'g', rime: 'og', category: 'animal', cvc: false },
  // -- g --
  { id: 'goat', word: 'goat', initial: 'g', final: 't', rime: null, category: 'animal', cvc: false },
  { id: 'gum', word: 'gum', initial: 'g', final: 'm', rime: 'um', category: 'food', cvc: true },
  { id: 'gate', word: 'gate', initial: 'g', final: 't', rime: null, category: 'home', cvc: false },
  { id: 'gift', word: 'gift', initial: 'g', final: 't', rime: null, category: 'toy', cvc: false },
  // -- h --
  { id: 'hat', word: 'hat', initial: 'h', final: 't', rime: 'at', category: 'clothing', cvc: true },
  { id: 'hen', word: 'hen', initial: 'h', final: 'n', rime: 'en', category: 'animal', cvc: true },
  { id: 'hut', word: 'hut', initial: 'h', final: 't', rime: 'ut', category: 'home', cvc: true },
  { id: 'hand', word: 'hand', initial: 'h', final: 'd', rime: null, category: 'nature', cvc: false },
  { id: 'horse', word: 'horse', initial: 'h', final: null, rime: null, category: 'animal', cvc: false },
  // -- i --
  { id: 'igloo', word: 'igloo', initial: 'i', final: null, rime: null, category: 'home', cvc: false },
  { id: 'ink', word: 'ink', initial: 'i', final: 'k', rime: null, category: 'home', cvc: false },
  // -- j --
  { id: 'jam', word: 'jam', initial: 'j', final: 'm', rime: 'am', category: 'food', cvc: true },
  { id: 'jet', word: 'jet', initial: 'j', final: 't', rime: 'et', category: 'vehicle', cvc: true },
  { id: 'jug', word: 'jug', initial: 'j', final: 'g', rime: 'ug', category: 'home', cvc: true },
  { id: 'jar', word: 'jar', initial: 'j', final: null, rime: 'ar', category: 'home', cvc: false },
  // -- k --
  { id: 'kite', word: 'kite', initial: 'k', final: 't', rime: null, category: 'toy', cvc: false },
  { id: 'key', word: 'key', initial: 'k', final: null, rime: 'ee', category: 'home', cvc: false },
  { id: 'king', word: 'king', initial: 'k', final: null, rime: 'ing', category: 'nature', cvc: false },
  { id: 'kit', word: 'kit', initial: 'k', final: 't', rime: 'it', category: 'home', cvc: true },
  // -- l --
  { id: 'leaf', word: 'leaf', initial: 'l', final: 'f', rime: null, category: 'nature', cvc: false },
  { id: 'log', word: 'log', initial: 'l', final: 'g', rime: 'og', category: 'nature', cvc: true },
  { id: 'lip', word: 'lip', initial: 'l', final: 'p', rime: 'ip', category: 'nature', cvc: true },
  { id: 'lamp', word: 'lamp', initial: 'l', final: 'p', rime: null, category: 'home', cvc: false },
  { id: 'lock', word: 'lock', initial: 'l', final: 'k', rime: 'ock', category: 'home', cvc: false },
  { id: 'leg', word: 'leg', initial: 'l', final: 'g', rime: 'eg', category: 'nature', cvc: true },
  // -- m --
  { id: 'moon', word: 'moon', initial: 'm', final: 'n', rime: null, category: 'nature', cvc: false },
  { id: 'map', word: 'map', initial: 'm', final: 'p', rime: 'ap', category: 'home', cvc: true },
  { id: 'mop', word: 'mop', initial: 'm', final: 'p', rime: 'op', category: 'home', cvc: true },
  { id: 'mug', word: 'mug', initial: 'm', final: 'g', rime: 'ug', category: 'home', cvc: true },
  { id: 'milk', word: 'milk', initial: 'm', final: 'k', rime: null, category: 'food', cvc: false },
  { id: 'mask', word: 'mask', initial: 'm', final: 'k', rime: null, category: 'clothing', cvc: false },
  { id: 'mat', word: 'mat', initial: 'm', final: 't', rime: 'at', category: 'home', cvc: true },
  // -- n --
  { id: 'nest', word: 'nest', initial: 'n', final: 't', rime: null, category: 'nature', cvc: false },
  { id: 'net', word: 'net', initial: 'n', final: 't', rime: 'et', category: 'home', cvc: true },
  { id: 'nut', word: 'nut', initial: 'n', final: 't', rime: 'ut', category: 'food', cvc: true },
  { id: 'nail', word: 'nail', initial: 'n', final: 'l', rime: 'ail', category: 'home', cvc: false },
  { id: 'nose', word: 'nose', initial: 'n', final: null, rime: null, category: 'nature', cvc: false },
  // -- o --
  { id: 'octopus', word: 'octopus', initial: 'o', final: 's', rime: null, category: 'animal', cvc: false },
  { id: 'ox', word: 'ox', initial: 'o', final: 'x', rime: 'ox', category: 'animal', cvc: false },
  { id: 'owl', word: 'owl', initial: 'o', final: 'l', rime: null, category: 'animal', cvc: false },
  // -- p --
  { id: 'pig', word: 'pig', initial: 'p', final: 'g', rime: 'ig', category: 'animal', cvc: true },
  { id: 'pot', word: 'pot', initial: 'p', final: 't', rime: 'ot', category: 'home', cvc: true },
  { id: 'pen', word: 'pen', initial: 'p', final: 'n', rime: 'en', category: 'home', cvc: true },
  { id: 'pan', word: 'pan', initial: 'p', final: 'n', rime: 'an', category: 'home', cvc: true },
  { id: 'pin', word: 'pin', initial: 'p', final: 'n', rime: 'in', category: 'home', cvc: true },
  { id: 'pie', word: 'pie', initial: 'p', final: null, rime: null, category: 'food', cvc: false },
  { id: 'pup', word: 'pup', initial: 'p', final: 'p', rime: 'up', category: 'animal', cvc: true },
  // -- q --
  { id: 'queen', word: 'queen', initial: 'q', final: 'n', rime: null, category: 'nature', cvc: false },
  { id: 'quilt', word: 'quilt', initial: 'q', final: 't', rime: null, category: 'home', cvc: false },
  // -- r --
  { id: 'rock', word: 'rock', initial: 'r', final: 'k', rime: 'ock', category: 'nature', cvc: false },
  { id: 'ring', word: 'ring', initial: 'r', final: null, rime: 'ing', category: 'clothing', cvc: false },
  { id: 'rug', word: 'rug', initial: 'r', final: 'g', rime: 'ug', category: 'home', cvc: true },
  { id: 'rat', word: 'rat', initial: 'r', final: 't', rime: 'at', category: 'animal', cvc: true },
  { id: 'rake', word: 'rake', initial: 'r', final: 'k', rime: 'ake', category: 'home', cvc: false },
  { id: 'robot', word: 'robot', initial: 'r', final: 't', rime: null, category: 'toy', cvc: false },
  { id: 'rag', word: 'rag', initial: 'r', final: 'g', rime: 'ag', category: 'home', cvc: true },
  // -- s --
  { id: 'sun', word: 'sun', initial: 's', final: 'n', rime: 'un', category: 'nature', cvc: true },
  { id: 'sock', word: 'sock', initial: 's', final: 'k', rime: 'ock', category: 'clothing', cvc: false },
  { id: 'seal', word: 'seal', initial: 's', final: 'l', rime: null, category: 'animal', cvc: false },
  { id: 'saw', word: 'saw', initial: 's', final: null, rime: null, category: 'home', cvc: false },
  { id: 'snake', word: 'snake', initial: 's', final: 'k', rime: 'ake', category: 'animal', cvc: false },
  { id: 'star', word: 'star', initial: 's', final: null, rime: 'ar', category: 'nature', cvc: false },
  // -- t --
  { id: 'top', word: 'top', initial: 't', final: 'p', rime: 'op', category: 'toy', cvc: true },
  { id: 'tent', word: 'tent', initial: 't', final: 't', rime: null, category: 'home', cvc: false },
  { id: 'tree', word: 'tree', initial: 't', final: null, rime: 'ee', category: 'nature', cvc: false },
  { id: 'tiger', word: 'tiger', initial: 't', final: null, rime: null, category: 'animal', cvc: false },
  { id: 'truck', word: 'truck', initial: 't', final: 'k', rime: 'uck', category: 'vehicle', cvc: false },
  { id: 'tag', word: 'tag', initial: 't', final: 'g', rime: 'ag', category: 'home', cvc: true },
  { id: 'tail', word: 'tail', initial: 't', final: 'l', rime: 'ail', category: 'animal', cvc: false },
  // -- u --
  { id: 'umbrella', word: 'umbrella', initial: 'u', final: null, rime: null, category: 'home', cvc: false },
  // -- v --
  { id: 'van', word: 'van', initial: 'v', final: 'n', rime: 'an', category: 'vehicle', cvc: true },
  { id: 'vest', word: 'vest', initial: 'v', final: 't', rime: null, category: 'clothing', cvc: false },
  { id: 'vet', word: 'vet', initial: 'v', final: 't', rime: 'et', category: 'nature', cvc: true },
  { id: 'violin', word: 'violin', initial: 'v', final: 'n', rime: null, category: 'toy', cvc: false },
  // -- w --
  { id: 'web', word: 'web', initial: 'w', final: 'b', rime: 'eb', category: 'nature', cvc: true },
  { id: 'wig', word: 'wig', initial: 'w', final: 'g', rime: 'ig', category: 'clothing', cvc: true },
  { id: 'wagon', word: 'wagon', initial: 'w', final: 'n', rime: null, category: 'vehicle', cvc: false },
  { id: 'well', word: 'well', initial: 'w', final: 'l', rime: 'ell', category: 'home', cvc: false },
  { id: 'wall', word: 'wall', initial: 'w', final: 'l', rime: 'all', category: 'home', cvc: false },
  { id: 'watch', word: 'watch', initial: 'w', final: null, rime: null, category: 'clothing', cvc: false },
  { id: 'wing', word: 'wing', initial: 'w', final: null, rime: 'ing', category: 'animal', cvc: false },
  // -- x --
  { id: 'xray', word: 'x-ray', initial: 'x', final: null, rime: null, category: 'home', cvc: false },
  // -- y --
  { id: 'yarn', word: 'yarn', initial: 'y', final: 'n', rime: null, category: 'home', cvc: false },
  { id: 'yoyo', word: 'yo-yo', initial: 'y', final: null, rime: null, category: 'toy', cvc: false },
  { id: 'yak', word: 'yak', initial: 'y', final: 'k', rime: 'ak', category: 'animal', cvc: true },
  // -- z --
  { id: 'zipper', word: 'zipper', initial: 'z', final: null, rime: null, category: 'clothing', cvc: false },
  { id: 'zebra', word: 'zebra', initial: 'z', final: null, rime: null, category: 'animal', cvc: false },
  // -- extra rhyme partners --
  { id: 'shell', word: 'shell', initial: null, final: 'l', rime: 'ell', category: 'nature', cvc: false },
  { id: 'sled', word: 'sled', initial: null, final: 'd', rime: 'ed', category: 'toy', cvc: false },
  { id: 'mail', word: 'mail', initial: 'm', final: 'l', rime: 'ail', category: 'home', cvc: false },
  { id: 'snail', word: 'snail', initial: null, final: 'l', rime: 'ail', category: 'animal', cvc: false },
  { id: 'lake', word: 'lake', initial: 'l', final: 'k', rime: 'ake', category: 'nature', cvc: false },
  { id: 'boat', word: 'boat', initial: 'b', final: 't', rime: null, category: 'vehicle', cvc: false },
  { id: 'jeep', word: 'jeep', initial: 'j', final: 'p', rime: null, category: 'vehicle', cvc: false },
  { id: 'mitten', word: 'mitten', initial: 'm', final: 'n', rime: null, category: 'clothing', cvc: false },
  { id: 'shoe', word: 'shoe', initial: null, final: null, rime: null, category: 'clothing', cvc: false },
  { id: 'bear', word: 'bear', initial: 'b', final: null, rime: null, category: 'animal', cvc: false },
  { id: 'blocks', word: 'blocks', initial: null, final: null, rime: null, category: 'toy', cvc: false },
  { id: 'cookie', word: 'cookie', initial: 'c', final: null, rime: null, category: 'food', cvc: false },
  { id: 'flower', word: 'flower', initial: null, final: null, rime: null, category: 'nature', cvc: false },
  // Nouns standing in for verbs and adjectives that could not be illustrated.
  { id: 'shed', word: 'shed', initial: null, final: 'd', rime: 'ed', category: 'home', cvc: false },
  { id: 'stop', word: 'stop', initial: null, final: 'p', rime: 'op', category: 'home', cvc: false },
  { id: 'ship', word: 'ship', initial: null, final: 'p', rime: 'ip', category: 'vehicle', cvc: false },
  { id: 'chip', word: 'chip', initial: null, final: 'p', rime: 'ip', category: 'food', cvc: false },
]

export const byId = new Map(pictureWords.map((w) => [w.id, w]))

export const cvcWords = pictureWords.filter((w) => w.cvc)

/** Rhyme families with at least three picturable members — enough for a round. */
export const rhymeFamilies = (() => {
  const groups = new Map<string, PictureWord[]>()
  for (const w of pictureWords) {
    if (!w.rime) continue
    const list = groups.get(w.rime) ?? []
    list.push(w)
    groups.set(w.rime, list)
  }
  return [...groups.entries()]
    .filter(([, members]) => members.length >= 3)
    .map(([rime, members]) => ({ rime, members }))
})()

/** Small, repeatable objects that read clearly when shown 1-20 times in a grid. */
export const counterIds = [
  'apple', 'star', 'fish', 'duck', 'ball', 'bug', 'cookie', 'flower', 'bee', 'egg',
] as const
