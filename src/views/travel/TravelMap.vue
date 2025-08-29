<template>
  <div class="world-map-container">
    <div class="world-map" ref="container">
      <!-- 麵包屑 -->
      <BreadcrumbNav />

      <!-- 地圖容器 -->
      <div class="map-container" ref="mapContainer">
        <!-- Smeargle WorldMap -->
        <WorldMap
          :visited-countries="visitedCountries"
          :pins="mapPins"
          @pin-click="handlePinClick"
        />

        <!-- 背景遮罩 -->
        <div v-if="selectedPin" class="panel-backdrop" @click="handlePanelClose"></div>

        <!-- InfoPanel 組件 -->
        <InfoPanel v-if="selectedPin" :selected-pin="selectedPin" @close="handlePanelClose" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import { WorldMap } from '@monster/smeargle'
import InfoPanel from './InfoPanel.vue'
import { useMapDataConverter, type WorldMapPin } from '@/composables/useMapDataConverter'
import { useTravelStore } from '@/stores/useTravelStore'
import type { ProcessedPin } from '../../types/travel-map/travel-map'

const travelStore = useTravelStore()
const { visitedCountries, mapPins } = useMapDataConverter()

// InfoPanel 狀態管理
const selectedPin = ref<ProcessedPin | null>(null)

// 處理圖釘點擊 - 建立 pinId 到完整資料的映射
const handlePinClick = (pinId: string) => {
  const pin = mapPins.value.find(p => p.id === pinId)
  if (!pin) return
  
  // 從旅遊資料中獲取完整資訊
  const countryTrips = travelStore.travels.filter(travel => {
    const countryList = Array.isArray(travel.country) ? travel.country : [travel.country]
    return countryList.some(country => country.toLowerCase() === pinId.toLowerCase())
  })
  
  if (countryTrips.length > 0) {
    // 計算最新訪問時間
    const sortedTrips = countryTrips.sort(
      (a, b) => new Date(`${b.year}-${b.startDate}`).getTime() - new Date(`${a.year}-${a.startDate}`).getTime()
    )
    const latestTrip = sortedTrips[0]
    
    // 收集城市資訊
    const allCities = new Set<string>()
    countryTrips.forEach(trip => {
      if (trip.cityTW) {
        trip.cityTW.forEach(city => allCities.add(city))
      } else if (trip.city) {
        trip.city.forEach(city => allCities.add(city))
      }
    })
    
    // 轉換為 ProcessedPin 格式給 InfoPanel 使用
    selectedPin.value = {
      country: pinId,
      displayName: pin.label?.split(' (')[0] || pinId,
      visitCount: pin.visitCount,
      latestVisit: `${latestTrip.year}/${latestTrip.startDate} - ${latestTrip.endDate}`,
      cities: Array.from(allCities).join('、'),
      x: 0, // InfoPanel 不需要這些座標
      y: 0,
      trips: countryTrips
    }
  }
}

const handlePanelClose = () => {
  selectedPin.value = null
}

// 生命週期
onMounted(async () => {
  await travelStore.loadTravels()
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.world-map-container
  margin: 0 auto
  max-width: 1200px
  border-radius: $border-radius-lg
  background: $bg-card
  box-shadow: $shadow-medium

  @include tablet
    max-width: 1200px

  @include desktop
    border-radius: $border-radius-xl

  @include large-desktop
    max-width: 1400px

.world-map
  position: relative
  padding: $spacing-md
  max-width: 100%

  @include tablet
    padding: $spacing-lg

  @include desktop
    padding: $spacing-xl

// ===================================
// 地圖容器
// ===================================
.map-container
  position: relative
  overflow: hidden
  margin: 0 auto
  height: 500px
  border-radius: $border-radius-md

  @include tablet
    height: 600px
    border-radius: $border-radius-lg

  @include desktop
    height: 700px

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

// ===================================
// 響應式優化
// ===================================

// 手機版特殊處理
@include mobile-only
  .world-map
    padding: $spacing-sm
  
  .map-container
    height: 400px
</style>
