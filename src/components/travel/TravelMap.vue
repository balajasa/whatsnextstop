<template>
  <div class="world-map-container">
    <div class="world-map" ref="container">
      <!-- 麵包屑 -->
      <BreadcrumbNav />

      <!-- 狀態顯示 -->
      <div class="map-status">狀態: {{ status }}</div>

      <!-- 控制區域 -->
      <div class="controls">
        <button @click="handleResetView" class="reset-btn">重置視圖</button>
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
        <WorldMap
          ref="worldMapRef"
          :width="width"
          :height="height"
          :min-scale="minScale"
          :max-scale="maxScale"
          @map-ready="onMapReady"
          @view-change="onViewChange"
          @country-hover="onCountryHover"
          @country-click="onCountryClick"
          @status-change="onStatusChange"
        />

        <!-- 旅遊圖釘組件 -->
        <MapPin
          v-if="mapProjection && mapWorldData"
          :projection="mapProjection"
          :world-data="mapWorldData"
          :current-transform="currentTransform"
          :current-scale="currentScale"
        />
      </div>

      <!-- 國家資訊顯示 -->
      <div class="country-info" v-if="hoveredCountry">目前懸停: {{ hoveredCountry }}</div>
      <div class="country-info" v-if="clickedCountry">最後點擊: {{ clickedCountry }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, readonly } from 'vue'
import type { Ref } from 'vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
import WorldMap from './WorldMap.vue'
import MapPin from './MapPin.vue'
import type { Transform } from '../types/Itravel'

// Refs
const container: Ref<HTMLElement | null> = ref(null)
const worldMapRef: Ref<InstanceType<typeof WorldMap> | null> = ref(null)

// State
const status: Ref<string> = ref('載入中...')
const hoveredCountry: Ref<string> = ref('')
const clickedCountry: Ref<string> = ref('')
const width: Ref<number> = ref(1000)
const height: Ref<number> = ref(600)
const currentScale: Ref<number> = ref(1)
const minScale: Ref<number> = ref(1)
const maxScale: Ref<number> = ref(3)

// 地圖數據
const mapProjection: Ref<any> = ref(null)
const mapWorldData: Ref<any> = ref(null)
const currentTransform: Ref<Transform> = ref({ x: 0, y: 0, scale: 1 })

// 響應式尺寸計算
const updateSize = (): void => {
  if (container.value) {
    const containerWidth = container.value.clientWidth - 40
    const isMobile = window.innerWidth <= 768

    if (isMobile) {
      width.value = Math.min(containerWidth, 400)
      height.value = Math.round((width.value * 9) / 16)
    } else {
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

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.world-map-container {
  max-width: 1000px;
  margin: 0 auto;
  background-color: $warm-bg-content;
  border-radius: 12px;
  box-shadow: $warm-shadow-medium;

  @media (max-width: 768px) {
    margin: 0 auto;
    max-width: 100%;
  }
}

.world-map {
  padding: 20px;
  max-width: 100%;
  font-family: Arial, sans-serif;

  @media (max-width: 768px) {
    padding: 15px;
  }
}

.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}

.reset-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0056b3;
  }
}

.instructions {
  color: #666;
  font-size: 14px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 12px;
  }
}

.map-container {
  position: relative;
  overflow: hidden;
  height: v-bind(height + 'px');
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f8f9fa;
  margin: 0 auto;

  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.zoom-controls {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  padding: 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  gap: 5px;

  @media (max-width: 768px) {
    top: 10px;
    left: 10px;
    padding: 6px;
  }
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  color: #333;
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }

  &:hover:not(:disabled) {
    border-color: #999;
    background: #f0f0f0;
  }

  &:disabled {
    border-color: #e0e0e0;
    background: #f5f5f5;
    color: #ccc;
    cursor: not-allowed;
  }
}

.zoom-level {
  padding: 2px 0;
  color: #666;
  text-align: center;
  font-weight: bold;
  font-size: 11px;
}

.map-status {
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 5px;
  background: #f0f0f0;
}

.country-info {
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
  background: #e8f5e8;
}
</style>
