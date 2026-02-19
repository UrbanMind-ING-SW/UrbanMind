const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    })
  } catch (err) {
    throw new Error('Impossibile connettersi al server. Assicurati che il backend sia avviato.')
  }

  let data: any
  try {
    data = await response.json()
  } catch {
    throw new Error(`Il server ha risposto con status ${response.status} ma senza dati JSON validi.`)
  }

  if (!response.ok) {
    throw new Error(data.message || 'Errore nella richiesta')
  }

  return data
}

// ==================== AUTH ====================
export const authApi = {
  login(email: string, password: string) {
    return request<{ success: boolean; data: { user: any; token: string } }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  register(data: { name: string; email: string; password: string; role?: string; city?: string; age?: number }) {
    return request<{ success: boolean; data: { user: any; token: string } }>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// ==================== USERS ====================
export const usersApi = {
  getAll() {
    return request<{ success: boolean; data: any[] }>('/users')
  },

  getById(id: string) {
    return request<{ success: boolean; data: any }>(`/users/${id}`)
  },

  update(id: string, data: Record<string, any>) {
    return request<{ success: boolean; data: any }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return request<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
    })
  },
}

// ==================== REPORTS ====================
export const reportsApi = {
  getAll(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<{ success: boolean; data: { reports: any[]; pagination: any } }>(`/reports${query}`)
  },

  getById(id: string) {
    return request<{ success: boolean; data: any }>(`/reports/${id}`)
  },

  create(data: Record<string, any>) {
    return request<{ success: boolean; data: any }>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: Record<string, any>) {
    return request<{ success: boolean; data: any }>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return request<{ success: boolean }>(`/reports/${id}`, {
      method: 'DELETE',
    })
  },

  vote(id: string, type: 'upvote' | 'downvote', userId: string) {
    return request<{ success: boolean; data: any }>(`/reports/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type, userId }),
    })
  },

  addComment(id: string, text: string, userId: string) {
    return request<{ success: boolean; data: any }>(`/reports/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text, user: userId }),
    })
  },
}

// ==================== PROPOSALS ====================
export const proposalsApi = {
  getAll(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<{ success: boolean; data: { proposals: any[]; pagination: any } }>(`/proposals${query}`)
  },

  getById(id: string) {
    return request<{ success: boolean; data: any }>(`/proposals/${id}`)
  },

  create(data: Record<string, any>) {
    return request<{ success: boolean; data: any }>('/proposals', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: Record<string, any>) {
    return request<{ success: boolean; data: any }>(`/proposals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return request<{ success: boolean }>(`/proposals/${id}`, {
      method: 'DELETE',
    })
  },

  submit(id: string) {
    return request<{ success: boolean; data: any }>(`/proposals/${id}/submit`, {
      method: 'POST',
    })
  },

  vote(id: string, type: 'support' | 'against', userId: string) {
    return request<{ success: boolean; data: any }>(`/proposals/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type, userId }),
    })
  },

  addComment(id: string, text: string, userId: string, type?: string) {
    return request<{ success: boolean; data: any }>(`/proposals/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text, user: userId, type: type || 'pubblico' }),
    })
  },
}

// ==================== BUDGETS ====================
export const budgetsApi = {
  getAll(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<{ success: boolean; data: { budgets: any[]; pagination: any } }>(`/budgets${query}`)
  },

  getById(id: string) {
    return request<{ success: boolean; data: any }>(`/budgets/${id}`)
  },

  create(data: Record<string, any>) {
    return request<{ success: boolean; data: any }>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: Record<string, any>) {
    return request<{ success: boolean; data: any }>(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return request<{ success: boolean }>(`/budgets/${id}`, {
      method: 'DELETE',
    })
  },

  getStats(year: number) {
    return request<{ success: boolean; data: any }>(`/budgets/stats/${year}`)
  },

  compareYears(years: number[]) {
    const yearsQuery = years.join(',')
    return request<{ success: boolean; data: any }>(`/budgets/compare/years?years=${yearsQuery}`)
  },

  getCategories() {
    return request<{ success: boolean; data: any }>('/budgets/categories/list')
  },

  downloadReport(format: 'json' | 'csv', year?: number, category?: string) {
    const params = new URLSearchParams()
    if (year) params.append('year', year.toString())
    if (category) params.append('category', category)
    const query = params.toString() ? '?' + params.toString() : ''
    
    if (format === 'csv') {
      // Per CSV, restituiamo direttamente la risposta per il download con token
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      return fetch(`/api/budgets/report/${format}${query}`, { headers })
    }
    
    return request<{ success: boolean; data: any }>(`/budgets/report/${format}${query}`)
  },
}
