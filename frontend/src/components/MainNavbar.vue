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
  gap: 1rem;
  border-bottom: 1px solid var(--color-border);

}

.um-brand {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.2s ease;
  justify-self: start;
  min-width: 0;
  
}

.um-brand:hover {
  opacity: 0.7;
}

.um-logo {
  height: 8vh;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.um-user {
  text-align: right;
  font-size: 0.9rem;
  justify-self: end;
  min-width: 0;
}

.um-user-label {
  display: block;
  color: var(--um-medium-gray);
  font-size: 0.75rem;
}

.um-user-name {
  font-weight: 600;
  color: var(--um-orange);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

/* Tablet (768px e sotto) */
@media (max-width: 768px) {
  .um-header {
    padding: 0 1rem;
    height: 8vh;
  }

  .um-logo {
    height: 6vh;
  }

  .um-title {
    font-size: 1.1rem;
  }

  .um-user {
    font-size: 0.8rem;
  }

  .um-user-label {
    font-size: 0.65rem;
  }
}

/* Mobile (480px e sotto) */
@media (max-width: 480px) {
  .um-header {
    grid-template-columns: auto 1fr auto;
    padding: 0 0.75rem;
    height: 7vh;
    gap: 0.5rem;
  }

  .um-logo {
    height: 5vh;
  }

  .um-title {
    font-size: 0.9rem;
  }

  .um-user {
    font-size: 0.7rem;
    text-align: center;
  }

  .um-user-label {
    font-size: 0.55rem;
    display: none; /* Nascondi il label su mobile */
  }

  .um-user-name {
    font-size: 0.7rem;
  }
}

/* Molto piccolo (sotto 360px) */
@media (max-width: 360px) {
  .um-header {
    padding: 0 0.5rem;
  }

  .um-logo {
    height: 4vh;
  }

  .um-title {
    font-size: 0.8rem;
  }

  .um-user-name {
    font-size: 0.65rem;
  }
}
</style>