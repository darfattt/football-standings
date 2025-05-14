<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Football Standings</h1>
      <div v-if="competitions && competitions.length > 0" class="flex items-center space-x-3">
        <label for="competition-select" class="text-sm font-medium text-gray-700">
          Select Competition:
        </label>
        <select 
          id="competition-select" 
          v-model="selectedCompetition"
          class="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
          @change="changeCompetition"
        >
          <option v-for="comp in competitions" :key="comp" :value="comp">
            {{ comp }}
          </option>
        </select>
      </div>
    </div>
    
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>
    
    <div v-else-if="!competitions || competitions.length === 0" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
      <p>No competitions found. Please add matches first.</p>
      <NuxtLink to="/matches" class="inline-block mt-3 text-sm font-medium text-purple-600 hover:text-purple-500">
        Go to Matches
      </NuxtLink>
    </div>
    
    <div v-else>
      <StandingsTable 
        :standings="standings || []" 
        :key="selectedCompetition"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMatches } from '~/composables/useMatches'
import type { Match, Standing } from '~/types'
import { useSupabase } from '~/utils/supabase'

const { matches, loading, error, fetchMatches, createMatch } = useMatches()

const matchesCount = computed(() => {
  if (!matches.value) return 0
  return Array.isArray(matches.value) ? matches.value.length : 0
})

const competitions = computed(() => {
  if (!matches.value || !Array.isArray(matches.value)) return []
  
  const competitionSet = new Set<string>()
  matches.value.forEach(match => {
    if (match && match.competition) {
      competitionSet.add(match.competition)
    }
  })
  return Array.from(competitionSet).sort()
})

const selectedCompetition = ref('')
const standings = ref<Standing[]>([])

function createTestMatch() {
  // Create a test match for a sample competition
  const testMatch = {
    competition: 'Test League',
    date: new Date().toISOString().split('T')[0],
    home: 'Team A',
    away: 'Team B',
    score_home: 2,
    score_away: 1,
    matchweek: 1
  }
  
  return createMatch(testMatch)
}

// Add a function to generate test data with multiple competitions
async function generateTestData() {
  try {
    // Create several test matches
    const testMatches = [
      // Premier League
      {
        competition: 'Premier League',
        date: new Date().toISOString().split('T')[0],
        home: 'Arsenal',
        away: 'Chelsea',
        score_home: 2,
        score_away: 1,
        matchweek: 1
      },
      {
        competition: 'Premier League',
        date: new Date().toISOString().split('T')[0],
        home: 'Liverpool',
        away: 'Man United',
        score_home: 3,
        score_away: 1,
        matchweek: 1
      },
      {
        competition: 'Premier League',
        date: new Date().toISOString().split('T')[0],
        home: 'Man City',
        away: 'Tottenham',
        score_home: 2,
        score_away: 2,
        matchweek: 1
      },
      
      // La Liga
      {
        competition: 'La Liga',
        date: new Date().toISOString().split('T')[0],
        home: 'Barcelona',
        away: 'Real Madrid',
        score_home: 2,
        score_away: 3,
        matchweek: 1
      },
      {
        competition: 'La Liga',
        date: new Date().toISOString().split('T')[0],
        home: 'Atletico Madrid',
        away: 'Sevilla',
        score_home: 1,
        score_away: 0,
        matchweek: 1
      },
      
      // Indonesian League
      {
        competition: 'Indonesian League',
        date: new Date().toISOString().split('T')[0],
        home: 'Germanesia',
        away: 'B-One',
        score_home: 3,
        score_away: 1,
        matchweek: 1
      },
      {
        competition: 'Indonesian League',
        date: new Date().toISOString().split('T')[0],
        home: 'GWN FC',
        away: 'Funball',
        score_home: 0,
        score_away: 0,
        matchweek: 1
      },
      {
        competition: 'Indonesian League',
        date: new Date().toISOString().split('T')[0],
        home: 'Siliwangi',
        away: 'Bandung Mengbal',
        score_home: 2,
        score_away: 1,
        matchweek: 1
      },
      {
        competition: 'Indonesian League',
        date: new Date().toISOString().split('T')[0],
        home: 'Ilgie Parahyangan',
        away: 'World Young United',
        score_home: 3,
        score_away: 2,
        matchweek: 1
      },
      
      // Indonesian League - Matchweek 2
      {
        competition: 'Indonesian League',
        date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week in the future
        home: 'B-One',
        away: 'GWN FC',
        score_home: null,
        score_away: null,
        matchweek: 2
      },
      {
        competition: 'Indonesian League',
        date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week in the future
        home: 'Funball',
        away: 'Siliwangi',
        score_home: null,
        score_away: null,
        matchweek: 2
      }
    ]
    
    // Create a single match first for testing
    const firstMatch = testMatches[0]
    const result = await createMatch(firstMatch)
    
    // If that works, create the rest
    if (result) {
      for (let i = 1; i < testMatches.length; i++) {
        await createMatch(testMatches[i])
      }
    }
    
    // Refresh matches
    const refreshedMatches = await fetchMatches()
    
  } catch (err) {
    console.error('Error generating test data:', err)
    error.value = 'Failed to generate test data. Please check the console for details.'
  }
}

// Function to directly check Supabase for matches
async function checkSupabaseDirectly() {
  try {
    const { supabase } = useSupabase()
    const { data, error: err } = await supabase
      .from('matches')
      .select('*')
      .limit(5)
    
    return { data, error: err }
  } catch (err) {
    console.error('Error in direct Supabase query:', err)
    return { data: null, error: err }
  }
}

onMounted(async () => {
  try {
    // First check if database is properly set up
    const { supabase, initializeDatabase } = useSupabase()
    const dbStatus = await initializeDatabase()

    // If there's a database problem, set a helpful error
    if (!dbStatus.initialized) {
      error.value = 'Database connection issue: Please check if Supabase tables are properly set up.'
      return
    }
    
    // Fetch matches
    await fetchMatches()
    
    // If no matches were found, create test data
    if (matchesCount.value === 0) {
      // Show a message while creating test data
      loading.value = true
      error.value = null
      
      await generateTestData() // Use the new function to create multiple test matches
      await fetchMatches() // Refresh matches after creating test data
      
      // Reset loading state
      loading.value = false
    }
    
    // Set default selected competition if there is at least one
    if (competitions.value && competitions.value.length > 0) {
      selectedCompetition.value = competitions.value[0]
      updateStandings()
    } else {
      // No competitions found even after adding test data
      error.value = 'No competitions found after adding test data. Please try refreshing the page.'
    }
  } catch (err) {
    console.error('Error in onMounted:', err)
    error.value = 'Failed to load standings. Please try again or check console for details.'
    loading.value = false
  }
})

function changeCompetition() {
  updateStandings()
}

function updateStandings() {
  if (!selectedCompetition.value) return
  
  try {
    const { calculateStandings } = useMatches()
    
    if (!matches.value || matches.value.length === 0) {
      standings.value = []
      return
    }
    
    // Get standings and ensure it's an array
    const result = calculateStandings(selectedCompetition.value, matches)
    
    // Always ensure we set a valid array
    standings.value = Array.isArray(result) ? result : []
  } catch (err) {
    console.error('Error calculating standings:', err)
    standings.value = []
  }
}
</script> 