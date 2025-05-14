<template>
  <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>
    
    <div v-else>
      <!-- Team selector will appear after data is loaded -->
      <div v-if="allTeams.length > 0">
        <TeamProgressSelector 
          :teams="allTeams" 
          @update:selectedTeams="updateVisibleTeams" 
        />
      </div>
      
      <!-- Use v-show instead of conditional rendering to keep the DOM element -->
      <div class="chart-container" style="position: relative; height:600px;">
        <canvas ref="chartRef"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, defineProps, computed } from 'vue'
import Chart from 'chart.js/auto'
import type { ChartConfiguration, ChartData, ChartOptions } from 'chart.js'
import { getTeamLogoFilename } from '~/utils/teamLogos'
import { useStandingsHistory } from '~/composables/useStandingsHistory'
import type { Standing } from '~/types'

const props = defineProps<{
  competitionName: string
  matches: any
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
const chart = ref<Chart | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const allTeams = ref<string[]>([])
const visibleTeams = ref<string[]>([])
const standingsHistory = ref<Map<number, Standing[]>>(new Map())

// Team colors for chart lines - we'll generate these dynamically
const TEAM_COLORS = [
  '#ff4136', // Red
  '#0074d9', // Blue
  '#2ecc40', // Green
  '#ff851b', // Orange
  '#b10dc9', // Purple
  '#ffdc00', // Yellow
  '#f012be', // Pink
  '#01ff70', // Lime
  '#aaaaaa', // Gray
  '#001f3f', // Navy
  '#7fdbff', // Light Blue
  '#3d9970', // Olive
  '#39cccc', // Teal
  '#85144b', // Maroon
  '#ffffff'  // White
]

// Color mapping to ensure consistent colors per team
const teamColorMap = ref<Record<string, string>>({})

// Create the chart when the component is mounted
onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    
    // Make sure to wait for the DOM to be updated
    await nextTick()
    //await loadStandingsData()
      
    // Add a longer delay to ensure the canvas is fully rendered
    setTimeout(async () => {
      // Let's check if chartRef.value exists after the delay
      console.log('Before initChart - chartRef exists:', !!chartRef.value)
      // Force the DOM to update completely
      await nextTick()
      await initChart()
      
      loading.value = false
    }, 500) // Longer delay for more reliability
  } catch (err: any) {
    console.error('Error initializing chart:', err)
    error.value = err.message || 'Failed to load standings progress chart'
    loading.value = false
  }
})

// Watch for changes in the competition or matches
watch(() => [props.competitionName, props.matches], async () => {
  if (!props.competitionName || !props.matches) return
  
  try {
    loading.value = true
    error.value = null
    // Destroy previous chart if it exists
    if (chart.value) {
      chart.value.destroy()
      chart.value = null
    }
    
    // Wait for DOM updates
    await nextTick()
    await loadStandingsData()
    
    // Add a delay to ensure the canvas is fully rendered
    setTimeout(async () => {
      // Force another DOM update
      await nextTick()
      
      // Let's check if chartRef.value exists after the delay
      console.log('On competition change - chartRef exists:', !!chartRef.value)
      
      await initChart()
      loading.value = false
    }, 500)
  } catch (err: any) {
    console.error('Error updating chart:', err)
    error.value = err.message || 'Failed to update standings progress chart'
    loading.value = false
  }
}, { deep: true })

// Listen for changes in the visible teams and update the chart
watch(visibleTeams, async () => {
  if (visibleTeams.value.length === 0 || !chartRef.value) return
  
  // Destroy previous chart if it exists
  if (chart.value) {
    chart.value.destroy()
    chart.value = null
  }
  
  // Force a small delay and DOM update
  setTimeout(async () => {
    await nextTick()
    await initChart()
  }, 100)
}, { deep: true })

// Load standings data for all matchweeks
async function loadStandingsData() {
  const { 
    calculateStandingsHistory, 
    getTeamNames,
  } = useStandingsHistory()
  
  // Calculate standings history for all matchweeks
  standingsHistory.value = calculateStandingsHistory(
    props.competitionName, 
    props.matches
  )
  
  if (standingsHistory.value.size === 0) {
    error.value = 'No standings data available for this competition'
    return
  }
  
  // Get all team names
  allTeams.value = getTeamNames(standingsHistory.value)
  
  // Initialize color mapping for all teams
  allTeams.value.forEach((team, index) => {
    if (!teamColorMap.value[team]) {
      teamColorMap.value[team] = TEAM_COLORS[index % TEAM_COLORS.length]
    }
  })
  
  // By default, use first 5 teams for visibility if there are many
  if (allTeams.value.length > 5) {
    visibleTeams.value = allTeams.value.slice(0, 5)
  } else {
    visibleTeams.value = [...allTeams.value]
  }
}

// Update which teams are visible in the chart
function updateVisibleTeams(teams: string[]) {
  visibleTeams.value = teams
}

// Initialize the chart with current data
async function initChart() {
  console.log('initChart called')
  console.log('chartRef value:', chartRef.value)
  
  // Ensure we have the canvas element
  if (!chartRef.value) {
    console.error('Chart canvas reference is null')
    error.value = 'Chart rendering error: Canvas element not found'
    return
  }
  
  try {
    
    // Ensure the canvas element has a context
    const ctx = chartRef.value.getContext('2d')
    if (!ctx) {
      console.error('Failed to get 2D context from canvas')
      error.value = 'Chart rendering error: Canvas context not available'
      return
    }
  
    const { 
      getTeamPositionsByMatchweek,
      getMatchweeks
    } = useStandingsHistory()
    
    if (standingsHistory.value.size === 0) {
      error.value = 'No standings data available for this competition'
      return
    }
    
    // Get matchweeks
    const matchweeks = getMatchweeks(standingsHistory.value)
    
    // Create datasets only for visible teams
    const datasets = visibleTeams.value.map((teamName) => {
      const positions = getTeamPositionsByMatchweek(standingsHistory.value, teamName)
      
      return {
        label: teamName,
        data: positions,
        fill: false,
        borderColor: teamColorMap.value[teamName],
        backgroundColor: teamColorMap.value[teamName],
        tension: 0.3,
        pointStyle: 'circle',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    })
    
    // Chart data
    const data: ChartData = {
      labels: matchweeks.map(week => `Gameweek ${week}`),
      datasets: datasets
    }
    
    // Chart options
    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (tooltipItems) => {
              return `${tooltipItems[0].label}`
            },
            label: (tooltipItem) => {
              const teamName = tooltipItem.dataset.label || 'Unknown'
              const position = tooltipItem.raw as number
              
              // Return formatted position (1st, 2nd, 3rd, etc.)
              let suffix = 'th'
              if (position % 10 === 1 && position % 100 !== 11) suffix = 'st'
              else if (position % 10 === 2 && position % 100 !== 12) suffix = 'nd'
              else if (position % 10 === 3 && position % 100 !== 13) suffix = 'rd'
              
              return `${teamName}: ${position}${suffix} position`
            }
          }
        },
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Gameweek'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Position'
          },
          reverse: true, // Higher position = lower y-value (1st is at the top)
          min: 1, // Start from position 1
          suggestedMax: Math.min(20, allTeams.value.length) // Limit to 20 or number of teams
        }
      }
    }
    
    // Create the chart
    chart.value = new Chart(chartRef.value, {
      type: 'line',
      data: data,
      options: options
    })
    console.log('Chart created successfully')
  } catch (err: any) {
    console.error('Error creating chart:', err)
    error.value = 'Failed to create chart: ' + (err instanceof Error ? err.message : String(err))
  }
}
</script>

<style scoped>
.chart-container {
  min-height: 400px;
}
</style> 