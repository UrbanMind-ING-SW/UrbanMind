<template>
  <div class="layout-wrapper">
    <MainNavbar />

    <div class="dashboard-container">
      <Sidebar :activePage="activePage" @menu-click="handleMenuClick" />

      <main class="um-main">
        
        <div class="detail-container">
          
          <div class="left-col">
            <div class="um-card detail-card" v-if="reportsStore.reports.length > 0">
              
              <div class="map-placeholder">
                <LeafletMap
                  :lat="reportsStore.reports[currentIndex]?.lat"
                  :lon="reportsStore.reports[currentIndex]?.lon"
                  :address="reportsStore.reports[currentIndex]?.zona"
                />
              </div>

              <div class="card-body">
                <div class="header-row">
                  <h2 class="report-title">{{ reportsStore.reports[currentIndex]?.titolo || 'Nessuna segnalazione' }}</h2>
                  <span class="status-badge" :class="statusBadgeClass(reportsStore.reports[currentIndex]?.stato)">{{ statusDisplayMap[reportsStore.reports[currentIndex]?.stato] || reportsStore.reports[currentIndex]?.stato }}</span>
                </div>

                <p class="report-description">
                  {{ reportsStore.reports[currentIndex]?.descrizione || '' }}
                </p>

                <div class="attachments-section">
                  <h4 class="section-label">ALLEGATI</h4>
                  <div class="attachment-thumb">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#666"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                  </div>
                </div>

                <!-- Navigazione tra segnalazioni -->
                <div v-if="reportsStore.reports.length > 1" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                  <button class="um-btn-primary" :disabled="currentIndex === 0" @click="currentIndex--" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">← Precedente</button>
                  <span style="align-self: center; color: #666; font-size: 0.85rem;">{{ currentIndex + 1 }} / {{ reportsStore.reports.length }}</span>
                  <button class="um-btn-primary" :disabled="currentIndex >= reportsStore.reports.length - 1" @click="currentIndex++" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Successiva →</button>
                </div>
              </div>

            </div>
            <div class="um-card detail-card" v-else>
              <div class="card-body" style="text-align: center; padding: 3rem;">
                <p style="color: #666;">Nessuna segnalazione presente.</p>
              </div>
            </div>
          </div>

          <div class="right-col">
            
            <div class="um-card widget-card">
              <h3 class="widget-title">Gestione Pratica</h3>
              <div class="form-group">
                <label class="input-label">Cambia Stato</label>
                <select v-model="currentStatus" class="um-select">
                  <option value="Nuova">Nuova</option>
                  <option value="In Lavorazione">In Lavorazione</option>
                  <option value="Risolta">Risolta</option>
                  <option value="Respinta">Respinta</option>
                </select>
              </div>
              <button class="um-btn-primary full-width" @click="updatePratica">Aggiorna Pratica</button>
              <button class="um-btn-delete full-width" style="margin-top:0.75rem" @click="confirmDelete">Elimina Segnalazione</button>
            </div>

            <div class="um-card widget-card">
              <h3 class="widget-title sub-title">Dati Cittadino</h3>
              <div class="user-info" v-if="reportsStore.reports[currentIndex]?.reporter">
                <div class="user-avatar">{{ (reportsStore.reports[currentIndex]?.reporter?.name || '??').split(' ').map((s: string) => s[0]).slice(0,2).join('').toUpperCase() }}</div>
                <span class="user-name">{{ reportsStore.reports[currentIndex]?.reporter?.name || 'Non disponibile' }}</span>
              </div>
              <div class="user-info" v-else>
                <div class="user-avatar">??</div>
                <span class="user-name">Cittadino anonimo</span>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  </div>

  <!-- Modal Conferma Eliminazione -->
  <div v-if="deleteModal.open" class="modal-overlay" @click.self="cancelDelete">
    <div class="modal-box">
      <div class="modal-header">
        <h2>Conferma eliminazione</h2>
        <button class="modal-close" @click="cancelDelete">&times;</button>
      </div>
      <div class="modal-body">
        <p>Sei sicuro di voler eliminare la segnalazione:</p>
        <p class="delete-title">"{{ reportsStore.reports[currentIndex]?.titolo }}"?</p>
        <p class="delete-warning">&#9888;&#65039; Questa azione non può essere annullata.</p>
      </div>
      <div class="modal-footer">
        <button class="modal-btn-cancel" @click="cancelDelete">Annulla</button>
        <button class="modal-btn-confirm" @click="executeDelete" :disabled="deleteModal.loading">
          {{ deleteModal.loading ? 'Eliminazione...' : 'Elimina' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import MainNavbar from '@/components/MainNavbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import LeafletMap from '@/components/LeafletMap.vue'
import { useReportsStore } from '@/stores/reports'

const router = useRouter();
const activePage = ref('Segnalazioni');
const reportsStore = useReportsStore();

const currentIndex = ref(0);

// Mappa stato interno → label select
const statusDisplayMap: Record<string, string> = {
  'nuovo': 'Nuova',
  'in-elaborazione': 'In Lavorazione',
  'risolto': 'Risolta',
  'respinto': 'Respinta',
};

const currentStatus = ref('Nuova');

// Aggiorna currentStatus quando cambia la segnalazione visualizzata
watch(currentIndex, (idx) => {
  const report = reportsStore.reports[idx];
  if (report) currentStatus.value = statusDisplayMap[report.stato] || 'Nuova';
});

watch(() => reportsStore.reports, (reports) => {
  const report = reports[currentIndex.value];
  if (report) currentStatus.value = statusDisplayMap[report.stato] || 'Nuova';
}, { immediate: true });

function statusBadgeClass(stato: string | undefined) {
  const map: Record<string, string> = {
    'nuovo': 'badge-new',
    'in-elaborazione': 'badge-wip',
    'risolto': 'badge-resolved',
    'respinto': 'badge-rejected',
  }
  return map[stato ?? ''] || 'badge-new'
}

const handleMenuClick = (label: string) => {
  activePage.value = label;
  
  const routeMap: Record<string, string> = {
    'Dashboard': '/operator/dashboard',
    'Segnalazioni': '/operator/reports',
    'Bilanci': '/operator/budgets',
    'Proposte': '/operator/proposals',
    'Utenti': '/operator/users'
  };
  
  const path = routeMap[label];
  if (path) {
    router.push(path);
  }
};

// Carica segnalazioni dal database
onMounted(async () => {
  await reportsStore.fetchReports();
});

// Aggiorna stato della segnalazione corrente
async function updatePratica() {
  const report = reportsStore.reports[currentIndex.value];
  if (!report) return;
  
  const statusMap: Record<string, string> = {
    'Nuova': 'nuova',
    'In Lavorazione': 'in-lavorazione',
    'Risolta': 'risolto',
    'Respinta': 'respinto',
  };
  
  try {
    await reportsStore.updateReportStatus(report.id, statusMap[currentStatus.value] || 'nuovo');
    alert('Stato aggiornato con successo!');
  } catch (err) {
    alert('Errore nell\'aggiornamento dello stato');
  }
}

// Delete modal
const deleteModal = ref({ open: false, loading: false });

function confirmDelete() {
  if (!reportsStore.reports[currentIndex.value]) return;
  deleteModal.value = { open: true, loading: false };
}

function cancelDelete() {
  deleteModal.value = { open: false, loading: false };
}

async function executeDelete() {
  const report = reportsStore.reports[currentIndex.value];
  if (!report) return;
  deleteModal.value.loading = true;
  try {
    await reportsStore.deleteReport(report.id);
    // Aggiusta l'indice se necessario
    if (currentIndex.value >= reportsStore.reports.length && currentIndex.value > 0) {
      currentIndex.value--;
    }
    cancelDelete();
  } catch (err) {
    alert('Errore durante l\'eliminazione');
    deleteModal.value.loading = false;
  }
}

</script>

<style scoped>
/* Riuso variabili CSS definite precedentemente */

/* Layout Wrapper */
.layout-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.dashboard-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  background-color: var(--color-background-soft);
  border-top: 1px solid var(--color-border);
}

.um-main {
  flex-grow: 1;
  padding: var(--spacing-2xl);
  overflow-y: auto;
  background-color: var(--color-background-soft);
}

/* --- GRIGLIA DETTAGLIO --- */
.detail-container {
  display: grid;
  grid-template-columns: 2fr 1fr; /* Colonna sinistra larga il doppio della destra */
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .detail-container {
    grid-template-columns: 1fr; /* Su schermi piccoli diventa una colonna unica */
  }
}

/* --- CARD STYLES --- */
.um-card {
  background: var(--color-white);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

/* --- MAPPA --- */
.map-placeholder {
  height: 280px;
  overflow: hidden;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

/* --- CORPO CARD DETTAGLIO --- */
.card-body {
  padding: 1.5rem;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.report-title {
  font-size: 1.4rem;
  color: var(--color-text-heading);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.report-description {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.5;
}

/* Badge Stato */
.status-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
}
.badge-new {
  background-color: rgba(0, 103, 208, 0.15);
  color: var(--color-blue-500);
}
.badge-wip {
  background-color: #fff3cd;
  color: #856404;
}
.badge-resolved {
  background-color: #d4edda;
  color: #155724;
}
.badge-rejected {
  background-color: #f8d7da;
  color: #721c24;
}

/* Allegati */
.section-label {
  font-size: 0.8rem;
  color: #999;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.attachment-thumb {
  width: 80px;
  height: 80px;
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* --- WIDGETS COLONNA DESTRA --- */
.widget-card {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-top: 3px solid var(--color-orange-600);
}

.widget-title {
  font-size: 1rem;
  font-weight: var(--font-weight-bold);
  color: #333;
  margin-bottom: 1rem;
}

.sub-title {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.form-group {
  margin-bottom: 1rem;
}

.input-label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.um-select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  font-size: 0.95rem;
  color: #333;
  background-color: var(--color-white);
}

.full-width {
  width: 100%;
}

/* Bottone Arancione */
.um-btn-primary {
  background-color: var(--color-orange-600);
  color: var(--color-white);
  border: none;
  padding: 0.7rem 1rem;
  border-radius: var(--radius-xs);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: background var(--transition-base);
}
.um-btn-primary:hover {
  background-color: var(--color-orange-400);
}

/* Utente */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background-color: #cbd5e0;
  color: #4a5568;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.user-name {
  font-weight: 600;
  color: var(--um-text-primary);
}

/* Pulsante Elimina */
.um-btn-delete {
  background-color: #fff0f0;
  color: #dc3545;
  border: 1.5px solid #f5c6cb;
  padding: 0.7rem 1rem;
  border-radius: var(--radius-xs);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-base);
}
.um-btn-delete:hover {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
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
  max-width: 420px;
  display: flex;
  flex-direction: column;
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

.modal-close:hover { background: #f0f0f0; }

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal-body p { margin: 0; color: #555; }

.delete-title {
  font-weight: 700;
  color: #1a202c !important;
}

.delete-warning {
  color: #856404 !important;
  background: #fff3cd;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-xs);
  font-size: 0.9rem;
  margin-top: 0.25rem !important;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
}

.modal-btn-cancel {
  background: #f5f5f5;
  color: #1a202c;
  border: 1px solid #d0d0d0;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-xs);
  font-weight: 600;
  cursor: pointer;
}
.modal-btn-cancel:hover { background: #e8e8e8; }

.modal-btn-confirm {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-xs);
  font-weight: 700;
  cursor: pointer;
  transition: background var(--transition-base);
}
.modal-btn-confirm:hover:not(:disabled) { background: #c82333; }
.modal-btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
</style>