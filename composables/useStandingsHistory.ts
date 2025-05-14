import { ref, computed } from 'vue'
import type { Match, Standing } from '~/types'
import { useMatches } from './useMatches'

export const useStandingsHistory = () => {
  const { calculateStandings } = useMatches()
  
  /**
   * Calculates the standings for each matchweek in a competition
   * @param competitionName Name of the competition
   * @param matches Array of all matches
   * @param maxMatchweek Maximum matchweek to calculate standings for
   * @returns Map of matchweek -> standings array
   */
  const calculateStandingsHistory = (
    competitionName: string, 
    matches: any,
    maxMatchweek: number = 40 // Default to a high number to include all matchweeks
  ): Map<number, Standing[]> => {
    if (!competitionName || !matches.value || !Array.isArray(matches.value)) {
      return new Map()
    }
    
    // Filter matches by competition
    const competitionMatches = matches.value.filter((match: Match) => 
      match && match.competition === competitionName
    )
    
    if (competitionMatches.length === 0) {
      return new Map()
    }
    
    // Find the maximum matchweek in the data
    const actualMaxMatchweek = Math.min(
      maxMatchweek,
      Math.max(...competitionMatches.map((match: Match) => match.matchweek || 0))
    )
    
    // Calculate standings for each matchweek
    const standingsHistory = new Map<number, Standing[]>()
    
    // Get all teams in the competition
    const allTeams = new Set<string>()
    competitionMatches.forEach((match: Match) => {
      if (match.home) allTeams.add(match.home)
      if (match.away) allTeams.add(match.away)
    })
    
    // Start from matchweek 1
    for (let week = 1; week <= actualMaxMatchweek; week++) {
      // Calculate standings up to this matchweek
      const matchesUpToWeek = competitionMatches.filter((match: Match) => 
        match.matchweek <= week && 
        match.score_home !== null && 
        match.score_away !== null
      )
      
      // Only calculate standings if there are matches in this matchweek
      if (matchesUpToWeek.length > 0) {
        // Create a fake Ref to match the expected input
        const matchesRef = { value: matchesUpToWeek }
        const weekStandings = calculateStandings(competitionName, matchesRef)
        
        // Filter out teams with zero games played
        const activeStandings = weekStandings.filter(standing => standing.played > 0)
        
        standingsHistory.set(week, activeStandings)
      }
    }
    
    return standingsHistory
  }
  
  /**
   * Extracts position data for a specific team across all matchweeks
   * @param standingsHistory Map of matchweek -> standings
   * @param teamName Team name to extract positions for
   * @returns Array of positions by matchweek
   */
  const getTeamPositionsByMatchweek = (
    standingsHistory: Map<number, Standing[]>,
    teamName: string
  ): number[] => {
    const positions: number[] = []
    
    // Get all matchweeks in ascending order
    const matchweeks = Array.from(standingsHistory.keys()).sort((a, b) => a - b)
    
    // For each matchweek, find the team's position
    matchweeks.forEach(week => {
      const standings = standingsHistory.get(week) || []
      const teamStanding = standings.find(s => s.club === teamName)
      
      if (teamStanding) {
        positions.push(teamStanding.position)
      } else {
        // If no position found, use the last known position or the maximum value
        const lastPosition = positions.length > 0 ? positions[positions.length - 1] : standings.length + 1
        positions.push(lastPosition)
      }
    })
    
    return positions
  }
  
  /**
   * Gets all team names from the standings history
   * @param standingsHistory Map of matchweek -> standings
   * @returns Array of unique team names
   */
  const getTeamNames = (standingsHistory: Map<number, Standing[]>): string[] => {
    const teams = new Set<string>()
    
    // Collect all team names from all matchweeks
    standingsHistory.forEach(standings => {
      standings.forEach(standing => {
        teams.add(standing.club)
      })
    })
    
    return Array.from(teams).sort()
  }
  
  /**
   * Gets the list of matchweeks from the standings history
   * @param standingsHistory Map of matchweek -> standings
   * @returns Array of matchweeks in ascending order
   */
  const getMatchweeks = (standingsHistory: Map<number, Standing[]>): number[] => {
    return Array.from(standingsHistory.keys()).sort((a, b) => a - b)
  }
  
  return {
    calculateStandingsHistory,
    getTeamPositionsByMatchweek,
    getTeamNames,
    getMatchweeks
  }
} 