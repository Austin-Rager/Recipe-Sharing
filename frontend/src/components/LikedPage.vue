<template>
  <div class="liked-page">

    <!-- search and filters -->
    <div class="liked-controls" v-if="likedRecipes.length > 0">
      <div class="search-section">
        <div class="search-bar">
          <input 
            type="text" 
            placeholder="Search your liked recipes..." 
            v-model="searchQuery"
          />
           <i data-lucide="search" class="search-icon"></i>
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
    <div class="empty-state" v-if="!loading && likedRecipes.length === 0">
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
        :key="getRecipeId(recipe)"
        class="recipe-card"
        @click="openRecipe(recipe)"
      >
        <div class="card-image">
          <img :src="getRecipeImage(recipe)" :alt="getRecipeTitle(recipe)" />
          <button 
            class="like-btn liked"
            :disabled="unlikeLoading === getRecipeId(recipe)"
            @click.stop="toggleLike(recipe)"
          >
            {{ unlikeLoading === getRecipeId(recipe) ? '⏳' : '❤️' }}
          </button>
        </div>
        <div class="card-content">
          <h3>{{ getRecipeTitle(recipe) }}</h3>
          <div class="card-meta">
            <div class="rating">
              <span class="stars">{{ '★'.repeat(Math.floor(getRecipeRating(recipe))) }}{{ '☆'.repeat(5 - Math.floor(getRecipeRating(recipe))) }}</span>
              <span class="rating-count">({{ getRecipeLikes(recipe) }})</span>
            </div>
            <span class="difficulty" :class="`difficulty-${getRecipeDifficulty(recipe).toLowerCase()}`">
              {{ getRecipeDifficulty(recipe) }}
            </span>
          </div>
          <div class="recipe-stats">
            <span class="cook-time">⏱️ {{ getRecipeTime(recipe) }}</span>
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
import { ref, computed, onMounted } from 'vue'

function reinitializeIcons() {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons();
      console.log('Icons reinitialized');
    }
  }, 50);
}

export default {
  name: 'LikedPage',
  emits: ['go-home', 'open-recipe'],
  setup(props, { emit }) {

    const API_BASE_URL = 'http://localhost:8080';
    
    const likedRecipes = ref([])
    const loading = ref(true)
    const searchQuery = ref('')
    const selectedDifficulty = ref('')
    const unlikeLoading = ref(null) 


    const api = {
      async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        };

        const response = await fetch(url, config);
        
        if (response.headers.get('content-type')?.includes('application/json')) {
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
          }
          return data;
        } else {
          if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `HTTP ${response.status}`);
          }
          return { success: true };
        }
      },

      async getLikedRecipes() {
        return this.request('/user/liked-recipes');
      },

      async unlikeRecipe(id) {
        return this.request(`/recipe/${id}/like`, { method: 'DELETE' });
      }
    };

    function convertBackendRecipe(backendRecipe) {
      return {
        id: backendRecipe._id,
        title: backendRecipe.name,
        description: backendRecipe.description || "Delicious recipe",
        image: backendRecipe.images?.length > 0 
          ? backendRecipe.images[0].url 
          : "https://www.svgrepo.com/show/9389/fork-plate-knife.svg",
        rating: backendRecipe.rating || 4.0,
        reviewCount: backendRecipe.likes || 0,
        cookTime: parseTime(backendRecipe.time),
        difficulty: mapDifficulty(backendRecipe.difficulty),
        isLiked: true, 
        creator: backendRecipe.creator,
        ingredients: backendRecipe.ingredients,
        instructions: backendRecipe.instructions,
        likedAt: new Date(), 
        _original: backendRecipe
      };
    }

    function parseTime(timeString) {
      if (!timeString) return 30;
      const match = timeString.match(/(\d+)/);
      return match ? parseInt(match[1]) : 30;
    }

    function mapDifficulty(difficultyNumber) {
      const map = { 1: 'Easy', 2: 'Med', 3: 'Hard', 4: 'Hard', 5: 'Hard' };
      return map[difficultyNumber] || 'Easy';
    }

   
    function getRecipeId(recipe) {
      return recipe.id || recipe._id;
    }

    function getRecipeTitle(recipe) {
      return recipe.title || recipe.name;
    }

    function getRecipeImage(recipe) {
      if (recipe.image) return recipe.image;
      if (recipe.images?.length > 0) return recipe.images[0].url;
      return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400";
    }

    function getRecipeRating(recipe) {
      return recipe.rating || 4.0;
    }

    function getRecipeLikes(recipe) {
      return recipe.reviewCount || recipe.likes || 0;
    }

    function getRecipeTime(recipe) {
      if (recipe.cookTime) return `${recipe.cookTime}min`;
      if (recipe.time) return recipe.time;
      return "30min";
    }

    function getRecipeDifficulty(recipe) {
      if (recipe.difficulty && typeof recipe.difficulty === 'string') {
        return recipe.difficulty;
      }
      if (recipe.difficulty && typeof recipe.difficulty === 'number') {
        return mapDifficulty(recipe.difficulty);
      }
      return 'Easy';
    }

    //filters
    const filteredLikedRecipes = computed(() => {
      let filtered = likedRecipes.value

      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(recipe => 
          getRecipeTitle(recipe).toLowerCase().includes(query) ||
          (recipe.description && recipe.description.toLowerCase().includes(query))
        )
      }

      if (selectedDifficulty.value) {
        filtered = filtered.filter(recipe => 
          getRecipeDifficulty(recipe).toLowerCase() === selectedDifficulty.value.toLowerCase()
        )
      }

      return filtered
    })

    
    const loadLikedRecipes = async () => {
      try {
        loading.value = true 
        const response = await api.getLikedRecipes();
        likedRecipes.value = response.likedRecipes.map(convertBackendRecipe);
        console.log('Loaded liked recipes:', likedRecipes.value.length);
      } catch (error) {
        console.error('Failed to load liked recipes:', error);
        
        if (error.message.includes('Must be logged in') || error.message.includes('401')) {
          likedRecipes.value = [];
        }
      } finally {
        loading.value = false 
      }
    }

 
    const toggleLike = async (recipe) => {
      const recipeId = getRecipeId(recipe);
      
      try {
        unlikeLoading.value = recipeId; 
        
        await api.unlikeRecipe(recipeId);
        
      
        likedRecipes.value = likedRecipes.value.filter(r => getRecipeId(r) !== recipeId);
        
        console.log('Recipe unliked:', getRecipeTitle(recipe));
      } catch (error) {
        console.error('Failed to unlike recipe:', error);
        alert('Failed to unlike recipe. Please try again.');
      } finally {
        unlikeLoading.value = null;
      }
    }

    const openRecipe = (recipe) => {
      emit('open-recipe', recipe)
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

    onMounted(() => {
      loadLikedRecipes()
    })

    return {
      likedRecipes,
      loading,
      searchQuery,
      selectedDifficulty,
      unlikeLoading,
      filteredLikedRecipes,
      toggleLike,
      openRecipe,
      goToHome,
      clearFilters,
      formatLikedDate,
      //recipe getters
      getRecipeId,
      getRecipeTitle,
      getRecipeImage,
      getRecipeRating,
      getRecipeLikes,
      getRecipeTime,
      getRecipeDifficulty
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