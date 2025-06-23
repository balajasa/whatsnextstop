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

    <!-- 重新設計的資訊面板 -->
    <div v-if="selectedPin" class="info-panel" :style="infoPanelStyle" @click.stop>
      <!-- 背景裝飾 -->
      <div class="panel-bg-decoration"></div>

      <!-- 頭部區域 -->
      <div class="panel-header">
        <div class="country-header">
          <div class="country-flag-large">{{ getCountryFlag(selectedPin.country) }}</div>
          <div class="country-info">
            <h3 class="country-name">{{ selectedPin.displayName }}</h3>
            <div class="country-subtitle">旅遊足跡</div>
          </div>
        </div>
        <button class="close-btn" @click="closePanel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 統計區域 -->
      <div class="stats-section">
        <div class="stat-card">
          <span class="stat-number">{{ selectedPin.visitCount }}</span>
          <span class="stat-label">次訪問</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ getVisitYears(selectedPin) }}</span>
          <span class="stat-label">年份</span>
        </div>
      </div>

      <!-- 詳細資訊區域 -->
      <div class="details-section">
        <div class="detail-item">
          <div class="detail-header">
            <span class="detail-icon">🏙️</span>
            <span class="detail-title">造訪城市</span>
          </div>
          <div class="detail-content city-tags">
            <span v-for="city in getCityList(selectedPin.cities)" :key="city" class="city-tag">
              {{ city }}
            </span>
          </div>
        </div>

        <div class="detail-item">
          <div class="detail-header">
            <span class="detail-icon">⏰</span>
            <span class="detail-title">最近訪問</span>
          </div>
          <div class="detail-content recent-visit">
            {{ selectedPin.latestVisit }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import type { Ref } from 'vue'
import { countryTranslation } from '../../composables/countryTranslation'
import { getTravelsData } from '../../composables/usagi'
import type { TravelData, ProcessedPin, MapPinProps } from '../types/Itravel'

const { getCountryChineseName, getCountryFlag } = countryTranslation()
const { travels, loadTravels } = getTravelsData()

const props = defineProps<MapPinProps>()

// State
const selectedPin: Ref<ProcessedPin | null> = ref(null)
const infoPanelPosition: Ref<{ x: number; y: number }> = ref({ x: 0, y: 0 })

// 獲取訪問年份跨度
const getVisitYears = (pin: ProcessedPin): string => {
  if (!travels.value.length) return '1'

  const countryTrips = travels.value.filter(trip =>
    trip.country.toLowerCase() === pin.country.toLowerCase()
  )

  const years = [...new Set(countryTrips.map(trip => trip.year))].sort()

  if (years.length === 1) return '1'
  if (years.length === 2) return '2'
  return `${years.length}`
}

// 獲取城市列表
const getCityList = (cities: string): string[] => {
  return cities.split('、').filter(city => city.trim())
}

// 處理旅遊數據，聚合每個國家的信息
const processedPins = computed(() => {
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
    y: Math.max(20, transformedY - 250)
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
        y: Math.max(20, transformedY - 250)
      }
    }
  },
  { deep: true }
)

// 組件掛載&載入旅遊資料
onMounted(() => {
  loadTravels()
})
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

// 重新設計的資訊面板樣式
.info-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 20px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.8);
  width: 260px;
  pointer-events: auto;
  animation: slideInPanel 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(20px);
}

.panel-bg-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 50%;
  transform: translate(40px, -40px);
  pointer-events: none;
}

@keyframes slideInPanel {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 20px 12px;
  position: relative;
  z-index: 2;
}

.country-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.country-flag-large {
  font-size: 28px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.country-info {
  flex: 1;
}

.country-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: -0.025em;
}

.country-subtitle {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
}

.stats-section {
  padding: 0 24px 16px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;

  &:not(:last-child) {
    border-bottom: 1px solid #f8fafc;
  }
}

.stat-label {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.stat-value {
  color: #1e293b;
  font-size: 14px;
  font-weight: 600;
}

.details-section {
  padding: 0 24px 16px;
}

.detail-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.detail-icon {
  font-size: 16px;
}

.detail-title {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.detail-content {
  color: #6b7280;
  line-height: 1.5;
}

.city-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.city-tag {
  display: inline-block;
  padding: 4px 10px;
  background: linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%);
  color: #4338ca;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(67, 56, 202, 0.1);
}

.recent-visit {
  font-weight: 500;
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
}

// 響應式設計
@media (max-width: 768px) {
  .info-panel {
    width: 280px;
  }

  .panel-header {
    padding: 20px 20px 12px;
  }

  .country-flag-large {
    font-size: 28px;
    padding: 6px;
  }

  .country-name {
    font-size: 18px;
  }

  .stats-section {
    padding: 0 20px 12px;
    margin-bottom: 12px;
  }

  .stat-item {
    padding: 6px 0;
  }

  .details-section {
    padding: 0 20px 12px;
  }
}
</style>