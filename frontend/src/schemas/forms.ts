import { z } from 'zod'

/**
 * Schema di validazione per la form "Nuova Proposta"
 */
export const newProposalSchema = z.object({
  titolo: z
    .string()
    .min(6, 'Il titolo deve avere almeno 6 caratteri')
    .max(80, 'Il titolo non può superare 80 caratteri'),

  categoria: z
    .string()
    .min(1, 'Scegli una categoria'),

  descrizione: z
    .string()
    .min(20, 'La descrizione deve avere almeno 20 caratteri')
    .max(600, 'La descrizione non può superare 600 caratteri'),

  zona: z
    .string()
    .max(60, 'La zona non può superare 60 caratteri')
    .optional(),

  budget: z
    .number()
    .positive('Il budget deve essere positivo')
    .optional()
    .or(z.null()),
})

export type NewProposalFormData = z.infer<typeof newProposalSchema>

/**
 * Schema di validazione per la form "Nuova Segnalazione"
 */
export const newReportSchema = z.object({
  titolo: z
    .string()
    .min(6, 'Il titolo deve avere almeno 6 caratteri')
    .max(80, 'Il titolo non può superare 80 caratteri'),

  categoria: z
    .string()
    .min(1, 'Scegli una categoria'),

  descrizione: z
    .string()
    .min(20, 'La descrizione deve avere almeno 20 caratteri')
    .max(800, 'La descrizione non può superare 800 caratteri'),

  zona: z
    .string()
    .min(3, 'Specifica la zona (almeno 3 caratteri)')
    .max(300, 'La zona non può superare 300 caratteri'),

  priorita: z
    .enum(['bassa', 'media', 'alta'])
    .default('media'),

  foto: z
    .instanceof(File)
    .optional()
    .or(z.null()),
})

export type NewReportFormData = z.infer<typeof newReportSchema>

/**
 * Schema di validazione per il login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Inserisci un email valido'),

  password: z
    .string()
    .min(6, 'La password deve avere almeno 6 caratteri'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Schema di validazione per la registrazione
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Il nome deve avere almeno 2 caratteri')
    .max(50, 'Il nome non può superare 50 caratteri'),

  email: z
    .string()
    .email('Inserisci un email valido'),

  password: z
    .string()
    .min(6, 'La password deve avere almeno 6 caratteri')
    .regex(/[A-Z]/, 'La password deve contenere almeno una maiuscola')
    .regex(/[0-9]/, 'La password deve contenere almeno un numero'),

  confirmPassword: z
    .string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Le password non corrispondono',
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>
