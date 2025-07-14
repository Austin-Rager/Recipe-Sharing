<script setup>
import { ref, computed, onMounted, defineProps, defineEmits } from 'vue'

// UPDATED: Change URL to your recipe backend
const URL = "http://localhost:8080";


const props = defineProps({
  showBackButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['login-success', 'go-back'])

const user = ref({
  name: "", 
  username: "", 
  email: "", 
  password: ""
});

const currentUser = ref(null);
const showLogin = ref(true);
const isLoading = ref(false);
const errorMessage = ref("");


const loginContainsText = computed(() => 
  user.value.username.length > 0 && user.value.password.length > 0
);

const registerContainsText = computed(() =>
  user.value.name.length > 0 &&
  user.value.username.length > 0 &&
  user.value.email.length > 0 &&
  user.value.password.length > 0
);

async function registerUser() {
  if (!registerContainsText.value) return;
  
  isLoading.value = true;
  errorMessage.value = "";
  
  try {
   
    const res = await fetch(`${URL}/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({
        name: user.value.name,
        username: user.value.username,
        email: user.value.email,
        password: user.value.password
      }),
    });
    
    if (res.status === 201) {
      showLogin.value = true;
      errorMessage.value = "";
      alert("Registration successful! Please log in.");
      user.value = { 
        name: "", 
        username: user.value.username, 
        email: "", 
        password: "" 
      };
    } else {
      const errorText = await res.text();
      errorMessage.value = errorText || "Failed to register.";
    }
  } catch (error) {
    errorMessage.value = "Network error. Please try again.";
  } finally {
    isLoading.value = false;
  }
}

async function loginUser() {
  if (!loginContainsText.value) return;
  
  isLoading.value = true;
  errorMessage.value = "";
  
  try {
    const res = await fetch(`${URL}/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify({
        username: user.value.username,
        password: user.value.password
      }),
    });
    
    if (res.status === 200) {
      const data = await res.json();
      currentUser.value = data;
      clearForm();
      
      
      emit('login-success', data);
      
    } else {
      const errorData = await res.json();
      errorMessage.value = errorData.error || "Failed to login.";
      user.value.password = "";
    }
  } catch (error) {
    errorMessage.value = "Network error. Please try again.";
  } finally {
    isLoading.value = false;
  }
}

async function logoutUser() {
  try {
   
    await fetch(`${URL}/logout`, {
      method: "GET",
      credentials: "include",
    });
    currentUser.value = null;
    clearForm();
    alert("Logged out successfully!");
    
    emit('go-back');
  } catch (error) {
    console.error("Logout failed:", error);
  }
}

function clearForm() {
  user.value = {name: "", username: "", email: "", password: ""};
}


function goBack() {
  clearForm();
  errorMessage.value = "";
  emit('go-back');
}


onMounted(async () => {

});
</script>

<template>
  <div class="login-page">
    <!-- ADDED: Back button -->
    <div v-if="showBackButton" class="back-button-container">
      <button @click="goBack" class="back-btn">
        ← Back to Home
      </button>
    </div>

    <div class="auth-container">
      <!-- Show login/register forms when not logged in -->
      <div v-if="!currentUser" class="auth-forms">
        <div class="form-toggle">
          <button 
            @click="showLogin = true" 
            :class="{ active: showLogin }"
            class="toggle-btn"
          >
            Login
          </button>
          <button 
            @click="showLogin = false" 
            :class="{ active: !showLogin }"
            class="toggle-btn"
          >
            Register
          </button>
        </div>

        <!-- Login Form -->
        <form v-if="showLogin" @submit.prevent="loginUser" class="auth-form">
          <h2 style="margin-bottom: 5px;">Login</h2>
          
          <!-- UPDATED: Username field instead of email -->
          <div class="form-group">
            <label for="login-username">Username:</label>
            <input
              id="login-username"
              v-model="user.username"
              type="text"
              placeholder="Enter your username"
              required
              :disabled="isLoading"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="login-password">Password:</label>
            <input
              id="login-password"
              v-model="user.password"
              type="password"
              placeholder="Enter your password"
              required
              :disabled="isLoading"
              class="form-input"
            />
          </div>

          <button 
            type="submit" 
            :disabled="!loginContainsText || isLoading"
            class="submit-btn"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <!-- Register Form -->
        <form v-else @submit.prevent="registerUser" class="auth-form">
          <h2 style="margin-bottom: 5px;">Register</h2>
          
          <div class="form-group">
            <label for="register-name">Name:</label>
            <input
              id="register-name"
              v-model="user.name"
              type="text"
              placeholder="Enter your name"
              required
              :disabled="isLoading"
              class="form-input"
            />
          </div>

          <!-- ADDED: Username field -->
          <div class="form-group">
            <label for="register-username">Username:</label>
            <input
              id="register-username"
              v-model="user.username"
              type="text"
              placeholder="Choose a username"
              required
              :disabled="isLoading"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="register-email">Email:</label>
            <input
              id="register-email"
              v-model="user.email"
              type="email"
              placeholder="Enter your email"
              required
              :disabled="isLoading"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="register-password">Password:</label>
            <input
              id="register-password"
              v-model="user.password"
              type="password"
              placeholder="Enter your password"
              required
              :disabled="isLoading"
              class="form-input"
            />
          </div>

          <button 
            type="submit" 
            :disabled="!registerContainsText || isLoading"
            class="submit-btn"
          >
            {{ isLoading ? 'Registering...' : 'Register' }}
          </button>
        </form>
      </div>


      <div v-else class="user-dashboard">
        <h2>Welcome, {{ currentUser.username }}!</h2>
        <button @click="logoutUser" class="logout-btn">Logout</button>
      </div>


      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* UPDATED: Match website design system */
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: var(--space-8, 2rem) 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Back button with website styling */
.back-button-container {
  max-width: 450px;
  margin: 0 auto var(--space-6, 1.5rem) auto;
  padding: 0 var(--space-6, 1.5rem);
}

.back-btn {
  background: var(--background-primary, white);
  border: 2px solid var(--background-tertiary, #e2e8f0);
  color: var(--text-primary, #2c3e50);
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-2, 0.5rem);
  padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
  border-radius: var(--radius-full, 9999px);
  transition: all var(--transition-fast, 150ms ease-in-out);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  text-decoration: none;
}

.back-btn:hover {
  background: var(--primary-color, #ff6b6b);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

/* Main container with website styling */
.auth-container {
  max-width: 450px;
  margin: 0 auto;
  padding: var(--space-8, 2rem);
  background: var(--background-primary, white);
  border-radius: var(--radius-2xl, 20px);
  box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
  border: 1px solid var(--background-tertiary, #e2e8f0);
}

/* Toggle buttons with website styling */
.form-toggle {
  display: flex;
  margin-bottom: var(--space-8, 2rem);
  border: 1px solid var(--background-tertiary, #e2e8f0);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  background: var(--background-secondary, #f8fafc);
}

.toggle-btn {
  flex: 1;
  padding: var(--space-4, 1rem);
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--text-secondary, #5a6c7d);
  transition: all var(--transition-fast, 150ms ease-in-out);
}

.toggle-btn.active {
  background: var(--primary-color, #ff6b6b);
  color: white;
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
}

.toggle-btn:hover:not(.active) {
  background: var(--background-tertiary, #e2e8f0);
  color: var(--text-primary, #2c3e50);
}

/* Form styling */
.auth-form {
  display: flex;
  flex-direction: column;
}

.auth-form h2 {
  font-size: var(--font-size-2xl, 1.5rem);
  font-weight: 700;
  color: var(--text-primary, #2c3e50);
  margin-bottom: var(--space-6, 1.5rem);
  text-align: center;
}

.form-group {
  margin-bottom: var(--space-6, 1.5rem);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2, 0.5rem);
  font-weight: 600;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--text-primary, #2c3e50);
}

.form-input {
  width: 100%;
  padding: var(--space-4, 1rem);
  border: 2px solid var(--background-tertiary, #e2e8f0);
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-size-base, 1rem);
  background: var(--background-primary, white);
  color: var(--text-primary, #2c3e50);
  transition: all var(--transition-fast, 150ms ease-in-out);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color, #ff6b6b);
  box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.1);
}

.form-input:disabled {
  background: var(--background-secondary, #f8fafc);
  cursor: not-allowed;
  opacity: 0.7;
  border-color: var(--background-tertiary, #e2e8f0);
}

.form-input::placeholder {
  color: var(--text-muted, #8492a6);
}

/* Submit button with website styling */
.submit-btn {
  width: 100%;
  padding: var(--space-4, 1rem);
  background: var(--primary-color, #ff6b6b);
  color: white;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-size-base, 1rem);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms ease-in-out);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  margin-top: var(--space-2, 0.5rem);
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-hover, #ff5252);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
}

.submit-btn:disabled {
  background: var(--text-muted, #8492a6);
  cursor: not-allowed;
  transform: none;
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
}

/* User dashboard styling */
.user-dashboard {
  text-align: center;
  padding: var(--space-8, 2rem) 0;
}

.user-dashboard h2 {
  font-size: var(--font-size-2xl, 1.5rem);
  font-weight: 700;
  color: var(--text-primary, #2c3e50);
  margin-bottom: var(--space-6, 1.5rem);
}

.logout-btn {
  padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
  background: var(--danger-color, #ef4444);
  color: white;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms ease-in-out);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

.logout-btn:hover {
  background: var(--danger-hover, #dc2626);
  transform: translateY(-1px);
}

/* Error message styling */
.error-message {
  margin-top: var(--space-6, 1.5rem);
  padding: var(--space-4, 1rem);
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md, 8px);
  color: var(--hard-text, #991b1b);
  font-size: var(--font-size-sm, 0.875rem);
  border-left: 4px solid var(--danger-color, #ef4444);
}

/* Responsive design */
@media (max-width: 768px) {
  .login-page {
    padding: var(--space-6, 1.5rem) 0;
  }
  
  .auth-container {
    margin: 0 var(--space-4, 1rem);
    padding: var(--space-6, 1.5rem);
    border-radius: var(--radius-xl, 16px);
  }
  
  .back-button-container {
    padding: 0 var(--space-4, 1rem);
    margin-bottom: var(--space-4, 1rem);
  }
  
  .form-toggle {
    margin-bottom: var(--space-6, 1.5rem);
  }
  
  .toggle-btn {
    padding: var(--space-3, 0.75rem);
    font-size: var(--font-size-xs, 0.75rem);
  }
  
  .auth-form h2 {
    font-size: var(--font-size-xl, 1.25rem);
  }
}

@media (max-width: 480px) {
  .auth-container {
    margin: 0 var(--space-3, 0.75rem);
    padding: var(--space-4, 1rem);
  }
  
  .form-input {
    padding: var(--space-3, 0.75rem);
  }
  
  .submit-btn {
    padding: var(--space-3, 0.75rem);
  }
}

/* Loading state styling */
.submit-btn:disabled {
  position: relative;
}

.submit-btn:disabled::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  margin: auto;
  border: 2px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  right: var(--space-4, 1rem);
  top: 50%;
  transform: translateY(-50%);
}

@keyframes spin {
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
}

/* Focus styles for accessibility */
.back-btn:focus,
.toggle-btn:focus,
.form-input:focus,
.submit-btn:focus,
.logout-btn:focus {
  outline: 2px solid var(--primary-color, #ff6b6b);
  outline-offset: 2px;
}

/* Smooth transitions */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Disable transitions for reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>