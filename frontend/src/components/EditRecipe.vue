<template>
  <div class="edit-recipe-page">
    <!-- Notification Overlay -->
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

    <div class="edit-recipe-container">
      <div class="page-header">
        <h1 class="page-title">Edit Recipe</h1>
        <p class="page-subtitle">Update your culinary creation</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <i data-lucide="loader-2" class="loading-spinner"></i>
        <p>Loading recipe...</p>
      </div>

      <!-- Recipe Form -->
      <form v-else @submit.prevent="updateRecipe" class="recipe-form">
        <div class="form-section">
          <h2 class="section-title">
            <i data-lucide="info" class="section-icon"></i>
            Basic Information
          </h2>
          
          <div class="form-row">
            <div class="form-group full-width">
              <label for="title">Recipe Title *</label>
              <input 
                type="text" 
                id="title" 
                v-model="recipeForm.title"
                placeholder="Enter a catchy recipe title"
                required
                maxlength="100"
              />
              <span class="char-count">{{ recipeForm.title.length }}/100</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label for="description">Short Description *</label>
              <textarea 
                id="description" 
                v-model="recipeForm.description"
                placeholder="Brief description of your recipe (what makes it special?)"
                rows="3"
                required
                maxlength="250"
              ></textarea>
              <span class="char-count">{{ recipeForm.description.length }}/250</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="difficulty">Difficulty Level *</label>
              <select id="difficulty" v-model="recipeForm.difficulty" required>
                <option value="">Select difficulty</option>
                <option value="3">Easy</option>
                <option value="4">Medium</option>
                <option value="5">Hard</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="cookTime">Cook Time (minutes) *</label>
              <input 
                type="number" 
                id="cookTime" 
                v-model="recipeForm.cookTime"
                placeholder="e.g., 30"
                required
                min="1"
                max="600"
              />
            </div>
            
            <div class="form-group">
              <label for="servings">Servings *</label>
              <input 
                type="number" 
                id="servings" 
                v-model="recipeForm.servings"
                placeholder="e.g., 4"
                required
                min="1"
                max="20"
              />
            </div>
          </div>
        </div>

        <!-- Recipe Image -->
        <div class="form-section">
          <h2 class="section-title">
            <i data-lucide="image" class="section-icon"></i>
            Recipe Image
          </h2>
          
          <div class="image-upload-section">
            <div class="image-preview" v-if="recipeForm.imageUrl">
              <img :src="recipeForm.imageUrl" alt="Recipe preview" />
              <button type="button" class="remove-image-btn" @click="removeImage">
                <i data-lucide="x" class="remove-icon"></i>
              </button>
            </div>
            
            <div class="image-upload" v-else>
              <div class="upload-placeholder" @click="triggerFileInput">
                <i data-lucide="camera" class="upload-icon-lucide"></i>
                <p>Add a delicious photo of your recipe</p>
                <button type="button" class="upload-btn">
                  Choose Image File
                </button>
                <p class="upload-help">JPG, PNG, or WebP • Max 5MB</p>
                <input 
                  ref="fileInput"
                  type="file" 
                  @change="handleImageUpload"
                  accept="image/*"
                  class="file-input-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Ingredients -->
        <div class="form-section">
          <h2 class="section-title">
            <i data-lucide="list-ordered" class="section-icon"></i>
            Ingredients
          </h2>
          
          <div class="ingredients-list">
            <div 
              v-for="(ingredient, index) in recipeForm.ingredients" 
              :key="index"
              class="ingredient-item"
            >
              <div class="ingredient-inputs">
                <input 
                  type="text" 
                  v-model="ingredient.quantity"
                  placeholder="Amount"
                  class="amount-input"
                />
                <select 
                  v-model="ingredient.unit"
                  class="unit-input"
                >
                  <option value="">Unit</option>
                  <option value="piece">piece</option>
                  <option value="cup">cup</option>
                  <option value="tbsp">tbsp</option>
                  <option value="tsp">tsp</option>
                  <option value="lb">lb</option>
                  <option value="oz">oz</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="clove">clove</option>
                </select>
                <input 
                  type="text" 
                  v-model="ingredient.name"
                  placeholder="Ingredient name"
                  class="ingredient-input"
                  required
                />
              </div>
              <button 
                type="button" 
                class="remove-ingredient-btn"
                @click="removeIngredient(index)"
                v-if="recipeForm.ingredients.length > 1"
              >
                <i data-lucide="minus" class="remove-icon"></i>
              </button>
            </div>
          </div>
          
          <button type="button" class="add-ingredient-btn" @click="addIngredient">
            <i data-lucide="plus" class="add-icon"></i>
            Add Ingredient
          </button>
        </div>

        <!-- Cooking Instructions -->
        <div class="form-section">
          <h2 class="section-title">
            <i data-lucide="list-ordered" class="section-icon"></i>
            Cooking Instructions
          </h2>
          
          <div class="instructions-list">
            <div 
              v-for="(step, index) in recipeForm.instructions" 
              :key="index"
              class="instruction-item"
            >
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <textarea 
                  v-model="step.Steps"
                  :placeholder="`Step ${index + 1}: Describe what to do...`"
                  rows="3"
                  class="step-input"
                  required
                ></textarea>
              </div>
              <button 
                type="button" 
                class="remove-step-btn"
                @click="removeInstruction(index)"
                v-if="recipeForm.instructions.length > 1"
              >
                <i data-lucide="minus" class="remove-icon"></i>
              </button>
            </div>
          </div>
          
          <button type="button" class="add-step-btn" @click="addInstruction">
            <i data-lucide="plus" class="add-icon"></i>
            Add Step
          </button>
        </div>

        <!-- Categories -->
        <div class="form-section">
          <h2 class="section-title">
            <i data-lucide="tags" class="section-icon"></i>
            Categories
          </h2>
          
          <div class="form-row">
            <div class="form-group">
              <label for="category">Main Category</label>
              <select id="category" v-model="recipeForm.category">
                <option value="">Select category</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="dessert">Dessert</option>
                <option value="appetizer">Appetizer</option>
                <option value="snack">Snack</option>
                <option value="beverage">Beverage</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="cuisine">Cuisine Type</label>
              <select id="cuisine" v-model="recipeForm.cuisine">
                <option value="">Select cuisine</option>
                <option value="american">American</option>
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
                <option value="asian">Asian</option>
                <option value="french">French</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="indian">Indian</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Chef's Notes -->
        <div class="form-section">
          <h2 class="section-title">
            <i data-lucide="sticky-note" class="section-icon"></i>
            Chef's Notes (Optional)
          </h2>
          
          <div class="form-group">
            <label for="notes">Additional Tips & Notes</label>
            <textarea 
              id="notes" 
              v-model="recipeForm.notes"
              placeholder="Share any tips, substitutions, or story behind this recipe..."
              rows="4"
              maxlength="500"
            ></textarea>
            <span class="char-count">{{ recipeForm.notes.length }}/500</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="goBack">
            <i data-lucide="x" class="btn-icon"></i>
            Cancel
          </button>
          <button type="button" class="btn-danger" @click="deleteRecipe" v-if="recipeId">
            <i data-lucide="trash-2" class="btn-icon"></i>
            Delete Recipe
          </button>
          <button type="submit" class="btn-primary" :disabled="!isFormValid || isSaving">
            <i :data-lucide="isSaving ? 'loader-2' : (isFormValid ? 'save' : 'alert-circle')" 
               :class="{ 'spinning': isSaving }" 
               class="btn-icon"></i>
            {{ isSaving ? 'Updating...' : (isFormValid ? 'Update Recipe' : 'Fill Required Fields') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const props = defineProps({
  recipeId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['go-home', 'recipe-updated', 'recipe-deleted'])

// Helper function to reinitialize Lucide icons
function reinitializeIcons() {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons();
      console.log('EditRecipe: Icons reinitialized');
    }
  }, 50);
}

const fileInput = ref(null)
const isSaving = ref(false)
const isLoading = ref(true)
const notification = ref({
  show: false,
  type: 'info',
  title: '',
  message: '',
  icon: ''
})

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

  async getRecipe(id) {
    return this.request(`/recipe/${id}`);
  },

  async updateRecipe(id, recipeData) {
    return this.request(`/recipe/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipeData)
    });
  },

  async deleteRecipe(id) {
    return this.request(`/recipe/${id}`, {
      method: 'DELETE'
    });
  }
};

const recipeForm = ref({
  title: '',
  description: '',
  difficulty: '',
  cookTime: '',
  servings: '',
  imageUrl: '',
  category: '',
  cuisine: '',
  notes: '',
  ingredients: [
    { quantity: '', unit: '', name: '' }
  ],
  instructions: [
    { Steps: '' }
  ]
})

const isFormValid = computed(() => {
  const form = recipeForm.value
  const hasBasicInfo = form.title && form.description && form.difficulty && form.cookTime && form.servings
  const hasIngredients = form.ingredients.some(ing => ing.name.trim() !== '')
  const hasInstructions = form.instructions.some(inst => inst.Steps.trim() !== '')
  
  return hasBasicInfo && hasIngredients && hasInstructions
})

// Parse time string to extract minutes
function parseTime(timeString) {
  if (!timeString) return 30;
  const match = timeString.match(/(\d+)/);
  return match ? parseInt(match[1]) : 30;
}

// Convert backend recipe data to form format
function populateForm(recipeData) {
  recipeForm.value = {
    title: recipeData.name || '',
    description: recipeData.description || '',
    difficulty: recipeData.difficulty?.toString() || '',
    cookTime: parseTime(recipeData.time),
    servings: recipeData.servings || '',
    imageUrl: recipeData.images?.length > 0 ? recipeData.images[0].url : '',
    category: recipeData.category || '',
    cuisine: recipeData.cuisine || '',
    notes: recipeData.notes || '',
    ingredients: recipeData.ingredients?.length > 0 
      ? recipeData.ingredients.map(ing => ({
          quantity: ing.quantity?.toString() || '',
          unit: ing.unit || '',
          name: ing.name || ''
        }))
      : [{ quantity: '', unit: '', name: '' }],
    instructions: recipeData.instructions?.length > 0 
      ? recipeData.instructions.map(inst => ({
          Steps: inst.Steps || ''
        }))
      : [{ Steps: '' }]
  };
}

// Load recipe data on mount
onMounted(async () => {
  try {
    console.log('Loading recipe with ID:', props.recipeId);
    const response = await api.getRecipe(props.recipeId);
    console.log('Recipe loaded:', response);
    populateForm(response.recipe || response);
  } catch (error) {
    console.error('Failed to load recipe:', error);
    showNotification('error', `Failed to load recipe: ${error.message}`, 'Load Failed');
    goBack();
  } finally {
    isLoading.value = false;
    reinitializeIcons();
  }
});

function addIngredient() {
  recipeForm.value.ingredients.push({ quantity: '', unit: '', name: '' })
  reinitializeIcons();
}

function removeIngredient(index) {
  if (recipeForm.value.ingredients.length > 1) {
    recipeForm.value.ingredients.splice(index, 1)
    reinitializeIcons();
  }
}

function addInstruction() {
  recipeForm.value.instructions.push({ Steps: '' })
  reinitializeIcons();
}

function removeInstruction(index) {
  if (recipeForm.value.instructions.length > 1) {
    recipeForm.value.instructions.splice(index, 1)
    reinitializeIcons();
  }
}

function removeImage() {
  recipeForm.value.imageUrl = ''
  reinitializeIcons();
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    showNotification('error', 'Image file is too large. Please choose an image smaller than 5MB.', 'File Too Large');
    return
  }

  if (!file.type.startsWith('image/')) {
    showNotification('error', 'Please select a valid image file.', 'Invalid File Type');
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    recipeForm.value.imageUrl = e.target.result
    showNotification('success', 'Image uploaded successfully!', 'Image Added');
    reinitializeIcons();
  }
  reader.onerror = () => {
    showNotification('error', 'Error reading the image file. Please try again.', 'File Error');
    reinitializeIcons();
  }
  reader.readAsDataURL(file)
}

async function updateRecipe() {
  if (!isFormValid.value) {
    showNotification('warning', 'Please fill in all required fields to update your recipe.', 'Missing Information');
    return
  }

  try {
    isSaving.value = true;
    reinitializeIcons();

    const backendRecipeData = {
      name: recipeForm.value.title,
      description: recipeForm.value.description,
      ingredients: recipeForm.value.ingredients
        .filter(ing => ing.name.trim() !== '')
        .map(ing => ({
          name: ing.name,
          quantity: parseFloat(ing.quantity) || 1,
          unit: ing.unit || '',
          notes: ''
        })),
      instructions: recipeForm.value.instructions
        .filter(inst => inst.Steps.trim() !== '')
        .map(inst => ({
          Steps: inst.Steps
        })),
      time: `${recipeForm.value.cookTime} minutes`,
      difficulty: parseInt(recipeForm.value.difficulty),
      rating: 5,
      servings: recipeForm.value.servings || '',
      category: recipeForm.value.category || '',
      cuisine: recipeForm.value.cuisine || '',
      notes: recipeForm.value.notes || ''
    };

    console.log('Updating recipe data:', backendRecipeData);

    const response = await api.updateRecipe(props.recipeId, backendRecipeData);
    
    console.log('Recipe updated successfully:', response);
    
    showNotification('success', `Recipe "${recipeForm.value.title}" updated successfully!`, 'Update Successful');
    
    emit('recipe-updated', response.recipe);
    goBack();

  } catch (error) {
    console.error('Failed to update recipe:', error);
    showNotification('error', `Failed to update recipe: ${error.message}`, 'Update Failed');
  } finally {
    isSaving.value = false;
    reinitializeIcons();
  }
}

async function deleteRecipe() {
  if (!confirm(`Are you sure you want to delete "${recipeForm.value.title}"? This action cannot be undone.`)) {
    return;
  }

  try {
    isSaving.value = true;
    reinitializeIcons();
    
    await api.deleteRecipe(props.recipeId);
    
    showNotification('success', `Recipe "${recipeForm.value.title}" deleted successfully!`, 'Delete Successful');
    
    emit('recipe-deleted', props.recipeId);
    goBack();

  } catch (error) {
    console.error('Failed to delete recipe:', error);
    showNotification('error', `Failed to delete recipe: ${error.message}`, 'Delete Failed');
  } finally {
    isSaving.value = false;
    reinitializeIcons();
  }
}

function goBack() {
  emit('go-home')
  reinitializeIcons();
}
</script>

<style scoped>
/* ===== LUCIDE ICON BASE STYLES ===== */
[data-lucide] {
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ===== NAVIGATION & BUTTON ICONS ===== */
.btn-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  stroke-width: 2;
}

.btn-icon.spinning {
  animation: spin 1s linear infinite;
}

/* ===== SECTION HEADER ICONS ===== */
.section-icon {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
  margin-right: 12px;
  stroke-width: 2.5;
  flex-shrink: 0;
}

/* ===== UPLOAD & IMAGE ICONS ===== */
.upload-icon-lucide {
  width: 48px;
  height: 48px;
  color: var(--primary-color);
  margin-bottom: 16px;
  stroke-width: 1.5;
}

.remove-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2.5;
}

/* ===== ADD/REMOVE ACTION ICONS ===== */
.add-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  stroke-width: 2.5;
}

/* ===== NOTIFICATION STYLES (FROM Home.vue) ===== */
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

.notification-icon-lucide {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  animation: shake 0.6s ease-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

/* ===== EDIT RECIPE PAGE STYLES ===== */
.edit-recipe-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: var(--space-6);
}

.edit-recipe-container {
  max-width: 800px;
  margin: 0 auto;
}

/* ===== LOADING STATE ===== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--background-tertiary);
}

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

.loading-container p {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

/* ===== PAGE HEADER ===== */
.page-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background: var(--background-secondary);
  border: 2px solid var(--background-tertiary);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: var(--space-6);
}

.back-btn:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
  transform: translateX(-2px);
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  letter-spacing: -0.025em;
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0;
}

/* ===== FORM SECTIONS ===== */
.recipe-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.form-section {
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--background-tertiary);
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.section-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: var(--primary-color);
  border-radius: var(--radius-sm);
}

/* ===== FORM LAYOUTS ===== */
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-6);
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: var(--space-4);
  border: 2px solid var(--background-tertiary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  background: var(--background-primary);
  transition: border-color var(--transition-fast);
  outline: none;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.1);
}

.char-count {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-align: right;
  margin-top: var(--space-1);
}

/* ===== IMAGE UPLOAD SECTION ===== */
.image-upload-section {
  display: flex;
  justify-content: center;
}

.image-preview {
  position: relative;
  max-width: 400px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.image-preview img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
}

.remove-image-btn:hover {
  background: rgba(220, 38, 38, 0.8);
}

.image-upload {
  width: 100%;
  max-width: 400px;
}

.upload-placeholder {
  border: 2px dashed var(--background-tertiary);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  text-align: center;
  background: var(--background-secondary);
  transition: border-color var(--transition-fast);
  cursor: pointer;
}

.upload-placeholder:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.upload-icon-lucide {
  width: 48px;
  height: 48px;
  color: var(--primary-color);
  margin-bottom: var(--space-4);
}

.upload-btn {
  margin: var(--space-4) 0;
  padding: var(--space-3) var(--space-6);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
  justify-self: center;
}

.upload-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.file-input-hidden {
  display: none;
}

.upload-help {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin: 0;
}

/* ===== INGREDIENTS SECTION ===== */
.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--background-tertiary);
}

.ingredient-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: var(--space-3);
  flex: 1;
}

.amount-input,
.unit-input,
.ingredient-input {
  padding: var(--space-3);
  border: 1px solid var(--background-tertiary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--background-primary);
}

.remove-ingredient-btn {
  width: 32px;
  height: 32px;
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
}

.remove-ingredient-btn:hover {
  background: var(--danger-hover);
}

.add-ingredient-btn {
  padding: var(--space-3) var(--space-6);
  background: var(--primary-light);
  color: var(--primary-color);
  border: 2px dashed var(--primary-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-ingredient-btn:hover {
  background: var(--primary-color);
  color: white;
  border-style: solid;
}

/* ===== INSTRUCTIONS SECTION ===== */
.instructions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.instruction-item {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--background-tertiary);
}

.step-number {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--background-tertiary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  resize: vertical;
  min-height: 80px;
}

.remove-step-btn {
  width: 32px;
  height: 32px;
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--transition-fast);
}

.remove-step-btn:hover {
  background: var(--danger-hover);
}

.add-step-btn {
  padding: var(--space-3) var(--space-6);
  background: var(--success-light);
  color: var(--success-color);
  border: 2px dashed var(--success-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-step-btn:hover {
  background: var(--success-color);
  color: white;
  border-style: solid;
}

/* ===== FORM ACTIONS ===== */
.form-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  padding: var(--space-8);
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--background-tertiary);
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: var(--space-4) var(--space-8);
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
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
  background: var(--background-tertiary);
  color: var(--text-muted);
  cursor: not-allowed;
  transform: none;
  box-shadow: var(--shadow-sm);
}

.btn-secondary {
  background: var(--background-secondary);
  color: var(--text-secondary);
  border: 2px solid var(--background-tertiary);
}

.btn-secondary:hover {
  background: var(--background-tertiary);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background: var(--danger-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
  .edit-recipe-page {
    padding: var(--space-4);
  }
  
  .form-section {
    padding: var(--space-6);
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .ingredient-inputs {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
  
  .instruction-item {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .form-actions {
    flex-direction: column;
    padding: var(--space-6);
  }
  
  .btn-primary,
  .btn-secondary,
  .btn-danger {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: var(--font-size-3xl);
  }
  
  .section-title {
    font-size: var(--font-size-xl);
  }
  
  .upload-placeholder {
    padding: var(--space-6);
  }
  
  .upload-icon-lucide {
    width: 36px;
    height: 36px;
  }
  
  .btn-icon {
    width: 16px;
    height: 16px;
  }
  
  .section-icon {
    width: 20px;
    height: 20px;
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
.back-btn:focus,
.btn-primary:focus,
.btn-secondary:focus,
.btn-danger:focus,
.add-ingredient-btn:focus,
.add-step-btn:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
</style>