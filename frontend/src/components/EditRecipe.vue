<template>
  <div class="edit-recipe-page">
    <div class="edit-recipe-container">
      <div class="page-header">
        <button class="back-btn" @click="goBack">
          ← Back to Home
        </button>
        <h1 class="page-title">Edit Recipe</h1>
        <p class="page-subtitle">Update your culinary creation</p>
      </div>

      
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner">⟳</div>
        <p>Loading recipe...</p>
      </div>

    
      <form v-else @submit.prevent="updateRecipe" class="recipe-form">
        <div class="form-section">
          <h2 class="section-title">Basic Information</h2>
          
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


        <div class="form-section">
          <h2 class="section-title">Recipe Image</h2>
          
          <div class="image-upload-section">
            <div class="image-preview" v-if="recipeForm.imageUrl">
              <img :src="recipeForm.imageUrl" alt="Recipe preview" />
              <button type="button" class="remove-image-btn" @click="removeImage">
                ✕
              </button>
            </div>
            
            <div class="image-upload" v-else>
              <div class="upload-placeholder" @click="triggerFileInput">
                <span class="upload-icon">📷</span>
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

   
        <div class="form-section">
          <h2 class="section-title">Ingredients</h2>
          
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
                ✕
              </button>
            </div>
          </div>
          
          <button type="button" class="add-ingredient-btn" @click="addIngredient">
            + Add Ingredient
          </button>
        </div>

 
        <div class="form-section">
          <h2 class="section-title">Cooking Instructions</h2>
          
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
                ✕
              </button>
            </div>
          </div>
          
          <button type="button" class="add-step-btn" @click="addInstruction">
            + Add Step
          </button>
        </div>

        
        <div class="form-section">
          <h2 class="section-title">Categories</h2>
          
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
          <h2 class="section-title">Chef's Notes (Optional)</h2>
          
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
            Cancel
          </button>
          <button type="button" class="btn-danger" @click="deleteRecipe" v-if="recipeId">
            Delete Recipe
          </button>
          <button type="submit" class="btn-primary" :disabled="!isFormValid || isSaving">
            {{ isSaving ? 'Updating...' : (isFormValid ? 'Update Recipe' : 'Fill Required Fields') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_BASE_URL = 'http://localhost:8080';

const props = defineProps({
  recipeId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['go-home', 'recipe-updated', 'recipe-deleted'])

const fileInput = ref(null)
const isSaving = ref(false)
const isLoading = ref(true)

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

</script>


<style scoped>

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
  font-size: 3rem;
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
  transition: var(--transition-fast);
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
  
  .upload-icon {
    font-size: 2rem;
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