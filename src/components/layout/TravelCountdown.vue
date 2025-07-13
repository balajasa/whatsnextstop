<template>
  <div class="travel-countdown-widget">
    <!-- 元件標題 -->
    <div class="widget-title">
      NEXT STOP {{ store.config.title || `${store.config.countryFlag || '🏖️'} ${store.config.destination || '未知目的地'}
      倒數！` }}
    </div>

    <!-- 主要內容區域 -->
    <div class="widget-content">
      <!-- 倒數區域 -->
      <div class="countdown-section">
        <div class="countdown-header">
          <span class="flag">{{ store.config.countryFlag || '🏖️' }}</span>
          <span class="destination">{{ store.config.destination || '未知目的地' }} Adventure!</span>
        </div>

        <!-- 倒數數字 -->
        <div v-if="store.hasCountdownData" class="countdown-numbers">
          <div class="number-group">
            <div v-for="(digit, index) in daysDigits" :key="`day-${index}`" class="countdown-digit"
              :class="`digit-color-${(index % 3) + 1}`">
              {{ digit }}
            </div>
            <div class="countdown-label">天</div>
          </div>

          <div v-if="store.config.options.showSeconds" class="time-details">
            <span class="time-item">{{ store.countdownData?.hours || 0 }}時</span>
            <span class="time-item">{{ store.countdownData?.minutes || 0 }}分</span>
            <span class="time-item">{{ store.countdownData?.seconds || 0 }}秒</span>
          </div>
        </div>

        <!-- 載入中 -->
        <div v-else class="countdown-loading">
          <div class="loading-text">計算中...</div>
        </div>

        <!-- 行李箱進度條 -->
        <!-- <div v-if="store.config.options.showProgress && store.hasCountdownData" class="luggage-progress">
          <div class="luggage-bar">
            <div class="luggage-track" :style="{ width: `${store.countdownData?.progress || 0}%` }"></div>
            <div class="luggage" :style="{ left: `${Math.max(0, (store.countdownData?.progress || 0) - 5)}%` }">
              🧳
            </div>
            <div class="progress-dots" :style="{ width: `${store.countdownData?.progress || 0}%` }"></div>
          </div>
          <div class="progress-text">
            倒數進度 {{ store.countdownData?.progress || 0 }}% 完成
          </div>
        </div> -->
      </div>

      <!-- 天氣區域 -->
      <div class="weather-section">
        <div v-if="store.config.options.showWeather && store.hasWeatherData" class="weather-content">
          <div class="weather-main">
            <div v-if="store.weatherData?.code" class="weather-icon"
              :style="{ backgroundImage: `url(${getWeatherIconUrl(store.weatherData.code)})` }"></div>
            <div class="weather-temp">{{ store.weatherData?.temperature || '--' }}°C</div>
          </div>
          <div class="weather-desc">{{ store.weatherData?.description }}</div>
          <div class="weather-tip">{{ getWeatherTip() }}</div>
        </div>

        <!-- 天氣載入中 -->
        <div v-else-if="store.config.options.showWeather && store.isLoading" class="weather-loading">
          <div class="loading-text">天氣載入中...</div>
        </div>

        <!-- 不顯示天氣時的佔位內容 -->
        <div v-else-if="!store.config.options.showWeather" class="weather-placeholder">
          <div class="placeholder-text">天氣資訊已關閉</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useTravelCountdownStore } from '../../stores/travelCountdownStore'

// ===================================
// Store 和響應式資料
// ===================================
const store = useTravelCountdownStore()

// 定時器 ID
let countdownInterval: number | null = null

// 圖片載入狀態追蹤
const loadedImages = ref<Set<string>>(new Set())
const failedImages = ref<Set<string>>(new Set())

// ===================================
// 計算屬性
// ===================================

// 分解天數為個別數字 (支援下劃線樣式)
const daysDigits = computed(() => {
  const days = store.countdownData?.days || 0
  return days.toString().split('')
})

// 根據天氣取得建議
const getWeatherTip = () => {
  if (!store.weatherData) return '🌤️ 查看天氣'

  const temp = store.weatherData.temperature
  const code = store.weatherData.code

  if (temp < 0) return '🧥 帶厚外套'
  if (temp < 10) return '🧥 記得保暖'
  if (code.includes('rain')) return '☂️ 準備雨具'
  if (code.includes('snow')) return '🎿 滑雪季節'
  if (temp > 30) return '🕶️ 防曬用品'

  return '🌤️ 天氣不錯'
}

// 檢查圖片是否存在並取得正確的圖片 URL
const getWeatherIconUrl = (code: string): string => {
  // 如果已經知道這個圖片載入失敗，直接返回 magic.png
  if (failedImages.value.has(code)) {
    return new URL(`../../assets/img/weather/magic.png`, import.meta.url).href
  }

  // 如果已經成功載入過，直接返回原始路徑
  if (loadedImages.value.has(code)) {
    return new URL(`../../assets/img/weather/${code}.png`, import.meta.url).href
  }

  // 第一次載入，嘗試載入原始圖片
  checkImageExists(code)
  return new URL(`../../assets/img/weather/${code}.png`, import.meta.url).href
}

// 檢查圖片是否存在
const checkImageExists = (code: string) => {
  const img = new Image()

  img.onload = () => {
    // 圖片載入成功
    loadedImages.value.add(code)
  }

  img.onerror = () => {
    // 圖片載入失敗，標記為失敗並觸發重新渲染
    failedImages.value.add(code)
    console.warn(`天氣圖片載入失敗: ${code}.png，使用 magic.png 替代`)
  }

  img.src = new URL(`../../assets/img/weather/${code}.png`, import.meta.url).href
}

// ===================================
// 方法
// ===================================

// 啟動倒數定時器
const startCountdownTimer = () => {
  // 清除舊的定時器
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }

  // 每秒更新倒數
  countdownInterval = setInterval(() => {
    store.updateCountdown(store.config.tripDate)
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
    // 使用新的自動化初始化
    await store.initializeFromConfig()

    // 啟動定時器
    startCountdownTimer()
  } catch (error) {
    console.error('❌ TravelCountdown 元件初始化失敗:', error)
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
// 主容器 (Mobile First)
// ===================================
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

// ===================================
// 左側：倒數區域 (Mobile First)
// ===================================
.countdown-section
  @include flex-center
  flex-direction: column
  background: rgba(255, 255, 255, 0.5)
  border: 2px dashed $primary-color
  border-radius: 15px
  padding: 8px
  position: relative

  @include tablet
    padding: 12px

.countdown-header
  text-align: center
  font-size: 16px
  font-weight: 600
  margin-bottom: 8px
  color: $primary-color
  border-bottom: 3px dashed $accent-color-1
  padding-bottom: 4px
  width: 100%

  .flag
    font-size: 18px
    margin-right: 6px

  .destination
    font-size: 14px

    @include tablet
      font-size: 16px

  @include tablet
    font-size: 18px
    margin-bottom: 12px
    padding-bottom: 6px

    .flag
      font-size: 20px

// 倒數數字 (下劃線分解) - Mobile First
.countdown-numbers
  @include flex-center
  flex-direction: column
  gap: 8px

  @include tablet
    gap: 10px

.number-group
  @include flex-center
  gap: 8px
  flex-wrap: wrap
  justify-content: center

  @include tablet
    gap: 10px

.countdown-digit
  font-size: 28px
  font-weight: 700
  color: $primary-color
  text-align: center
  border-bottom: 3px solid
  padding-bottom: 2px
  min-width: 28px
  transform: rotate(-0.8deg)

  &.digit-color-1
    border-bottom-color: $accent-color-1

  &.digit-color-2
    border-bottom-color: $accent-color-2
    transform: rotate(0.8deg)

  &.digit-color-3
    border-bottom-color: $primary-color
    transform: rotate(-0.4deg)

  @include tablet
    font-size: 34px
    min-width: 34px
    padding-bottom: 3px

.countdown-label
  font-size: 16px
  color: $text-secondary
  margin-left: 4px
  font-weight: 600

  @include tablet
    font-size: 20px
    margin-left: 6px

.time-details
  @include flex-center
  gap: 8px
  font-size: 12px
  color: $text-muted

  @include tablet
    gap: 15px
    font-size: 16px

.time-item
  background: rgba(255, 255, 255, 0.7)
  padding: 4px 8px
  border-radius: 8px
  border: 1px solid $border-light

// ===================================
// 行李箱進度條 (Mobile First)
// ===================================
.luggage-progress
  width: 100%
  margin-top: 8px

  @include tablet
    margin-top: 10px

.luggage-bar
  width: 100%
  height: 20px
  position: relative
  transform: rotate(0.5deg)
  border: 2px solid $primary-color
  border-radius: 15px
  background: $bg-primary
  overflow: hidden

  @include tablet
    height: 25px

.luggage-track
  position: absolute
  bottom: 0
  left: 0
  height: 100%
  background: linear-gradient(90deg, $accent-color-2, rgba(230, 168, 107, 0.8))
  opacity: 0.3
  transition: width 0.5s ease-in-out

.luggage
  position: absolute
  bottom: 5px
  font-size: 18px
  animation: rollLuggage 2.5s ease-in-out infinite
  transition: left 0.5s ease-in-out

.progress-dots
  position: absolute
  bottom: 2px
  left: 0
  height: 4px
  background-image: repeating-linear-gradient(90deg, $primary-color 0px, $primary-color 3px, transparent 3px, transparent 8px)
  animation: moveDots 1s linear infinite
  transition: width 0.5s ease-in-out

.progress-text
  font-size: 12px
  color: $primary-color
  text-align: center
  margin-top: 6px
  font-weight: 500

  @include tablet
    font-size: 16px
    margin-top: 8px

// ===================================
// 右側：天氣區域 (Mobile First)
// ===================================
.weather-section
  background: rgba(255, 255, 255, 0.7)
  border: 2px solid $primary-color
  border-radius: 15px
  padding: 6px
  transform: rotate(0.5deg)
  @include flex-center
  flex-direction: column

  @include tablet
    padding: 10px

.weather-content
  @include flex-center
  flex-direction: column
  gap: 4px
  height: 100%

  @include tablet
    gap: 8px

.weather-main
  @include flex-center
  flex-direction: column
  gap: 6px

  @include tablet
    gap: 8px

.weather-icon
  width: 60px
  height: 60px
  background-size: contain
  background-repeat: no-repeat
  background-position: center

  @include tablet
    width: 70px
    height: 70px

.weather-temp
  font-size: 18px
  font-weight: 700
  color: $primary-color

  @include tablet
    font-size: 22px

.weather-desc
  font-size: 14px
  color: $text-secondary
  text-align: center

  @include tablet
    font-size: 18px

.weather-tip
  font-size: 12px
  color: $text-muted
  text-align: center
  background: rgba(255, 255, 255, 0.7)
  padding: 6px 12px
  border-radius: 8px
  border: 1px dashed $border-primary
  margin-top: 4px

  @include tablet
    font-size: 16px
    padding: 8px 16px
    margin-top: 6px

.weather-placeholder
  @include flex-center
  flex-direction: column
  gap: 4px
  height: 100%

.placeholder-text
  font-size: 12px
  color: $text-muted
  text-align: center

  @include tablet
    font-size: 16px

// ===================================
// 載入狀態 (Mobile First)
// ===================================
.countdown-loading,
.weather-loading
  @include flex-center
  height: 60px

  @include tablet
    height: 100px

.loading-text
  font-size: 12px
  color: $text-muted
  animation: pulse 1.5s ease-in-out infinite

  @include tablet
    font-size: 16px

// ===================================
// 動畫
// ===================================
@keyframes rollLuggage
  0%, 100%
    transform: translateX(0) rotate(0deg)
  50%
    transform: translateX(-5px) rotate(5deg)

@keyframes moveDots
  0%
    background-position-x: 0
  100%
    background-position-x: 8px

@keyframes pulse
  0%, 100%
    opacity: 1
  50%
    opacity: 0.5
</style>