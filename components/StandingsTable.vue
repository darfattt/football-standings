<template>
  <div>
    <div v-if="debug" class="mb-4 p-2 bg-gray-100 rounded overflow-auto max-h-32 text-xs">
      <p>Debug - props received:</p>
      <pre>{{ JSON.stringify({
        isArray: Array.isArray(props.standings),
        length: props.standings?.length || 0,
        data: props.standings
      }, null, 2) }}</pre>
    </div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Position
            </th>
            <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Club
            </th>
            <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Played
            </th>
            <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Won
            </th>
            <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Drawn
            </th>
            <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Lost
            </th>
            <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              GF
            </th>
            <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              GA
            </th>
            <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              GD
            </th>
            <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              Points
            </th>
            <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Form
            </th>
            <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Next
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="validStandings.length === 0">
            <td colspan="12" class="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">
              No standings data available
            </td>
          </tr>
          <tr v-for="standing in validStandings" :key="standing.club">
            <td class="px-3 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm text-gray-900 font-medium">{{ standing.position }}</div>
                <div v-if="standing.previousPosition && standing.previousPosition !== standing.position" class="ml-1">
                  <svg v-if="standing.previousPosition > standing.position" class="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <svg v-else-if="standing.previousPosition < standing.position" class="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  <!-- <span v-else class="inline-block w-3 h-1 bg-gray-300 mx-1"></span> -->
                </div>
                <div v-else class="ml-1">
                  <!-- <span class="inline-block w-3 h-1 bg-gray-300 mx-1"></span> -->
                </div>
              </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-6 w-6">
                  <!-- Team logo using multiple possible filenames -->
                  <template v-if="!logoErrors[standing.club]">
                    <img 
                      :src="`/img/logo/${getTeamLogoFilename(standing.club)}`" 
                      :alt="`${standing.club} logo`"
                      class="h-6 w-6 rounded-full object-cover"
                      @error="() => handleLogoError(standing.club)"
                    />
                  </template>
                  <!-- Fallback to initials in a circle if no logo found -->
                  <div v-else class="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {{ getInitials(standing.club) }}
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ standing.club }}</div>
                </div>
              </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-center">
              <div class="text-sm text-gray-900">{{ standing.played }}</div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-center">
              <div class="text-sm text-gray-900">{{ standing.won }}</div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-center">
              <div class="text-sm text-gray-900">{{ standing.drawn }}</div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-center">
              <div class="text-sm text-gray-900">{{ standing.lost }}</div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-center">
              <div class="text-sm text-gray-900">{{ standing.gf }}</div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-center">
              <div class="text-sm text-gray-900">{{ standing.ga }}</div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-center">
              <div class="text-sm text-gray-900">{{ standing.gd }}</div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-center">
              <div class="text-sm font-bold text-gray-900">{{ standing.points }}</div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <div class="flex space-x-1 justify-center">
                <div v-for="(result, index) in standing.form || []" :key="index" 
                     class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                     :class="{
                       'bg-green-500': result === 'W',
                       'bg-gray-400': result === 'D',
                       'bg-red-500': result === 'L',
                     }">
                  {{ result }}
                </div>
              </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-center">
              <div v-if="standing.next" class="text-sm text-gray-900">{{ standing.next }}</div>
              <div v-else class="text-sm text-gray-400">-</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Standing } from '~/types'
import { getTeamLogoFilename } from '~/utils/teamLogos'

const props = defineProps<{
  standings: Standing[]
}>()

const debug = ref(false) // Set to false to hide debug info
const logoErrors = ref<Record<string, boolean>>({})

const validStandings = computed(() => {
  if (!props.standings || !Array.isArray(props.standings)) {
    return []
  }
  
  return props.standings
})

// Track which logos failed to load
function handleLogoError(teamName: string): void {
  logoErrors.value[teamName] = true
}

// Get initials for fallback display
function getInitials(name: string): string {
  if (!name) return '?'
  
  // Split on spaces and get first letter of each word
  const words = name.split(/\s+/)
  if (words.length === 1) return name.charAt(0).toUpperCase()
  
  // For compound names, get first letter of first and last words
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}
</script> 