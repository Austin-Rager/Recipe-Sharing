<!--FIX TRENDING AND RECIPE OF THE DAY!!!!!!!!-->
<template>
  <div class="home-page">
    <nav class="navbar">
        <div class="nav-content">
          <h1 class="logo">🍳 FlavorCraft</h1>
          
          <div class="nav-center">
            <div class="search-bar">
              <input
                type="text"
                placeholder="Search recipes..."
                v-model="searchQuery"
                @input="handleSearch"
              />
              <span class="search-icon">🔍</span>
            </div>
          </div>
          
          <div class="nav-actions">
            <div class="nav-buttons">
              <button class="nav-btn home-btn" @click="goToHome">
                Home
              </button>
              <button class="nav-btn liked-btn" @click="showLiked = !showLiked">
                My Liked
              </button>
              <button class="nav-btn create-btn" @click="goToCreateRecipe">
                Create Recipe
              </button>
            </div>

            <div class="profile-section" v-if="currentUser">
              <div class="profile-menu" @click="toggleProfileMenu">
                <div class="profile-avatar">
                  <span class="profile-icon">👤</span>
                </div>
                <span class="profile-name">{{ currentUser.name || 'User' }}</span>
                <span class="dropdown-arrow">▼</span>
              </div>

              <div class="profile-dropdown" v-if="showProfileMenu">
                <div class="profile-dropdown-header">
                  <div class="profile-avatar-large">
                    <span class="profile-icon-large">👤</span>
                  </div>
                  <div class="profile-info">
                    <h4>{{ currentUser.name || 'User' }}</h4>
                    <p>{{ currentUser.email || 'user@example.com' }}</p>
                  </div>
                </div>
                <div class="profile-dropdown-menu">
                  <button class="dropdown-item" @click="goToProfile">
                    My Profile
                  </button>
                  <button class="dropdown-item" @click="goToLikedRecipes">
                    Liked Recipes
                  </button>
                  <button class="dropdown-item" @click="goToMyRecipes">
                    My Recipes
                  </button>
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item logout" @click="logout">
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="profile-loading">
              <div class="loading-spinner">⟳</div>
            </div>
          </div>
        </div>
      </nav>


    <LikedPage v-if="showLiked" @go-home="goToHome" />
  
    <div v-else>
      <div class="main-content">
        <div class="recipes-section">
          <!-- Recipe of the Day -->
          <div class="recipe-of-day" v-if="recipeOfDay">
            <h2>Recipe of the Day 🌟</h2>
            <div class="featured-card" @click="openRecipe(recipeOfDay)">
              <img :src="recipeOfDay.image" :alt="recipeOfDay.title">
              <div class="featured-content">
                <h3>{{ recipeOfDay.title }}</h3>
                <p>{{ recipeOfDay.description }}</p>
                <div class="featured-meta">
                  <div class="rating">
                    <span class="stars">{{ '★'.repeat(Math.floor(recipeOfDay.rating)) }}{{ '☆'.repeat(5 - Math.floor(recipeOfDay.rating)) }}</span>
                    <span>({{ recipeOfDay.reviewCount }})</span>
                  </div>
                  <span class="cook-time">⏱️ {{ recipeOfDay.cookTime }}min</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Trending Section -->
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
        
        <div class="sidebar" :class="{open: showFilters}">
          <div class="filters-panel">
            <h3>Filters</h3>
            
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import LikedPage from './components/LikedPage.vue';

const searchQuery = ref('')
const showFilters = ref(false) 
const showLiked = ref(false) 
const selectedDifficulties = ref([])
const minRating = ref('') 
const maxCookTime = ref('') 

const showProfileMenu = ref(false)
const currentUser = ref({
  name: 'Julia Souza',
  email: 'julia@flavorcraft.com'
})

// Recipe of the Day and Trending Logic
const recipeOfDay = computed(() => {
  // Get the highest rated recipe as recipe of the day
  return recipes.value.reduce((best, current) => 
    current.rating > best.rating ? current : best
  )
})

const trendingRecipes = computed(() => {
  // Get top 3 recipes by rating, excluding the recipe of the day
  return recipes.value
    .filter(recipe => recipe.id !== recipeOfDay.value?.id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
})

//SAMPLE DATA!!!!
const recipes = ref([
 {
   id: 1,
   title: "creamy garlic pasta",
   description: "a rich and creamy pasta dish with roasted garlic and fresh herbs",
   image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400",
   rating: 4.8,
   reviewCount: 245,
   cookTime: 25,
   difficulty: "Easy", //has to be capitalized
 },
 {
   id: 2,
   title: "chocolate chip cookies",
   description: "classic homemade cookies that everyone loves",
   image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300",
   rating: 4.6,
   reviewCount: 189,
   cookTime: 20,
   difficulty: "Easy", 
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
   difficulty: "Hard", 
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
   difficulty: "Easy", 
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
   difficulty: "Med", 
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
   difficulty: "Easy",
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
   difficulty: "Hard", 
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
   difficulty: "Med", 
   isLiked: true
 }
])

const filteredRecipes = computed(() => {
 let filtered = recipes.value

 if (searchQuery.value) {
   filtered = filtered.filter(recipe => 
     recipe.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
     recipe.description.toLowerCase().includes(searchQuery.value.toLowerCase())
   )
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

function toggleLike(recipe) {
 recipe.isLiked = !recipe.isLiked
 

 const likedRecipes = recipes.value.filter(r => r.isLiked).map(r => ({
   ...r,
   likedAt: new Date().toISOString()
 }))
 localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes))
 
 console.log(`${recipe.isLiked ? 'liked' : 'unliked'} recipe: ${recipe.title}`)
}

function openRecipe(recipe) {
 alert(`opening recipe: ${recipe.title}`)
}

function goToHome() {
 window.scrollTo({ top: 0, behavior: 'smooth' })
 showLiked.value = false
 clearFilters() 
 console.log('going to home page')
}

function goToCreateRecipe() {
 alert('create recipe page - backend not ready yet!')
 console.log('going to create recipe page')
}

function toggleProfileMenu() {
 showProfileMenu.value = !showProfileMenu.value
}

function goToProfile() {
 showProfileMenu.value = false
 alert('profile page - backend not ready yet!')
 console.log('going to profile page')
}

function goToLikedRecipes() {
 showProfileMenu.value = false
 showLiked.value = true
 window.scrollTo({ top: 0, behavior: 'smooth' })
 console.log('showing liked recipes')
}

function goToMyRecipes() {
 showProfileMenu.value = false
 alert('my recipes page - backend not ready yet!')
 console.log('going to my recipes page')
}

function goToSettings() {
 showProfileMenu.value = false
 alert('settings page - backend not ready yet!')
 console.log('going to settings page')
}

function logout() {
 showProfileMenu.value = false
 
 if (confirm('are you sure you want to logout?')) {
   alert('logout functionality - backend not ready yet!')
   console.log('logging out...')
 }
}

function handleClickOutside(event) {
 const profileSection = document.querySelector('.profile-section')
 if (profileSection && !profileSection.contains(event.target)) {
   showProfileMenu.value = false
 }
}

onMounted(() => {
 console.log('home page loaded')
 document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
 document.removeEventListener('click', handleClickOutside)
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
}

/* Main Container */
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* ===== NAVIGATION STYLES ===== */
.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-6);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-8);
}

.logo {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: -0.025em;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Search Bar */
.nav-center {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.search-bar {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-bar input {
  width: 100%;
  padding: var(--space-3) var(--space-12) var(--space-3) var(--space-4);
  border: 2px solid var(--background-tertiary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  background: var(--background-primary);
  outline: none;
  box-shadow: var(--shadow-sm);
  transition: border-color var(--transition-fast);
}

.search-bar input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.1);
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

/* Navigation Actions */
.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.nav-buttons {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.nav-btn {
  padding: var(--space-3) var(--space-6);
  border: 2px solid transparent;
  background: var(--background-secondary);
  color: var(--text-primary);
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.nav-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.home-btn,
.liked-btn {
  background: var(--primary-color);
  color: white;
}

.create-btn {
  background: var(--success-color);
  color: white;
}

/* ===== PROFILE SECTION ===== */
.profile-section {
  position: relative;
  margin-left: var(--space-4);
}

.profile-menu {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  cursor: pointer;
  background: var(--background-primary);
  border: 2px solid var(--background-tertiary);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.profile-menu:hover {
  background: var(--background-secondary);
  border-color: var(--primary-color);
}

.profile-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-base);
}

.profile-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.dropdown-arrow {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.profile-menu:hover .dropdown-arrow {
  transform: rotate(180deg);
}

/* Profile Dropdown */
.profile-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  background: var(--background-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--background-tertiary);
  min-width: 280px;
  z-index: 1000;
}

.profile-dropdown-header {
  padding: var(--space-6);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: white;
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.profile-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.profile-info h4 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--space-1);
}

.profile-info p {
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.dropdown-item {
  width: 100%;
  padding: var(--space-3) var(--space-6);
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  transition: background-color var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--background-secondary);
}

.dropdown-item.logout {
  color: var(--danger-color);
}

/* ===== MAIN CONTENT LAYOUT ===== */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-8);
}

.recipes-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* ===== RECIPE CARDS ===== */
.recipe-of-day h2,
.trending-section h2 {
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
  box-shadow: var(--shadow-xl);
  cursor: pointer;
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 200px;
  border: 1px solid var(--background-tertiary);
  transition: transform var(--transition-normal);
}

.featured-card:hover {
  transform: translateY(-4px);
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
  margin-bottom: var(--space-3);
}

.featured-content p {
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
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

/* Trending Cards */
.trending-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
}

.trending-card {
  background: var(--background-primary);
  border-radius: var(--radius-xl);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--background-tertiary);
  transition: transform var(--transition-normal);
}

.trending-card:hover {
  transform: translateY(-2px);
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
}

/* Recipe Grid */
.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
}

.recipe-card {
  background: var(--background-primary);
  border-radius: var(--radius-xl);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--background-tertiary);
  transition: transform var(--transition-normal);
}

.recipe-card:hover {
  transform: translateY(-6px);
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
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-fast);
}

.like-btn:hover {
  transform: scale(1.1);
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
  margin-bottom: var(--space-3);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.difficulty {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
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

/* ===== SIDEBAR ===== */
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
  margin-bottom: var(--space-6);
}

.filter-group {
  margin-bottom: var(--space-8);
}

.filter-group h4 {
  font-size: var(--font-size-base);
  font-weight: 600;
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
  padding: var(--space-3);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.filter-options label:hover {
  background: var(--background-secondary);
}

.filter-options input[type="checkbox"],
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
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.filter-group select:focus {
  outline: none;
  border-color: var(--primary-color);
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
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1200px) {
  .nav-content {
    gap: var(--space-6);
  }
}

@media (max-width: 1024px) {
  .nav-content {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    text-align: center;
  }
  
  .main-content {
    grid-template-columns: 1fr;
    gap: var(--space-6);
    padding: var(--space-6) var(--space-4);
  }
  
  .sidebar {
    position: static;
    order: -1;
  }
}

@media (max-width: 768px) {
  .nav-content {
    padding: var(--space-4);
  }
  
  .nav-buttons {
    gap: var(--space-2);
  }
  
  .nav-btn {
    padding: var(--space-2) var(--space-4);
    font-size: var(--font-size-xs);
  }
  
  .profile-name {
    display: none;
  }
  
  .featured-card {
    grid-template-columns: 1fr;
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
}

@media (max-width: 480px) {
  .main-content {
    padding: var(--space-4) var(--space-3);
  }
  
  .recipes-grid,
  .trending-cards {
    grid-template-columns: 1fr;
  }
  
  .featured-content {
    padding: var(--space-6);
  }
  
  .card-content {
    padding: var(--space-4);
  }
  
  .profile-dropdown {
    min-width: 240px;
    right: -20px;
  }
}

/* ===== ACCESSIBILITY ===== */
.recipe-card:focus,
.trending-card:focus,
.featured-card:focus,
.nav-btn:focus,
.like-btn:focus,
.profile-menu:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
</style>
