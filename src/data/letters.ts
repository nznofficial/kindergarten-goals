export const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')

/**
 * How each letter's sound is spoken in the generated audio. TTS cannot be trusted
 * to produce a bare phoneme, so every clip uses the classroom pattern
 * "letter ... keyword ... sound" and this keyword is what the clip says.
 * The keyword is also the illustration shown alongside the letter.
 */
export const letterKeyword: Record<string, string> = {
  a: 'apple', b: 'ball', c: 'cat', d: 'dog', e: 'egg', f: 'fish',
  g: 'goat', h: 'hat', i: 'igloo', j: 'jam', k: 'kite', l: 'leaf',
  m: 'moon', n: 'nest', o: 'octopus', p: 'pig', q: 'queen', r: 'rock',
  s: 'sun', t: 'top', u: 'umbrella', v: 'van', w: 'web', x: 'box',
  y: 'yarn', z: 'zipper',
}
