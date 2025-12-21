<template>
  <div class="role-page">
    <div class="role-bg"></div>

    <MainNavbar />

    <main class="role-panel">
      <h1 class="role-title">Accedi al sito di UrbanMind</h1>

      <div class="role-actions">
        <button class="role-btn" @click="goCitizen">
          Entra come cittadino
        </button>
        <button class="role-btn" @click="goOperator">
          Entra come operatore
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import MainNavbar from '@/components/MainNavbar.vue'

const router = useRouter()

function goCitizen() {
  router.push('/citizen/dashboard')
}

function goOperator() {
  router.push('/operator/dashboard')
}
</script>

<style scoped>
.role-page {
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
.role-bg {
  position: fixed;
  inset: 0;
  background-image: url('@/assets/trento-bg.png');
  background-size: cover;
  background-position: center;
  z-index: -1;
}

/* Pannello centrale */
.role-panel {
  position: relative;
  width: min(480px, 90vw);
  min-height: 260px;
  padding: clamp(1.5rem, 4vw, 3rem) clamp(1.25rem, 4vw, 2.5rem);
  background: var(--um-orange-light);
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.55);
  text-align: center;
  margin: auto;
}

/* Titolo fluido */
.role-title {
  font-size: clamp(1.9rem, 4vw, 3rem);
  font-weight: 570;
  margin-bottom: 1.25rem;
  color: var(--um-white);
  -webkit-text-stroke: 0.4px var(--um-medium-gray);
}

/* Contenitore pulsanti */
.role-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

/* Pulsanti responsivi */
.role-btn {
  width: min(320px, 80vw);
  height: clamp(2.8rem, 6vh, 3.2rem);
  padding: 0 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  background: var(--um-dark-blue);
  color: var(--um-white);
  font-family: 'Titillium Web', sans-serif;
}

.role-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  background-color: #0052a3;
}

/* Ritocchi solo per schermi piccoli */
@media (max-width: 480px) {
  .role-panel {
    border-radius: 12px;
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.55);
  }
}
</style>
