import { useProposalsStore } from '@/stores/proposals'

export const useProposalFilters = () => {
  const proposalsStore = useProposalsStore()

  const handleSearchChange = (query: string) => {
    proposalsStore.setSearchQuery(query)
  }

  const handleSortChange = (sort: 'recenti' | 'voti' | 'stato') => {
    proposalsStore.setSortBy(sort)
  }

  const formatDate = (iso: string): string => {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }

  const getLabelStato = (stato: string): string => {
    const labels: Record<string, string> = {
      'in-valutazione': 'In valutazione',
      approvata: 'Approvata',
      respinta: 'Respinta',
    }
    return labels[stato] || stato
  }

  const getStatusClass = (stato: string) => {
    return {
      'um-chip--ok': stato === 'approvata',
      'um-chip--wait': stato === 'in-valutazione',
      'um-chip--no': stato === 'respinta',
    }
  }

  return {
    handleSearchChange,
    handleSortChange,
    formatDate,
    getLabelStato,
    getStatusClass,
    // Expose store state
    searchQuery: () => proposalsStore.searchQuery,
    sortBy: () => proposalsStore.sortBy,
  }
}
