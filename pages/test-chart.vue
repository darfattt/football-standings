<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Chart Test Page</h1>
    
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="chart-container" style="position: relative; height:400px;">
        <canvas ref="chartRef"></canvas>
      </div>
    </div>
    
    <div class="mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
      <p class="text-sm text-gray-600">
        This is a simple test page to ensure Chart.js is rendering correctly.
        If the chart appears here but not in the Progress page, it's likely due to component lifecycle issues.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'

const chartRef = ref(null)
const chart = ref(null)

onMounted(async () => {
  // Wait for the DOM to update
  await nextTick()
  
  // Add a delay to ensure the canvas is rendered
  setTimeout(() => {
    if (!chartRef.value) {
      console.error('Chart canvas reference is null')
      return
    }
    
    console.log('Test chart canvas found, creating chart')
    
    try {
      // Create a simple chart to test rendering
      chart.value = new Chart(chartRef.value, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Test Data',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: '#0074d9',
            borderColor: '#0074d9',
            borderWidth: 2,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
      
      console.log('Test chart created successfully')
    } catch (err) {
      console.error('Error creating test chart:', err)
    }
  }, 500)
})
</script>

<style scoped>
.chart-container {
  min-height: 400px;
}
</style> 