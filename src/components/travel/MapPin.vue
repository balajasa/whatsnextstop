<template>
  <div class="travel-pins-overlay">
    <!-- 圖釘們 -->
    <div
      v-for="pin in processedPins"
      :key="pin.country"
      class="travel-pin"
      :class="`visits-${Math.min(pin.visitCount, 3)}`"
      :style="pinStyle(pin)"
      @click="handlePinClick(pin)"
    >
      <!-- SVG 圖釘 -->
      <svg viewBox="0 0 30 40" class="pin-svg">
        <path
          d="M15 5 C8 5, 3 10, 3 16 C3 22, 15 35, 15 35 S27 22, 27 16 C27 10, 22 5, 15 5 Z"
          :fill="getPinColor(pin.visitCount)"
          stroke="#fff"
          stroke-width="2"
        />
        <circle cx="15" cy="16" r="6" :fill="getPinHighlight(pin.visitCount)" opacity="0.3" />
      </svg>

      <!-- 訪問次數數字 -->
      <div class="pin-number">{{ pin.visitCount }}</div>
    </div>

    <!-- 資訊面板 -->
    <div v-if="selectedPin" class="info-panel" :style="infoPanelStyle" @click.stop>
      <div class="panel-header">
        <span class="country-flag">{{ getCountryFlag(selectedPin.country) }}</span>
        <span class="country-name">{{ selectedPin.displayName }}</span>
        <button class="close-btn" @click="closePanel">×</button>
      </div>

      <div class="panel-divider">━━━━━━━━━━━━━━━━━━</div>

      <div class="panel-content">
        <div class="info-row"><strong>總訪問次數:</strong> {{ selectedPin.visitCount }}次</div>
        <div class="info-row"><strong>最近訪問:</strong> {{ selectedPin.latestVisit }}</div>
        <div class="info-row"><strong>訪問城市:</strong> {{ selectedPin.cities }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import * as d3 from 'd3'
import type { Ref } from 'vue'
import { countryTranslation } from '../../composables/countryTranslation'
import type { TravelData, ProcessedPin, MapPinProps } from '../types/Itravel'

// 使用國家翻譯 Composable
const { getCountryChineseName, getCountryFlag } = countryTranslation()

const props = defineProps<MapPinProps>()

// State
const selectedPin: Ref<ProcessedPin | null> = ref(null)
const infoPanelPosition: Ref<{ x: number; y: number }> = ref({ x: 0, y: 0 })
const travelData: Ref<TravelData[]> = ref([])

// API 相關函數
const fetchTravelData = async (): Promise<TravelData[]> => {
  try {
    const response = await fetch('/api/usagi/data/travels.json')

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    return []
  }
}

const loadTravelData = async () => {
  travelData.value = await fetchTravelData()
}

// 處理旅遊數據，聚合每個國家的信息
const processedPins = computed(() => {
  if (!travelData.value.length || !props.projection || !props.worldData) {
    return []
  }

  // 按國家分組
  const countryGroups: Record<string, TravelData[]> = {}
  travelData.value.forEach(trip => {
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
        centroid
      })
    }
  })

  return pins
})

// 計算圖釘樣式
const pinStyle = (pin: ProcessedPin): any => {
  // 應用地圖變換
  const transformedX = pin.x * props.currentScale + props.currentTransform.x
  const transformedY = pin.y * props.currentScale + props.currentTransform.y

  // 圖釘固定大小（反向縮放）
  const pinScale = 1 / props.currentScale

  return {
    position: 'absolute' as const,
    left: `${transformedX}px`,
    top: `${transformedY}px`,
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

// 處理圖釘點擊
const handlePinClick = (pin: ProcessedPin) => {
  selectedPin.value = pin

  // 計算資訊面板位置
  const transformedX = pin.x * props.currentScale + props.currentTransform.x
  const transformedY = pin.y * props.currentScale + props.currentTransform.y

  infoPanelPosition.value = {
    x: Math.max(20, Math.min(transformedX - 150, window.innerWidth - 320)),
    y: Math.max(20, transformedY - 200)
  }
}

// 關閉面板
const closePanel = () => {
  selectedPin.value = null
}

// 資訊面板樣式
const infoPanelStyle = computed((): any => ({
  position: 'absolute' as const,
  left: `${infoPanelPosition.value.x}px`,
  top: `${infoPanelPosition.value.y}px`,
  zIndex: 1000
}))

// 監聽地圖變化，重新計算面板位置
watch(
  () => [props.currentScale, props.currentTransform],
  () => {
    if (selectedPin.value) {
      // 重新計算面板位置
      const pin = selectedPin.value
      const transformedX = pin.x * props.currentScale + props.currentTransform.x
      const transformedY = pin.y * props.currentScale + props.currentTransform.y

      infoPanelPosition.value = {
        x: Math.max(20, Math.min(transformedX - 150, window.innerWidth - 320)),
        y: Math.max(20, transformedY - 200)
      }
    }
  },
  { deep: true }
)

// 載入旅遊資料（在組件創建時執行）
loadTravelData()
</script>

<style lang="scss" scoped>
.travel-pins-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.travel-pin {
  width: 30px;
  height: 40px;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;

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
  transform: translateX(-50%);
  color: white;
  font-weight: bold;
  font-size: 11px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  pointer-events: none;
}

.info-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid #e0e0e0;
  width: 300px;
  pointer-events: auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px 8px;

  .country-flag {
    font-size: 20px;
  }

  .country-name {
    flex: 1;
    font-weight: bold;
    font-size: 16px;
    color: #333;
  }

  .close-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: #f5f5f5;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #666;
    transition: all 0.2s ease;

    &:hover {
      background: #e0e0e0;
      color: #333;
    }
  }
}

.panel-divider {
  padding: 0 20px;
  color: #ddd;
  font-size: 12px;
  margin-bottom: 8px;
}

.panel-content {
  padding: 0 20px 20px;
}

.info-row {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.4;

  &:last-child {
    margin-bottom: 0;
  }

  strong {
    color: #555;
    margin-right: 4px;
  }
}

// 響應式設計
@media (max-width: 768px) {
  .info-panel {
    width: 280px;
    font-size: 13px;
  }

  .panel-header {
    padding: 12px 16px 6px;

    .country-name {
      font-size: 15px;
    }
  }

  .panel-content {
    padding: 0 16px 16px;
  }
}
</style>
