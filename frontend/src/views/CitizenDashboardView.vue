<template>
  <div class="home-main">
    <MainNavbar />
    <section class="home-cards">
      <!-- Bilancio -->
      <article 
        class="home-card" 
        @click="goTo('bilancio')"
        role="button"
        tabindex="0"
        @keypress.enter="goTo('bilancio')"
      >
        <div class="card-content">
          <div class="card-icon">
            <img src="../assets/Bilancio.svg" alt="Grafici" />
          </div>
          <h2 class="card-title">Bilancio</h2>
          <p class="card-subtitle">Consulta il bilancio del nostro comune</p>
        </div>
      </article>

      <!-- Proposte -->
      <article 
        class="home-card" 
        @click="goTo('proposte')"
        role="button"
        tabindex="0"
        @keypress.enter="goTo('proposte')"
      >
        <div class="card-content">
          <div class="card-icon">
            <img src="../assets/Proposte.svg" alt="Proposte" />
          </div>
          <h2 class="card-title">Proposte</h2>
          <p class="card-subtitle">Proponi la tua idea</p>
        </div>
      </article>

      <!-- Segnalazioni -->
      <article 
        class="home-card" 
        @click="goTo('segnalazioni')"
        role="button"
        tabindex="0"
        @keypress.enter="goTo('segnalazioni')"
      >
        <div class="card-content">
          <div class="card-icon">
            <img src="../assets/Segnalazioni.svg" alt="Segnalazioni" />
          </div>
          <h2 class="card-title">Segnalazioni</h2>
          <p class="card-subtitle">Segnala i problemi</p>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import MainNavbar from '@/components/MainNavbar.vue'

const router = useRouter()

function goTo(section: 'bilancio' | 'proposte' | 'segnalazioni') {
  const routeMap = {
    bilancio: { name: 'budget' },
    proposte: { name: 'proposals' },
    segnalazioni: { name: 'new-report' }
  }
  
  router.push(routeMap[section])
}
</script>

<style scoped>
.home-main {
  width: 100vw;
  margin: 0 auto;
  background: var(--color-accent);
}

.home-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
}

.home-card {
  background: var(--color-accent);
  color: var(--color-text-white);
  height: 95vh;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s ease-out, box-shadow 0.12s ease-out;

  opacity: 0.95;
}

.home-card:last-child {
  border-right: none;
}

.home-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px 0 rgba(0, 0, 0, 0.25);
  opacity: 1;
}

.home-card:active {
  transform: translateY(-2px);
  box-shadow: 
    -12px 10px 30px -8px rgba(0, 0, 0, 0.35),
    12px 10px 30px -8px rgba(0, 0, 0, 0.35),
    0 12px 35px rgba(0, 0, 0, 0.35);
}


.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

.card-icon {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.home-card:hover .card-icon {
  transform: scale(1.1);
}

.card-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-white);
}

.card-subtitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 400;
  color: var(--color-text-white);
}

@media (max-width: 900px) {
  .home-cards {
    grid-template-columns: 1fr;
  }

  .home-card {
    border-right: none;
    border-bottom: 2px dotted var(--color-text-white);
    height: 30.66vh;
    transition: background-color 0.2s ease;
  }

  .home-card:hover {
    transform: none;
    box-shadow: none;
    background: var(--color-accent-soft);
  }

  .home-card:hover .card-icon {
    transform: none;
  }

  .home-card:last-child {
    border-bottom: none;
  }

  .card-icon {
    width: 120px;
    height: 120px;
  }

  .card-content {
    gap: 1rem;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .card-subtitle {
    font-size: 0.9rem;
  }
}


@media (max-width: 480px) {
  .home-card {
    height: 31vh;
  }

  .card-icon {
    width: 80px;
    height: 80px;
  }

  .card-title {
    font-size: 1.2rem;
  }

  .card-subtitle {
    font-size: 0.8rem;
  }
}


@media (max-width: 360px) {
  .card-content {
    gap: 0.5rem;
  }

  .card-icon {
    width: 60px;
    height: 60px;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-subtitle {
    font-size: 0.75rem;
  }
}
</style>