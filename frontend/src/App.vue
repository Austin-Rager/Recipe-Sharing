<script setup>
import Home from './Home.vue';   // ⬅ the page that already contains the nav bar
</script>

<template>
  <div id="app">
    <!-- Home controls which sub‑view (recipes list, liked list, or details) is visible -->
    <Home />
  </div>
</template>

<style scoped>
/* leave empty or add global styles */
</style>
