<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Fixture Difficulty Ratings</h1>
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
        <h2 class="text-lg font-semibold text-gray-800 mb-2">Fixture Difficulty Rating (FDR)</h2>
        <p class="text-sm text-gray-600">
          This shows the upcoming fixtures for each team with a difficulty rating from 1 (very easy) to 5 (very hard).
          Difficulty is calculated based on team position (70%) and recent form (30%), with home advantage considered.
        </p>
        <p class="text-sm text-gray-600 mt-2">
          Use this table to plan your Fantasy Premier League transfers by targeting teams with a run of easier fixtures.
        </p>
      </div>
      
      <FixtureDifficultyTable 
        :competition-name="selectedCompetition"
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
  // No need to do anything here - the FixtureDifficultyTable component will update
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
    console.error('Error loading fixture difficulty page:', err)
    error.value = 'Failed to load fixture difficulties. Please try again or check console for details.'
    loading.value = false
  }
})
</script> 