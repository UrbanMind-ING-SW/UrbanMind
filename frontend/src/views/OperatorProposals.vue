<template>
  <div class="operator-proposals-container">
    <!-- Navbar Header -->
    <MainNavbar />

    <!-- Main Content con Sidebar -->
    <div class="content-wrapper">
      <Sidebar :activePage="'Proposte'" />

      <!-- Contenuto Principale -->
      <main class="proposals-content">
        <!-- Header della pagina -->
        <div class="page-header">
          <h1>Proposte</h1>
        </div>

        <!-- Filtri -->
        <div class="filters-section">
          <span class="filter-label">Filtra per:</span>
          <div class="filter-group">
            <select class="filter-select" v-model="selectedStatus">
              <option value="">Tutti gli stati</option>
              <option value="valutazione">In Valutazione</option>
              <option value="ammissibile">Ammissibile</option>
              <option value="rifiutata">Rifiutata</option>
              <option value="approvata">Approvata</option>
            </select>
          </div>
          <div class="filter-group">
            <select class="filter-select" v-model="selectedCategory">
              <option value="">Tutte le categorie</option>
              <option value="mobilita">Mobilità</option>
              <option value="verde">Verde Pubblico</option>
              <option value="edilizia">Edilizia</option>
              <option value="altro">Altro</option>
            </select>
          </div>
        </div>

        <!-- Lista Proposte -->
        <div class="proposals-list">
          <div 
            v-for="proposal in filteredProposals" 
            :key="proposal.id"
            class="proposal-card"
          >
            <!-- Icona Categoria -->
            <div class="card-icon">
              <div v-if="proposal.category === 'MOBILITÀ'" class="icon-mobilita">
                🚴
              </div>
              <div v-else-if="proposal.category === 'VERDE PUBBLICO'" class="icon-verde">
                🌳
              </div>
              <div v-else class="icon-default">
                📋
              </div>
            </div>

            <!-- Contenuto Card -->
            <div class="card-content">
              <!-- Header -->
              <div class="card-header">
                <div class="proposal-meta">
                  <span class="category-badge">{{ proposal.category }}</span>
                  <span class="proposal-title">{{ proposal.title }}</span>
                </div>
                <span class="initiated-date">Iniziata il {{ proposal.initiatedDate }}</span>
              </div>

              <!-- Descrizione -->
              <p class="proposal-description">{{ proposal.description }}</p>

              <!-- Autore e Support -->
              <div class="proposal-author">
                <span class="author-name">{{ proposal.author }}</span>
                <span class="support-count">{{ proposal.supportCount }} Support</span>
              </div>

              <!-- Footer con Status e Azioni -->
              <div class="card-footer">
                <div class="status-container">
                  <span class="status-label">{{ proposal.statusLabel }}</span>
                  <span class="status-badge" :class="`status-${proposal.status}`">
                    {{ proposal.statusText }}
                  </span>
                </div>

                <div class="action-buttons">
                  <button 
                    v-if="proposal.status === 'valutazione'"
                    class="btn btn-approve"
                    @click="approveProposal(proposal.id)"
                  >
                    ✓ Approva
                  </button>
                  <button 
                    v-if="proposal.status === 'valutazione'"
                    class="btn btn-reject"
                    @click="rejectProposal(proposal.id)"
                  >
                    ✕ Rifiuta
                  </button>
                  <button 
                    v-if="proposal.status === 'ammissibile'"
                    class="btn btn-view"
                    @click="viewEvaluation(proposal.id)"
                  >
                    Vedi Valutazione
                  </button>
                  <button 
                    class="btn btn-details"
                    @click="viewDetails(proposal.id)"
                  >
                    Dettagli
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Se non ci sono proposte -->
        <div v-if="filteredProposals.length === 0" class="no-proposals">
          <p>Nessuna proposta trovata con i filtri selezionati.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MainNavbar from '../components/MainNavbar.vue'
import Sidebar from '../components/Sidebar.vue'

// Stato dei filtri
const selectedStatus = ref('')
const selectedCategory = ref('')

// Dati proposte
const proposals = ref([
  {
    id: 1,
    category: 'MOBILITÀ',
    title: 'Nuova pista ciclabile Lungadige',
    description: 'Proposiamo di estendere la pista ciclabile esistente per collegare meglio la zona universitaria con il centro storico, riducendo il traffico veicolare. Budget stimato: €45.000.',
    author: 'Luigi Bianchi',
    supportCount: 124,
    initiatedDate: '03/12/2025',
    status: 'valutazione',
    statusLabel: 'In Valutazione',
    statusText: 'In Valutazione'
  },
  {
    id: 2,
    category: 'VERDE PUBBLICO',
    title: 'Riqualificazione Parco Santa Chiara',
    description: 'Installazione di nuove panchine e aree gioco per bambini inclusive.',
    author: 'Anna Neri',
    supportCount: 89,
    initiatedDate: '01/12/2025',
    status: 'ammissibile',
    statusLabel: 'Ammissibile',
    statusText: 'Ammissibile'
  },
  {
    id: 3,
    category: 'MOBILITÀ',
    title: 'Parcheggi dedicati ai residenti',
    description: 'Creazione di zone di parcheggio riservate ai residenti della zona centro con tariffe agevolate per favorire la sosta.',
    author: 'Marco Rossi',
    supportCount: 67,
    initiatedDate: '15/11/2025',
    status: 'valutazione',
    statusLabel: 'In Valutazione',
    statusText: 'In Valutazione'
  },
])

// Proposte filtrate
const filteredProposals = computed(() => {
  return proposals.value.filter(proposal => {
    const statusMatch = !selectedStatus.value || proposal.status === selectedStatus.value
    let categoryMatch = true

    if (selectedCategory.value) {
      if (selectedCategory.value === 'mobilita') {
        categoryMatch = proposal.category === 'MOBILITÀ'
      } else if (selectedCategory.value === 'verde') {
        categoryMatch = proposal.category === 'VERDE PUBBLICO'
      }
    }

    return statusMatch && categoryMatch
  })
})

// Metodi di azione
const approveProposal = (id: number) => {
  alert(`Proposta ${id} approvata!`)
  // Logica di approvazione
}

const rejectProposal = (id: number) => {
  alert(`Proposta ${id} rifiutata!`)
  // Logica di rifiuto
}

const viewEvaluation = (id: number) => {
  alert(`Visualizzazione valutazione della proposta ${id}`)
  // Logica per visualizzare valutazione
}

const viewDetails = (id: number) => {
  alert(`Visualizzazione dettagli della proposta ${id}`)
  // Logica per visualizzare dettagli
}
</script>

<style scoped>
/* Contenitore principale */
.operator-proposals-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

/* Wrapper per Sidebar e Content */
.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Area contenuto principale */
.proposals-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 2rem;
  overflow-x: hidden;
}

/* Header della pagina */
.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #1a202c;
  font-weight: 600;
}

/* Sezione Filtri */
.filters-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  background: var(--um-white-soft);
  padding: 1rem;
  border-radius: 8px;
}

.filter-label {
  font-weight: 600;
  color: #1a202c;
  margin-right: 0.5rem;
}

.filter-group {
  display: flex;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background-color: white;
  color: #1a202c;
  font-size: 0.95rem;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-select:hover {
  border-color: #ff8c00;
}

.filter-select:focus {
  outline: none;
  border-color: #ff8c00;
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
}

/* Lista Proposte */
.proposals-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Card Proposta */
.proposal-card {
  display: flex;
  gap: 1.5rem;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.proposal-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* Icona Categoria */
.card-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background-color: #f0f0f0;
  font-size: 2.5rem;
}

.icon-mobilita {
  background-color: #fef3e2;
}

.icon-verde {
  background-color: #e8f5e9;
}

.icon-default {
  background-color: #f5f5f5;
}

/* Contenuto Card */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Header della Card */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.proposal-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-badge {
  background-color: #fff3e0;
  color: #ff8c00;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.proposal-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
}

.initiated-date {
  font-size: 0.85rem;
  color: #666;
  white-space: nowrap;
}

/* Descrizione */
.proposal-description {
  margin: 0.25rem 0;
  font-size: 0.95rem;
  color: #555;
  line-height: 1.5;
}

/* Autore */
.proposal-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
}

.author-name::before {
  content: '👤';
  margin-right: 0.25rem;
}

.support-count::before {
  content: '👍';
  margin-right: 0.25rem;
  margin-left: 0.5rem;
}

/* Footer Card */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.status-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-valutazione {
  background-color: #fff3cd;
  color: #ff8c00;
}

.status-ammissibile {
  background-color: #d4edda;
  color: #155724;
}

.status-rifiutata {
  background-color: #f8d7da;
  color: #721c24;
}

.status-approvata {
  background-color: #d4edda;
  color: #155724;
}

/* Pulsanti di Azione */
.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-approve {
  background-color: #28a745;
  color: white;
}

.btn-approve:hover {
  background-color: #218838;
  transform: translateY(-1px);
}

.btn-reject {
  background-color: #dc3545;
  color: white;
}

.btn-reject:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

.btn-view {
  background-color: #17a2b8;
  color: white;
}

.btn-view:hover {
  background-color: #138496;
  transform: translateY(-1px);
}

.btn-details {
  background-color: #f5f5f5;
  color: #1a202c;
  border: 1px solid #d0d0d0;
}

.btn-details:hover {
  background-color: #e8e8e8;
  transform: translateY(-1px);
}

/* Messaggio assenza proposte */
.no-proposals {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .proposals-content {
    padding: 1rem;
  }

  .proposal-card {
    flex-direction: column;
  }

  .card-icon {
    width: 100%;
    height: 100px;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .action-buttons {
    width: 100%;
    justify-content: flex-start;
  }

  .filters-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-group {
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }
}
</style>
