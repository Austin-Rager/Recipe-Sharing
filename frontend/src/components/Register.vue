<script setup>
import { ref, computed, onMounted } from 'vue'

const URL = "http://localhost:3000";

const user = ref({name: "", email: "", password: ""});
const currentUser = ref(null);
const showLogin = ref(true);
const isLoading = ref(false);
const errorMessage = ref("");

const loginContainsText = computed(() => 
  user.value.email.length > 0 && user.value.password.length > 0
);

const registerContainsText = computed(() =>
  user.value.name.length > 0 &&
  user.value.email.length > 0 &&
  user.value.password.length > 0
);

async function registerUser() {
  if (!registerContainsText.value) return;
  
  isLoading.value = true;
  errorMessage.value = "";
  
  try {
    const res = await fetch(`${URL}/users`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(user.value),
    });
    
    if (res.status === 201) {
      await loginUser();
    } else {
      const errorData = await res.json();
      errorMessage.value = errorData.message || "Failed to register.";
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
    const res = await fetch(`${URL}/session`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(user.value),
      credentials: "include",
    });
    
    if (res.status === 201) {
      const data = await res.json();
      currentUser.value = data;
      clearForm();
    } else {
      const errorData = await res.json();
      errorMessage.value = errorData.message || "Failed to login.";
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
    await fetch(`${URL}/session`, {
      method: "DELETE",
      credentials: "include",
    });
    currentUser.value = null;
    clearForm();
  } catch (error) {
    console.error("Logout failed:", error);
  }
}

function clearForm() {
  user.value = {name: "", email: "", password: ""};
}

// Check if user is already logged in on component mount
onMounted(async () => {
  try {
    const res = await fetch(`${URL}/session`, {
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      currentUser.value = data;
    }
  } catch (error) {
    console.error("Session check failed:", error);
  }
});
</script>
<template>
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
        
        <div class="form-group">
          <label for="login-email">Email:</label>
          <input
            id="login-email"
            v-model="user.email"
            type="email"
            placeholder="Enter your email"
            required
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

    <!-- Show user dashboard when logged in -->
    <div v-else class="user-dashboard">
      <h2>Welcome, {{ currentUser.name }}!</h2>
      <p>Email: {{ currentUser.email }}</p>
      <button @click="logoutUser" class="logout-btn">Logout</button>
    </div>

    <!-- Error message display -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
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
</style>