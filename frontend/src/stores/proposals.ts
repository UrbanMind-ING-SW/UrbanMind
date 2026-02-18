import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { proposalsApi } from '@/services/api'
import { useUserStore } from './user'

export interface Proposal {
  id: string
  titolo: string
  descrizione: string
  categoria: string
  stato: 'in-valutazione' | 'approvata' | 'respinta' | 'sottoposta' | 'bozza'
  data: string
  voti: number
  zona?: string
  costoStimato?: number
  proponente?: { name: string; email: string }
}

export const useProposalsStore = defineStore('proposals', () => {
  const proposals = ref<Proposal[]>([])
  const isLoading = ref(false)
  const error = ref('')

  const searchQuery = ref('')
  const sortBy = ref<'recenti' | 'voti' | 'stato'>('recenti')

  const filteredProposals = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return proposals.value

    return proposals.value.filter((p) => {
      const text = `${p.titolo} ${p.descrizione} ${p.categoria}`.toLowerCase()
      return text.includes(q)
    })
  })

  // Solo proposte approvate (visibili ai cittadini)
  const approvedProposals = computed(() => {
    return proposals.value.filter((p) => p.stato === 'approvata')
  })

  const sortedProposals = computed(() => {
    const sorted = [...filteredProposals.value]

    switch (sortBy.value) {
      case 'voti':
        return sorted.sort((a, b) => b.voti - a.voti)
      case 'stato':
        return sorted.sort((a, b) => a.stato.localeCompare(b.stato))
      case 'recenti':
      default:
        return sorted.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    }
  })

  function setSearchQuery(q: string) {
    searchQuery.value = q
  }

  function setSortBy(s: 'recenti' | 'voti' | 'stato') {
    sortBy.value = s
  }

  // Carica tutte le proposte dal database
  async function fetchProposals(params?: Record<string, string>) {
    isLoading.value = true
    error.value = ''
    try {
      const response = await proposalsApi.getAll(params)
      proposals.value = response.data.proposals.map(mapProposal)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Errore nel caricamento proposte'
    } finally {
      isLoading.value = false
    }
  }

  // Crea una nuova proposta e la salva nel database
  async function addProposal(proposal: {
    titolo: string
    descrizione: string
    categoria: string
    zona?: string
    budget?: number | null
  }) {
    isLoading.value = true
    error.value = ''
    try {
      const userStore = useUserStore()
      const userId = userStore.user?.id

      if (!userId) throw new Error('Devi essere autenticato per creare una proposta')

      const categoryMap: Record<string, string> = {
        'Mobilità': 'trasporti',
        'Ambiente': 'ambiente',
        'Sicurezza': 'sicurezza',
        'Tecnologia': 'tecnologia',
        'Sport': 'sociale',
        'Cultura': 'cultura',
        'Altro': 'altro',
      }

      const response = await proposalsApi.create({
        title: proposal.titolo,
        description: proposal.descrizione,
        category: categoryMap[proposal.categoria] || 'altro',
        estimatedCost: proposal.budget || 0,
        estimatedDuration: { value: 1, unit: 'mesi' },
        location: {
          city: proposal.zona || 'Non specificata',
          address: proposal.zona || '',
          coordinates: { lat: 46.0667, lng: 11.1167 },
        },
        proposer: userId,
        status: 'sottoposta',
      })

      // Aggiungi alla lista locale
      proposals.value.push(mapProposal(response.data))
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Errore nella creazione della proposta'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Approva una proposta (operatore)
  async function approveProposal(id: string) {
    try {
      await proposalsApi.update(id, { status: 'approvata' })
      const proposal = proposals.value.find((p) => p.id === id)
      if (proposal) proposal.stato = 'approvata'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Errore nell\'approvazione'
      throw err
    }
  }

  // Rifiuta una proposta (operatore)
  async function rejectProposal(id: string) {
    try {
      await proposalsApi.update(id, { status: 'rifiutata' })
      const proposal = proposals.value.find((p) => p.id === id)
      if (proposal) proposal.stato = 'respinta'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Errore nel rifiuto'
      throw err
    }
  }

  // Vota una proposta
  async function voteProposal(id: string) {
    try {
      const userStore = useUserStore()
      const userId = userStore.user?.id
      if (!userId) throw new Error('Devi essere autenticato per votare')

      await proposalsApi.vote(id, 'support', userId)
      const proposal = proposals.value.find((p) => p.id === id)
      if (proposal) proposal.voti++
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Errore nella votazione'
    }
  }

  // Elimina proposta
  async function deleteProposal(id: string) {
    try {
      await proposalsApi.delete(id)
      const index = proposals.value.findIndex((p) => p.id === id)
      if (index !== -1) proposals.value.splice(index, 1)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Errore nell\'eliminazione'
    }
  }

  function getProposalById(id: string) {
    return proposals.value.find((p) => p.id === id)
  }

  // Mappa i dati dal backend al formato del frontend
  function mapProposal(p: any): Proposal {
    const statusMap: Record<string, string> = {
      'bozza': 'bozza',
      'sottoposta': 'in-valutazione',
      'in-valutazione': 'in-valutazione',
      'approvata': 'approvata',
      'rifiutata': 'respinta',
      'in-sviluppo': 'approvata',
      'completata': 'approvata',
    }

    const categoryMap: Record<string, string> = {
      'trasporti': 'Mobilità',
      'ambiente': 'Ambiente',
      'sicurezza': 'Sicurezza',
      'tecnologia': 'Tecnologia',
      'sociale': 'Sport',
      'cultura': 'Cultura',
      'altro': 'Altro',
      'infrastrutture': 'Infrastrutture',
      'istruzione': 'Istruzione',
      'sanita': 'Sanità',
    }

    return {
      id: p._id || p.id,
      titolo: p.title || p.titolo || '',
      descrizione: p.description || p.descrizione || '',
      categoria: categoryMap[p.category] || p.categoria || p.category || '',
      stato: (statusMap[p.status] || p.stato || 'in-valutazione') as Proposal['stato'],
      data: p.createdAt ? p.createdAt.split('T')[0] : p.data || new Date().toISOString().split('T')[0],
      voti: p.votes ? (p.votes.support?.length || 0) : p.voti || 0,
      zona: p.location?.city || p.zona || '',
      costoStimato: p.estimatedCost || 0,
      proponente: p.proposer ? { name: p.proposer.name || '', email: p.proposer.email || '' } : undefined,
    }
  }

  return {
    proposals,
    filteredProposals,
    approvedProposals,
    sortedProposals,
    searchQuery,
    sortBy,
    isLoading,
    error,
    setSearchQuery,
    setSortBy,
    fetchProposals,
    addProposal,
    getProposalById,
    voteProposal,
    deleteProposal,
    approveProposal,
    rejectProposal,
  }
})
