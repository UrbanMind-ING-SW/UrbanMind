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



    
    <h1 class="um-title">{{ title }}</h1>
    
    <div class="um-user">
      <template v-if="userStore.isAuthenticated">
        <span class="um-user-label">{{ dynamicUserLabel }}</span>
        <span class="um-user-name">{{ userName }}</span>
      </template>
      <button v-if="userStore.isAuthenticated" class="um-logout-btn" @click="handleLogout" title="Esci">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
        </svg>
        <span class="um-logout-label">Esci</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

interface Props {
  title?: string
  userLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'UrbanMind',
  userLabel: 'Cittadino loggato',
})

const router = useRouter()
const userStore = useUserStore()

const userName = computed(() => userStore.userName ?? 'Nome Utente')

const dynamicUserLabel = computed(() => {
  if (!userStore.isAuthenticated) return props.userLabel
  const roleMap: Record<string, string> = {
    citizen: 'Cittadino loggato',
    operator: 'Operatore loggato',
    admin: 'Admin loggato',
  }
  return roleMap[userStore.userRole] || props.userLabel
})

function handleLogout() {
  userStore.logout()
  router.push('/')
}

function goToLogin() {
  if (userStore.isAuthenticated) {
    // Se autenticato, vai alla dashboard dell'utente
    const dashboardMap: Record<string, string> = {
      citizen: '/citizen/dashboard',
      operator: '/operator/dashboard',
      admin: '/operator/dashboard',
    }
    const dashboard = dashboardMap[userStore.userRole] || '/'
    router.push(dashboard)
  } else {
    // Se non autenticato, vai alla login
    router.push('/')
  }
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
  color: var(--color-accent);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  position: relative;
  z-index: 10;
  box-shadow: var(--shadow-sm);
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
  color: var(--color-accent);
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
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.um-user-name {
  font-weight: 600;
  color: var(--color-accent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.um-logout-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.35rem;
  margin-left: auto;
  padding: 0.25rem 0.65rem;
  border: 1.5px solid var(--color-border);
  border-radius: 999px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.um-logout-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}


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
    display: none; 
  }

  .um-user-name {
    font-size: 0.7rem;
  }
}


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
