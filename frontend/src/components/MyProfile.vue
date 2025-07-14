<template>
  <div class="profile-page">

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
                <button class="edit-profile-btn" @click="toggleEditMode">
                  {{ editMode ? 'Cancel' : 'Edit Profile' }}
                </button>
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
                <div class="stat-item">
                  <span class="stat-number">{{ userStats.followers }}</span>
                  <span class="stat-label">Followers</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ userStats.following }}</span>
                  <span class="stat-label">Following</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- edit profile mode -->
        <div class="edit-profile-section" v-if="editMode">
          <div class="edit-form-container">
            <h2>Edit Profile</h2>
            
            <form @submit.prevent="saveProfile" class="edit-form">
              <div class="form-group">
                <label for="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  v-model="editForm.name"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div class="form-group">
                <label for="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="editForm.email"
                  placeholder="Enter your email"
                />
              </div>
              
              <div class="form-group">
                <label for="bio">Bio</label>
                <textarea 
                  id="bio" 
                  v-model="editForm.bio"
                  placeholder="Tell us about yourself..."
                  rows="4"
                ></textarea>
              </div>
              
              <div class="form-actions">
                <button type="button" class="btn-secondary" @click="cancelEdit">
                  Cancel
                </button>
                <button type="submit" class="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- bio section -->
        <div class="profile-bio-section" v-if="!editMode">
          <div class="bio-container">
            <h2>About</h2>
            <p class="bio-text" v-if="currentUser.bio">
              {{ currentUser.bio }}
            </p>
            <p class="bio-placeholder" v-else>
              No bio available. Click "Edit Profile" to add one!
            </p>
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
                :key="recipe.id"
                class="recipe-card"
                @click="openRecipe(recipe)"
              >
                <div class="card-image">
                  <img :src="recipe.image" :alt="recipe.title" />
                  <div class="recipe-actions">
                    <button class="action-btn edit-btn" @click.stop="editRecipe(recipe)">
                      ✏️
                    </button>
                    <button class="action-btn delete-btn" @click.stop="deleteRecipe(recipe)">
                      🗑️
                    </button>
                  </div>
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
                  <p class="recipe-description">{{ recipe.description }}</p>
                </div>
              </div>
            </div>
            
            <div class="empty-state" v-else>
              <div class="empty-icon">👨‍🍳</div>
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
                :key="recipe.id"
                class="recipe-card"
                @click="openRecipe(recipe)"
              >
                <div class="card-image">
                  <img :src="recipe.image" :alt="recipe.title" />
                  <button
                    class="like-btn liked"
                    @click.stop="toggleLike(recipe)"
                  >
                    ❤️
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
                  <p class="recipe-description">{{ recipe.description }}</p>
                  <p class="liked-date">Liked on {{ formatDate(recipe.likedAt) }}</p>
                </div>
              </div>
            </div>
            
            <div class="empty-state" v-else>
              <div class="empty-icon">💔</div>
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


const emit = defineEmits(['go-home', 'go-to-liked', 'go-to-create'])


const currentUser = ref({
  name: 'Julia Souza',
  email: 'julia@flavorcraft.com',
  bio: 'Passionate home chef who loves experimenting with flavors and creating delicious memories in the kitchen.',
  joinedDate: 'January 2024'
})


const editMode = ref(false)
const activeTab = ref('recipes')


const editForm = ref({
  name: '',
  email: '',
  bio: ''
})


const userStats = ref({
  recipesCreated: 12,
  recipesLiked: 34,
  followers: 128,
  following: 89
})

const myRecipes = ref([
  {
    id: 101,
    title: "Julia's Famous Lasagna",
    description: "My grandmother's secret recipe",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300",
    rating: 4.8,
    reviewCount: 23,
    cookTime: 90,
    difficulty: "Med"
  },
  {
    id: 102,
    title: "Chocolate Lava Cake",
    description: "Decadent dessert for special occasions",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300",
    rating: 4.9,
    reviewCount: 15,
    cookTime: 45,
    difficulty: "Hard"
  }
])


const likedRecipes = ref([])


const joinedDate = computed(() => {
  return currentUser.value.joinedDate || 'Recently'
})

// dicebear stuff
// dicebear v6 'glass' avatar URL
function getAvatarUrl(seed, style = 'thumbs', size = 200) {
  const cleanSeed = encodeURIComponent(seed.toLowerCase().replace(/\s/g, ''))
  return `https://api.dicebear.com/9.x/${style}/png?seed=${cleanSeed}&size=${size}`
}




console.log(getAvatarUrl(currentUser.value.name || currentUser.value.email || 'default', 'thumbs'))





function toggleEditMode() {
  if (!editMode.value) {
    editForm.value = {
      name: currentUser.value.name,
      email: currentUser.value.email,
      bio: currentUser.value.bio || ''
    }
  }
  editMode.value = !editMode.value
}

function saveProfile() {
  currentUser.value = {
    ...currentUser.value,
    name: editForm.value.name,
    email: editForm.value.email,
    bio: editForm.value.bio
  }
  editMode.value = false
  console.log('Profile saved')
}

function cancelEdit() {
  editMode.value = false
  editForm.value = { name: '', email: '', bio: '' }
}


function openRecipe(recipe) {
  console.log('Opening recipe:', recipe.title)
}

function editRecipe(recipe) {
  console.log('Editing recipe:', recipe.title)
}

function deleteRecipe(recipe) {
  if (confirm(`Delete "${recipe.title}"?`)) {
    myRecipes.value = myRecipes.value.filter(r => r.id !== recipe.id)
    console.log('Recipe deleted')
  }
}

function toggleLike(recipe) {
  likedRecipes.value = likedRecipes.value.filter(r => r.id !== recipe.id)
  localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes.value))
  console.log('Recipe unliked')
}

function goToHome() {
  emit('go-home')
}

function goToCreateRecipe() {
  emit('go-to-create')
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

//load recipes
function loadLikedRecipes() {
  const stored = localStorage.getItem('likedRecipes')
  if (stored) {
    likedRecipes.value = JSON.parse(stored)
  }
}

onMounted(() => {
  loadLikedRecipes()
  console.log('Profile page loaded')
})
</script>

<style>
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

.edit-profile-btn {
  padding: var(--space-3) var(--space-6);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.edit-profile-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
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
  grid-template-columns: repeat(4, 1fr);
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

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
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

/* ===== BIO SECTION ===== */
.profile-bio-section {
  background: var(--background-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--background-tertiary);
}

.bio-container {
  padding: var(--space-8);
}

.bio-container h2 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.bio-text {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.bio-placeholder {
  font-size: var(--font-size-base);
  color: var(--text-muted);
  font-style: italic;
  margin: 0;
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
  font-size: var(--font-size-base);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-fast);
}

.action-btn:hover {
  transform: scale(1.1);
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
  text-align: center;
  padding: var(--space-16) var(--space-8);
  background: var(--background-secondary);
  border-radius: var(--radius-xl);
  border: 2px dashed var(--background-tertiary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-6);
  opacity: 0.6;
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
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}

/* ===== ACCESSIBILITY ===== */
.recipe-card:focus,
.tab-btn:focus,
.edit-profile-btn:focus,
.btn-primary:focus,
.btn-secondary:focus,
.action-btn:focus,
.like-btn:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}

  
</style>