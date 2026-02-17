<template>
  <div class="um-page">
    <div class="um-navbarWrap">
      <MainNavbar />
    </div>

    <section class="um-hero">
      <div class="um-heroText">
        <div class="um-heroTop">
          <h2 class="um-heroTitle">Bilancio Comunale di Trento 2024</h2>
        </div>
        <p class="um-heroSubtitle">
          Scopri come vengono utilizzate le risorse pubbliche
        </p>
        <div class="um-heroActions">
          <button class="um-actionBtn" @click="downloadReport">
            Scarica Report
          </button>
          <button class="um-actionBtn" @click="compareYears">
            Confronta Anni
          </button>
          <button class="um-actionBtn" @click="filterMissions">
            Filtra Missioni
          </button>
        </div>
      </div>
    </section>

    <!-- ============ AGGIUNGI QUESTI STATI QUANDO USERAI API ============ -->
    <!-- Loading state -->
    <!-- <main v-if="loading" class="um-main">
      <div class="um-loading">Caricamento dati...</div>
    </main> -->

    <!-- Error state -->
    <!-- <main v-else-if="error" class="um-main">
      <div class="um-error">{{ error }}</div>
    </main> -->

    <!-- QUANDO USI API: aggiungi v-else-if="doughnutData && barData && lineData" a <main> sotto -->
    <main class="um-main">
      <div class="um-grid">
        <!-- Grafico donut: distribuzione budget -->
        <section class="um-card um-cardChart">
          <h3 class="um-sectionTitle">Distribuzione Budget per Missione</h3>
          <div class="um-chartWrap">
            <Doughnut :data="doughnutData" :options="doughnutOptions" />
          </div>
          <div class="um-legend">
            <div v-for="(item, i) in legendItems" :key="i" class="um-legendItem">
              <span class="um-legendColor" :style="{ background: item.color }"></span>
              <span class="um-legendLabel">{{ item.label }}</span>
              <span class="um-legendValue">€{{ item.value }}M</span>
            </div>
          </div>
        </section>

        <!-- Top 5 capitoli di spesa -->
        <section class="um-card">
          <h3 class="um-sectionTitle">Top 5 Capitoli di Spesa</h3>
          <div class="um-chartWrap">
            <Bar :data="barData" :options="barOptions" />
          </div>
        </section>

        <!-- Utilizzo Budget 2024 -->
        <section class="um-card um-cardProgress">
          <h3 class="um-sectionTitle">Utilizzo Budget 2024</h3>
          <div class="um-progressWrap">
            <div class="um-progressCircle"></div>
            <p class="um-progressLabel">Utilizzato</p>
          </div>
          <p class="um-progressDetail">€104,2M / €133,4M spesi</p>
        </section>

        <!-- Trend bilancio 2020-2024 -->
        <section class="um-card um-cardWide">
          <h3 class="um-sectionTitle">Trend Bilancio 2020-2024</h3>
          <div class="um-chartWrap">
            <Line :data="lineData" :options="lineOptions" />
          </div>
        </section>

        <!-- Statistiche riepilogative -->
        <section class="um-card um-cardStats">
          <h3 class="um-sectionTitle">Statistiche Riepilogative</h3>
          <div class="um-stats">
            <div class="um-stat">
              <div class="um-statLabel">Bilancio Totale 2024</div>
              <div class="um-statValue">€133.4M</div>
            </div>
            <div class="um-stat">
              <div class="um-statLabel">Spese per 2024</div>
              <div class="um-statValue">€104.2M</div>
            </div>
            <div class="um-stat">
              <div class="um-statLabel">Missioni Principali</div>
              <div class="um-statValue">6</div>
            </div>
            <div class="um-stat">
              <div class="um-statLabel">Capitoli di Spesa</div>
              <div class="um-statValue">42</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
} from "chart.js";
import { Doughnut, Bar, Line } from "vue-chartjs";
import MainNavbar from '@/components/MainNavbar.vue'

/* ============ QUANDO USI API: AGGIUNGI QUESTI IMPORT ============ */
// import { onMounted } from "vue";
// import axios from "axios";
/* ================================================================= */

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
);

/* ============ QUANDO USI API: AGGIUNGI QUESTI REF ============ */
// const loading = ref(false);
// const error = ref(null);
/* ============================================================== */

// Colori tema UrbanMind
const colors = {
  orange: "#F36D0B",
  darkBlue: "#1A2332",
  green: "#4CAF50",
  yellow: "#FFC107",
  red: "#F44336",
  purple: "#9C27B0",
  teal: "#009688",
};

/* ================== DA QUI: SOSTITUISCI CON DATI API ================== */
// Dati grafico donut
const doughnutData = ref({
  labels: [
    "Servizi Sociali",
    "Mobilità",
    "Cultura",
    "Ambiente",
    "Sicurezza",
    "Infrastrutture",
  ],
  datasets: [
    {
      data: [40, 25, 15, 10, 7, 8],
      backgroundColor: [
        colors.orange,
        colors.darkBlue,
        colors.green,
        colors.yellow,
        colors.red,
        colors.purple,
      ],
      borderWidth: 3,
      borderColor: "#fff",
      hoverBorderWidth: 4,
      hoverBorderColor: "#fff",
      hoverOffset: 8,
    },
  ],
});

// Legenda manuale
const legendItems = ref([
  { label: "Servizi Sociali", value: "40.2", color: colors.orange },
  { label: "Mobilità", value: "25.0", color: colors.darkBlue },
  { label: "Cultura", value: "15.3", color: colors.green },
  { label: "Ambiente", value: "10.1", color: colors.yellow },
  { label: "Sicurezza", value: "7.5", color: colors.red },
  { label: "Infrastrutture", value: "8.1", color: colors.purple },
]);

// Dati barre orizzontali (Top 5)
const barData = ref({
  labels: [
    "Trasporto Pubblico",
    "Assistenza Anziani",
    "Musei e Cultura",
    "Servizi Idrici",
    "Verde Pubblico",
  ],
  datasets: [
    {
      data: [20, 15, 12, 10, 8],
      backgroundColor: [
        colors.orange,
        colors.darkBlue,
        colors.green,
        colors.yellow,
        colors.teal,
      ],
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: [
        colors.orange + "dd",
        colors.darkBlue + "dd",
        colors.green + "dd",
        colors.yellow + "dd",
        colors.teal + "dd",
      ],
    },
  ],
});

// Dati trend lineare
const lineData = ref({
  labels: ["2020", "2021", "2022", "2023", "2024"],
  datasets: [
    {
      label: "Bilancio (M€)",
      data: [110, 115, 122, 128, 133.4],
      borderColor: colors.orange,
      backgroundColor: colors.orange + "33",
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: colors.orange,
      pointBorderColor: "#fff",
      pointBorderWidth: 3,
      pointHoverBackgroundColor: colors.orange,
      pointHoverBorderColor: "#fff",
      pointHoverBorderWidth: 4,
    },
  ],
});
/* ================== A QUI: FINE DATI DA SOSTITUIRE ================== */

/* ============ QUANDO USI API: AGGIUNGI QUESTA FUNZIONE ============ */
// async function fetchBudgetData() {
//   loading.value = true;
//   error.value = null;
//   
//   try {
//     const response = await axios.get('/api/budget/2024');
//     const apiData = response.data;
//     
//     // Trasforma dati API in formato Chart.js
//     doughnutData.value = {
//       labels: apiData.missions.map(m => m.name),
//       datasets: [{
//         data: apiData.missions.map(m => m.amount / 1000000), // converti in milioni
//         backgroundColor: [colors.orange, colors.darkBlue, colors.green, colors.yellow, colors.red, colors.purple],
//         borderWidth: 3,
//         borderColor: "#fff",
//         hoverBorderWidth: 4,
//         hoverBorderColor: "#fff",
//         hoverOffset: 8,
//       }],
//     };
//     
//     legendItems.value = apiData.missions.map((m, i) => ({
//       label: m.name,
//       value: (m.amount / 1000000).toFixed(1),
//       color: [colors.orange, colors.darkBlue, colors.green, colors.yellow, colors.red, colors.purple][i]
//     }));
//     
//     barData.value = {
//       labels: apiData.topExpenses.map(e => e.name),
//       datasets: [{
//         data: apiData.topExpenses.map(e => e.amount / 1000000),
//         backgroundColor: [colors.orange, colors.darkBlue, colors.green, colors.yellow, colors.teal],
//         borderRadius: 8,
//         borderSkipped: false,
//         hoverBackgroundColor: [colors.orange + "dd", colors.darkBlue + "dd", colors.green + "dd", colors.yellow + "dd", colors.teal + "dd"],
//       }],
//     };
//     
//     lineData.value = {
//       labels: apiData.trend.map(t => t.year),
//       datasets: [{
//         label: "Bilancio (M€)",
//         data: apiData.trend.map(t => t.amount / 1000000),
//         borderColor: colors.orange,
//         backgroundColor: colors.orange + "33",
//         borderWidth: 3,
//         tension: 0.4,
//         fill: true,
//         pointRadius: 6,
//         pointHoverRadius: 8,
//         pointBackgroundColor: colors.orange,
//         pointBorderColor: "#fff",
//         pointBorderWidth: 3,
//         pointHoverBackgroundColor: colors.orange,
//         pointHoverBorderColor: "#fff",
//         pointHoverBorderWidth: 4,
//       }],
//     };
//     
//   } catch (e) {
//     error.value = 'Errore nel caricamento dei dati del bilancio';
//     console.error(e);
//   } finally {
//     loading.value = false;
//   }
// }
//
// // Carica dati al mount del componente
// onMounted(() => {
//   fetchBudgetData();
// });
/* ================================================================== */

// Chart options (queste rimangono così, sono configurazione UI)
const doughnutOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(26, 35, 50, 0.95)",
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 12,
      borderColor: colors.orange,
      borderWidth: 2,
      displayColors: true,
      callbacks: {
        label: (ctx) => `${ctx.label}: €${ctx.parsed}M (${((ctx.parsed / 105) * 100).toFixed(1)}%)`,
      },
    },
  },
  cutout: "72%",
  animation: {
    animateRotate: true,
    animateScale: true,
  },
});

const barOptions = ref({
  indexAxis: "y",
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(26, 35, 50, 0.95)",
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 12,
      borderColor: colors.orange,
      borderWidth: 2,
      callbacks: {
        label: (ctx) => `€${ctx.parsed.x}M`,
      },
    },
  },
  scales: {
    x: {
      grid: { 
        display: true,
        color: "rgba(0, 0, 0, 0.05)",
        drawBorder: false,
      },
      ticks: { 
        callback: (val) => `€${val}M`,
        font: { weight: "600" },
      },
    },
    y: { 
      grid: { display: false },
      ticks: {
        font: { weight: "600" },
      },
    },
  },
  animation: {
    duration: 800,
    easing: "easeInOutQuart",
  },
});

const lineOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(26, 35, 50, 0.95)",
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 12,
      borderColor: colors.orange,
      borderWidth: 2,
      callbacks: {
        label: (ctx) => `€${ctx.parsed.y}M`,
      },
    },
  },
  scales: {
    x: { 
      grid: { display: false },
      ticks: {
        font: { weight: "600" },
      },
    },
    y: {
      grid: { 
        color: "rgba(0, 0, 0, 0.05)",
        drawBorder: false,
      },
      ticks: { 
        callback: (val) => `€${val}M`,
        font: { weight: "600" },
      },
    },
  },
  interaction: {
    mode: "index",
    intersect: false,
  },
  animation: {
    duration: 1000,
    easing: "easeInOutQuart",
  },
});

// Funzioni pulsanti
/* ============ DA QUI: MODIFICA PER API ============ */
//function downloadReport() {
  //console.log("Download report PDF/CSV");
  // TODO: chiamata API
  // axios.get('/api/budget/2024/report?format=pdf', { responseType: 'blob' })
  //   .then(response => {
  //     const url = window.URL.createObjectURL(response.data);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'bilancio_2024.pdf';
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   });
//}
/* ============ A QUI ============ */

function compareYears() {
  console.log("Mostra confronto anni");
  // TODO: mostra modal o navigazione
}

function filterMissions() {
  console.log("Filtra per missione");
  // TODO: mostra filtri
}
</script>

<style scoped>
.um-page {
  min-height: 100vh;
  background: var(--color-background-soft);
  color: var(--color-text);
}

.um-navbarWrap {
  border-bottom: 1px solid var(--color-border);
}

.um-hero {
  margin: 10px 18px 0;
  padding: 18px 18px;
  background: var(--gradient-hero);
  border-radius: 12px;
}

.um-heroTop {
  display: flex;
  align-items: center;
  gap: 8px;
}

.um-heroTitle {
  margin: 0;
  color: var(--color-text-white);
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 800;
}

.um-heroSubtitle {
  margin: 6px 0 12px;
  color: var(--color-text-white);
  opacity: 0.9;
  font-size: 0.96rem;
}

.um-heroActions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.um-actionBtn {
  padding: 9px 16px;
  background: rgba(255, 255, 255, 0.95);
  color: var(--color-blue-700);
  border: none;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.um-actionBtn:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.um-actionBtn:active {
  transform: translateY(0);
}

.um-main {
  padding: 18px;
}

/* ============ QUANDO USI API: AGGIUNGI QUESTI STILI ============ */
/* .um-loading,
.um-error {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.um-error {
  color: #F44336;
} */
/* =============================================================== */

.um-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  max-width: 1360px;
  margin: 0 auto;
}

.um-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.um-cardChart {
  grid-column: span 1;
}

.um-cardWide {
  grid-column: span 2;
}

.um-cardProgress {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.um-sectionTitle {
  margin: 0 0 14px;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text-heading);
}

.um-chartWrap {
  position: relative;
  height: 280px;
}


.um-legend {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.um-legendItem {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
}

.um-legendColor {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.um-legendLabel {
  flex: 1;
  font-weight: 600;
}

.um-legendValue {
  font-weight: 800;
  color: var(--color-text-heading);
}


.um-progressWrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.um-progressCircle {
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 2.4rem;
  font-weight: 800;
  color: #4caf50;
  background: conic-gradient(
    #4caf50 0% 78%,
    #e0e0e0 78% 100%
  );
  position: relative;
}

.um-progressCircle::before {
  content: '';
  position: absolute;
  width: 116px;
  height: 116px;
  border-radius: 50%;
  background: var(--color-background);
}

.um-progressCircle::after {
  content: '78%';
  position: absolute;
  font-size: 2.4rem;
  font-weight: 800;
  color: #4caf50;
  z-index: 1;
}

.um-progressLabel {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-heading);
}

.um-progressDetail {
  margin: 8px 0 0;
  font-size: 0.88rem;
  opacity: 0.8;
}


.um-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.um-stat {
  padding: 12px;
  background: var(--color-background-soft);
  border-radius: 10px;
}

.um-statLabel {
  font-size: 0.82rem;
  opacity: 0.76;
  margin-bottom: 6px;
}

.um-statValue {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text-heading);
}

@media (max-width: 768px) {
  .um-cardWide {
    grid-column: span 1;
  }
  
  .um-actionBtn {
    flex: 1 1 auto;
    text-align: center;
  }
}
</style>
