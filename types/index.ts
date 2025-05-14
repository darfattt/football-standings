export interface Match {
  id?: number
  competition: string
  date: string
  home: string
  score_home: number
  score_away: number
  away: string
  matchweek: number
}

export interface Team {
  name: string
  logo?: string
}

export interface Standing {
  position: number
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