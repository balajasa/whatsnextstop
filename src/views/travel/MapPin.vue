<template>
  <div class="travel-pins-overlay">
    <!-- 圖釘們 -->
    <div v-for="pin in processedPins" :key="pin.country" class="travel-pin"
      :class="`visits-${Math.min(pin.visitCount, 3)}`" :style="pinStyle(pin)" @click="handlePinClick(pin)">
      <!-- SVG 圖釘 -->
      <svg viewBox="0 0 30 40" class="pin-svg">
        <path d="M15 5 C8 5, 3 10, 3 16 C3 22, 15 35, 15 35 S27 22, 27 16 C27 10, 22 5, 15 5 Z"
          :fill="getPinColor(pin.visitCount)" stroke="#fff" stroke-width="2" />
        <circle cx="15" cy="16" r="6" :fill="getPinHighlight(pin.visitCount)" opacity="0.3" />
      </svg>

      <!-- 訪問次數數字 -->
      <div class="pin-number">{{ pin.visitCount }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as d3 from 'd3'
import type { Ref } from 'vue'
import { countryTranslation } from '../../composables/countryTranslation'
import { useTravelStore } from '../../stores/useTravelStore'
import { storeToRefs } from 'pinia'
import type { TravelData, ProcessedPin, MapPinProps } from '../../types/travel-map'

const { getCountryChineseName } = countryTranslation()
const travelStore = useTravelStore()
const { travels } = storeToRefs(travelStore)

const props = defineProps<MapPinProps>()

// Emits - 發出事件給父組件
const emit = defineEmits<{
  'pin-selected': [pin: ProcessedPin]
  'panel-close': []
  'pins-updated': [pins: ProcessedPin[]]
}>()

// 容器縮放比例計算
const containerScale: Ref<{ x: number; y: number }> = ref({ x: 1, y: 1 })

// SVG 偏移計算
const svgOffset: Ref<{ x: number; y: number }> = ref({ x: 0, y: 0 })

// 計算容器實際縮放比例和 SVG 偏移
const calculateContainerScale = () => {
  nextTick(() => {
    // 尋找地圖容器和 SVG 元素
    const mapContainer = document.querySelector('.map-container')
    const svgElement = document.querySelector('.world-map-svg')

    if (mapContainer && svgElement) {
      const containerRect = mapContainer.getBoundingClientRect()
      const svgRect = svgElement.getBoundingClientRect()

      // 計算實際渲染尺寸與設定尺寸的比例
      const svgWidth = parseFloat(svgElement.getAttribute('width') || '1000')
      const svgHeight = parseFloat(svgElement.getAttribute('height') || '600')

      containerScale.value = {
        x: svgRect.width / svgWidth,
        y: svgRect.height / svgHeight
      }

      // 計算 SVG 在容器中的偏移量（居中對齊造成的偏移）
      svgOffset.value = {
        x: svgRect.left - containerRect.left,
        y: svgRect.top - containerRect.top
      }
    }
  })
}

// 處理旅遊數據，聚合每個國家的信息
const processedPins = computed((): ProcessedPin[] => {
  if (!travels.value.length || !props.projection || !props.worldData) {
    return []
  }

  // 按國家分組
  const countryGroups: Record<string, TravelData[]> = {}

  travels.value.forEach((trip: TravelData) => {
    // 處理 country 陣列
    const countryList = Array.isArray(trip.country) ? trip.country : [trip.country]

    countryList.forEach((country: string) => {
      const countryKey = country.toLowerCase()
      if (!countryGroups[countryKey]) {
        countryGroups[countryKey] = []
      }
      // 為每個國家建立獨立的 trip 記錄
      countryGroups[countryKey].push({
        ...trip,
        country: [country]
      })
    })
  })

  const pins: ProcessedPin[] = []

  Object.entries(countryGroups).forEach(([country, trips]) => {
    // 直接嘗試找到對應的國家 feature
    const countryFeature = props.worldData.features.find((f: any) => {
      const featureName = (f.properties.name || f.properties.NAME || '').toLowerCase()
      return featureName === country.toLowerCase()
    })

    if (countryFeature) {
      // 計算國家中心點
      const centroid = d3.geoCentroid(countryFeature)
      const [x, y] = props.projection(centroid)

      // 處理數據
      const sortedTrips = trips.sort(
        (a, b) =>
          new Date(`${a.year}-${a.startDate}`).getTime() -
          new Date(`${b.year}-${b.startDate}`).getTime()
      )

      const latestTrip = sortedTrips[sortedTrips.length - 1]
      const cities = [...new Set(trips.map(trip => trip.cityTW || trip.city))].join('、')

      pins.push({
        country,
        displayName: getCountryChineseName(country),
        visitCount: trips.length,
        latestVisit: `${latestTrip.year}/${latestTrip.startDate} - ${latestTrip.endDate}`,
        cities,
        x,
        y,
        centroid,
        trips // 保存完整的旅遊數據供面板使用
      })
    }
  })

  return pins
})

// 監聽 processedPins 變化，通知父組件
watch(
  processedPins,
  newPins => {
    emit('pins-updated', newPins)
  },
  { deep: true }
)

// 圖釘樣式計算 - 修改為適度縮放
const pinStyle = (pin: ProcessedPin): any => {
  // 應用地圖內部變換
  const mapTransformedX = pin.x * props.currentScale + props.currentTransform.x
  const mapTransformedY = pin.y * props.currentScale + props.currentTransform.y

  // 應用容器縮放比例
  const scaledX = mapTransformedX * containerScale.value.x
  const scaledY = mapTransformedY * containerScale.value.y

  // 加上 SVG 在容器中的偏移量
  const finalX = scaledX + svgOffset.value.x
  const finalY = scaledY + svgOffset.value.y

  // 圖釘適度縮放：最小 0.8x，最大 1.5x
  // 當地圖縮放1x時，圖釘是1x
  // 當地圖縮放3x時，圖釘約是1.4x
  const pinScale = Math.max(0.8, Math.min(1.5, 0.7 + props.currentScale * 0.3))

  return {
    position: 'absolute' as const,
    left: `${finalX}px`,
    top: `${finalY}px`,
    transform: `translate(-50%, -100%) scale(${pinScale})`,
    transformOrigin: 'bottom center'
  }
}

// 獲取圖釘顏色
const getPinColor = (visitCount: number): string => {
  if (visitCount === 1) return '#FF4444'
  if (visitCount === 2) return '#FF8800'
  return '#44AA44'
}

// 獲取圖釘高光顏色
const getPinHighlight = (visitCount: number): string => {
  if (visitCount === 1) return '#FF6666'
  if (visitCount === 2) return '#FFAA44'
  return '#66CC66'
}

// 圖釘點擊處理 - 發出事件給父組件
const handlePinClick = (pin: ProcessedPin) => {
  emit('pin-selected', pin)
  console.log('選中圖釘:', pin.displayName, '訪問次數:', pin.visitCount)
}

// 處理視窗大小變化
const handleResize = () => {
  calculateContainerScale()
}

// 監聽容器縮放變化
watch(
  () => [props.projection, props.worldData],
  () => {
    if (props.projection && props.worldData) {
      calculateContainerScale()
    }
  },
  { deep: true }
)

// 組件掛載&載入旅遊資料
onMounted(() => {
  travelStore.loadTravels()
  calculateContainerScale()

  // 監聽視窗大小變化
  window.addEventListener('resize', handleResize)

  // 監聽方向變化（手機版）
  window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('orientationchange', handleResize)
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/mixins' as *;

// ===================================
// 圖釘覆蓋層 (Mobile First)
// ===================================
.travel-pins-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

// ===================================
// 旅遊圖釘主體
// ===================================
.travel-pin {
  width: 24px;
  height: 32px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  pointer-events: auto;
  // 確保最小點擊區域
  min-width: 20px;
  min-height: 28px;

  @include tablet {
    width: 28px;
    height: 36px;
    min-width: 24px;
    min-height: 32px;
  }

  @include desktop {
    width: 30px;
    height: 40px;
    min-width: 26px;
    min-height: 36px;
  }

  &:hover {
    transform: translate(-50%, -100%) scale(calc(var(--current-pin-scale, 1) * 1.15));
    z-index: 10;

    @include tablet {
      transform: translate(-50%, -100%) scale(calc(var(--current-pin-scale, 1) * 1.2));
    }

    @include desktop {
      transform: translate(-50%, -100%) scale(calc(var(--current-pin-scale, 1) * 1.25));
    }

    .pin-svg {
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));

      @include desktop {
        filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.5));
      }
    }
  }

  &:active {
    transform: translate(-50%, -100%) scale(calc(var(--current-pin-scale, 1) * 1.05));

    @include tablet {
      transform: translate(-50%, -100%) scale(calc(var(--current-pin-scale, 1) * 1.1));
    }
  }

  // 根據訪問次數的不同樣式
  &.visits-1 {
    .pin-svg path {
      fill: #ff4444;
    }
  }

  &.visits-2 {
    .pin-svg path {
      fill: #ff8800;
    }
  }

  &.visits-3 {
    .pin-svg path {
      fill: #44aa44;
    }
  }
}

// ===================================
// SVG 圖釘樣式
// ===================================
.pin-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
  transition: filter 0.3s ease-in-out;

  @include tablet {
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  }

  @include desktop {
    filter: drop-shadow(0 3px 10px rgba(0, 0, 0, 0.35));
  }

  path {
    stroke: $text-white;
    stroke-width: 1.5;
    transition: all 0.3s ease-in-out;

    @include tablet {
      stroke-width: 2;
    }
  }

  circle {
    transition: all 0.3s ease-in-out;
  }
}

// ===================================
// 圖釘數字顯示
// ===================================
.pin-number {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  color: $text-white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  font-weight: 700;
  font-size: 9px;
  pointer-events: none;
  line-height: 1;

  @include tablet {
    top: 7px;
    font-size: 10px;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
  }

  @include desktop {
    top: 8px;
    font-size: 11px;
    font-weight: 800;
  }
}

// ===================================
// 圖釘顏色方案
// ===================================

// 1次訪問 - 青綠色系
.visits-1 {
  .pin-svg {
    path {
      fill: #ff4444;
    }

    circle {
      fill: rgba(#ff4444, 0.8);
      opacity: 0.4;
    }
  }

  &:hover {
    .pin-svg {
      path {
        fill: #ff1744;
      }

      circle {
        fill: rgba(#ff4444, 0.6);
        opacity: 0.6;
      }
    }
  }
}

// 2次訪問 - 溫暖橘色系
.visits-2 {
  .pin-svg {
    path {
      fill: #ff8800;
    }

    circle {
      fill: rgba(#ff8800, 0.8);
      opacity: 0.4;
    }
  }

  &:hover {
    .pin-svg {
      path {
        fill: #ff6f00;
      }

      circle {
        fill: rgba(#ff8800, 0.6);
        opacity: 0.6;
      }
    }
  }
}

// 3次以上訪問 - 主青綠色系
.visits-3 {
  .pin-svg {
    path {
      fill: #44aa44;
    }

    circle {
      fill: rgba(#44aa44, 0.8);
      opacity: 0.4;
    }
  }

  &:hover {
    .pin-svg {
      path {
        fill: #388e3c;
      }

      circle {
        fill: rgba(#44aa44, 0.6);
        opacity: 0.6;
      }
    }
  }
}

// ===================================
// 響應式動畫優化
// ===================================

// 手機版優化 - 更大的觸控區域和簡化動畫
@include mobile-only {
  .travel-pin {
    width: 28px;
    height: 36px;
    min-width: 24px;
    min-height: 32px;

    &:hover {
      transform: translate(-50%, -100%) scale(calc(var(--current-pin-scale, 1) * 1.1));
    }

    &:active {
      transform: translate(-50%, -100%) scale(var(--current-pin-scale, 1));
    }
  }

  .pin-number {
    top: 8px;
    font-size: 10px;
    font-weight: 600;
  }

  .pin-svg {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));

    path {
      stroke-width: 1.5;
    }
  }
}

// 平板版優化
@include tablet-only {
  .travel-pin {
    &:hover {
      .pin-svg {
        filter: drop-shadow(0 5px 14px rgba(0, 0, 0, 0.45));
      }
    }
  }
}

// 桌面版增強效果
@include desktop {
  .travel-pin {
    transition: all 0.2s ease-in-out;

    &:hover {
      transition: all 0.15s ease-out;

      .pin-svg {
        transition: filter 0.15s ease-out;
      }
    }

    // 添加脈衝效果給高訪問次數的圖釘
    &.visits-3 {
      animation: pulse-glow 3s ease-in-out infinite;
    }
  }

  .pin-number {
    text-shadow:
      0 1px 4px rgba(0, 0, 0, 0.9),
      0 0 8px rgba(0, 0, 0, 0.3);
  }
}

// 大桌面版特殊效果
@include large-desktop {
  .travel-pin {
    &:hover {
      transform: translate(-50%, -100%) scale(calc(var(--current-pin-scale, 1) * 1.3));

      .pin-svg {
        filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.6));
      }
    }
  }
}

// ===================================
// 動畫定義
// ===================================

// 脈衝發光動畫 (僅桌面版)
@keyframes pulse-glow {

  0%,
  100% {
    filter: drop-shadow(0 3px 10px rgba(0, 0, 0, 0.35));
  }

  50% {
    filter: drop-shadow(0 3px 15px rgba(56, 178, 172, 0.4));
  }
}
</style>