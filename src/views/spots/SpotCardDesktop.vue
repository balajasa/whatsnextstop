<template>
  <article class="spot-row" :class="{ 'is-open': isExpanded }">
    <!-- 整行可點擊展開（地圖連結除外） -->
    <div class="spot-row__main" @click="hasDetail && toggleDescription()">
      <span class="cat-chip" :class="`cat-${getCategoryClass}`">{{ spot.category }}</span>

      <div class="spot-row__name">
        <h3 class="spot-name">{{ spot.name }}</h3>
        <span class="spot-location">{{ spot.region }}, {{ spot.country }}</span>
      </div>

      <span class="spot-info">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        <span class="visually-hidden">營業時間</span>{{ formattedSpot.displayHours }}
      </span>

      <span class="spot-info">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z" />
        </svg>
        <span class="visually-hidden">票價</span>{{ formattedSpot.displayPrice }}
      </span>

      <a v-if="formattedSpot.hasMap" :href="spot.googleMapUrl" target="_blank" rel="noopener" class="map-btn"
        :aria-label="`在 Google Maps 開啟${spot.name}`" @click.stop="handleMapClick">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
        地圖
      </a>
      <span v-else></span>

      <button v-if="hasDetail" type="button" class="expand-btn" :aria-expanded="isExpanded"
        :aria-controls="detailId" :aria-label="`${isExpanded ? '收合' : '展開'}${spot.name}的介紹`"
        @click.stop="toggleDescription">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <span v-else></span>
    </div>

    <!-- 展開：介紹 + 備註便條 -->
    <div v-if="hasDetail" v-show="isExpanded" :id="detailId" class="spot-row__detail">
      <p v-if="spot.description" class="spot-description">{{ spot.description }}</p>
      <div v-if="spot.notes" class="memo">{{ spot.notes }}</div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { event } from 'vue-gtag'
import { formatSpotForDisplay } from '../../services/spots/spotsService'
import type { SpotCardProps } from '../../types/spots/spots'

const route = useRoute()

// Props
const props = defineProps<SpotCardProps>()

// 響應式資料
const isExpanded = ref(false)

// 計算屬性
const formattedSpot = computed(() => formatSpotForDisplay(props.spot))

// 有介紹或備註才能展開
const hasDetail = computed(() => Boolean(props.spot.description || props.spot.notes))

const detailId = computed(() => `spot-detail-${props.spot.id ?? props.spot.name}`)

// 中文類別轉英文類別映射
const getCategoryClass = computed(() => {
  const categoryMap: Record<string, string> = {
    '景點': 'attraction',
    '美食': 'food',
    '住宿': 'hotel',
    '購物': 'shopping',
    '交通': 'transport'
  }
  return categoryMap[props.spot.category] || 'attraction'
})

// 方法
const toggleDescription = () => {
  isExpanded.value = !isExpanded.value
}

// GA4 map 連結追蹤
const handleMapClick = () => {
  event('spot_map_clik', {
    interaction_type: 'map',
    action: 'open_map',
    spot_name: props.spot.name,
    spot_category: props.spot.category,
    trip_id: route.params.shortId as string || 'all',
    device: 'desktop'
  })
}
</script>

<style lang="sass" scoped>
// 欄位寬度要跟 SpotsPage 的表頭一致
.spot-row
  --columns: 88px minmax(0, 1fr) 180px 150px 96px 44px
  border-bottom: 2px dashed $nb-dash

  &.is-open
    background: $nb-paper

.spot-row__main
  display: grid
  grid-template-columns: var(--columns)
  align-items: center
  gap: 16px
  padding: 14px 20px
  cursor: pointer

  &:hover
    background: rgba($nb-paper, 0.6)

.cat-chip
  justify-self: start
  padding: 4px 12px
  border-radius: 999px
  font-size: 13px
  font-weight: 700

@include nb-category-chips

.spot-row__name
  display: flex
  flex-direction: column
  gap: 2px
  min-width: 0

.spot-name
  margin: 0
  overflow: hidden
  font-family: $font-display
  font-size: 19px
  font-weight: 700
  color: $nb-ink
  text-overflow: ellipsis
  white-space: nowrap

.spot-location
  font-size: 13px
  color: $nb-muted

.spot-info
  display: flex
  align-items: center
  gap: 6px
  font-size: 14px
  color: $nb-ink

  svg
    flex-shrink: 0
    color: $nb-muted

.map-btn
  justify-self: start
  display: inline-flex
  align-items: center
  gap: 4px
  min-height: 36px
  padding: 0 12px
  border: 1px solid $nb-line
  border-radius: 999px
  background: $nb-card
  color: $nb-ink
  font-size: 13px
  text-decoration: none

  &:hover
    border-color: $nb-accent
    color: $nb-accent

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

.expand-btn
  display: flex
  align-items: center
  justify-content: center
  width: 40px
  height: 40px
  border: none
  border-radius: 50%
  background: transparent
  color: $nb-muted
  cursor: pointer

  svg
    transition: transform 0.2s ease

  &[aria-expanded="true"]
    background: $nb-card
    svg
      transform: rotate(180deg)

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

.spot-row__detail
  display: flex
  align-items: flex-start
  gap: 24px
  // 對齊名稱欄
  padding: 0 20px 20px 124px

.spot-description
  flex: 1
  margin: 0
  font-size: 14px
  line-height: 1.8
  color: $nb-ink
  white-space: pre-line

// 黃色橫線便條
.memo
  position: relative
  flex-shrink: 0
  width: 300px
  padding: 12px 14px 12px 16px
  border-radius: 4px
  background-color: #FFF8DC
  background-image: repeating-linear-gradient(0deg, transparent 0 23px, #F0E3B8 23px 24px)
  font-size: 14px
  line-height: 24px
  color: $nb-ink
  white-space: pre-line

  &::before
    content: ''
    position: absolute
    top: -8px
    left: 14px
    width: 56px
    height: 16px
    background: rgba(242, 201, 76, 0.6)
    transform: rotate(-4deg)

.visually-hidden
  position: absolute
  width: 1px
  height: 1px
  overflow: hidden
  clip: rect(0 0 0 0)
  white-space: nowrap
</style>
