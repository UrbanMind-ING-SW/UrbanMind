<template>
  <div class="operator-page">
    <MainNavbar />
    <div class="content-row">
      <div class="sidebar-wrap">
        <Sidebar :activePage="activePage" @menu-click="handleMenuClick" />
      </div>
      <div class="main-area">

      <div class="container">
        <div class="card users-card">
          <div class="card-header">
            <h3>Lista Utenti Registrati</h3>
            <div class="header-actions">
              <input v-model="q" placeholder="Cerca utente..." class="search" />
              <button class="btn primary">+ Nuovo</button>
            </div>
          </div>

          <div class="card-body">
            <table class="users-table">
              <thead>
                <tr>
                  <th>UTENTE</th>
                  <th>EMAIL</th>
                  <th>RUOLO</th>
                  <th>STATO</th>
                  <th>REGISTRATO IL</th>
                  <th>AZIONI</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in pagedUsers" :key="user.id">
                  <td class="user-cell">
                    <div class="avatar" :style="{backgroundColor: user.color}">
                      {{ avatarInitials(user.name) }}
                    </div>
                    <div class="user-name">{{ user.name }}</div>
                  </td>
                  <td class="muted">{{ user.email }}</td>
                  <td>{{ user.role }}</td>
                  <td>
                    <span :class="['badge', user.active ? 'badge--active' : 'badge--suspended']">{{ user.active ? 'Attivo' : 'Sospeso' }}</span>
                  </td>
                  <td class="muted">{{ user.registered }}</td>
                  <td class="actions">
                    <button class="icon-btn" @click="edit(user)" title="Modifica">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#333" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="icon-btn" @click="toggleStatus(user)" :title="user.active ? 'Sospendi' : 'Attiva'">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20" stroke="#333" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="icon-btn" @click="more(user)" title="Altro">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.5" fill="#333"/><circle cx="12" cy="12" r="1.5" fill="#333"/><circle cx="19" cy="12" r="1.5" fill="#333"/></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="card-footer">
            <div class="pagination">
              <button class="page-btn" :disabled="page===1" @click="page--">Indietro</button>
              <div class="pages">
                <button v-for="p in totalPages" :key="p" :class="['page-number', {active: p===page}]" @click="page = p">{{ p }}</button>
              </div>
              <button class="page-btn" :disabled="page===totalPages" @click="page++">Avanti</button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../components/Sidebar.vue'
import MainNavbar from '../components/MainNavbar.vue'

const router = useRouter()
const q = ref('')
const page = ref(1)
const perPage = 5
const activePage = ref('Utenti')

const handleMenuClick = (label) => {
  activePage.value = label
  
  // Mapping delle label ai percorsi
  const routeMap = {
    'Dashboard': '/home',
    'Segnalazioni': '/reports',
    'Bilanci': '/budgets',
    'Proposte': '/proposals',
    'Utenti': '/users'
  }
  
  const path = routeMap[label]
  if (path) {
    router.push(path)
  }
}

const users = ref([
  { id: 1, name: 'Giuseppe Verdi', email: 'giuseppe.verdi@email.com', role: 'Cittadino', active: true, registered: '10/11/2024', color: '#6aa7ff' },
  { id: 2, name: 'Mario Bianchi', email: 'mario.b@spam.com', role: 'Cittadino', active: false, registered: '01/12/2025', color: '#ff9aa2' },
  { id: 3, name: 'Mario Rossi', email: 'mario.rossi@comune.tn.it', role: 'Admin', active: true, registered: '20/08/2023', color: '#ffb366' },
  { id: 4, name: 'Anna Neri', email: 'anna.neri@example.com', role: 'Cittadino', active: true, registered: '15/01/2024', color: '#b39ddb' },
  { id: 5, name: 'Luca Verdi', email: 'luca.verdi@example.com', role: 'Cittadino', active: true, registered: '02/03/2024', color: '#ffd54f' },
  { id: 6, name: 'Sara Bianchi', email: 'sara.bianchi@example.com', role: 'Cittadino', active: false, registered: '11/11/2024', color: '#81c784' }
])

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return users.value
  return users.value.filter(u => (u.name + ' ' + u.email + ' ' + u.role).toLowerCase().includes(term))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))

const pagedUsers = computed(() => {
  if (page.value > totalPages.value) page.value = totalPages.value
  const start = (page.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

function avatarInitials(name){
  return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()
}

function edit(user){
  alert('Modifica: ' + user.name)
}

function toggleStatus(user){
  user.active = !user.active
}

function more(user){
  alert('Azioni aggiuntive per: ' + user.name)
}
</script>

<style scoped>
.operator-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-background-soft);
}

.content-row {
  display: flex;
  flex: 1;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.container {
  padding: var(--spacing-2xl);
}

.users-card {
  background: var(--color-white);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
}

.card-header h3 {
  margin: 0;
  font-size: var(--font-size-base);
  color: #243746;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  min-width: 200px;
}

.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-white);
  cursor: pointer;
}

.btn.primary {
  background: var(--color-orange-600);
  color: var(--color-white);
  border-color: var(--color-orange-600);
}

.card-body {
  padding: var(--spacing-sm) var(--spacing-xl);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead th {
  font-size: var(--font-size-xs);
  text-align: left;
  color: #6b7280;
  padding: var(--spacing-lg) var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}

.users-table tbody td {
  padding: var(--spacing-lg) var(--spacing-sm);
  border-bottom: 1px solid #f7f7f7;
  vertical-align: middle;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-white);
  font-weight: var(--font-weight-bold);
}

.user-name {
  font-weight: var(--font-weight-bold);
}

.muted {
  color: #7b8b99;
  font-size: var(--font-size-xs);
}

.badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
}

.badge--active {
  background: #e6f7ea;
  color: #2d9a4a;
}

.badge--suspended {
  background: #fdecea;
  color: #d04545;
}

.actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: transparent;
  border: 1px solid #eee;
  padding: var(--spacing-sm);
  border-radius: var(--radius-xs);
  cursor: pointer;
}

.card-footer {
  padding: var(--spacing-md) var(--spacing-xl);
  display: flex;
  justify-content: flex-end;
}

.pagination {
  display: flex;
  gap: 12px;
  align-items: center;
}

.page-number {
  border: 1px solid #eee;
  padding: var(--spacing-sm) var(--spacing-xs);
  border-radius: var(--radius-xs);
  background: var(--color-white);
  cursor: pointer;
}

.page-number.active {
  background: var(--color-orange-600);
  color: var(--color-text-white);
  border-color: var(--color-orange-600);
}

.page-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-xs);
  border: 1px solid #eee;
  background: var(--color-white);
}

.sidebar-wrap {
  flex: 0 0 250px;
  height: calc(100vh - 10vh);
}

@media (max-width: 900px) {
  .container {
    padding: var(--spacing-lg);
  }

  .search {
    min-width: 120px;
  }
}
</style>
