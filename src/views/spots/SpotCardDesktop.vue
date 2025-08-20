<template>
  <div class="spot-card-desktop">
    <!-- 左側主要內容區域 -->
    <div class="main-content">
      <!-- 標題列 -->
      <div class="title-section">
        <div class="title-group">
          <h3 class="spot-name">{{ spot.name }}</h3>
          <span class="category-badge" :class="`category-${getCategoryClass}`">
            {{ spot.category }}
          </span>
        </div>
        <a 
          v-if="formattedSpot.hasMap" 
          :href="spot.googleMapUrl" 
          target="_blank" 
          class="map-link"
          @click.stop
          title="在 Google Maps 中開啟"
        >
        </a>
      </div>
      
      <!-- 位置資訊 -->
      <div class="location-section">
        <div class="location-icon"></div>
        <span class="location-text">{{ spot.region }}, {{ spot.country }}</span>
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
    </div>
    
    <!-- 右側詳細資訊區域 -->
    <div class="details-section">
      <!-- 時間和價格卡片 - 正方形並排 -->
      <div class="info-cards-grid">
        <div class="square-card time-card">
          <div class="square-icon square-icon-time"></div>
          <div class="square-value">{{ formattedSpot.displayHours }}</div>
        </div>
        
        <div class="square-card price-card">
          <div class="square-icon square-icon-price"></div>
          <div class="square-value">{{ formattedSpot.displayPrice }}</div>
        </div>
      </div>
      
      <!-- 備註區域 -->
      <div class="notes-section">
        <div class="notes-header">
          <div class="notes-icon"></div>
          <div class="notes-label">備註</div>
        </div>
        <div class="notes-text">{{ spot.notes || '' }}</div>
      </div>
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
  return props.spot.description && props.spot.description.length > 150
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

.spot-card-desktop
  background: $spot-card-bg
  border-radius: $border-radius-lg
  padding: $spacing-lg
  margin-bottom: $spacing-lg
  border: 1px solid rgba($spot-text-primary, 0.1)
  box-shadow: 0 2px 12px rgba($spot-text-primary, 0.08)
  transition: all 0.3s ease
  display: grid
  grid-template-columns: 1fr 240px
  gap: $spacing-lg
  
  &:hover
    transform: translateY(-4px)
    box-shadow: 0 8px 25px rgba($spot-text-primary, 0.15)
    border-color: rgba($spot-text-primary, 0.2)

// 左側主要內容區域
.main-content
  display: flex
  flex-direction: column
  gap: $spacing-sm
  
// 標題區域
.title-section
  display: flex
  justify-content: space-between
  align-items: flex-start
  
.title-group
  display: flex
  align-items: center
  gap: $spacing-md
  flex: 1
  
.spot-name
  font-size: 24px
  font-weight: 600
  color: $spot-text-primary
  margin: 0
  line-height: 1.3
  
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

.map-link
  display: flex
  align-items: center
  justify-content: center
  width: 40px
  height: 40px
  border-radius: $border-radius-md
  background-color: $bg-primary
  background-image: url('@/assets/img/icon/color/maps.png')
  background-size: 20px 20px
  background-repeat: no-repeat
  background-position: center
  border: 1px solid $border-light
  text-decoration: none
  transition: all 0.2s ease
  flex-shrink: 0
  
  &:hover
    background-color: rgba($primary-color, 0.1)
    border-color: rgba($primary-color, 0.3)
    transform: translateY(-1px)
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)

// 位置資訊
.location-section
  display: flex
  align-items: center
  padding-bottom: $spacing-sm
  border-bottom: 1px solid $border-muted
  
.location-icon
  width: 16px
  height: 16px
  background-image: url('@/assets/img/icon/color/pin.png')
  background-size: 16px 16px
  background-repeat: no-repeat
  background-position: center
  margin-right: $spacing-sm
  flex-shrink: 0
  
.location-text
  font-size: 16px
  color: rgba($spot-text-primary, 0.7)

// 描述區域
.description-section
  flex: 1
  
.description-text
  font-size: 15px
  color: rgba($spot-text-primary, 0.8)
  line-height: 1.6
  margin: 0 0 $spacing-sm 0
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
  font-size: 13px
  font-weight: 500
  cursor: pointer
  padding: 0
  text-decoration: underline
  
  &:hover
    color: rgba($spot-text-primary, 0.7)

// 右側詳細資訊區域
.details-section
  display: flex
  flex-direction: column
  gap: $spacing-lg
  
// 正方形資訊卡片網格
.info-cards-grid
  display: grid
  grid-template-columns: 1fr 1fr
  gap: $spacing-sm

.square-card
  aspect-ratio: 1
  border-radius: $border-radius-md
  padding: $spacing-sm
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  text-align: center
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

.square-icon
  width: 24px
  height: 24px
  background-size: 24px 24px
  background-repeat: no-repeat
  background-position: center
  margin-bottom: $spacing-xs
  opacity: 0.9

.square-icon-time
  background-image: url('@/assets/img/icon/color/clock.png')

.square-icon-price
  background-image: url('@/assets/img/icon/color/ticket.png')
  
.square-value
  font-size: 13px
  color: $spot-text-primary
  font-weight: 600
  line-height: 1.3
  word-break: break-word

// 備註區域
.notes-section
  background: rgba($spot-himawari, 0.15)
  border-radius: $border-radius-md
  padding: $spacing-lg
  border: 1px solid rgba($spot-himawari, 0.3)
  
.notes-header
  display: flex
  align-items: center
  gap: $spacing-sm
  margin-bottom: $spacing-sm
  
.notes-icon
  width: 16px
  height: 16px
  background-image: url('@/assets/img/icon/color/chat.png')
  background-size: 16px 16px
  background-repeat: no-repeat
  background-position: center
  
.notes-label
  font-size: 12px
  color: rgba($spot-text-primary, 0.8)
  font-weight: 600
  text-transform: uppercase
  letter-spacing: 0.5px
  
.notes-text
  font-size: 14px
  color: rgba($spot-text-primary, 0.7)
  line-height: 1.5
  font-style: italic

// 響應式調整 - 較小的桌面螢幕
@include tablet
  .spot-card-desktop
    grid-template-columns: 1fr 200px
    gap: $spacing-md
    padding: $spacing-md
    
  .spot-name
    font-size: 20px
    
  .square-icon
    width: 20px
    height: 20px
    background-size: 20px 20px
    
  .square-value
    font-size: 12px
</style>