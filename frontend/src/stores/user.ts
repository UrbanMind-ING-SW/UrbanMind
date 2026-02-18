import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api'

export interface User {
  id: string
  name: string
  email: string
  role: 'citizen' | 'operator' | 'admin'
  city?: string
  age?: number
  isActive?: boolean
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref('')

  // Getters
  const userName = computed(() => user.value?.name ?? 'Ospite')
  const userEmail = computed(() => user.value?.email ?? '')
  const userRole = computed(() => user.value?.role ?? 'citizen')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isOperator = computed(() => user.value?.role === 'operator')

  // Actions
  function setUser(newUser: User) {
    user.value = newUser
    isAuthenticated.value = true
    error.value = ''
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
    error.value = ''
  }

  function setError(err: string) {
    error.value = err
  }

  function clearError() {
    error.value = ''
  }

  // Login reale con API backend
  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = ''
    try {
      const response = await authApi.login(email, password)
      const { user: userData, token } = response.data

      localStorage.setItem('token', token)

      setUser({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        city: userData.city,
        age: userData.age,
        isActive: userData.isActive,
      })
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login fallito'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Registrazione reale con API backend
  async function register(name: string, email: string, password: string, role: string = 'citizen', city?: string) {
    isLoading.value = true
    error.value = ''
    try {
      const response = await authApi.register({ name, email, password, role, city })
      const { user: userData, token } = response.data

      localStorage.setItem('token', token)

      setUser({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        city: userData.city,
        age: userData.age,
        isActive: userData.isActive,
      })
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registrazione fallita'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Ripristina utente dal token salvato
  async function initializeFromToken() {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      // Decodifica il token per ottenere le info utente di base
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userId = payload.userId
      
      // Verifica che il token non sia scaduto
      if (payload.exp && payload.exp < Date.now() / 1000) {
        logout()
        return
      }

      // Questo è un approccio semplificato - idealmente dovresti fare una chiamata API per verificare il token
      setUser({
        id: userId,
        name: payload.name || 'Utente',
        email: payload.email || '',
        role: payload.role || 'citizen',
      })
    } catch (err) {
      console.error('Errore nel ripristino token:', err)
      logout()
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    // Getters
    userName,
    userEmail,
    userRole,
    isAdmin,
    isOperator,
    // Actions
    setUser,
    logout,
    setError,
    clearError,
    login,
    register,
    initializeFromToken,
  }
})
