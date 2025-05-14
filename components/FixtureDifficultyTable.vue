<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>
    
    <div v-else-if="!teamFixtures.length" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
      <p>No upcoming fixtures found.</p>
    </div>
    
    <div v-else class="overflow-x-auto">
      <!-- Legend for difficulty ratings -->
      <div class="mb-4 flex items-center space-x-2 text-sm">
        <div class="flex items-center">
          <span class="mr-2">FDR Key:</span>
          <div v-for="level in [1, 2, 3, 4, 5]" :key="level" class="flex items-center mr-2">
            <div :class="getDifficultyClass(level)" class="w-6 h-6 flex items-center justify-center rounded-sm">
              {{ level }}
            </div>
            <span class="ml-1">{{ getDifficultyText(level) }}</span>
          </div>
        </div>
      </div>
      
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Team
            </th>
            <template v-for="gameweek in displayedGameweeks" :key="gameweek">
              <th scope="col" class="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                GW{{ gameweek }}
                <div class="text-xxs font-normal">{{ getGameweekDate(gameweek) }}</div>
              </th>
            </template>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="teamFixture in teamFixtures" :key="teamFixture.team">
            <td class="px-3 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-6 w-6">
                  <!-- Team logo using handler from logo utility -->
                  <template v-if="!logoErrors[teamFixture.team]">
                    <img 
                      :src="`/img/logo/${getTeamLogoFilename(teamFixture.team)}`" 
                      :alt="`${teamFixture.team} logo`"
                      class="h-6 w-6 rounded-full object-cover"
                      @error="() => handleLogoError(teamFixture.team)"
                    />
                  </template>
                  <!-- Fallback to initials in a circle if no logo found -->
                  <div v-else class="bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {{ getInitials(teamFixture.team) }}
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ teamFixture.team }}</div>
                </div>
              </div>
            </td>
            <template v-for="gameweek in displayedGameweeks" :key="`${teamFixture.team}-${gameweek}`">
              <td class="p-1 text-center">
                <div v-if="getFixtureForGameweek(teamFixture.fixtures, gameweek)" 
                     class="text-xs p-1 rounded-sm"
                     :class="getDifficultyClass(getFixtureForGameweek(teamFixture.fixtures, gameweek)!.difficulty)">
                  <div class="font-medium">
                    {{ getOpponentShortCode(getFixtureForGameweek(teamFixture.fixtures, gameweek)!.opponent) }}
                    {{ getFixtureForGameweek(teamFixture.fixtures, gameweek)!.isHome ? '(H)' : '(A)' }}
                  </div>
                </div>
                <div v-else class="text-gray-300">-</div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { FixtureWithDifficulty, TeamFixtures, DifficultyLevel } from '~/types'
import { useFixtureDifficulty } from '~/composables/useFixtureDifficulty'
import { useMatches } from '~/composables/useMatches'
import { getTeamLogoFilename } from '~/utils/teamLogos'

const props = defineProps<{
  competitionName: string
}>()

const { matches, loading: matchesLoading, error: matchesError, calculateStandings,fetchMatches } = useMatches()
const { calculateTeamDifficulties, getFixturesWithDifficulty, getDifficultyClass } = useFixtureDifficulty()

const loading = ref(true)
const error = ref<string | null>(null)
const teamFixtures = ref<TeamFixtures[]>([])
const logoErrors = ref<Record<string, boolean>>({})

// Number of gameweeks to display
const displayGameweeks = ref(5)
// Starting gameweek (default to current)
const startingGameweek = ref(1)

// Calculate the gameweeks to display
const displayedGameweeks = computed(() => {
  const gameweeks = []
  for (let i = 0; i < displayGameweeks.value; i++) {
    gameweeks.push(startingGameweek.value + i)
  }
  return gameweeks
})

// Watch for changes to the competition
watch(() => props.competitionName, async () => {
  console.log('watch', props.competitionName)
  if (!props.competitionName) return
  await loadFixtureDifficulties()
}, { immediate: true })

// Load fixture difficulties
async function loadFixtureDifficulties() {
  try {
    console.log('loadFixtureDifficulties');
    loading.value = true
    error.value = null
    
    // If matches aren't loaded yet, we need to wait
    if (matchesLoading.value) {
      // We'll let the watch handle this once matches are loaded
      return
    }
    if (matchesError.value) {
      error.value = matchesError.value
      return
    }
    console.log('matches.value.length', matches.value.length);
    if (!matches.value || !Array.isArray(matches.value) || matches.value.length === 0) {
      error.value = 'No matches data available.'
      return
    }
    
    // Filter matches for this competition
    const competitionMatches = matches.value.filter(match => match.competition === props.competitionName)
    
    if (competitionMatches.length === 0) {
      error.value = `No matches found for competition: ${props.competitionName}`
      return
    }
    
    // Calculate standings to get team form and position
    const standings = calculateStandings(props.competitionName, matches)
    
    if (!standings || standings.length === 0) {
      error.value = 'Unable to calculate standings for fixture difficulty.'
      return
    }
    
    // Calculate team difficulties based on form and position
    const teamDifficulties = calculateTeamDifficulties(standings)
    
    // Get upcoming fixtures with difficulty ratings
    teamFixtures.value = getFixturesWithDifficulty(competitionMatches, teamDifficulties)
    console.log('teamFixtures.value', teamFixtures.value)
    // Set the starting gameweek to the earliest upcoming gameweek
    if (teamFixtures.value.length > 0 && teamFixtures.value[0].fixtures.length > 0) {
      const gameweeks = teamFixtures.value
        .flatMap(team => team.fixtures.map(fixture => fixture.matchweek))
        .sort((a, b) => a - b)
      
      if (gameweeks.length > 0) {
        startingGameweek.value = gameweeks[0]
      }
    }
    
    loading.value = false
  } catch (err) {
    console.error('Error loading fixture difficulties:', err)
    error.value = 'Failed to load fixture difficulties.'
    loading.value = false
  }
}

// Helper method to get fixture for a specific gameweek
function getFixtureForGameweek(fixtures: FixtureWithDifficulty[], gameweek: number): FixtureWithDifficulty | undefined {
  return fixtures.find(fixture => fixture.matchweek === gameweek)
}

// Get a short version of team names (3 letters)
function getOpponentShortCode(team: string): string {
  // Split the team name by spaces
  // const words = team.split(' ')
  
  // if (words.length === 1) {
  //   // For single word names, take first 3 letters
  //   return team.substring(0, 3).toUpperCase()
  // } else {
  //   // Try to use initials if there are multiple words
  //   if (words.length >= 3) {
  //     // If 3+ words, use first letter of first three words
  //     return (words[0][0] + words[1][0] + words[2][0]).toUpperCase()
  //   } else {
  //     // For 2 words, use first letter of first word and first two of second
  //     return (words[0][0] + words[1].substring(0, 2)).toUpperCase()
  //   }
  // }
  return team;
}

// Get gameweek date in short format
function getGameweekDate(gameweek: number): string {
  // Find the first fixture for this gameweek
  for (const team of teamFixtures.value) {
    const fixture = team.fixtures.find(f => f.matchweek === gameweek)
    if (fixture) {
      return new Date(fixture.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }
  }
  return ''
}

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

// Get text description for difficulty levels
function getDifficultyText(level: number): string {
  switch (level) {
    case 1: return 'Very Easy'
    case 2: return 'Easy'
    case 3: return 'Medium'
    case 4: return 'Hard'
    case 5: return 'Very Hard'
    default: return ''
  }
}

onMounted(async () => {
  // Fetch matches
  await fetchMatches()
  await loadFixtureDifficulties()
})
</script>

<style scoped>
.text-xxs {
  font-size: 0.65rem;
}
</style> 