/**
 * Sentences for the write-a-sentence goal, built only from the school's sight
 * word list plus words the child already has a picture for. Each one exercises
 * the three rules printed on the goals sheet: a capital at the start, spaces
 * between words, and punctuation at the end.
 */
export interface Sentence {
  words: string[]
  end: '.' | '?'
}

export const sentences: Sentence[] = [
  { words: ['I', 'see', 'the', 'cat'], end: '.' },
  { words: ['We', 'go', 'to', 'the', 'tree'], end: '.' },
  { words: ['She', 'said', 'no'], end: '.' },
  { words: ['You', 'have', 'my', 'hat'], end: '.' },
  { words: ['They', 'look', 'at', 'the', 'sun'], end: '.' },
  { words: ['He', 'is', 'my', 'friend'], end: '.' },
  { words: ['I', 'want', 'the', 'red', 'bug'], end: '.' },
  { words: ['We', 'look', 'for', 'the', 'pig'], end: '.' },
  { words: ['Do', 'you', 'see', 'the', 'fox'], end: '?' },
  { words: ['She', 'goes', 'to', 'the', 'well'], end: '.' },
  { words: ['I', 'see', 'two', 'ducks'], end: '.' },
  { words: ['Where', 'is', 'my', 'book'], end: '?' },
]
