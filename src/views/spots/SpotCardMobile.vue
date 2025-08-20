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
      <a 
        v-if="formattedSpot.hasMap" 
        :href="spot.googleMapUrl" 
        target="_blank" 
        class="map-link"
        @click.stop
      >
      </a>
    </div>
    
    <!-- 描述區域 -->
    <div class="description-section" v-if="spot.description">
      <p class="description-text" :class="{ 'expanded': isExpanded }">
        {{ spot.description }}
      </p>
      <button 
        v-if="isLongDescription" 
        @click="toggleDescription" 
        class="expand-btn"
      >
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
  background: $spot-card-bg
  border-radius: $border-radius-lg
  padding: $spacing-lg
  margin-bottom: $spacing-md
  border: 1px solid rgba($spot-text-primary, 0.1)
  box-shadow: 0 2px 8px rgba($spot-text-primary, 0.08)
  transition: all 0.2s ease
  
  &:hover
    transform: translateY(-2px)
    box-shadow: 0 4px 16px rgba($spot-text-primary, 0.12)
    border-color: rgba($spot-text-primary, 0.2)

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

// 日本傳統色類別標籤
.category-attraction
  background-color: rgba($category-fuji, 0.15)
  color: $category-fuji
  border: 1px solid rgba($category-fuji, 0.3)

.category-food
  background-color: rgba($category-nadeshiko, 0.15)
  color: $category-nadeshiko
  border: 1px solid rgba($category-nadeshiko, 0.3)

.category-hotel
  background-color: rgba($category-hanada, 0.15)
  color: $category-hanada
  border: 1px solid rgba($category-hanada, 0.3)

.category-shopping
  background-color: rgba($category-yamabuki, 0.15)
  color: $category-yamabuki
  border: 1px solid rgba($category-yamabuki, 0.3)

.category-transport
  background-color: rgba($category-ruri, 0.15)
  color: $category-ruri
  border: 1px solid rgba($category-ruri, 0.3)

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
  
  &:hover
    background-color: rgba($spot-text-primary, 0.1)
    border-color: rgba($spot-text-primary, 0.3)
    transform: translateY(-1px)
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)

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
  font-size: 12px
  font-weight: 500
  cursor: pointer
  padding: 0
  text-decoration: underline
  
  &:hover
    color: rgba($spot-text-primary, 0.7)

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
  
  &:hover
    transform: translateY(-1px)

// 日本傳統色配色
.time-card
  background: rgba($spot-sango, 0.2)       // 珊瑚色 (Sango-iro) - 溫暖珊瑚
  border: 1px solid rgba($spot-sango, 0.3)
  
  &:hover
    background: rgba($spot-sango, 0.3)
    border-color: rgba($spot-sango, 0.5)

.price-card
  background: rgba($spot-wakakusa, 0.3)    // 若草色 (Wakakusa-iro) - 清新草綠
  border: 1px solid rgba($spot-wakakusa, 0.4)
  
  &:hover
    background: rgba($spot-wakakusa, 0.4)
    border-color: rgba($spot-wakakusa, 0.6)
  
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
  font-size: 10px
  color: rgba($spot-text-primary, 0.6)
  font-weight: 600
  text-transform: uppercase
  letter-spacing: 0.5px
  margin-bottom: 2px
  
.detail-value
  font-size: 13px
  color: $spot-text-primary
  font-weight: 500

// 備註區域
.notes-section
  display: flex
  align-items: flex-start
  padding: $spacing-sm
  background: rgba($spot-himawari, 0.15)
  border-radius: $border-radius-sm
  border: 1px solid rgba($spot-himawari, 0.3)
  
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
  font-size: 13px
  color: rgba($spot-text-primary, 0.7)
  line-height: 1.4
  font-style: italic
</style>