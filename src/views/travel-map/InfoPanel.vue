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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProcessedPin, InfoPanelProps } from '../../types/travel-map/travel-map'
import { countryTranslation } from '../../translation/composables/countryTranslation'

const { getCountryFlag } = countryTranslation()

// Props 定義
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

// 獲取城市列表 - 適配 HistoryTrip 格式
const getCityList = (pin: ProcessedPin): string[] => {
  if (!pin.trips) return []
  const allCities = pin.trips.flatMap(trip =>
    trip.destinations.flatMap(dest => dest.cities)
  )
  return [...new Set(allCities)]
}


// 獲取訪問歷史（按時間由近到遠）- 適配 HistoryTrip 格式
const getVisitHistory = (pin: ProcessedPin): string[] => {
  if (!pin.trips) return []
  const sortedTrips = [...pin.trips].sort((a, b) => {
    const dateA = new Date(a.date.startDate)
    const dateB = new Date(b.date.startDate)
    return dateB.getTime() - dateA.getTime()
  })
  return sortedTrips.map(trip => `${trip.date.startDate} - ${trip.date.endDate}`)
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
// SASS 變數和 Mixins
// ===================================
$panel-shadow: 0 10px 25px rgba(0, 0, 0, 0.15)
$panel-gradient: linear-gradient(135deg, rgba(234, 88, 12, 0.9) 0%, rgba(234, 88, 12, 0.8) 100%)

// 響應式尺寸 mixin
@mixin responsive-size($mobile, $tablet: null, $desktop: null)
  font-size: $mobile
  @if $tablet
    @include tablet
      font-size: $tablet
  @if $desktop
    @include desktop
      font-size: $desktop

@mixin responsive-spacing($mobile, $tablet: null, $desktop: null)
  padding: $mobile
  @if $tablet
    @include tablet
      padding: $tablet
  @if $desktop
    @include desktop
      padding: $desktop

// 護照印章等級配置
$badge-colors: (
  'novice': #ea580c,
  'explorer': #0ea5e9,
  'veteran': #059669,
  'master': #7c2d12,
  'legend': #7c3aed
)

$badge-bgs: (
  'novice': rgba(254, 243, 232, 0.8),
  'explorer': rgba(240, 249, 255, 0.8),
  'veteran': rgba(236, 253, 245, 0.8),
  'master': rgba(254, 252, 232, 0.8),
  'legend': rgba(250, 245, 255, 0.8)
)

// ===================================
// 主容器
// ===================================
.info-panel
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  z-index: 1000
  overflow: hidden
  max-height: calc(100% - 40px)
  width: calc(100% - 80px)
  border-radius: 16px
  background: $warm-cream
  box-shadow: $panel-shadow
  pointer-events: auto
  display: flex
  flex-direction: column

  @include tablet
    max-width: calc(100% - 48px)
    max-height: calc(100% - 60px)
    width: 340px
    border-radius: 20px
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15)

  @include desktop
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
  background: $panel-gradient
  color: white
  flex-shrink: 0
  @include responsive-spacing(4px 14px, 8px 20px, 10px 24px)

.country-section
  display: flex
  align-items: center
  flex: 1
  min-width: 0
  gap: 12px
  @include tablet
    gap: 16px

.country-flag
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))
  @include responsive-size(28px, 34px, 38px)

.country-info
  flex: 1
  min-width: 0

.country-name
  margin-top: 4px
  font-weight: 700
  line-height: 1.2
  color: white
  @include responsive-size(18px, 22px, 24px)
  @include tablet
    margin-top: 6px

.close-btn
  @include flex-center
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

  @include tablet
    width: 32px
    height: 32px

  @include desktop
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
  @include responsive-spacing(12px, 16px, 20px)

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

  @include tablet
    margin-bottom: 18px
    padding: 0 12px
    border-radius: 16px

  @include desktop
    margin-bottom: 20px
    border-radius: 20px

  &:last-child
    margin-bottom: 0

.card-header
  display: flex
  align-items: center
  gap: 8px
  margin-bottom: 8px

  @include tablet
    gap: 12px
    margin-bottom: 12px

  @include desktop
    gap: 16px
    margin-bottom: 14px

.card-icon
  @include responsive-size(18px, 20px, 24px)

.card-title
  margin: 0
  font-weight: 600
  color: $warm-text
  @include responsive-size(18px, 20px)

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
  font-weight: 900
  line-height: 1
  @include responsive-size(16px, 17px, 18px)

.visit-text
  font-weight: 600
  letter-spacing: 1px
  margin-top: 2px
  @include responsive-size(8px, 8.5px, 9px)

// 護照印章等級樣式
@each $level, $color in $badge-colors
  @each $levelBg, $bg in $badge-bgs
    @if $level == $levelBg
      .visit-badge.level-#{$level}
        border-color: $color
        color: $color
        background: radial-gradient(circle at 20% 80%, rgba($color, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba($color, 0.1) 0%, transparent 50%), $bg

// 特殊效果
.visit-badge.level-master::after
  content: ''
  position: absolute
  inset: 0
  background: radial-gradient(circle at 80% 20%, rgba(0,0,0,0.05) 20%, transparent 21%), radial-gradient(circle at 20% 80%, rgba(0,0,0,0.03) 15%, transparent 16%)
  border-radius: 6px
  pointer-events: none

.visit-badge.level-legend
  overflow: hidden
  &::before
    content: ''
    position: absolute
    inset: -2px
    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)
    z-index: -1
    border-radius: 8px
    animation: shimmer 3s ease-in-out infinite

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
  @include tablet
    margin-bottom: 16px
    &:last-child
      margin-bottom: 0

.location-label
  margin-bottom: 6px
  font-weight: 500
  color: $warm-text-light
  text-transform: uppercase
  letter-spacing: 0.5px
  @include responsive-size(14px, 14px, 16px)
  @include tablet
    margin-bottom: 8px

.location-tags
  display: flex
  flex-wrap: wrap
  gap: 6px
  @include tablet
    gap: 8px
  @include desktop
    gap: 10px

.location-tag
  display: inline-block
  border-radius: 8px
  font-weight: bold
  cursor: default
  padding: 4px 6px
  font-size: 14px

  @include tablet
    padding: 6px 8px
    border-radius: 12px
    font-size: 12px

  @include desktop
    padding: 8px 12px
    border-radius: 14px
    font-size: 14px

.city-tag
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.15) 0%, rgba(52, 211, 153, 0.2) 100%)
  color: rgba(52, 211, 153, 0.8)
  border: 1px solid rgba(52, 211, 153, 0.3)

// ===================================
// 時間軸
// ===================================
.timeline-list
  position: relative
  height: 80px
  overflow-y: scroll
  padding-left: 6px
  @include tablet
    height: 100px
    padding-left: 8px

.timeline-item
  position: relative
  display: flex
  align-items: center
  margin-bottom: 8px
  padding-left: 20px

  @include tablet
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

  @include tablet
    width: 10px
    height: 10px

  @include desktop
    width: 12px
    height: 12px

.timeline-content
  display: flex
  align-items: center
  flex: 1
  gap: 8px
  @include tablet
    gap: 12px

.timeline-date
  color: $warm-text-light
  @include responsive-size(14px, 16px)

</style>
