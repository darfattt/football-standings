<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Matches</h1>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-6">
        <!-- Add Match Form -->
        <MatchForm @match-added="onMatchAdded" />
        
        <!-- CSV Uploader -->
        <CsvUploader @matches-imported="onMatchesImported" />
      </div>
      
      <div>
        <!-- Matches List -->
        <div class="bg-white p-6 rounded-lg shadow-md mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium">Recent Matches</h2>
            
            <div v-if="competitions && competitions.length > 0" class="flex items-center space-x-2">
              <label for="filter-competition" class="text-sm text-gray-700">
                Filter:
              </label>
              <select 
                id="filter-competition" 
                v-model="filterCompetition"
                class="block w-40 pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md"
                @change="filterMatches"
              >
                <option value="">All Competitions</option>
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
          
          <div v-else>
            <MatchesList :matches="displayedMatches" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMatches } from '~/composables/useMatches'
import type { Match } from '~/types'

const { matches, loading, error, fetchMatches, fetchMatchesByCompetition } = useMatches()
const filterCompetition = ref('')

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

const displayedMatches = computed(() => {
  if (!matches.value || !Array.isArray(matches.value)) return []
  
  // Limit to 30 most recent matches for performance
  return [...matches.value].slice(0, 30)
})

onMounted(async () => {
  try {
    await fetchMatches()
  } catch (err) {
    console.error('Error loading matches:', err)
  }
})

const onMatchAdded = async (match: Match) => {
  try {
    await fetchMatches()
  } catch (err) {
    console.error('Error refreshing matches after adding:', err)
  }
}

const onMatchesImported = async (importedMatches: Match[]) => {
  try {
    await fetchMatches()
  } catch (err) {
    console.error('Error refreshing matches after import:', err)
  }
}

const filterMatches = async () => {
  try {
    if (filterCompetition.value) {
      await fetchMatchesByCompetition(filterCompetition.value)
    } else {
      await fetchMatches()
    }
  } catch (err) {
    console.error('Error filtering matches:', err)
  }
}
</script> 