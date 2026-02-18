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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import MainNavbar from '@/components/MainNavbar.vue'
import { usersApi } from '@/services/api'

const router = useRouter()
const q = ref('')
const page = ref(1)
const perPage = 5
const activePage = ref('Utenti')
const isLoading = ref(false)

const handleMenuClick = (label) => {
  activePage.value = label
  
  const routeMap = {
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

const users = ref([])

const colors = ['#6aa7ff', '#ff9aa2', '#ffb366', '#b39ddb', '#ffd54f', '#81c784', '#f48fb1', '#4fc3f7']

// Carica utenti dal database
onMounted(async () => {
  isLoading.value = true
  try {
    const response = await usersApi.getAll()
    users.value = response.data.map((u, idx) => ({
      id: u._id || u.id,
      name: u.name || '',
      email: u.email || '',
      role: u.role === 'operator' ? 'Operatore' : u.role === 'admin' ? 'Admin' : 'Cittadino',
      active: u.isActive !== false,
      registered: u.createdAt ? formatDate(u.createdAt) : '',
      color: colors[idx % colors.length],
    }))
  } catch (err) {
    console.error('Errore nel caricamento utenti:', err)
  } finally {
    isLoading.value = false
  }
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

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

async function edit(user){
  const newName = prompt('Nuovo nome:', user.name)
  if (newName && newName !== user.name) {
    try {
      await usersApi.update(user.id, { name: newName })
      user.name = newName
    } catch (err) {
      alert('Errore nella modifica: ' + (err.message || err))
    }
  }
}

async function toggleStatus(user){
  try {
    await usersApi.update(user.id, { isActive: !user.active })
    user.active = !user.active
  } catch (err) {
    alert('Errore nel cambio stato: ' + (err.message || err))
  }
}

function more(user){
  if (confirm(`Eliminare l'utente ${user.name}?`)) {
    usersApi.delete(user.id).then(() => {
      const idx = users.value.findIndex(u => u.id === user.id)
      if (idx !== -1) users.value.splice(idx, 1)
    }).catch(err => {
      alert('Errore nell\'eliminazione: ' + (err.message || err))
    })
  }
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
