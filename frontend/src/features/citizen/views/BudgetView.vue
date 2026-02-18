<template>
  <div class="um-page">
    <div class="um-navbarWrap">
      <MainNavbar />
    </div>

    <section class="um-hero">
      <div class="um-heroText">
        <div class="um-heroTop">
          <h2 class="um-heroTitle">Bilancio Comunale di Trento {{ activeFilters.year }}</h2>
        </div>
        <p class="um-heroSubtitle">
          Scopri come vengono utilizzate le risorse pubbliche
          <span v-if="activeFilters.categories.length > 0" class="um-filter-badge">
            ({{ activeFilters.categories.length }} {{ activeFilters.categories.length === 1 ? 'categoria' : 'categorie' }} selezionate)
          </span>
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

    <!-- Loading state -->
    <main v-if="loading" class="um-main">
      <div class="um-empty" style="text-align: center; padding: 3rem;">Caricamento dati bilancio...</div>
    </main>

    <!-- Error state -->
    <main v-else-if="error" class="um-main">
      <div class="um-empty" style="text-align: center; padding: 3rem; color: red;">{{ error }}</div>
    </main>

    <main v-else-if="doughnutData && barData && lineData" class="um-main">
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
          <p class="um-progressDetail">€{{ statsData.totalSpent }}M / €{{ statsData.totalBudget }}M spesi</p>
        </section>

        <!-- Trend bilancio anno su anno -->
        <section class="um-card um-cardWide">
          <h3 class="um-sectionTitle">{{ trendTitle }}</h3>
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
              <div class="um-statValue">€{{ statsData.totalBudget }}M</div>
            </div>
            <div class="um-stat">
              <div class="um-statLabel">Spese per 2024</div>
              <div class="um-statValue">€{{ statsData.totalSpent }}M</div>
            </div>
            <div class="um-stat">
              <div class="um-statLabel">Missioni Principali</div>
              <div class="um-statValue">{{ statsData.missions }}</div>
            </div>
            <div class="um-stat">
              <div class="um-statLabel">Capitoli di Spesa</div>
              <div class="um-statValue">{{ statsData.chapters }}</div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Modal per confronto anni -->
    <div v-if="showCompareModal" class="um-modal" @click="closeCompareModal">
      <div class="um-modal-content" @click.stop>
        <div class="um-modal-header">
          <h3>Confronta Anni</h3>
          <button @click="closeCompareModal" class="um-modal-close">&times;</button>
        </div>
        <div class="um-modal-body">
          <div class="um-year-selection">
            <h4>Seleziona gli anni da confrontare:</h4>
            <div class="um-year-checkboxes">
              <label v-for="year in availableYears" :key="year" class="um-checkbox-label">
                <input 
                  type="checkbox" 
                  :value="year"
                  v-model="selectedYears"
                  :disabled="selectedYears.length >= 3 && !selectedYears.includes(year)"
                >
                {{ year }}
              </label>
            </div>
            <p class="um-helper-text">Puoi selezionare massimo 3 anni</p>
          </div>
          <div class="um-modal-actions">
            <button @click="closeCompareModal" class="um-btn um-btn-secondary">Annulla</button>
            <button @click="executeCompare" :disabled="selectedYears.length < 2" class="um-btn um-btn-primary">
              Confronta
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal per filtro missioni -->
    <div v-if="showFilterModal" class="um-modal" @click="closeFilterModal">
      <div class="um-modal-content" @click.stop>
        <div class="um-modal-header">
          <h3>Filtra per Missioni e Anno</h3>
          <button @click="closeFilterModal" class="um-modal-close">&times;</button>
        </div>
        <div class="um-modal-body">
          <!-- Selezione Anno -->
          <div class="um-filter-year">
            <h4>Seleziona l'anno:</h4>
            <select v-model="selectedYear" class="um-year-select">
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          
          <!-- Selezione Categorie -->
          <div class="um-filter-selection">
            <h4>Seleziona le missioni da visualizzare:</h4>
            <div class="um-filter-checkboxes">
              <label v-for="category in availableCategories" :key="category.category" class="um-checkbox-label">
                <input 
                  type="checkbox" 
                  :value="category.category"
                  v-model="selectedCategories"
                >
                <span class="um-category-info">
                  <strong>{{ formatCategoryName(category.category) }}</strong>
                  <small>({{ category.count }} progetti, €{{ (category.totalBudget / 1000000).toFixed(1) }}M)</small>
                </span>
              </label>
            </div>
            <div class="um-filter-actions">
              <button @click="selectAllCategories" class="um-btn um-btn-tertiary um-btn-small">
                Seleziona Tutto
              </button>
              <button @click="deselectAllCategories" class="um-btn um-btn-tertiary um-btn-small">
                Deseleziona Tutto
              </button>
            </div>
          </div>
          <div class="um-modal-actions">
            <button @click="resetFilters" class="um-btn um-btn-tertiary">Resetta Filtri</button>
            <button @click="closeFilterModal" class="um-btn um-btn-secondary">Annulla</button>
            <button @click="applyFilters" class="um-btn um-btn-primary">
              Applica Filtri
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal per risultati confronto -->
    <div v-if="showCompareResults" class="um-modal um-modal-wide" @click="closeCompareResults">
      <div class="um-modal-content" @click.stop>
        <div class="um-modal-header">
          <h3>Confronto Anni: {{ selectedYears.join(', ') }}</h3>
          <button @click="closeCompareResults" class="um-modal-close">&times;</button>
        </div>
        <div class="um-modal-body">
          <div v-if="comparisonLoading" class="um-loading">
            Caricamento dati di confronto...
          </div>
          <div v-else-if="comparisonData" class="um-comparison-results">
            <!-- Grafici di confronto -->
            <div class="um-comparison-charts">
              <div class="um-chart-section">
                <h4>Confronto Budget Totale per Anno</h4>
                <div class="um-chart-wrap">
                  <Bar :data="comparisonBarData" :options="comparisonBarOptions" />
                </div>
              </div>
              <div class="um-chart-section">
                <h4>Trend Budget per Categoria</h4>
                <div class="um-chart-wrap">
                  <Line :data="comparisonLineData" :options="comparisonLineOptions" />
                </div>
              </div>
            </div>
            <!-- Tabella riassuntiva -->
            <div class="um-comparison-table">
              <h4>Riepilogo Numerico</h4>
              <table class="um-table">
                <thead>
                  <tr>
                    <th>Anno</th>
                    <th>Budget Totale</th>
                    <th>Budget Allocato</th>
                    <th>Budget Rimanente</th>
                    <th>Progetti</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in comparisonData.comparison" :key="item.year">
                    <td><strong>{{ item.year }}</strong></td>
                    <td>€{{ (item.total.totalBudget / 1000000).toFixed(1) }}M</td>
                    <td>€{{ (item.total.allocatedBudget / 1000000).toFixed(1) }}M</td>
                    <td>€{{ (item.total.remainingBudget / 1000000).toFixed(1) }}M</td>
                    <td>{{ item.total.count }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
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
import { budgetsApi } from '@/services/api'

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

const loading = ref(false);
const error = ref(null);

// Variabili per modali e confronti
const showCompareModal = ref(false);
const showFilterModal = ref(false);
const showCompareResults = ref(false);
const selectedYears = ref([]);
const selectedYear = ref(2025); // Per il filtro anno - ultimo anno con dati
const selectedCategories = ref([]);
const availableYears = ref([]);
const availableCategories = ref([]);
const comparisonData = ref(null);
const comparisonLoading = ref(false);
const comparisonBarData = ref(null);
const comparisonLineData = ref(null);
const activeFilters = ref({
  categories: [],
  year: 2025  // Anno con dati disponibili nel database
});

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

const colorPalette = [colors.orange, colors.darkBlue, colors.green, colors.yellow, colors.red, colors.purple, colors.teal];

// Dati grafici (inizializzati vuoti, caricati da API o con default)
const doughnutData = ref(null);
const legendItems = ref([]);
const barData = ref(null);
const lineData = ref(null);
const statsData = ref({ totalBudget: '0', totalSpent: '0', missions: 0, chapters: 0 });
const trendTitle = ref('Trend Bilancio');

// Dati di fallback se il DB è vuoto
function loadDefaultData() {
  doughnutData.value = {
    labels: ["Servizi Sociali", "Mobilità", "Cultura", "Ambiente", "Sicurezza", "Infrastrutture"],
    datasets: [{
      data: [40, 25, 15, 10, 7, 8],
      backgroundColor: colorPalette.slice(0, 6),
      borderWidth: 3, borderColor: "#fff", hoverBorderWidth: 4, hoverBorderColor: "#fff", hoverOffset: 8,
    }],
  };

  legendItems.value = [
    { label: "Servizi Sociali", value: "40.2", color: colors.orange },
    { label: "Mobilità", value: "25.0", color: colors.darkBlue },
    { label: "Cultura", value: "15.3", color: colors.green },
    { label: "Ambiente", value: "10.1", color: colors.yellow },
    { label: "Sicurezza", value: "7.5", color: colors.red },
    { label: "Infrastrutture", value: "8.1", color: colors.purple },
  ];

  barData.value = {
    labels: ["Trasporto Pubblico", "Assistenza Anziani", "Musei e Cultura", "Servizi Idrici", "Verde Pubblico"],
    datasets: [{
      data: [20, 15, 12, 10, 8],
      backgroundColor: colorPalette.slice(0, 5),
      borderRadius: 8, borderSkipped: false,
      hoverBackgroundColor: colorPalette.slice(0, 5).map(c => c + "dd"),
    }],
  };

  lineData.value = {
    labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
    datasets: [{
      label: "Bilancio (M€)", data: [110, 115, 122, 128, 133.4, 138.0],
      borderColor: colors.orange, backgroundColor: colors.orange + "33", borderWidth: 3,
      tension: 0.4, fill: true, pointRadius: 6, pointHoverRadius: 8,
      pointBackgroundColor: colors.orange, pointBorderColor: "#fff", pointBorderWidth: 3,
      pointHoverBackgroundColor: colors.orange, pointHoverBorderColor: "#fff", pointHoverBorderWidth: 4,
    }],
  };

  trendTitle.value = 'Trend Bilancio 2020–2025';
  statsData.value = { totalBudget: '133.4', totalSpent: '104.2', missions: 6, chapters: 42 };
}

// Carica dati bilancio dal database
async function fetchBudgetData() {
  loading.value = true;
  error.value = null;
  
  try {
    // Costruisci parametri filtro
    const params = { limit: '1000' };
    if (activeFilters.value.year) {
      params.year = activeFilters.value.year.toString();
    }
    // Non passiamo category come parametro - filtreremo nel frontend
    
    console.log('Caricamento dati con filtri:', params);
    const response = await budgetsApi.getAll(params);
    let budgets = response.data.budgets;
    
    // Applica filtro categorie nel frontend se necessario
    if (activeFilters.value.categories && activeFilters.value.categories.length > 0) {
      budgets = budgets.filter(b => activeFilters.value.categories.includes(b.category));
      console.log('Budget dopo filtro categorie:', budgets.length);
    }
    
    console.log('Budget caricati:', budgets.length);
    
    if (!budgets || budgets.length === 0) {
      // Nessun dato nel DB, usa dati di default
      loadDefaultData();
      // Se non ci sono dati reali, aggiungi anni di default
      if (availableYears.value.length === 0) {
        const currentYear = new Date().getFullYear();
        availableYears.value = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
      }
      return;
    }

    // Elabora dati dal DB per i grafici
    const categoryTotals = {};
    let totalAmount = 0;
    let totalSpent = 0;
    
    budgets.forEach(b => {
      const cat = b.category || 'Altro';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (b.totalAmount || b.amount || 0);
      totalAmount += b.totalAmount || b.amount || 0;
      totalSpent += b.allocatedAmount || b.spent || 0;
    });
    
    const categories = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals).map(v => (v / 1000000).toFixed(1));
    
    doughnutData.value = {
      labels: categories,
      datasets: [{
        data: values, backgroundColor: colorPalette.slice(0, categories.length),
        borderWidth: 3, borderColor: "#fff", hoverBorderWidth: 4, hoverBorderColor: "#fff", hoverOffset: 8,
      }],
    };
    
    legendItems.value = categories.map((cat, i) => ({
      label: cat, value: values[i], color: colorPalette[i % colorPalette.length],
    }));
    
    barData.value = {
      labels: categories.slice(0, 5),
      datasets: [{
        data: values.slice(0, 5),
        backgroundColor: colorPalette.slice(0, 5), borderRadius: 8, borderSkipped: false,
        hoverBackgroundColor: colorPalette.slice(0, 5).map(c => c + "dd"),
      }],
    };
    
    // Il trend viene caricato separatamente da fetchTrendData
    
    statsData.value = {
      totalBudget: (totalAmount / 1000000).toFixed(1),
      totalSpent: (totalSpent / 1000000).toFixed(1),
      missions: categories.length,
      chapters: budgets.length,
    };
    
  } catch (e) {
    // Se API fallisce, usa dati di default
    loadDefaultData();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchBudgetData();
  fetchAvailableYears();
  fetchAvailableCategories();
  fetchTrendData();
});

// Funzioni pulsanti
async function downloadReport() {
  try {
    const year = activeFilters.value.year;
    const category = activeFilters.value.categories.length > 0 ? activeFilters.value.categories[0] : undefined;
    
    console.log('Downloading report for year:', year, 'category:', category);
    
    // Download CSV
    const response = await budgetsApi.downloadReport('csv', year, category);
    
    if (response && response.ok) {
      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      
      if (blob.size === 0) {
        throw new Error('Il file CSV generato è vuoto');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bilancio_${year}${category ? '_' + category : ''}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('CSV downloaded successfully');
      return;
    } else {
      throw new Error('Errore nel download del report CSV');
    }
  } catch (error) {
    console.error('Errore nel download CSV:', error);
    
    // Fallback: report JSON
    try {
      console.log('Tentativo download JSON...');
      const jsonResponse = await budgetsApi.downloadReport('json', activeFilters.value.year, activeFilters.value.categories[0]);
      
      if (jsonResponse && jsonResponse.data) {
        const jsonText = JSON.stringify(jsonResponse.data, null, 2);
        const blob = new Blob([jsonText], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bilancio_${activeFilters.value.year}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log('JSON downloaded successfully');
        return;
      }
    } catch (jsonError) {
      console.error('Errore anche con JSON:', jsonError);
    }
    
    // Ultimo fallback: report testuale semplice
    const text = `Bilancio Comunale ${activeFilters.value.year}\n\nBilancio Totale: €${statsData.value.totalBudget}M\nSpese: €${statsData.value.totalSpent}M\nMissioni: ${statsData.value.missions}\nCapitoli: ${statsData.value.chapters}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bilancio_${activeFilters.value.year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('Text file downloaded as fallback');
  }
}

function compareYears() {
  showCompareModal.value = true;
}

// Funzioni per modal confronto anni
function closeCompareModal() {
  showCompareModal.value = false;
  selectedYears.value = [];
}

async function executeCompare() {
  if (selectedYears.value.length < 2) {
    alert('Seleziona almeno 2 anni per il confronto');
    return;
  }
  
  comparisonLoading.value = true;
  showCompareModal.value = false;
  showCompareResults.value = true;
  
  try {
    const response = await budgetsApi.compareYears(selectedYears.value);
    comparisonData.value = response.data;
    generateComparisonCharts();
  } catch (error) {
    console.error('Errore nel confronto anni:', error);
    alert('Errore nel caricamento dei dati di confronto');
    showCompareResults.value = false;
  } finally {
    comparisonLoading.value = false;
  }
}

function closeCompareResults() {
  showCompareResults.value = false;
  comparisonData.value = null;
  selectedYears.value = [];
}

// Funzioni per modal filtro missioni
function closeFilterModal() {
  showFilterModal.value = false;
  selectedCategories.value = [...activeFilters.value.categories];
  selectedYear.value = activeFilters.value.year;
}

function resetFilters() {
  selectedCategories.value = [];
  selectedYear.value = 2025;  // Ultimo anno con dati disponibili
  activeFilters.value.categories = [];
  activeFilters.value.year = 2025;  // Ultimo anno con dati disponibili
  fetchBudgetData();
  showFilterModal.value = false;
}

function applyFilters() {
  activeFilters.value.categories = [...selectedCategories.value];
  activeFilters.value.year = selectedYear.value;
  fetchBudgetData();
  showFilterModal.value = false;
}

function selectAllCategories() {
  selectedCategories.value = availableCategories.value.map(cat => cat.category);
}

function deselectAllCategories() {
  selectedCategories.value = [];
}

function filterMissions() {
  // Inizializza i valori selezionati con i filtri attivi
  selectedCategories.value = [...activeFilters.value.categories];
  selectedYear.value = activeFilters.value.year;
  showFilterModal.value = true;
}

// Funzioni di supporto
async function fetchAvailableYears() {
  try {
    // Prendi tutti i budget senza filtri per ottenere tutti gli anni (aumenta il limite)
    const response = await budgetsApi.getAll({ limit: '1000' });
    const years = [...new Set(response.data.budgets.map(b => b.year))].filter(y => y).sort((a, b) => b - a);
    
    console.log('Anni trovati nel database:', years);
    
    // Se non ci sono anni nel DB, aggiungi anni storici di default
    if (years.length === 0) {
      const currentYear = new Date().getFullYear();
      availableYears.value = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
      console.log('Nessun anno trovato, usando anni di default:', availableYears.value);
      
      // Opzionalmente, crea alcuni dati di test
      await createTestData();
    } else {
      availableYears.value = years;
      console.log('Anni disponibili impostati:', availableYears.value);
    }
  } catch (error) {
    console.error('Errore nel caricamento degli anni:', error);
    // Fallback con anni predefiniti
    const currentYear = new Date().getFullYear();
    availableYears.value = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
    console.log('Errore, usando anni di default:', availableYears.value);
  }
}

async function fetchAvailableCategories() {
  try {
    const response = await budgetsApi.getCategories();
    availableCategories.value = response.data.details;
    console.log('Categorie disponibili:', availableCategories.value);
    
    // Inizializza con tutte le categorie selezionate se non ci sono filtri attivi
    if (activeFilters.value.categories.length === 0) {
      selectedCategories.value = response.data.categories || [];
    } else {
      selectedCategories.value = [...activeFilters.value.categories];
    }
  } catch (error) {
    console.error('Errore nel caricamento delle categorie:', error);
    // Fallback con categorie predefinite
    availableCategories.value = [
      { category: 'infrastrutture', count: 0, totalBudget: 0 },
      { category: 'trasporti', count: 0, totalBudget: 0 },
      { category: 'ambiente', count: 0, totalBudget: 0 },
      { category: 'sociale', count: 0, totalBudget: 0 },
      { category: 'cultura', count: 0, totalBudget: 0 },
      { category: 'sicurezza', count: 0, totalBudget: 0 },
      { category: 'istruzione', count: 0, totalBudget: 0 },
      { category: 'sanita', count: 0, totalBudget: 0 },
    ];
    selectedCategories.value = [];
  }
}

// Carica i totali reali per anno dal DB per il grafico Trend
async function fetchTrendData() {
  try {
    // Prima ottieni tutti gli anni disponibili
    const allResponse = await budgetsApi.getAll({ limit: '1000' });
    const years = [...new Set(allResponse.data.budgets.map(b => b.year))]
      .filter(y => y)
      .sort((a, b) => a - b);

    if (years.length === 0) {
      // Fallback con dati storici plausibili se il DB è vuoto
      trendTitle.value = 'Trend Bilancio 2020-2025';
      lineData.value = {
        labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [{
          label: 'Bilancio (M€)',
          data: [110, 115, 122, 128, 133, 138],
          borderColor: colors.orange, backgroundColor: colors.orange + '33', borderWidth: 3,
          tension: 0.4, fill: true, pointRadius: 6, pointHoverRadius: 8,
          pointBackgroundColor: colors.orange, pointBorderColor: '#fff', pointBorderWidth: 3,
          pointHoverBackgroundColor: colors.orange, pointHoverBorderColor: '#fff', pointHoverBorderWidth: 4,
        }],
      };
      return;
    }

    // Ottieni i totali per ogni anno tramite compareYears
    const compareResponse = await budgetsApi.compareYears(years);
    const comparison = compareResponse.data.comparison;

    const labels = comparison.map(c => String(c.year));
    const data = comparison.map(c => parseFloat((c.total.totalBudget / 1000000).toFixed(2)));

    trendTitle.value = `Trend Bilancio ${labels[0]}–${labels[labels.length - 1]}`;

    lineData.value = {
      labels,
      datasets: [{
        label: 'Bilancio Totale (M€)',
        data,
        borderColor: colors.orange,
        backgroundColor: colors.orange + '33',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: colors.orange,
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointHoverBackgroundColor: colors.orange,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 4,
      }],
    };
  } catch (e) {
    console.warn('fetchTrendData fallback:', e);
    // Se l'API fallisce, mantieni il lineData già impostato da loadDefaultData o fetchBudgetData
  }
}

function formatCategoryName(category) {
  const names = {
    infrastrutture: 'Infrastrutture',
    trasporti: 'Trasporti e Mobilità',
    ambiente: 'Ambiente e Verde',
    sociale: 'Servizi Sociali',
    cultura: 'Cultura e Turismo',
    sicurezza: 'Sicurezza Pubblica',
    istruzione: 'Istruzione',
    sanita: 'Sanità',
    altro: 'Altri Servizi'
  };
  return names[category] || category;
}

function generateComparisonCharts() {
  if (!comparisonData.value) return;
  
  // Grafico a barre per confronto totali
  const years = comparisonData.value.comparison.map(item => item.year);
  const totalBudgets = comparisonData.value.comparison.map(item => item.total.totalBudget / 1000000);
  const allocatedBudgets = comparisonData.value.comparison.map(item => item.total.allocatedBudget / 1000000);
  
  comparisonBarData.value = {
    labels: years,
    datasets: [
      {
        label: 'Budget Totale (M€)',
        data: totalBudgets,
        backgroundColor: colors.orange,
        borderColor: colors.orange,
        borderWidth: 2
      },
      {
        label: 'Budget Allocato (M€)',
        data: allocatedBudgets,
        backgroundColor: colors.darkBlue,
        borderColor: colors.darkBlue,
        borderWidth: 2
      }
    ]
  };
  
  // Grafico a linee per trend per categoria
  const allCategories = [...new Set(
    comparisonData.value.comparison.flatMap(item => 
      item.byCategory.map(cat => cat._id)
    )
  )];
  
  const datasets = allCategories.map((cat, index) => ({
    label: formatCategoryName(cat),
    data: years.map(year => {
      const yearData = comparisonData.value.comparison.find(item => item.year === year);
      const catData = yearData?.byCategory.find(c => c._id === cat);
      return catData ? catData.totalBudget / 1000000 : 0;
    }),
    borderColor: colorPalette[index % colorPalette.length],
    backgroundColor: colorPalette[index % colorPalette.length] + '33',
    fill: false,
    tension: 0.4
  }));
  
  comparisonLineData.value = {
    labels: years,
    datasets: datasets
  };
}

// Crea alcuni dati di test se il database è vuoto
async function createTestData() {
  try {
    const currentYear = new Date().getFullYear();
    const categories = ['infrastrutture', 'trasporti', 'ambiente', 'sociale', 'cultura', 'sicurezza'];
    const testProjects = [
      'Manutenzione stradale', 'Trasporto pubblico', 'Parco cittadino',
      'Centro anziani', 'Biblioteca comunale', 'Videosorveglianza'
    ];
    
    // Crea dati per ultimi 3 anni
    for (let i = 1; i <= 3; i++) {
      const year = currentYear - i;
      
      for (let j = 0; j < 6; j++) {
        const testBudget = {
          title: `${testProjects[j]} ${year}`,
          description: `Progetto per il miglioramento dei servizi cittadini anno ${year}`,
          totalAmount: Math.floor(Math.random() * 500000) + 50000,
          allocatedAmount: Math.floor(Math.random() * 200000),
          category: categories[j],
          year: year,
          status: 'approvato',
          department: 'Ufficio Tecnico',
          startDate: new Date(year, 0, 1),
          endDate: new Date(year, 11, 31)
        };
        
        // Non aspettare la creazione per velocizzare il processo
        budgetsApi.create(testBudget).catch(console.error);
      }
    }
    
    console.log(`Creati dati di test per anni ${currentYear-3} - ${currentYear-1}`);
  } catch (error) {
    console.log('Nota: Non è possibile creare dati di test, si userà solo dati di default');
  }
}

// Chart options
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

// Opzioni grafici confronto
const comparisonBarOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      display: true,
      position: 'top',
      labels: {
        color: colors.darkBlue,
        font: { weight: '600' }
      }
    },
    tooltip: {
      backgroundColor: "rgba(26, 35, 50, 0.95)",
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 12,
      borderColor: colors.orange,
      borderWidth: 2,
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: €${ctx.parsed.y}M`,
      },
    },
  },
  scales: {
    x: { 
      grid: { display: false },
      ticks: {
        font: { weight: "600" },
        color: colors.darkBlue
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
        color: colors.darkBlue
      },
    },
  },
});

const comparisonLineOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      display: true,
      position: 'top',
      labels: {
        color: colors.darkBlue,
        font: { weight: '600' }
      }
    },
    tooltip: {
      backgroundColor: "rgba(26, 35, 50, 0.95)",
      titleColor: "#fff",
      bodyColor: "#fff",
      padding: 12,
      borderColor: colors.orange,
      borderWidth: 2,
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: €${ctx.parsed.y}M`,
      },
    },
  },
  scales: {
    x: { 
      grid: { display: false },
      ticks: {
        font: { weight: "600" },
        color: colors.darkBlue
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
        color: colors.darkBlue
      },
    },
  },
  interaction: {
    mode: "index",
    intersect: false,
  },
});
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

.um-filter-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
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

/* Stili per modali */
.um-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.um-modal-content {
  background: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.um-modal-wide .um-modal-content {
  max-width: 900px;
}

.um-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

.um-modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-heading);
}

.um-modal-close {
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: var(--color-text);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.um-modal-close:hover {
  background: var(--color-background-soft);
  color: var(--color-text-heading);
}

.um-modal-body {
  padding: 1.5rem;
}

.um-modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  justify-content: flex-end;
  align-items: center;
}

.um-modal-actions .um-btn {
  min-width: 100px;
  visibility: visible !important;
  display: inline-block !important;
}

/* Stili per selezione anni */
.um-year-selection h4, .um-filter-selection h4, .um-filter-year h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-heading);
}

.um-filter-year {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.um-year-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.um-year-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(243, 109, 11, 0.1);
}

.um-year-checkboxes, .um-filter-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.um-filter-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.um-checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.um-checkbox-label:hover {
  background: var(--color-background-soft);
}

.um-checkbox-label input[type="checkbox"] {
  margin: 0;
  margin-top: 2px;
  accent-color: var(--color-primary, #F36D0B);
  cursor: pointer;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.um-checkbox-label input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.um-checkbox-label:has(input:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

.um-category-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.um-category-info strong {
  color: var(--color-text-heading);
  font-weight: 600;
}

.um-category-info small {
  color: var(--color-text);
  opacity: 0.7;
  font-size: 0.8rem;
}

.um-helper-text {
  font-size: 0.85rem;
  color: var(--color-text);
  opacity: 0.7;
  margin: 0;
}

/* Stili per bottoni */
.um-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  display: inline-block;
  text-align: center;
  position: relative;
  overflow: visible;
  opacity: 1;
}

.um-btn-small {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

.um-btn-primary {
  background: var(--color-primary, #F36D0B);
  color: white;
  z-index: 1;
}

.um-btn-primary:not(:disabled) {
  background: var(--color-primary, #F36D0B);
  color: white;
}

.um-btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark, #d35a08);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(243, 109, 11, 0.3);
}

.um-btn-primary:disabled {
  background: #ccc !important;
  color: #666 !important;
  cursor: not-allowed;
  transform: none;
  opacity: 0.6;
}

.um-btn-secondary {
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.um-btn-secondary:hover {
  background: var(--color-border);
}

.um-btn-tertiary {
  background: none;
  color: var(--color-primary, #F36D0B);
  border: 1px solid var(--color-primary, #F36D0B);
}

.um-btn-tertiary:hover {
  background: var(--color-primary, #F36D0B);
  color: white;
}

/* Stili per risultati confronto */
.um-comparison-results {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.um-comparison-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.um-chart-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-heading);
}

.um-chart-wrap {
  height: 300px;
  position: relative;
}

.um-comparison-table h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-heading);
}

.um-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.um-table th,
.um-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.um-table th {
  background: var(--color-background-soft);
  font-weight: 600;
  color: var(--color-text-heading);
  font-size: 0.9rem;
}

.um-table td {
  color: var(--color-text);
}

.um-table tbody tr:hover {
  background: var(--color-background-soft);
}

.um-table tbody tr:last-child td {
  border-bottom: none;
}

.um-loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text);
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .um-modal {
    padding: 0.5rem;
  }
  
  .um-modal-content {
    max-height: 95vh;
  }
  
  .um-modal-header,
  .um-modal-body {
    padding: 1rem;
  }
  
  .um-comparison-charts {
    grid-template-columns: 1fr;
  }
  
  .um-modal-actions {
    flex-direction: column-reverse;
  }
  
  .um-btn {
    width: 100%;
  }
}
</style>
