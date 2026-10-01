<template>
  <article class="spot-card">
    <div class="spot-card__top">
      <span class="cat-chip" :class="`cat-${getCategoryClass}`">{{ spot.category }}</span>
      <a v-if="formattedSpot.hasMap" :href="spot.googleMapUrl" target="_blank" rel="noopener" class="map-btn"
        :aria-label="`在 Google Maps 開啟${spot.name}`" @click="handleMapClick">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
        地圖
      </a>
    </div>

    <div class="spot-card__name">
      <h3 class="spot-name">{{ spot.name }}</h3>
      <span class="spot-location">{{ spot.region }}, {{ spot.country }}</span>
    </div>

    <!-- 介紹：太長先顯示兩行 -->
    <div v-if="spot.description" class="description">
      <p class="spot-description" :class="{ 'is-clamped': isLongDescription && !isExpanded }">
        {{ spot.description }}
      </p>
      <button v-if="isLongDescription" type="button" class="text-btn" :aria-expanded="isExpanded"
        @click="toggleDescription">
        {{ isExpanded ? '收合' : '展開' }}
      </button>
    </div>

    <div class="infos">
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
    </div>

    <div v-if="spot.notes" class="memo">{{ spot.notes }}</div>
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

const isLongDescription = computed(() => {
  // 更積極的折疊策略：超過40字元就折疊
  return props.spot.description && props.spot.description.length > 40
})

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

const toggleDescription = () => {
  isExpanded.value = !isExpanded.value
}

// GA4 Google Map 連結追蹤
const handleMapClick = () => {
  event('spot_map_clik', {
    interaction_type: 'google_map',
    action: 'open_map',
    spot_name: props.spot.name,
    spot_category: props.spot.category,
    trip_id: route.params.shortId as string || 'all',
    device: 'mobile'
  })
}
</script>

<style lang="sass" scoped>
.spot-card
  display: flex
  flex-direction: column
  gap: 12px
  padding: 16px
  border: 1px solid $nb-line
  border-radius: 16px
  background: $nb-card
  box-shadow: $nb-card-shadow
  color: $nb-ink
  @include tablet
    padding: 20px

.spot-card__top
  display: flex
  align-items: center
  justify-content: space-between

.cat-chip
  padding: 4px 12px
  border-radius: 999px
  font-size: 13px
  font-weight: 700

@include nb-category-chips

.map-btn
  display: inline-flex
  align-items: center
  gap: 4px
  min-height: 40px
  padding: 0 14px
  border: 1px solid $nb-line
  border-radius: 999px
  color: $nb-ink
  font-size: 13px
  text-decoration: none

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

.spot-card__name
  display: flex
  flex-direction: column
  gap: 4px

.spot-name
  margin: 0
  font-family: $font-display
  font-size: 20px
  font-weight: 700

.spot-location
  font-size: 13px
  color: $nb-muted

.description
  display: flex
  flex-direction: column
  align-items: flex-start
  gap: 4px

.spot-description
  margin: 0
  font-size: 14px
  line-height: 1.7
  white-space: pre-line

  &.is-clamped
    display: -webkit-box
    overflow: hidden
    -webkit-line-clamp: 2
    -webkit-box-orient: vertical

.text-btn
  min-height: 32px
  padding: 0
  border: none
  background: none
  color: $nb-accent
  font-size: 13px
  font-weight: 700
  cursor: pointer

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

.infos
  display: flex
  flex-wrap: wrap
  gap: 8px

.spot-info
  display: flex
  align-items: center
  gap: 6px
  padding: 6px 12px
  border-radius: 10px
  background: $nb-paper
  font-size: 13px

  svg
    color: $nb-muted

// 黃色橫線便條
.memo
  position: relative
  margin-top: 4px
  padding: 12px 14px 12px 16px
  border-radius: 4px
  background-color: #FFF8DC
  background-image: repeating-linear-gradient(0deg, transparent 0 23px, #F0E3B8 23px 24px)
  font-size: 14px
  line-height: 24px
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
