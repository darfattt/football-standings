import { ref, computed } from 'vue'
import type { Match, Standing, TeamDifficulty, FixtureWithDifficulty, TeamFixtures } from '~/types'
import { DifficultyLevel } from '~/types'

export const useFixtureDifficulty = () => {
  const teamDifficulties = ref<Map<string, TeamDifficulty>>(new Map())
  
  /**
   * Calculate team difficulty scores based on form and position
   * @param standings Current standings data
   * @returns Map of team names to difficulty ratings
   */
  const calculateTeamDifficulties = (standings: Standing[]): Map<string, TeamDifficulty> => {
    const result = new Map<string, TeamDifficulty>()
    const totalTeams = standings.length
    console.log('calculateTeamDifficulties', standings);
    if (!totalTeams) return result
    
    // Calculate for each team
    standings.forEach(standing => {
      // Position score: Teams at top of table are harder to play against
      // Scale: 0-10, where 10 is hardest (1st place)
      const positionScore = 10 * (1 - (standing.position - 1) / totalTeams)
      
      // Form score: Calculate based on last 5 games
      // W = 3 points, D = 1 point, L = 0 points (max 15 points)
      // Scale: 0-10, where 10 is the best form
      let formPoints = 0
      const formResults = standing.form || []
      
      formResults.forEach(result => {
        if (result === 'W') formPoints += 3
        else if (result === 'D') formPoints += 1
      })
      
      // Scale to 0-10
      const formScore = (formPoints / 15) * 10
      
      // Home advantage is factored in when generating fixtures with difficulty
      
      // Total difficulty score: Average of position and form scores
      // Scale: 0-10, where 10 is hardest
      const difficultyScore = (positionScore * 0.7) + (formScore * 0.3)
      
      // Assign a difficulty level (1-5) based on the score
      let difficultyLevel: DifficultyLevel
      
      if (difficultyScore >= 8) {
        difficultyLevel = DifficultyLevel.VeryHard // 5
      } else if (difficultyScore >= 6) {
        difficultyLevel = DifficultyLevel.Hard // 4
      } else if (difficultyScore >= 4) {
        difficultyLevel = DifficultyLevel.Medium // 3
      } else if (difficultyScore >= 2) {
        difficultyLevel = DifficultyLevel.Easy // 2
      } else {
        difficultyLevel = DifficultyLevel.VeryEasy // 1
      }
      
      result.set(standing.club, {
        team: standing.club,
        difficultyScore,
        difficultyLevel
      })
    })
    
    return result
  }
  
  /**
   * Get fixture difficulty for upcoming matches
   * @param matches All matches for a competition
   * @param teamDifficulties Map of team difficulties
   * @returns Array of team fixtures with difficulty ratings
   */
  const getFixturesWithDifficulty = (
    matches: Match[],
    teamDifficulties: Map<string, TeamDifficulty>
  ): TeamFixtures[] => {
    const result: TeamFixtures[] = []
    const teamFixturesMap = new Map<string, FixtureWithDifficulty[]>()
    
    // Get current date
    const today = new Date()
    
    // Filter to only future matches or matches without scores
    const futureMatches = matches.filter(match => {
      const matchDate = new Date(match.date)
      return (
        (match.score_home === null && match.score_away === null) ||
        matchDate >= today
      )
    })
    
    // Sort matches by date
    futureMatches.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
    
    // Process each match
    futureMatches.forEach(match => {
      // Get difficulty of home and away teams
      const homeTeamDifficulty = teamDifficulties.get(match.home)
      const awayTeamDifficulty = teamDifficulties.get(match.away)
      
      if (!homeTeamDifficulty || !awayTeamDifficulty) return
      
      // For the home team, the difficulty is the away team's difficulty
      // Apply a home advantage reduction (1 level easier)
      let awayTeamDifficultyLevel = awayTeamDifficulty.difficultyLevel
      // Make it one level easier to play at home (minimum level 1)
      const homeFixtureDifficulty = Math.max(
        DifficultyLevel.VeryEasy,
        awayTeamDifficultyLevel - 1
      ) as DifficultyLevel
      
      // For the away team, the difficulty is the home team's difficulty
      // Apply an away disadvantage increase (1 level harder)
      let homeTeamDifficultyLevel = homeTeamDifficulty.difficultyLevel
      // Make it one level harder to play away (maximum level 5)
      const awayFixtureDifficulty = Math.min(
        DifficultyLevel.VeryHard,
        homeTeamDifficultyLevel + 1
      ) as DifficultyLevel
      
      // Create fixture for home team
      const homeFixture: FixtureWithDifficulty = {
        matchweek: match.matchweek,
        date: match.date,
        opponent: match.away,
        isHome: true,
        difficulty: homeFixtureDifficulty
      }
      
      // Create fixture for away team
      const awayFixture: FixtureWithDifficulty = {
        matchweek: match.matchweek,
        date: match.date,
        opponent: match.home,
        isHome: false,
        difficulty: awayFixtureDifficulty
      }
      
      // Add to mapping
      if (!teamFixturesMap.has(match.home)) {
        teamFixturesMap.set(match.home, [])
      }
      teamFixturesMap.get(match.home)!.push(homeFixture)
      
      if (!teamFixturesMap.has(match.away)) {
        teamFixturesMap.set(match.away, [])
      }
      teamFixturesMap.get(match.away)!.push(awayFixture)
    })
    
    // Convert map to array result
    teamFixturesMap.forEach((fixtures, team) => {
      result.push({
        team,
        fixtures: fixtures.sort((a, b) => a.matchweek - b.matchweek)
      })
    })
    
    // Sort by team name
    return result.sort((a, b) => a.team.localeCompare(b.team))
  }
  
  /**
   * Get CSS class for a difficulty level
   * @param level Difficulty level (1-5)
   * @returns CSS class name
   */
  const getDifficultyClass = (level: DifficultyLevel): string => {
    switch (level) {
      case DifficultyLevel.VeryEasy:
        return 'bg-green-500 text-white' // Dark green
      case DifficultyLevel.Easy:
        return 'bg-green-300 text-gray-800' // Light green
      case DifficultyLevel.Medium:
        return 'bg-gray-300 text-gray-800' // Gray
      case DifficultyLevel.Hard:
        return 'bg-red-300 text-gray-800' // Light red  
      case DifficultyLevel.VeryHard:
        return 'bg-red-600 text-white' // Dark red
      default:
        return 'bg-gray-200'
    }
  }
  
  /**
   * Get label for a difficulty level
   * @param level Difficulty level (1-5)
   * @returns Text label
   */
  const getDifficultyLabel = (level: DifficultyLevel): string => {
    switch (level) {
      case DifficultyLevel.VeryEasy:
        return '1'
      case DifficultyLevel.Easy:
        return '2'
      case DifficultyLevel.Medium:
        return '3'
      case DifficultyLevel.Hard:
        return '4'
      case DifficultyLevel.VeryHard:
        return '5'
      default:
        return '-'
    }
  }
  
  return {
    calculateTeamDifficulties,
    getFixturesWithDifficulty,
    getDifficultyClass,
    getDifficultyLabel
  }
} 