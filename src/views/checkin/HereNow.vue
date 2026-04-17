<template>
  <div class="herenow">
    <h2>Here, Now, in Canada</h2>

    <!-- GPS 狀態 -->
    <div class="location-status">
      <span v-if="locating">定位中...</span>
      <span v-else-if="form.lat !== null">📍 {{ locationAddress || '取得地址中...' }}</span>
      <span v-else class="error">無法取得定位</span>
      <button @click="getLocation" :disabled="locating">定位</button>
    </div>

    <!-- Leaflet 地圖 -->
    <div v-if="form.lat !== null" ref="mapEl" class="map"></div>

    <!-- 地圖提示 -->
    <p v-if="form.lat !== null" class="map-hint">每次打卡前請點擊「定位」確認目前位置</p>

    <!-- 選照片 -->
    <div class="photo-section">
      <input type="file" accept="image/*" @change="onFileChange" ref="fileInput" />
      <img v-if="previewURL" :src="previewURL" class="preview" alt="預覽" />
    </div>

    <!-- 留言 -->
    <div class="message-section">
      <textarea v-model="form.message" placeholder="現在的心情" maxlength="500" rows="4" />
    </div>

    <!-- Hashtag -->
    <div class="hashtag-section">
      <input v-model="hashtagInput" type="text" placeholder="#Hashtag" maxlength="100" />
    </div>

    <!-- 送出 -->
    <div class="submit-section">
      <p v-if="checkinStore.error" class="error">{{ checkinStore.error }}</p>
      <button @click="submit" :disabled="checkinStore.isSubmitting || !form.photo || form.lat === null">
        {{ checkinStore.isSubmitting ? '上傳中...' : '打卡！' }}
      </button>
    </div>

    <!-- 時間顯示 -->
    <div class="time-card">
      <div v-if="lastCheckin" class="time-row">
        <span class="time-label">當地時間</span>
        <span class="time-value">{{ lastCheckin.localTime }}</span>
      </div>
      <div class="time-row">
        <span class="time-label">台灣時間</span>
        <span class="time-value">{{ taiwanTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useCheckinStore } from '@/stores/useCheckinStore'
import { fetchLocationName } from '@/services/checkin/checkinService'
import type { CheckinFormData } from '@/types/checkin/checkin'

// 修正 Leaflet 預設圖示路徑問題
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

const checkinStore = useCheckinStore()

const form = ref<CheckinFormData>({
  message: '',
  hashtags: [],
  lat: null,
  lng: null,
  locationName: '',
  timezone: '',
  photo: null,
})

const hashtagInput = ref('')


const locating = ref(false)
const locationAddress = ref('')
const previewURL = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const mapEl = ref<HTMLElement | null>(null)

let mapInstance: L.Map | null = null
let marker: L.Marker | null = null

interface LastCheckin {
  locationName: string
  localTime: string
  timezone: string
}
const lastCheckin = ref<LastCheckin | null>(null)

const taiwanTime = ref('')
let timer: ReturnType<typeof setInterval> | null = null

function updateTaiwanTime() {
  taiwanTime.value = formatTime(new Date(), 'Asia/Taipei')
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

async function updateLocation(lat: number, lng: number) {
  form.value.lat = lat
  form.value.lng = lng
  locationAddress.value = ''
  const name = await fetchLocationName(lat, lng)
  locationAddress.value = name
  form.value.locationName = name
}

async function initMap() {
  await nextTick()
  if (!mapEl.value || form.value.lat === null || form.value.lng === null) return

  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }

  mapInstance = L.map(mapEl.value).setView([form.value.lat, form.value.lng], 16)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(mapInstance)

  marker = L.marker([form.value.lat, form.value.lng], { draggable: true }).addTo(mapInstance)

  marker.on('dragend', async () => {
    const pos = marker!.getLatLng()
    await updateLocation(pos.lat, pos.lng)
  })
}

async function getLocation() {
  if (!navigator.geolocation) {
    alert('你的瀏覽器不支援 GPS 定位')
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      await updateLocation(pos.coords.latitude, pos.coords.longitude)
      locating.value = false
      await initMap()
    },
    () => {
      locating.value = false
    }
  )
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  form.value.photo = file
  previewURL.value = URL.createObjectURL(file)
}

async function submit() {
  lastCheckin.value = null
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    form.value.hashtags = hashtagInput.value
      .split(/\s+/)
      .map(t => t.replace(/^#/, '').trim())
      .filter(t => t.length > 0)
    await checkinStore.submitCheckin(form.value)
    const latest = checkinStore.checkins[0]
    const now = new Date()
    lastCheckin.value = {
      locationName: latest?.locationName || '',
      localTime: formatTime(now, timezone),
      timezone,
    }
    form.value = { message: '', hashtags: [], lat: form.value.lat, lng: form.value.lng, locationName: form.value.locationName, timezone: '', photo: null }
    previewURL.value = null
    if (fileInput.value) fileInput.value.value = ''
    hashtagInput.value = ''
  } catch {
    // error 已由 store 處理
  }
}

onMounted(() => {
  getLocation()
  updateTaiwanTime()
  timer = setInterval(updateTaiwanTime, 1000)
})
</script>

<style lang="sass" scoped>
.herenow
  display: flex
  flex-direction: column
  margin: 0 auto
  padding: 24px
  max-width: 480px

  gap: 16px

.location-status
  display: flex
  align-items: center

  gap: 8px

.map
  overflow: hidden
  width: 100%
  height: 250px
  border-radius: 12px

.preview
  margin-top: 8px
  max-height: 300px
  width: 100%
  border-radius: 8px

  object-fit: cover

input[type="text"],
textarea
  padding: 8px 12px
  width: 100%
  border: 1px solid #ccc
  border-radius: 8px
  font-size: 14px
  box-sizing: border-box

textarea
  resize: vertical

button
  padding: 10px 20px
  border: none
  border-radius: 8px
  background: #91B500
  color: white
  cursor: pointer
  &:disabled
    opacity: 0.5
    cursor: not-allowed

.map-hint
  margin-top: -8px
  color: #888
  font-size: 12px

.error
  color: red
  font-size: 13px

.hashtag-section
  display: flex
  flex-direction: column
  gap: 8px

.hashtag-tags
  display: flex
  flex-wrap: wrap
  gap: 6px

.hashtag-tag
  padding: 2px 10px
  border-radius: 20px
  background: #e8f5c8
  color: #5a8000
  font-size: 13px

.time-card
  display: flex
  flex-direction: column
  padding: 16px
  border-radius: 12px
  background: #f5f5f5
  gap: 8px

.time-row
  display: flex
  align-items: center
  gap: 8px

.time-label
  color: #888
  font-size: 12px
  min-width: 60px

.time-value
  font-size: 15px
  font-weight: 600

.time-tz
  color: #aaa
  font-size: 12px

.success-card
  display: flex
  flex-direction: column
  padding: 16px
  border-radius: 12px
  background: #f0f7e0

  gap: 8px

.success-title
  font-weight: 700
  font-size: 16px

.success-row
  color: #444
  font-size: 14px

</style>
