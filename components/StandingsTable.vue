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
              <div class="text-sm text-gray-900 font-medium">{{ standing.position }}</div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-6 w-6">
                  <!-- Logo placeholder, could be replaced with actual team logos -->
                  <div class="bg-gray-200 h-6 w-6 rounded-full"></div>
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
import { computed, onMounted, watch, ref } from 'vue'
import type { Standing } from '~/types'

const props = defineProps<{
  standings: Standing[]
}>()

const debug = ref(false) // Set to false to hide debug info

// Log props when component mounts
onMounted(() => {
  console.log('StandingsTable mounted, props:', props.standings)
})

// Watch for changes in the standings prop
watch(() => props.standings, (newVal) => {
  console.log('Standings prop changed:', newVal)
}, { deep: true })

const validStandings = computed(() => {
  console.log('StandingsTable props received:', props.standings)
  console.log('Is array?', Array.isArray(props.standings))
  console.log('Length:', props.standings?.length)
  
  if (!props.standings || !Array.isArray(props.standings)) {
    console.log('Returning empty array because standings is not valid')
    return []
  }
  
  console.log('Returning standings data:', props.standings)
  return props.standings
})
</script> 