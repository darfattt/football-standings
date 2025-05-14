import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
  const config = useRuntimeConfig()
  
  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseKey = config.public.supabaseKey as string
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Function to check if required tables exist and create them if they don't
  const initializeDatabase = async () => {
    console.log('Checking Supabase database setup...')
    
    try {
      // Check if matches table exists by trying to select from it
      const { error: matchesError } = await supabase
        .from('matches')
        .select('count')
        .limit(1)
      
      if (matchesError) {
        console.warn('Matches table might not exist:', matchesError.message)
        console.log('Creating matches table...')
        
        // This requires admin privileges which we likely don't have in this context
        // In a real app, you would use Supabase migrations or the dashboard to create tables
        console.error('Please create the matches table in Supabase dashboard with the following structure:')
        console.error(`
          - id: integer (primary key, auto-increment)
          - competition: text (not null)
          - date: date (not null)
          - home: text (not null)
          - away: text (not null)
          - score_home: integer (not null)
          - score_away: integer (not null)
          - matchweek: integer (not null)
          - created_at: timestamp with time zone (default: now())
        `)
      } else {
        console.log('Matches table exists and is accessible')
      }
      
      return { initialized: !matchesError }
    } catch (err) {
      console.error('Error checking database setup:', err)
      return { initialized: false, error: err }
    }
  }
  
  return { supabase, initializeDatabase }
} 