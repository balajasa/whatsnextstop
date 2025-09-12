<template>
  <div class="travel-countdown-container">
    <!-- 多筆旅行資料 -->
    <div v-if="futureTrips.length > 0" class="multiple-travels">
      <div v-for="(travel, index) in futureTrips.slice(0, 2)" :key="`travel-${index}`" class="travel-countdown-widget"
        :class="{ 'second-travel': index === 1 }">

        <!-- 元件標題 -->
        <div class="widget-title">
          NEXT STOP {{ travel.title || `${travel.destination || '未知目的地'} 倒數！` }}
        </div>

        <!-- 主要內容區域 -->
        <div class="widget-content">
          <!-- 倒數區域 -->
          <CountdownTimer :travel-data="travel" :index="index" />

          <!-- 天氣區域 -->
          <MultiCountryWeather :is-multi-country="isMultiCountry(travel)"
            :multi-country-data="getMultiCountryData(index)" :single-country-data="getSingleCountryData(index)"
            :show-weather="travel.options.showWeather" :is-loading="store.isLoading" />
        </div>
      </div>
    </div>

    <!-- 單筆旅行資料（fallback 兼容性） -->
    <div v-else class="travel-countdown-widget">
      <!-- 元件標題 -->
      <div class="widget-title">
        NEXT STOP {{ store.config.title || `${store.config.destination || '未知目的地'} 倒數！` }}
      </div>

      <!-- 主要內容區域 -->
      <div class="widget-content">
        <!-- 倒數區域 -->
        <CountdownTimer :travel-data="{ ...store.config, countries: [store.config.destination] }" :index="0" />

        <!-- 天氣區域 -->
        <MultiCountryWeather :is-multi-country="false" :single-country-data="store.weatherData || undefined"
          :show-weather="store.config.options.showWeather" :is-loading="store.isLoading" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useTravelCountdownStore } from '../../../stores/travelCountdownStore'
import CountdownTimer from './CountdownTimer.vue'
import MultiCountryWeather from './MultiCountryWeather.vue'
import type { FrontendTravelConfig } from '../../../services/next-travel/nextTravelService'
import type { MultiCountryWeatherData, WeatherData } from '../../../types/next-travel/travel-countdown'

// ===================================
// Store 和響應式資料
// ===================================
const store = useTravelCountdownStore()

// 定時器 ID
let countdownInterval: number | null = null

// 篩選未來的旅程
const futureTrips = computed(() => {
  const now = new Date()

  return store.travelConfigs.filter(travel => {
    if (!travel.tripDate) return false
    const tripDate = new Date(travel.tripDate)
    return tripDate > now
  })
})

// ===================================
// 方法
// ===================================

// 判斷是否為多國旅行
const isMultiCountry = (travel: FrontendTravelConfig): boolean => {
  return travel.countries && travel.countries.length > 1
}

// 取得多國天氣資料
const getMultiCountryData = (index: number) => {
  const weatherData = store.getTravelWeather(index)
  if (weatherData && typeof weatherData === 'object' && 'countries' in weatherData) {
    return (weatherData as MultiCountryWeatherData).countries
  }
  return undefined
}

// 取得單國天氣資料
const getSingleCountryData = (index: number): WeatherData | undefined => {
  const weatherData = store.getTravelWeather(index)
  if (weatherData) {
    // 如果是多國天氣，返回主要天氣
    if (typeof weatherData === 'object' && 'countries' in weatherData) {
      return (weatherData as MultiCountryWeatherData).primaryWeather
    }
    // 如果是單國天氣，直接返回
    return weatherData as WeatherData
  }

  // Fallback 到主要天氣資料（第一個旅程）
  if (index === 0) {
    return store.weatherData || undefined
  }

  return undefined
}

// 啟動倒數定時器
const startCountdownTimer = () => {
  // 清除舊的定時器
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }

  // 每秒更新倒數 - 使用第一筆旅行資料或 fallback 到靜態配置
  countdownInterval = setInterval(() => {
    const tripDate = store.hasMultipleTravels
      ? store.travelConfigs[0]?.tripDate
      : store.config.tripDate
    store.updateCountdown(tripDate)
  }, 1000)
}

// 停止倒數定時器
const stopCountdownTimer = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

// 自動化初始化元件
const initializeWidget = async () => {
  try {

    // 使用新的後台初始化邏輯
    await store.initializeFromBackend()

    // 啟動定時器
    startCountdownTimer()

  } catch (error) {
    console.error('TravelCountdown 元件初始化失敗:', error)
  }
}

// ===================================
// 生命週期
// ===================================

onMounted(() => {
  initializeWidget()
})

onUnmounted(() => {
  stopCountdownTimer()
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// 主容器
// ===================================
.travel-countdown-container
  width: 100%

// 多筆旅行容器
.multiple-travels
  display: flex
  flex-direction: column
  gap: 40px

  @include tablet
    gap: 60px

// 單一旅行卡片
.travel-countdown-widget
  border: 3px solid $primary-color
  border-radius: 20px
  padding: 12px
  background: #fffef7
  background-image: radial-gradient(circle at 30% 40%, rgba(255, 182, 193, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(173, 216, 230, 0.3) 0%, transparent 50%)
  box-shadow: 5px 5px 15px $shadow-medium
  position: relative
  transform: rotate(-0.3deg)
  height: 380px
  font-weight: 500
  color: $primary-color

  @include tablet
    padding: 15px
    height: auto
    min-height: 200px

  // 第二筆旅行的樣式變化
  &.second-travel
    transform: rotate(0.2deg)
    border-color: $accent-color-1
    background: #f8f9ff
    background-image: radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 40%)

    .widget-title
      background: $accent-color-1
      transform: rotate(-1deg)

  // 手繪風格裝飾
  &::before
    content: ''
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 11px)
    pointer-events: none
    border-radius: 17px

// ===================================
// 標題
// ===================================
.widget-title
  position: absolute
  top: -15px
  left: 20px
  background: $accent-color-2
  color: $text-white
  padding: 8px 14px
  border-radius: 15px
  font-size: 18px
  font-weight: 600
  transform: rotate(2deg)
  box-shadow: 2px 2px 8px $shadow-medium
  z-index: 10

// ===================================
// 主要內容 (7:3 佈局)
// ===================================
.widget-content
  display: grid
  grid-template-columns: 7fr 3fr
  gap: 25px
  height: 100%

  @include mobile-only
    grid-template-columns: 1fr
    gap: 15px
    height: 100%
</style>
