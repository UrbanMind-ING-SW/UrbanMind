<template>
  <div class="um-page">
    <div class="um-navbarWrap">
      <MainNavbar />
    </div>

    <section class="um-hero">
      <div class="um-heroText">
        <h2 class="um-heroTitle">Nuova proposta</h2>
        <p class="um-heroSubtitle">Compila i campi e invia la tua idea al Comune.</p>
      </div>
    </section>

    <main class="um-main">
      <form class="um-form" @submit.prevent="handleSubmit">
        <div class="um-grid2">
          <div class="um-field">
            <label class="um-label" for="titolo">Titolo</label>
            <input
              id="titolo"
              name="titolo"
              :value="form.titolo"
              class="um-input"
              :class="{ 'input-error': touched.titolo && errors.titolo }"
              type="text"
              placeholder="Es. Nuova pista ciclabile"
              maxlength="80"
              @change="handleChange"
              @blur="handleBlur"
            />
            <div v-if="touched.titolo && errors.titolo" class="um-error-text">
              {{ errors.titolo }}
            </div>
            <div class="um-hint">{{ form.titolo.length }}/80</div>
          </div>

          <div class="um-field">
            <label class="um-label" for="categoria">Categoria</label>
            <select
              id="categoria"
              name="categoria"
              :value="form.categoria"
              class="um-input"
              :class="{ 'input-error': touched.categoria && errors.categoria }"
              @change="handleChange"
              @blur="handleBlur"
            >
              <option disabled value="">Seleziona...</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <div v-if="touched.categoria && errors.categoria" class="um-error-text">
              {{ errors.categoria }}
            </div>
          </div>
        </div>

        <div class="um-field">
          <label class="um-label" for="descrizione">Descrizione</label>
          <textarea
            id="descrizione"
            name="descrizione"
            :value="form.descrizione"
            class="um-textarea"
            :class="{ 'input-error': touched.descrizione && errors.descrizione }"
            placeholder="Descrivi l'idea, contesto, benefici e dove intervenire..."
            rows="6"
            maxlength="600"
            @change="handleChange"
            @blur="handleBlur"
          />
          <div v-if="touched.descrizione && errors.descrizione" class="um-error-text">
            {{ errors.descrizione }}
          </div>
          <div class="um-hint">{{ form.descrizione.length }}/600</div>
        </div>

        <div class="um-grid2">
          <div class="um-field">
            <label class="um-label" for="zona">Zona/Quartiere (opzionale)</label>
            <input
              id="zona"
              name="zona"
              :value="form.zona || ''"
              class="um-input"
              type="text"
              placeholder="Es. Centro, Trento Nord..."
              maxlength="60"
              @change="handleChange"
              @blur="handleBlur"
            />
          </div>

          <div class="um-field">
            <label class="um-label" for="budget">Budget stimato (opzionale)</label>
            <input
              id="budget"
              name="budget"
              :value="form.budget || ''"
              class="um-input"
              type="number"
              min="0"
              step="1000"
              placeholder="Es. 50000"
              @change="handleChange"
              @blur="handleBlur"
            />
          </div>
        </div>

        <div class="um-actions">
          <button class="um-btn um-btnGhost" type="button" @click="cancel" :disabled="isSubmitting">
            Annulla
          </button>

          <button class="um-btn um-btnPrimary" type="submit" :disabled="!isValid || isSubmitting">
            {{ isSubmitting ? 'Invio...' : 'Invia proposta' }}
          </button>
        </div>

        <p v-if="submitError" class="um-error">{{ submitError }}</p>
        <p v-if="submitSuccess" class="um-success">Proposta inviata con successo!</p>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import MainNavbar from '@/components/MainNavbar.vue'
import { useProposalsStore } from '@/stores/proposals'
import { useForm } from '@/composables/useForm'
import { newProposalSchema, type NewProposalFormData } from '@/schemas/forms'

const router = useRouter()
const proposalsStore = useProposalsStore()

const initialValues: NewProposalFormData = {
  titolo: '',
  categoria: '',
  descrizione: '',
  zona: undefined,
  budget: null,
}

const {
  form,
  errors,
  touched,
  isSubmitting,
  submitError,
  submitSuccess,
  isValid,
  handleChange,
  handleBlur,
  handleSubmit,
  reset,
} = useForm({
  initialValues,
  validationSchema: newProposalSchema,
  onSubmit: async (values) => {
    try {
      proposalsStore.addProposal({
        titolo: values.titolo,
        descrizione: values.descrizione,
        categoria: values.categoria,
        stato: 'in-valutazione',
        data: new Date().toISOString().split('T')[0]!,
        zona: values.zona || '',
      })

      await new Promise((resolve) => setTimeout(resolve, 600))
      setTimeout(() => router.push({ name: 'proposals' }), 500)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Errore durante l\'invio')
    }
  },
})

const categories = ['Mobilità', 'Ambiente', 'Sicurezza', 'Tecnologia', 'Sport', 'Cultura', 'Altro']

function cancel() {
  reset()
  router.push({ name: 'proposals' })
}
</script>

<style scoped>
.um-page {
  min-height: 100vh;
  background: var(--color-background-soft);
  color: var(--color-text);
}

.um-navbarWrap {
  border-bottom: 1px solid var(--color-border);
}

.um-hero {
  margin: 10px 18px 0;
  padding: 18px 18px;
  background: var(--gradient-hero);
  border-radius: 12px;
}

.um-heroTitle {
  margin: 0;
  color: var(--color-text-white);
  font-size: clamp(22px, 3vw, 34px);
  font-weight: 800;
}

.um-heroSubtitle {
  margin-top: 6px;
  color: var(--color-text-white);
  opacity: 0.9;
  font-size: 0.95rem;
}

.um-main {
  padding: 16px 18px 28px;
}

.um-form {
  max-width: 880px;
  margin: 0 auto;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 16px;
  box-shadow: var(--shadow-md);
}

.um-grid2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.um-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.um-label {
  font-weight: 800;
  color: var(--color-text-heading);
  font-size: 0.95rem;
}

.um-input,
.um-textarea {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 10px 12px;
  background: var(--color-background);
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition-base);
}

.um-input.input-error,
.um-textarea.input-error {
  border-color: #dc2626;
}

.um-textarea {
  resize: vertical;
  font-family: var(--font-family);
}

.um-input:focus,
.um-textarea:focus {
  border-color: var(--color-border-hover);
  box-shadow: 0 0 0 3px var(--color-border-focus);
}

.um-error-text {
  font-size: 0.82rem;
  color: #dc2626;
  font-weight: 600;
}

.um-hint {
  font-size: 0.82rem;
  opacity: 0.75;
}

.um-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
}

.um-btn {
  border: 0;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all var(--transition-base);
}

.um-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.um-btnPrimary {
  background: var(--color-accent);
  color: var(--color-text-white);
  box-shadow: var(--shadow-md);
}

.um-btnPrimary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.um-btnGhost {
  background: var(--color-background-soft);
  color: var(--color-text-heading);
  border: 1px solid var(--color-border);
}

.um-btnGhost:hover:not(:disabled) {
  border-color: var(--color-border-hover);
  background: var(--color-background);
}

.um-error {
  margin-top: 10px;
  color: #b91c1c;
  font-weight: 700;
}

.um-success {
  margin-top: 10px;
  color: #065f46;
  font-weight: 700;
}

@media (max-width: 720px) {
  .um-grid2 {
    grid-template-columns: 1fr;
  }
}
</style>
