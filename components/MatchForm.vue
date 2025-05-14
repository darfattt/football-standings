<template>
  <form @submit.prevent="submitMatch" class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-lg font-medium mb-4">Add New Match</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="col-span-1 md:col-span-2">
        <label for="competition" class="block text-sm font-medium text-gray-700">Competition</label>
        <input
          type="text"
          id="competition"
          v-model="match.competition"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      
      <div>
        <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          id="date"
          v-model="match.date"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      
      <div>
        <label for="matchweek" class="block text-sm font-medium text-gray-700">Matchweek</label>
        <input
          type="number"
          id="matchweek"
          v-model="match.matchweek"
          required
          min="1"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      
      <div>
        <label for="home" class="block text-sm font-medium text-gray-700">Home Team</label>
        <input
          type="text"
          id="home"
          v-model="match.home"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      
      <div>
        <label for="away" class="block text-sm font-medium text-gray-700">Away Team</label>
        <input
          type="text"
          id="away"
          v-model="match.away"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      
      <div>
        <label for="score_home" class="block text-sm font-medium text-gray-700">Home Score</label>
        <input
          type="number"
          id="score_home"
          v-model="match.score_home"
          required
          min="0"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      
      <div>
        <label for="score_away" class="block text-sm font-medium text-gray-700">Away Score</label>
        <input
          type="number"
          id="score_away"
          v-model="match.score_away"
          required
          min="0"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
    </div>
    
    <div class="mt-6">
      <button
        type="submit"
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        :disabled="loading"
      >
        <span v-if="loading">Saving...</span>
        <span v-else>Add Match</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Match } from '~/types'
import { useMatches } from '~/composables/useMatches'

const emits = defineEmits(['match-added'])
const { createMatch, loading, error } = useMatches()

const match = ref<Match>({
  competition: '',
  date: new Date().toISOString().split('T')[0],
  home: '',
  away: '',
  score_home: 0,
  score_away: 0,
  matchweek: 1
})

const submitMatch = async () => {
  try {
    const result = await createMatch(match.value)
    if (result) {
      emits('match-added', result)
      // Reset form
      match.value = {
        competition: match.value.competition, // Keep the competition
        date: new Date().toISOString().split('T')[0],
        home: '',
        away: '',
        score_home: 0,
        score_away: 0,
        matchweek: match.value.matchweek // Keep the matchweek
      }
    }
  } catch (err) {
    console.error('Error submitting match:', err)
  }
}
</script> 