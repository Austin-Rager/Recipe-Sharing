<template>
  <div class="liked-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1>❤️ My Liked Recipes</h1>
      <p v-if="likedRecipes.length > 0">You have {{ likedRecipes.length }} liked recipes</p>
      <p v-else>No liked recipes yet.</p>
    </div>

    <!-- search and filters -->
    <div class="liked-controls" v-if="likedRecipes.length > 0">
      <div class="search-section">
        <div class="search-bar">
          <input 
            type="text" 
            placeholder="Search your liked recipes..." 
            v-model="searchQuery"
          />
          <span class="search-icon">🔍</span>
        </div>
      </div>

      <!-- quick filters -->
      <div class="quick-filters">
        <button 
          class="filter-btn" 
          :class="{ active: selectedDifficulty === '' }"
          @click="selectedDifficulty = ''"
        >
          All
        </button>
        <button 
          class="filter-btn"
          :class="{ active: selectedDifficulty === 'Easy' }"
          @click="selectedDifficulty = 'Easy'"
        >
          Easy
        </button>
        <button 
          class="filter-btn"
          :class="{ active: selectedDifficulty === 'Med' }"
          @click="selectedDifficulty = 'Med'"
        >
          Med
        </button>
        <button 
          class="filter-btn"
          :class="{ active: selectedDifficulty === 'Hard' }"
          @click="selectedDifficulty = 'Hard'"
        >
          Hard
        </button>
      </div>
    </div>

    <!-- no liked recipes -->
    <div class="empty-state" v-if="likedRecipes.length === 0">
      <div class="empty-icon">💔</div>
      <h2>No liked recipes yet</h2>
      <p>Start exploring recipes!</p>
      <button class="explore-btn" @click="goToHome">
        Explore Recipes
      </button>
    </div>

    <!-- liked recipes grid -->
    <div class="liked-recipes-grid" v-if="filteredLikedRecipes.length > 0">
      <div 
        v-for="recipe in filteredLikedRecipes" 
        :key="recipe.id"
        class="recipe-card"
        @click="openRecipe(recipe)"
      >
        <div class="card-image">
          <img :src="recipe.image" :alt="recipe.title" />
          <button 
            class="like-btn liked"
            @click.stop="toggleLike(recipe)"
          >
            ❤️
          </button>
        </div>
        <div class="card-content">
          <h3>{{ recipe.title }}</h3>
          <div class="card-meta">
            <div class="rating">
              <span class="stars">{{ '★'.repeat(Math.floor(recipe.rating)) }}{{ '☆'.repeat(5 - Math.floor(recipe.rating)) }}</span>
              <span class="rating-count">({{ recipe.reviewCount }})</span>
            </div>
            <span class="difficulty" :class="`difficulty-${recipe.difficulty.toLowerCase()}`">
              {{ recipe.difficulty }}
            </span>
          </div>
          <div class="recipe-stats">
            <span class="cook-time">⏱️ {{ recipe.cookTime }}min</span>
            <span class="liked-date">Liked {{ formatLikedDate(recipe.likedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- no results -->
    <div class="no-results" v-if="likedRecipes.length > 0 && filteredLikedRecipes.length === 0">
      <div class="no-results-icon">🔍</div>
      <h3>No recipes found</h3>
      <p>Try Again</p>
      <button class="clear-filters-btn" @click="clearFilters">
        Clear Filters
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'

export default {
  name: 'LikedPage',
  emits: ['go-home'],
  setup(props, { emit }) {
    const likedRecipes = ref([])
    const searchQuery = ref('')
    const selectedDifficulty = ref('')

    //filters
    const filteredLikedRecipes = computed(() => {
      let filtered = likedRecipes.value

      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(recipe => 
          recipe.title.toLowerCase().includes(query)
        )
      }


      if (selectedDifficulty.value) {
        filtered = filtered.filter(recipe => 
          recipe.difficulty.toLowerCase() === selectedDifficulty.value.toLowerCase()
        )
      }

      return filtered
    })


    const loadLikedRecipes = () => {
      const stored = localStorage.getItem('likedRecipes')
      if (stored) {
        likedRecipes.value = JSON.parse(stored)
      }
    }

    const toggleLike = (recipe) => {
      likedRecipes.value = likedRecipes.value.filter(r => r.id !== recipe.id)
      localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes.value))
      

      const allRecipes = JSON.parse(localStorage.getItem('allRecipes') || '[]')
      const originalRecipe = allRecipes.find(r => r.id === recipe.id)
      if (originalRecipe) {
        originalRecipe.isLiked = false
        localStorage.setItem('allRecipes', JSON.stringify(allRecipes))
      }
    }

    const openRecipe = (recipe) => {
      alert(`Opening recipe: ${recipe.title}`)
    }

    const goToHome = () => {
      emit('go-home')
    }

    const clearFilters = () => {
      searchQuery.value = ''
      selectedDifficulty.value = ''
    }

    const formatLikedDate = (dateString) => {
      if (!dateString) return 'Recently'
      
      try {
        const date = new Date(dateString)
        const now = new Date()
        const diffDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'today'
        if (diffDays === 1) return 'yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
        return 'a while ago'
      } catch (error) {
        return 'Recently'
      }
    }

    const handleStorageChange = () => {
      loadLikedRecipes()
    }

  
    onMounted(() => {
      loadLikedRecipes()
      window.addEventListener('storage', handleStorageChange)
    })


    onMounted(() => {
      return () => {
        window.removeEventListener('storage', handleStorageChange)
      }
    })


    return {
      likedRecipes,
      searchQuery,
      selectedDifficulty,
      filteredLikedRecipes,
      toggleLike,
      openRecipe,
      goToHome,
      clearFilters,
      formatLikedDate
    }
  }
}
</script>

<style>
/* Main Container */
.liked-page {
  padding: var(--space-8) var(--space-6);
}

/* PAGE HEADER STYLES */
.page-header {
  max-width: 1200px;
  margin: 0 auto var(--space-8);
  text-align: center;
  background: var(--background-primary);
  padding: var(--space-12) var(--space-8);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--background-tertiary);
}

.page-header h1 {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  letter-spacing: -0.025em;
}

.page-header p {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
}

/* CONTROLS SECTION */
.liked-controls {
  max-width: 1200px;
  margin: 0 auto var(--space-8);
  background: var(--background-primary);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--background-tertiary);
}

.search-section {
  margin-bottom: var(--space-6);
}

.search-bar {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-bar input {
  width: 100%;
  padding: var(--space-4) var(--space-12) var(--space-4) var(--space-6);
  border: 2px solid var(--background-tertiary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  background: var(--background-primary);
  transition: all var(--transition-fast);
  outline: none;
  box-shadow: var(--shadow-sm);
}

.search-bar input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.1);
  transform: translateY(-1px);
}

.search-bar input::placeholder {
  color: var(--text-muted);
}

.search-icon {
  position: absolute;
  right: var(--space-6);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: var(--font-size-xl);
}

/* QUICK FILTERS */
.quick-filters {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.filter-btn {
  padding: var(--space-3) var(--space-6);
  border: 2px solid var(--background-tertiary);
  background: var(--background-secondary);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 600;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.filter-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.filter-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  box-shadow: var(--shadow-md);
}

/* EMPTY STATE STYLES */
.empty-state {
  max-width: 600px;
  margin: var(--space-16) auto;
  text-align: center;
  background: var(--background-primary);
  padding: var(--space-16) var(--space-8);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--background-tertiary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-6);
  opacity: 0.6;
}

.empty-state h2 {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.empty-state p {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
  line-height: 1.6;
}

.explore-btn {
  padding: var(--space-4) var(--space-8);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
}

.explore-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

/* RECIPE GRID STYLES */
.liked-recipes-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-8);
}

.recipe-card {
  background: var(--background-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--background-tertiary);
}

.recipe-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.card-image {
  position: relative;
  height: 240px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: linear-gradient(45deg, #f0f4f8, #d6e1ea);
  transition: transform var(--transition-slow);
}

.recipe-card:hover .card-image img {
  transform: scale(1.08);
}

.like-btn {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  background: var(--primary-light);
  border: none;
  border-radius: var(--radius-full);
  width: 48px;
  height: 48px;
  cursor: pointer;
  font-size: var(--font-size-xl);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  color: var(--primary-color);
}

.like-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: scale(1.15);
  box-shadow: var(--shadow-xl);
}

.card-content {
  padding: var(--space-6);
}

.card-content h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  line-height: 1.3;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  font-size: var(--font-size-sm);
}

.rating {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.stars {
  color: #fbbf24;
  font-size: var(--font-size-lg);
}

.rating-count {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  margin-left: var(--space-1);
}

.difficulty {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.difficulty-easy {
  background: var(--easy-bg);
  color: var(--easy-text);
}

.difficulty-med {
  background: var(--medium-bg);
  color: var(--medium-text);
}

.difficulty-hard {
  background: var(--hard-bg);
  color: var(--hard-text);
}

.recipe-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--background-tertiary);
}

.cook-time {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.liked-date {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-style: italic;
}

/* NO RESULTS STATE */
.no-results {
  max-width: 500px;
  margin: var(--space-12) auto;
  text-align: center;
  background: var(--background-primary);
  padding: var(--space-12) var(--space-8);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--background-tertiary);
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.no-results h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.no-results p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

.clear-filters-btn {
  padding: var(--space-3) var(--space-6);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.clear-filters-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* RESPONSIVE DESIGN */
@media (max-width: 1024px) {
  .liked-page {
    padding: var(--space-6) var(--space-4);
  }
  
  .liked-recipes-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-6);
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: var(--space-8) var(--space-6);
  }
  
  .page-header h1 {
    font-size: var(--font-size-3xl);
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .liked-controls {
    padding: var(--space-4);
  }
  
  .quick-filters {
    gap: var(--space-2);
  }
  
  .filter-btn {
    padding: var(--space-2) var(--space-4);
    font-size: var(--font-size-xs);
  }
  
  .liked-recipes-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--space-4);
  }
}

@media (max-width: 480px) {
  .liked-page {
    padding: var(--space-4) var(--space-3);
  }
  
  .liked-recipes-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header h1 {
    font-size: var(--font-size-2xl);
  }
  
  .card-content {
    padding: var(--space-4);
  }
  
  .recipe-stats {
    flex-direction: column;
    gap: var(--space-2);
    align-items: flex-start;
  }
}

/* ACCESSIBILITY */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}

.recipe-card:focus,
.filter-btn:focus,
.explore-btn:focus,
.clear-filters-btn:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
</style>