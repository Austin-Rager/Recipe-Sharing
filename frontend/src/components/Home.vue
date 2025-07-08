<template>
  <div class="home-page">
    <!-- nav -->
    <nav class="navbar">
      <div class="nav-content">
        <h1 class="logo">🍳 FlavorCraft</h1>
        <div class="nav-actions">
          <div class="search-bar">
            <input
              type="text"
              placeholder="Search recipes..."
              v-model="searchQuery"
              @input="handleSearch"
            />
            <span class="search-icon">🔍</span>
          </div>
          <button class="nav-btn filters-btn" @click="toggleFilters">
            Filters
          </button>
          <button class="nav-btn saver-btn" @click="showSaved = !showSaved">
            {{ showSaved ? 'All Recipes' : 'Saver' }}
          </button>
          <button class="nav-btn liked-btn" @click="showLiked = !showLiked">
            My All Liked
          </button>
        </div>
      </div>
    </nav>

    <div class="main-content">
      <!-- left side stuff-->
      <div class="recipes-section">
        <!--recipe of the day-->
        <div class="recipe-of-the-day" v-if="recipeOfDay">
          <h2>Recipe of the Day 🌟</h2>
          <div class="featured-card" @click="openRecipe(recipeOfDay)">
            <img :src="recipeOfDay.image" :alt="recipeOfDay.title">
            <div class="featured-content">
              <h3>{{ recipeOfDay.title }}</h3>
              <p>{{ recipeOfDay.description }}</p>
              <div class="featured-meta">
                <div class="rating">
                  <span class="stars">{{ '★'.repeat(Math.floor(recipeOfDay.rating))}} {{ '☆'.repeat(5 - Math.floor(recipeOfDay.rating)) }}</span>
                  <span> {{ recipeOfDay.reviewCount }}</span>
                </div>
                <span class="cook-time">⏱️ {{ recipeOfDay.cookTime }}min</span>
              </div>
            </div>
          </div>
        </div>

        <!--trending part-->
        <div class="trending-section">
          <h2>🔥 Trending</h2>
          <div class="trending-cards">
            <div
              v-for="trending in trendingRecipes"
              :key="trending.id"
              class="trending-card"
              @click="openRecipe(trending)"
            >
              <img :src="trending.image" :alt="trending.title">
              <div class="trending-content">
                <h4>{{ trending.title }}</h4>
              </div>
            </div>
          </div>
        </div>

        <!--recipe grid-->
        <div class="recipes-grid">
          <div
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            class="recipe-card"
            @click="openRecipe(recipe)"
          >
            <div class="card-image">
              <img :src="recipe.image" :alt="recipe.title" />
              <button
                class="like-btn"
                :class="{ liked: recipe.isLiked }"
                @click.stop="toggleLike(recipe)"
              >
                {{ recipe.isLiked ? '❤️' : '🤍' }}
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
            </div>
          </div>
        </div>
      </div>

       <!--right side, filters and stuff-->
       <div class="sidebar" :class="{open: showFilters}">
        <div class="filters-panel">
          <h3>Filters</h3>
            <!--difficulty filter-->
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
       <!--rating filter-->
          <div class="filter-group">
            <h4>Rating</h4>
            <div class="rating-filter">
              <div v-for="rating in [5,4,3,2,1]" :key="rating" class="rating-option">
                <input 
                  type="radio" 
                  :value="rating" 
                  v-model="minRating"
                  @change="applyFilters"
                  name="rating"
                />
                <span class="stars">{{ '★'.repeat(rating) }}{{ '☆'.repeat(5-rating) }}</span>
                <span>& up</span>
              </div>
            </div>
          </div>
        <!--cook time filter-->
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
</template>

<script>

</script>