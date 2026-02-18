<template>
  <div class="operator-budget-layout">
    <!-- Header -->
    <MainNavbar />

    <!-- Main Container -->
    <div class="um-main-container">
      <!-- Sidebar -->
      <Sidebar :activePage="activePage" @menu-click="handleMenuClick" />

      <!-- Content Area -->
      <main class="um-content">
        <div class="um-content-wrapper">
          <!-- Page Title -->
          <div class="um-page-header">
            <h2 class="um-page-title">Pubblica Nuovo Bilancio</h2>
            <p class="um-page-subtitle">Seguì i passaggi per importare i dati.</p>
          </div>

          <!-- Steps Indicator -->
          <div class="um-steps-container">
            <div 
              v-for="(step, index) in steps" 
              :key="index"
              :class="['um-step', { 'active': step.active, 'completed': step.completed }]"
            >
              <div class="um-step-number">{{ index + 1 }}</div>
              <div class="um-step-label">{{ step.label }}</div>
            </div>
          </div>

          <!-- Upload Section -->
          <div class="um-upload-section">
            <div 
              class="um-upload-area"
              @drop="handleFileDrop"
              @dragover.prevent
              @dragenter.prevent
              @click="() => fileInput?.click()"
            >
              <svg class="um-upload-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <p class="um-upload-text">
                {{ selectedFile ? selectedFile.name : 'Trascina qui il file CSV o clicca per selezionare' }}
              </p>
              <p v-if="selectedFile" class="um-file-info">
                {{ parsedData.length }} righe trovate
              </p>
            </div>

            <!-- File Input -->
            <input 
              ref="fileInput"
              type="file"
              accept=".csv,.xlsx,.xls"
              @change="handleFileSelect"
              class="um-file-input"
            />
            
            <!-- Error Message -->
            <div v-if="uploadError" class="um-error-message">
              ⚠️ {{ uploadError }}
            </div>
          </div>
          
          <!-- Preview Section -->
          <div v-if="parsedData.length > 0 && steps[1].active" class="um-preview-section">
            <h3 class="um-section-title">Anteprima Dati (Prime 5 righe)</h3>
            <div class="um-table-container">
              <table class="um-preview-table">
                <thead>
                  <tr>
                    <th v-for="(value, key) in parsedData[0]" :key="key">{{ key }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in parsedData.slice(0, 5)" :key="index">
                    <td v-for="(value, key) in row" :key="key">{{ value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="um-preview-info">
              Totale righe da importare: <strong>{{ parsedData.length }}</strong>
            </p>
          </div>
          
          <!-- Upload Progress -->
          <div v-if="isUploading" class="um-upload-progress">
            <p class="um-progress-text">Caricamento in corso... {{ uploadProgress }}%</p>
            <div class="um-progress-bar-container">
              <div class="um-progress-bar-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="um-button-container">
            <button 
              class="um-button um-button-primary" 
              @click="proceedToNextStep"
              :disabled="isUploading || (!selectedFile && !parsedData.length)"
            >
              {{ steps[2].active ? 'Carica nel Database' : 'Prosegui' }}
              <svg class="um-button-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6-1.41-1.41z"/>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MainNavbar from '@/components/MainNavbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import { budgetsApi } from '@/services/api'

const router = useRouter()
const activePage = ref('Bilanci')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref<string | null>(null)
const parsedData = ref<any[]>([])

interface Step {
  label: string
  active: boolean
  completed: boolean
}

const steps = ref<Step[]>([
  { label: 'Upload', active: true, completed: false },
  { label: 'Anteprima', active: false, completed: false },
  { label: 'Conferma', active: false, completed: false },
])

const handleMenuClick = (label: string) => {
  activePage.value = label
  
  // Mapping delle label ai percorsi
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
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  
  if (files && files.length > 0) {
    selectedFile.value = files[0]
    await processFile(files[0])
  }
}

const handleFileDrop = async (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
    await processFile(files[0])
  }
}

const processFile = async (file: File) => {
  uploadError.value = null
  
  if (!file.name.endsWith('.csv')) {
    uploadError.value = 'Solo file CSV sono supportati al momento'
    return
  }
  
  try {
    const text = await file.text()
    const rows = text.split('\n').filter(row => row.trim())
    
    if (rows.length < 2) {
      uploadError.value = 'Il file CSV è vuoto o non ha dati'
      return
    }
    
    // Parse CSV
    const headers = rows[0].split(',').map(h => h.trim())
    const data: any[] = []
    
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const obj: any = {}
      
      headers.forEach((header, index) => {
        obj[header] = values[index]
      })
      
      data.push(obj)
    }
    
    parsedData.value = data
    steps.value[0].completed = true
    steps.value[1].active = true
    
    console.log('Parsed CSV data:', data)
    alert(`File caricato con successo! ${data.length} righe trovate.`)
  } catch (error) {
    console.error('Errore nel parsing del CSV:', error)
    uploadError.value = 'Errore nel parsing del file CSV'
  }
}

const proceedToNextStep = async () => {
  if (!parsedData.value || parsedData.value.length === 0) {
    alert('Carica prima un file CSV')
    return
  }
  
  if (steps.value[1].active && !steps.value[1].completed) {
    // Conferma anteprima
    steps.value[1].completed = true
    steps.value[2].active = true
    return
  }
  
  if (steps.value[2].active) {
    // Carica i dati nel database
    await uploadToDatabase()
  }
}

const uploadToDatabase = async () => {
  isUploading.value = true
  uploadProgress.value = 0
  uploadError.value = null
  
  try {
    const userId = localStorage.getItem('userId') || '000000000000000000000001'
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < parsedData.value.length; i++) {
      const row = parsedData.value[i]
      
      try {
        // Mappa i dati CSV al formato budget
        const budgetData = {
          title: row.Titolo || row.title || `Budget ${i + 1}`,
          description: row.Descrizione || row.description || 'Importato da CSV',
          totalAmount: parseFloat(row['Budget Totale'] || row.totalAmount || row.amount || '0'),
          allocatedAmount: parseFloat(row['Budget Allocato'] || row.allocatedAmount || '0'),
          category: (row.Categoria || row.category || 'altro').toLowerCase(),
          year: parseInt(row.Anno || row.year || new Date().getFullYear().toString()),
          status: row.Stato || row.status || 'proposto',
          department: row.Dipartimento || row.department || 'Ufficio Tecnico',
          manager: userId,
          startDate: row['Data Inizio'] || row.startDate || new Date().toISOString(),
          endDate: row['Data Fine'] || row.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
        }
        
        await budgetsApi.create(budgetData)
        successCount++
      } catch (error) {
        console.error(`Errore caricamento riga ${i + 1}:`, error)
        errorCount++
      }
      
      uploadProgress.value = Math.round(((i + 1) / parsedData.value.length) * 100)
    }
    
    alert(`Caricamento completato!\n✅ ${successCount} budget caricati\n❌ ${errorCount} errori`)
    
    if (successCount > 0) {
      // Redirect alla dashboard
      router.push('/operator/dashboard')
    }
  } catch (error) {
    console.error('Errore nel caricamento:', error)
    uploadError.value = 'Errore durante il caricamento dei dati'
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
.operator-budget-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.um-main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.um-content {
  flex: 1;
  overflow-y: auto;
  background-color: var(--color-background-soft);
  padding: var(--spacing-2xl);
}

.um-content-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

/* Page Header */
.um-page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.um-page-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-blue-500);
  margin: 0 0 0.5rem 0;
}

.um-page-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-gray-500);
  margin: 0;
}

/* Steps Container */
.um-steps-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
}

.um-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.um-step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-gray-100);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-500);
  font-size: 1.1rem;
}

.um-step.active .um-step-number {
  background-color: var(--color-orange-600);
  color: var(--color-white);
  border-color: var(--color-orange-600);
}

.um-step.completed .um-step-number {
  background-color: var(--color-blue-500);
  color: var(--color-white);
  border-color: var(--color-blue-500);
}

.um-step-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-gray-500);
}

.um-step.active .um-step-label {
  color: var(--color-orange-600);
}

/* Upload Section */
.um-upload-section {
  background-color: var(--color-white);
  border-radius: var(--radius-sm);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
  box-shadow: var(--shadow-sm);
}

.um-upload-area {
  border: 2px dashed var(--color-orange-600);
  border-radius: var(--radius-xs);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.um-upload-area:hover {
  background-color: rgba(243, 109, 11, 0.05);
  border-color: var(--color-orange-400);
}

.um-upload-icon {
  width: 48px;
  height: 48px;
  color: var(--color-orange-600);
}

.um-upload-text {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-blue-500);
  margin: 0;
}

.um-file-input {
  display: none;
}

.um-error-message {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c00;
  text-align: center;
}

.um-file-info {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

/* Preview Section */
.um-preview-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.um-section-title {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1A2332;
}

.um-table-container {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.um-preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.um-preview-table th,
.um-preview-table td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #e0e0e0;
}

.um-preview-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #1A2332;
  white-space: nowrap;
}

.um-preview-table td {
  color: #666;
}

.um-preview-table tbody tr:hover {
  background-color: #fafafa;
}

.um-preview-info {
  margin: 1rem 0 0 0;
  font-size: 0.95rem;
  color: #666;
}

.um-preview-info strong {
  color: #F36D0B;
  font-weight: 700;
}

/* Upload Progress */
.um-upload-progress {
  margin: 2rem 0;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.um-progress-text {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1A2332;
  text-align: center;
}

.um-progress-bar-container {
  width: 100%;
  height: 12px;
  background-color: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.um-progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #F36D0B, #ff8c42);
  transition: width 0.3s ease;
  border-radius: 6px;
}

/* Button Container */
.um-button-container {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 2rem;
}

.um-button {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: var(--radius-xs);
  font-size: 1rem;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.um-button-primary {
  background-color: var(--color-orange-600);
  color: var(--color-white);
}

.um-button-primary:hover:not(:disabled) {
  background-color: var(--color-orange-400);
  transform: translateX(2px);
}

.um-button-primary:active:not(:disabled) {
  transform: translateX(0);
}

.um-button-primary:disabled {
  background-color: #ccc;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.um-button-icon {
  width: 18px;
  height: 18px;
}

/* Progress Indicator */
.um-progress-indicator {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-2xl);
}

.um-progress-bar {
  width: 100px;
  height: 4px;
  background-color: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}

.um-progress-bar::after {
  content: '';
  display: block;
  height: 100%;
  width: 33%;
  background-color: var(--color-orange-600);
  animation: progress 1.5s ease-in-out;
}

@keyframes progress {
  0% {
    width: 0%;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .um-content {
    padding: 1rem;
  }

  .um-page-title {
    font-size: 1.4rem;
  }

  .um-steps-container {
    gap: 1rem;
  }

  .um-button-container {
    justify-content: center;
  }

  .um-upload-area {
    padding: 2rem 1rem;
  }
}
</style>
