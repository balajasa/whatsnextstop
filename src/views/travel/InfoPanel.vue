<template>
  <div v-if="selectedPin" class="info-panel" @click.stop>
    <div class="panel-header">
      <div class="country-section">
        <div class="country-flag">{{ getCountryFlag(selectedPin.country) }}</div>
        <div class="country-info">
          <h3 class="country-name">{{ selectedPin.displayName }}</h3>
        </div>
      </div>
      <button class="close-btn" @click="handleClose">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- 主要內容區域 -->
    <div class="panel-content">
      <div class="content-card places-card">
        <!-- 造訪次數 -->
        <div class="card-header">
          <span class="card-icon">🎖️</span>
          <div class="card-title">造訪次數</div>
        </div>

        <div class="visit-section">
          <div class="visit-badge" :class="getVisitLevel(selectedPin.visitCount)">
            <div class="visit-number">{{ selectedPin.visitCount }}</div>
            <div class="visit-text">VISIT</div>
          </div>
        </div>

        <div class="card-header">
          <span class="card-icon">📍</span>
          <div class="card-title">造訪地點</div>
        </div>

        <!-- 省/州/市/邦/地區 -->
        <div class="location-section" v-if="getStateList(selectedPin).length > 0">
          <div class="location-label">省/州/市/邦/地區</div>
          <div class="location-tags">
            <span v-for="state in getStateList(selectedPin)" :key="state" class="location-tag state-tag">
              {{ state }}
            </span>
          </div>
        </div>

        <!-- 城市 -->
        <div class="location-section" v-if="getCityList(selectedPin).length > 0">
          <div class="location-label">城市</div>
          <div class="location-tags">
            <span v-for="city in getCityList(selectedPin)" :key="city" class="location-tag city-tag">
              {{ city }}
            </span>
          </div>
        </div>
      </div>

      <!-- 旅遊時間卡片 -->
      <div class="content-card timeline-card">
        <div class="card-header">
          <span class="card-icon">🗓️</span>
          <div class="card-title">旅遊時間</div>
        </div>
        <div class="timeline-list">
          <div v-for="(visit, index) in getVisitHistory(selectedPin)" :key="visit" class="timeline-item"
            :class="{ recent: index === 0 }">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-date">{{ visit }}</div>
              <div v-if="index === 0" class="timeline-label">最近</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProcessedPin } from '../../types/travel-map'
import { countryTranslation } from '../../composables/countryTranslation'

const { getCountryFlag } = countryTranslation()

// Props 定義
interface InfoPanelProps {
  selectedPin: ProcessedPin | null
}

const { selectedPin } = defineProps<InfoPanelProps>()

// Emits 定義
const emit = defineEmits<{
  close: []
}>()

// 獲取造訪等級
const getVisitLevel = (count: number): string => {
  if (count >= 25) return 'level-legend'    // 傳奇 (紫色)
  if (count >= 16) return 'level-master'    // 大師 (棕色)
  if (count >= 8) return 'level-veteran'    // 老手 (綠色)
  if (count >= 4) return 'level-explorer'   // 探索者 (藍色)
  return 'level-novice'                     // 新手 (橘色)
}

// 獲取城市列表
const getCityList = (pin: ProcessedPin): string[] => {
  if (!pin.trips) return []
  const allCities = pin.trips.flatMap(trip => trip.cityTW || [])
  return [...new Set(allCities)]
}

// 獲取州省列表
const getStateList = (pin: ProcessedPin): string[] => {
  if (!pin.trips) return []
  const allStates = pin.trips.flatMap(trip => trip.stateTW || [])
  return [...new Set(allStates)]
}

// 獲取訪問歷史（按時間由近到遠）
const getVisitHistory = (pin: ProcessedPin): string[] => {
  if (!pin.trips) return []
  const sortedTrips = [...pin.trips].sort((a, b) => {
    const dateA = new Date(`${a.year}-${a.startDate}`)
    const dateB = new Date(`${b.year}-${b.startDate}`)
    return dateB.getTime() - dateA.getTime()
  })
  return sortedTrips.map(trip => `${trip.year}/${trip.startDate} - ${trip.endDate}`)
}

// 關閉面板
const handleClose = () => {
  emit('close')
}
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// 主容器
// ===================================
.info-panel
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  z-index: 990
  overflow: hidden
  // max-width: calc(100% - 16px)
  max-height: calc(100% - 40px)
  width: calc(100% - 80px)
  border-radius: 16px
  background: $warm-cream
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15)
  pointer-events: auto
  display: flex
  flex-direction: column

  @media (min-width: $tablet)
    max-width: calc(100% - 48px)
    max-height: calc(100% - 60px)
    width: 340px
    border-radius: 20px
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15)

  @media (min-width: $desktop)
    max-width: calc(100% - 80px)
    max-height: calc(100% - 80px)
    width: 380px
    border-radius: 24px
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15)

// ===================================
// 面板頭部
// ===================================
.panel-header
  display: flex
  align-items: flex-start
  justify-content: space-between
  padding: 12px 14px
  background: linear-gradient(135deg, rgba(234, 88, 12, 0.9) 0%, rgba(234, 88, 12, 0.8) 100%)
  color: white
  flex-shrink: 0

  // Tablet 樣式
  @media (min-width: $tablet)
    padding: 16px 20px

  // Desktop 樣式
  @media (min-width: $desktop)
    padding: 18px 24px

.country-section
  display: flex
  align-items: center
  gap: 12px
  flex: 1
  min-width: 0

  @media (min-width: $tablet)
    gap: 16px

.country-flag
  font-size: 28px
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))

  @media (min-width: $tablet)
    font-size: 34px

  @media (min-width: $desktop)
    font-size: 38px

.country-info
  flex: 1
  min-width: 0

.country-name
  margin-top: 4px
  font-weight: 700
  font-size: 18px
  line-height: 1.2
  color: white

  @media (min-width: $tablet)
    margin-top: 6px
    font-size: 22px

  @media (min-width: $desktop)
    font-size: 24px

.close-btn
  display: flex
  align-items: center
  justify-content: center
  flex-shrink: 0
  width: 36px
  height: 36px
  border: none
  border-radius: 50%
  background: rgba(255, 255, 255, 0.2)
  backdrop-filter: blur(10px)
  color: white
  cursor: pointer
  transition: all 0.2s ease

  @media (min-width: $tablet)
    width: 32px
    height: 32px

  @media (min-width: $desktop)
    width: 36px
    height: 36px

  &:hover
    background: rgba(255, 255, 255, 0.3)
    transform: scale(1.05)

  &:active
    transform: scale(0.95)

// ===================================
// 面板內容
// ===================================
.panel-content
  flex: 1
  min-height: 0
  overflow-y: auto
  padding: 12px

  @media (min-width: $tablet)
    padding: 16px

  @media (min-width: $desktop)
    padding: 20px

  // 滾動條樣式（所有設備通用）
  &::-webkit-scrollbar
    width: 6px

  &::-webkit-scrollbar-track
    background: #f1f5f9
    border-radius: 3px

  &::-webkit-scrollbar-thumb
    background: #cbd5e0
    border-radius: 3px

    &:hover
      background: #a0aec0

// ===================================
// 內容卡片
// ===================================
.content-card
  margin-bottom: 16px
  padding: 0 8px
  border-radius: 12px

  @media (min-width: $tablet)
    margin-bottom: 18px
    padding: 0 12px
    border-radius: 16px

  @media (min-width: $desktop)
    margin-bottom: 20px
    border-radius: 20px

  &:last-child
    margin-bottom: 0

.card-header
  display: flex
  align-items: center
  gap: 8px
  margin-bottom: 8px

  @media (min-width: $tablet)
    gap: 12px
    margin-bottom: 12px

  @media (min-width: $desktop)
    gap: 16px
    margin-bottom: 14px

.card-icon
  font-size: 18px

  @media (min-width: $tablet)
    font-size: 20px

  @media (min-width: $desktop)
    font-size: 24px

.card-title
  margin: 0
  font-weight: 600
  font-size: 18px
  color: $warm-text

  @media (min-width: $tablet)
    font-size: 20px


// ===================================
// 造訪次數 - 護照印章風格
// ===================================
.visit-section
  margin-bottom: 12px

  @include tablet
    margin-bottom: 16px

.visit-badge
  display: inline-block
  width: 75px
  height: 50px
  border: 2px dashed
  border-radius: 6px
  font-weight: bold
  transform: rotate(-3deg)
  transition: all 0.3s ease
  position: relative
  cursor: default
  background-position: center
  background-size: cover
  @include flex-center
  flex-direction: column

  @include tablet
    width: 80px
    height: 52px
    border-width: 2.5px

  @include desktop
    width: 85px
    height: 55px

.visit-number
  font-size: 16px
  font-weight: 900
  line-height: 1

  @include tablet
    font-size: 17px

  @include desktop
    font-size: 18px

.visit-text
  font-size: 8px
  font-weight: 600
  letter-spacing: 1px
  margin-top: 2px

  @include tablet
    font-size: 8.5px

  @include desktop
    font-size: 9px

// 不同等級的配色 (所有斷點通用)
.visit-badge
  // 新手 (1-3次) - 橘色
  &.level-novice
    border-color: #ea580c
    color: #ea580c
    background: radial-gradient(circle at 20% 80%, rgba(234, 88, 12, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(234, 88, 12, 0.1) 0%, transparent 50%), rgba(254, 243, 232, 0.8)

  // 探索者 (4-7次) - 藍色
  &.level-explorer
    border-color: #0ea5e9
    color: #0ea5e9
    background: radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.1) 0%, transparent 50%), rgba(240, 249, 255, 0.8)

  // 老手 (8-15次) - 綠色
  &.level-veteran
    border-color: #059669
    color: #059669
    background: radial-gradient(circle at 20% 80%, rgba(5, 150, 105, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.1) 0%, transparent 50%), rgba(236, 253, 245, 0.8)

  // 大師 (16-25次) - 棕色 + 復古效果
  &.level-master
    border-color: #7c2d12
    color: #7c2d12
    background: radial-gradient(circle at 20% 80%, rgba(124, 45, 18, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124, 45, 18, 0.1) 0%, transparent 50%), rgba(254, 252, 232, 0.8)

    // 復古磨損效果
    &::after
      content: ''
      position: absolute
      top: 0
      left: 0
      right: 0
      bottom: 0
      background: radial-gradient(circle at 80% 20%, rgba(0,0,0,0.05) 20%, transparent 21%), radial-gradient(circle at 20% 80%, rgba(0,0,0,0.03) 15%, transparent 16%), radial-gradient(circle at 60% 60%, rgba(0,0,0,0.02) 25%, transparent 26%)
      border-radius: 6px
      pointer-events: none

  // 傳奇 (25+次) - 紫色 + 光澤效果
  &.level-legend
    border-color: #7c3aed
    color: #7c3aed
    background: radial-gradient(circle at 20% 80%, rgba(124, 58, 237, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.1) 0%, transparent 50%), rgba(250, 245, 255, 0.8)
    overflow: hidden

    // 光澤動畫效果
    &::before
      content: ''
      position: absolute
      top: -2px
      left: -2px
      right: -2px
      bottom: -2px
      background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)
      z-index: -1
      border-radius: 8px
      animation: shimmer 3s ease-in-out infinite

// 光澤動畫
@keyframes shimmer
  0%, 100%
    transform: translateX(-100%)
  50%
    transform: translateX(100%)

// ===================================
// 地點標籤
// ===================================
.location-section
  margin-bottom: 12px

  @media (min-width: $tablet)
    margin-bottom: 16px

    &:last-child
      margin-bottom: 0

.location-label
  margin-bottom: 6px
  font-weight: 500
  font-size: 14px
  color: $warm-text-light
  text-transform: uppercase
  letter-spacing: 0.5px

  @media (min-width: $tablet)
    margin-bottom: 8px
    font-size: 14px

  @media (min-width: $desktop)
    font-size: 16px

.location-tags
  display: flex
  flex-wrap: wrap
  gap: 6px

  @media (min-width: $tablet)
    gap: 8px

  @media (min-width: $desktop)
    gap: 10px

.location-tag
  display: inline-block
  padding: 4px 6px
  border-radius: 8px
  font-weight: bold
  font-size: 14px
  cursor: default

  @media (min-width: $tablet)
    padding: 6px 8px
    border-radius: 12px
    font-size: 12px

  @media (min-width: $desktop)
    padding: 8px 12px
    border-radius: 14px
    font-size: 14px

.state-tag
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 107, 107, 0.2) 100%)
  color: rgba(255, 107, 107, 0.8)
  border: 1px solid rgba(255, 107, 107, 0.3)

.city-tag
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.15) 0%, rgba(52, 211, 153, 0.2) 100%)
  color: rgba(52, 211, 153, 0.8)
  border: 1px solid rgba(52, 211, 153, 0.3)

// ===================================
// 時間軸
// ===================================
.timeline-list
  position: relative
  padding-left: 6px
  height: 80px
  overflow-y: scroll

  @media (min-width: $tablet)
    height: 100px
    padding-left: 8px

.timeline-item
  position: relative
  display: flex
  align-items: center
  margin-bottom: 8px
  padding-left: 20px

  @media (min-width: $tablet)
    margin-bottom: 12px
    padding-left: 24px

  &:last-child
    margin-bottom: 0

  &.recent
    .timeline-dot
      background: $warm-coral
      box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.2)

    .timeline-date
      color: $warm-text
      font-weight: 600

.timeline-dot
  position: absolute
  left: 0
  width: 8px
  height: 8px
  border-radius: 50%
  background: $warm-text-light

  @media (min-width: $tablet)
    width: 10px
    height: 10px

  @media (min-width: $desktop)
    width: 12px
    height: 12px

.timeline-content
  display: flex
  align-items: center
  gap: 8px
  flex: 1

  @media (min-width: $tablet)
    gap: 12px

.timeline-date
  font-size: 14px
  color: $warm-text-light

  @media (min-width: $tablet)
    font-size: 16px

.timeline-label
  padding: 1px 6px
  border-radius: 6px
  background: rgba(234, 88, 12, 0.15)
  color: $warm-coral
  font-weight: 500
  font-size: 12px

  @media (min-width: $tablet)
    padding: 2px 8px
    border-radius: 8px
    font-size: 14px

</style>