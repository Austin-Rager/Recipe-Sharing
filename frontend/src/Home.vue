<template>
 <div class="home-page">
<!-- FIX HEART FULL -->
   <div v-if="showConfirmDialog" class="confirm-overlay" @click.self="cancelConfirm">
     <div class="confirm-modal">
       <i :data-lucide="confirmDialog.icon" class="confirm-icon-lucide"></i>
       <h3 class="confirm-title">{{ confirmDialog.title }}</h3>
       <p class="confirm-message">{{ confirmDialog.message }}</p>
       <div class="confirm-actions">
         <button @click="cancelConfirm" class="btn-secondary">
           {{ confirmDialog.cancelText }}
         </button>
         <button @click="confirmAction" class="btn-danger">
           {{ confirmDialog.confirmText }}
         </button>
       </div>
     </div>
   </div>

   <div v-if="notification.show" class="notification-overlay">
     <div :class="['notification', `notification-${notification.type}`]">
       <i :data-lucide="notification.icon" class="notification-icon-lucide"></i>
       <div class="notification-content">
         <div v-if="notification.title" class="notification-title">{{ notification.title }}</div>
         <div class="notification-message">{{ notification.message }}</div>
       </div>
       <button class="notification-close" @click="hideNotification">✕</button>
     </div>
   </div>

   <Register 
     v-if="showLoginPage"
     :showBackButton="true"
     @login-success="handleLoginFromRegister"
     @go-back="goBackToHome"
   />

   <div v-else class="main-app">
     <nav class="navbar">
       <div class="nav-content">
         <h1 class="logo">
           <i data-lucide="chef-hat" class="logo-icon"></i>
           FlavorCraft
         </h1>

         <div class="nav-center">
           <div class="search-bar">
             <input
               type="text"
               placeholder="Search recipes..."
               v-model="searchQuery"
               @keyup.enter="performSearch"
             />
             <i data-lucide="search" class="search-icon"></i>
           </div>
         </div>

         <div class="nav-actions">
           <div class="nav-buttons">
             <button class="nav-btn home-btn" @click="goToHome">
               Home
             </button>
             <template v-if="isLoggedIn">
               <button class="nav-btn liked-btn" @click="goToLikedRecipes">
                 My Liked
               </button>
               <button class="nav-btn create-btn" @click="goToCreateRecipe">
                 Create Recipe
               </button>
             </template>
           </div>

           <div class="profile-section" v-if="isLoggedIn && currentUser">
             <div class="profile-menu" @click="toggleProfileMenu">
               <div class="profile-avatar">
                 <img
                   v-if="avatarUrl"
                   :src="avatarUrl"
                   alt="User avatar"
                   class="profile-avatar-img"
                   loading="lazy"
                 />
                 <i v-else data-lucide="user" class="profile-icon"></i>
               </div>
               <span class="profile-name">{{ currentUser.name || currentUser.username || 'User' }}</span>
               <i data-lucide="chevron-down" class="dropdown-arrow"></i>
             </div>

             <div class="profile-dropdown" v-if="showProfileMenu">
               <div class="profile-dropdown-header">
                 <div class="profile-avatar-large">
                   <img
                     v-if="avatarUrl"
                     :src="avatarUrl"
                     alt="User avatar"
                     class="profile-avatar-img-large"
                     loading="lazy"
                   />
                   <i v-else data-lucide="user" class="profile-icon-large"></i>
                 </div>
                 <div class="profile-info">
                   <h4>{{ currentUser.name || currentUser.username || 'User' }}</h4>
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
                 <div class="dropdown-divider"></div>
                 <button class="dropdown-item logout" @click="showLogoutConfirm">
                   Logout
                 </button>
               </div>
             </div>
           </div>

           <div v-else class="auth-buttons">
             <button class="nav-btn login-btn" @click="showLogin">
               Login
             </button>
             <button class="nav-btn register-btn" @click="showRegister">
               Register
             </button>
           </div>
         </div>
       </div>
     </nav>

     <div class="main-content-area">
       <div v-if="isLoadingInitial" class="loading-overlay">
         <div class="loading-content">
           <i data-lucide="chef-hat" class="loading-spinner"></i>
           <div class="loading-text">Loading recipes...</div>
         </div>
       </div>

       <div v-else-if="apiError" class="error-overlay" @click.self="closeError">
         <div class="error-modal">
           <i data-lucide="alert-triangle" class="error-icon"></i>
           <h3 class="error-title">Connection Error</h3>
           <p class="error-message">{{ apiError }}</p>
           <p class="error-message">Don't worry! We're showing sample recipes so you can still browse.</p>
           <div class="error-actions">
             <button @click="retryConnection" class="btn-primary">
               <i data-lucide="refresh-cw" class="btn-icon"></i>
               Try Again
             </button>
             <button @click="closeError" class="btn-secondary">
               <i data-lucide="book-open" class="btn-icon"></i>
               Browse Samples
             </button>
           </div>
         </div>
       </div>

       <LikedPage 
         v-else-if="showLiked && isLoggedIn" 
         @go-home="goToHome" 
         @open-recipe="openRecipe"
       />
       
        <ProfilePage 
          v-else-if="showProfile && isLoggedIn" 
          @go-home="goToHome" 
          @go-to-create="goToCreateRecipe"
          @go-to-edit="handleEditRecipe"  
        />

       <MyRecipesPage 
         v-else-if="showMyRecipes && isLoggedIn" 
         @go-home="goToHome" 
         @recipe-selected="openRecipe"
       />

       <CreateRecipePage 
         v-else-if="showCreateRecipe && isLoggedIn"
         @go-home="goToHome"
         @recipe-created="handleRecipeCreated"
       />

    <EditRecipePage 
      v-else-if="showEditRecipe && recipeToEdit"
      :recipe-id="recipeToEdit"
      @go-home="goToHome"
      @recipe-updated="handleRecipeUpdated"
      @recipe-deleted="handleRecipeDeleted"
    />

    <RecipeDetails 
      v-else-if="showRecipeDetails && selectedRecipe"
      :recipe-data="selectedRecipe"
      @go-home="goToHome"
    />

       <div v-else>
         <div class="main-content">
           <div class="recipes-section">
             <div class="recipe-of-day" v-if="recipeOfDay && !isSearchActive">
               <h2>
                 <i data-lucide="award" class="section-icon"></i>
                 Recipe of the Day
               </h2>
               <div class="featured-card" @click="openRecipe(recipeOfDay)">
                 <img :src="getRecipeImage(recipeOfDay)" :alt="getRecipeTitle(recipeOfDay)">
                 <div class="featured-content">
                   <h3>{{ getRecipeTitle(recipeOfDay) }}</h3>
                   <p>{{ getRecipeDescription(recipeOfDay) }}</p>
                   <div class="featured-meta">
                     <div class="rating">
                       <span class="stars">{{ '★'.repeat(Math.floor(getRecipeRating(recipeOfDay))) }}{{ '☆'.repeat(5 - Math.floor(getRecipeRating(recipeOfDay))) }}</span>
                       <span>({{ getRecipeLikes(recipeOfDay) }})</span>
                     </div>
                     <span class="cook-time">
                       <i data-lucide="clock" class="time-icon"></i>
                       {{ getRecipeTime(recipeOfDay) }}
                     </span>
                   </div>
                 </div>
               </div>
             </div>

             <div class="trending-section" v-if="!isSearchActive">
               <h2>
                 <i data-lucide="trending-up" class="section-icon"></i>
                 Trending
               </h2>
               <div class="trending-cards">
                 <div
                   v-for="trending in trendingRecipes"
                   :key="getRecipeId(trending)"
                   class="trending-card"
                   @click="openRecipe(trending)"
                 >
                   <img :src="getRecipeImage(trending)" :alt="getRecipeTitle(trending)">
                   <div class="trending-content">
                     <h4>{{ getRecipeTitle(trending) }}</h4>
                   </div>
                 </div>
               </div>
             </div>

             <div class="search-results-header" v-if="isSearchActive">
               <h2>Search Results for "{{ activeSearchQuery }}" ({{ filteredRecipes.length }} found)</h2>
               <button class="clear-search-btn" @click="clearSearch">
                 <i data-lucide="x" class="btn-icon"></i>
                 Clear Search
               </button>
             </div>

             <div class="recipes-section-header" v-if="!isSearchActive">
               <h2>All Recipes</h2>
             </div>

             <div class="recipes-grid">
               <div
                 v-for="recipe in filteredRecipes"
                 :key="getRecipeId(recipe)"
                 class="recipe-card"
                 @click="openRecipe(recipe)"
               >
                 <div class="card-image">
                   <img :src="getRecipeImage(recipe)" :alt="getRecipeTitle(recipe)" />
                   <button
                     v-if="isLoggedIn"
                     class="like-btn"
                     :class="{ liked: isRecipeLiked(recipe) }"
                     @click.stop="toggleLike(recipe)"
                   >
                     <i :data-lucide="isRecipeLiked(recipe) ? 'heart' : 'heart'" 
                        :class="{ 'heart-filled': isRecipeLiked(recipe), 'heart-empty': !isRecipeLiked(recipe) }"
                        class="heart-icon"></i>
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
                 </div>
               </div>
             </div>

             <div class="no-search-results" v-if="isSearchActive && filteredRecipes.length === 0">
               <i data-lucide="search" class="no-results-icon"></i>
               <h3>No recipes found</h3>
               <p>Try searching for something else or check your spelling</p>
               <button class="clear-search-btn" @click="clearSearch">
                 Clear Search
               </button>
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
                <div class="star-rating-filter">
                  <div class="interactive-stars">
                    <span 
                      v-for="star in 5" 
                      :key="star"
                      class="star-interactive"
                      :class="{ 
                        'star-filled': star <= minRating, 
                        'star-hover': star <= hoverRating 
                      }"
                      @click="selectRating(star)"
                      @mouseenter="hoverRating = star"
                      @mouseleave="hoverRating = 0"
                    >
                      ★
                    </span>
                    <button 
                      v-if="minRating > 0" 
                      class="clear-rating-btn" 
                      @click="clearRating"
                      title="Clear rating filter"
                    >
                      ✕
                    </button>
                  </div>
                  <span v-if="minRating > 0" class="rating-text">
                    {{ minRating }} star{{ minRating > 1 ? 's' : '' }} & up
                  </span>
                  <span v-else class="rating-text">
                    Click to filter by rating
                  </span>
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
   </div>
 </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import LikedPage from './components/LikedPage.vue';
import ProfilePage from './components/MyProfile.vue';
import CreateRecipePage from './components/CreateRecipe.vue';
import EditRecipePage from './components/EditRecipe.vue';
import MyRecipesPage from './components/MyRecipes.vue';
import Register from './components/Register.vue';
import RecipeDetails from './components/RecipeDetails.vue';

function handleRecipeUpdated(updatedRecipe) {
  const recipeId = getRecipeId(updatedRecipe);
  const index = apiRecipes.value.findIndex(r => getRecipeId(r) === recipeId);
  if (index !== -1) {
    apiRecipes.value[index] = convertBackendRecipe(updatedRecipe);
  } else {
    apiRecipes.value.unshift(convertBackendRecipe(updatedRecipe));
  }

  setTimeout(() => {
    showNotification('success', `"${getRecipeTitle(updatedRecipe)}" has been updated successfully!`, 'Recipe Updated');
  }, 100);

  goToHome();
}

function reinitializeIcons() {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons();
      console.log('Icons reinitialized');
    }
  }, 50);
}

const API_BASE_URL = 'http://localhost:8080';

const hoverRating = ref(0)
const searchQuery = ref('')
const activeSearchQuery = ref('') 
const showFilters = ref(false) 
const showLiked = ref(false) 
const showProfile = ref(false)
const showCreateRecipe = ref(false)
const showEditRecipe = ref(false)
const recipeToEdit = ref(null)
const showLoginPage = ref(false)
const showRecipeDetails = ref(false)
const showMyRecipes = ref(false)
const selectedRecipe = ref(null)
const selectedDifficulties = ref([])
const minRating = ref('') 
const maxCookTime = ref('') 
const showProfileMenu = ref(false)

const isLoggedIn = ref(false)
const currentUser = ref(null)
const isLoadingInitial = ref(true)
const apiError = ref('')

const apiRecipes = ref([])
const likedRecipeIds = ref(new Set())

const showConfirmDialog = ref(false)
const confirmDialog = ref({
  title: '',
  message: '',
  icon: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  onConfirm: null
})

const notification = ref({
  show: false,
  type: 'info', 
  title: '',
  message: '',
  icon: ''
})

function showStyledConfirm(options) {
  confirmDialog.value = {
    title: options.title || 'Confirm Action',
    message: options.message || 'Are you sure?',
    icon: options.icon || 'help-circle',
    confirmText: options.confirmText || 'Confirm',
    cancelText: options.cancelText || 'Cancel',
    onConfirm: options.onConfirm || (() => {})
  }
  showConfirmDialog.value = true
  
  reinitializeIcons();
}

function selectRating(rating) {
  minRating.value = rating
  applyFilters()
}

function clearRating() {
  minRating.value = ''
  hoverRating.value = 0
  applyFilters()

}

function confirmAction() {
  if (confirmDialog.value.onConfirm) {
    confirmDialog.value.onConfirm()
  }
  showConfirmDialog.value = false
}

function cancelConfirm() {
  showConfirmDialog.value = false
}



function showNotification(type, message, title = '') {
  const iconMap = {
    success: 'check-circle',
    error: 'alert-triangle',
    warning: 'alert-triangle',
    info: 'info'
  }
  
  notification.value = {
    show: true,
    type,
    title,
    message,
    icon: iconMap[type] || 'chef-hat'
  }
  
  reinitializeIcons();
  
  setTimeout(() => {
    hideNotification()
  }, 5000)
}

function hideNotification() {
  notification.value.show = false
}

const api = {
 
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}: Unknown error`);
      }
      return data;
    } else {
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}: Non-JSON response`);
      }
      return { success: true };
    }
  } catch (error) {
    console.error(`Request failed for ${endpoint}:`, error);
    throw error; // Re-throw to allow calling function to handle
  }
}

 },

 async getAllRecipes() {
   return this.request('/recipes');
 },

 async getRecipeById(id) {
   return this.request(`/recipe/${id}`);
 },

 async getLikedRecipes() {
   return this.request('/user/liked-recipes');
 },

 async likeRecipe(id) {
   return this.request(`/recipe/${id}/like`, { method: 'POST' });
 },

 async unlikeRecipe(id) {
   return this.request(`/recipe/${id}/like`, { method: 'DELETE' });
 },

 async getUserInfo() {
   return this.request('/me');
 },

 async logout() {
   return this.request('/logout', { method: 'GET' });
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
    images: backendRecipe.images || [],
    rating: backendRecipe.rating || 4.0,
    reviewCount: backendRecipe.likes || 0,
    cookTime: parseTime(backendRecipe.time),
    difficulty: mapDifficulty(backendRecipe.difficulty),
    isLiked: false, 
    creator: backendRecipe.creator,
    ingredients: backendRecipe.ingredients,
    instructions: backendRecipe.instructions,
    _original: backendRecipe
  };
}

function closeError() {
  apiError.value = '';
}

function handleEditRecipe(recipe) {
  console.log('🚀 MAIN COMPONENT: handleEditRecipe called with ID:', recipe);

  const recipeId = recipe.id || recipe._id;

  // Check if the recipe exists in apiRecipes
  const recipeExists = apiRecipes.value.find(r => getRecipeId(r) === recipeId);
  if (!recipeExists) {
    console.error('Recipe not found in local data:', recipeId);
    showNotification('error', 'Recipe not found. It may have been deleted.', 'Recipe Not Found');
    return;
  }

  console.log('🚀 Using recipe ID:', recipeId);

  recipeToEdit.value = recipeId; // Set the recipe ID for EditRecipePage
  showEditRecipe.value = true;
  showProfile.value = false;
  showLiked.value = false;
  showCreateRecipe.value = false;
  showLoginPage.value = false;
  showProfileMenu.value = false;

  console.log('🚀 State after update:', {
    showEditRecipe: showEditRecipe.value,
    showProfile: showProfile.value,
    recipeToEdit: recipeToEdit.value
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
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

const sampleRecipes = [
 {
   id: 'sample-1',
   title: "creamy garlic pasta",
   description: "a rich and creamy pasta dish with roasted garlic and fresh herbs",
   image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400",
   rating: 4.8,
   reviewCount: 245,
   cookTime: 25,
   difficulty: "Easy",
   isLiked: false
 },
 {
   id: 'sample-2',
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
   id: 'sample-3',
   title: "beef bourguignon",
   description: "french classic slow-cooked beef in red wine sauce",
   image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=300",
   rating: 4.9,
   reviewCount: 156,
   cookTime: 180,
   difficulty: "Hard", 
   isLiked: true
 }
];

function getRecipeId(recipe) {
 return recipe.id || recipe._id;
}

function getRecipeTitle(recipe) {
 return recipe.title || recipe.name;
}

function getRecipeDescription(recipe) {
 return recipe.description || "Delicious recipe";
}

function getRecipeImage(recipe) {
  if (recipe.image) return recipe.image;
  if (recipe.images?.length > 0) return recipe.images[0].url;
  console.log("image loaded")
  return "../assets/fork-plate-knife.svg"; 
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

function isRecipeLiked(recipe) {
 const id = getRecipeId(recipe);
 return likedRecipeIds.value.has(id);
}

const recipes = computed(() => {
 return apiRecipes.value.length > 0 ? apiRecipes.value : sampleRecipes;
});

const avatarUrl = computed(() => {
 if (!currentUser.value) return '';
 const seed = currentUser.value.name || currentUser.value.username || 'default';
 return `https://api.dicebear.com/9.x/thumbs/png?seed=${encodeURIComponent(seed.toLowerCase().replace(/\s/g, ''))}&size=200`;
});

const recipeOfDay = computed(() => {
 return recipes.value.reduce((best, current) => 
   getRecipeRating(current) > getRecipeRating(best) ? current : best
 );
});

const trendingRecipes = computed(() => {
 return recipes.value
   .filter(recipe => getRecipeId(recipe) !== getRecipeId(recipeOfDay.value))
   .sort((a, b) => getRecipeRating(b) - getRecipeRating(a))
   .slice(0, 3);
});

const filteredRecipes = computed(() => {
 let filtered = recipes.value;

 if (activeSearchQuery.value) {
   filtered = filtered.filter(recipe => 
     getRecipeTitle(recipe).toLowerCase().includes(activeSearchQuery.value.toLowerCase()) ||
     getRecipeDescription(recipe).toLowerCase().includes(activeSearchQuery.value.toLowerCase())
   );
 }

 if (selectedDifficulties.value.length > 0) {
   filtered = filtered.filter(recipe => 
     selectedDifficulties.value.includes(getRecipeDifficulty(recipe))
   );
 }

 if (minRating.value) {
   filtered = filtered.filter(recipe => getRecipeRating(recipe) >= minRating.value);
 }

 if (maxCookTime.value) {
   filtered = filtered.filter(recipe => {
     const cookTime = parseTime(getRecipeTime(recipe));
     return cookTime <= parseInt(maxCookTime.value);
   });
 }

 return filtered;
});

const isSearchActive = computed(() => {
 return activeSearchQuery.value.trim() !== '';
});

async function checkAuthStatus() {
 try {
   const response = await api.getAllRecipes();
   apiRecipes.value = response.recipes.map(convertBackendRecipe);
   
   try {
     const likedResponse = await api.getLikedRecipes();
     const likedIds = new Set(likedResponse.likedRecipes.map(r => r._id));
     likedRecipeIds.value = likedIds;
     
     apiRecipes.value.forEach(recipe => {
       recipe.isLiked = likedIds.has(recipe.id);
     });
     
     isLoggedIn.value = true;
     
     try {
       const userInfo = await api.getUserInfo();
       currentUser.value = userInfo;
       console.log('User logged in:', userInfo);
     } catch (error) {
       console.error('Failed to get user info:', error);
       currentUser.value = { username: 'User', name: 'User', email: 'user@example.com' };
     }
     
   } catch (error) {
     console.log('Not logged in:', error.message);
     isLoggedIn.value = false;
     currentUser.value = null;
   }
   
   apiError.value = '';
 } catch (error) {
   console.error('Failed to load recipes:', error);
   apiError.value = error.message;
   apiRecipes.value = [];
 } finally {
   isLoadingInitial.value = false;
   reinitializeIcons();
 }
}

async function retryConnection() {
 isLoadingInitial.value = true;
 apiError.value = '';
 await checkAuthStatus();
}

async function toggleLike(recipe) {
 if (!isLoggedIn.value) {
   showNotification('warning', 'Please log in to like recipes', 'Login Required');
   return;
 }

 const recipeId = getRecipeId(recipe);
 const wasLiked = isRecipeLiked(recipe);

 try {
   if (wasLiked) {
     await api.unlikeRecipe(recipeId);
     likedRecipeIds.value.delete(recipeId);
     showNotification('info', `Removed "${getRecipeTitle(recipe)}" from favorites`, 'Recipe Unliked');
   } else {
     await api.likeRecipe(recipeId);
     likedRecipeIds.value.add(recipeId);
     showNotification('success', `Added "${getRecipeTitle(recipe)}" to favorites!`, 'Recipe Liked');
   }
   
   recipe.isLiked = !wasLiked;

   if (recipe.reviewCount !== undefined) {
     recipe.reviewCount += wasLiked ? -1 : 1;
   } else if (recipe._original?.likes !== undefined) {
     recipe._original.likes += wasLiked ? -1 : 1;
   }
   
   reinitializeIcons();
   
 } catch (error) {
   console.error('Failed to toggle like:', error);
   showNotification('error', 'Failed to update like status. Please try again.', 'Connection Error');
 }
}

async function openRecipe(recipe) {
  try {
    selectedRecipe.value = recipe;
    showRecipeDetails.value = true;
    showLiked.value = false;
    showProfile.value = false;
    showCreateRecipe.value = false;
    showLoginPage.value = false;
    showMyRecipes.value = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const recipeId = getRecipeId(recipe);
    if (recipeId && !recipe.ingredients) {
      const fullRecipe = await api.getRecipeById(recipeId);
      selectedRecipe.value = convertBackendRecipe(fullRecipe.recipe);
    }
  } catch (error) {
    console.error('Failed to fetch recipe details:', error);
  }
}

function performSearch() {
 activeSearchQuery.value = searchQuery.value.trim();
}

function clearSearch() {
 searchQuery.value = '';
 activeSearchQuery.value = '';
}

function goToHome() {
 window.scrollTo({ top: 0, behavior: 'smooth' });
 showLiked.value = false;
 showProfile.value = false;
 showCreateRecipe.value = false;
 showEditRecipe.value = false;
 showLoginPage.value = false;
 showRecipeDetails.value = false;
 showMyRecipes.value = false;
 showProfileMenu.value = false;
 selectedRecipe.value = null;
 clearFilters();
 
 reinitializeIcons();
}

function goToCreateRecipe() {
 if (!isLoggedIn.value) {
   showNotification('warning', 'Please log in to share your culinary creations', 'Login Required');
   return;
 }
 showCreateRecipe.value = true;
 showLiked.value = false;
 showProfile.value = false;
 showEditRecipe.value = false;
 showLoginPage.value = false;
 showRecipeDetails.value = false;
 showMyRecipes.value = false;
 showProfileMenu.value = false;
 selectedRecipe.value = null;
 window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToLikedRecipes() {
 if (!isLoggedIn.value) {
   showNotification('warning', 'Please log in to view your favorite recipes', 'Login Required');
   return;
 }
 showProfileMenu.value = false;
 showLiked.value = true;
 showProfile.value = false;
 showCreateRecipe.value = false;
 showEditRecipe.value = false;
 showLoginPage.value = false;
 showRecipeDetails.value = false;
 showMyRecipes.value = false;
 selectedRecipe.value = null;
 window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToMyRecipes() {
 if (!isLoggedIn.value) {
   showNotification('warning', 'Please log in to view your recipes', 'Login Required');
   return;
 }
 showProfileMenu.value = false;
 showNotification('info', 'My recipes page - implement this with your existing component!', 'Coming Soon');
}

function goToProfile() {
 if (!isLoggedIn.value) return;
 showProfileMenu.value = false;
 showProfile.value = true;
 showLiked.value = false;
 showCreateRecipe.value = false;
 showEditRecipe.value = false;
 showLoginPage.value = false;
 showRecipeDetails.value = false;
 showMyRecipes.value = false;
 selectedRecipe.value = null;
 window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleProfileMenu() {
 showProfileMenu.value = !showProfileMenu.value;
 if (showProfileMenu.value) {
   reinitializeIcons();
 }
}

function showLogin() {
 showLoginPage.value = true;
}

function showRegister() {
 showLoginPage.value = true;
}

function goBackToHome() {
 showLoginPage.value = false;
 reinitializeIcons();
}

async function handleLoginFromRegister(userData) {
 isLoggedIn.value = true;
 showLoginPage.value = false;
 
 try {
   const userInfo = await api.getUserInfo();
   currentUser.value = userInfo;
   console.log('Got user info:', userInfo);
 } catch (error) {
   console.error('Failed to get user info:', error);
   currentUser.value = {
     username: userData.username,
     name: userData.username,
     email: 'user@example.com'
   };
 }
 
 checkAuthStatus();
 
 reinitializeIcons();
 
 setTimeout(() => {
   showNotification('success', `Welcome back, ${currentUser.value.name || currentUser.value.username}!`, 'Login Successful');
 }, 500);
}

function handleLoginSuccess(userData) {
 isLoggedIn.value = true;
 currentUser.value = userData;
 checkAuthStatus();
}

function showLogoutConfirm() {
 showProfileMenu.value = false;
 
 showStyledConfirm({
   title: 'Confirm Logout',
   message: 'Are you sure you want to logout?',
   icon: 'log-out',
   confirmText: 'Yes, Logout',
   cancelText: 'Stay Logged In',
   onConfirm: performLogout
 });
}

async function performLogout() {
 try {
   await api.logout();
   isLoggedIn.value = false;
   currentUser.value = null;
   likedRecipeIds.value.clear();
   
   await checkAuthStatus();
   
   reinitializeIcons();
   
   showNotification('info', 'Thanks for visiting FlavorCraft! Come back soon!', 'Logged Out');
   goToHome();
 } catch (error) {
   console.error('Logout failed:', error);
   showNotification('error', 'Logout failed. Please try again.', 'Error');
 }
}

async function logout() {
 showLogoutConfirm();
}

function applyFilters() {

}

function clearFilters() {
 selectedDifficulties.value = [];
 minRating.value = '';
 maxCookTime.value = '';
 searchQuery.value = '';
 activeSearchQuery.value = '';
}

function handleRecipeCreated(newRecipe) {
 const convertedRecipe = convertBackendRecipe(newRecipe);
 apiRecipes.value.unshift(convertedRecipe);
 
 setTimeout(() => {
   showNotification('success', `"${getRecipeTitle(convertedRecipe)}" has been published successfully!`, 'Recipe Published');
 }, 100);
}

function handleRecipeDeleted(recipeId) {
 const index = apiRecipes.value.findIndex(r => getRecipeId(r) === recipeId);
 if (index !== -1) {
   apiRecipes.value.splice(index, 1);
 }
 
 setTimeout(() => {
   showNotification('success', 'Recipe has been deleted successfully!', 'Recipe Deleted');
 }, 100);
}

function handleClickOutside(event) {
 const profileSection = document.querySelector('.profile-section');
 if (profileSection && !profileSection.contains(event.target)) {
   showProfileMenu.value = false;
 }
}

onMounted(() => {
 console.log('Home page loaded');
 document.addEventListener('click', handleClickOutside);
 checkAuthStatus();
 
 // Initialize Lucide icons with longer delay



 setTimeout(() => {
   if (window.lucide) {
     window.lucide.createIcons();
     console.log('Initial icons loaded');
   }
 }, 200);
 
 // Reinitialize periodically for dynamic content

 setInterval(() => {
   if (window.lucide) {
     window.lucide.createIcons();
   }
 }, 1000);
});

onUnmounted(() => {
 document.removeEventListener('click', handleClickOutside);
});

defineExpose({
 handleLoginSuccess
});
</script>

<style>
/* ===== LUCIDE ICON BASE STYLES ===== */
[data-lucide] {
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ===== NAVIGATION ICON STYLES ===== */
.logo-icon {
  width: 28px;
  height: 28px;
  color: #ff6b6b;
  margin-right: 8px;
  stroke-width: 2.5;
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--text-muted);
  pointer-events: none;
}

.profile-icon,
.profile-icon-large {
  width: 100%;
  height: 100%;
  color: white;
  stroke-width: 1.5;
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  
  transition: transform var(--transition-fast);
}

.profile-menu:hover .dropdown-arrow {
  transform: rotate(180deg);
}

/* ===== NOTIFICATION & DIALOG ICONS ===== */
.notification-icon-lucide {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.confirm-icon-lucide {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-6);
  color: var(--primary-color);
}

/* ===== LOADING & ERROR ICONS ===== */
.loading-spinner {
  width: 48px;
  height: 48px;
  color: var(--primary-color);
  margin-bottom: var(--space-4);
}

.error-icon {
  width: 48px;
  height: 48px;
  color: var(--danger-color);
  margin-bottom: var(--space-6);
}

/* ===== BUTTON ICONS ===== */
.btn-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  stroke-width: 2;
}

/* ===== SECTION HEADER ICONS ===== */
.section-icon {
  width: 28px;
  height: 28px;
  color: var(--primary-color);
  margin-right: 12px;
  stroke-width: 2.5;
}

.time-icon {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  margin-right: 4px;
  stroke-width: 2;
}

/* ===== HEART ICON (LIKE BUTTON) ===== */
.heart-icon {
  width: 20px;
  height: 20px;
  color: #ef4444;
  transition: all 0.3s ease;
  stroke-width: 2;
}

.heart-icon.heart-empty {
  fill: none;
  stroke: #ef4444;
}

.heart-icon.heart-filled {
  fill: #ef4444;
  stroke: #ef4444;
}

.like-btn:hover .heart-icon {
  transform: scale(1.1);
}

/* ===== NO RESULTS ICON ===== */
.no-results-icon {
  width: 64px;
  height: 64px;
  color: var(--text-muted);
  opacity: 0.6;
  margin-bottom: var(--space-6);
  stroke-width: 1.5;
}

/* ===== NOTIFICATION & DIALOG ICONS ===== */
.notification-icon-lucide {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  animation: iconPulse 0.6s ease-out;
}

.confirm-icon-lucide {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-6);
  animation: bounce 0.6s ease-out;
  color: var(--primary-color);
}




/* ===== LOADING & ERROR ICONS ===== */
.loading-spinner {
  width: 48px;
  height: 48px;
  color: var(--primary-color);
  
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-4);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-icon {
  width: 48px;
  height: 48px;
  color: var(--danger-color);
  margin-bottom: var(--space-6);
  animation: shake 0.6s ease-out;
}

/* ===== BUTTON ICONS ===== */
.btn-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  stroke-width: 2;
}

/* ===== SECTION HEADER ICONS ===== */
.section-icon {
  width: 28px;
  height: 28px;
  color: var(--primary-color);
  margin-right: 12px;
  stroke-width: 2.5;
}

.time-icon {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  margin-right: 4px;
  stroke-width: 2;
}

/* ===== HEART ICON (LIKE BUTTON) ===== */
.heart-icon {
  width: 20px;
  height: 20px;
  color: #ef4444;
  transition: all 0.3s ease;
  stroke-width: 2;
}

.heart-icon.heart-empty {
  fill: none;
  stroke: #ef4444;
}

.heart-icon.heart-filled {
  fill: #ef4444;
  stroke: #ef4444;
  animation: heartBeat 0.6s ease-out;
}


.like-btn:hover .heart-icon {
  transform: scale(1.1);
}

/* ===== NO RESULTS ICON ===== */
.no-results-icon {
  width: 64px;
  height: 64px;
  color: var(--text-muted);
  opacity: 0.6;
  margin-bottom: var(--space-6);
  stroke-width: 1.5;
}

/* ===== STYLED CONFIRMATION DIALOG ===== */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  animation: fadeIn 0.3s ease-out;
}
.star-rating-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.interactive-stars {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star-interactive {
  font-size: 24px;
  color: #e5e7eb;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.1s ease;
  user-select: none;
}

.star-interactive:hover {
  transform: scale(1.1);
}

.star-filled {
  color: #fbbf24 !important;
}

.star-hover {
  color: #fcd34d !important;
}

.clear-rating-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.clear-rating-btn:hover {
  background: #dc2626;
}

.rating-text {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.confirm-modal {
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--background-tertiary);
  max-width: 450px;
  width: 90%;
  text-align: center;
  animation: modalSlideIn 0.3s ease-out;
}

.confirm-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.confirm-message {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-8);
}

.confirm-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

.btn-danger {
  padding: var(--space-3) var(--space-6);
  background: linear-gradient(135deg, var(--danger-color), var(--danger-hover));
  border: none;
  border-radius: var(--radius-full);
  color: white;
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-danger:hover {
  background: linear-gradient(135deg, var(--danger-hover), var(--danger-color));
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* ===== STYLED NOTIFICATIONS ===== */
.notification-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: var(--background-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--background-tertiary);
  position: relative;
  overflow: hidden;
  min-width: 320px;
  max-width: 400px;
  pointer-events: auto;

}


.notification::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--primary-color);
}

.notification-success {
  background: linear-gradient(135deg, var(--background-primary) 0%, var(--success-light) 100%);
}

.notification-success::before {
  background: var(--success-color);
}

.notification-error {
  background: linear-gradient(135deg, var(--background-primary) 0%, #fee2e2 100%);
}

.notification-error::before {
  background: var(--danger-color);
}

.notification-warning {
  background: linear-gradient(135deg, var(--background-primary) 0%, #fef3c7 100%);
}

.notification-warning::before {
  background: var(--warning-color);
}

.notification-info {
  background: linear-gradient(135deg, var(--background-primary) 0%, var(--primary-light) 100%);
}

.notification-info::before {
  background: var(--primary-color);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-message {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  word-wrap: break-word;
}

.notification-close {
  background: none;
  border: none;
  font-size: 14px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  flex-shrink: 0;
  margin-top: -2px;
}

.notification-close:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
  transform: scale(1.1);
}

/* ===== ENHANCED LOADING OVERLAY ===== */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

.loading-content {
  text-align: center;
  padding: var(--space-8);
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--background-tertiary);
  animation: fadeInScale 0.3s ease-out;
}


.loading-text {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  font-weight: 500;
}

/* ===== ENHANCED ERROR MODAL ===== */
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease-out;
}

.error-modal {
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--background-tertiary);
  max-width: 500px;
  width: 90%;
  text-align: center;
  animation: modalSlideIn 0.3s ease-out;
}

.error-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.error-message {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-4);
}

.error-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--space-6);
}

.btn-primary {
  padding: var(--space-3) var(--space-6);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border: none;
  border-radius: var(--radius-full);
  color: white;
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--primary-hover), var(--primary-color));
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  padding: var(--space-3) var(--space-6);
  background: var(--background-secondary);
  border: 2px solid var(--background-tertiary);
  border-radius: var(--radius-full);
  color: var(--text-primary);
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-secondary:hover {
  background: var(--background-tertiary);
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

/* ===== EXISTING STYLES (unchanged) ===== */


.error-icon {
  width: 48px;
  height: 48px;
  color: var(--danger-color);
  margin-bottom: var(--space-6);
}

/* ===== BUTTON ICONS ===== */
.btn-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  stroke-width: 2;
}

/* ===== SECTION HEADER ICONS ===== */
.section-icon {
  width: 28px;
  height: 28px;
  color: var(--primary-color);
  margin-right: 12px;
  stroke-width: 2.5;
}

.time-icon {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  margin-right: 4px;
  stroke-width: 2;
}

/* ===== HEART ICON (LIKE BUTTON) ===== */
.heart-icon {
  width: 20px;
  height: 20px;
  color: #ef4444;
  stroke-width: 2;
}

.heart-icon.heart-empty {
  fill: none;
  stroke: #ef4444;
}

.heart-icon.heart-filled {
  fill: #ef4444;
  stroke: #ef4444;
}

/* ===== NO RESULTS ICON ===== */
.no-results-icon {
  width: 64px;
  height: 64px;
  color: var(--text-muted);
  opacity: 0.6;
  margin-bottom: var(--space-6);
  stroke-width: 1.5;
}

/* ===== STYLED CONFIRMATION DIALOG ===== */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}

.confirm-modal {
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--background-tertiary);
  max-width: 450px;
  width: 90%;
  text-align: center;
}

.confirm-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.confirm-message {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-8);
}

.confirm-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

.btn-danger {
  padding: var(--space-3) var(--space-6);
  background: linear-gradient(135deg, var(--danger-color), var(--danger-hover));
  border: none;
  border-radius: var(--radius-full);
  color: white;
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-danger:hover {
  background: linear-gradient(135deg, var(--danger-hover), var(--danger-color));
}

/* ===== STYLED NOTIFICATIONS ===== */
.notification-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: var(--background-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--background-tertiary);
  position: relative;
  overflow: hidden;
  min-width: 320px;
  max-width: 400px;
  pointer-events: auto;
}

.notification::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--primary-color);
}

.notification-success {
  background: linear-gradient(135deg, var(--background-primary) 0%, var(--success-light) 100%);
}

.notification-success::before {
  background: var(--success-color);
}

.notification-error {
  background: linear-gradient(135deg, var(--background-primary) 0%, #fee2e2 100%);
}

.notification-error::before {
  background: var(--danger-color);
}

.notification-warning {
  background: linear-gradient(135deg, var(--background-primary) 0%, #fef3c7 100%);
}

.notification-warning::before {
  background: var(--warning-color);
}

.notification-info {
  background: linear-gradient(135deg, var(--background-primary) 0%, var(--primary-light) 100%);
}

.notification-info::before {
  background: var(--primary-color);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-message {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  word-wrap: break-word;
}

.notification-close {
  background: none;
  border: none;
  font-size: 14px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  margin-top: -2px;
}

.notification-close:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
}

/* ===== ENHANCED LOADING OVERLAY ===== */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

.loading-content {
  text-align: center;
  padding: var(--space-8);
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--background-tertiary);
}

.loading-text {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  font-weight: 500;
}

/* ===== ENHANCED ERROR MODAL ===== */
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.error-modal {
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--background-tertiary);
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.error-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.error-message {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-4);
}

.error-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--space-6);
}

.btn-primary {
  padding: var(--space-3) var(--space-6);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border: none;
  border-radius: var(--radius-full);
  color: white;
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--primary-hover), var(--primary-color));
}

.btn-secondary {
  padding: var(--space-3) var(--space-6);
  background: var(--background-secondary);
  border: 2px solid var(--background-tertiary);
  border-radius: var(--radius-full);
  color: var(--text-primary);
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-secondary:hover {
  background: var(--background-tertiary);
  border-color: var(--primary-color);
}

/* ===== EXISTING STYLES ===== */

.profile-avatar img,
.profile-avatar-large img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.profile-avatar:has(img),
.profile-avatar-large:has(img) {
  background: transparent !important;
}

.profile-avatar-img {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  object-fit: cover;
  display: block;
}

.profile-avatar-img-large {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  object-fit: cover;
  display: block;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

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

.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

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

.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  padding: var(--space-6);
  background: var(--background-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--background-tertiary);
}

.search-results-header h2 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.clear-search-btn {
  padding: var(--space-3) var(--space-6);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border: none;
  border-radius: var(--radius-full);
  color: white;
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.clear-search-btn:hover {
  background: linear-gradient(135deg, var(--primary-hover), var(--primary-color));
}

.recipes-section-header {
  margin-bottom: var(--space-6);
}

.recipes-section-header h2 {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.no-search-results {
 text-align: center;
 padding: var(--space-16) var(--space-8);
 background: var(--background-primary);
 border-radius: var(--radius-2xl);
 box-shadow: var(--shadow-lg);
 border: 1px solid var(--background-tertiary);
 margin-top: var(--space-8);

}

.no-search-results h3 {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.no-search-results p {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
  line-height: 1.6;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-direction: row;
}

.auth-buttons .nav-btn {
  padding: var(--space-3) var(--space-6);
  background: var(--primary-color);
  color: white;
  border: 2px solid transparent;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  white-space: nowrap;
}

.auth-buttons .nav-btn:hover {
  background: var(--primary-hover);
  color: white;
}

.nav-buttons {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.nav-buttons .nav-btn {
  padding: var(--space-3) var(--space-6);
  border: 2px solid transparent;
  background: var(--background-secondary);
  color: var(--text-primary);
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}

.nav-buttons .home-btn,
.nav-buttons .liked-btn {
  background: var(--primary-color);
  color: white;
}

.nav-buttons .create-btn {
  background: var(--success-color);
  color: white;
}

.nav-btn:hover {
  background: var(--primary-hover);
  color: white;
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

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.profile-section {
  position: relative;
  margin-left: var(--space-6);
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
  overflow: hidden;
}

.profile-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

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
}

.dropdown-item:hover {
  background: var(--background-secondary);
}

.dropdown-item.logout {
  color: var(--danger-color);
}

.dropdown-divider {
  height: 1px;
  background: var(--background-tertiary);
  margin: var(--space-2) 0;
}

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
  margin-left:5px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
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
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
}

.filter-options label {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  font-size: 15px !important;
  cursor: pointer !important;
  padding: 8px 12px !important;
  border-radius: 6px !important;
  margin-bottom: 0 !important;
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
}

.clear-filters:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
}

/* ===== MOBILE RESPONSIVE ===== */
@media (max-width: 480px) {
  .notification-overlay {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .notification {
    min-width: auto;
    max-width: none;
    padding: 14px 16px;
  }
  
  .notification-title {
    font-size: var(--font-size-xs);
  }
  
  .notification-message {
    font-size: var(--font-size-xs);
  }
  
  .confirm-modal,
  .error-modal {
    padding: var(--space-6);
    margin: var(--space-4);
  }
  
  .confirm-actions,
  .error-actions {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .btn-primary,
  .btn-secondary,
  .btn-danger {
    width: 100%;
    justify-content: center;
  }
  
  .logo-icon {
    width: 24px;
    height: 24px;
  }
  
  .section-icon {
    width: 24px;
    height: 24px;
  }
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