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
  color: var(--um-white);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Sfondo a tutta pagina */
.login-bg {
  position: fixed;
  inset: 0;
  background-image: url('@/assets/trento-bg.png');
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
  background: var(--um-orange-light);
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.55);
  text-align: center;
  margin: auto;
}

/* Titolo fluido */
.login-title {
  font-size: clamp(1.9rem, 4vw, 3rem);
  font-weight: 570;
  margin-bottom: 1.25rem;
  color: var(--um-white);
  -webkit-text-stroke: 0.4px var(--um-medium-gray);
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
  border-radius: 4px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  font-family: 'Titillium Web', sans-serif;
  background-color: var(--um-dark-blue);
  color: var(--um-white);
}

.button:hover {
  background-color: #0052a3;
  transform: translateY(-1px);
}

.button:active {
  transform: translateY(0);
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
    border-radius: 12px;
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.55);
  }

  .button-icon img {
    height: 24px;
  }
}
</style>
