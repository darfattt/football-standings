<template>
  <div>
    <div v-if="debug" class="mb-4 p-2 bg-gray-100 rounded overflow-auto max-h-32 text-xs">
      <p>Debug - props received:</p>
      <pre>{{ JSON.stringify({
        isArray: Array.isArray(validMatches),
        length: validMatches?.length || 0,
        firstMatch: validMatches[0] || null
      }, null, 2) }}</pre>
    </div>
    
    <div v-if="validMatches.length === 0" class="text-center py-4 text-gray-500">
      No matches found. Add some matches to get started.
    </div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Competition
            </th>
            <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Home
            </th>
            <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
            <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Away
            </th>
            <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Week
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="match in validMatches" :key="match.id || Math.random()">
            <td class="px-3 py-2 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ match.competition }}</div>
            </td>
            <td class="px-3 py-2 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDate(match.date) }}</div>
            </td>
            <td class="px-3 py-2 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ match.home }}</div>
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-center">
              <div class="text-sm font-bold">{{ match.score_home }} - {{ match.score_away }}</div>
            </td>
            <td class="px-3 py-2 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ match.away }}</div>
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-center">
              <div class="text-sm text-gray-900">{{ match.matchweek }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Match } from '~/types'

const props = defineProps<{
  matches: Match[]
}>()

const debug = ref(false)  // Set to false to hide debug info

// Filter out invalid matches and ensure we have a valid array
const validMatches = computed(() => {
  if (!props.matches || !Array.isArray(props.matches)) {
    console.warn('MatchesList received invalid matches prop')
    return []
  }
  
  // Filter out any invalid match entries
  return props.matches.filter(match => 
    match && 
    match.home && 
    match.away && 
    match.competition
  )
})

// Format date for display
function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A'
  
  try {
    // Try to parse and format the date
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (err) {
    console.error('Error formatting date:', err)
    return dateStr // Return original string if parsing fails
  }
}
</script> 