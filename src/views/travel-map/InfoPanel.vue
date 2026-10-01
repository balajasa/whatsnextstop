<template>
  <aside v-if="selectedPin" class="info-panel" :aria-label="`${selectedPin.displayName}的足跡`" @click.stop>
    <span class="info-panel__handle" aria-hidden="true"></span>

    <div class="info-panel__head">
      <div class="info-panel__country">
        <span class="info-panel__flag" aria-hidden="true">{{ getCountryFlag(selectedPin.country) }}</span>
        <h2 class="info-panel__name">{{ selectedPin.displayName }}</h2>
      </div>
      <button type="button" class="info-panel__close" aria-label="關閉" @click="handleClose">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="info-panel__body">
      <!-- 造訪次數：蓋章 -->
      <div class="visit">
        <div class="stamp" :class="getVisitLevel(selectedPin.visitCount)" aria-hidden="true">
          <span class="stamp__num">{{ selectedPin.visitCount }}</span>
          <span class="stamp__label">VISIT</span>
        </div>
        <div class="visit__text">
          <span class="caption">造訪次數</span>
          <span class="visit__line">已經蓋了 {{ selectedPin.visitCount }} 個章</span>
        </div>
      </div>

      <!-- 造訪城市 -->
      <div v-if="getCityList(selectedPin).length > 0" class="block">
        <span class="caption">造訪城市</span>
        <ul class="tags">
          <li v-for="city in getCityList(selectedPin)" :key="city" class="tag">{{ city }}</li>
        </ul>
      </div>

      <div class="divider" aria-hidden="true"></div>

      <!-- 旅遊時間 -->
      <div class="block">
        <span class="caption">旅遊時間</span>
        <ol class="timeline">
          <li v-for="(visit, index) in getVisitHistory(selectedPin)" :key="visit.date + visit.title"
            class="timeline__item" :class="{ 'is-recent': index === 0 }">
            <span class="timeline__dot" aria-hidden="true"></span>
            <span class="timeline__date">{{ visit.date }}</span>
            <span v-if="visit.title" class="timeline__title">{{ visit.title }}</span>
          </li>
        </ol>
      </div>
    </div>
  </aside>
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
const getVisitHistory = (pin: ProcessedPin): { date: string; title: string }[] => {
  if (!pin.trips) return []
  const sortedTrips = [...pin.trips].sort((a, b) => {
    const dateA = new Date(a.date.startDate)
    const dateB = new Date(b.date.startDate)
    return dateB.getTime() - dateA.getTime()
  })
  return sortedTrips.map(trip => ({
    date: `${trip.date.startDate} - ${trip.date.endDate}`,
    title: trip.title
  }))
}

// 關閉面板
const handleClose = () => {
  emit('close')
}
</script>

<style lang="sass" scoped>
// ===================================
// 面板：手機從底部滑上來，平板以上固定在地圖左側
// ===================================
.info-panel
  position: absolute
  left: 0
  right: 0
  bottom: 0
  z-index: $z-mapoverlay + 1
  display: flex
  flex-direction: column
  max-height: 78%
  padding: 10px 18px 18px
  border-radius: 22px 22px 0 0
  background: $nb-card
  box-shadow: 0 -10px 30px rgba(58, 51, 44, 0.18)
  color: $nb-ink
  animation: sheet-up 0.25s ease-out

  @include tablet
    top: 16px
    right: auto
    bottom: 16px
    left: 16px
    width: 340px
    max-height: none
    padding: 20px
    border: 1px solid $nb-line
    border-radius: 16px
    box-shadow: $nb-float-shadow
    animation: panel-in 0.2s ease-out

.info-panel__handle
  align-self: center
  flex-shrink: 0
  width: 44px
  height: 5px
  margin-bottom: 10px
  border-radius: 3px
  background: #D9CBB3
  @include tablet
    display: none

.info-panel__head
  display: flex
  flex-shrink: 0
  align-items: center
  justify-content: space-between
  gap: 12px
  margin-bottom: 14px

.info-panel__country
  display: flex
  align-items: center
  gap: 10px
  min-width: 0

.info-panel__flag
  font-size: 26px
  @include tablet
    font-size: 30px

.info-panel__name
  margin: 0
  font-family: $font-display
  font-size: 24px
  font-weight: 700
  @include tablet
    font-size: 26px

.info-panel__close
  display: flex
  flex-shrink: 0
  align-items: center
  justify-content: center
  width: 44px
  height: 44px
  border: none
  border-radius: 50%
  background: $nb-paper
  color: $nb-ink
  cursor: pointer

  &:hover
    background: $nb-line

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

.info-panel__body
  display: flex
  flex-direction: column
  gap: 16px
  overflow-y: auto
  overscroll-behavior: contain

// 造訪次數
.visit
  display: flex
  align-items: center
  gap: 16px
  padding: 14px
  border-radius: 12px
  background: $nb-paper

.stamp
  --stamp: #{$nb-accent}
  display: flex
  flex-shrink: 0
  flex-direction: column
  align-items: center
  justify-content: center
  width: 72px
  height: 72px
  border: 3px double var(--stamp)
  border-radius: 50%
  color: var(--stamp)
  transform: rotate(-8deg)

// 造訪等級：次數越多，章的顏色越深
.level-novice
  --stamp: #{$nb-accent}
.level-explorer
  --stamp: #{$nb-go}
.level-veteran
  --stamp: #3F6224
.level-master
  --stamp: #6B4A2E
.level-legend
  --stamp: #5B3F7A

.stamp__num
  font-size: 26px
  font-weight: 700
  line-height: 1

.stamp__label
  font-size: 10px
  font-weight: 700
  letter-spacing: 2px

.visit__text
  display: flex
  flex-direction: column
  gap: 2px

.visit__line
  font-size: 16px
  font-weight: 700

.caption
  font-size: 12px
  letter-spacing: 2px
  color: $nb-muted

.block
  display: flex
  flex-direction: column
  gap: 8px

.tags
  display: flex
  flex-wrap: wrap
  gap: 6px
  margin: 0
  padding: 0
  list-style: none

.tag
  padding: 5px 12px
  border-radius: 999px
  background: $nb-footprint-soft
  color: $nb-footprint-strong
  font-size: 13px
  font-weight: 500

.divider
  border-top: 2px dashed $nb-dash

// 時間軸
.timeline
  display: flex
  flex-direction: column
  gap: 12px
  margin: 0
  padding: 0
  list-style: none

.timeline__item
  display: grid
  grid-template-columns: 12px minmax(0, 1fr)
  column-gap: 12px
  row-gap: 2px
  align-items: center

.timeline__dot
  width: 12px
  height: 12px
  border-radius: 50%
  background: #D9CBB3

.timeline__date
  font-size: 15px
  font-weight: 500

.timeline__title
  grid-column: 2
  font-size: 13px
  color: $nb-muted

.timeline__item.is-recent
  .timeline__dot
    background: $nb-accent
  .timeline__date
    font-weight: 700

@keyframes sheet-up
  from
    transform: translateY(40px)
    opacity: 0

@keyframes panel-in
  from
    transform: translateX(-12px)
    opacity: 0

@media (prefers-reduced-motion: reduce)
  .info-panel
    animation: none
</style>
