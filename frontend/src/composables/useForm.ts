import type { ZodSchema } from 'zod'
import { ref, computed, reactive } from 'vue'

interface UseFormOptions<T> {
  initialValues: T
  validationSchema?: ZodSchema
  onSubmit: (values: T) => Promise<void> | void
}

export const useForm = <T extends Record<string, any>>(options: UseFormOptions<T>) => {
  const { initialValues, validationSchema, onSubmit } = options

  const form = reactive<T>({ ...initialValues })
  const errors = reactive<Record<keyof T, string>>({} as Record<keyof T, string>)
  const touched = reactive<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)
  const isSubmitting = ref(false)
  const submitError = ref<Error | null>(null)
  const submitSuccess = ref(false)

  const isValid = computed(() => Object.keys(errors).length === 0)
  const isDirty = computed(() => JSON.stringify(form) !== JSON.stringify(initialValues))
  const hasErrors = computed(() => Object.keys(errors).length > 0)

  async function validateField(fieldName: keyof T) {
    if (!validationSchema) return

    try {
      const fieldSchema = (validationSchema as any).pick({ [fieldName]: true })
      await fieldSchema.parseAsync({ [fieldName]: (form as any)[fieldName] })
      delete (errors as any)[fieldName]
    } catch (error: any) {
      if (error.errors?.[0]) {
        (errors as any)[fieldName] = error.errors[0].message
      }
    }
  }

  async function validateForm() {
    if (!validationSchema) return true

    try {
      await validationSchema.parseAsync(form)
      Object.keys(errors).forEach((key) => delete (errors as any)[key])
      return true
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path[0]
          if (path) (errors as any)[path] = err.message
        })
      }
      return false
    }
  }

  function setFieldValue<K extends keyof T>(fieldName: K, value: T[K]) {
    (form as any)[fieldName] = value
    ;(touched as any)[fieldName] = true
  }

  function setFieldError<K extends keyof T>(fieldName: K, error: string) {
    (errors as any)[fieldName] = error
  }

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    const fieldName = target.name as keyof T

    if (target.type === 'file') {
      ;(form as any)[fieldName] = (target as HTMLInputElement).files?.[0] ?? null
    } else if (target.type === 'checkbox') {
      ;(form as any)[fieldName] = (target as HTMLInputElement).checked as any
    } else if (target.type === 'radio') {
      ;(form as any)[fieldName] = target.value as any
    } else {
      ;(form as any)[fieldName] = target.value as any
    }

    ;(touched as any)[fieldName] = true
    validateField(fieldName)
  }

  function handleBlur(e: Event) {
    const target = e.target as HTMLInputElement
    const fieldName = target.name as keyof T
    ;(touched as any)[fieldName] = true
    validateField(fieldName)
  }

  async function handleSubmit(e?: Event) {
    if (e) {
      e.preventDefault()
    }

    ;(touched as any) = Object.keys(form).reduce((acc: any, key) => {
      acc[key] = true
      return acc
    }, {})

    const isFormValid = await validateForm()
    if (!isFormValid) {
      submitError.value = new Error('Form validation failed')
      return
    }

    isSubmitting.value = true
    submitError.value = null
    submitSuccess.value = false

    try {
      await onSubmit({ ...form } as T)
      submitSuccess.value = true
    } catch (err) {
      submitError.value = err instanceof Error ? err : new Error('Unknown error')
    } finally {
      isSubmitting.value = false
    }
  }

  function reset() {
    Object.keys(initialValues).forEach((key) => {
      ;(form as any)[key] = initialValues[key as keyof T]
    })
    Object.keys(errors).forEach((key) => delete (errors as any)[key])
    Object.keys(touched).forEach((key) => delete (touched as any)[key])
  }

  function resetField(fieldName: keyof T) {
    ;(form as any)[fieldName] = initialValues[fieldName]
    delete (errors as any)[fieldName]
    delete (touched as any)[fieldName]
  }

  function resetErrors() {
    Object.keys(errors).forEach((key) => delete (errors as any)[key])
  }

  function setFieldTouched(fieldName: keyof T, isTouched: boolean) {
    ;(touched as any)[fieldName] = isTouched
  }

  return {
    form,
    errors,
    touched,
    isSubmitting,
    submitError,
    submitSuccess,
    isValid,
    isDirty,
    hasErrors,
    validateField,
    validateForm,
    setFieldValue,
    setFieldError,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    resetField,
    resetErrors,
    setFieldTouched,
  }
}
