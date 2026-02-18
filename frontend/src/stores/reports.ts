import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { reportsApi } from '@/services/api'
import { useUserStore } from './user'

export interface Report {
  id: string
  titolo: string
  descrizione: string
  categoria: string
  zona: string
  priorita: 'bassa' | 'media' | 'alta'
  data: string
  foto?: File | null
  stato: 'nuovo' | 'in-elaborazione' | 'risolto' | 'respinto'
  reporter?: { name: string; email: string }
}

export const useReportsStore = defineStore('reports', () => {
  const reports = ref<Report[]>([])
  const isLoading = ref(false)
  const error = ref('')

  const newReports = computed(() => reports.value.filter((r) => r.stato === 'nuovo'))
  const inProgressReports = computed(() => reports.value.filter((r) => r.stato === 'in-elaborazione'))
  const resolvedReports = computed(() => reports.value.filter((r) => r.stato === 'risolto'))

  // Carica tutte le segnalazioni dal database
  async function fetchReports(params?: Record<string, string>) {
    isLoading.value = true
    error.value = ''
    try {
      const response = await reportsApi.getAll(params)
      reports.value = response.data.reports.map(mapReport)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Errore nel caricamento segnalazioni'
    } finally {
      isLoading.value = false
    }
  }

  // Crea una nuova segnalazione
  async function addReport(report: {
    titolo: string
    descrizione: string
    categoria: string
    zona: string
    priorita: 'bassa' | 'media' | 'alta'
    foto?: File | null
  }) {
    isLoading.value = true
    error.value = ''
    try {
      const userStore = useUserStore()
      const userId = userStore.user?.id
      if (!userId) throw new Error('Devi essere autenticato per inviare una segnalazione')

      const categoryMap: Record<string, string> = {
        'Buche': 'strade',
        'Rifiuti': 'rifiuti',
        'Illuminazione': 'illuminazione',
        'Traffico': 'trasporti',
        'Sicurezza': 'sicurezza',
        'Altro': 'altro',
      }

      const priorityMap: Record<string, string> = {
        'bassa': 'bassa',
        'media': 'media',
        'alta': 'alta',
      }

      const payload = {
        title: report.titolo,
        description: report.descrizione,
        category: categoryMap[report.categoria] || 'altro',
        priority: priorityMap[report.priorita] || 'media',
        location: {
          city: 'Trento',
          address: report.zona,
          coordinates: { lat: 46.0667, lng: 11.1167 },
        },
        reporter: userId,
        status: 'aperto', // Cambiato da 'nuova' a 'aperto'
      }

      console.log('📤 Invio report al backend:', payload)
      console.log('🔑 User ID:', userId)

      const response = await reportsApi.create(payload)
      
      console.log('✅ Report creato con successo:', response.data)

      reports.value.push(mapReport(response.data))
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Errore nella creazione della segnalazione'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function getReportById(id: string) {
    return reports.value.find((r) => r.id === id)
  }

  // Aggiorna lo stato di una segnalazione
  async function updateReportStatus(id: string, status: string) {
    try {
      // Mappa status frontend → backend
      const statusMap: Record<string, string> = {
        'nuovo': 'aperto',
        'in-elaborazione': 'in-lavorazione', 
        'risolto': 'risolto',
        'respinto': 'chiuso',
      }
      
      const backendStatus = statusMap[status] || status
      await reportsApi.update(id, { status: backendStatus })
      
      const report = reports.value.find((r) => r.id === id)
      if (report) {
        report.stato = status as Report['stato']
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Errore nell\'aggiornamento'
      throw err
    }
  }

  async function deleteReport(id: string) {
    try {
      await reportsApi.delete(id)
      const index = reports.value.findIndex((r) => r.id === id)
      if (index !== -1) reports.value.splice(index, 1)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Errore nell\'eliminazione'
    }
  }

  function getReportsByStatus(status: Report['stato']) {
    return reports.value.filter((r) => r.stato === status)
  }

  function mapReport(r: any): Report {
    const statusMap: Record<string, string> = {
      'aperto': 'nuovo',
      'in-lavorazione': 'in-elaborazione',
      'risolto': 'risolto',
      'chiuso': 'respinto',
    }

    const categoryMap: Record<string, string> = {
      'strade': 'Buche',
      'rifiuti': 'Rifiuti',
      'illuminazione': 'Illuminazione',
      'trasporti': 'Traffico',
      'sicurezza': 'Sicurezza',
      'verde-pubblico': 'Verde Pubblico',
      'altro': 'Altro',
    }

    return {
      id: r._id || r.id,
      titolo: r.title || r.titolo || '',
      descrizione: r.description || r.descrizione || '',
      categoria: categoryMap[r.category] || r.categoria || r.category || '',
      zona: r.location?.address || r.zona || '',
      priorita: (r.priority || r.priorita || 'media') as Report['priorita'],
      data: r.createdAt ? r.createdAt.split('T')[0] : r.data || new Date().toISOString().split('T')[0],
      stato: (statusMap[r.status] || r.stato || 'nuovo') as Report['stato'],
      reporter: r.reporter ? { name: r.reporter.name || '', email: r.reporter.email || '' } : undefined,
    }
  }

  return {
    reports,
    isLoading,
    error,
    newReports,
    inProgressReports,
    resolvedReports,
    fetchReports,
    addReport,
    getReportById,
    updateReportStatus,
    deleteReport,
    getReportsByStatus,
  }
})
