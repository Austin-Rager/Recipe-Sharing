<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import LikedPage from './LikedPage.vue';
import RecipeDetails from './RecipeDetails.vue';

</script>

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

      <div class="main-content">
        <div class="recipe-section">

        </div>
      </div>
  </div>
</template>

<style scoped>

</style>