/**
 * The one file to edit to make this app belong to a specific child.
 * `firstName`/`lastName` drive the name-tracing game and the mascot's greeting,
 * so changing them means re-running `npm run gen:audio` to refresh the spoken name.
 */
export const child = {
  firstName: 'Friend',
  lastName: 'Learner',
} as const

export const childFullName = `${child.firstName} ${child.lastName}`
