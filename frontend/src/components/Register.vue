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
  username: "", // ADDED
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

// Check if user is already logged in
onMounted(async () => {
  // Skip session check for now since your backend doesn't have this endpoint
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

      <!-- Show user dashboard when logged in (this probably won't show since we emit back to home) -->
      <div v-else class="user-dashboard">
        <h2>Welcome, {{ currentUser.username }}!</h2>
        <button @click="logoutUser" class="logout-btn">Logout</button>
      </div>

      <!-- Error message display -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>

.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
}


.back-button-container {
  max-width: 400px;
  margin: 0 auto 1rem auto;
  padding: 0 2rem;
}

.back-btn {
  background: none;
  border: none;
  color: #08951f;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  transition: color 0.3s;
}

.back-btn:hover {
  color: #056114;
}

.auth-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-toggle {
  display: flex;
  margin-bottom: 2rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.toggle-btn {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-btn.active {
  background: #08951f;
  color: white;
}

.auth-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #08951f;
}

.form-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.submit-btn {
  padding: 12px;
  background: #08951f;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #056114;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.user-dashboard {
  text-align: center;
}

.user-dashboard h2 {
  color: #333;
  margin-bottom: 1rem;
}

.logout-btn {
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background: #c82333;
}

.error-message {
  margin-top: 1rem;
  padding: 10px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
}


@media (max-width: 480px) {
  .login-page {
    padding: 1rem 0;
  }
  
  .auth-container {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .back-button-container {
    padding: 0 1rem;
  }
}
</style>