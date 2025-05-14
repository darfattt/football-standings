import type { Match, Standing, Competition } from '~/types'
import Papa from 'papaparse'
import { useSupabase } from '~/utils/supabase'
import { ref } from 'vue'
import type { Ref } from 'vue'

export const useMatches = () => {
  const { supabase } = useSupabase()
  const matches: Ref<Match[]> = ref([])
  const competitions: Ref<Competition[]> = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Create a function to use localStorage fallback if Supabase fails
  const useLocalStorageFallback = {
    getMatches: (): Match[] => {
      try {
        if (typeof window === 'undefined') return []
        const storedMatches = localStorage.getItem('football-standings-matches')
        return storedMatches ? JSON.parse(storedMatches) : []
      } catch (err) {
        console.error('Error getting matches from localStorage:', err)
        return []
      }
    },
    
    saveMatches: (matchesData: Match[]): void => {
      try {
        if (typeof window === 'undefined') return
        localStorage.setItem('football-standings-matches', JSON.stringify(matchesData))
      } catch (err) {
        console.error('Error saving matches to localStorage:', err)
      }
    },
    
    addMatch: (match: Match): Match | null => {
      try {
        if (typeof window === 'undefined') return null
        const matches = useLocalStorageFallback.getMatches()
        const newMatch = {
          ...match,
          id: Date.now() // Use timestamp as ID
        }
        matches.push(newMatch)
        useLocalStorageFallback.saveMatches(matches)
        return newMatch
      } catch (err) {
        console.error('Error adding match to localStorage:', err)
        return null
      }
    }
  }

  // Fetch all matches
  const fetchMatches = async () => {
    loading.value = true
    error.value = null
    
    try {
      console.log('Fetching matches from Supabase...')
      const { data, error: err } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (err) {
        console.error('Supabase error when fetching matches:', err)
        
        // Fallback to localStorage if Supabase fails
        console.log('Falling back to localStorage for matches')
        const localMatches = useLocalStorageFallback.getMatches()
        console.log('LocalStorage matches:', localMatches.length)
        matches.value = localMatches
        return localMatches
      }
      
      console.log('Matches fetched successfully:', data?.length || 0)
      console.log('First match:', data && data.length > 0 ? data[0] : 'No matches')
      
      matches.value = data || []
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch matches'
      console.error('Error fetching matches:', err)
      
      // Fallback to localStorage
      console.log('Falling back to localStorage due to error')
      const localMatches = useLocalStorageFallback.getMatches()
      matches.value = localMatches
      return localMatches
    } finally {
      loading.value = false
    }
  }
  
  // Fetch matches by competition
  const fetchMatchesByCompetition = async (competition: string) => {
    if (!competition) {
      console.warn('No competition provided for fetching matches')
      return []
    }
    
    loading.value = true
    error.value = null
    
    try {
      const { data, error: err } = await supabase
        .from('matches')
        .select('*')
        .eq('competition', competition)
        .order('date', { ascending: false })
      
      if (err) throw err
      
      matches.value = data || []
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch matches by competition'
      console.error('Error fetching matches by competition:', err)
      matches.value = []
      return []
    } finally {
      loading.value = false
    }
  }
  
  // Fetch all competitions
  const fetchCompetitions = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: err } = await supabase
        .from('competitions')
        .select('*')
      
      if (err) throw err
      
      competitions.value = data || []
    } catch (err: any) {
      error.value = err.message
      console.error('Error fetching competitions:', err)
    } finally {
      loading.value = false
    }
  }
  
  // Create a new match
  const createMatch = async (match: Match) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('Creating new match:', match)
      const { data, error: err } = await supabase
        .from('matches')
        .insert([match])
        .select()
      
      if (err) {
        console.error('Supabase error when creating match:', err)
        
        // Fallback to localStorage
        console.log('Falling back to localStorage for match creation')
        const localMatch = useLocalStorageFallback.addMatch(match)
        
        // Refresh matches from localStorage
        const localMatches = useLocalStorageFallback.getMatches()
        matches.value = localMatches
        
        return localMatch
      }
      
      console.log('Match created successfully:', data?.[0] || 'No data returned')
      
      // Refresh matches
      console.log('Refreshing matches after creating new match')
      await fetchMatches()
      return data?.[0]
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating match:', err)
      
      // Fallback to localStorage
      console.log('Falling back to localStorage due to error')
      const localMatch = useLocalStorageFallback.addMatch(match)
      
      // Refresh matches from localStorage
      const localMatches = useLocalStorageFallback.getMatches()
      matches.value = localMatches
      
      return localMatch
    } finally {
      loading.value = false
    }
  }
  
  // Import matches from CSV
  const importMatchesFromCSV = async (file: File) => {
    loading.value = true
    error.value = null
    
    return new Promise<Match[]>((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            // Process each row and convert to Match object
            const importedMatches = results.data
              .filter((row: any) => 
                row.competition && 
                row.home && 
                row.away && 
                !isNaN(Number(row.score_home)) && 
                !isNaN(Number(row.score_away)) && 
                !isNaN(Number(row.matchweek))
              )
              .map((row: any) => ({
                competition: row.competition,
                date: row.date,
                home: row.home,
                away: row.away,
                score_home: Number(row.score_home),
                score_away: Number(row.score_away),
                matchweek: Number(row.matchweek)
              }))
            
            if (importedMatches.length > 0) {
              // Insert matches into Supabase
              const { data, error: err } = await supabase
                .from('matches')
                .insert(importedMatches)
                .select()
              
              if (err) throw err
              
              // Refresh matches
              await fetchMatches()
              resolve(data || [])
            } else {
              throw new Error('No valid matches found in the CSV file')
            }
          } catch (err: any) {
            error.value = err.message
            console.error('Error importing matches:', err)
            reject(err)
          } finally {
            loading.value = false
          }
        },
        error: (err) => {
          error.value = err.message
          console.error('Error parsing CSV:', err)
          loading.value = false
          reject(err)
        }
      })
    })
  }
  
  // Calculate standings for a competition
  const calculateStandings = (competitionName: string): Standing[] => {
    console.log('calculateStandings called with:', competitionName)
    
    if (!competitionName || !matches.value || !Array.isArray(matches.value)) {
      console.warn('Invalid competition name or matches data for calculating standings')
      return []
    }
    
    console.log('Competition:', competitionName)
    console.log('Matches array length:', matches.value.length)
    
    // Filter matches by competition
    const competitionMatches = matches.value.filter(match => 
      match && match.competition === competitionName
    )
    
    console.log('Filtered matches for competition:', competitionMatches.length)
    
    if (competitionMatches.length === 0) {
      console.warn('No matches found for competition:', competitionName)
      return []
    }
    
    try {
      // Initialize map to store team stats
      const teamStats = new Map<string, {
        played: number,
        won: number,
        drawn: number,
        lost: number,
        gf: number,
        ga: number,
        gd: number,
        points: number,
        form: string[]
      }>()
      
      // Process each match to update team stats
      competitionMatches.forEach(match => {
        if (!match || !match.home || !match.away) {
          console.warn('Skipping invalid match:', match)
          return
        }
        
        console.log(`Processing match: ${match.home} ${match.score_home} - ${match.score_away} ${match.away}`)
        
        // Initialize team stats if not exists
        if (!teamStats.has(match.home)) {
          teamStats.set(match.home, {
            played: 0, won: 0, drawn: 0, lost: 0,
            gf: 0, ga: 0, gd: 0, points: 0, form: []
          })
        }
        
        if (!teamStats.has(match.away)) {
          teamStats.set(match.away, {
            played: 0, won: 0, drawn: 0, lost: 0,
            gf: 0, ga: 0, gd: 0, points: 0, form: []
          })
        }
        
        // Get team stats - clone to avoid reference issues
        const homeStats = {...teamStats.get(match.home)!}
        const awayStats = {...teamStats.get(match.away)!}
        
        // Update matches played
        homeStats.played++
        awayStats.played++
        
        // Update goals - ensure values are numbers
        const scoreHome = Number(match.score_home) || 0
        const scoreAway = Number(match.score_away) || 0
        
        homeStats.gf += scoreHome
        homeStats.ga += scoreAway
        awayStats.gf += scoreAway
        awayStats.ga += scoreHome
        
        // Calculate goal difference
        homeStats.gd = homeStats.gf - homeStats.ga
        awayStats.gd = awayStats.gf - awayStats.ga
        
        // Update results based on score
        if (scoreHome > scoreAway) {
          // Home win
          homeStats.won++
          homeStats.points += 3
          homeStats.form = [...(homeStats.form || []), 'W'].slice(-5)
          
          awayStats.lost++
          awayStats.form = [...(awayStats.form || []), 'L'].slice(-5)
        } else if (scoreHome < scoreAway) {
          // Away win
          awayStats.won++
          awayStats.points += 3
          awayStats.form = [...(awayStats.form || []), 'W'].slice(-5)
          
          homeStats.lost++
          homeStats.form = [...(homeStats.form || []), 'L'].slice(-5)
        } else {
          // Draw
          homeStats.drawn++
          homeStats.points += 1
          homeStats.form = [...(homeStats.form || []), 'D'].slice(-5)
          
          awayStats.drawn++
          awayStats.points += 1
          awayStats.form = [...(awayStats.form || []), 'D'].slice(-5)
        }
        
        // Update team stats in the map
        teamStats.set(match.home, homeStats)
        teamStats.set(match.away, awayStats)
      })
      
      console.log('Team stats calculated:', teamStats.size, 'teams')
      
      // Convert map to array and sort by points, goal difference, goals for
      const standings: Standing[] = []
      teamStats.forEach((stats, team) => {
        standings.push({
          position: 0, // Will be set after sorting
          club: team,
          played: stats.played,
          won: stats.won,
          drawn: stats.drawn,
          lost: stats.lost,
          gf: stats.gf,
          ga: stats.ga,
          gd: stats.gd,
          points: stats.points,
          form: stats.form
        })
      })
      
      // Sort standings
      standings.sort((a, b) => {
        // Sort by points (descending)
        if (a.points !== b.points) {
          return b.points - a.points
        }
        
        // If points are equal, sort by goal difference
        if (a.gd !== b.gd) {
          return b.gd - a.gd
        }
        
        // If goal difference is equal, sort by goals for
        if (a.gf !== b.gf) {
          return b.gf - a.gf
        }
        
        // If everything is equal, sort alphabetically
        return a.club.localeCompare(b.club)
      })
      
      // Set positions
      standings.forEach((standing, index) => {
        standing.position = index + 1
      })
      
      console.log('Final standings calculated:', standings.length, 'teams')
      return standings
    } catch (err) {
      console.error('Error calculating standings:', err)
      return []
    }
  }
  
  return {
    matches,
    competitions,
    loading,
    error,
    fetchMatches,
    fetchMatchesByCompetition,
    fetchCompetitions,
    createMatch,
    importMatchesFromCSV,
    calculateStandings
  }
} 