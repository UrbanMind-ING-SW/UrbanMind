<template>
  <div class="operator-proposals-container">
    <!-- Navbar Header -->
    <MainNavbar />

    <!-- Main Content con Sidebar -->
    <div class="content-wrapper">
      <Sidebar :activePage="activePage" @menu-click="handleMenuClick" />

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
                    @click="openDetails(proposal)"
                  >
                    🔍 Dettagli
                  </button>
                  <button 
                    class="btn btn-delete"
                    @click="confirmDelete(proposal)"
                    title="Elimina proposta"
                  >
                    Elimina
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

    <!-- Modal Dettagli Proposta -->
    <div v-if="detailsModal.open" class="modal-overlay" @click.self="closeDetails">
      <div class="modal-box">
        <div class="modal-header">
          <h2>Dettagli Proposta</h2>
          <button class="modal-close" @click="closeDetails">✕</button>
        </div>
        <div class="modal-body" v-if="detailsModal.proposal">
          <div class="detail-row">
            <span class="detail-label">Titolo</span>
            <span class="detail-value fw-bold">{{ detailsModal.proposal.title }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Categoria</span>
            <span class="category-badge">{{ detailsModal.proposal.category }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Stato</span>
            <span class="status-badge" :class="`status-${detailsModal.proposal.status}`">{{ detailsModal.proposal.statusText }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Autore</span>
            <span class="detail-value">👤 {{ detailsModal.proposal.author }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Data</span>
            <span class="detail-value">{{ detailsModal.proposal.initiatedDate }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Voti</span>
            <span class="detail-value">👍 {{ detailsModal.proposal.supportCount }}</span>
          </div>
          <div class="detail-row" v-if="detailsModal.proposal.zona">
            <span class="detail-label">Zona</span>
            <span class="detail-value">📍 {{ detailsModal.proposal.zona }}</span>
          </div>
          <div class="detail-row" v-if="detailsModal.proposal.costoStimato">
            <span class="detail-label">Costo Stimato</span>
            <span class="detail-value">💶 €{{ detailsModal.proposal.costoStimato.toLocaleString('it-IT') }}</span>
          </div>
          <div class="detail-description">
            <span class="detail-label">Descrizione</span>
            <p class="detail-desc-text">{{ detailsModal.proposal.description }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-reject" @click="confirmDelete(detailsModal.proposal!); closeDetails()">🗑️ Elimina</button>
          <button class="btn btn-details modal-btn-close" @click="closeDetails">Chiudi</button>
        </div>
      </div>
    </div>

    <!-- Modal Conferma Eliminazione -->
    <div v-if="deleteModal.open" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal-box modal-box-sm">
        <div class="modal-header">
          <h2>Conferma eliminazione</h2>
          <button class="modal-close" @click="cancelDelete">✕</button>
        </div>
        <div class="modal-body">
          <p>Sei sicuro di voler eliminare la proposta:</p>
          <p class="delete-title">"{{ deleteModal.proposal?.title }}"?</p>
          <p class="delete-warning">⚠️ Questa azione non può essere annullata.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-details modal-btn-close" @click="cancelDelete">Annulla</button>
          <button class="btn btn-delete-confirm" @click="executeDelete" :disabled="deleteModal.loading">
            {{ deleteModal.loading ? 'Eliminazione...' : 'Elimina' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainNavbar from '@/components/MainNavbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import { useProposalsStore } from '@/stores/proposals'

const router = useRouter()
const activePage = ref('Proposte')
const proposalsStore = useProposalsStore()

// Stato dei filtri
const selectedStatus = ref('')
const selectedCategory = ref('')

const handleMenuClick = (label: string) => {
  activePage.value = label
  
  const routeMap: Record<string, string> = {
    'Dashboard': '/operator/dashboard',
    'Segnalazioni': '/operator/reports',
    'Bilanci': '/operator/budgets',
    'Proposte': '/operator/proposals',
    'Utenti': '/operator/users'
  }
  
  const path = routeMap[label]
  if (path) {
    router.push(path)
  }
}

// Carica proposte dal database al montaggio
onMounted(async () => {
  await proposalsStore.fetchProposals()
})

// Mappa le proposte dallo store al formato della vista
const proposals = computed(() => {
  return proposalsStore.proposals.map(p => {
    const statusMap: Record<string, string> = {
      'in-valutazione': 'valutazione',
      'sottoposta': 'valutazione',
      'approvata': 'approvata',
      'respinta': 'rifiutata',
      'bozza': 'valutazione',
    }
    
    const categoryMapUpper: Record<string, string> = {
      'Mobilità': 'MOBILITÀ',
      'Ambiente': 'VERDE PUBBLICO',
      'Sicurezza': 'SICUREZZA',
      'Tecnologia': 'TECNOLOGIA',
      'Sport': 'SPORT',
      'Cultura': 'CULTURA',
      'Altro': 'ALTRO',
    }

    const statusTextMap: Record<string, string> = {
      'valutazione': 'In Valutazione',
      'approvata': 'Approvata',
      'rifiutata': 'Rifiutata',
      'ammissibile': 'Ammissibile',
    }

    const status = statusMap[p.stato] || 'valutazione'

    return {
      id: p.id,
      category: categoryMapUpper[p.categoria] || p.categoria.toUpperCase(),
      title: p.titolo,
      description: p.descrizione,
      author: p.proponente?.name || 'Cittadino',
      supportCount: p.voti,
      initiatedDate: formatDate(p.data),
      status: status,
      statusLabel: statusTextMap[status] || status,
      statusText: statusTextMap[status] || status,
    }
  })
})

function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

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

// Metodi di azione collegati al database
const approveProposal = async (id: string) => {
  try {
    await proposalsStore.approveProposal(id)
  } catch (err) {
    alert('Errore nell\'approvazione della proposta')
  }
}

const rejectProposal = async (id: string) => {
  try {
    await proposalsStore.rejectProposal(id)
  } catch (err) {
    alert('Errore nel rifiuto della proposta')
  }
}

const viewEvaluation = (id: string) => {
  router.push(`/operator/proposals/${id}`)
}

const viewDetails = (id: string) => {
  router.push(`/operator/proposals/${id}`)
}

// --- Modal Dettagli ---
const detailsModal = ref<{ open: boolean; proposal: any | null }>({ open: false, proposal: null })

function openDetails(proposal: any) {
  // Recupera anche i dati extra dallo store (zona, costoStimato)
  const raw = proposalsStore.proposals.find(p => p.id === proposal.id)
  detailsModal.value = {
    open: true,
    proposal: {
      ...proposal,
      zona: raw?.zona || '',
      costoStimato: raw?.costoStimato || 0,
    }
  }
}

function closeDetails() {
  detailsModal.value = { open: false, proposal: null }
}

// --- Modal Elimina ---
const deleteModal = ref<{ open: boolean; proposal: any | null; loading: boolean }>({ open: false, proposal: null, loading: false })

function confirmDelete(proposal: any) {
  deleteModal.value = { open: true, proposal, loading: false }
}

function cancelDelete() {
  deleteModal.value = { open: false, proposal: null, loading: false }
}

async function executeDelete() {
  if (!deleteModal.value.proposal) return
  deleteModal.value.loading = true
  try {
    await proposalsStore.deleteProposal(deleteModal.value.proposal.id)
    cancelDelete()
  } catch (err) {
    alert('Errore durante l\'eliminazione della proposta')
    deleteModal.value.loading = false
  }
}
</script>

<style scoped>
/* Contenitore principale */
.operator-proposals-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--color-background-soft);
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
  background: #f9f9f9;
  padding: 1rem;
  border-radius: var(--radius-sm);
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
  border-radius: var(--radius-xs);
  background-color: white;
  color: #1a202c;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: border-color var(--transition-base);
}

.filter-select:hover {
  border-color: var(--color-orange-600);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-orange-600);
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
  border-radius: var(--radius-sm);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base), transform var(--transition-base);
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
  border-radius: var(--radius-sm);
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
  color: var(--color-orange-600);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-xs);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
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
  border-top: 1px solid var(--color-border);
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
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
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
  border-radius: var(--radius-xs);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-base);
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

.btn-delete {
  background-color: #fff0f0;
  color: #dc3545;
  border: 1.5px solid #f5c6cb;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1;
}

.btn-delete:hover {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
  transform: translateY(-1px);
}

.btn-delete-confirm {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-delete-confirm:hover:not(:disabled) {
  background-color: #c82333;
  transform: translateY(-1px);
}

.btn-delete-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-box {
  background: white;
  border-radius: var(--radius-sm);
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

.modal-box-sm {
  max-width: 420px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #1a202c;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  line-height: 1;
}

.modal-close:hover {
  background: #f0f0f0;
  color: #1a202c;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
}

.modal-btn-close {
  background-color: #f5f5f5 !important;
  color: #1a202c !important;
  border: 1px solid #d0d0d0 !important;
}

/* Dettagli */
.detail-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  min-width: 110px;
  flex-shrink: 0;
}

.detail-value {
  color: #1a202c;
  font-size: 0.95rem;
}

.fw-bold {
  font-weight: 700;
}

.detail-description {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.detail-desc-text {
  margin: 0;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
  background: #f9f9f9;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-xs);
  border-left: 3px solid var(--color-orange-600);
}

/* Eliminazione */
.delete-title {
  font-weight: 600;
  color: #1a202c;
  margin: 0.25rem 0;
}

.delete-warning {
  color: #856404;
  background: #fff3cd;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-xs);
  font-size: 0.9rem;
  margin: 0;
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
