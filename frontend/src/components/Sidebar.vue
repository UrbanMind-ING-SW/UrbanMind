<template>
  <aside class="um-sidebar">
    <nav class="um-nav">
      <ul>
        <li v-for="(item, index) in menuItems" :key="index">
          <a 
            href="#" 
            class="um-nav-link" 
            :class="{ 'active': item.label === activePage }" 
            @click.prevent="selectItem(item.label)"
          >
            <span class="icon" v-html="item.icon"></span>
            
            <span class="label">{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 1. Definiamo le Props per ricevere la pagina attiva dal genitore
const props = defineProps({
  activePage: {
    type: String,
    default: 'Dashboard' // Se non viene passato nulla, evidenzia Dashboard
  }
})

// 2. Definiamo l'emit per comunicare i click (opzionale, utile per navigazione)
const emit = defineEmits(['menu-click'])

const selectItem = (label: string) => {
  emit('menu-click', label)
}

// Configurazione Menu
const menuItems = ref([
  { 
    label: 'Dashboard', 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>` 
  },
  { 
    label: 'Segnalazioni', 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>` 
  },
  { 
    label: 'Bilanci', 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>` 
  },
  { 
    label: 'Proposte', 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/></svg>` 
  },
  { 
    label: 'Utenti', 
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>` 
  },
])
</script>

<style scoped>
/* Contenitore Sidebar */
.um-sidebar {
  width: 250px; 
  background-color: #1a202c; 
  color: var(--um-white);
  display: flex;
  flex-direction: column;
  height: 100%; 
}

.um-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.um-nav-link {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: var(--um-white);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
}

.um-nav-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* LOGICA ATTIVA AGGIORNATA */
.um-nav-link.active {
  color: var(--um-orange); 
  border-left-color: var(--um-orange);
  background-color: rgba(255, 255, 255, 0.05);
  font-weight: 700;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  width: 24px;
  height: 24px;
}

.label {
  line-height: 1;
}
</style>