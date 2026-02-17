import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  name: string
  email: string
  role: 'cittadino' | 'admin' | 'moderatore'
  avatar?: string
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
  const userRole = computed(() => user.value?.role ?? 'cittadino')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isModerator = computed(() => user.value?.role === 'moderatore')

  // Actions
  function setUser(newUser: User) {
    user.value = newUser
    isAuthenticated.value = true
    error.value = ''
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
    error.value = ''
  }

  function setError(err: string) {
    error.value = err
  }

  function clearError() {
    error.value = ''
  }

  // Mock login function - replace with actual API call
  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = ''
    try {
      // TODO: API call to authenticate
      // await fetch('/api/auth/login', { ... })
      
      // Mock successful login
      const mockUser: User = {
        id: '1',
        name: 'Nome Utente',
        email: email,
        role: 'cittadino',
      }
      
      setUser(mockUser)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login fallito'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Mock registration function - replace with actual API call
  async function register(name: string, email: string, password: string) {
    isLoading.value = true
    error.value = ''
    try {
      // TODO: API call to register
      // await fetch('/api/auth/register', { ... })
      
      // Mock successful registration and login
      const mockUser: User = {
        id: '1',
        name: name,
        email: email,
        role: 'cittadino',
      }
      
      setUser(mockUser)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registrazione fallita'
      return false
    } finally {
      isLoading.value = false
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
    isModerator,
    // Actions
    setUser,
    logout,
    setError,
    clearError,
    login,
    register,
  }
})
