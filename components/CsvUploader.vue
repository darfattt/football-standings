<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-lg font-medium mb-4">Import Matches from CSV</h2>
    
    <div class="mb-4">
      <p class="text-sm text-gray-600 mb-2">CSV format should include the following columns:</p>
      <code class="text-xs bg-gray-100 p-2 rounded block">
        competition,date,home,score_home,score_away,away,matchweek
      </code>
      <div class="mt-2">
        <a href="/sample.csv" download class="text-xs text-purple-600 hover:text-purple-800">
          Download sample CSV
        </a>
      </div>
    </div>
    
    <div class="mt-4">
      <label 
        for="csv-file" 
        class="block w-full cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm text-center hover:bg-gray-50"
        :class="{ 'border-purple-500 bg-purple-50': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onFileDrop"
      >
        <input 
          id="csv-file" 
          type="file" 
          accept=".csv" 
          class="hidden" 
          @change="onFileChange"
        />
        <span v-if="!selectedFile">Drag & drop your CSV file here or click to browse</span>
        <span v-else>Selected: {{ selectedFile.name }}</span>
      </label>
    </div>
    
    <div v-if="selectedFile" class="mt-4">
      <button
        @click="uploadFile"
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        :disabled="loading"
      >
        <span v-if="loading">Uploading...</span>
        <span v-else>Upload & Import</span>
      </button>
      <button
        @click="cancelUpload"
        class="ml-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        :disabled="loading"
      >
        Cancel
      </button>
    </div>
    
    <div v-if="error" class="mt-4 text-sm text-red-600">
      {{ error }}
    </div>
    
    <div v-if="success" class="mt-4 text-sm text-green-600">
      {{ success }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMatches } from '~/composables/useMatches'

const emits = defineEmits(['matches-imported'])
const { importMatchesFromCSV, loading: matchesLoading, error: matchesError } = useMatches()

const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    error.value = null
    success.value = null
  }
}

const onFileDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files.length) {
    const file = event.dataTransfer.files[0]
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      selectedFile.value = file
      error.value = null
      success.value = null
    } else {
      error.value = 'Please upload a CSV file.'
    }
  }
}

const uploadFile = async () => {
  if (!selectedFile.value) return
  
  loading.value = true
  error.value = null
  success.value = null
  
  try {
    // Process CSV file
    const importedMatches = await importMatchesFromCSV(selectedFile.value)
    success.value = `Successfully imported ${importedMatches.length} matches.`
    emits('matches-imported', importedMatches)
    selectedFile.value = null
  } catch (err: any) {
    error.value = err.message || 'Failed to import matches from CSV.'
    console.error('Error importing matches:', err)
  } finally {
    loading.value = false
  }
}

const cancelUpload = () => {
  selectedFile.value = null
  error.value = null
  success.value = null
}
</script> 