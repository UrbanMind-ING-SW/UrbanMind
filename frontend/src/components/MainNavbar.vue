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
  background: var(--color-white);
  color: var(--color-orange-600);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  position: relative;
  z-index: 10;
  box-shadow: var(--shadow-sm);
}

.um-brand {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity var(--transition-base);
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
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xl);
  letter-spacing: 0.03em;
  justify-self: center; 
  text-align: center;
  color: var(--color-orange-600);
}

.um-user {
  text-align: right;
  font-size: var(--font-size-sm);
  justify-self: end;
}

.um-user-label {
  display: block;
  color: var(--color-gray-500);
}

.um-user-name {
  font-weight: var(--font-weight-bold);
  color: var(--color-orange-600);
}
</style>

