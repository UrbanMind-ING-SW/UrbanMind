<template>
  <div class="login-page">
    <div class="login-bg"></div>

    <MainNavbar />

    <main class="login-panel">
      <h1 class="login-title">Accedi al sito di UrbanMind</h1>

      <div class="login-actions">
        <!-- Pulsante SPID -->
        <button
          class="button"
          @click="handleSpidLogin"
        >
          <span class="button-icon">
            <img src="@/assets/Logo-SPID.svg" alt="Logo SPID" />
          </span>
          <span class="button-text">Entra con SPID</span>
        </button>

        <!-- Pulsante CIE -->
        <button
          class="button"
          @click="handleCieLogin"
        >
          <span class="button-icon">
            <img src="@/assets/Logo-CIE.svg" alt="Logo CIE" />
          </span>
          <span class="button-text">Entra con CIE</span>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import MainNavbar from '@/components/MainNavbar.vue'

const router = useRouter()

function handleSpidLogin() {
  router.push('/role-select')
}

function handleCieLogin() {
  router.push('/role-select')
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100dvh;
  width: 100%;
  max-width: 100vw;
  color: var(--color-text-white);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Sfondo a tutta pagina */
.login-bg {
  position: fixed;
  inset: 0;
  background-image: url('@/assets/trento-bg.jpg');
  background-size: cover;
  background-position: center;
  z-index: -1;
}

/* Pannello centrale */
.login-panel {
  position: relative;
  width: min(480px, 90vw);
  min-height: 280px;
  padding: clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 4vw, 2.5rem);
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255,255,255 , 0.5);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  text-align: center;
  margin: auto;
}

/* Titolo fluido */
.login-title {
  font-size: clamp(1.9rem, 4vw, 3rem);
  font-weight: 570;
  margin-bottom: 1.25rem;
  color:  #0066cc;
}

/* Contenitore pulsanti */
.login-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* Pulsanti SPID/CIE responsivi */
.button {
  width: min(320px, 80vw);
  height: clamp(2.8rem, 6vh, 3.2rem);
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  border-radius: var(--radius-xs);
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-base), transform var(--transition-fast);
  background-color: var(--color-blue-500);
  color: var(--color-text-white);
}

.button:hover {
  background-color: var(--color-blue-700);
  transform: translateY(-1px);
}

.button:active {
  transform: translateY(0);
}

.button:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* Icona a sinistra */
.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.75rem;
}

.button-icon img {
  height: 28px;
  width: auto;
}

/* Testo centrale */
.button-text {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  height: 100%;
}


@media (max-width: 480px) {
  .login-panel {
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
  }

  .button-icon img {
    height: 24px;
  }
}
</style>
