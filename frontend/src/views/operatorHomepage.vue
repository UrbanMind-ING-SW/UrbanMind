<template>
  <div class="layout-wrapper">
    <MainNavbar />

    <div class="dashboard-container">
      
      <Sidebar :activePage="activePage" @menu-click="handleMenuClick" />

      <main class="um-main">
        
        <div class="kpi-grid">
          <div class="um-card kpi-card" v-for="(stat, index) in stats" :key="index">
            <div class="kpi-info">
              <div class="kpi-value">{{ stat.value }}</div>
              <div class="kpi-label">{{ stat.label }}</div>
            </div>
            <div class="kpi-icon-wrapper" :class="stat.colorClass">
              <span v-html="stat.icon"></span>
            </div>
          </div>
        </div>

        <div class="um-card table-section">
          <div class="table-header">
            <h2 class="section-title">Ultime Segnalazioni</h2>
            <button class="um-btn-primary">Export Report</button>
          </div>

          <div class="table-responsive">
            <table class="um-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Categoria</th>
                  <th>Titolo</th>
                  <th>Data</th>
                  <th>Stato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="report in reports" :key="report.id">
                  <td class="text-secondary">{{ report.id }}</td>
                  <td>
                    <div class="cat-cell">
                      <span class="cat-icon" v-html="report.catIcon"></span>
                      {{ report.category }}
                    </div>
                  </td>
                  <td class="font-bold">{{ report.title }}</td>
                  <td>{{ report.date }}</td>
                  <td>
                    <span class="badge" :class="report.statusClass">
                      {{ report.status }}
                    </span>
                  </td>
                  <td>
                    <button class="action-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
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
const activePage = ref('Dashboard');

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

// Dati Simulati KPI
const stats = ref([
  { value: '12', label: 'Segnalazioni Nuove', icon: '&#128233;', colorClass: 'bg-orange' },
  { value: '45', label: 'In Lavorazione', icon: '&#128679;', colorClass: 'bg-blue' },
  { value: '128', label: 'Proposte Bilancio', icon: '&#9989;', colorClass: 'bg-green' },
  { value: '98%', label: 'SLA Rispettati', icon: '&#128200;', colorClass: 'bg-purple' },
]);

// Dati Simulati Tabella
const reports = ref([
  { 
    id: '#SEG-2045', 
    category: 'Viabilità', 
    catIcon: '&#128739;', 
    title: 'Buca pericolosa Via Belenzani', 
    date: '02/12/2025', 
    status: 'Nuova', 
    statusClass: 'status-new' 
  },
  { 
    id: '#SEG-2044', 
    category: 'Rifiuti', 
    catIcon: '&#128465;', 
    title: 'Mancata raccolta Piazza Duomo', 
    date: '01/12/2025', 
    status: 'In Lavorazione', 
    statusClass: 'status-wip' 
  },
]);
</script>

<style scoped>
/* === LAYOUT PRINCIPALE (Fix Altezza) === */
.layout-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Forza l'altezza a tutto lo schermo */
  overflow: hidden; /* Evita lo scroll sulla pagina intera */
}

/* --- CONTENITORE DASHBOARD --- */
.dashboard-container {
  display: flex;
  flex: 1; /* Questo è il trucco: occupa tutto lo spazio verticale rimanente sotto la navbar */
  overflow: hidden; /* Tiene lo scroll dentro questo contenitore se necessario */
  background-color: var(--color-background-soft);
  border-top: 1px solid var(--color-border);
}

/* --- SIDEBAR --- */
/* Assicurati che nel componente Sidebar.vue ci sia 'height: 100%' nel container principale */
/* Qui impostiamo solo il layout flex item */
.um-sidebar { 
  width: 260px;
  flex-shrink: 0;
  /* Il colore di sfondo è gestito dentro il componente Sidebar, ma per sicurezza: */
  background-color: #1a202c; 
}

/* --- MAIN CONTENT --- */
.um-main {
  flex-grow: 1; /* Occupa tutto lo spazio a destra della sidebar */
  padding: var(--spacing-2xl);
  overflow-y: auto; /* Abilita lo scroll solo per il contenuto centrale */
  height: 100%; /* Assicura che usi l'altezza del genitore */
  background-color: var(--color-background-soft);
}

/* --- KPI CARDS GRID --- */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.um-card {
  background: var(--color-white);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-xl);
  border: 1px solid var(--color-border);
}

.kpi-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.kpi-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-500); 
  line-height: 1.2;
}

.kpi-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-top: 4px;
}

.kpi-icon-wrapper {
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* KPI Colors */
.bg-orange { background-color: rgba(243, 109, 11, 0.15); color: var(--color-orange-600); }
.bg-blue { background-color: rgba(0, 103, 208, 0.15); color: var(--color-blue-500); }
.bg-green { background-color: #e6fffa; color: #276749; } 
.bg-purple { background-color: #faf5ff; color: #6b46c1; } 

/* --- TABLE SECTION --- */
.table-section {
  padding: 0; 
  overflow: hidden;
}

.table-header {
  padding: var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
}

.section-title {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--color-blue-500);
  font-weight: var(--font-weight-bold);
}

.um-btn-primary {
  background-color: var(--color-orange-600);
  color: var(--color-white);
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-xs);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: background var(--transition-base);
}

.um-btn-primary:hover {
  background-color: var(--color-orange-400);
}

.table-responsive {
  overflow-x: auto;
}

.um-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.um-table th {
  background-color: var(--color-white);
  color: var(--color-text-secondary);
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
}

.um-table td {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-gray-500);
  vertical-align: middle;
}

.um-table tr:hover {
  background-color: rgba(0,0,0,0.01);
}

.text-secondary {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.font-bold {
  font-weight: 600;
  color: #333;
}

.cat-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  display: inline-block;
}

.status-new {
  background-color: rgba(0, 103, 208, 0.15);
  color: var(--color-blue-500);
}

.status-wip {
  background-color: rgba(243, 109, 11, 0.15);
  color: var(--color-orange-400);
}

.action-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  color: var(--color-gray-500);
  transition: all var(--transition-fast);
}

.action-btn:hover {
  border-color: var(--color-gray-500);
  color: var(--color-blue-500);
}
</style>