<template>
  <div class="spot-card-mobile">
    <!-- 卡片頂部漸層條 -->
    <div class="card-accent" :class="`accent-${spot.category}`"></div>

    <!-- 標題列 -->
    <div class="title-row">
      <h3 class="spot-name">{{ spot.name }}</h3>
      <span class="category-badge" :class="`category-${getCategoryClass}`">
        {{ spot.category }}
      </span>
    </div>

    <!-- 位置列 -->
    <div class="location-row">
      <div class="location-info">
        <div class="location-icon"></div>
        <span class="location-text">{{ spot.region }}, {{ spot.country }}</span>
      </div>
      <a v-if="formattedSpot.hasMap" :href="spot.googleMapUrl" target="_blank" class="map-link" @click.stop>
      </a>
    </div>

    <!-- 描述區域 -->
    <div class="description-section" v-if="spot.description">
      <p class="description-text" :class="{ 'expanded': isExpanded }">
        {{ spot.description }}
      </p>
      <button v-if="isLongDescription" @click="toggleDescription" class="expand-btn">
        {{ isExpanded ? '收合' : '展開' }}
      </button>
    </div>

    <!-- 詳細資訊網格 -->
    <div class="details-grid">
      <div class="detail-card time-card">
        <div class="detail-icon time-icon"></div>
        <div class="detail-content">
          <div class="detail-label">營業時間</div>
          <div class="detail-value">{{ formattedSpot.displayHours }}</div>
        </div>
      </div>

      <div class="detail-card price-card">
        <div class="detail-icon price-icon"></div>
        <div class="detail-content">
          <div class="detail-label">票價</div>
          <div class="detail-value">{{ formattedSpot.displayPrice }}</div>
        </div>
      </div>
    </div>

    <!-- 備註區域 -->
    <div v-if="spot.notes" class="notes-section">
      <div class="notes-icon"></div>
      <div class="notes-text">{{ spot.notes }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatSpotForDisplay } from '../../services/spotsService'
import type { SpotCardProps } from '../../types/spots'

// Props
const props = defineProps<SpotCardProps>()

// 響應式資料
const isExpanded = ref(false)

// 計算屬性
const formattedSpot = computed(() => formatSpotForDisplay(props.spot))

const isLongDescription = computed(() => {
  return props.spot.description && props.spot.description.length > 100
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

// 方法
const toggleDescription = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.spot-card-mobile
  background: $spot-bg
  border-radius: $border-radius-lg
  padding: $spacing-lg
  margin-bottom: $spacing-md
  border: 1px solid $spot-border
  box-shadow: 0 4px 20px rgba(23, 24, 75, 0.1)
  transition: all 0.3s ease

// 移除頂部裝飾條
.card-accent
  display: none

// 標題列
.title-row
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: $spacing-md

.spot-name
  font-size: 18px
  font-weight: 600
  color: $spot-text-primary
  margin: 0
  line-height: 1.3
  flex: 1
  padding-right: $spacing-md

.category-badge
  padding: 4px 8px
  border-radius: $border-radius-sm
  font-size: 12px
  font-weight: 600
  text-align: center
  text-transform: uppercase
  letter-spacing: 0.5px
  color: white
  display: flex
  align-items: center
  gap: 4px

  &::before
    content: ''
    width: 14px
    height: 14px
    background-size: 14px 14px
    background-repeat: no-repeat
    background-position: center

// 浮世繪風類別標籤
.category-attraction
  background: $category-attraction

  &::before
    background-image: url('@/assets/img/icon/category/monument.png')

.category-food
  background: $category-food

  &::before
    background-image: url('@/assets/img/icon/category/food.png')

.category-hotel
  background: $category-hotel

  &::before
    background-image: url('@/assets/img/icon/category/hotel.png')

.category-shopping
  background: $category-shopping

  &::before
    background-image: url('@/assets/img/icon/category/shopping.png')

.category-transport
  background: $category-transport

  &::before
    background-image: url('@/assets/img/icon/category/bus.png')

// 位置列
.location-row
  display: flex
  justify-content: space-between
  align-items: center
  margin-bottom: $spacing-md
  padding-bottom: $spacing-sm
  border-bottom: 1px solid $border-muted

.location-info
  display: flex
  align-items: center
  flex: 1

.location-icon
  width: 14px
  height: 14px
  background-image: url('@/assets/img/icon/color/pin.png')
  background-size: 14px 14px
  background-repeat: no-repeat
  background-position: center
  margin-right: $spacing-xs
  flex-shrink: 0

.location-text
  font-size: 14px
  color: rgba($spot-text-primary, 0.7)

.map-link
  display: flex
  align-items: center
  justify-content: center
  width: 32px
  height: 32px
  border-radius: $border-radius-sm
  background-color: $bg-primary
  background-image: url('@/assets/img/icon/color/maps.png')
  background-size: 16px 16px
  background-repeat: no-repeat
  background-position: center
  border: 1px solid $border-light
  text-decoration: none
  transition: all 0.2s ease

// 描述區域
.description-section
  margin-bottom: $spacing-md

.description-text
  font-size: 14px
  color: rgba($spot-text-primary, 0.8)
  line-height: 1.6
  margin: 0 0 $spacing-xs 0
  display: -webkit-box
  -webkit-line-clamp: 3
  -webkit-box-orient: vertical
  overflow: hidden

  &.expanded
    display: block
    -webkit-line-clamp: unset
    overflow: visible

.expand-btn
  background: none
  border: none
  color: $spot-text-primary
  font-size: 14px
  font-weight: 500
  cursor: pointer
  padding: 0
  text-decoration: underline

// 詳細資訊網格
.details-grid
  display: grid
  grid-template-columns: 1fr 1fr
  gap: $spacing-sm
  margin-bottom: $spacing-md

.detail-card
  border-radius: $border-radius-sm
  padding: $spacing-sm
  display: flex
  align-items: center
  gap: $spacing-sm
  transition: all 0.2s ease

// 浮世繪風配色
.time-card
  background: $spot-time-card
  border: 1px solid rgba(250, 218, 221, 0.6)

.price-card
  background: $spot-price-card
  border: 1px solid rgba(184, 210, 0, 0.4)

.detail-icon
  width: 16px
  height: 16px
  background-size: 16px 16px
  background-repeat: no-repeat
  background-position: center
  flex-shrink: 0

.time-icon
  background-image: url('@/assets/img/icon/color/clock.png')

.price-icon
  background-image: url('@/assets/img/icon/color/ticket.png')

.detail-content
  flex: 1

.detail-label
  font-size: 12px
  color: rgba($spot-text-primary, 0.6)
  font-weight: 600
  text-transform: uppercase
  letter-spacing: 0.5px
  margin-bottom: 2px

.detail-value
  font-size: 14px
  color: $spot-text-primary
  font-weight: 500

// 備註區域
.notes-section
  display: flex
  align-items: flex-start
  padding: $spacing-sm
  background: $spot-notes-bg
  border-radius: $border-radius-sm
  border: 1px solid rgba(199, 178, 222, 0.3)

.notes-icon
  width: 14px
  height: 14px
  background-image: url('@/assets/img/icon/color/chat.png')
  background-size: 14px 14px
  background-repeat: no-repeat
  background-position: center
  margin-right: $spacing-xs
  margin-top: 1px
  flex-shrink: 0

.notes-text
  flex: 1
  font-size: 14px
  color: rgba($spot-text-primary, 0.7)
  line-height: 1.4
  font-style: italic
</style>