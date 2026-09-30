<template>
  <div class="world-map-wrap">
    <div class="world-map" ref="container">
      <!-- 麵包屑 -->
      <BreadcrumbNav />

      <!-- 地圖容器 -->
      <div class="map-container" ref="mapContainer">
        <!-- 旅程資料載入失敗：整塊換成錯誤狀態 -->
        <div v-if="tripError" class="map-error">
          <StateView type="error" title="地圖載不出來" :message="tripError" @action="loadTrips" />
        </div>

        <template v-else>
          <!-- Smeargle WorldMap -->
          <WorldMap
            :visited-countries="visitedCountries"
            :pins="mapPins"
            :tile-api-key="cartoApiKey"
            @pin-click="handlePinClick"
          />

          <!-- 載入中／沒資料：浮在地圖上，不擋住地圖操作 -->
          <div v-if="tripLoading" class="map-overlay map-overlay--loading">
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import StateView from '@/components/common/StateView.vue'
import { storeToRefs } from 'pinia'
import { WorldMap } from '@monster/smeargle'
import InfoPanel from './InfoPanel.vue'
import { useMapDataConverter, type WorldMapPin } from '@/composables/useMapDataConverter'
import { useHistoryTripStore } from '@/stores/useHistoryTripStore'
import type { ProcessedPin } from '../../types/travel-map/travel-map'

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

.world-map-wrap
  margin: 0 auto
  max-width: 1200px
  padding: 0 $spacing-lg
  margin-bottom: 80px
  border-radius: $border-radius-lg
  // background: $bg-card
  // box-shadow: $shadow-medium

  @include tablet
    max-width: 1200px
    padding: 0 $spacing-lg
    margin-bottom: 120px

  @include desktop
    padding: 0 $spacing-xl
    margin-bottom: 120px
    border-radius: $border-radius-xl

  @include large-desktop
    max-width: 1400px

.world-map
  position: relative
  max-width: 100%

// ===================================
// 地圖容器
// ===================================
.map-container
  position: relative
  overflow: hidden
  margin: $spacing-lg auto 0
  height: 400px
  border-radius: $border-radius-md

  @include tablet
    height: 500px
    border-radius: $border-radius-lg


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
  background: $overlay-bg
  pointer-events: auto
  backdrop-filter: blur(2px)

</style>
