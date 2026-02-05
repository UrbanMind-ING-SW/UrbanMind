<template>
  <div class="um-page">
    <MainNavbar />
    
    <!-- Top bar -->
    <header class="um-topbar">
      <div class="um-topbar-left">
        <div class="um-search">
          <input
            v-model="searchQuery"
            class="um-searchInput"
            type="text"
            placeholder="Cerca proposte, categorie, testo..."
          />
        </div>
        <div class="um-filter">
          <select v-model="sortBy" class="um-filterSelect" aria-label="Ordina">
            <option value="recenti">Più recenti</option>
            <option value="voti">Più votate</option>
            <option value="stato">Stato</option>
          </select>
        </div>
      </div>

    </header>

    <!-- Hero -->
    <section class="um-hero">
      <div class="um-heroText">
        <h2 class="um-heroTitle">Proponi la tua idea al comune</h2>
        <p class="um-heroSubtitle">Cosa ci scriviamo?</p>
      </div>

      <button class="um-primaryBtn" type="button" @click="createProposal">
        + Nuova proposta
      </button>
    </section>

    <!-- List -->
    <main class="um-grid" aria-label="Bacheca proposte">
      <article
        v-for="p in sortedProposals"
        :key="p.id"
        class="um-proposal"
        role="button"
        tabindex="0"
        @click="openProposal(p.id)"
        @keydown.enter.prevent="openProposal(p.id)"
      >
        <header class="um-proposalHead">
          <span class="um-chip um-chip--category">{{ p.categoria }}</span>
          <span class="um-chip" :class="statusClass(p.stato)">{{ labelStato(p.stato) }}</span>
        </header>

        <h3 class="um-proposalTitle">{{ p.titolo }}</h3>
        <p class="um-proposalDesc">{{ p.descrizione }}</p>

        <footer class="um-proposalFoot">
          <span class="um-meta">{{ formatDate(p.data) }}</span>
          <span class="um-votes" title="Voti">👍 {{ p.voti }}</span>
        </footer>
      </article>

      <div v-if="sortedProposals.length === 0" class="um-empty">
        Nessuna proposta trovata.
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import MainNavbar from "@/components/MainNavbar.vue";
import { useRouter } from "vue-router";

const router = useRouter();

function createProposal() {
  router.push({ name: "proposal-new" });
}


const searchQuery = ref("");
const sortBy = ref("recenti");

const proposals = ref([
  {
    id: 1,
    titolo: "Nuova pista ciclabile",
    descrizione:
      "Realizzare una pista ciclabile su via principale, con attraversamenti sicuri e segnaletica dedicata.",
    categoria: "Mobilità",
    stato: "approvata",
    data: "2025-12-20",
    voti: 245,
  },
  {
    id: 2,
    titolo: "Riqualificazione area verde",
    descrizione: "Panchine, illuminazione e nuova area giochi nel quartiere nord.",
    categoria: "Ambiente",
    stato: "in-valutazione",
    data: "2025-12-18",
    voti: 132,
  },
  {
    id: 3,
    titolo: "Illuminazione pubblica smart",
    descrizione: "Sostituire i lampioni con LED e sensori per ridurre consumi e aumentare sicurezza.",
    categoria: "Sicurezza",
    stato: "in-valutazione",
    data: "2025-12-15",
    voti: 89,
  },
  {
    id: 4,
    titolo: "Wi‑Fi pubblico gratuito",
    descrizione: "Hotspot nelle piazze principali e nei pressi di scuole e uffici comunali.",
    categoria: "Tecnologia",
    stato: "approvata",
    data: "2025-12-10",
    voti: 312,
  },
  {
    id: 5,
    titolo: "Centro sportivo polivalente",
    descrizione: "Spazi modulari per sport indoor e attività per giovani e famiglie.",
    categoria: "Sport",
    stato: "respinta",
    data: "2025-12-05",
    voti: 56,
  },
  {
    id: 6,
    titolo: "Biblioteca: orari estesi",
    descrizione: "Estendere l’apertura serale e introdurre postazioni studio prenotabili.",
    categoria: "Cultura",
    stato: "approvata",
    data: "2025-12-01",
    voti: 178,
  },
]);

const filteredProposals = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return proposals.value;

  return proposals.value.filter((p) => {
    return (
      p.titolo.toLowerCase().includes(q) ||
      p.descrizione.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q) ||
      p.stato.toLowerCase().includes(q)
    );
  });
});

const sortedProposals = computed(() => {
  const arr = [...filteredProposals.value];

  if (sortBy.value === "voti") {
    return arr.sort((a, b) => b.voti - a.voti);
  }

  if (sortBy.value === "stato") {
    const order = { "in-valutazione": 0, approvata: 1, respinta: 2 };
    return arr.sort((a, b) => (order[a.stato] ?? 99) - (order[b.stato] ?? 99));
  }

  // recenti (ISO date string)
  return arr.sort((a, b) => (a.data < b.data ? 1 : -1));
});


function labelStato(stato) {
  if (stato === "in-valutazione") return "In valutazione";
  if (stato === "approvata") return "Approvata";
  if (stato === "respinta") return "Respinta";
  return stato;
}

function statusClass(stato) {
  return {
    "um-chip--ok": stato === "approvata",
    "um-chip--wait": stato === "in-valutazione",
    "um-chip--no": stato === "respinta",
  };
}

function formatDate(iso) {
  // YYYY-MM-DD -> DD/MM/YYYY
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
</script>

<style scoped>
.um-page {
  min-height: 100vh;
  background: var(--um-white-soft);
  color: var(--color-text);
}

/* Topbar */
.um-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  gap: 14px;
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
  box-shadow: 0 0 0 3px var(--um-divider-dark);
}


/* Hero */
.um-hero {
  margin: 10px 18px 0;
  padding: 18px 18px;
  background: linear-gradient(135deg, var(--um-orange-soft), var(--um-dark-blue));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.um-heroTitle {
  margin: 0;
  color: var(--um-text-white);
  font-size: clamp(22px, 3vw, 40px);
  font-weight: 800;
  text-align: left;
}

.um-heroSubtitle {
  margin-top: 6px;
  color: var(--um-text-white);
  opacity: 0.9;
  font-size: 0.95rem;
}

.um-primaryBtn {
  border: 0;
  background: var(--um-white);
  color: var(--um-orange);
  font-weight: 700;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
}

/* Grid */
.um-grid {
  padding: 16px 18px 28px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

/* Proposal card (glass + border) */
.um-proposal {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 14px 14px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 190px;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
  transform: translateY(0);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.um-proposal:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.12);
  border-color: var(--um-orange-light);
}

.um-proposal:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--um-divider-dark), 0 14px 30px rgba(0, 0, 0, 0.12);
}

/* Head */
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
  color: var(--um-dark-blue);
  border-color: var(--um-divider-dark);
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

/* Body */
.um-proposalTitle {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-heading);
}

.um-proposalDesc {
  margin-top: 8px;
  font-size: 0.95rem;
  color: var(--color-text);
  opacity: 0.95;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer */
.um-proposalFoot {
  margin-top: auto;
  padding-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid var(--color-border);
}

.um-meta {
  font-size: 0.85rem;
  opacity: 0.85;
}

.um-votes {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--um-orange);
}

/* Empty state */
.um-empty {
  grid-column: 1 / -1;
  padding: 18px;
  border-radius: 14px;
  border: 1px dashed var(--color-border);
  background: var(--color-background);
}

/* Responsive */
@media (max-width: 900px) {
  .um-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .um-topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .um-hero {
    flex-direction: column;
    align-items: stretch;
  }
  .um-primaryBtn {
    width: 100%;
  }
  .um-grid {
    grid-template-columns: 1fr;
  }
}


@media (prefers-reduced-motion: reduce) {
  .um-proposal,
  .um-primaryBtn {
    transition: none;
  }
  .um-proposal:hover {
    transform: none;
  }
}
</style>
