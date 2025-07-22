<template>
  <div class="create-recipe-page">
    <!-- Styled Notification -->
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

    <div class="create-recipe-container">
      <div class="page-header">
        <h1 class="page-title">Create New Recipe</h1>
        <p class="page-subtitle">Share your culinary creation with the FlavorCraft community</p>
      </div>

      <!-- recipe form -->
      <form @submit.prevent="saveRecipe" class="recipe-form">
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
                <option value="1">Easy</option>
                <option value="2">Medium</option>
                <option value="3">Hard</option>
                <option value="4">Very Hard</option>
                <option value="5">Expert</option>
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

        <!-- image -->
        <div class="form-section">
          <h2 class="section-title">
            <i data-lucide="image" class="section-icon"></i>
            Recipe Images
          </h2>
          
          <div class="image-upload-section">
            <!-- Upload Button Area (always visible when under 5 images) -->
            <div class="image-upload" v-if="selectedImages.length < 5">
              <div class="upload-placeholder" @click="triggerFileInput">
                <i data-lucide="camera" class="upload-icon-lucide"></i>
                <p v-if="selectedImages.length === 0">Add delicious photos of your recipe</p>
                <p v-else>Add more images ({{ selectedImages.length }}/5)</p>
                <button type="button" class="upload-btn">
                  Choose Image Files
                </button>
                <p class="upload-help">JPG, PNG, or WebP • Max 5MB each • Up to 5 images</p>
                <input 
                  ref="fileInput"
                  type="file" 
                  @change="handleImageUpload"
                  accept="image/*"
                  multiple
                  class="file-input-hidden"
                />
              </div>
            </div>
            
            <!-- Show when limit reached -->
            <div v-if="selectedImages.length >= 5" class="upload-limit-message">
              <i data-lucide="alert-circle" class="limit-icon"></i>
              <p>Maximum of 5 images reached</p>
              <button type="button" class="btn-secondary small" @click="removeImage(selectedImages.length - 1)">
                Remove Last Image
              </button>
            </div>
          </div>
          
          <!-- Image Preview Grid (separate section) -->
          <div class="image-preview-section" v-if="selectedImages.length > 0">
            <h3 class="preview-title">Selected Images ({{ selectedImages.length }}/5)</h3>
            <div class="image-preview-grid">
              <div 
                v-for="(imageData, index) in imagePreviewData" 
                :key="index"
                class="image-preview-item"
              >
                <img :src="imageData.preview" :alt="imageData.name" />
                <button 
                  type="button" 
                  class="remove-image-btn" 
                  @click="removeImage(index)"
                  title="Remove image"
                >
                  <i data-lucide="x" class="remove-icon"></i>
                </button>
                <div class="image-info">
                  <p class="image-name">{{ imageData.name }}</p>
                  <p class="image-size">{{ Math.round(imageData.size / 1024) }} KB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                  <option value="cup">cup</option>
                  <option value="tbsp">tbsp</option>
                  <option value="tsp">tsp</option>
                  <option value="oz">oz</option>
                  <option value="lb">lb</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="piece">piece</option>
                  <option value="clove">clove</option>
                  <option value="bunch">bunch</option>
                  <option value="slice">slice</option>
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
          <button type="submit" class="btn-primary" :disabled="!isFormValid || isSaving">
            <i :data-lucide="isSaving ? 'loader-2' : (isFormValid ? 'send' : 'alert-circle')" 
               :class="{ 'spinning': isSaving }" 
               class="btn-icon"></i>
            {{ isSaving ? 'Publishing...' : (isFormValid ? 'Publish Recipe' : 'Fill Required Fields') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const API_BASE_URL = 'http://localhost:8080';

const emit = defineEmits(['go-home', 'recipe-created'])

// Helper function to reinitialize Lucide icons
function reinitializeIcons() {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons();
      console.log('CreateRecipe: Icons reinitialized');
    }
  }, 50);
}

const fileInput = ref(null)
const isSaving = ref(false)
const selectedImages = ref([])

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

  async createRecipe(recipeData) {
    return this.request('/recipe', {
      method: 'POST',
      body: JSON.stringify(recipeData)
    });
  },

  async createRecipeWithImages(formData) {
    const url = `${API_BASE_URL}/recipe`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }
      return data;
    } else {
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }
      return { success: true };
    }
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

function triggerFileInput() {
  fileInput.value?.click()
}

function handleImageUpload(event) {
  const files = Array.from(event.target.files);
  
  if (files.length === 0) return;
  
  if (selectedImages.value.length + files.length > 5) {
    showNotification('warning', 'You can only upload up to 5 images total', 'Upload Limit');
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    return;
  }

  const maxSize = 5 * 1024 * 1024;
  
  for (const file of files) {
    if (file.size > maxSize) {
      showNotification('error', `Image "${file.name}" is too large. Please choose images smaller than 5MB`, 'File Too Large');
      if (fileInput.value) {
        fileInput.value.value = '';
      }
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      showNotification('error', `"${file.name}" is not a valid image file`, 'Invalid File Type');
      if (fileInput.value) {
        fileInput.value.value = '';
      }
      return;
    }
  }

  files.forEach(file => {
    const imageData = {
      file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file)
    };
    selectedImages.value.push(imageData);
  });
  
  showNotification('success', `Added ${files.length} image${files.length > 1 ? 's' : ''} successfully`, 'Images Added');
  
  console.log('Selected images:', selectedImages.value.map(img => img.name));
  
  if (fileInput.value) {
    fileInput.value.value = '';
  }

  reinitializeIcons();
}

function removeImage(index) {
  const imageData = selectedImages.value[index];
  
  if (imageData && imageData.preview) {
    URL.revokeObjectURL(imageData.preview);
  }
  
  selectedImages.value.splice(index, 1);
  console.log('Removed image at index', index, 'Remaining:', selectedImages.value.length);

  reinitializeIcons();
}

const imagePreviewData = computed(() => {
  return selectedImages.value.map((imageData, index) => ({
    ...imageData,
    index
  }));
});

async function saveRecipe() {
  if (!isFormValid.value) {
    showNotification('warning', 'Please fill in all required fields to publish your recipe', 'Missing Information');
    return;
  }

  try {
    isSaving.value = true;
    

    reinitializeIcons();

    const formData = new FormData();
    
    formData.append('name', recipeForm.value.title);
    formData.append('description', recipeForm.value.description);
    
    const ingredients = recipeForm.value.ingredients
      .filter(ing => ing.name.trim() !== '')
      .map(ing => ({
        name: ing.name,
        quantity: parseFloat(ing.quantity) || 1,
        unit: ing.unit || '',
        notes: ''
      }));
    
    const instructions = recipeForm.value.instructions
      .filter(inst => inst.Steps.trim() !== '')
      .map(inst => ({
        Steps: inst.Steps
      }));
    
    formData.append('ingredients', JSON.stringify(ingredients));
    formData.append('instructions', JSON.stringify(instructions));
    formData.append('time', recipeForm.value.cookTime);
    formData.append('difficulty', recipeForm.value.difficulty);
    formData.append('rating', 5);
    
    if (recipeForm.value.servings) {
      formData.append('servings', recipeForm.value.servings);
    }
    if (recipeForm.value.category) {
      formData.append('category', recipeForm.value.category);
    }
    if (recipeForm.value.cuisine) {
      formData.append('cuisine', recipeForm.value.cuisine);
    }
    if (recipeForm.value.notes) {
      formData.append('notes', recipeForm.value.notes);
    }
    
    selectedImages.value.forEach((imageData) => {
      formData.append('images', imageData.file);
    });

    console.log('Sending recipe data with', selectedImages.value.length, 'images');
    console.log('Recipe name:', recipeForm.value.title);
    console.log('Ingredients count:', ingredients.length);
    console.log('Instructions count:', instructions.length);
    
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(pair[0], 'FILE:', pair[1].name, pair[1].size, 'bytes');
      } else {
        console.log(pair[0], pair[1]);
      }
    }

    const response = await api.createRecipeWithImages(formData);
    
    console.log('Recipe created successfully:', response);
    
    showNotification('success', `"${recipeForm.value.title}" has been published successfully!`, 'Recipe Published');
    
    emit('recipe-created', response.recipe);
    
    resetForm();
    goBack();

  } catch (error) {
    console.error('Failed to create recipe:', error);
    showNotification('error', `Failed to create recipe: ${error.message}`, 'Creation Failed');
  } finally {
    isSaving.value = false;
    reinitializeIcons();
  }
}

function resetForm() {
  selectedImages.value.forEach(imageData => {
    if (imageData.preview) {
      URL.revokeObjectURL(imageData.preview);
    }
  });
  
  recipeForm.value = {
    title: '',
    description: '',
    difficulty: '',
    cookTime: '',
    servings: '',
    imageUrl: '',
    category: '',
    cuisine: '',
    notes: '',
    ingredients: [{ quantity: '', unit: '', name: '' }],
    instructions: [{ Steps: '' }]
  };
  
  selectedImages.value = [];
  
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  
  console.log('Form reset');
}

function goBack() {
  emit('go-home')
}

onMounted(() => {
  console.log('CreateRecipe component mounted');
  
  //init lucide icons
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons();
      console.log('CreateRecipe: Initial icons loaded');
    }
  }, 200);
});

onUnmounted(() => {
  selectedImages.value.forEach(imageData => {
    if (imageData.preview) {
      URL.revokeObjectURL(imageData.preview);
    }
  });
});
</script>

<style>


/* ===== ADD THESE LUCIDE ICON STYLES TO YOUR EXISTING CSS ===== */

/* ===== LUCIDE ICON BASE STYLES ===== */
[data-lucide] {
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ===== NAVIGATION & BUTTON ICONS ===== */
.back-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.btn-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  stroke-width: 2;
}

.btn-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

.limit-icon {
  width: 20px;
  height: 20px;
  color: #856404;
  margin-right: 8px;
  stroke-width: 2;
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

/* ===== NOTIFICATION ICONS ===== */
.notification-icon-lucide {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ===== REMOVE THE OLD EMOJI-BASED NOTIFICATION ICON ANIMATION ===== */
/* Replace this in your existing CSS: */
.notification-icon {
  font-size: 20px;
  margin-top: 2px;
  flex-shrink: 0;
  /* REMOVE: animation: iconPulse 0.6s ease-out; */
}

/* ===== ALSO REMOVE THIS ANIMATION FROM YOUR CSS ===== */
/*
@keyframes iconPulse {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
*/

/* ===== ENHANCED BUTTON STYLING FOR ICONS ===== */
.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.add-ingredient-btn,
.add-step-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.remove-ingredient-btn,
.remove-step-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== RESPONSIVE ICON SIZING ===== */
@media (max-width: 768px) {
  .section-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }
  
  .upload-icon-lucide {
    width: 40px;
    height: 40px;
  }
  
  .btn-icon {
    width: 16px;
    height: 16px;
    margin-right: 6px;
  }
}

@media (max-width: 480px) {
  .section-icon {
    width: 18px;
    height: 18px;
    margin-right: 6px;
  }
  
  .upload-icon-lucide {
    width: 36px;
    height: 36px;
  }
  
  .back-icon,
  .btn-icon {
    width: 14px;
    height: 14px;
    margin-right: 4px;
  }
}

/* ===== CREATE RECIPE PAGE STYLES ===== */
.create-recipe-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: var(--space-6);
}

.create-recipe-container {
  max-width: 800px;
  margin: 0 auto;
}

/* ===== PAGE HEADER ===== */
.page-header {
  text-align: center;
  margin-bottom: var(--space-8);
}
.image-upload-section {
  margin-bottom: 30px;
}

.image-upload {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.upload-placeholder {
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: #f9f9f9;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-placeholder:hover {
  border-color: #007bff;
  background: #f0f8ff;
}

.upload-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
}

.upload-btn {
  margin: 15px 0;
  padding: 12px 30px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.upload-btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
}

.upload-help {
  font-size: 14px;
  color: #666;
  margin: 10px 0 0 0;
}

.file-input-hidden {
  display: none;
}

.upload-limit-message {
  text-align: center;
  padding: 20px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  color: #856404;
}

.upload-limit-message p {
  margin: 0 0 10px 0;
  font-weight: 600;
}

.btn-secondary.small {
  padding: 8px 16px;
  font-size: 14px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-secondary.small:hover {
  background: #5a6268;
}

/* Image Preview Section */
.image-preview-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.image-preview-item {
  position: relative;
  border: 2px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.image-preview-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  border-color: #007bff;
}

.image-preview-item img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.remove-image-btn:hover {
  background-color: rgba(220, 53, 69, 1);
  opacity: 1;
  transform: scale(1.1);
}

.image-info {
  padding: 12px;
  text-align: center;
  background: #f8f9fa;
}

.image-name {
  font-size: 13px;
  margin: 0 0 4px 0;
  word-break: break-all;
  color: #333;
  font-weight: 600;
  line-height: 1.3;
}

.image-size {
  font-size: 12px;
  margin: 0;
  color: #666;
  font-weight: 500;
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

.upload-icon {
  font-size: 3rem;
  display: block;
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
.btn-secondary {
  padding: var(--space-4) var(--space-8);
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
  min-width: 160px;
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

/* Add this to your existing <style> section */

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
  background: var(--background-primary, white);
  border-radius: var(--radius-xl, 16px);
  box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
  border: 1px solid var(--background-tertiary, #e2e8f0);
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
  background: var(--primary-color, #ff6b6b);
}

.notification-success {
  background: linear-gradient(135deg, var(--background-primary, white) 0%, var(--success-light, #d1fae5) 100%);
}

.notification-success::before {
  background: var(--success-color, #10b981);
}

.notification-error {
  background: linear-gradient(135deg, var(--background-primary, white) 0%, #fee2e2 100%);
}

.notification-error::before {
  background: var(--danger-color, #ef4444);
}

.notification-warning {
  background: linear-gradient(135deg, var(--background-primary, white) 0%, #fef3c7 100%);
}

.notification-warning::before {
  background: var(--warning-color, #f59e0b);
}

.notification-info {
  background: linear-gradient(135deg, var(--background-primary, white) 0%, var(--primary-light, #ffe6e6) 100%);
}

.notification-info::before {
  background: var(--primary-color, #ff6b6b);
}

.notification-icon {
  font-size: 20px;
  margin-top: 2px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--text-primary, #2c3e50);
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-message {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--text-secondary, #5a6c7d);
  line-height: 1.5;
  word-wrap: break-word;
}

.notification-close {
  background: none;
  border: none;
  font-size: 14px;
  color: var(--text-muted, #8492a6);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm, 4px);
  transition: all var(--transition-fast, 150ms ease-in-out);
  flex-shrink: 0;
  margin-top: -2px;
}

.notification-close:hover {
  background: var(--background-tertiary, #e2e8f0);
  color: var(--text-primary, #2c3e50);
  transform: scale(1.1);
}

/* Mobile responsive */
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
    font-size: var(--font-size-xs, 0.75rem);
  }
  
  .notification-message {
    font-size: var(--font-size-xs, 0.75rem);
  }
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
  .create-recipe-page {
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
  .btn-secondary {
    width: 100%;
  }
    .image-preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .upload-placeholder {
    padding: 30px 15px;
  }
  
  .upload-icon {
    font-size: 2.5rem;
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
  
  .upload-icon {
    font-size: 2rem;
  }
    .image-preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
  
  .image-preview-item img {
    height: 100px;
  }
  
  .upload-placeholder {
    padding: 25px 10px;
  }
  
  .upload-icon {
    font-size: 2rem;
 }
}

/* ===== ACCESSIBILITY ===== */
.back-btn:focus,
.btn-primary:focus,
.btn-secondary:focus,
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