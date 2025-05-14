<template>
  <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
    <h3 class="text-lg font-medium text-gray-900 mb-3">Filter Teams</h3>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <div v-for="team in teams" :key="team" class="flex items-center">
        <input 
          type="checkbox" 
          :id="`team-${team.replace(/\s+/g, '-').toLowerCase()}`" 
          :value="team" 
          v-model="selectedTeams"
          class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
        >
        <label 
          :for="`team-${team.replace(/\s+/g, '-').toLowerCase()}`" 
          class="ml-2 block text-sm text-gray-900 truncate"
        >
          {{ team }}
        </label>
      </div>
    </div>
    
    <div class="mt-4 flex justify-between items-center">
      <div>
        <span class="text-sm text-gray-600">{{ selectedTeams.length }} of {{ teams.length }} teams selected</span>
      </div>
      <div class="space-x-2">
        <button 
          @click="selectAll" 
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Select All
        </button>
        <button 
          @click="deselectAll" 
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Deselect All
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, defineProps, defineEmits } from 'vue'

const props = defineProps<{
  teams: string[]
}>()

const emit = defineEmits<{
  (e: 'update:selectedTeams', teams: string[]): void
}>()

const selectedTeams = ref<string[]>([])

// Initially select all teams or a maximum of 5 if there are many
watchEffect(() => {
  if (props.teams.length && selectedTeams.value.length === 0) {
    // If there are more than 5 teams, just select the first 5
    if (props.teams.length > 5) {
      selectedTeams.value = props.teams.slice(0, 5)
    } else {
      // Otherwise select all teams
      selectedTeams.value = [...props.teams]
    }
    
    // Emit the initial selection
    emit('update:selectedTeams', selectedTeams.value)
  }
})

// Watch for changes in the selection and emit them
watchEffect(() => {
  emit('update:selectedTeams', selectedTeams.value)
})

// Select all teams
function selectAll() {
  selectedTeams.value = [...props.teams]
}

// Deselect all teams
function deselectAll() {
  selectedTeams.value = []
}
</script> 