<template>
  <div class="countdown-section">
    <div class="countdown-header">
      <span class="flag">{{ travelData.countryFlag || '🏖️' }}</span>
      <span class="destination">{{ travelData.destination || '未知目的地' }} Adventure!</span>
    </div>

    <!-- 顯示完整倒數數字 -->
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

    <!-- 載入中 -->
    <div v-else class="countdown-loading">
      <div class="loading-text">計算中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { FrontendTravelConfig } from '../../../services/backendTravelService'

// ===================================
// Props
// ===================================
const props = defineProps<{
  travelData: FrontendTravelConfig
  index: number
}>()

// ===================================
// 響應式資料
// ===================================
const currentTime = ref(new Date())
let timer: number | null = null

// ===================================
// 計算屬性
// ===================================

// 計算這個旅行的倒數資料
const countdownData = computed(() => {
  if (!props.travelData.tripDate) return null
 const now = currentTime.value
  const trip = new Date(props.travelData.tripDate)
  const diffMs = trip.getTime() - now.getTime()

  // 如果已經過期，回傳零值
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

// ===================================
// 生命週期
// ===================================

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
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

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
// 載入狀態 (Mobile First)
// ===================================
.countdown-loading
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
@keyframes pulse
  0%, 100%
    opacity: 1
  50%
    opacity: 0.5
</style>