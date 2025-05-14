export interface Match {
  id?: number
  competition: string
  date: string
  home: string
  score_home: number | null
  score_away: number | null
  away: string
  matchweek: number
}

export interface Team {
  name: string
  logo?: string
}

export interface Standing {
  position: number
  previousPosition?: number // Previous week's position for trend indicator
  club: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number // Goals For
  ga: number // Goals Against
  gd: number // Goal Difference
  points: number
  form?: string[] // Array of last 5 results: 'W', 'D', 'L'
  next?: string // Next opponent
}

export interface Competition {
  id?: number
  name: string
  teams?: Team[]
  matches?: Match[]
  standings?: Standing[]
}

// FDR (Fixture Difficulty Rating) related types
export enum DifficultyLevel {
  VeryEasy = 1,
  Easy = 2,
  Medium = 3,
  Hard = 4,
  VeryHard = 5
}

export interface TeamDifficulty {
  team: string
  difficultyScore: number
  difficultyLevel: DifficultyLevel
}

export interface FixtureWithDifficulty {
  matchweek: number
  date: string
  opponent: string
  isHome: boolean
  difficulty: DifficultyLevel
}

export interface TeamFixtures {
  team: string
  fixtures: FixtureWithDifficulty[]
} 