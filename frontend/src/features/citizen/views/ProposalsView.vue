<template>
  <div class="um-page">
    <MainNavbar />
    
    <header class="um-topbar">
      <div class="um-topbar-left">
        <div class="um-search">
          <input
            :value="proposalsStore.searchQuery"
            class="um-searchInput"
            type="text"
            placeholder="Cerca proposte, categorie, testo..."
            @input="(e) => proposalsStore.setSearchQuery((e.target as HTMLInputElement).value)"
          />
        </div>
        <div class="um-filter">
          <select
            :value="proposalsStore.sortBy"
            class="um-filterSelect"
            aria-label="Ordina"
            @change="(e) => proposalsStore.setSortBy((e.target as HTMLSelectElement).value as any)"
          >
            <option value="recenti">Più recenti</option>
            <option value="voti">Più votate</option>
            <option value="stato">Stato</option>
          </select>
        </div>
      </div>
      <button class="um-primaryBtn" @click="createNewProposal">
        + Nuova Proposta
      </button>
    </header>

    <section class="um-hero">
      <div class="um-heroText">
        <h2 class="um-heroTitle">Proponi la tua idea al comune</h2>
        <p class="um-heroSubtitle">Cosa ci scriviamo?</p>
      </div>
    </section>

    <main class="um-main">
      <div v-if="proposalsStore.isLoading" class="um-empty">
        Caricamento proposte...
      </div>
      <div v-else class="um-grid">
        <article
          v-for="p in proposalsStore.sortedProposals"
          :key="p.id"
          class="um-proposal"
          tabindex="0"
          role="button"
        >
          <header class="um-proposalHead">
            <span class="um-chip um-chip--category">{{ p.categoria }}</span>
            <span class="um-chip" :class="getStatusClass(p.stato)">{{ getLabelStato(p.stato) }}</span>
          </header>

          <h3 class="um-proposalTitle">{{ p.titolo }}</h3>
          <p class="um-proposalDesc">{{ p.descrizione }}</p>

          <footer class="um-proposalFoot">
            <span class="um-meta">{{ formatDate(p.data) }}</span>
            <span class="um-votes" title="Voti">👍 {{ p.voti }}</span>
          </footer>
        </article>

        <div v-if="proposalsStore.sortedProposals.length === 0" class="um-empty">
          Nessuna proposta trovata.
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainNavbar from '@/components/MainNavbar.vue'
import { useProposalsStore } from '@/stores/proposals'

const router = useRouter()
const proposalsStore = useProposalsStore()

// Carica le proposte dal database al montaggio
onMounted(async () => {
  await proposalsStore.fetchProposals()
})

function createNewProposal() {
  router.push({ name: 'proposal-new' })
}

function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function getLabelStato(stato: string): string {
  const labels: Record<string, string> = {
    'in-valutazione': 'In valutazione',
    'sottoposta': 'In valutazione',
    approvata: 'Approvata',
    respinta: 'Respinta',
    bozza: 'Bozza',
  }
  return labels[stato] || stato
}

function getStatusClass(stato: string) {
  return {
    'um-chip--ok': stato === 'approvata',
    'um-chip--wait': stato === 'in-valutazione' || stato === 'sottoposta',
    'um-chip--no': stato === 'respinta',
  }
}
</script>

<style scoped>
.um-page {
  min-height: 100vh;
  background: var(--color-background-soft);
  color: var(--color-text);
}

.um-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xl) var(--spacing-xl);
  gap: var(--spacing-xl);
}

.um-topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.um-search {
  width: clamp(160px, 28vw, 420px);
}

.um-searchInput {
  width: 100%;
  height: 32px;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  padding: 0 12px;
  outline: none;
  background: var(--color-background);
  color: var(--color-text);
}

.um-filterSelect {
  height: 32px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  padding: 0 10px;
  background: var(--color-background);
  color: var(--color-text);
}

.um-filterSelect:focus,
.um-searchInput:focus {
  border-color: var(--color-border-hover);
  box-shadow: 0 0 0 3px var(--color-border-focus);
}

.um-primaryBtn {
  border: 0;
  background: var(--color-white);
  color: var(--color-accent);
  font-weight: 700;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.um-primaryBtn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.um-hero {
  margin: 10px 18px 0;
  padding: 18px 18px;
  background: var(--gradient-hero);
  border-radius: 12px;
}

.um-heroTitle {
  margin: 0;
  color: var(--color-text-white);
  font-size: clamp(22px, 3vw, 34px);
  font-weight: 800;
}

.um-heroSubtitle {
  margin-top: 6px;
  color: var(--color-text-white);
  opacity: 0.9;
  font-size: 0.95rem;
}

.um-main {
  padding: 16px 18px;
}

.um-grid {
  padding: 16px 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.um-proposal {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 14px 14px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 190px;
  box-shadow: var(--shadow-sm);
  transform: translateY(0);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.um-proposal:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-orange-400);
}

.um-proposal:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-border-focus), 0 14px 30px rgba(0, 0, 0, 0.12);
}

.um-proposalHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.um-chip {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  white-space: nowrap;
}

.um-chip--category {
  color: var(--color-blue-500);
  border-color: var(--color-border-focus);
}

.um-chip--ok {
  background: rgba(16, 185, 129, 0.16);
  border-color: rgba(16, 185, 129, 0.35);
  color: #065f46;
}

.um-chip--wait {
  background: rgba(245, 158, 11, 0.16);
  border-color: rgba(245, 158, 11, 0.35);
  color: #7c2d12;
}

.um-chip--no {
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(239, 68, 68, 0.35);
  color: #7f1d1d;
}

.um-proposalTitle {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text-heading);
}

.um-proposalDesc {
  margin-top: 8px;
  font-size: 0.95rem;
  color: var(--color-text);
  opacity: 0.95;
  line-height: 1.5;
  flex: 1;
}

.um-proposalFoot {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.um-meta {
  color: var(--color-text-secondary);
  font-weight: 600;
}

.um-votes {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--color-accent);
}

.um-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

@media (max-width: 1024px) {
  .um-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .um-topbar {
    flex-direction: column;
    gap: 10px;
  }

  .um-topbar-left {
    width: 100%;
  }

  .um-search {
    width: 100%;
  }

  .um-primaryBtn {
    width: 100%;
  }

  .um-grid {
    grid-template-columns: 1fr;
  }
}
</style>
