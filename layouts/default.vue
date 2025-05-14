<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-bold text-purple-900"></h1>
          <nav class="flex space-x-4">
            <NuxtLink 
              to="/" 
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-100"
              :class="{ 'bg-purple-100 text-purple-900': $route.path === '/' }"
            >
              Standings
            </NuxtLink>
            <!-- <NuxtLink 
              to="/progress" 
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-100"
              :class="{ 'bg-purple-100 text-purple-900': $route.path === '/progress' }"
            >
              Progress
            </NuxtLink> -->
            <NuxtLink 
              to="/fixture-difficulty" 
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-100"
              :class="{ 'bg-purple-100 text-purple-900': $route.path === '/fixture-difficulty' }"
            >
              FDR
            </NuxtLink>
            <NuxtLink 
              to="/matches" 
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-100"
              :class="{ 'bg-purple-100 text-purple-900': $route.path.includes('/matches') }"
            >
              Matches
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
    
    <footer class="bg-white border-t border-gray-200 py-4">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p class="text-center text-gray-500 text-sm">
          Darfat Expose Standings App &copy; {{ new Date().getFullYear() }}
        </p>
      </div>
    </footer>
  </div>
</template> 