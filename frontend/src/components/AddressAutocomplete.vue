<template>
  <div class="addr-wrap" ref="wrapRef">
    <input
      v-bind="$attrs"
      :value="modelValue"
      class="addr-input"
      :class="{ 'addr-input--error': hasError }"
      type="text"
      autocomplete="off"
      :placeholder="placeholder"
      @input="onInput"
      @keydown="onKeydown"
      @blur="onBlur"
      @focus="onFocus"
    />
    <!-- Spinner -->
    <span v-if="loading" class="addr-spinner"></span>

    <!-- Dropdown suggerimenti -->
    <ul v-if="showDropdown && suggestions.length" class="addr-dropdown">
      <li
        v-for="(s, i) in suggestions"
        :key="s.place_id"
        class="addr-item"
        :class="{ 'addr-item--active': i === activeIndex }"
        @mousedown.prevent="selectSuggestion(s)"
      >
        <span class="addr-item-icon">📍</span>
        <span class="addr-item-text">{{ s.display_name }}</span>
      </li>
    </ul>
    <ul v-else-if="showDropdown && searched && !loading" class="addr-dropdown">
      <li class="addr-item addr-item--empty">Nessun risultato trovato</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

const props = defineProps<{
  modelValue: string
  placeholder?: string
  hasError?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', coords: { lat: number; lon: number; display_name: string }): void
}>()

const wrapRef = ref<HTMLElement | null>(null)
const suggestions = ref<NominatimResult[]>([])
const showDropdown = ref(false)
const loading = ref(false)
const searched = ref(false)
const activeIndex = ref(-1)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  emit('update:modelValue', val)
  activeIndex.value = -1

  if (debounceTimer) clearTimeout(debounceTimer)

  if (val.trim().length < 3) {
    suggestions.value = []
    showDropdown.value = false
    searched.value = false
    return
  }

  loading.value = true
  showDropdown.value = true
  debounceTimer = setTimeout(() => fetchSuggestions(val), 400)
}

async function fetchSuggestions(query: string) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=it`
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'it', 'User-Agent': 'UrbanMind/1.0' }
    })
    const data: NominatimResult[] = await res.json()
    suggestions.value = data
    searched.value = true
  } catch {
    suggestions.value = []
  } finally {
    loading.value = false
  }
}

function selectSuggestion(s: NominatimResult) {
  emit('update:modelValue', s.display_name)
  emit('select', { lat: parseFloat(s.lat), lon: parseFloat(s.lon), display_name: s.display_name })
  suggestions.value = []
  showDropdown.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (!showDropdown.value || !suggestions.value.length) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, suggestions.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (e.key === 'Enter' && activeIndex.value >= 0) {
    e.preventDefault()
    selectSuggestion(suggestions.value[activeIndex.value])
  } else if (e.key === 'Escape') {
    showDropdown.value = false
  }
}

function onBlur() {
  // Piccolo delay per permettere il click sul dropdown
  setTimeout(() => { showDropdown.value = false }, 200)
}

function onFocus() {
  if (suggestions.value.length) showDropdown.value = true
}
</script>

<style scoped>
.addr-wrap {
  position: relative;
  width: 100%;
}

.addr-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 10px 36px 10px 12px;
  background: var(--color-background);
  color: var(--color-text);
  outline: none;
  font-size: inherit;
  font-family: inherit;
  transition: border-color var(--transition-base);
}

.addr-input:focus {
  border-color: var(--color-border-hover);
  box-shadow: 0 0 0 3px var(--color-border-focus);
}

.addr-input--error {
  border-color: #dc2626;
}

.addr-spinner {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: var(--color-orange-600);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  pointer-events: none;
}

@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }

.addr-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  list-style: none;
  margin: 0;
  padding: 4px 0;
  z-index: 1000;
  max-height: 260px;
  overflow-y: auto;
}

.addr-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 9px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  transition: background 0.15s;
  line-height: 1.4;
}

.addr-item:hover,
.addr-item--active {
  background: #fff3e0;
}

.addr-item--empty {
  color: #999;
  cursor: default;
  font-style: italic;
}

.addr-item-icon {
  flex-shrink: 0;
  font-size: 0.85rem;
  margin-top: 1px;
}

.addr-item-text {
  flex: 1;
  word-break: break-word;
}
</style>
