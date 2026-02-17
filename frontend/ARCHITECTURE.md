# UrbanMind Frontend - Architettura e Documentazione

## 📋 Indice
1. [Panoramica](#panoramica)
2. [Stack Tecnologico](#stack-tecnologico)
3. [Struttura del Progetto](#struttura-del-progetto)
4. [Componenti](#componenti)
5. [Store Pinia](#store-pinia)
6. [Composables](#composables)
7. [Pagine/Views](#pagineviews)
8. [Validazione e Form](#validazione-e-form)
9. [Design System](#design-system)
10. [Routing](#routing)

---

## Panoramica

**UrbanMind** è una piattaforma web per la partecipazione civica che consente ai cittadini di:
- 💡 Proporre idee e miglioramenti al comune
- 📋 Segnalare problemi e disservizi
- 📊 Consultare il bilancio pubblico
- 🗳️ Votare proposte

Il frontend è costruito con **Vue 3**, **TypeScript**, **Pinia** per state management e **Zod** per validazione.

---

## Stack Tecnologico

| Tecnologia | Versione | Utilizzo |
|------------|----------|----------|
| **Vue** | 3.x | Framework UI reattivo |
| **TypeScript** | - | Type safety |
| **Vite** | - | Build tool e dev server |
| **Pinia** | 3.0.4 | State management |
| **Vue Router** | 4.6.3 | Routing client-side |
| **Zod** | - | Schema validation runtime |
| **Chart.js** | - | Visualizzazione dati |
| **vue-chartjs** | 5.3.3 | Wrapper Vue per Chart.js |

---

## Struttura del Progetto

```
src/
├── App.vue                      # Root component
├── main.ts                      # Entry point
├── router/
│   └── index.ts                # Definizione route
├── stores/                      # Pinia stores
│   ├── proposals.ts            # Store proposte
│   ├── reports.ts              # Store segnalazioni
│   └── user.ts                 # Store utente/autenticazione
├── composables/                 # Composables (logica riusabile)
│   ├── useForm.ts              # Form management
│   ├── useFetch.ts             # HTTP wrapper con retry
│   └── useProposalFilters.ts   # Filtering per proposte
├── schemas/                     # Validazione Zod
│   └── forms.ts                # Schemi per form
├── components/
│   └── MainNavbar.vue           # Navbar globale
├── views/                       # Pagine Vue Router
│   ├── CitizenDashboardView.vue
│   ├── BudgetView.vue
│   ├── ProposalsView.vue
│   ├── NewProposalView.vue
│   ├── NewReportView.vue
│   └── (altri)
├── assets/
│   ├── main.css                # Design token system
│   └── (icone SVG)
├── public/                      # Contenuto statico
└── index.html                  # HTML entry point
```

---

## Componenti

### MainNavbar.vue
**Scopo:** Navbar persistente in tutte le pagine

**Props:**
```typescript
interface Props {
  title?: string                 // Default: "UrbanMind"
  userLabel?: string             // Default: "Nome Utente"
}
```

**Funzionalità:**
- Visualizza nome utente da `useUserStore`
- Navigazione tra pagine principali
- Responsive design

**Usa:**
- `useUserStore` per dati utente
- `useRouter` per navigazione

---

## Store Pinia

### 1. **useProposalsStore** (`stores/proposals.ts`)

**Stato:**
```typescript
proposals: Proposal[]           // Array proposte
searchQuery: string             // Termine di ricerca
sortBy: 'recenti' | 'voti' | 'stato'
```

**Getters:**
- `filteredProposals` - Proposte filtrate per query
- `sortedProposals` - Proposte ordinate per sortBy

**Azioni:**
- `setSearchQuery(q: string)` - Aggiorna ricerca
- `setSortBy(s: string)` - Cambia ordinamento
- `addProposal(data)` - Aggiunge novara proposta
- `getProposalById(id)` - Recupera singola proposta
- `voteProposal(id)` - Incrementa voti
- `deleteProposal(id)` - Elimina proposta

**Interfaccia Proposal:**
```typescript
{
  id: number
  titolo: string
  descrizione: string
  categoria: string
  stato: 'in-valutazione' | 'approvata' | 'respinta'
  data: string (ISO)
  voti: number
  zona?: string
}
```

---

### 2. **useReportsStore** (`stores/reports.ts`)

**Stato:**
```typescript
reports: Report[]               // Array segnalazioni
```

**Azioni:**
- `addReport(data)` - Aggiunge segnalazione
- `getReportById(id)` - Recupera segnalazione
- `updateReportStatus(id, status)` - Cambia stato
- `deleteReport(id)` - Elimina segnalazione
- `getReportsByStatus(status)` - Filtra per stato

**Interfaccia Report:**
```typescript
{
  id: number
  titolo: string
  descrizione: string
  categoria: string
  zona: string
  priorita: 'bassa' | 'media' | 'alta'
  data: string (ISO)
  foto?: File | null
  stato: 'nuovo' | 'in-elaborazione' | 'risolto'
}
```

---

### 3. **useUserStore** (`stores/user.ts`)

**Stato:**
```typescript
user: User | null
isAuthenticated: boolean
isLoading: boolean
error: string | null
```

**Getters:**
- `userName` - Nome dell'utente
- `userEmail` - Email dell'utente
- `userRole` - Ruolo (citizen, moderator, admin)
- `isAdmin` - È amministratore?
- `isModerator` - È moderatore?

**Azioni:**
- `setUser(user)` - Imposta utente
- `logout()` - Logout
- `login(email, password)` - Login (mock)
- `register(data)` - Registrazione (mock)
- `setError(error)` - Imposta errore
- `clearError()` - Cancella errore

---

## Composables

### 1. **useForm.ts**

**Descrizione:** Gestione completa dei form con validazione Zod

**Utilizzo:**
```typescript
const { form, errors, touched, isSubmitting, submitError, submitSuccess, isValid,
  handleChange, handleBlur, handleSubmit, reset } = useForm({
  initialValues: {
    titolo: '',
    descrizione: '',
    categoria: '',
  },
  validationSchema: newProposalSchema,
  onSubmit: async (values) => {
    // Logica submit
  },
})
```

**Stato:**
- `form` - Valori form reattivi
- `errors` - Errori di validazione per campo
- `touched` - Campi che l'utente ha toccato
- `isSubmitting` - Indica se in invio
- `submitError` - Errore durante invio
- `submitSuccess` - Successo invio

**Metodi:**
- `handleChange(e)` - Aggiorna campo da evento input
- `handleBlur(e)` - Marca campo come toccato
- `handleSubmit(e)` - Valida e invia form
- `reset()` - Resetta a valori iniziali
- `validateField(name)` - Valida singolo campo
- `validateForm()` - Valida tutto il form
- `setFieldValue(name, value)` - Aggiorna campo
- `setFieldError(name, error)` - Imposta errore
- `setFieldTouched(name, bool)` - Marca come toccato
- `resetField(name)` - Resetta singolo campo
- `resetErrors()` - Cancella errori

---

### 2. **useFetch.ts**

**Descrizione:** HTTP wrapper con retry automatico

**Utilizzo:**
```typescript
const { data, error, isLoading, execute, refetch } = useFetch<ProposalResponse>(
  '/api/proposals',
  { method: 'GET' },
  { immediate: true, retries: 3 }
)
```

**Opzioni:**
- `immediate` - Esegui subito?
- `retries` - Numero tentativi
- `retryDelay` - Delay tra tentativi (ms)
- `onData` - Callback successo
- `onError` - Callback errore

**Stato:**
- `data` - Dati risposta (readonly)
- `error` - Errore (readonly)
- `isLoading` - In caricamento (readonly)
- `status` - Codice HTTP (readonly)

**Metodi:**
- `execute()` - Esegui richiesta
- `refetch()` - Ripeti richiesta
- `abort()` - Annulla richiesta

---

### 3. **useProposalFilters.ts**

**Descrizione:** Helper per filtraggio proposte

**Metodi:**
- `handleSearchChange(q)` - Aggiorna ricerca
- `handleSortChange(s)` - Aggiorna ordinamento
- `formatDate(iso)` - Formatta data (DD/MM/YYYY)
- `getLabelStato(stato)` - Etichetta stato
- `getStatusClass(stato)` - Classe CSS stato

---

## Pagine/Views

### CitizenDashboardView.vue
**Percorso:** `/`
**Descrizione:** Home con 3 card principali (Bilancio, Proposte, Segnalazioni)
**Funzionalità:**
- Navigazione a sezioni principali
- Hover effects con ombre
- Responsive grid layout

---

### ProposalsView.vue
**Percorso:** `/proposte`
**Descrizione:** Lista di proposte con ricerca e filtro

**Funzionalità:**
- Ricerca in tempo reale
- Ordinamento (recenti, votate, stato)
- Grid responsiva (3 col desktop, 2 tablet, 1 mobile)
- Visualizza categorie, stato, data, voti
- Bottone "Nuova Proposta"

**Usa:**
- `useProposalsStore`
- `useRouter`

---

### NewProposalView.vue
**Percorso:** `/proposte/nuova`
**Descrizione:** Form per creare nuova proposta

**Form Fields:**
- `titolo` (required, 6-80 chars)
- `categoria` (select, required)
- `descrizione` (required, 20-600 chars)
- `zona` (optional, <60 chars)
- `budget` (optional, numero positivo)

**Funzionalità:**
- Validazione real-time con Zod
- Errori inline per campo
- Submit button con stato
- Redirect post-successo a `/proposte`

**Usa:**
- `useForm` + `newProposalSchema`
- `useProposalsStore`
- `useRouter`

---

### NewReportView.vue
**Percorso:** `/segnalazioni/nuova`
**Descrizione:** Form per creare segnalazione

**Form Fields:**
- `titolo` (required, 6-80)
- `categoria` (select, required)
- `descrizione` (required, 20-800)
- `zona` (required, 3-90)
- `priorita` (select: bassa/media/alta)
- `foto` (optional, file upload)

**Funzionalità:**
- Stessa logica form di NewProposalView
- Upload file con preview
- Validazione priorita enum
- Categoria: Buche, Rifiuti, Illuminazione, Traffico, Sicurezza, Altro

**Usa:**
- `useForm` + `newReportSchema`
- `useReportsStore`
- `useRouter`

---

### BudgetView.vue
**Percorso:** `/bilancio`
**Descrizione:** Visualizzazione dati bilancio pubblico

**Usa:**
- Chart.js via vue-chartjs

---

## Validazione e Form

### Schema Validazione (`schemas/forms.ts`)

**newProposalSchema:**
```typescript
{
  titolo: string (6-80 chars)
  categoria: string (required)
  descrizione: string (20-600 chars)
  zona: string (optional, <60 chars)
  budget: number (optional, > 0)
}
```

**newReportSchema:**
```typescript
{
  titolo: string (6-80)
  categoria: string (required)
  descrizione: string (20-800)
  zona: string (3-90)
  priorita: 'bassa' | 'media' | 'alta'
  foto: File (optional)
}
```

**loginSchema:**
```typescript
{
  email: string (valid email)
  password: string (6+ chars)
}
```

**registerSchema:**
```typescript
{
  name: string (2-50)
  email: string (valid)
  password: string (6+, uppercase, number)
  confirmPassword: string (matching)
}
```

---

## Design System

### Token CSS (`assets/main.css`)

**7 Categorie:**

1. **COLOR PALETTE**
   - Base colors: --color-white, --color-accent, --color-orange-400, --color-blue-500, --color-gray-*

2. **SEMANTIC COLORS**
   - --color-background, --color-background-soft
   - --color-text, --color-text-heading, --color-text-secondary, --color-text-white
   - --color-border, --color-border-hover, --color-border-focus

3. **SPACING**
   - 2xs (2px) → 5xl (64px)
   - Esempio: --spacing-lg (16px)

4. **BORDER RADIUS**
   - xs (6px) → full (9999px)
   - Esempio: --border-radius-lg (14px)

5. **SHADOWS**
   - sm, md, lg individuati con opacity
   - Esempio: --shadow-md

6. **TRANSITIONS**
   - fast (0.12s), base (0.2s), slow (0.5s)

7. **TYPOGRAPHY**
   - Font sizes da 0.75rem a 2.5rem
   - Font weights: 400, 600, 700, 800
   - Font family: Inter (primary)

**Utility Classes:**
- `.text-primary`, `.text-secondary`
- `.bg-primary`, `.bg-soft`
- `.shadow-md`, `.rounded-lg`
- Etc.

---

## Routing

**Route Configuration** (`router/index.ts`):

| Percorso | Nome | Componente |
|----------|------|-----------|
| `/` | home | CitizenDashboardView |
| `/bilancio` | budget | BudgetView |
| `/proposte` | proposals | ProposalsView |
| `/proposte/nuova` | proposal-new | NewProposalView |
| `/segnalazioni/nuova` | new-report | NewReportView |

---

## Flusso Dati Tipo

### Creazione Proposta
```
NewProposalView (form input)
    ↓
useForm (validazione Zod)
    ↓
zod schema (newProposalSchema)
    ↓
[Valido] → proposalsStore.addProposal()
    ↓
Store aggiorna state
    ↓
ProposalsView sottosoritti (computed sortedProposals)
    ↓
UI aggiorna
```

### Ricerca Proposte
```
ProposalsView (input ricerca)
    ↓
proposalsStore.setSearchQuery(q)
    ↓
Computed filteredProposals ricalcola
    ↓
Computed sortedProposals ricalcola
    ↓
Html re-render con dati nuovi
```

---

## Gestione Errori

**useForm:**
- Errori validazione: `errors[fieldName]`
- Errore invio: `submitError`

**useFetch:**
- Tentativi automatici con backoff
- Callback `onError` per errori

**Store:**
- Nessun dato persistente API (mock data in store)

---

## Best Practices Implementate

✅ **State Management:**
- Pinia per singola source of truth
- Computed for derived state
- Actions for mutations

✅ **Form Handling:**
- Composable riusabile `useForm`
- Validazione schema-based con Zod
- Real-time validation feedback

✅ **TypeScript:**
- Full type safety su view, store, composables
- Interfaces per data models
- Generic types per riusabilità

✅ **Design System:**
- CSS variables per consistent styling
- Semantic naming over arbitrary values
- Responsive design patterns

✅ **Components:**
- Piccoli, focused, reusable
- Props strongly typed
- Composable pattern per logica

---

## Sviluppo Futuro

- [ ] Connessione backend API (sostituire mock data)
- [ ] Autenticazione reale (JWT, OAuth)
- [ ] Persistenza dati browser (localStorage/IndexedDB)
- [ ] Componente FormInput riusabile (riduce duplication)
- [ ] Test unitari (Vitest)
- [ ] E2E tests (Cypress/Playwright)
- [ ] PWA features
- [ ] i18n (internazionalizzazione)
- [ ] Dark mode

---

**Ultima modifica:** 2026-02-15
**Versione:** 1.0 (Post-modernizzazione Vue.js)
