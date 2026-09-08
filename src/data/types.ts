/** The six reusable engines. Every one of the 20 goals is one of these plus data. */
export type EngineId =
  | 'tapPick'
  | 'trace'
  | 'countIt'
  | 'sequence'
  | 'sortBin'
  | 'buildIt'

export type GoalArea = 'letters' | 'words' | 'numbers'

/** One playable round's worth of configuration, produced fresh each time a level starts. */
export interface Goal {
  id: string
  /** Wording taken from the printed goals sheet. */
  title: string
  /** Short label for the tile on the map. */
  shortTitle: string
  area: GoalArea
  engine: EngineId
  /** Sub-levels shown when a goal has more than one way in (e.g. sight word quarters). */
  levels: Level[]
}

export interface Level {
  id: string
  label: string
  /** Engine-specific configuration, narrowed by the parent goal's `engine`. */
  config: unknown
}
