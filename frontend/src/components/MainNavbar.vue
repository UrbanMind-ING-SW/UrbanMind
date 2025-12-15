<template>
  <header class="um-header">
    <!-- Logo a sinistra -->
    <div class="um-brand" @click="goToLogin">
      <img 
        src="@/assets/Logo.svg" 
        alt="UrbanMind Logo" 
        class="um-logo"
      />
    </div>

    <!-- Titolo centrato -->
    <h1 class="um-title">UrbanMind</h1>

    <!-- Utente a destra -->
    <div class="um-user">
      <span class="um-user-label">Cittadino loggato</span>
      <span class="um-user-name">Nome Utente</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToLogin() {
  router.push('/')
}
</script>

<style scoped>
.um-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  height: 10vh;
  width: 100vw;
  align-items: center;
  padding: 0 2rem; 
  background: var(--um-white);
  color: var(--um-orange);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  position: relative;
  z-index: 10;
}

.um-brand {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.2s ease;
  justify-self: start;
}

.um-brand:hover {
  opacity: 0.7;
}

.um-logo {
  height: 10vh;
  width: auto;
  object-fit: contain;
}

.um-title {
  margin: 0;
  font-weight: 700;
  font-size: 1.4rem;
  letter-spacing: 0.03em;
  justify-self: center; 
  text-align: center;
  color: var(--um-orange);
}

.um-user {
  text-align: right;
  font-size: 0.9rem;
  justify-self: end;
}

.um-user-label {
  display: block;
  color: var(--um-medium-gray);
}

.um-user-name {
  font-weight: 600;
  color: var(--um-orange);
}
</style>

