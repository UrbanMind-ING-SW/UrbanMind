import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Report {
  id: number
  titolo: string
  descrizione: string
  categoria: string
  zona: string
  priorita: 'bassa' | 'media' | 'alta'
  data: string
  foto?: File | null
  stato: 'nuovo' | 'in-elaborazione' | 'risolto'
}

export const useReportsStore = defineStore('reports', () => {
  // State
  const reports = ref<Report[]>([])

  // Actions
  function addReport(report: Omit<Report, 'id' | 'data' | 'stato'>) {
    const newReport: Report = {
      id: Math.max(...reports.value.map((r) => r.id), 0) + 1,
      data: new Date().toISOString().split('T')[0]!,
      stato: 'nuovo',
      ...report,
    }
    reports.value.push(newReport)
    return newReport
  }

  function getReportById(id: number) {
    return reports.value.find((r) => r.id === id)
  }

  function updateReportStatus(id: number, status: Report['stato']) {
    const report = getReportById(id)
    if (report) {
      report.stato = status
    }
  }

  function deleteReport(id: number) {
    const index = reports.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      reports.value.splice(index, 1)
    }
  }

  function getReportsByStatus(status: Report['stato']) {
    return reports.value.filter((r) => r.stato === status)
  }

  return {
    // State
    reports,
    // Actions
    addReport,
    getReportById,
    updateReportStatus,
    deleteReport,
    getReportsByStatus,
  }
})
