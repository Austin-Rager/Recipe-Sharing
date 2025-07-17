<template>
  <div class="recipe-details-page">
    <div class="recipe-details">
      <!-- Recipe Header Section -->
      <div class="recipe-header" v-if="recipe">
        <div class="recipe-image">
          <img :src="recipe.image" :alt="recipe.title" />
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
            <button class="btn btn-home" @click="goToHome">
              <span>← Back to Home</span>
            </button>
            <button class="btn btn-like" @click="likeRecipe">
              <span>{{ recipe.isLiked ? '❤️ Liked' : '🤍 Like' }}</span>
            </button>
            <button class="btn btn-edit" @click="editRecipe">
              <span>✏️ Edit</span> 
            </button>
            <button class="btn btn-save" @click="saveRecipe">
              <span>📌 Save</span> 
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  recipeData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['go-home'])

// Ingredients checklist state
const checkedIngredients = ref({})

// Use the recipe data from props
const recipe = computed(() => {
  if (!props.recipeData) return null;
  
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
  
  return {
    title: props.recipeData.title || props.recipeData.name || 'Recipe',
    description: props.recipeData.description || 'Delicious recipe',
    image: props.recipeData.image || 
           (props.recipeData.images?.length > 0 ? props.recipeData.images[0].url : 'https://via.placeholder.com/400x300'),
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
const likeRecipe = () => {
  if (recipe.value) {
    recipe.value.isLiked = !recipe.value.isLiked
    console.log(recipe.value.isLiked ? 'Recipe liked!' : 'Recipe unliked!')
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

// Initialize checklist state on mount
onMounted(() => {
  if (props.recipeData) {
    initializeIngredients(props.recipeData)
  }
})

// Watch for recipe changes to reinitialize checklist
watch(() => props.recipeData, (newRecipe) => {
  if (newRecipe) {
    initializeIngredients(newRecipe)
  }
}, { immediate: true })
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

.recipe-image img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: var(--radius-xl);
  background: linear-gradient(45deg, #f0f4f8, #d6e1ea);
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
  background: var(--warning-color, #f59e0b);
  color: white;
}

.btn-edit:hover {
  background: #d97706;
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
  
  .recipe-image img {
    height: 240px;
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
}
</style>