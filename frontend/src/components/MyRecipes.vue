<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// API function to fetch user's recipes
async function fetchUserRecipes() {
    try {
    const response = await fetch('http://localhost:8080/users-recipes', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You must be logged in to view your recipes');
        }
      throw new Error(`Failed to fetch recipes: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned invalid response. Make sure the backend is running on port 8080.');
      }

      const data = await response.json();
      return data.recipes;
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      throw error;
    }
  }

// Delete a recipe
async function deleteRecipe(recipeId) {
  try {
    const response = await fetch(`http://localhost:8080/recipe/${recipeId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to delete recipe');
    }

    // Remove from local array
    userRecipes.value = userRecipes.value.filter(recipe => recipe._id !== recipeId);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
}

// Reactive data
  const userRecipes = ref([]);
  const loading = ref(false);
  const error = ref(null);
const showDeleteModal = ref(false);
const recipeToDelete = ref(null);

// Navbar reactive data
const searchQuery = ref('');
const showProfileMenu = ref(false);

// Load user recipes
  async function loadUserRecipes() {
    loading.value = true;
    error.value = null;

    try {
      const recipes = await fetchUserRecipes();
      userRecipes.value = recipes;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

// Helper functions
function getDifficultyText(difficulty) {
  const difficultyMap = {
    1: 'Easy',
    2: 'Medium', 
    3: 'Hard'
  };
  return difficultyMap[difficulty] || 'Unknown';
}

function openRecipe(recipe) {
  console.log('Opening recipe:', recipe.name);
  // Navigation logic here
}

function editRecipe(recipe) {
  console.log('Editing recipe:', recipe.name);
  // Navigation logic here
}

function confirmDelete(recipe) {
  recipeToDelete.value = recipe;
  showDeleteModal.value = true;
}

function cancelDelete() {
  showDeleteModal.value = false;
  recipeToDelete.value = null;
}

async function performDelete() {
  if (!recipeToDelete.value) return;
  
  try {
    await deleteRecipe(recipeToDelete.value._id);
    showDeleteModal.value = false;
    recipeToDelete.value = null;
    } catch (error) {
    alert('Failed to delete recipe: ' + error.message);
    }
  }

function goToCreateRecipe() {
  console.log('Navigate to create recipe');
  // Navigation logic here
}

// Navbar functions
function handleSearch() {
  console.log('Searching for:', searchQuery.value);
  // Search logic here
}

function goToHome() {
  console.log('Going to home page');
  // Navigation logic here
}

function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value;
}

function goToProfile() {
  showProfileMenu.value = false;
  console.log('Going to profile page');
  // Navigation logic here
}

function goToLikedRecipes() {
  showProfileMenu.value = false;
  console.log('Going to liked recipes');
  // Navigation logic here
}

function goToMyRecipes() {
  showProfileMenu.value = false;
  console.log('Already on my recipes page');
}

function logout() {
  showProfileMenu.value = false;
  
  if (confirm('Are you sure you want to logout?')) {
    console.log('Logging out...');
    // Logout logic here
  }
}

function handleClickOutside(event) {
  const profileSection = document.querySelector('.profile-section');
  if (profileSection && !profileSection.contains(event.target)) {
    showProfileMenu.value = false;
    }
  }

  onMounted(() => {
    loadUserRecipes();
  document.addEventListener('click', handleClickOutside);
  });

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="my-recipes-page">
    

    <div class="page-header">
      <h1>My Recipes</h1>
      <p>Recipes you've created and shared</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">⟳</div>
      <p>Loading your recipes...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>Error Loading Recipes</h3>
      <p>{{ error }}</p>
      <button @click="loadUserRecipes" class="retry-btn">Try Again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="userRecipes.length === 0" class="empty-state">
      <div class="empty-icon">🍳</div>
      <h3>No Recipes Yet</h3>
      <p>You haven't created any recipes yet. Start sharing your culinary creations!</p>
      <button @click="goToCreateRecipe" class="create-first-btn">Create Your First Recipe</button>
    </div>

    <!-- Recipes Grid -->
    <div v-else class="recipes-container">
      <div class="recipes-header">
        <h2>Your Recipes ({{ userRecipes.length }})</h2>
        <button @click="loadUserRecipes" class="refresh-btn">Refresh</button>
      </div>

      <div class="recipes-grid">
        <div 
          v-for="recipe in userRecipes" 
          :key="recipe._id" 
          class="recipe-card"
          @click="openRecipe(recipe)"
        >
          <div class="card-image">
            <img 
              :src="recipe.images && recipe.images.length > 0 ? recipe.images[0].url : 'https://via.placeholder.com/400x200?text=No+Image'" 
              :alt="recipe.name"
            />
            <div class="card-actions">
              <button @click.stop="editRecipe(recipe)" class="action-btn edit-btn">
                ✏️
              </button>
              <button @click.stop="confirmDelete(recipe)" class="action-btn delete-btn">
                🗑️
              </button>
            </div>
          </div>
          
          <div class="card-content">
            <h3>{{ recipe.name }}</h3>
            <p class="description">{{ recipe.description || 'No description available' }}</p>
            
            <div class="card-meta">
              <div class="meta-item">
                <span class="meta-label">Time:</span>
                <span class="meta-value">{{ recipe.time || 'N/A' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Difficulty:</span>
                <span class="meta-value difficulty" :class="`difficulty-${recipe.difficulty}`">
                  {{ getDifficultyText(recipe.difficulty) }}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Likes:</span>
                <span class="meta-value">{{ recipe.likes || 0 }}</span>
              </div>
            </div>

            <div class="card-stats">
              <div class="stat">
                <span class="stat-number">{{ recipe.ingredients?.length || 0 }}</span>
                <span class="stat-label">Ingredients</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ recipe.instructions?.length || 0 }}</span>
                <span class="stat-label">Steps</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ recipe.rating || 'N/A' }}</span>
                <span class="stat-label">Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <h3>Delete Recipe</h3>
        <p>Are you sure you want to delete "{{ recipeToDelete?.name }}"?</p>
        <p class="warning">This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="cancel-btn">Cancel</button>
          <button @click="performDelete" class="confirm-delete-btn">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main Container */
.my-recipes-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding-bottom: 15px;
}

/* ===== NAVIGATION STYLES ===== */
.navbar {
  background: var(--background-primary);
  border-bottom: 1px solid var(--background-tertiary);
  box-shadow: var(--shadow-sm);
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
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
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
  text-align: left;
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

.profile-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
}

.profile-loading .loading-spinner {
  font-size: var(--font-size-lg);
  animation: spin 1s linear infinite;
}

/* Page Header */
.page-header {
  text-align: center;
  margin: var(--space-8) auto var(--space-12);
  padding: 0 var(--space-6);
}

.page-header h1 {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.page-header p {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  padding-bottom: 10px;
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: var(--space-12);
  margin: 0 var(--space-6);
}

.loading-spinner {
  font-size: 48px;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-4);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Error State */
.error-container {
  text-align: center;
  padding: var(--space-12);
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  max-width: 500px;
  margin: 0 auto;
  margin-left: var(--space-6);
  margin-right: var(--space-6);
}

.error-icon {
  font-size: 64px;
  margin-bottom: var(--space-4);
}

.error-container h3 {
  color: var(--danger-color);
  margin-bottom: var(--space-2);
}

.error-container p {
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

.retry-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.retry-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-12);
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  max-width: 600px;
  margin: 0 auto;
  margin-left: var(--space-6);
  margin-right: var(--space-6);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: var(--space-6);
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: var(--space-4);
  font-size: var(--font-size-xl);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
  font-size: var(--font-size-base);
}

.create-first-btn {
  background: var(--success-color);
  color: white;
  border: none;
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 600;
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.create-first-btn:hover {
  background: #059669;
  transform: translateY(-2px);
}

/* Recipes Container */
.recipes-container {
  max-width: 1200px;
  margin: 0 auto;
  margin-bottom: 30px;
  padding: 0 var(--space-6);
}

.recipes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-8);
}

.recipes-header h2 {
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
  font-weight: 700;
}

.refresh-btn {
  background: var(--background-secondary);
  border: 2px solid var(--background-tertiary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  font-weight: bold;
}

.refresh-btn:hover {
  background: var(--background-tertiary);
  border-color: var(--primary-color);
}

/* Recipe Grid */
.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-8);
}

.recipe-card {
  background: var(--background-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--background-tertiary);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

/* Card Image */
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

.card-actions {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  display: flex;
  gap: var(--space-2);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.recipe-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  background: rgba(255, 255, 255, 0.95);
  color: var(--primary-color);
}

.edit-btn:hover {
  background: var(--primary-light);
  transform: scale(1.1);
}

.delete-btn {
  background: rgba(255, 255, 255, 0.95);
  color: var(--danger-color);
}

.delete-btn:hover {
  background: var(--hard-bg);
  transform: scale(1.1);
}

/* Card Content */
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

.description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-4);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card Meta */
.card-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.meta-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: 600;
}

.difficulty-1 {
  color: var(--easy-text);
  background: var(--easy-bg);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.difficulty-2 {
  color: var(--medium-text);
  background: var(--medium-bg);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.difficulty-3 {
  color: var(--hard-text);
  background: var(--hard-bg);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

/* Card Stats */
.card-stats {
  display: flex;
  justify-content: space-between;
  padding-top: var(--space-4);
  border-top: 1px solid var(--background-tertiary);
}

.stat {
  text-align: center;
  flex: 1;
}

.stat-number {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--background-primary);
  padding: var(--space-8);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-content h3 {
  color: var(--text-primary);
  margin-bottom: var(--space-4);
  font-size: var(--font-size-xl);
}

.modal-content p {
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

.warning {
  color: var(--danger-color);
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-top: var(--space-6);
}

.cancel-btn {
  background: var(--background-secondary);
  border: 2px solid var(--background-tertiary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.cancel-btn:hover {
  background: var(--background-tertiary);
}

.confirm-delete-btn {
  background: var(--danger-color);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.confirm-delete-btn:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .nav-content {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    text-align: center;
  }
  
  .nav-center {
    order: 2;
  }
  
  .nav-actions {
    order: 1;
    justify-content: center;
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
  
  .recipes-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
  
  .recipes-header {
    flex-direction: column;
    gap: var(--space-4);
    text-align: center;
  }
  
  .card-meta {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .meta-item {
    justify-content: center;
    gap: var(--space-2);
  }
  
  .modal-content {
    padding: var(--space-6);
  }
  
  .modal-actions {
    flex-direction: column;
    gap: var(--space-3);
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: var(--font-size-2xl);
  }
  
  .card-content {
    padding: var(--space-4);
  }
  
  .card-stats {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .stat {
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>