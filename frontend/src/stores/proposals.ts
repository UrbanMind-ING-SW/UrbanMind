import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Proposal {
  id: number
  titolo: string
  descrizione: string
  categoria: string
  stato: 'in-valutazione' | 'approvata' | 'respinta'
  data: string
  voti: number
  zona?: string
}

export const useProposalsStore = defineStore('proposals', () => {
  const proposals = ref<Proposal[]>([
    {
      id: 1,
      titolo: 'Pista ciclabile lungo il fiume',
      descrizione: 'Creare una pista ciclabile sicura e ben illuminata lungo il corso del fiume.',
      categoria: 'Mobilità',
      stato: 'in-valutazione',
      data: '2025-11-20',
      voti: 42,
      zona: 'Centro',
    },
    {
      id: 2,
      titolo: 'Parco pubblico con orto urbano',
      descrizione: 'Trasformare l\'area abbandonata in un parco con orti urbani accessibili.',
      categoria: 'Ambiente',
      stato: 'in-valutazione',
      data: '2025-11-15',
      voti: 67,
      zona: 'Periferia Nord',
    },
    {
      id: 3,
      titolo: 'Illuminazione stradale intelligente',
      descrizione: 'Installare sistemi di illuminazione a LED intelligente in tutte le vie del comune.',
      categoria: 'Tecnologia',
      stato: 'approvata',
      data: '2025-11-10',
      voti: 123,
    },
    {
      id: 4,
      titolo: 'Centro sportivo comunitario',
      descrizione: 'Costruire una struttura sportiva con campi multisport e palestra.',
      categoria: 'Sport',
      stato: 'respinta',
      data: '2025-11-05',
      voti: 89,
    },
    {
      id: 5,
      titolo: 'Mercatino dell\'artigianato mensile',
      descrizione: 'Organizzare un mercato mensile con artigiani locali e piccoli produttori.',
      categoria: 'Cultura',
      stato: 'approvata',
      data: '2025-12-05',
      voti: 56,
    },
    {
      id: 6,
      titolo: 'Biblioteca: orari estesi',
      descrizione: 'Estendere l\'apertura serale e introdurre postazioni studio prenotabili.',
      categoria: 'Cultura',
      stato: 'approvata',
      data: '2025-12-01',
      voti: 178,
    },
  ])

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

  function addProposal(proposal: Omit<Proposal, 'id' | 'voti'>) {
    const newProposal: Proposal = {
      id: Math.max(...proposals.value.map((p) => p.id), 0) + 1,
      voti: 0,
      ...proposal,
    }
    proposals.value.push(newProposal)
    return newProposal
  }

  function getProposalById(id: number) {
    return proposals.value.find((p) => p.id === id)
  }

  function voteProposal(id: number) {
    const proposal = getProposalById(id)
    if (proposal) {
      proposal.voti++
    }
  }

  function deleteProposal(id: number) {
    const index = proposals.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      proposals.value.splice(index, 1)
    }
  }

  return {
    proposals,
    filteredProposals,
    sortedProposals,
    searchQuery,
    sortBy,
    setSearchQuery,
    setSortBy,
    addProposal,
    getProposalById,
    voteProposal,
    deleteProposal,
  }
})
