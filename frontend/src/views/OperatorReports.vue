<template>
  <div class="layout-wrapper">
    <MainNavbar />

    <div class="dashboard-container">
      <Sidebar :activePage="activePage" @menu-click="handleMenuClick" />

      <main class="um-main">
        
        <div class="detail-container">
          
          <div class="left-col">
            <div class="um-card detail-card">
              
              <div class="map-placeholder">
                <div class="map-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="#cbd5e0"><path d="M20.5 3l-6 2.25L8.5 3 3.5 4.75v14.5l6-2.25L15.5 19l5-1.75V3zm-6 13.75l-6-2.25V5.5l6 2.25v9z"/></svg>
                </div>
                <div class="location-tag">
                  Via Belenzani, 3, Trento
                </div>
              </div>

              <div class="card-body">
                <div class="header-row">
                  <h2 class="report-title">Buca pericolosa su carreggiata</h2>
                  <span class="status-badge badge-new">Nuova</span>
                </div>

                <p class="report-description">
                  Segnalo una buca profonda circa 10cm al centro della carreggiata, molto pericolosa per i ciclisti. Allego foto.
                </p>

                <div class="attachments-section">
                  <h4 class="section-label">ALLEGATI</h4>
                  <div class="attachment-thumb">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#666"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                  </div>
                </div>
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
              <button class="um-btn-primary full-width">Aggiorna Pratica</button>
            </div>

            <div class="um-card widget-card">
              <h3 class="widget-title sub-title">Dati Cittadino</h3>
              <div class="user-info">
                <div class="user-avatar">GU</div>
                <span class="user-name">Giuseppe Verdi</span>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MainNavbar from '@/components/MainNavbar.vue'
import Sidebar from '@/components/Sidebar.vue'

const router = useRouter();
const activePage = ref('Segnalazioni');

// Stato della pratica (collegato alla select)
const currentStatus = ref('Nuova');

const handleMenuClick = (label: string) => {
  activePage.value = label;
  
  // Mapping delle label ai percorsi
  const routeMap: Record<string, string> = {
    'Dashboard': '/home',
    'Segnalazioni': '/reports',
    'Bilanci': '/budgets',
    'Proposte': '/proposals',
    'Utenti': '/users'
  };
  
  const path = routeMap[label];
  if (path) {
    router.push(path);
  }
};

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

/* --- MAPPA PLACEHOLDER --- */
.map-placeholder {
  background-color: #e2e8f0; /* Grigio mappa */
  height: 250px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-icon {
  opacity: 0.5;
}

.location-tag {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: var(--color-white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-xs);
  font-size: var(--font-size-xs);
  color: #666;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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

/* Badge Stato (Stile "Nuova") */
.status-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}
.badge-new {
  background-color: rgba(0, 103, 208, 0.15);
  color: var(--color-blue-500);
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
</style>