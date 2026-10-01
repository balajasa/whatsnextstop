<template>
  <div class="world-map-wrap">
    <div class="world-map" ref="container">
      <PageHeader subtitle="點地圖上的圖釘，看看在那個國家留下的腳印" />

      <div class="map-frame">
        <span class="map-frame__tape" aria-hidden="true"></span>
        <div class="map-container" ref="mapContainer">
          <div v-if="tripError" class="map-error">
            <StateView type="error" title="地圖載不出來" :message="tripError" @action="loadTrips" />
          </div>
          <div v-else-if="mapError" class="map-error">
            <StateView type="error" title="地圖載不出來" :message="mapError" @action="retryMap" />
          </div>

          <template v-else>
            <WorldMap :key="mapKey" :visited-countries="visitedCountries" :pins="mapPins"
              :tile-api-key="cartoApiKey" :colors="MAP_COLORS" :pin-colors="MAP_PIN_COLORS"
              :selected-pin-id="selectedPin?.country ?? null" :show-loading="false"
              @pin-click="handlePinClick" @ready="mapReady = true" @load-error="handleMapError" />

            <div v-if="tripLoading || !mapReady" class="map-overlay map-overlay--loading">
              <StateView type="loading" message="載入足跡中..." />
            </div>
            <div v-else-if="hasLoaded && visitedCountries.length === 0" class="map-overlay">
              <StateView type="empty" floating title="還沒有蓋任何章" message="去過的國家會在這裡上色" />
            </div>

            <!-- 背景遮罩 -->
            <div v-if="selectedPin" class="panel-backdrop" @click="handlePanelClose"></div>

            <!-- InfoPanel 元件 -->
            <InfoPanel v-if="selectedPin" :selected-pin="selectedPin" @close="handlePanelClose" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StateView from '@/components/common/StateView.vue'
import { storeToRefs } from 'pinia'
import { WorldMap } from '@monster/smeargle'
import InfoPanel from './InfoPanel.vue'
import { useMapDataConverter } from '@/composables/useMapDataConverter'
import { useHistoryTripStore } from '@/stores/useHistoryTripStore'
import type { ProcessedPin } from '../../types/travel-map/travel-map'
import { MAP_COLORS, MAP_PIN_COLORS } from '@/constants/map'

const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY

const historyTripStore = useHistoryTripStore()
const { loading: tripLoading, error: tripError } = storeToRefs(historyTripStore)

// 第一次載入完成前不顯示「沒資料」，避免一打開就閃一下
const hasLoaded = ref(false)
const loadTrips = async () => {
  await historyTripStore.loadAllTrips() // 載入全部資料給地圖使用
  hasLoaded.value = true
}
const { visitedCountries, mapPins } = useMapDataConverter()

// 地圖本身（smeargle WorldMap）的載入狀態
const mapReady = ref(false)
const mapError = ref('')
const mapKey = ref(0)

const handleMapError = (err: Error) => {
  console.error('世界地圖載入失敗:', err)
  mapError.value = '地圖資料出了點狀況，再試一次看看'
}

// 重新掛載 WorldMap
const retryMap = () => {
  mapError.value = ''
  mapReady.value = false
  mapKey.value++
}

// InfoPanel 狀態管理
const selectedPin = ref<ProcessedPin | null>(null)

const handlePinClick = (pinId: string) => {
  const pin = mapPins.value.find(p => p.id === pinId)
  if (!pin) return

  // 從旅程資料中獲取完整資訊
  const countryTrips = historyTripStore.allTrips.filter(trip => {
    return trip.destinations.some(dest => dest.country.toLowerCase() === pinId.toLowerCase())
  })

  if (countryTrips.length > 0) {
    // 計算最新訪問時間
    const sortedTrips = countryTrips.sort(
      (a, b) => new Date(b.date.startDate).getTime() - new Date(a.date.startDate).getTime()
    )
    const latestTrip = sortedTrips[0]

    // 收集城市資訊
    const allCities = new Set<string>()
    countryTrips.forEach(trip => {
      trip.destinations.forEach(dest => {
        if (dest.country.toLowerCase() === pinId.toLowerCase()) {
          dest.cities.forEach(city => allCities.add(city))
        }
      })
    })

    // 轉換為 ProcessedPin 格式給 InfoPanel 使用
    selectedPin.value = {
      country: pinId,
      displayName: pin.label?.split(' (')[0] || pinId,
      visitCount: pin.visitCount,
      latestVisit: `${latestTrip.date.startDate} - ${latestTrip.date.endDate}`,
      cities: Array.from(allCities).join('、'),
      x: 0, // InfoPanel 不需要這些座標
      y: 0,
      centroid: [0, 0], // 加入缺失的 centroid 屬性
      trips: countryTrips
    }
  }
}

const handlePanelClose = () => {
  selectedPin.value = null
}

// 生命週期
onMounted(async () => {
  await loadTrips()
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.world-map
  position: relative

// ===================================
// 紙框
// ===================================
.map-frame
  position: relative
  padding: 8px
  border: 1px solid $nb-line
  border-radius: 18px
  background: $nb-card
  box-shadow: $nb-card-shadow
  @include tablet
    padding: 14px
    border-radius: 20px

.map-frame__tape
  position: absolute
  top: -11px
  right: 40px
  z-index: 2
  width: 90px
  height: 24px
  background: $nb-tape-yellow
  transform: rotate(4deg)
  pointer-events: none
  @include tablet
    right: 60px
    width: 110px
    height: 28px

// ===================================
// 地圖容器
// ===================================
.map-container
  position: relative
  overflow: hidden
  // 手機：盡量撐滿可視高度（扣掉 Header、頁首、底部 tab）
  height: max(420px, calc(100dvh - 300px))
  border-radius: 12px
  background: #DCEAF1

  @include tablet
    height: 520px

  @include desktop
    height: 600px

// ===================================
// 載入中、沒資料：浮在地圖上
// ===================================
.map-overlay
  position: absolute
  inset: 0
  z-index: $z-mapoverlay
  display: flex
  align-items: center
  justify-content: center
  padding: $spacing-md
  // 讓地圖照樣可以拖曳、縮放
  pointer-events: none

.map-overlay--loading
  background: rgba($nb-paper, 0.6)

// ===================================
// 載入失敗：用格線底代替地圖
// ===================================
.map-error
  display: flex
  align-items: center
  justify-content: center
  height: 100%
  padding: $spacing-md
  border: 1px solid $nb-line
  border-radius: inherit
  background-color: $nb-card
  background-image: repeating-linear-gradient(0deg, transparent 0 39px, $nb-line 39px 40px), repeating-linear-gradient(90deg, transparent 0 39px, $nb-line 39px 40px)

// ===================================
// InfoPanel 背景遮罩
// ===================================
.panel-backdrop
  position: absolute
  top: 0
  left: 0
  z-index: $z-mapoverlay
  width: 100%
  height: 100%
  background: rgba($nb-ink, 0.15)
  pointer-events: auto

</style>
