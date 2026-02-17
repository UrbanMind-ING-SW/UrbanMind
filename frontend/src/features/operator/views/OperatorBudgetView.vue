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
            >
              <svg class="um-upload-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <p class="um-upload-text">Trascina qui il file CSV o Excel</p>
            </div>

            <!-- File Input -->
            <input 
              ref="fileInput"
              type="file"
              accept=".csv,.xlsx,.xls"
              @change="handleFileSelect"
              class="um-file-input"
            />
          </div>

          <!-- Action Buttons -->
          <div class="um-button-container">
            <button class="um-button um-button-primary" @click="proceedToNextStep">
              Prosegui
              <svg class="um-button-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6-1.41-1.41z"/>
              </svg>
            </button>
          </div>

          <!-- Progress Indicator -->
          <div class="um-progress-indicator">
            <div class="um-progress-bar"></div>
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

const router = useRouter()
const activePage = ref('Bilanci')
const fileInput = ref<HTMLInputElement | null>(null)

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

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  
  if (files && files.length > 0) {
    const file = files[0]
    console.log('File selected:', file.name)
    // Handle file upload logic here
  }
}

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    console.log('File dropped:', file.name)
    // Handle file upload logic here
  }
}

const proceedToNextStep = () => {
  console.log('Proceeding to next step...')
  // Navigate to next step or validate file
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

.um-button-primary:hover {
  background-color: var(--color-orange-400);
  transform: translateX(2px);
}

.um-button-primary:active {
  transform: translateX(0);
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
