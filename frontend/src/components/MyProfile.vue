<template>
  <div class="profile-page">
    <!-- confirmation-->
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

    <!-- notification -->
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

    <div class="profile-container">
      <div class="profile-main">
        
        <div class="profile-header">
          <div class="profile-info-section">
            <div class="profile-avatar-container">
              <div class="profile-avatar-xl">
                <img 
                  :src="getAvatarUrl(currentUser.name || currentUser.email || 'default', 'thumbs')" 
                  :alt="currentUser.name + ' avatar'"
                  class="avatar-image"
                />
              </div>
            </div>
            
            <div class="profile-details">
              <div class="profile-name-section">
                <h1 class="profile-title">{{ currentUser.name || 'User Name' }}</h1>
              </div>
              
              <p class="profile-email">{{ currentUser.email || 'user@example.com' }}</p>
              <p class="profile-joined">Member since {{ joinedDate }}</p>
              
              <div class="profile-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ userStats.recipesCreated }}</span>
                  <span class="stat-label">Recipes Created</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ userStats.recipesLiked }}</span>
                  <span class="stat-label">Recipes Liked</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-tabs">
          <div class="tabs-header">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'recipes' }"
              @click="activeTab = 'recipes'"
            >
              My Recipes ({{ myRecipes.length }})
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'liked' }"
              @click="activeTab = 'liked'"
            >
              Liked Recipes ({{ likedRecipes.length }})
            </button>
          </div>

          <!-- my recipes -->
          <div class="tab-content" v-if="activeTab === 'recipes'">
            <div class="recipes-grid" v-if="myRecipes.length > 0">
              <div
                v-for="recipe in myRecipes"
                :key="getRecipeId(recipe)"
                class="recipe-card"
                @click="openRecipe(recipe)"
              >
                <div class="card-image">
                  <img :src="getRecipeImage(recipe)" :alt="getRecipeTitle(recipe)" />
                  <div class="recipe-actions">
                    <button class="action-btn edit-btn" @click.stop="editRecipe(recipe)">
                      <i data-lucide="pencil" class="action-icon"></i>
                    </button>
                    <button 
                      class="action-btn delete-btn" 
                      @click.stop="showDeleteConfirm(recipe)"
                      :disabled="deleteLoading === getRecipeId(recipe)"
                    >
                      <i :data-lucide="deleteLoading === getRecipeId(recipe) ? 'loader-2' : 'trash-2'" 
                         :class="{ 'spinning': deleteLoading === getRecipeId(recipe) }" 
                         class="action-icon"></i>
                    </button>
                  </div>
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
                  <p class="recipe-description">{{ getRecipeDescription(recipe) }}</p>
                </div>
              </div>
            </div>
            
            <div class="empty-state" v-else>
              <i data-lucide="chef-hat" class="empty-icon-lucide"></i>
              <h3>No recipes yet</h3>
              <p>Start creating your first recipe!</p>
              <button class="btn-primary" @click="goToCreateRecipe">
                Create Recipe
              </button>
            </div>
          </div>

          <!-- liked recipes -->
          <div class="tab-content" v-if="activeTab === 'liked'">
            <div class="recipes-grid" v-if="likedRecipes.length > 0">
              <div
                v-for="recipe in likedRecipes"
                :key="getRecipeId(recipe)"
                class="recipe-card"
                @click="openRecipe(recipe)"
              >
                <div class="card-image">
                  <img :src="getRecipeImage(recipe)" :alt="getRecipeTitle(recipe)" />
                  <button
                    class="like-btn liked"
                    @click.stop="showUnlikeConfirm(recipe)"
                    :disabled="unlikeLoading === getRecipeId(recipe)"
                  >
                    <i :data-lucide="unlikeLoading === getRecipeId(recipe) ? 'loader-2' : 'heart'" 
                       :class="{ 'spinning': unlikeLoading === getRecipeId(recipe) }" 
                       class="like-icon"></i>
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
                  <p class="recipe-description">{{ getRecipeDescription(recipe) }}</p>
                  <p class="liked-date">Liked on {{ formatDate(recipe.likedAt) }}</p>
                </div>
              </div>
            </div>
            
            <div class="empty-state" v-else>
              <i data-lucide="heart-off" class="empty-icon-lucide"></i>
              <h3>No liked recipes yet</h3>
              <p>Explore recipes!</p>
              <button class="btn-primary" @click="goToHome">
                Browse Recipes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const emit = defineEmits(['go-home', 'go-to-liked', 'go-to-create', 'go-to-edit', 'go-to-recipe'])

const currentUser = ref({
  name: '',
  email: '',
  username: '',
  bio: '',
  signupDate: ''
})

const editMode = ref(false)
const activeTab = ref('recipes')
const isSaving = ref(false)
const deleteLoading = ref(null)
const unlikeLoading = ref(null)

const editForm = ref({
  name: '',
  email: '',
  bio: ''
})

const userStats = ref({
  recipesCreated: 0,
  recipesLiked: 0
})

const myRecipes = ref([])
const likedRecipes = ref([])

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

  async getUserInfo() {
    return this.request('/me');
  },

  async getUserRecipes() {
    return this.request('/users-recipes');
  },

  async getLikedRecipes() {
    return this.request('/user/liked-recipes');
  },

  async unlikeRecipe(id) {
    return this.request(`/recipe/${id}/like`, { method: 'DELETE' });
  },

  async deleteRecipe(id) {
    return this.request(`/recipe/${id}`, { method: 'DELETE' });
  }
};

// Helper function to reinitialize Lucide icons
function reinitializeIcons() {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons();
      console.log('ProfilePage: Icons reinitialized');
    }
  }, 50);
}

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
    creator: backendRecipe.creator,
    ingredients: backendRecipe.ingredients,
    instructions: backendRecipe.instructions,
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

function getRecipeDescription(recipe) {
  return recipe.description || "Delicious recipe";
}

function getRecipeImage(recipe) {
  if (recipe.image) return recipe.image;
  if (recipe.images?.length > 0) return recipe.images[0].url;
  return "https://www.svgrepo.com/show/9389/fork-plate-knife.svg"; 
}

function getRecipeRating(recipe) {
  return recipe.rating || 4.0;
}

function getRecipeLikes(recipe) {
  return recipe.reviewCount || recipe.likes || 0;
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

const joinedDate = computed(() => {
  if (!currentUser.value.signupDate) return 'Recently';
  
  try {
    const date = new Date(currentUser.value.signupDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }); // e.g., "January 2024"
  } catch (error) {
    return 'Recently';
  }
})

function showStyledConfirm(options) {
  const iconMap = {
    delete: 'trash-2',
    unlike: 'heart',
    default: 'help-circle'
  }
  
  confirmDialog.value = {
    title: options.title || 'Confirm Action',
    message: options.message || 'Are you sure?',
    icon: iconMap[options.type || 'default'] || options.icon || 'help-circle',
    confirmText: options.confirmText || 'Confirm',
    cancelText: options.cancelText || 'Cancel',
    onConfirm: options.onConfirm || (() => {})
  }
  showConfirmDialog.value = true
  reinitializeIcons();
}

function confirmAction() {
  if (confirmDialog.value.onConfirm) {
    confirmDialog.value.onConfirm()
  }
  showConfirmDialog.value = false
  reinitializeIcons();
}

function cancelConfirm() {
  showConfirmDialog.value = false
  reinitializeIcons();
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
  reinitializeIcons();
}

async function loadUserData() {
  try {
    const userInfo = await api.getUserInfo();
    currentUser.value = {
      ...userInfo,
    };
    console.log('Loaded user info:', userInfo);
  } catch (error) {
    console.error('Failed to load user info:', error);
    showNotification('error', 'Failed to load user information', 'Load Error');
  }
}

async function loadMyRecipes() {
  try {
    const response = await api.getUserRecipes();
    myRecipes.value = response.recipes.map(convertBackendRecipe);
    userStats.value.recipesCreated = myRecipes.value.length;
    console.log('Loaded my recipes:', myRecipes.value.length);
  } catch (error) {
    console.error('Failed to load my recipes:', error);
    myRecipes.value = [];
    showNotification('error', 'Failed to load your recipes', 'Load Error');
  }
}

async function loadLikedRecipes() {
  try {
    const response = await api.getLikedRecipes();
    likedRecipes.value = response.likedRecipes.map(recipe => ({
      ...convertBackendRecipe(recipe),
      likedAt: new Date()
    }));
    userStats.value.recipesLiked = likedRecipes.value.length;
    console.log('Loaded liked recipes:', likedRecipes.value.length);
  } catch (error) {
    console.error('Failed to load liked recipes:', error);
    likedRecipes.value = [];
    showNotification('error', 'Failed to load liked recipes', 'Load Error');
  }
}

function getAvatarUrl(seed, style = 'thumbs', size = 200) {
  const cleanSeed = encodeURIComponent(seed.toLowerCase().replace(/\s/g, ''))
  return `https://api.dicebear.com/9.x/${style}/png?seed=${cleanSeed}&size=${size}`
}

function toggleEditMode() {
  if (!editMode.value) {
    editForm.value = {
      name: currentUser.value.name,
      email: currentUser.value.email,
      bio: currentUser.value.bio || ''
    }
  }
  editMode.value = !editMode.value
  reinitializeIcons();
}

async function saveProfile() {
  try {
    isSaving.value = true;
    
    currentUser.value = {
      ...currentUser.value,
      name: editForm.value.name,
      email: editForm.value.email,
      bio: editForm.value.bio
    }
    
    editMode.value = false
    console.log('Profile saved')
    showNotification('success', 'Your profile has been updated successfully!', 'Profile Updated');
  } catch (error) {
    console.error('Failed to save profile:', error);
    showNotification('error', 'Failed to save profile. Please try again.', 'Save Failed');
  } finally {
    isSaving.value = false;
    reinitializeIcons();
  }
}

function cancelEdit() {
  editMode.value = false
  editForm.value = { name: '', email: '', bio: '' }
  reinitializeIcons();
}

function openRecipe(recipe) {
  console.log('Opening recipe:', getRecipeTitle(recipe))
  emit('go-to-recipe', recipe)
  reinitializeIcons();
}

function editRecipe(recipe) {
  const recipeId = getRecipeId(recipe)
  console.log('Editing recipe:', getRecipeTitle(recipe), 'ID:', recipeId)
  emit('go-to-edit', recipe)
  reinitializeIcons();
}

function showDeleteConfirm(recipe) {
  const recipeTitle = getRecipeTitle(recipe);
  
  showStyledConfirm({
    title: 'Delete Recipe?',
    message: `Are you sure you want to delete "${recipeTitle}"? This action cannot be undone.`,
    type: 'delete',
    confirmText: 'Yes, Delete',
    cancelText: 'Keep Recipe',
    onConfirm: () => performDeleteRecipe(recipe)
  });
}

async function performDeleteRecipe(recipe) {
  const recipeId = getRecipeId(recipe);
  const recipeTitle = getRecipeTitle(recipe);
  
  try {
    deleteLoading.value = recipeId;
    reinitializeIcons();
    
    await api.deleteRecipe(recipeId);
    
    myRecipes.value = myRecipes.value.filter(r => getRecipeId(r) !== recipeId);
    userStats.value.recipesCreated = myRecipes.value.length;
    
    console.log('Recipe deleted:', recipeTitle);
    showNotification('success', `"${recipeTitle}" has been deleted successfully`, 'Recipe Deleted');
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    showNotification('error', 'Failed to delete recipe. Please try again.', 'Delete Failed');
  } finally {
    deleteLoading.value = null;
    reinitializeIcons();
  }
}

function showUnlikeConfirm(recipe) {
  const recipeTitle = getRecipeTitle(recipe);
  
  showStyledConfirm({
    title: 'Remove from Favorites?',
    message: `Remove "${recipeTitle}" from your liked recipes?`,
    type: 'unlike',
    confirmText: 'Yes, Remove',
    cancelText: 'Keep Favorite',
    onConfirm: () => performUnlike(recipe)
  });
}

async function performUnlike(recipe) {
  const recipeId = getRecipeId(recipe);
  const recipeTitle = getRecipeTitle(recipe);
  
  try {
    unlikeLoading.value = recipeId;
    reinitializeIcons();
    
    await api.unlikeRecipe(recipeId);
    
    likedRecipes.value = likedRecipes.value.filter(r => getRecipeId(r) !== recipeId);
    userStats.value.recipesLiked = likedRecipes.value.length;
    
    console.log('Recipe unliked:', recipeTitle);
    showNotification('info', `Removed "${recipeTitle}" from favorites`, 'Removed from Favorites');
  } catch (error) {
    console.error('Failed to unlike recipe:', error);
    showNotification('error', 'Failed to remove from favorites. Please try again.', 'Remove Failed');
  } finally {
    unlikeLoading.value = null;
    reinitializeIcons();
  }
}

function goToHome() {
  emit('go-home')
  reinitializeIcons();
}

function goToCreateRecipe() {
  emit('go-to-create')
  reinitializeIcons();
}

function formatDate(dateString) {
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

onMounted(async () => {
  console.log('Profile page loaded')
  await loadUserData()
  await loadMyRecipes()
  await loadLikedRecipes()
  reinitializeIcons();
})
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

/* ===== NOTIFICATION AND CONFIRMATION ICONS ===== */
.notification-icon-lucide {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  animation: shake 0.6s ease-out;
}

.confirm-icon-lucide {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-4);
  color: var(--primary-color);
  stroke-width: 1.5;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

/* ===== ACTION AND LIKE BUTTON ICONS ===== */
.action-icon, .like-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.action-icon.spinning, .like-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===== EMPTY STATE ICONS ===== */
.empty-icon-lucide {
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-6);
  opacity: 0.6;
  color: var(--primary-color);
  stroke-width: 1.5;
}

/* ===== PROFILE PAGE STYLES ===== */
.profile-page {
  padding: var(--space-8) var(--space-6);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* ===== CONFIRMATION DIALOG ===== */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-modal {
  background: var(--background-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--background-tertiary);
}

.confirm-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.confirm-message {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}
.confirm-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  align-items: center;
}

.confirm-actions button {
  flex: 1;
  min-width: 120px;
  max-width: 150px;
  display: flex; /* Ensure consistency with button content */
  align-items: center;
  justify-content: center;
}

.btn-danger {
  padding: var(--space-3) var(--space-6);
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.btn-danger:hover {
  background: var(--danger-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* ===== NOTIFICATION STYLES ===== */
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
  min-width: 320px;
  max-width: 400px;
  background: var(--background-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--background-tertiary);
  position: relative;
  overflow: hidden;
  pointer-events: auto;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
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

/* ===== PROFILE HEADER ===== */
.profile-header {
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--background-tertiary);
  overflow: hidden;
}

.profile-info-section {
  padding: var(--space-8);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-8);
  align-items: center;
}

.profile-avatar-container {
  position: relative;
}

.profile-avatar-xl {
  width: 150px;
  height: 150px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-xl);
  border: 4px solid var(--background-primary);
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.profile-name-section {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-bottom: var(--space-2);
}

.profile-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.025em;
}


.profile-email {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  font-weight: 500;
  margin: 0;
}

.profile-joined {
  font-size: var(--font-size-base);
  color: var(--text-muted);
  margin: 0;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
  margin-top: var(--space-6);
}

.stat-item {
  text-align: center;
  padding: var(--space-4);
  background: var(--background-secondary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--background-tertiary);
}

.stat-number {
  display: block;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

/* ===== EDIT PROFILE SECTION ===== */
.edit-profile-section {
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--background-tertiary);
}

.edit-form-container {
  padding: var(--space-8);
}

.edit-form-container h2 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-6);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.form-group input,
.form-group textarea {
  padding: var(--space-4);
  border: 2px solid var(--background-tertiary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  background: var(--background-primary);
  transition: border-color var(--transition-fast);
  outline: none;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.form-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: flex-end;
  margin-top: var(--space-4);
}

.btn-primary,
.btn-secondary {
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--background-secondary);
  color: var(--text-secondary);
  border: 2px solid var(--background-tertiary);
}

.btn-secondary:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
}

/* ===== TABS SECTION ===== */
.profile-tabs {
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--background-tertiary);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  background: var(--background-secondary);
  border-bottom: 1px solid var(--background-tertiary);
}

.tab-btn {
  flex: 1;
  padding: var(--space-4) var(--space-6);
  background: none;
  border: none;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--background-primary);
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-content {
  padding: var(--space-8);
}

/* ===== RECIPES GRID ===== */
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
  overflow: hidden;
}

.recipe-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-xl);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: linear-gradient(45deg, #f0f4f8, #d6e1ea);
}

.recipe-actions {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-fast);
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.edit-btn:hover {
  background: #e0f2fe;
}

.delete-btn:hover {
  background: #ffebee;
}

.like-btn {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: var(--radius-full);
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-fast);
}

.like-btn:hover {
  transform: scale(1.1);
}

.like-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
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
  color: var(--text-primary);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
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

.rating-count {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
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

.recipe-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: var(--space-3);
}

.liked-date {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-style: italic;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-8);
  background: var(--background-secondary);
  border-radius: var(--radius-xl);
  border: 2px dashed var(--background-tertiary);
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.empty-state p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

/* Navigation avatar styles */
.nav-avatar-image,
.dropdown-avatar-image,
.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

/* Specific fixes for Dicebear avatars */
.profile-avatar img,
.profile-avatar-large img,
.profile-avatar-xl img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

/* Remove any background or text when image loads */
.profile-avatar,
.profile-avatar-large,
.profile-avatar-xl {
  background: transparent !important;
  color: transparent;
  overflow: hidden;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1024px) {
  .profile-page {
    padding: var(--space-6) var(--space-4);
  }
  
  .profile-info-section {
    grid-template-columns: 1fr;
    text-align: center;
    gap: var(--space-6);
  }
  
  .profile-name-section {
    flex-direction: column;
    gap: var(--space-4);
    align-items: center;
  }
  
  .profile-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }
  
  .recipes-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-4);
  }
}

@media (max-width: 768px) {
  .profile-avatar-xl {
    width: 120px;
    height: 120px;
  }
  
  .profile-title {
    font-size: var(--font-size-3xl);
  }
  
  .profile-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }
  
  .stat-item {
    padding: var(--space-3);
  }
  
  .stat-number {
    font-size: var(--font-size-xl);
  }
  
  .tabs-header {
    flex-direction: column;
  }
  
  .tab-btn {
    border-bottom: none;
    border-right: 3px solid transparent;
  }
  
  .tab-btn.active {
    border-right-color: var(--primary-color);
    border-bottom: none;
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: var(--space-4) var(--space-3);
  }
  
  .profile-info-section,
  .edit-form-container,
  .bio-container,
  .tab-content {
    padding: var(--space-6);
  }
  
  .profile-avatar-xl {
    width: 100px;
    height: 100px;
  }
  
  .profile-title {
    font-size: var(--font-size-2xl);
  }
  
  .profile-stats {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
  
  .recipes-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
 .btn-danger, .btn-secondary {
  margin: 0; /* Remove any default margins */
  padding: var(--space-3) var(--space-6);
  box-sizing: border-box; /* Ensure padding doesn't affect width */
}
  
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
}

/* ===== ACCESSIBILITY ===== */
.recipe-card:focus,
.tab-btn:focus,
.edit-profile-btn:focus,
.btn-primary:focus,
.btn-secondary:focus,
.btn-danger:focus,
.action-btn:focus,
.like-btn:focus,
.notification-close:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>