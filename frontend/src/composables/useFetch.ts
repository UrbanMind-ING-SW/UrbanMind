import { ref, readonly } from 'vue'

interface UseFetchOptions<T> {
  onData?: (data: T) => void
  onError?: (error: Error) => void
  immediate?: boolean
  retries?: number
  retryDelay?: number
}

interface FetchOptionsBase {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
}

export const useFetch = <T = any>(
  url: string,
  options?: FetchOptionsBase,
  config?: UseFetchOptions<T>
) => {
  const {
    onData,
    onError,
    immediate = false,
    retries = 3,
    retryDelay = 1000,
  } = config ?? {}

  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)
  let status = ref<number | null>(null)

  async function execute() {
    isLoading.value = true
    error.value = null
    let lastError: Error | null = null
    let retryCount = 0

    while (retryCount <= retries) {
      try {
        const response = await fetch(url, {
          method: options?.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          ...(options?.body && { body: JSON.stringify(options.body) }),
        })

        status.value = response.status

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const responseData = await response.json()
        data.value = responseData
        onData?.(responseData)
        isLoading.value = false
        return responseData
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))

        if (retryCount < retries) {
          retryCount++
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          continue
        }
        break
      }
    }

    error.value = lastError
    if (lastError) {
      onError?.(lastError)
    }
    isLoading.value = false
    throw lastError || new Error('Unknown fetch error')
  }

  if (immediate) {
    execute()
  }

  return {
    data: readonly(data),
    error: readonly(error),
    isLoading: readonly(isLoading),
    status: readonly(status),
    execute,
    refetch: execute,
    abort: () => {
      isLoading.value = false
    },
  }
}
