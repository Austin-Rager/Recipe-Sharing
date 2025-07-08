<template>
  <div class="home-page">
    <!-- nav -->
    <nav class="navbar">
      <div class="nav-content">
        <h1 class="logo">🍳 FlavorCraft</h1>
        <div class="nav-actions">
          <div class="search-bar">
            <input
              type="text"
              placeholder="Search recipes..."
              v-model="searchQuery"
              @input="handleSearch"
            />
            <span class="search-icon">🔍</span>
          </div>
          <button class="nav-btn filters-btn" @click="toggleFilters">
            Filters
          </button>
          <button class="nav-btn saver-btn" @click="showSaved = !showSaved">
            {{ showSaved ? 'All Recipes' : 'Saver' }}
          </button>
          <button class="nav-btn liked-btn" @click="showLiked = !showLiked">
            My All Liked
          </button>
        </div>
      </div>
    </nav>

    <div class="main-content">
      <!-- left side stuff-->
      <div class="recipes-section">
        <!--recipe of the day-->
        <div class="recipe-of-the-day" v-if="recipeOfDay">
          <h2>Recipe of the Day 🌟</h2>
          <div class="featured-card" @click="openRecipe(recipeOfDay)">
            <img :src="recipeOfDay.image" :alt="recipeOfDay.title">
            <div class="featured-content">
              <h3>{{ recipeOfDay.title }}</h3>
              <p>{{ recipeOfDay.description }}</p>
              <div class="featured-meta">
                <div class="rating">
                  <span class="stars">{{ '★'.repeat(Math.floor(recipeOfDay.rating))}} {{ '☆'.repeat(5 - Math.floor(recipeOfDay.rating)) }}</span>
                  <span> {{ recipeOfDay.reviewCount }}</span>
                </div>
                <span class="cook-time">⏱️ {{ recipeOfDay.cookTime }}min</span>
              </div>
            </div>
          </div>
        </div>

        <!--trending part-->
        <div class="trending-section">
          <h2>🔥 Trending</h2>
          <div class="trending-cards">
            <div
              v-for="trending in trendingRecipes"
              :key="trending.id"
              class="trending-card"
              @click="openRecipe(trending)"
            >
              <img :src="trending.image" :alt="trending.title">
              <div class="trending-content">
                <h4>{{ trending.title }}</h4>
              </div>
            </div>
          </div>
        </div>

        <!--recipe grid-->
        <div class="recipes-grid">
          <div
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            class="recipe-card"
            @click="openRecipe(recipe)"
          >
            <div class="card-image">
              <img :src="recipe.image" :alt="recipe.title" />
              <button
                class="like-btn"
                :class="{ liked: recipe.isLiked }"
                @click.stop="toggleLike(recipe)"
              >
                {{ recipe.isLiked ? '❤️' : '🤍' }}
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
            </div>
          </div>
        </div>
      </div>

       <!--right side, filters and stuff-->
       <div class="sidebar" :class="{open: showFilters}">
        <div class="filters-panel">
          <h3>Filters</h3>
            <!--difficulty filter-->
          <div class="filter-group">
            <h4>Difficulty</h4>
            <div class="filter-option">
               <label v-for="level in ['Easy', 'Med', 'Hard']" :key="level">
                <input
                  type="checkbox"
                  :value="level"
                  v-model="selectedDifficulties"
                  @change="applyFilters"
                />
                {{ level }}
              </label>
            </div>
       </div>
       <!--rating filter-->
          <div class="filter-group">
            <h4>Rating</h4>
            <div class="rating-filter">
              <div v-for="rating in [5,4,3,2,1]" :key="rating" class="rating-option">
                <input 
                  type="radio" 
                  :value="rating" 
                  v-model="minRating"
                  @change="applyFilters"
                  name="rating"
                />
                <span class="stars">{{ '★'.repeat(rating) }}{{ '☆'.repeat(5-rating) }}</span>
                <span>& up</span>
              </div>
            </div>
          </div>
        <!--cook time filter-->
        <div class="filter-group">
          <h4>Cook Time</h4>
          <select v-model="maxCookTime" @change="applyFilters">
            <option value="">Any time</option>
            <option value="15">Under 15 min</option>
            <option value="30">Under 30 min</option>
            <option value="60">Under 1 hour</option>
          </select> 
        </div>

        <button class="clear-filters" @click="clearFilters">
          Clear Filters
        </button>
      </div>

    </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// reactive data - update page when it changes 
const searchQuery = ref('')
const showFilters = ref(false) 
const showLiked = ref(false) 
const selectedDifficulties = ref([]) // check boxes difficulty
const minRating = ref('') 
const maxCookTime = ref('') 

// sample recipe data CHANGE!!!!!!!
const recipes = ref([
 {
   id: 1,
   title: "creamy garlic pasta",
   description: "a rich and creamy pasta dish with roasted garlic and fresh herbs",
   image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400",
   rating: 4.8,
   reviewCount: 245,
   cookTime: 25,
   difficulty: "easy",
   isLiked: false
 },
 {
   id: 2,
   title: "chocolate chip cookies",
   description: "classic homemade cookies that everyone loves",
   image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300",
   rating: 4.6,
   reviewCount: 189,
   cookTime: 20,
   difficulty: "easy",
   isLiked: false
 },
 {
   id: 3,
   title: "beef bourguignon",
   description: "french classic slow-cooked beef in red wine sauce",
   image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=300",
   rating: 4.9,
   reviewCount: 156,
   cookTime: 180,
   difficulty: "hard",
   isLiked: true
 },
 {
   id: 4,
   title: "caesar salad",
   description: "fresh romaine with homemade dressing",
   image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300",
   rating: 4.3,
   reviewCount: 98,
   cookTime: 15,
   difficulty: "easy",
   isLiked: false
 },
 {
   id: 5,
   title: "salmon teriyaki",
   description: "grilled salmon with sweet and savory teriyaki glaze",
   image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300",
   rating: 4.7,
   reviewCount: 203,
   cookTime: 30,
   difficulty: "med",
   isLiked: true
 },
 {
   id: 6,
   title: "vegetable stir fry",
   description: "quick and healthy vegetable medley",
   image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300",
   rating: 3.2,
   reviewCount: 124,
   cookTime: 12,
   difficulty: "easy",
   isLiked: false
 },
 {
   id: 7,
   title: "lobster thermidor",
   description: "luxurious lobster in creamy brandy sauce",
   image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300",
   rating: 5.0,
   reviewCount: 87,
   cookTime: 45,
   difficulty: "hard",
   isLiked: false
 },
 {
   id: 8,
   title: "homemade pizza margherita",
   description: "wood-fired style pizza with fresh basil and mozzarella",
   image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300",
   rating: 4.4,
   reviewCount: 312,
   cookTime: 35,
   difficulty: "med",
   isLiked: true
 }
])

//radom selected 
const recipeOfDay = ref(null)


const trendingRecipes = ref([
 {
   id: 9,
   title: "air fryer wings",
   image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=200"
 },
 {
   id: 10,
   title: "banana bread",
   image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=200"
 }
])


// filter recipes 4= stars
const highRatedRecipes = computed(() => {
 return recipes.value.filter(recipe => recipe.rating >= 4.0)
})


const filteredRecipes = computed(() => {
 let filtered = recipes.value.filter(recipe => recipe.id !== recipeOfDay.value?.id)
 if (searchQuery.value) {
   filtered = filtered.filter(recipe => 
     recipe.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
     recipe.description.toLowerCase().includes(searchQuery.value.toLowerCase())
   )
 }

//filters 

 if (showLiked.value) {
   filtered = filtered.filter(recipe => recipe.isLiked)
 }

 if (selectedDifficulties.value.length > 0) {
   filtered = filtered.filter(recipe => 
     selectedDifficulties.value.includes(recipe.difficulty)
   )
 }

 if (minRating.value) {
   filtered = filtered.filter(recipe => recipe.rating >= minRating.value)
 }

 if (maxCookTime.value) {
   filtered = filtered.filter(recipe => recipe.cookTime <= parseInt(maxCookTime.value))
 }

 return filtered
})

//rndom pick
function selectRandomRecipeOfDay() {
 const eligibleRecipes = highRatedRecipes.value
 if (eligibleRecipes.length > 0) {
   const randomIndex = Math.floor(Math.random() * eligibleRecipes.length)
   recipeOfDay.value = { ...eligibleRecipes[randomIndex] }
   console.log(`selected recipe of the day: ${recipeOfDay.value.title} (${recipeOfDay.value.rating})`)
 }
}


function toggleFilters() {
 showFilters.value = !showFilters.value
}


function handleSearch() {
}

function applyFilters() {

}

function clearFilters() {
 selectedDifficulties.value = []
 minRating.value = ''
 maxCookTime.value = ''
 searchQuery.value = ''
}

// toggle like/unlike 
function toggleLike(recipe) {
 recipe.isLiked = !recipe.isLiked
 //TO DO: SAVE TO BACKEND API
 console.log(`${recipe.isLiked ? 'liked' : 'unliked'} recipe: ${recipe.title}`)
}


function openRecipe(recipe) {
 alert(`opening recipe: ${recipe.title}`)
 // TO DO: USE ROUTER TO NAVIGATE
}

//check if refresh needed
function shouldRefreshRecipeOfDay() {
 const today = new Date().toDateString()
 const lastRefresh = localStorage.getItem('lastRecipeOfDayRefresh')
 return !lastRefresh || lastRefresh !== today
}

//save date
function updateLastRefreshDate() {
 const today = new Date().toDateString()
 localStorage.setItem('lastRecipeOfDayRefresh', today)
}


onMounted(() => {
 console.log('home page loaded')
 
 if (shouldRefreshRecipeOfDay()) {
   selectRandomRecipeOfDay()
   updateLastRefreshDate()
 } else {
   const savedRecipeOfDay = localStorage.getItem('currentRecipeOfDay')
   if (savedRecipeOfDay) {
     const savedRecipe = JSON.parse(savedRecipeOfDay)
    //makes sure still exists
     const existingRecipe = recipes.value.find(r => r.id === savedRecipe.id && r.rating >= 4.0)
     if (existingRecipe) {
       recipeOfDay.value = existingRecipe
     } else {
       selectRandomRecipeOfDay()
       updateLastRefreshDate()
     }
   } else {
     selectRandomRecipeOfDay()
     updateLastRefreshDate()
   }
 }
 
 // save recipe of the day
 if (recipeOfDay.value) {
   localStorage.setItem('currentRecipeOfDay', JSON.stringify(recipeOfDay.value))
 }
})
</script>

<style>


/* Reset and Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--background-secondary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Main Container */
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* NAVIGATION STYLES */
.navbar {
  background: var(--background-primary);
  border-bottom: 1px solid var(--background-tertiary);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
  letter-spacing: -0.025em;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.search-bar {
  position: relative;
  min-width: 300px;
}

.search-bar input {
  width: 100%;
  padding: var(--space-3) var(--space-12) var(--space-3) var(--space-4);
  border: 2px solid var(--background-tertiary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  background: var(--background-primary);
  transition: all var(--transition-fast);
  outline: none;
}

.search-bar input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.search-bar input::placeholder {
  color: var(--text-muted);
}

.search-icon {
  position: absolute;
  right: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: var(--font-size-lg);
}

.nav-btn {
  padding: var(--space-3) var(--space-6);
  border: 2px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.nav-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.nav-btn:active {
  transform: translateY(0);
}

/* MAIN CONTENT LAYOUT */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-8);
  align-items: start;
}

.recipes-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* RECIPE OF THE DAY STYLES */
.recipe-of-day h2 {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.featured-card {
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 200px;
  border: 1px solid var(--background-tertiary);
}

.featured-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.featured-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: linear-gradient(45deg, #f0f4f8, #d6e1ea);
}

.featured-content {
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.featured-content h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  line-height: 1.3;
}

.featured-content p {
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  font-size: var(--font-size-base);
  line-height: 1.5;
}

.featured-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
}

.stars {
  color: #fbbf24;
  font-size: var(--font-size-lg);
}

.cook-time {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

/* TRENDING SECTION STYLES */
.trending-section h2 {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.trending-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
}

.trending-card {
  background: var(--background-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--background-tertiary);
}

.trending-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.trending-card img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  background: linear-gradient(45deg, #f0f4f8, #d6e1ea);
}

.trending-content {
  padding: var(--space-4);
}

.trending-content h4 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* RECIPE GRID STYLES */
.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
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
  transform: translateY(-6px);
  box-shadow: var(--shadow-xl);
}

.card-image {
  position: relative;
  height: 220px;
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
  transform: scale(1.05);
}

.like-btn {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: var(--radius-full);
  width: 44px;
  height: 44px;
  cursor: pointer;
  font-size: var(--font-size-lg);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-md);
}

.like-btn:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: var(--shadow-lg);
}

.like-btn.liked {
  background: var(--primary-light);
  color: var(--primary-color);
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

/* SIDEBAR STYLES */
.sidebar {
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  height: fit-content;
  position: sticky;
  top: 120px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--background-tertiary);
}

.filters-panel h3 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-6);
}

.filter-group {
  margin-bottom: var(--space-8);
}

.filter-group:last-child {
  margin-bottom: var(--space-6);
}

.filter-group h4 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.filter-options label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.filter-options label:hover {
  background: var(--background-secondary);
}

.filter-options input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.rating-filter {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.rating-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.rating-option:hover {
  background: var(--background-secondary);
}

.rating-option input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.filter-group select {
  width: 100%;
  padding: var(--space-3);
  border: 2px solid var(--background-tertiary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--background-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.filter-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.clear-filters {
  width: 100%;
  padding: var(--space-3);
  background: var(--background-secondary);
  border: 2px solid var(--background-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.clear-filters:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
  border-color: var(--primary-color);
}

/* RESPONSIVE DESIGN */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: var(--space-6);
    padding: var(--space-6) var(--space-4);
  }
  
  .sidebar {
    position: static;
    order: -1;
  }
  
  .search-bar {
    min-width: 250px;
  }
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
  }
  
  .nav-actions {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--space-3);
  }
  
  .search-bar {
    min-width: 100%;
    max-width: 100%;
  }
  
  .featured-card {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  
  .featured-card img {
    height: 240px;
  }
  
  .recipes-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-4);
  }
  
  .trending-cards {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-4);
  }
  
  .sidebar {
    padding: var(--space-6);
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: var(--space-4) var(--space-3);
  }
  
  .recipes-grid {
    grid-template-columns: 1fr;
  }
  
  .trending-cards {
    grid-template-columns: 1fr;
  }
  
  .featured-content {
    padding: var(--space-6);
  }
  
  .card-content {
    padding: var(--space-4);
  }
}

/* LOADING STATES AND ANIMATIONS */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.recipe-card,
.trending-card,
.featured-card {
  animation: fadeInUp var(--transition-slow) ease-out;
}

/* ACCESSIBILITY IMPROVEMENTS */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* FOCUS STATES FOR ACCESSIBILITY */
.recipe-card:focus,
.trending-card:focus,
.featured-card:focus,
.nav-btn:focus,
.like-btn:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* HIGH CONTRAST MODE SUPPORT */
@media (prefers-contrast: high) {
  :root {
    --text-primary: #000000;
    --text-secondary: #333333;
    --background-primary: #ffffff;
    --background-secondary: #f0f0f0;
    --primary-color: #0066cc;
  }
}
</style>

