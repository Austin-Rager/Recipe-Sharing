<template>
  <div class="recipe-details">
    <!-- Recipe Header Section -->
    <div class="recipe-header">
      <div class="recipe-image">
        <img :src="recipe.image" :alt="recipe.title" />
      </div>
      <div class="recipe-info">
        <h1 class="recipe-title">{{ recipe.title }}</h1>
        <p class="recipe-description">{{ recipe.description }}</p>
        
        <div class="recipe-meta">
          <div class="rating">
            <span class="stars"></span>
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
            <span>Like</span>
          </button>
          <button class="btn btn-dislike" @click="dislikeRecipe">
            <span>Dislike</span> 
          </button>
          <button class="btn btn-save" @click="saveRecipe">
            <span>Save</span> 
          </button>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="recipe-content">
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
        <ul class="ingredients-list">
          <li v-for="(ingredient, index) in recipe.ingredients" :key="index" class="ingredient-item">
            {{ ingredient }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  recipeId: {
    type: String,
    required: true
  }
})

const recipe = ref({
  title: "Chocolate Chip Cookies",
  description: "Classic homemade chocolate chip cookies that are crispy on the outside and chewy on the inside.",
  image: "https://via.placeholder.com/400x300",
  rating: 4.5,
  difficulty: "Easy",
  time: "45 minutes",
  steps: [
    "Preheat oven to 375°F (190°C)",
    "In a large bowl, cream together butter and sugars until light and fluffy",
    "Beat in eggs one at a time, then add vanilla extract",
    "In a separate bowl, whisk together flour, baking soda, and salt",
    "Gradually mix dry ingredients into wet ingredients",
    "Fold in chocolate chips",
    "Drop rounded tablespoons of dough onto ungreased baking sheets",
    "Bake for 9-11 minutes until golden brown",
    "Cool on baking sheet for 5 minutes before transferring to wire rack"
  ],
  ingredients: [
    "2½ cups all-purpose flour",
    "1 tsp baking soda",
    "1 tsp salt",
    "1 cup butter, softened",
    "¾ cup granulated sugar",
    "¾ cup packed brown sugar",
    "2 large eggs",
    "2 tsp vanilla extract",
    "2 cups chocolate chips"
  ]
})

const likeRecipe = () => {
  console.log('Recipe liked!')
}

const dislikeRecipe = () => {
  console.log('Recipe disliked!')
}

const saveRecipe = () => {
  console.log('Recipe saved!')
}
</script>

<style scoped>
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

.btn-dislike {
  background: var(--danger-color);
  color: white;
}

.btn-dislike:hover {
  background: #dc2626;
}

.btn-save {
  background: var(--primary-color);
  color: white;
}

.btn-save:hover {
  background: var(--primary-hover);
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
  top: var(--space-6);
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
}

.ingredients-list {
  list-style: none;
  padding: 0;
}

.ingredient-item {
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  background: var(--background-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--background-tertiary);
  border-left: 4px solid var(--success-color);
  transition: all var(--transition-fast);
  font-size: var(--font-size-base);
}

.ingredient-item:hover {
  background: var(--background-secondary);
  transform: translateX(2px);
}

.ingredient-item::before {
  content: "✓";
  color: var(--success-color);
  margin-right: var(--space-3);
  font-weight: 700;
  font-size: var(--font-size-sm);
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