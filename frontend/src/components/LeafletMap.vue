<template>
  <div class="leaflet-map-wrap">
    <div v-if="!lat || !lon" class="map-no-coords">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="#cbd5e0">
        <path d="M20.5 3l-6 2.25L8.5 3 3.5 4.75v14.5l6-2.25L15.5 19l5-1.75V3zm-6 13.75l-6-2.25V5.5l6 2.25v9z"/>
      </svg>
      <p>Coordinate non disponibili</p>
      <small v-if="address">{{ address }}</small>
    </div>
    <div v-else ref="mapEl" class="leaflet-map-container"></div>
    <div v-if="address" class="map-address-bar">
      <span>📍</span> {{ address }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix leaflet marker icons with webpack/vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const props = defineProps<{
  lat?: number | null
  lon?: number | null
  address?: string
  zoom?: number
}>()

const mapEl = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

function initMap() {
  if (!mapEl.value || !props.lat || !props.lon) return
  if (map) {
    map.remove()
    map = null
    marker = null
  }
  map = L.map(mapEl.value, { zoomControl: true, scrollWheelZoom: false }).setView(
    [props.lat, props.lon],
    props.zoom ?? 15
  )
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)
  marker = L.marker([props.lat, props.lon]).addTo(map)
  if (props.address) marker.bindPopup(props.address).openPopup()
}

onMounted(async () => {
  await nextTick()
  initMap()
})

watch(() => [props.lat, props.lon, props.address], async () => {
  await nextTick()
  if (props.lat && props.lon) {
    if (map) {
      map.setView([props.lat, props.lon], props.zoom ?? 15)
      if (marker) {
        marker.setLatLng([props.lat, props.lon])
        if (props.address) marker.bindPopup(props.address).openPopup()
      }
    } else {
      initMap()
    }
  }
})

onUnmounted(() => {
  if (map) { map.remove(); map = null }
})
</script>

<style scoped>
.leaflet-map-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 260px;
  border-radius: inherit;
  overflow: hidden;
  background: #e2e8f0;
}

.leaflet-map-container {
  width: 100%;
  height: 100%;
  min-height: 260px;
}

.map-no-coords {
  width: 100%;
  height: 100%;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #aaa;
  background: #f0f4f8;
}

.map-no-coords p {
  margin: 0;
  font-size: 0.95rem;
  color: #999;
}

.map-no-coords small {
  font-size: 0.8rem;
  color: #bbb;
  max-width: 200px;
  text-align: center;
}

.map-address-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255,255,255,0.93);
  backdrop-filter: blur(4px);
  padding: 6px 12px;
  font-size: 0.82rem;
  color: #444;
  display: flex;
  align-items: center;
  gap: 4px;
  border-top: 1px solid #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 500;
}
</style>
