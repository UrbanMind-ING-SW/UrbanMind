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
      <form class="um-form" @submit.prevent="submit">
        <div class="um-grid2">
          <div class="um-field">
            <label class="um-label" for="titolo">Titolo</label>
            <input
              id="titolo"
              v-model.trim="form.titolo"
              class="um-input"
              type="text"
              placeholder="Es. Nuova pista ciclabile"
              required
              maxlength="80"
            />
            <div class="um-hint">{{ form.titolo.length }}/80</div>
          </div>

          <div class="um-field">
            <label class="um-label" for="categoria">Categoria</label>
            <select id="categoria" v-model="form.categoria" class="um-input" required>
              <option disabled value="">Seleziona...</option>
              <option>Mobilità</option>
              <option>Ambiente</option>
              <option>Sicurezza</option>
              <option>Tecnologia</option>
              <option>Sport</option>
              <option>Cultura</option>
              <option>Altro</option>
            </select>
          </div>
        </div>

        <div class="um-field">
          <label class="um-label" for="descrizione">Descrizione</label>
          <textarea
            id="descrizione"
            v-model.trim="form.descrizione"
            class="um-textarea"
            placeholder="Descrivi l’idea, contesto, benefici e dove intervenire..."
            required
            rows="6"
            maxlength="600"
          />
          <div class="um-hint">{{ form.descrizione.length }}/600</div>
        </div>

        <div class="um-grid2">
          <div class="um-field">
            <label class="um-label" for="quartiere">Zona/Quartiere (opzionale)</label>
            <input
              id="quartiere"
              v-model.trim="form.zona"
              class="um-input"
              type="text"
              placeholder="Es. Centro, Trento Nord..."
              maxlength="60"
            />
          </div>

          <div class="um-field">
            <label class="um-label" for="budget">Budget stimato (opzionale)</label>
            <input
              id="budget"
              v-model.number="form.budget"
              class="um-input"
              type="number"
              min="0"
              step="1000"
              placeholder="Es. 50000"
            />
          </div>
        </div>

        <div class="um-actions">
            <button class="um-btn um-btnGhost" type="button" @click="cancel" :disabled="submitting">
              Annulla
            </button>


          <button class="um-btn um-btnPrimary" type="submit" :disabled="!isValid || submitting">
            {{ submitting ? "Invio..." : "Invia proposta" }}
          </button>
        </div>

        <p v-if="error" class="um-error">{{ error }}</p>
        <p v-if="ok" class="um-ok">Proposta inviata (mock). Ora collega l’API / store.</p>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import MainNavbar from "@/components/MainNavbar.vue";

const router = useRouter();

const submitting = ref(false);
const error = ref("");

const form = ref({
  titolo: "",
  categoria: "",
  descrizione: "",
  zona: "",
  budget: null,
});

const isValid = computed(() => {
  return (
    form.value.titolo.trim().length >= 6 &&
    form.value.categoria &&
    form.value.descrizione.trim().length >= 20
  );
});

function reset() {
  form.value = { titolo: "", categoria: "", descrizione: "", zona: "", budget: null };
  error.value = "";
}

function cancel() {
  router.push({ name: "proposals" });
}

async function submit() {
  error.value = "";

  if (!isValid.value) {
    error.value = "Controlla titolo, categoria e descrizione (minimo 20 caratteri).";
    return;
  }

  submitting.value = true;
  try {
    // TODO: chiamata API (POST /proposals) o Pinia store action
    await new Promise((r) => setTimeout(r, 600));

    // opzionale: pulisci il form (utile se rimani sulla pagina in futuro)
    reset();

    // vai alla lista
    await router.push({ name: "proposals" });
  } catch (e) {
    error.value = "Errore durante l’invio. Riprova.";
  } finally {
    submitting.value = false;
  }
}
</script>



<style scoped>
.um-page {
  min-height: 100vh;
  background: var(--color-background-mute);
  color: var(--color-text);
}

.um-navbarWrap {
  border-bottom: 1px solid var(--color-border);
}

.um-hero {
  margin: 10px 18px 0;
  padding: 18px 18px;
  background: linear-gradient(135deg, var(--um-orange-soft), var(--um-dark-blue));
  border-radius: 12px;
}

.um-heroTitle {
  margin: 0;
  color: var(--um-text-white);
  font-size: clamp(22px, 3vw, 34px);
  font-weight: 800;
}

.um-heroSubtitle {
  margin-top: 6px;
  color: var(--um-text-white);
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
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
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
  color: var(--color-heading);
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
}

.um-textarea {
  resize: vertical;
}

.um-input:focus,
.um-textarea:focus {
  border-color: var(--color-border-hover);
  box-shadow: 0 0 0 3px var(--um-divider-dark);
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
}

.um-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.um-btnPrimary {
  background: var(--um-orange);
  color: var(--um-text-white);
  box-shadow: 0 10px 22px rgba(243, 109, 11, 0.22);
}

.um-btnGhost {
  background: var(--color-background-soft);
  color: var(--color-heading);
  border: 1px solid var(--color-border);
}

.um-error {
  margin-top: 10px;
  color: #b91c1c;
  font-weight: 700;
}

.um-ok {
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
