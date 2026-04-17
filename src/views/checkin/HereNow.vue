<template>
  <div class="herenow">

    <!-- 標題 -->
    <h2 class="page-title">Here, Now, in CANADA</h2>

    <!-- 照片區塊 -->
    <div class="photo-block">
      <div class="photo-block__toolbar">
        <button class="photo-btn" @click="fileInput?.click()">
          <img src="@/assets/img/icon/camera.png" class="btn-icon" alt="" />
          {{ form.photo ? '重新選擇' : '選擇照片' }}
        </button>
      </div>
      <input type="file" accept="image/*" @change="onFileChange" ref="fileInput" class="file-input" />
      <img v-if="previewURL" :src="previewURL" class="photo-preview" alt="預覽" />
    </div>

    <!-- 心情 + Hashtag -->
    <div class="content-block">
      <div class="field-group">
        <label class="field-label">心情</label>
        <textarea
          v-model="form.message"
          maxlength="500"
          rows="3"
          placeholder="分享此刻心情......"
          class="mood-input"
        />
      </div>
      <div class="field-group">
        <label class="field-label">Hashtag#</label>
        <input
          v-model="hashtagInput"
          type="text"
          maxlength="100"
          placeholder="新增標籤"
          class="hashtag-input"
        />
      </div>
    </div>

    <!-- 地點區塊 -->
    <div class="location-block">
      <button class="add-location-btn" @click="toggleLocation" :disabled="locating">
        <span class="add-location-btn__left">
          <img src="@/assets/img/icon/location_pin.png" class="neutral-icon" alt="" />
          <span v-if="locating">定位中...</span>
          <span v-else-if="locationExpanded">收起地點</span>
          <span v-else>新增地點</span>
        </span>
        <img src="@/assets/img/icon/common/arrow_right_key.png" class="arrow-icon" :class="{ 'arrow-icon--open': locationExpanded }" alt="" />
      </button>

      <div v-if="locationExpanded" class="location-expanded">
        <div v-if="form.lat !== null" ref="mapEl" class="map"></div>
        <p v-if="form.lat !== null" class="map-hint">可拖曳標記微調位置</p>

        <div class="field-group">
          <label class="field-label">地點名稱</label>
          <input
            v-model="form.locationName"
            type="text"
            maxlength="50"
            placeholder="輸入現在位置 (體諒免費仔)"
            class="location-name-input"
          />
        </div>

        <div v-if="locationAddress" class="address-row">
          <img src="@/assets/img/icon/near_me.png" class="address-icon neutral-icon" alt="" />
          <span class="address-text">{{ locationAddress }}</span>
        </div>
        <div v-else-if="form.lat !== null" class="address-row address-row--loading">
          <span>取得地址中...</span>
        </div>
      </div>
    </div>

    <!-- 時間區塊 -->
    <div class="time-block">
      <div class="time-row">
        <span class="time-label">現在時間</span>
        <span class="time-value">{{ localTime }}</span>
      </div>
      <div class="time-row">
        <span class="time-label">台灣時間</span>
        <span class="time-value">{{ taiwanTime }}</span>
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <p v-if="checkinStore.error" class="error-msg">{{ checkinStore.error }}</p>

    <!-- 打卡按鈕 -->
    <button
      class="submit-btn"
      @click="submit"
      :disabled="checkinStore.isSubmitting || !form.photo || form.lat === null"
    >
      {{ checkinStore.isSubmitting ? '上傳中...' : '打卡！' }}
    </button>

    <!-- 重置按鈕 -->
    <button class="reset-btn" @click="resetForm">
      重置
    </button>

    <!-- 相簿按鈕 -->
    <button class="album-btn" @click="$router.push({ name: 'NowAndThen' })">
      <img src="@/assets/img/icon/sp/maple.png" class="maple-icon" alt="相簿" />
      前往相簿
    </button>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useCheckinStore } from '@/stores/useCheckinStore'
import { fetchLocationName } from '@/services/checkin/checkinService'
import { useDialog } from '@/composables/useDialog'
import type { CheckinFormData } from '@/types/checkin/checkin'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

const router = useRouter()
const checkinStore = useCheckinStore()
const dialog = useDialog()

const form = ref<CheckinFormData>({
  message: '',
  hashtags: [],
  lat: null,
  lng: null,
  locationName: '',
  locationAddress: '',
  timezone: '',
  photo: null,
})

const hashtagInput = ref('')
const locating = ref(false)
const locationAddress = ref('')
const locationExpanded = ref(false)
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
const localTime = ref('')
let timer: ReturnType<typeof setInterval> | null = null

function updateTimes() {
  const now = new Date()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  localTime.value = formatTime(now, timezone)
  taiwanTime.value = formatTime(now, 'Asia/Taipei')
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
    hour12: false,
  }).format(date)
}

async function updateLocation(lat: number, lng: number) {
  form.value.lat = lat
  form.value.lng = lng
  locationAddress.value = ''
  form.value.locationAddress = ''
  const name = await fetchLocationName(lat, lng)
  locationAddress.value = name
  form.value.locationAddress = name
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

async function toggleLocation() {
  if (locationExpanded.value) {
    locationExpanded.value = false
    return
  }
  locationExpanded.value = true
  if (form.value.lat === null) {
    await getLocation()
  } else {
    await nextTick()
    await initMap()
  }
}

function resetForm() {
  form.value = { message: '', hashtags: [], lat: null, lng: null, locationName: '', locationAddress: '', timezone: '', photo: null }
  previewURL.value = null
  if (fileInput.value) fileInput.value.value = ''
  hashtagInput.value = ''
  locationAddress.value = ''
  locationExpanded.value = false
  lastCheckin.value = null
  if (mapInstance) { mapInstance.remove(); mapInstance = null }
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
    const now = new Date()
    const localTime = formatTime(now, timezone)
    lastCheckin.value = {
      locationName: form.value.locationName,
      localTime,
      timezone,
    }
    form.value = {
      message: '',
      hashtags: [],
      lat: form.value.lat,
      lng: form.value.lng,
      locationName: form.value.locationName,
      locationAddress: form.value.locationAddress,
      timezone: '',
      photo: null,
    }
    previewURL.value = null
    if (fileInput.value) fileInput.value.value = ''
    hashtagInput.value = ''
    await dialog.alert({
      title: '打卡成功',
      message: `${form.value.locationName || locationAddress.value || '未知地點'}\n${localTime}`,
      confirmText: '好的',
    })
    router.push({ name: 'NowAndThen' })
  } catch {
    // error 已由 store 處理
  }
}

onMounted(() => {
  updateTimes()
  timer = setInterval(updateTimes, 1000)
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *

.herenow
  display: flex
  flex-direction: column
  margin: 0 auto
  padding: 8px 20px
  min-height: 100%
  max-width: 480px

  gap: 14px

// 照片區塊
.photo-block
  display: flex
  flex-direction: column
  gap: $spacing-sm

  &__toolbar
    display: flex
    align-items: center
    justify-content: space-between

.album-btn
  display: flex
  align-items: center
  justify-content: center
  width: 100%
  padding: $spacing-sm $spacing-md
  border: 1.5px solid $camera-border-light
  border-radius: $border-radius-lg
  background: rgba(180, 30, 30, 0.05)
  color: $camera-text-secondary
  font-size: 13px
  cursor: pointer
  transition: border-color 0.2s, color 0.2s

  gap: 6px

  &:hover
    border-color: rgba($country-tab-border, 0.4)
    color: $country-tab-border

.maple-icon
  width: 18px
  height: 18px
  object-fit: contain

.reset-btn
  display: inline-flex
  align-items: center
  justify-content: center
  padding: $spacing-sm $spacing-md
  border: 1.5px solid $camera-border-primary
  border-radius: $border-radius-lg
  background: transparent
  color: $camera-neutral
  font-weight: 500
  font-size: 14px
  cursor: pointer
  transition: border-color 0.2s, color 0.2s

  &:hover
    border-color: $country-tab-border
    color: $country-tab-border

.reset-icon
  width: 16px
  height: 16px

  object-fit: contain

.file-input
  display: none

.photo-btn
  display: flex
  align-items: center
  justify-content: center
  width: 100%
  padding: $spacing-sm $spacing-md
  border: none
  border-radius: $border-radius-lg
  background: $country-tab-border
  color: #fff
  font-weight: 600
  font-size: 14px
  cursor: pointer
  transition: background 0.2s

  gap: $spacing-sm

  &:hover
    background: rgba(0, 92, 175, 0.85)

.btn-icon
  width: 18px
  height: 18px
  filter: brightness(0) invert(1)

  object-fit: contain

.neutral-icon
  width: 18px
  height: 18px
  opacity: 0.75
  filter: grayscale(1) brightness(0) invert(1) brightness(0.55)

  object-fit: contain

.photo-preview
  max-height: 320px
  width: 100%
  border-radius: $border-radius-lg
  object-fit: cover

// 頁面標題
.page-title
  margin: 0
  color: $camera-text-primary
  letter-spacing: 0.15em
  font-weight: 700
  font-size: 20px
  text-align: left

// 共用標題
.field-group
  display: flex
  flex-direction: column
  gap: 6px

.field-label
  color: $camera-text-primary
  font-weight: 500
  font-size: 13px

// 心情 + Hashtag 區塊
.content-block
  display: flex
  flex-direction: column
  gap: $spacing-sm

.mood-input
  box-sizing: border-box
  padding: $spacing-md
  width: 100%
  border: 1.5px solid $camera-border-light
  border-radius: $border-radius-lg
  background: #ffffff
  color: $camera-text-primary
  font-size: 15px
  line-height: 1.6
  resize: none
  transition: border-color 0.2s

  &::placeholder
    color: $camera-text-muted

  &:focus
    outline: none
    border-color: rgba($country-tab-border, 0.5)

.hashtag-input
  box-sizing: border-box
  padding: $spacing-sm $spacing-md
  width: 100%
  border: 1.5px solid $camera-border-light
  border-radius: $border-radius-lg
  background: #ffffff
  color: $camera-text-primary
  font-size: 14px
  transition: border-color 0.2s

  &::placeholder
    color: $camera-text-muted

  &:focus
    outline: none
    border-color: rgba($country-tab-border, 0.5)

// 地點區塊
.location-block
  display: flex
  flex-direction: column

  gap: $spacing-md

.add-location-btn
  display: flex
  align-items: center
  justify-content: space-between
  box-sizing: border-box
  padding: $spacing-sm $spacing-md
  width: 100%
  border: 1.5px solid $camera-border-light
  border-radius: $border-radius-lg
  background: #ffffff
  color: $camera-neutral
  font-weight: 600
  font-size: 15px
  cursor: pointer
  transition: border-color 0.2s, color 0.2s

  &:hover:not(:disabled)
    border-color: rgba($country-tab-border, 0.5)
    color: $country-tab-border

  &:disabled
    opacity: 0.5
    cursor: not-allowed

  &__left
    display: flex
    align-items: center

    gap: $spacing-sm

  &__left
    display: flex
    align-items: center

    gap: $spacing-sm

.arrow-icon
  width: 18px
  height: 18px
  opacity: 0.4
  transition: transform 0.2s
  &--open
    transform: rotate(90deg)

.location-expanded
  display: flex
  flex-direction: column

  gap: $spacing-sm

.map
  overflow: hidden
  width: 100%
  height: 220px
  border-radius: $border-radius-lg

.map-hint
  margin: 0
  color: $camera-text-light
  font-size: 12px

.location-name-input
  box-sizing: border-box
  padding: $spacing-sm $spacing-md
  width: 100%
  border: 1.5px solid $camera-border-light
  border-radius: $border-radius-lg
  background: #ffffff
  color: $camera-text-primary
  font-size: 14px
  transition: border-color 0.2s

  &::placeholder
    color: $camera-text-muted

  &:focus
    outline: none
    border-color: rgba($country-tab-border, 0.5)

.address-row
  display: flex
  align-items: center
  color: $camera-text-secondary
  font-size: 13px

  gap: $spacing-sm

  &--loading
    color: $camera-text-muted

.address-icon
  flex-shrink: 0
  width: 16px
  height: 16px

  object-fit: contain

.address-text
  line-height: 1.4

// 時間區塊
.time-block
  display: flex
  flex-direction: column

  gap: $spacing-xs

.time-row
  display: flex
  align-items: center
  justify-content: space-between

.time-label
  color: $camera-text-secondary
  font-size: 13px

.time-value
  color: $camera-text-primary
  font-size: 13px

// 錯誤
.error-msg
  margin: 0
  color: #D32F2F
  font-size: 13px

// 打卡按鈕
.submit-btn
  padding: $spacing-sm $spacing-md
  width: 100%
  border: none
  border-radius: $border-radius-lg
  background: $country-tab-border
  color: #fff
  letter-spacing: 0.5px
  font-weight: 700
  font-size: 16px
  cursor: pointer
  transition: background 0.2s, opacity 0.2s

  &:hover:not(:disabled)
    background: rgba(0, 92, 175, 0.85)

  &:disabled
    opacity: 0.45
    cursor: not-allowed
</style>
