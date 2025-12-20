<template>
  <header></header>
  <div class="login-page">
    <div class="login-bg"></div>
    <MainNavbar />
    
    <main class="login-panel">
      <h1 class="login-title">Accedi al sito di UrbanMind</h1>
      
      <div class="login-actions">
        <!-- Pulsante SPID ufficiale -->
        <button 
          class="button button-spid"
          @click="handleSpidLogin"
        >
          <span class="button-icon">
            <img src="@/assets/Logo-SPID.svg" alt="Logo SPID" />
          </span>
          <span class="button-text">Entra con SPID</span>
        </button>

        <!-- Pulsante CIE ufficiale -->
        <button 
          class="button button-spid"
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
import MainNavbar from '@/components/MainNavbar.vue'
import { useRouter } from 'vue-router'

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
  min-height: 100vh;
  width: 100vw;
  color: var(--um-white);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-bg {
  position: absolute;
  inset: 0;
  background-image: url('@/assets/trento-bg.png');
  background-size: cover;
  background-position: center;
}

.login-panel {
  position: relative;
  width: clamp(280px, 80vw, 480px);
  min-height: 300px;
  padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem);
  background: var(--um-orange-light);/* rgba(255, 255, 255, 0.5); */
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.55);
  text-align: center;
  margin: auto;
}

.login-title {
  font-size: 3rem;
  font-weight: 570;
  margin-bottom: 0.75rem;
  color: var(--um-white);
  -webkit-text-stroke: 0.4px var(--um-medium-gray);
}



.login-actions {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 1rem;
}

/* Stile pulsanti ufficiali SPID/CIE */
.button {
  width: 12vw;
  height: 6vh;
  font-size: 1rem;
  display: flex;
  align-items: center;
  border-radius: 4px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: 'Titillium Web', sans-serif;
  background-color: var(--um-dark-blue);
  color: var(--um-white);
}

.button:hover {
  background-color: #0052A3;
}

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.75rem;
}

.button-icon img {
  height: 29px;
  width: auto;
}

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
</style>
