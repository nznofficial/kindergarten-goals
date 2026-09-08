/**
 * The school's own sight word list, transcribed from the sheet sent home.
 * Grouped by the quarter each set is taught in.
 */
export const sightWordQuarters = [
  {
    id: 'q1',
    label: 'Quarter 1',
    words: ['the', 'I', 'at', 'and', 'a', 'is', 'as', 'said', 'to', 'do', 'of'],
  },
  {
    id: 'q2',
    label: 'Quarter 2',
    words: ['see', 'be', 'me', 'he', 'from', 'look', 'book', 'are', 'was', 'you', 'what', 'have'],
  },
  {
    id: 'q3',
    label: 'Quarter 3',
    words: ['your', 'want', 'no', 'so', 'go', 'goes', 'says', 'she', 'we', 'they', 'their', 'were'],
  },
  {
    id: 'q4',
    label: 'Quarter 4',
    words: [
      'talk', 'walk', 'could', 'would', 'should', 'or', 'for', 'there', 'where',
      'who', 'by', 'my', 'one', 'once', 'two', 'does', 'many', 'any', 'been',
      'into', 'friend', 'because',
    ],
  },
] as const

export const allSightWords = sightWordQuarters.flatMap((q) => q.words as readonly string[])
