<template>
  <div class="countdown-section">
    <div class="countdown-header">
      <div class="destination-container">
        <span v-if="travelData.countries && travelData.countries.length > 1" class="destination">
          <span v-for="(country) in travelData.countries" :key="country" class="country-item">
            {{ getCountryFlag(country) }} {{ country }}
          </span>
        </span>
        <span v-else class="destination">
          <span class="flag">{{ travelData.countryFlag || '🏖️' }}</span>
          {{ travelData.destination || '未知目的地' }}
        </span>
      </div>
    </div>

    <div v-if="countdownData" class="countdown-numbers">
      <div class="number-group">
        <div v-for="(digit, digitIndex) in getCountdownDigits()" :key="`day-${digitIndex}`" class="countdown-digit"
          :class="`digit-color-${(digitIndex % 3) + 1}`">
          {{ digit }}
        </div>
        <div class="countdown-label">天</div>
      </div>

      <div v-if="travelData.options.showSeconds" class="time-details">
        <span class="time-item">{{ countdownData.hours || 0 }}時</span>
        <span class="time-item">{{ countdownData.minutes || 0 }}分</span>
        <span class="time-item">{{ countdownData.seconds || 0 }}秒</span>
      </div>
    </div>

    <div v-else class="countdown-loading">
      <div class="loading-text">計算中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { FrontendTravelConfig } from '../../../services/next-travel/nextTravelService'
import { countryTranslation } from '../../../translation/composables/countryTranslation'

const { getCountryFlag } = countryTranslation()

const props = defineProps<{
  travelData: FrontendTravelConfig
  index: number
}>()

const currentTime = ref(new Date())
let timer: number | null = null

// 計算這個旅行的倒數資料
const countdownData = computed(() => {
  if (!props.travelData.tripDate) return null
  const now = currentTime.value
  const trip = new Date(props.travelData.tripDate)
  const diffMs = trip.getTime() - now.getTime()

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0
    }
  }

  // 計算各時間單位
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
  const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  return {
    days,
    hours,
    minutes,
    seconds,
    totalDays
  }
})

// 分解天數為個別數字 (支援下劃線樣式)
const getCountdownDigits = () => {
  const days = countdownData.value?.days || 0
  return days.toString().split('')
}

onMounted(() => {
  // 每秒更新時間
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style lang="sass" scoped>
// ===================================
// 左側：倒數區域
// ===================================
.countdown-section
  @include flex-center
  flex-direction: column
  background: rgba(255, 255, 255, 0.5)
  border: 2px dashed $nb-dash-strong
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
  color: $nb-ink
  border-bottom: 2px dashed rgba($nb-go, 0.5)
  padding-bottom: 4px
  width: 100%
  .flag
    font-size: 18px
    margin-right: 6px
  .destination
    font-size: 14px
    @include tablet
      font-size: 16px

.destination-container
  width: 100%

.country-item
  margin-right: 20px
  &:last-child
    margin-right: 0
  @include tablet
    font-size: 18px
    margin-bottom: 12px
    padding-bottom: 6px
    .flag
      font-size: 20px

// 倒數數字 (下劃線分解)
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
  font-family: $font-display
  font-size: 28px
  font-weight: 700
  color: $nb-accent
  // 文楷粗體筆畫偏細，加描邊讓數字更有份量
  -webkit-text-stroke: 1px currentColor
  text-align: center
  border-bottom: 3px solid
  padding-bottom: 2px
  min-width: 28px
  transform: rotate(-0.8deg)
  &.digit-color-1
    border-bottom-color: $nb-go
  &.digit-color-2
    border-bottom-color: $nb-yellow
    transform: rotate(0.8deg)
  &.digit-color-3
    border-bottom-color: $nb-footprint
    transform: rotate(-0.4deg)
  @include tablet
    font-size: 34px
    min-width: 34px
    padding-bottom: 3px

.countdown-label
  font-size: 16px
  color: $nb-muted
  margin-left: 4px
  font-weight: 600
  @include tablet
    font-size: 20px
    margin-left: 6px

.time-details
  @include flex-center
  gap: 8px
  font-size: 12px
  color: $nb-muted
  @include tablet
    gap: 15px
    font-size: 16px

.time-item
  background: $nb-card
  padding: 4px 8px
  border-radius: 8px
  border: 1px solid $nb-line

// ===================================
// 載入狀態
// ===================================
.countdown-loading
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

// ===================================
// 動畫
// ===================================
@keyframes pulse
  0%, 100%
    opacity: 1
  50%
    opacity: 0.5
</style>
