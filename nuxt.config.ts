// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  ssr: false,
  debug: true,
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || 'https://oolkuvhrpsvpfkvutaav.supabase.co',
      supabaseKey: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbGt1dmhycHN2cGZrdnV0YWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMTA4MDcsImV4cCI6MjA1ODg4NjgwN30.81ZkaLahHymPkL35jHfBnbpTGtdx339UwsJAmd8eIDg'
    }
  }
})