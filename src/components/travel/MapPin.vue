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
import { getTravelsData } from '../../composables/usagi'
import type { TravelData, ProcessedPin, MapPinProps } from '../types/Itravel'

const { getCountryChineseName } = countryTranslation()
const { travels, loadTravels } = getTravelsData()

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
  travels.value.forEach(trip => {
    const country = trip.country.toLowerCase()
    if (!countryGroups[country]) {
      countryGroups[country] = []
    }
    countryGroups[country].push(trip)
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
      const cities = [...new Set(trips.map(trip => trip.city_tw || trip.city))].join('、')

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
watch(processedPins, (newPins) => {
  emit('pins-updated', newPins)
}, { deep: true })

// 圖釘樣式計算
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

  // 圖釘固定大小（考慮所有縮放因子）
  const pinScale = 1 / (props.currentScale * Math.min(containerScale.value.x, containerScale.value.y))

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
  loadTravels()
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
.travel-pins-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.travel-pin {
  width: 30px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;

  &:hover {
    transform: translate(-50%, -100%) scale(1.2) !important;

    .pin-svg {
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
    }
  }
}

.pin-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: filter 0.3s ease;
}

.pin-number {
  position: absolute;
  top: 8px;
  left: 50%;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  font-weight: bold;
  font-size: 11px;
  transform: translateX(-50%);
  pointer-events: none;
}
</style>