<template>
  <div class="weather-section">
    <!-- 多國天氣：有箭頭切換 -->
    <div v-if="isMultiCountry" class="weather-section-with-navigation">
      <!-- 左箭頭 -->
      <button @click="previousCountry" :disabled="currentCountryIndex === 0" class="nav-button nav-left"
        v-if="multiCountryData && multiCountryData.length > 1">
        ‹
      </button>

      <!-- 中間天氣內容 -->
      <div class="multi-country-weather">
        <div v-if="currentCountryWeather" class="current-country-weather">
          <!-- 國家名稱 -->
          <div class="country-name">{{ currentCountryWeather.country }}</div>
          <!-- 天氣圖標 -->
          <div v-if="currentCountryWeather.code" class="weather-icon"
            :style="{ backgroundImage: `url(${getWeatherIconUrl(currentCountryWeather.code)})` }">
          </div>
          <!-- 溫度 -->
          <div class="weather-temp">{{ currentCountryWeather.temperature || '--' }}°C</div>
          <!-- 天氣描述 -->
          <div class="weather-desc">{{ currentCountryWeather.description }}</div>
          <!-- 天氣建議 -->
          <div class="weather-tip">{{ getWeatherTip(currentCountryWeather) }}</div>
        </div>
      </div>

      <!-- 右箭頭 -->
      <button @click="nextCountry" :disabled="currentCountryIndex >= (multiCountryData?.length || 0) - 1"
        class="nav-button nav-right" v-if="multiCountryData && multiCountryData.length > 1">
        ›
      </button>
    </div>

    <!-- 單國天氣：直接顯示天氣，不顯示國家名 -->
    <div v-else-if="singleCountryData" class="single-country-weather">
      <div v-if="singleCountryData.code" class="weather-icon"
        :style="{ backgroundImage: `url(${getWeatherIconUrl(singleCountryData.code)})` }"></div>
      <div class="weather-temp">{{ singleCountryData.temperature || '--' }}°C</div>
      <div class="weather-desc">{{ singleCountryData.description }}</div>
      <div class="weather-tip">{{ getWeatherTip(singleCountryData) }}</div>
    </div>

    <!-- 天氣載入中 -->
    <div v-else-if="isLoading" class="weather-loading">
      <div class="loading-text">天氣載入中...</div>
    </div>

    <!-- 不顯示天氣時的佔位內容 -->
    <div v-else-if="!showWeather" class="weather-placeholder">
      <div class="placeholder-text">天氣資訊已關閉</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MultiCountryWeatherData, WeatherData } from '../../../types/next-travel/travel-countdown'

// ===================================
// Props
// ===================================
const props = defineProps<{
  isMultiCountry: boolean
  multiCountryData?: MultiCountryWeatherData['countries']
  singleCountryData?: WeatherData
  showWeather: boolean
  isLoading: boolean
}>()

// ===================================
// 響應式資料
// ===================================

// 當前顯示的國家索引
const currentCountryIndex = ref(0)

// 圖片載入狀態追蹤
const loadedImages = ref<Set<string>>(new Set())
const failedImages = ref<Set<string>>(new Set())

// ===================================
// 計算屬性
// ===================================

// 取得當前顯示的國家天氣
const currentCountryWeather = computed(() => {
  if (!props.multiCountryData || props.multiCountryData.length === 0) return null
  return props.multiCountryData[currentCountryIndex.value] || props.multiCountryData[0]
})

// ===================================
// 方法
// ===================================

// 切換到上一個國家
const previousCountry = () => {
  if (currentCountryIndex.value > 0) {
    currentCountryIndex.value--
  }
}

// 切換到下一個國家
const nextCountry = () => {
  const maxIndex = (props.multiCountryData?.length || 0) - 1
  if (currentCountryIndex.value < maxIndex) {
    currentCountryIndex.value++
  }
}

// 根據天氣取得建議
const getWeatherTip = (weather: WeatherData | null | undefined) => {
  if (!weather) return '🌤️ 查看天氣'

  const temp = weather.temperature
  const code = weather.code

  if (temp < 0) return '🧥 帶厚外套'
  if (temp < 10) return '🧥 記得保暖'
  if (code && code.includes('rain')) return '☂️ 準備雨具'
  if (code && code.includes('snow')) return '🎿 滑雪季節'
  if (temp > 30) return '🕶️ 防曬用品'

  return '🌤️ 天氣不錯'
}

// 檢查圖片是否存在並取得正確的圖片 URL
const getWeatherIconUrl = (code: string): string => {
  // 如果已經知道這個圖片載入失敗，直接返回 magic.png
  if (failedImages.value.has(code)) {
    return new URL(`../../../assets/img/weather/magic.png`, import.meta.url).href
  }

  // 如果已經成功載入過，直接返回原始路徑
  if (loadedImages.value.has(code)) {
    return new URL(`../../../assets/img/weather/${code}.png`, import.meta.url).href
  }

  // 第一次載入，嘗試載入原始圖片
  checkImageExists(code)
  return new URL(`../../../assets/img/weather/${code}.png`, import.meta.url).href
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

  img.src = new URL(`../../../assets/img/weather/${code}.png`, import.meta.url).href
}
</script>

<style lang="sass" scoped>
// ===================================
// 右側：天氣區域
// ===================================
.weather-section
  background: $nb-paper
  border: 2px solid $nb-dash
  border-radius: 15px
  padding: 4px
  transform: rotate(0.5deg)
  @include flex-center
  flex-direction: column
  height: 100%
  max-height: 100%
  overflow: hidden
  @include mobile-only
    padding: 4px
    border-radius: 12px
  @include tablet
    padding: 10px

// ===================================
// 多國天氣按鈕切換樣式
// ===================================
// 天氣區域有導航按鈕時的布局
.weather-section-with-navigation
  display: grid
  grid-template-columns: auto 1fr auto
  align-items: center
  gap: 4px
  height: 100%
  width: 100%
  @include tablet
    gap: 6px

// 多國天氣內容區域
.multi-country-weather
  @include flex-center
  flex-direction: column
  gap: 2px
  height: 100%
  padding: 4px
  transform: rotate(0.5deg)
  overflow: hidden
  @include mobile-only
    gap: 1px
    padding: 2px
  @include tablet
    gap: 4px
    padding: 2px

// 導航按鈕（左右箭頭）
.nav-button
  width: 20px
  height: 20px
  border: 1px solid rgba(0, 0, 0, 0.2)
  border-radius: 50%
  background: rgba(255, 255, 255, 0.8)
  color: rgba(0, 0, 0, 0.5)
  font-size: 12px
  font-weight: 400
  cursor: pointer
  @include flex-center
  transition: all 0.2s ease
  flex-shrink: 0 // 防止按鈕被壓縮
  &:hover:not(:disabled)
    background: rgba(255, 255, 255, 0.95)
    color: rgba(0, 0, 0, 0.7)
    border-color: rgba(0, 0, 0, 0.3)
    transform: scale(1.05)
  &:disabled
    opacity: 0.2
    cursor: not-allowed
  @include tablet
    width: 22px
    height: 22px
    font-size: 14px

// 左箭頭特定樣式
.nav-left
  justify-self: start
  align-self: center

// 右箭頭特定樣式
.nav-right
  justify-self: end
  align-self: center

// 當前國家天氣顯示
.current-country-weather
  @include flex-center
  flex-direction: column
  gap: 4px
  width: 100%
  text-align: center
  height: 100%
  @include tablet
    gap: 6px
  .country-name
    font-size: 14px
    font-weight: 600
    color: $nb-ink
    margin-bottom: 2px
    @include tablet
      font-size: 16px
      margin-bottom: 4px
  .weather-icon
    width: 40px
    height: 40px
    background-size: contain
    background-repeat: no-repeat
    background-position: center
    margin: 2px 0
    @include tablet
      width: 60px
      height: 60px
      margin: 4px 0
  .weather-temp
    font-size: 16px
    font-weight: 700
    color: $nb-ink
    margin: 2px 0
    @include tablet
      font-size: 18px
      margin: 4px 0
  .weather-desc
    font-size: 12px
    color: $nb-muted
    margin: 1px 0
    @include tablet
      font-size: 14px
      margin: 2px 0
  .weather-tip
    font-size: 10px
    color: $nb-muted
    background: $nb-card
    padding: 4px 8px
    border-radius: 6px
    border: 1px dashed $nb-dash
    margin-top: 2px
    @include tablet
      font-size: 12px
      padding: 6px 10px
      margin-top: 4px

// ===================================
// 單國天氣樣式
// ===================================
.single-country-weather
  @include flex-center
  flex-direction: column
  gap: 4px
  height: 100%
  text-align: center
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
    color: $nb-ink
    @include tablet
      font-size: 22px
  .weather-desc
    font-size: 14px
    color: $nb-muted
    text-align: center
    @include tablet
      font-size: 18px
  .weather-tip
    font-size: 12px
    color: $nb-muted
    text-align: center
    background: $nb-card
    padding: 6px 12px
    border-radius: 8px
    border: 1px dashed $nb-dash
    margin-top: 4px
    @include tablet
      font-size: 16px
      padding: 8px 16px
      margin-top: 6px

// ===================================
// 載入和佔位樣式
// ===================================
.weather-loading
  @include flex-center
  height: 60px
  @include tablet
    height: 100px

.loading-text
  font-size: 12px
  color: $nb-muted
  animation: pulse 1.5s ease-in-out infinite
  @include tablet
    font-size: 16px

.weather-placeholder
  @include flex-center
  flex-direction: column
  gap: 4px
  height: 100%

.placeholder-text
  font-size: 12px
  color: $nb-muted
  text-align: center
  @include tablet
    font-size: 16px

// ===================================
// 動畫
// ===================================
@keyframes pulse
  0%, 100%
    opacity: 1
  50%
    opacity: 0.5
</style>
