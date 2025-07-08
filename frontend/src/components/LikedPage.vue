<template>
    <div class="liked-page">
        <div class="page-header">
            <h1>My Liked Recipes ❤️</h1> 
            <p v-if="likedRecipes.length > 0">You have {{ likedRecipes.length }} liked recipes</p>
            <p v-else>No liked recipes yet.</p>
        </div>

        <!--search and filter stuff-->
        <div class="liked-controls" v-if="likedRecipes.length > 0">
            <div class="search-bar">
                <input
                    type="text"
                    placeholder="Search liked recipes..."
                    v-model="searchQuery"
                />
                <span class="search-icon">🔍</span>
            </div>
            </div>

        <!--quick filters-->
        <div class="quick filters">
            <button
             class="filter-btn"
             :class="{ active: selectedDifficulty === '' }"
             @click="selectedDifficulty = ''"
             >
            </button>
              <button
             class="filter-btn"
             :class="{ active: selectedDifficulty === 'Easy' }"
             @click="selectedDifficulty = 'Easy'"
             >
             Easy
            </button>
              <button
             class="filter-btn"
             :class="{ active: selectedDifficulty === 'Med' }"
             @click="selectedDifficulty = 'Med'"
             >
             Med
            </button>
              <button
             class="filter-btn"
             :class="{ active: selectedDifficulty === 'Hard' }"
             @click="selectedDifficulty = 'Hard'"
             >
             Hard
            </button>
         </div>
        </div>

        <!--if no liked stuff-->
        <div class="empty-state" v-if="likedRecipes.length === 0">
            <div class="empty-icon">💔</div>
            <h2>No Liked Recipes Yet</h2>
            <p>Start exploring!</p>
            <button class="explore-btn" @click="goToHome">
                Explore Recipes
            </button>
        </div>
        
</template>