<template>
  <div class="role-page">
    <div class="role-bg"></div>

    <MainNavbar />

    <main class="role-panel">
      <h1 class="role-title">Accedi al sito di UrbanMind</h1>

      <div class="role-actions">
        <button class="role-btn" @click="goCitizen" :disabled="isLoggingIn">
          {{ isLoggingIn ? 'Accesso in corso...' : 'Entra come cittadino' }}
        </button>
        <button class="role-btn role-btn-operator" @click="goOperator" :disabled="isLoggingIn">
          {{ isLoggingIn ? 'Accesso in corso...' : 'Entra come operatore' }}
        </button>
      </div>
      <p v-if="loginError" class="role-error">{{ loginError }}</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MainNavbar from '@/components/MainNavbar.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const isLoggingIn = ref(false)
const loginError = ref('')

async function loginAs(role: 'citizen' | 'operator') {
  isLoggingIn.value = true
  loginError.value = ''

  const email = role === 'citizen' ? 'cittadino@urbanmind.it' : 'operatore@urbanmind.it'
  const password = 'urbanmind123'
  const name = role === 'citizen' ? 'Cittadino Test' : 'Operatore Test'

  try {
    // Prova il login
    let success = await userStore.login(email, password)

    if (!success) {
      // Se l'utente non esiste ancora, lo registra automaticamente
      userStore.clearError()
      success = await userStore.register(name, email, password, role, 'Trento')
    }

    if (success) {
      router.push(role === 'citizen' ? '/citizen/dashboard' : '/operator/dashboard')
    } else {
      loginError.value = userStore.error || 'Accesso fallito'
    }
  } catch (err) {
    loginError.value = err instanceof Error ? err.message : 'Errore di connessione'
  } finally {
    isLoggingIn.value = false
  }
}

function goCitizen() {
  loginAs('citizen')
}

function goOperator() {
  loginAs('operator')
}
</script>

<style scoped>
.role-page {
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
.role-bg {
  position: fixed;
  inset: 0;
  background-image: url('@/assets/trento-bg.jpg');
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
.role-title {
  font-size: clamp(1.9rem, 4vw, 3rem);
  font-weight: 570;
  margin-bottom: 1.25rem;
   color:  #0066cc;
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
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: transform var(--transition-base), box-shadow var(--transition-base), background-color var(--transition-base);
  background: var(--color-blue-500);
  color: var(--color-text-white);
}

.role-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  background-color: var(--color-blue-700);
}

.role-btn:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.role-btn-operator {
  background: #27ae60;
}

.role-btn-operator:hover {
  background-color: #1e8449;
}

.role-error {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.75rem;
  background: rgba(231, 76, 60, 0.2);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-xs);
}

/* Ritocchi solo per schermi piccoli */
@media (max-width: 480px) {
  .role-panel {
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
  }
}
</style>
