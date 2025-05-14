<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Standings Progress</h1>
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
      <div class="mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
        <h2 class="text-lg font-semibold text-gray-800 mb-2">Position Trends Over Time</h2>
        <p class="text-sm text-gray-600">
          This chart shows how each team's position has changed over the course of the season.
          The Y-axis shows the position (1 is at the top), and the X-axis shows the matchweek.
          Use the checkboxes below to show or hide specific teams.
        </p>
      </div>
      
      <StandingsProgress 
        :competition-name="selectedCompetition"
        :matches="matches"
        :key="selectedCompetition"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMatches } from '~/composables/useMatches'

const { matches, loading, error, fetchMatches } = useMatches()

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

function changeCompetition() {
  // No need to do anything here - the StandingsProgress component will update
  // itself when selectedCompetition changes
}

onMounted(async () => {
  try {
    // Fetch matches
    await fetchMatches()
    
    // Set default selected competition if there is at least one
    if (competitions.value && competitions.value.length > 0) {
      selectedCompetition.value = competitions.value[0]
    }
  } catch (err) {
    console.error('Error loading progress page:', err)
    error.value = 'Failed to load standings. Please try again or check console for details.'
    loading.value = false
  }
})
</script> 