<template>
  <div class="role-page">
    <div class="role-bg"></div>
    <MainNavbar />

    <main class="role-panel">
      <h1 class="role-title">Accedi al sito di UrbanMind</h1>

      <div class="role-actions">
        <button class="role-btn citizen" @click="goCitizen">
          Entra come cittadino
        </button>
        <button class="role-btn operator" @click="goOperator">
          Entra come operatore
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import MainNavbar from '@/components/MainNavbar.vue'
import { useRouter } from 'vue-router'

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
  min-height: 100vh;
  width: 100vw;
  color: var(--um-white);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.role-bg {
  position: absolute;
  inset: 0;
  background-image: url('@/assets/trento-bg.png');
  background-size: cover;
  background-position: center;
}

.role-panel {
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

.role-title {
  font-size: 3rem;
  font-weight: 570;
  margin-bottom: 0.75rem;
  color: var(--um-white);
  -webkit-text-stroke: 0.4px var(--um-medium-gray);
}


.role-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.role-btn {
  padding: 1rem 1.5rem;
  width: 15vw;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.role-btn.citizen {
  background: var(--um-dark-blue);
  color: var(--um-white);
}

.role-btn.operator {
  background: var(--um-dark-blue);
  color: var(--um-white);
}

.role-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}
</style>
