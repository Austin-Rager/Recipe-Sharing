<template>
  <div class="recipe-details-page">
    <!-- Notification System -->
    <div v-if="notification.show" class="notification-overlay">
      <div :class="['notification', `notification-${notification.type}`]">
        <div class="notification-icon">{{ notification.icon }}</div>
        <div class="notification-content">
          <div v-if="notification.title" class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <button class="notification-close" @click="hideNotification">✕</button>
      </div>
    </div>
    <div class="recipe-details">
      <!-- Recipe Header Section -->
      <div class="recipe-header" v-if="recipe">
        <div class="recipe-image">
          <!-- Image Gallery -->
          <div class="image-gallery" v-if="recipe.images && recipe.images.length > 0">
<<<<<<< Updated upstream
            <!-- Main Image Display -->
            <div class="main-image-container">
              <img 
                :src="recipe.images[currentImageIndex]?.url || 'https://via.placeholder.com/400x300'" 
                :alt="recipe.title" 
                class="main-image clickable"
                @error="handleImageError"
                @click="openGalleryModal(currentImageIndex)"
              />
              
              <!-- Navigation Arrows (only show if more than 1 image) -->
              <div v-if="recipe.images.length > 1" class="image-nav-arrows">
                <button 
                  @click="previousImage" 
                  class="nav-arrow nav-arrow-left"
                  :disabled="currentImageIndex === 0"
                >
                  &#8249;
                </button>
                <button 
                  @click="nextImage" 
                  class="nav-arrow nav-arrow-right"
                  :disabled="currentImageIndex >= recipe.images.length - 1"
                >
                  &#8250;
                </button>
              </div>
              
              <!-- Image Counter -->
              <div v-if="recipe.images.length > 1" class="image-counter">
                {{ currentImageIndex + 1 }} / {{ recipe.images.length }}
              </div>
            </div>
            
            <!-- Thumbnail Navigation (only show if more than 1 image) -->
            <div v-if="recipe.images.length > 1" class="image-thumbnails">
              <button
                v-for="(image, index) in recipe.images"
                :key="index"
                @click="currentImageIndex = index"
                :class="['thumbnail-btn', { 'active': currentImageIndex === index }]"
              >
                <img 
                  :src="image.url || 'https://via.placeholder.com/60x45'" 
                  :alt="`${recipe.title} image ${index + 1}`" 
                  class="thumbnail-img clickable"
                  @error="handleImageError"
                  @click="openGalleryModal(index)" 
                />
              </button>
            </div>
          </div>
          
          <!-- Fallback for no images -->
          <div v-else class="no-image">
            <img src="https://via.placeholder.com/400x300?text=No+Images" :alt="recipe.title" class="clickable" @click="openGalleryModal(0)" />
          </div>
        </div>
        <div class="recipe-info">
          <h1 class="recipe-title">{{ recipe.title }}</h1>
          <p class="recipe-description">{{ recipe.description }}</p>
          
          <div class="recipe-meta" v-if="recipe">
            <div class="rating">
              <span class="stars">{{ '★'.repeat(Math.floor(recipe.rating)) }}{{ '☆'.repeat(5 - Math.floor(recipe.rating)) }}</span>
              <span class="rating-text">{{ recipe.rating }}/5</span>
            </div>
            <div class="difficulty">
              <span class="label">Difficulty:</span>
              <span class="value">{{ recipe.difficulty }}</span>
            </div>
            <div class="time">
              <span class="label">Time:</span>
              <span class="value">{{ recipe.time }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">

            <button class="btn btn-like" @click="likeRecipe">
              <span>{{ recipe.isLiked ? '❤️ Liked' : '🤍 Like' }}</span>
            </button>
            <button class="btn btn-edit" @click="editRecipe">
              <span>✏️ Edit</span> 
            </button>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="recipe-content" v-if="recipe">
        <!-- Steps Section (Left) -->
        <div class="steps-section">
          <h2>Instructions</h2>
          <ol class="steps-list">
            <li v-for="(step, index) in recipe.steps" :key="index" class="step-item">
              {{ step }}
            </li>
          </ol>
        </div>

        <!-- Ingredients Section (Right) -->
        <div class="ingredients-section">
          <h2>Ingredients</h2>
          <div class="ingredients-checklist">
            <label 
              v-for="(ingredient, index) in recipe.ingredients" 
              :key="index" 
              class="ingredient-item"
              :class="{ checked: checkedIngredients[index] }"
            >
              <input 
                type="checkbox" 
                v-model="checkedIngredients[index]"
                class="ingredient-checkbox"
              />
              <span class="checkmark">✓</span>
              <span class="ingredient-text">{{ ingredient }}</span>
            </label>
          </div>
          
          <!-- Progress indicator -->
          <div class="progress-section" v-if="recipe.ingredients && recipe.ingredients.length > 0">
            <div class="progress-header">
              <div class="progress-text">
                {{ checkedCount }}/{{ recipe.ingredients.length }} ingredients gathered
              </div>
              <button 
                class="clear-progress-btn"
                @click="clearIngredientProgress"
                :disabled="checkedCount === 0"
                title="Clear all ingredient progress"
              >
                Clear Progress
              </button>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Full-Screen Image Gallery Modal -->
    <div v-if="showGalleryModal" class="gallery-modal-overlay" @click="closeGalleryModal">
      <div class="gallery-modal" @click.stop>
        <!-- Modal Header -->
        <div class="gallery-modal-header">
          <h3 class="gallery-modal-title">{{ recipe.title }}</h3>
          <button class="gallery-close-btn" @click="closeGalleryModal">✕</button>
        </div>
        
        <!-- Main Modal Image -->
        <div class="gallery-modal-content">
          <div class="modal-image-container">
            <img 
              :src="recipe.images[modalImageIndex]?.url || 'https://via.placeholder.com/800x600'" 
              :alt="`${recipe.title} image ${modalImageIndex + 1}`"
              class="modal-main-image"
              @error="handleImageError"
            />
            
            <!-- Modal Navigation Arrows -->
            <div v-if="recipe.images.length > 1" class="modal-nav-arrows">
              <button 
                @click="previousModalImage" 
                class="modal-nav-arrow modal-nav-left"
                :disabled="modalImageIndex === 0"
              >
                &#8249;
              </button>
              <button 
                @click="nextModalImage" 
                class="modal-nav-arrow modal-nav-right"
                :disabled="modalImageIndex >= recipe.images.length - 1"
              >
                &#8250;
              </button>
            </div>
            
            <!-- Modal Image Counter -->
            <div v-if="recipe.images.length > 1" class="modal-image-counter">
              {{ modalImageIndex + 1 }} / {{ recipe.images.length }}
            </div>
          </div>
          
          <!-- Modal Thumbnail Strip -->
          <div v-if="recipe.images.length > 1" class="modal-thumbnails">
            <button
              v-for="(image, index) in recipe.images"
              :key="index"
              @click="modalImageIndex = index"
              :class="['modal-thumbnail-btn', { 'active': modalImageIndex === index }]"
            >
              <img 
                :src="image.url || 'https://via.placeholder.com/80x60'" 
                :alt="`${recipe.title} thumbnail ${index + 1}`" 
                class="modal-thumbnail-img"
                @error="handleImageError"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'


// API utilities
const API_BASE_URL = 'http://localhost:8080';

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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async likeRecipe(id) {
    return this.request(`/recipe/${id}/like`, { method: 'POST' });
  },

  async unlikeRecipe(id) {
    return this.request(`/recipe/${id}/like`, { method: 'DELETE' });
  }
};

// User authentication state
const isLoggedIn = ref(false);

// Notification system
const notification = ref({
  show: false,
  type: 'info',
  title: '',
  message: '',
  icon: ''
});

// Check login status
const checkLoginStatus = async () => {
  try {
    await api.request('/me');
    isLoggedIn.value = true;
  } catch (error) {
    console.log('Not logged in:', error.message);
    isLoggedIn.value = false;
  }
};

// Notification system
function showNotification(type, message, title = '') {
  const iconMap = {
    success: '✅',
    error: '⚠️',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  notification.value = {
    show: true,
    type,
    title,
    message,
    icon: iconMap[type] || '🍳'
  };
  
  // Auto-hide after 4 seconds
  setTimeout(() => {
    hideNotification();
  }, 4000);
}

function hideNotification() {
  notification.value.show = false;
}

const props = defineProps({
  recipeData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['go-home'])

// Helper functions
const getRecipeId = (recipe) => {
  return recipe?.id || recipe?._id || 'unknown';
};

const getRecipeTitle = (recipe) => {
  return recipe?.title || recipe?.name || 'Unknown Recipe';
};

// Ingredients checklist state
const checkedIngredients = ref({})

// Image gallery state
const currentImageIndex = ref(0)
const showGalleryModal = ref(false)
const modalImageIndex = ref(0)

// Use the recipe data from props
const recipe = computed(() => {
  if (!props.recipeData) return null;
  
  
  if (props.recipeData.images) {
    console.log('📏 Images length:', props.recipeData.images.length);
    console.log('🖼️ First image:', props.recipeData.images[0]);
    console.log('🖼️ All images:', props.recipeData.images);
  }
  
  // Transform instructions - handle both string arrays and object arrays
  const transformInstructions = (instructions) => {
    if (!instructions || !Array.isArray(instructions)) return [];
    
    return instructions.map(instruction => {
      // If it's already a string, return as is
      if (typeof instruction === 'string') return instruction;
      
      // If it's an object with Steps property, extract the Steps
      if (instruction.Steps) return instruction.Steps;
      
      // Fallback to string representation
      return instruction.toString();
    });
  };
  
  // Transform ingredients - handle both string arrays and object arrays
  const transformIngredients = (ingredients) => {
    if (!ingredients || !Array.isArray(ingredients)) return [];
    
    return ingredients.map(ingredient => {
      // If it's already a string, return as is
      if (typeof ingredient === 'string') return ingredient;
      
      // If it's an object with name, quantity, unit properties
      if (ingredient.name) {
        const quantity = ingredient.quantity || '';
        const unit = ingredient.unit || '';
        const name = ingredient.name || '';
        
        // Format: "1 cup water" or "2 pieces onion"
        return `${quantity} ${unit} ${name}`.trim();
      }
      
      // Fallback to string representation
      return ingredient.toString();
    });
  };
  
  // Handle images - check multiple possible formats
  let processedImages = [];
  if (props.recipeData.images && Array.isArray(props.recipeData.images) && props.recipeData.images.length > 0) {
    processedImages = props.recipeData.images;
  } else if (props.recipeData.image) {
    // If there's a single image property, convert it to array format
    processedImages = [{ url: props.recipeData.image }];
  }
  
  console.log('✅ Processed images:', processedImages);
  console.log('🎯 Final images array length:', processedImages.length);
  
  return {
    title: props.recipeData.title || props.recipeData.name || 'Recipe',
    description: props.recipeData.description || 'Delicious recipe',
    image: props.recipeData.image || 

           (props.recipeData.images?.length > 0 ? props.recipeData.images[0].url : 'https://via.placeholder.com/400x300'),
    images: props.recipeData.images || [],
    rating: props.recipeData.rating || 4.0,
    difficulty: props.recipeData.difficulty || 'Easy',
    time: props.recipeData.time || (props.recipeData.cookTime ? `${props.recipeData.cookTime}min` : '30 minutes'),
    isLiked: props.recipeData.isLiked || false,
    steps: transformInstructions(props.recipeData.instructions || props.recipeData.steps || []),
    ingredients: transformIngredients(props.recipeData.ingredients || [])
  };
})

// Computed properties for progress tracking
const checkedCount = computed(() => {
  return Object.values(checkedIngredients.value).filter(Boolean).length
})

const progressPercentage = computed(() => {
  if (!recipe.value || !recipe.value.ingredients || recipe.value.ingredients.length === 0) return 0
  return Math.round((checkedCount.value / recipe.value.ingredients.length) * 100)
})

// LocalStorage helpers for ingredient checklist persistence
const getStorageKey = (recipeId) => `recipe-ingredients-${recipeId}`

const saveIngredientState = (recipeId, checkedState) => {
  try {
    localStorage.setItem(getStorageKey(recipeId), JSON.stringify(checkedState))
  } catch (error) {
    console.warn('Failed to save ingredient state to localStorage:', error)
  }
}

const loadIngredientState = (recipeId) => {
  try {
    const saved = localStorage.getItem(getStorageKey(recipeId))
    return saved ? JSON.parse(saved) : {}
  } catch (error) {
    console.warn('Failed to load ingredient state from localStorage:', error)
    return {}
  }
}



// Methods
const likeRecipe = async () => {
  if (!isLoggedIn.value) {
    showNotification('warning', 'Please log in to like recipes', 'Login Required');
    return;
  }

  if (!recipe.value || !props.recipeData) return;

  // Get the recipe ID from the original props data, which should have the MongoDB _id
  const recipeId = props.recipeData._id || props.recipeData.id;
  
  // Validate that we have a proper MongoDB ObjectId (24 character hex string)
  if (!recipeId || typeof recipeId !== 'string' || recipeId.length !== 24) {
    console.error('Invalid recipe ID:', recipeId);
    showNotification('error', 'Invalid recipe ID. Cannot like this recipe.', 'Error');
    return;
  }

  const wasLiked = recipe.value.isLiked;

  try {
    if (wasLiked) {
      await api.unlikeRecipe(recipeId);
      showNotification('info', `Removed "${getRecipeTitle(recipe.value)}" from favorites`, 'Recipe Unliked');
    } else {
      await api.likeRecipe(recipeId);
      showNotification('success', `Added "${getRecipeTitle(recipe.value)}" to favorites!`, 'Recipe Liked ❤️');
    }
    
    // Update local state
    recipe.value.isLiked = !wasLiked;
    
    // Update likes count if available
    if (props.recipeData.likes !== undefined) {
      props.recipeData.likes += wasLiked ? -1 : 1;
    }
    
  } catch (error) {
    console.error('Failed to toggle like:', error);
    showNotification('error', 'Failed to update like status. Please try again.', 'Connection Error');
  }
}

const editRecipe = () => {
  console.log('Navigate to edit recipe page')
  alert('Edit functionality - coming soon!')
}

const saveRecipe = () => {
  console.log('Recipe saved!')
}

// Clear ingredient progress for current recipe
const clearIngredientProgress = () => {
  if (recipe.value) {
    const recipeId = recipe.value.id || props.recipeData?.id || props.recipeData?._id || 'unknown'
    try {
      localStorage.removeItem(getStorageKey(recipeId))
      // Reset all ingredients to unchecked
      const newCheckedState = {}
      recipe.value.ingredients.forEach((_, index) => {
        newCheckedState[index] = false
      })
      checkedIngredients.value = newCheckedState
      console.log('Ingredient progress cleared!')
    } catch (error) {
      console.warn('Failed to clear ingredient progress:', error)
    }
  }
}

// Image gallery navigation methods
const nextImage = () => {
  if (currentImageIndex.value < recipe.value.images.length - 1) {
    currentImageIndex.value++;
  }
};

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

// Handle image loading errors
const handleImageError = (event) => {
  console.warn('Image failed to load:', event.target.src);
  event.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
};

// Gallery modal functions
const openGalleryModal = (imageIndex = 0) => {
  console.log('🔍 Opening gallery modal with index:', imageIndex);
  console.log('🔍 Recipe images available:', recipe.value?.images);
  
  if (!recipe.value?.images || recipe.value.images.length === 0) {
    console.warn('⚠️ No images available to show in gallery');
    return;
  }
  
  modalImageIndex.value = imageIndex;
  showGalleryModal.value = true;
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';
};

const closeGalleryModal = () => {
  showGalleryModal.value = false;
  // Restore body scroll
  document.body.style.overflow = 'auto';
};

const nextModalImage = () => {
  if (modalImageIndex.value < recipe.value.images.length - 1) {
    modalImageIndex.value++;
  }
};

const previousModalImage = () => {
  if (modalImageIndex.value > 0) {
    modalImageIndex.value--;
  }
};

// Navigation method
function goToHome() {
  emit('go-home')
}

// Initialize checklist state with localStorage persistence
const initializeIngredients = (recipeData) => {
  if (!recipeData || !recipeData.ingredients) return
  
  const recipeId = recipeData.id || recipeData._id || 'unknown'
  const savedState = loadIngredientState(recipeId)
  
  // Initialize checklist with saved state or default to false
  const newCheckedState = {}
  recipeData.ingredients.forEach((_, index) => {
    newCheckedState[index] = savedState[index] || false
  })
  
  checkedIngredients.value = newCheckedState
}

// Watch for ingredient changes to save to localStorage
watch(checkedIngredients, (newState) => {
  if (recipe.value && Object.keys(newState).length > 0) {
    const recipeId = recipe.value.id || props.recipeData?.id || props.recipeData?._id || 'unknown'
    saveIngredientState(recipeId, newState)
  }
}, { deep: true })

// Initialize checklist state on mount (moved to combined onMounted above)

// Watch for recipe changes to reinitialize checklist and reset image index
watch(() => props.recipeData, (newRecipe) => {
  if (newRecipe) {
    initializeIngredients(newRecipe)
    // Reset image gallery to first image when recipe changes
    currentImageIndex.value = 0;
    modalImageIndex.value = 0;
  }
}, { immediate: true })

// Keyboard navigation for modal
const handleKeydown = (event) => {
  if (!showGalleryModal.value) return;
  
  switch (event.key) {
    case 'Escape':
      closeGalleryModal();
      break;
    case 'ArrowLeft':
      previousModalImage();
      break;
    case 'ArrowRight':
      nextModalImage();
      break;
  }
};

// Add keyboard event listener when component mounts
onMounted(() => {
  if (props.recipeData) {
    initializeIngredients(props.recipeData)
  }
  // Check user login status
  checkLoginStatus();
  // Add keyboard event listener
  document.addEventListener('keydown', handleKeydown);
});

// Remove keyboard event listener when component unmounts
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  // Restore body scroll in case modal was open
  document.body.style.overflow = 'auto';
});
</script>

<style scoped>
.recipe-details-page {
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

.search-icon {
  position: absolute;
  right: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: var(--font-size-lg);
}

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

/* ===== RECIPE DETAILS STYLES ===== */
.recipe-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.recipe-header {
  display: flex;
  gap: var(--space-8);
  margin-bottom: var(--space-12);
  padding: var(--space-8);
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--background-tertiary);
}

.recipe-image {
  flex: 0 0 400px;
}

/* ===== IMAGE GALLERY STYLES ===== */
.image-gallery {
  width: 100%;
}

.main-image-container {
  position: relative;
  margin-bottom: var(--space-4);
}

.main-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: var(--radius-xl);
  background: linear-gradient(45deg, #f0f4f8, #d6e1ea);
  transition: opacity 0.3s ease;
}

.image-nav-arrows {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 var(--space-4);
  pointer-events: none;
}

.nav-arrow {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  pointer-events: auto;
  backdrop-filter: blur(4px);
}

.nav-arrow:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.image-counter {
  position: absolute;
  bottom: var(--space-4);
  right: var(--space-4);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.image-thumbnails {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding: var(--space-2) 0;
}

.thumbnail-btn {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  opacity: 0.6;
  transform: scale(0.9);
}

.thumbnail-btn:hover {
  opacity: 0.8;
  transform: scale(0.95);
}

.thumbnail-btn.active {
  opacity: 1;
  transform: scale(1);
  box-shadow: 0 0 0 3px var(--primary-color);
}

.thumbnail-img {
  width: 60px;
  height: 45px;
  object-fit: cover;
  border-radius: var(--radius-md);
  display: block;
}

.no-image img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: var(--radius-xl);
  background: linear-gradient(45deg, #f0f4f8, #d6e1ea);
  transition: opacity 0.3s ease;
}

.image-nav-arrows {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 var(--space-4);
  pointer-events: none;
}

.nav-arrow {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  pointer-events: auto;
  backdrop-filter: blur(4px);
}

.nav-arrow:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.image-counter {
  position: absolute;
  bottom: var(--space-4);
  right: var(--space-4);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.image-thumbnails {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding: var(--space-2) 0;
}

.thumbnail-btn {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  opacity: 0.6;
  transform: scale(0.9);
}

.thumbnail-btn:hover {
  opacity: 0.8;
  transform: scale(0.95);
}

.thumbnail-btn.active {
  opacity: 1;
  transform: scale(1);
  box-shadow: 0 0 0 3px var(--primary-color);
}

.thumbnail-img {
  width: 60px;
  height: 45px;
  object-fit: cover;
  border-radius: var(--radius-md);
  display: block;
}

.no-image img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: var(--radius-xl);
  background: linear-gradient(45deg, #f0f4f8, #d6e1ea);
}

.clickable {
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.clickable:hover {
  opacity: 0.9;
}

/* ===== GALLERY MODAL STYLES ===== */
.gallery-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.gallery-modal {
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  max-width: 90vw;
  max-height: 90vh;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.gallery-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  border-bottom: 1px solid var(--background-tertiary);
  background: var(--background-secondary);
}

.gallery-modal-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gallery-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.gallery-close-btn:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
  transform: scale(1.1);
}

.gallery-modal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-image-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-primary);
  min-height: 400px;
}

.modal-main-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.modal-nav-arrows {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 var(--space-6);
  pointer-events: none;
}

.modal-nav-arrow {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  pointer-events: auto;
  backdrop-filter: blur(8px);
}

.modal-nav-arrow:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.modal-nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.modal-image-counter {
  position: absolute;
  bottom: var(--space-6);
  right: var(--space-6);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.modal-thumbnails {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-6);
  overflow-x: auto;
  background: var(--background-secondary);
  border-top: 1px solid var(--background-tertiary);
  justify-content: center;
  max-height: 120px;
}

.modal-thumbnail-btn {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  opacity: 0.6;
  transform: scale(0.9);
}

.modal-thumbnail-btn:hover {
  opacity: 0.8;
  transform: scale(0.95);
}

.modal-thumbnail-btn.active {
  opacity: 1;
  transform: scale(1);
  box-shadow: 0 0 0 3px var(--primary-color);
}

.modal-thumbnail-img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-md);
  display: block;
}

.clickable {
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.clickable:hover {
  opacity: 0.9;
}

.recipe-info {
  flex: 1;
}

.recipe-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin-bottom: var(--space-4);
  color: var(--text-primary);
  line-height: 1.2;
}

.recipe-description {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  line-height: 1.5;
}

.recipe-meta {
  display: flex;
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}

.rating {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.stars {
  color: #fbbf24;
  font-size: var(--font-size-xl);
}

.rating-text {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.difficulty, .time {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.value {
  color: var(--text-primary);
  padding: var(--space-1) var(--space-3);
  background: var(--background-secondary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: var(--space-4);
}

.btn {
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  box-shadow: var(--shadow-md);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-like {
  background: var(--success-color);
  color: white;
}

.btn-like:hover {
  background: #059669;
}

.btn-edit {
  background-color: #807f7f;
  color: white;
}

.btn-edit:hover {
  background: #505050;
}

.btn-save {
  background: var(--primary-color);
  color: white;
}

.btn-save:hover {
  background: var(--primary-hover);
}

.btn-home {
  background: var(--background-secondary);
  color: var(--text-primary);
  border: 2px solid var(--background-tertiary);
}

.btn-home:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
}

.recipe-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-12);
}

.steps-section h2,
.ingredients-section h2 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--space-6);
  color: var(--text-primary);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: var(--space-3);
}

.steps-list {
  list-style: none;
  counter-reset: step-counter;
  padding: 0;
}

.step-item {
  counter-increment: step-counter;
  margin-bottom: var(--space-6);
  padding: var(--space-6);
  background: var(--background-primary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--background-tertiary);
  position: relative;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.step-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.step-item::before {
  content: counter(step-counter);
  position: absolute;
  left: -15px;
  top: 1.3rem;
  background: var(--primary-color);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-md);
  line-height: 50px;
}

/* ===== INGREDIENTS CHECKLIST STYLES ===== */
.ingredients-checklist {
  margin-bottom: var(--space-6);
}

.ingredient-item {
  display: flex;
  align-items: center;
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  background: var(--background-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--background-tertiary);
  border-left: 4px solid var(--success-color);
  transition: all var(--transition-fast);
  font-size: var(--font-size-base);
  cursor: pointer;
  position: relative;
}

.ingredient-item:hover {
  background: var(--background-secondary);
  transform: translateX(2px);
}

.ingredient-item.checked {
  background: var(--success-light, #f0fdf4);
  border-left-color: var(--success-color);
  opacity: 0.8;
}

.ingredient-item.checked .ingredient-text {
  text-decoration: line-through;
  color: var(--text-muted);
}

.ingredient-checkbox {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid var(--background-tertiary);
  border-radius: var(--radius-sm);
  margin-right: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-primary);
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  color: transparent;
  flex-shrink: 0;
}

.ingredient-item.checked .checkmark {
  background: var(--success-color);
  border-color: var(--success-color);
  color: white;
}

.ingredient-text {
  flex: 1;
  transition: all var(--transition-fast);
}

.progress-section {
  background: var(--background-primary);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--background-tertiary);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.progress-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 600;
}

.clear-progress-btn {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-xs);
  background: var(--background-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--background-tertiary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.clear-progress-btn:hover:not(:disabled) {
  background: var(--warning-color);
  color: white;
  border-color: var(--warning-color);
}

.clear-progress-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--background-tertiary);
  color: var(--text-muted);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--background-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--success-color), #059669);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
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
  animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
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
  background: linear-gradient(135deg, var(--background-primary) 0%, var(--success-light, #f0fdf4) 100%);
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
  background: linear-gradient(135deg, var(--background-primary) 0%, var(--primary-light, #e0f2fe) 100%);
}

.notification-info::before {
  background: var(--primary-color);
}

.notification-icon {
  font-size: 20px;
  margin-top: 2px;
  flex-shrink: 0;
  animation: iconPulse 0.6s ease-out;
}

@keyframes iconPulse {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
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

/* ===== GALLERY MODAL STYLES ===== */
.gallery-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.gallery-modal {
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  max-width: 90vw;
  max-height: 90vh;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.gallery-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  border-bottom: 1px solid var(--background-tertiary);
  background: var(--background-secondary);
}

.gallery-modal-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gallery-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.gallery-close-btn:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
  transform: scale(1.1);
}

.gallery-modal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-image-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-primary);
  min-height: 400px;
}

.modal-main-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.modal-nav-arrows {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 var(--space-6);
  pointer-events: none;
}

.modal-nav-arrow {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  width: 50px;
  height: 50px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  pointer-events: auto;
  backdrop-filter: blur(8px);
}

.modal-nav-arrow:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.modal-nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.modal-image-counter {
  position: absolute;
  bottom: var(--space-6);
  right: var(--space-6);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.modal-thumbnails {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-6);
  overflow-x: auto;
  background: var(--background-secondary);
  border-top: 1px solid var(--background-tertiary);
  justify-content: center;
  max-height: 120px;
}

.modal-thumbnail-btn {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  opacity: 0.6;
  transform: scale(0.9);
}

.modal-thumbnail-btn:hover {
  opacity: 0.8;
  transform: scale(0.95);
}

.modal-thumbnail-btn.active {
  opacity: 1;
  transform: scale(1);
  box-shadow: 0 0 0 3px var(--primary-color);
}

.modal-thumbnail-img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-md);
  display: block;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1024px) {
  .nav-content {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    text-align: center;
  }
}

@media (max-width: 768px) {
  .recipe-details {
    padding: var(--space-6) var(--space-4);
  }
  
  .recipe-header {
    flex-direction: column;
    gap: var(--space-6);
    padding: var(--space-6);
  }
  
  .recipe-image {
    flex: none;
  }
  
  .main-image, .no-image img {
    height: 240px;
  }
  
  .thumbnail-img {
    width: 50px;
    height: 38px;
  }
  
  .gallery-modal {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .gallery-modal-header {
    padding: var(--space-4);
  }
  
  .gallery-modal-title {
    font-size: var(--font-size-lg);
  }
  
  .modal-thumbnails {
    padding: var(--space-4);
    gap: var(--space-2);
  }
  
  .modal-thumbnail-img {
    width: 60px;
    height: 45px;
  }
  
  .modal-nav-arrow {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }
  
  .modal-main-image {
    max-height: 60vh;
  }
  
  .recipe-content {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
  
  .recipe-meta {
    flex-direction: column;
    gap: var(--space-4);
  }
  
  .action-buttons {
    flex-wrap: wrap;
    gap: var(--space-3);
  }
  
  .btn {
    flex: 1;
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .recipe-details {
    padding: var(--space-4) var(--space-3);
  }
  
  .recipe-header {
    padding: var(--space-4);
  }
  
  .recipe-title {
    font-size: var(--font-size-2xl);
  }
  
  .step-item {
    padding: var(--space-4);
  }
  
  .ingredient-item {
    padding: var(--space-3);
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
  
  .gallery-modal {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .gallery-modal-header {
    padding: var(--space-4);
  }
  
  .gallery-modal-title {
    font-size: var(--font-size-lg);
  }
  
  .modal-thumbnails {
    padding: var(--space-4);
    gap: var(--space-2);
  }
  
  .modal-thumbnail-img {
    width: 60px;
    height: 45px;
  }
  
  .modal-nav-arrow {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }
  
  .modal-main-image {
    max-height: 60vh;
  }
}
</style>