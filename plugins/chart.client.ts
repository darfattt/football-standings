// Chart.js client-side plugin
// This ensures Chart.js is only initialized on the client side

import { defineNuxtPlugin } from '#app'
import Chart from 'chart.js/auto'
import { CategoryScale } from 'chart.js'

export default defineNuxtPlugin((nuxtApp) => {
  // Register the required Chart.js components
  Chart.register(CategoryScale)
  
  // Make Chart available throughout the application
  nuxtApp.provide('chart', Chart)
  
  console.log('Chart.js plugin initialized')
}) 