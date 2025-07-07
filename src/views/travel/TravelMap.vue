<template>
  <div class="world-map-container">
    <div class="world-map" ref="container">
      <!-- 麵包屑 -->
      <BreadcrumbNav />

      <!-- 控制區域 -->
      <div class="controls">
        <button @click="handleResetView" class="reset-btn">重置地圖</button>
        <span class="instructions">💡 拖曳移動地圖，使用 +/- 縮放</span>
      </div>

      <!-- 地圖容器 -->
      <div class="map-container" ref="mapContainer">
        <!-- 縮放控制 -->
        <div class="zoom-controls">
          <button @click="handleZoomIn" :disabled="currentScale >= maxScale" class="zoom-btn">
            +
          </button>
          <button @click="handleZoomOut" :disabled="currentScale <= minScale" class="zoom-btn">
            -
          </button>
          <div class="zoom-level">{{ currentScale.toFixed(1) }}x</div>
        </div>

        <!-- 地圖組件 -->
        <WorldMap ref="worldMapRef" :width="width" :height="height" :min-scale="minScale" :max-scale="maxScale"
          @map-ready="onMapReady" @view-change="onViewChange" @country-hover="onCountryHover"
          @country-click="onCountryClick" @status-change="onStatusChange" />

        <!-- 旅遊圖釘組件 -->
        <MapPin v-if="mapProjection && mapWorldData" :projection="mapProjection" :world-data="mapWorldData"
          :current-transform="currentTransform" :current-scale="currentScale" @pin-selected="handlePinSelected"
          @panel-close="handlePanelClose" />

        <!-- 背景遮罩 -->
        <div v-if="selectedPin" class="panel-backdrop" @click="handlePanelClose"></div>

        <!-- InfoPanel 組件 -->
        <InfoPanel v-if="selectedPin" :selected-pin="selectedPin" @close="handlePanelClose" />
      </div>

      <!-- 狀態顯示 -->
      <!-- <div class="map-status">狀態: {{ status }}</div> -->

      <!-- 國家資訊顯示 -->
      <div class="country-info-container">
        <div v-if="hoveredCountry" class="country-info">
          {{ getDisplayCountryName(hoveredCountry) }}
        </div>
        <!-- <div v-if="clickedCountry" class="country-info">
          最後點擊: {{ getDisplayCountryName(clickedCountry) }}
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, readonly } from 'vue'
import type { Ref } from 'vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import WorldMap from './WorldMap.vue'
import MapPin from './MapPin.vue'
import InfoPanel from './InfoPanel.vue'
import type { Transform, ProcessedPin } from '../../types/travel-map'
import { countryTranslation } from '../../composables/countryTranslation'

// Refs
const container: Ref<HTMLElement | null> = ref(null)
const worldMapRef: Ref<any> = ref(null)

const { getCountryChineseName } = countryTranslation()

// State
const status: Ref<string> = ref('載入中...')
const hoveredCountry: Ref<string> = ref('')
const clickedCountry: Ref<string> = ref('')
const width: Ref<number> = ref(1000)
const height: Ref<number> = ref(600)
const currentScale: Ref<number> = ref(1)
const minScale: Ref<number> = ref(1)
const maxScale: Ref<number> = ref(3)

// InfoPanel 狀態管理
const selectedPin: Ref<ProcessedPin | null> = ref(null)

// 地圖數據
const mapProjection: Ref<any> = ref(null)
const mapWorldData: Ref<any> = ref(null)
const currentTransform: Ref<Transform> = ref({ x: 0, y: 0, scale: 1 })

// 獲取顯示用的國家名稱（中文名稱 + 國旗）
const getDisplayCountryName = (countryName: string): string => {
  if (!countryName) return ''

  const chineseName = getCountryChineseName(countryName)

  return `${chineseName}`
}

// 響應式尺寸計算 - 修正手機版邏輯
const updateSize = (): void => {
  if (container.value) {
    const containerWidth = container.value.clientWidth - 40
    const isMobile = window.innerWidth <= 768

    if (isMobile) {
      // 手機版：充分利用容器寬度，按地圖原始比例計算高度
      width.value = Math.min(containerWidth, containerWidth) // 使用可用寬度

      // 地圖原始比例約為 1000:600 = 5:3
      // 但要考慮留一些邊距，所以使用稍微緊湊的比例
      const mapAspectRatio = 600 / 1000 // 0.6
      height.value = Math.round(width.value * mapAspectRatio)

      // 設定最小高度，確保地圖夠大
      height.value = Math.max(height.value, 350)

    } else {
      // 桌面版：保持原邏輯
      width.value = Math.min(containerWidth, 1000)
      height.value = 600
    }
  }
}

// 地圖事件處理
const onMapReady = (data: { projection: any; worldData: any }) => {
  mapProjection.value = data.projection
  mapWorldData.value = data.worldData
}

const onViewChange = (data: { scale: number; transform: Transform }) => {
  currentScale.value = data.scale
  currentTransform.value = data.transform
}

const onCountryHover = (countryName: string) => {
  hoveredCountry.value = countryName
}

const onCountryClick = (countryName: string) => {
  clickedCountry.value = countryName
}

const onStatusChange = (newStatus: string) => {
  status.value = newStatus
}

// InfoPanel 事件處理
const handlePinSelected = (pin: ProcessedPin) => {
  selectedPin.value = pin
}

const handlePanelClose = () => {
  selectedPin.value = null
}

// 控制方法
const handleZoomIn = () => {
  worldMapRef.value?.zoomIn()
}

const handleZoomOut = () => {
  worldMapRef.value?.zoomOut()
}

const handleResetView = () => {
  worldMapRef.value?.resetView()
}

// 生命週期
onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
})

// 暴露接口
defineExpose({
  mapProjection: readonly(mapProjection),
  mapWorldData: readonly(mapWorldData),
  currentScale: readonly(currentScale)
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.world-map-container
  margin: 0 auto
  max-width: 1000px
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
// 控制區域
// ===================================
.controls
  @include flex-between
  flex-wrap: wrap
  margin-bottom: $spacing-md
  gap: $spacing-sm

  @include tablet
    margin-bottom: $spacing-lg
    gap: $spacing-md

  @include mobile-only
    align-items: stretch
    flex-direction: column
    gap: $spacing-xs

.reset-btn
  padding: $spacing-sm $spacing-md
  border: none
  border-radius: $border-radius-sm
  background: $primary-color
  color: $text-white
  font-weight: 500
  font-size: 14px
  cursor: pointer
  transition: all 0.2s ease-in-out

  @include tablet
    padding: $spacing-md $spacing-lg
    border-radius: $border-radius-md
    font-size: 15px

  &:hover
    background: rgba(60, 70, 84, 1)
    box-shadow: $shadow-light
    transform: translateY(-1px)

  &:active
    transform: translateY(0)

.instructions
  color: $text-secondary
  text-align: center
  font-weight: 400
  font-size: 13px

  @include tablet
    text-align: right
    font-size: 14px

  @include desktop
    font-size: 15px

  @include mobile-only
    text-align: center
    font-size: 12px

// ===================================
// 地圖容器
// ===================================
.map-container
  position: relative
  overflow: hidden
  margin: 0 auto
  height: v-bind(height + 'px')
  border: 1px solid $border-light
  border-radius: $border-radius-md
  background: $bg-primary

  @include tablet
    border-width: 2px
    border-radius: $border-radius-lg

  @include desktop
    @include flex-center
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06)

// ===================================
// 縮放控制
// ===================================
.zoom-controls
  position: absolute
  top: $spacing-sm
  left: $spacing-sm
  z-index: 10
  display: flex
  flex-direction: column
  padding: $spacing-xs
  border: 1px solid $border-light
  border-radius: $border-radius-md
  background: rgba(255, 255, 255, 0.95)
  box-shadow: $shadow-light
  gap: $spacing-xs
  backdrop-filter: blur(8px)

  @include tablet
    top: $spacing-md
    left: $spacing-md
    padding: $spacing-sm
    gap: $spacing-sm

  @include desktop
    border-radius: $border-radius-lg
    box-shadow: $shadow-medium

.zoom-btn
  @include flex-center
  width: 32px
  height: 32px
  border: 1px solid $border-primary
  border-radius: $border-radius-sm
  background: $bg-card
  color: $text-primary
  font-weight: 600
  font-size: 16px
  cursor: pointer
  transition: all 0.2s ease-in-out

  @include tablet
    width: 36px
    height: 36px
    font-size: 18px

  @include desktop
    width: 40px
    height: 40px
    border-radius: $border-radius-md

  &:hover:not(:disabled)
    border-color: $accent-color-1
    background: rgba(212, 241, 239, 1)
    color: $accent-color-1
    transform: scale(1.05)

  &:active:not(:disabled)
    transform: scale(0.98)

  &:disabled
    border-color: $border-muted
    background: $bg-primary
    color: $text-light
    opacity: 0.6
    cursor: not-allowed

.zoom-level
  padding: $spacing-xs 0
  color: $text-muted
  text-align: center
  font-weight: 600
  font-size: 10px

  @include tablet
    font-size: 11px

// ===================================
// 狀態顯示
// ===================================
.map-status
  margin-bottom: $spacing-md
  padding: $spacing-md
  border-radius: $border-radius-md
  background: $bg-stats
  color: $text-secondary
  font-size: 14px

  @include tablet
    padding: $spacing-md
    font-size: 15px

  @include desktop
    border-radius: $border-radius-lg

.country-info-container
  min-height: 80px // 固定容器高度
  margin-top: $spacing-md

.country-info
  @include flex-center
  padding: 12px
  border: 1px solid rgba(56, 178, 172, 0.35)
  border-radius: $border-radius-md
  background: rgba(212, 241, 239, 1)
  color: $accent-color-1
  font-weight: bold
  font-size: 14px

  @include tablet
    min-height: 40px
    font-size: 15px

  @include desktop
    border-radius: $border-radius-lg

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

  .zoom-controls
    top: $spacing-xs
    left: $spacing-xs
    padding: 4px

  .zoom-btn
    width: 28px
    height: 28px
    font-size: 14px

  .map-status,
  .country-info
    padding: $spacing-sm
    font-size: 13px

// 大桌面版優化
@include large-desktop
  .instructions
    font-size: 16px

  .zoom-controls
    top: $spacing-lg
    left: $spacing-lg
</style>
