
<template>
    <section id="navbar">
      <h1>Kahoot!</h1>
      <p v-if="currentUser">Welcome, {{ currentUser.name }}</p>
      <button class="red-button" v-if="currentUser" @click ="deleteSession">Logout</button>
    </section>  
    <section id="login-page" v-if="page == 'login'">
      <h3>Login</h3>
      <form @submit.prevent="loginUser">
        <div class="input-container">
          <input type="email" v-model="user.email" autocomplete="username" />
          <p class="label">Email</p>
        </div>
        <div class="input-container">
          <input type="password" v-model="user.password" autocomplete="current-password" />
          <p class="label">Password</p>
        </div>
        <button :class="loginContainsText ? 'can-submit' : ''" :disabled="!loginContainsText" >
          Login
        </button>
          <p>Don't have an account? 
          <span class="link" @click="setPage('register')">Sign Up</span>
        </p>
              
        </form>
    </section>
    <section id="login-page" v-if="page == 'register'">
      <h3>Register</h3>
      <form @submit.prevent="registerUser">
        <div class="input-container">
          <p class ="label">Name</p>
          <input type="text" v-model="user.name" autocomplete="name" />
        </div>
        <div class="input-container">
          <p class ="label">Email</p>
          <input type="email" v-model="user.email" autocomplete="username" />
        </div>
        <div class="input-container">
          <p class ="label">Password</p>
          <input type="password" v-model="user.password" autocomplete="new-password" />
        </div>
        <button :class="registerContainsText ? 'can-submit' : ''" :disabled="!registerContainsText">
          Register
        </button>
        <p>Already have an account?
          <span class="link" @click="setPage('login')">Login</span>
        </p>
      </form>
    </section>

    <section v-if="page == 'quizzes'">Quizzes List Here</section>
    <section v-if="page == 'createQuiz'">Create/Edit Quiz Form Here</section>\
    <section v-if="page == 'single-quiz'">Quiz Taking Here</section>
    <div class="loading" v-if="page == 'loading'"> </div>
  
  </template>

  <script setup>
  import { ref,computed, onMounted } from 'vue';

  const URL = "http://localhost:8080"

  const page = ref('login');
  const user = ref({ 
    name: "", 
    email: "", 
    password: "" });
  const currentUser = ref(null);
  const quizzes = ref([]);
  const newQuiz = ref({
    title: "",
    description: "",
    questions: []
  });
  const newQuestin = ref({
    questionText: "",
    possibleChoices: [{
      answerText: "",
      isCorrect: false}],

  });
  const currentQuiz = ref({});
  const currentQuizQuestion = ref(0);
  const currentQuizQuestionAnswered = ref(false);
  const currentQuizTotalScore = ref(0);
  const editingQuiz = ref(false);

  const loginContainsText = computed(
    () => user.value.email.length > 0 && user.value.password.length > 0
  )

  const registerContainsText = computed(
    () => 
    user.value.name.length > 0 &&
    user.value.email.length > 0 &&
    user.value.password.length > 0

  );

  function setPage(p) {
    page.value = p;
  }

  async function registerUser() {
    if (!registerContainsText.value) return;
     const res = await fetch(`${URL}/users`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(user.value),

     });
     if (res.status === 201) {
      await loginUser();
     } else {
      alert("Failed to reigister")
     }

  }

  async function loginUser(){
    if (!loginContainsText) return;
      const res = await fetch(`${URL}/users`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(user.value),
      credentials: "include",
     });
    if (res.status === 201) {
      const data = await res.json();
      currentUser.value = data;
      setPage("quizzes");
    } else {
      alert("Failed to login.")
      user.value.password =="";
    }
   
  }
  function deleteSession() {
    //to be iimplemented
  }

</script>
