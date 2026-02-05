<template>
  <div class="um-page">
    <div class="um-navbarWrap">
      <MainNavbar />
    </div>

    <section class="um-hero">
      <div class="um-heroText">
        <h2 class="um-heroTitle">Nuova segnalazione</h2>
        <p class="um-heroSubtitle">
          Descrivi il problema, indica la zona e (se vuoi) allega una foto.
        </p>
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
              placeholder="Es. Buche sulla strada"
              required
              maxlength="80"
            />
            <div class="um-hint">{{ form.titolo.length }}/80</div>
          </div>

          <div class="um-field">
            <label class="um-label" for="categoria">Categoria</label>
            <select id="categoria" v-model="form.categoria" class="um-input" required>
              <option disabled value="">Seleziona...</option>
              <option>Strade</option>
              <option>Illuminazione</option>
              <option>Rifiuti</option>
              <option>Verde pubblico</option>
              <option>Sicurezza</option>
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
            placeholder="Cosa succede? Da quanto tempo? Ci sono rischi per pedoni/auto?"
            required
            rows="6"
            maxlength="800"
          />
          <div class="um-hint">{{ form.descrizione.length }}/800</div>
        </div>

        <div class="um-grid2">
          <div class="um-field">
            <label class="um-label" for="zona">Zona/Indirizzo</label>
            <input
              id="zona"
              v-model.trim="form.zona"
              class="um-input"
              type="text"
              placeholder="Es. Via Roma 12, Trento"
              required
              maxlength="90"
            />
          </div>

          <div class="um-field">
            <label class="um-label" for="priorita">Priorità</label>
            <select id="priorita" v-model="form.priorita" class="um-input" required>
              <option value="bassa">Bassa</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        <div class="um-field">
          <label class="um-label" for="foto">Foto (opzionale)</label>
          <input
            id="foto"
            class="um-file"
            type="file"
            accept="image/*"
            @change="onFileChange"
          />
          <div v-if="fileName" class="um-hint">Allegato: {{ fileName }}</div>
        </div>

        <div class="um-actions">
          <button class="um-btn um-btnGhost" type="button" @click="cancel" :disabled="submitting">
            Annulla
          </button>

          <button class="um-btn um-btnPrimary" type="submit" :disabled="!isValid || submitting">
            {{ submitting ? "Invio..." : "Invia segnalazione" }}
          </button>
        </div>

        <p v-if="error" class="um-error">{{ error }}</p>
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
const fileName = ref("");

const form = ref({
  titolo: "",
  categoria: "",
  descrizione: "",
  zona: "",
  priorita: "media",
  foto: null, // File
});

const isValid = computed(() => {
  return (
    form.value.titolo.trim().length >= 6 &&
    form.value.categoria &&
    form.value.descrizione.trim().length >= 20 &&
    form.value.zona.trim().length >= 3 &&
    form.value.priorita
  );
});

function onFileChange(e) {
  const file = e.target.files?.[0] ?? null;
  form.value.foto = file;
  fileName.value = file ? file.name : "";
}

function cancel() {
  router.push({ name: "proposals" }); // cambia nome se hai una route "reports"
}

async function submit() {
  error.value = "";

  if (!isValid.value) {
    error.value = "Compila i campi obbligatori (descrizione min 20 caratteri).";
    return;
  }

  submitting.value = true;
  try {
    // TODO: chiamata API (POST /reports) con FormData se c’è foto
    // Esempio: const fd = new FormData(); fd.append('foto', form.value.foto)
    await new Promise((r) => setTimeout(r, 600));

    router.push({ name: "proposals" }); // o route lista segnalazioni
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

.um-file {
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  padding: 10px 12px;
  background: var(--color-background);
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

@media (max-width: 720px) {
  .um-grid2 {
    grid-template-columns: 1fr;
  }
}
</style>
