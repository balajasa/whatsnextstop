<template>
  <div class="travel-trace">
    <!-- 麵包屑 -->
    <BreadcrumbNav />
    <div class="travel-container">
      <div v-if="loading" class="loading-container">載入中...</div>

      <div v-else class="travel-list">
        <div class="list-header">
          <div>年份</div>
          <div>日期</div>
          <div>天數</div>
          <div>國家</div>
          <div>地點</div>
          <div></div>
        </div>

        <div v-for="(travel, index) in travels" :key="`${travel.year}-${travel.startDate}-${index}`"
          class="travel-item">
          <div class="item-header" @click="toggleDetails(index)">
            <div class="year">{{ travel.year }}</div>
            <div class="date">{{ formatDateRange(travel.startDate, travel.endDate) }}</div>
            <div class="days">{{ calculateDays(travel.startDate, travel.endDate) }}天</div>
            <div class="country">{{ formatCountries(travel.country) }}</div>
            <div class="location">{{ formatLocations(travel) }}</div>
            <div class="expand-btn" :class="{ rotated: expandedItems.has(index) }">▼</div>
          </div>

          <div class="item-details" :class="{ expanded: expandedItems.has(index) }">
            <div class="details-content">
              <div v-if="travel.photo.length > 0" class="photo-gallery">
                <div v-for="(photoName, photoIndex) in travel.photo" :key="photoIndex" class="photo-container">
                  <div v-if="!loadedPhotos.has(getPhotoUrl(travel, photoName))" class="photo-placeholder"
                    :class="{ loading: loadingPhotos.has(getPhotoUrl(travel, photoName)) }"
                    @click="loadPhoto(travel, photoName)"></div>
                  <div v-else class="photo-img" :style="{ backgroundImage: `url(${getPhotoUrl(travel, photoName)})` }"
                    @click="openPhoto(getPhotoUrl(travel, photoName))"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTravelStore } from '../../stores/useTravelStore'
import { storeToRefs } from 'pinia'
import { countryTranslation } from '../../composables/countryTranslation'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import type { TravelData } from '../../types/response'

// 導入工具函數和 composables
import { formatLocations, openPhoto } from '../../utils/travelUtils'
import { formatDateRange, calculateDays } from '../../utils/dateUtils'
import { useTravelPhotos } from '../../composables/useTravelPhotos'
import { useTravelList } from '../../composables/useTravelList'

const travelStore = useTravelStore()
const { travels, loading } = storeToRefs(travelStore)
const { getCountryInfo } = countryTranslation()

// 獲取照片 URL (這個函數依賴於 travelStore，所以保留在組件中)
function getPhotoUrl(travel: TravelData, photoName: string): string {
  return travelStore.getImageUrl(travel, photoName)
}

// 使用 composables (傳入 getPhotoUrl 函數)
const { loadedPhotos, loadingPhotos, loadPhoto, loadPhotosWithDelay } = useTravelPhotos(getPhotoUrl)
const { expandedItems, toggleDetails: toggleDetailsBase } = useTravelList()

// 格式化國家顯示 (這個函數依賴於 countryTranslation，所以保留在組件中)
function formatCountries(countries: string[], withFlag: boolean = true): string {
  return countries
    .map(country => {
      const info = getCountryInfo(country)
      return withFlag ? `${info.flag} ${info.chinese}` : info.chinese
    })
    .join('、')
}

// 展開/收合詳細資訊 (使用 composable 的版本)
function toggleDetails(index: number) {
  toggleDetailsBase(index, () => {
    // 展開時載入照片
    const travel = travels.value[index]
    loadPhotosWithDelay(travel)
  })
}

// 初始化
onMounted(async () => {
  await travelStore.loadTravels()
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// 主容器 (Mobile First)
// ===================================
.travel-trace
  width: 100%
  min-height: 100vh
  padding: 0 $spacing-md

  @include tablet
    padding: 0 $spacing-lg

  @include desktop
    padding: 0 $spacing-xl

.travel-container
  max-width: 1200px
  margin: 0 auto
  border-radius: $border-radius-lg
  box-shadow: 0 12px 35px rgba(145, 181, 0, 0.25)
  overflow: hidden

  @include desktop
    background: $matcha-soft
    border-radius: $border-radius-xl
    box-shadow: 0 16px 40px rgba(145, 181, 0, 0.3)

  @include large-desktop
    background: $matcha-soft
    max-width: 1400px

// ===================================
// 標題區域
// ===================================
.travel-header
  padding: $spacing-lg
  background: linear-gradient(135deg, $matcha-bright, $matcha-muted)
  color: white
  text-align: center

  @include tablet
    padding: $spacing-xl

  h1
    margin: 0 0 $spacing-sm
    font-size: 24px
    font-weight: 700

    @include tablet
      font-size: 28px

    @include desktop
      font-size: 32px

  p
    margin: 0
    font-size: 14px
    opacity: 0.9

    @include tablet
      font-size: 16px

// ===================================
// 載入狀態
// ===================================
.loading-container
  @include flex-center
  height: 200px
  color: $text-dark
  font-size: 16px

  @include tablet
    height: 300px
    font-size: 18px

// ===================================
// 旅行列表容器
// ===================================
.travel-list
  padding: $spacing-md

  @include tablet
    padding: $spacing-lg

  @include desktop
    padding: $spacing-xl

// ===================================
// 列表標題 (僅桌面版顯示)
// ===================================
.list-header
  display: none

  @include desktop
    display: grid
    grid-template-columns: 80px 160px 60px 1fr 1fr 40px
    gap: $spacing-md
    padding: $spacing-md $spacing-lg
    background: $matcha-bright
    border-radius: $border-radius-md
    font-weight: 600
    color: $text-dark
    font-size: 14px
    margin-bottom: $spacing-lg
    border: 1px solid rgba(145, 181, 0, 0.2)
    justify-content: center

  @include large-desktop
    grid-template-columns: 100px 180px 80px 1fr 1fr 50px
    font-size: 15px
    justify-content: center

// ===================================
// 旅行項目 (Mobile First - 卡片式)
// ===================================
.travel-item
  margin-bottom: $spacing-md
  background: #FFFFFF
  border-radius: $border-radius-md
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05)
  border: 1px solid $almond-cream
  overflow: hidden
  transition: all 0.3s ease-in-out

  @include tablet
    margin-bottom: $spacing-lg
    border-radius: $border-radius-lg

  @include desktop
    margin-bottom: $spacing-md
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03)
    border: 1px solid rgba(255, 228, 181, 0.6)
    border-radius: $border-radius-sm

  &:hover
    box-shadow: 0 8px 25px rgba(145, 181, 0, 0.15)
    transform: translateY(-3px)
    border-color: $matcha-bright

    @include desktop
      box-shadow: 0 6px 20px rgba(145, 181, 0, 0.12)
      transform: translateY(-2px)

  &:last-child
    margin-bottom: 0

// ===================================
// 項目標題
// ===================================
.item-header
  padding: $spacing-md
  cursor: pointer
  transition: background-color 0.2s ease

  @include tablet
    padding: $spacing-lg

  @include desktop
    display: grid
    grid-template-columns: 80px 160px 60px 1fr 1fr 40px
    gap: $spacing-md
    padding: $spacing-md $spacing-lg
    align-items: center

  @include large-desktop
    grid-template-columns: 100px 180px 80px 1fr 1fr 50px

  &:hover
    background: rgba(145, 181, 0, 0.05)

    @include desktop
      background: rgba(145, 181, 0, 0.03)

  // 手機版和平板版的堆疊佈局
  @include mobile-tablet
    display: flex
    flex-direction: column
    gap: $spacing-sm
    position: relative

// ===================================
// 項目內容樣式
// ===================================
.year
  font-weight: 700
  color: white
  font-size: 18px

  @include tablet
    font-size: 20px

  @include desktop
    font-size: 16px
    text-align: center
    color: $matcha-bright

  // 手機/平板版標籤式顯示
  @include mobile-tablet
    background: $matcha-bright
    color: white
    padding: $spacing-xs $spacing-sm
    border-radius: $border-radius-md
    display: inline-block
    font-size: 16px
    font-weight: 600

    &::before
      content: '📅 '

.date
  color: $text-dark
  font-weight: 500
  font-size: 14px
  opacity: 0.8

  @include tablet
    font-size: 15px

  @include desktop
    font-size: 14px

  @include mobile-tablet
    &::before
      content: '🗓️ '
      margin-right: $spacing-xs

.days
  color: white
  font-weight: 600
  font-size: 14px

  @include tablet
    font-size: 15px

  @include desktop
    text-align: center
    font-size: 14px
    color: $caramel-orange

  @include mobile-tablet
    background: $caramel-orange
    color: white
    padding: $spacing-xs $spacing-sm
    border-radius: $border-radius-md
    display: inline-block
    font-size: 13px

    &::before
      content: '⏱️ '

.country
  font-weight: 600
  color: $text-dark
  font-size: 15px

  @include tablet
    font-size: 16px

  @include desktop
    font-size: 15px

  @include mobile-tablet
    font-size: 16px
    margin: $spacing-xs 0

.location
  color: $text-dark
  font-size: 14px
  opacity: 0.7

  @include tablet
    font-size: 15px

  @include desktop
    font-size: 14px

  @include mobile-tablet
    &::before
      content: '📍 '
      margin-right: $spacing-xs

.expand-btn
  background: $matcha-bright
  color: white
  font-size: 16px
  transition: all 0.3s ease
  user-select: none

  @include desktop
    text-align: center
    font-size: 14px
    border-radius: 4px
    padding: 4px 8px

  @include mobile-tablet
    position: absolute
    top: $spacing-md
    right: $spacing-md
    width: 32px
    height: 32px
    border-radius: 50%
    @include flex-center
    font-size: 14px

    @include tablet
      top: $spacing-lg
      right: $spacing-lg

  &.rotated
    transform: rotate(180deg)

  &:hover
    background: rgba(145, 181, 0, 0.8)
    box-shadow: 0 4px 12px rgba(145, 181, 0, 0.3)

// ===================================
// 詳細內容區域
// ===================================
.item-details
  max-height: 0
  overflow: hidden
  transition: max-height 0.4s ease-in-out
  background: $almond-soft

  &.expanded
    max-height: 2000px

.details-content
  padding: $spacing-md

  @include tablet
    padding: $spacing-lg

  @include desktop
    padding: $spacing-lg $spacing-xl

// ===================================
// 照片畫廊 (Mobile First - 水平滾動)
// ===================================
.photo-gallery
  // 手機版：水平滾動
  display: flex
  gap: $spacing-sm
  overflow-x: auto
  overflow-y: hidden
  padding: $spacing-sm 0
  -webkit-overflow-scrolling: touch
  scroll-behavior: smooth
  scroll-snap-type: x mandatory

  // 滾動條樣式
  &::-webkit-scrollbar
    height: 4px

  &::-webkit-scrollbar-track
    background: rgba(145, 181, 0, 0.1)
    border-radius: 2px

  &::-webkit-scrollbar-thumb
    background: rgba(145, 181, 0, 0.4)
    border-radius: 2px

    &:hover
      background: rgba(145, 181, 0, 0.6)

  // 平板版：改回網格佈局
  @include tablet
    display: grid
    grid-template-columns: repeat(2, 1fr)
    gap: $spacing-md
    overflow: visible
    scroll-snap-type: none

  // 桌面版：三欄網格
  @include desktop
    grid-template-columns: repeat(3, 1fr)
    gap: $spacing-lg

  // 大桌面版：四欄網格
  @include large-desktop
    grid-template-columns: repeat(4, 1fr)

.photo-container
  // 手機版：固定寬度 + 水平滾動
  width: 240px
  aspect-ratio: 16/12
  flex-shrink: 0
  border-radius: $border-radius-md
  overflow: hidden
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05)
  transition: all 0.3s ease-in-out
  scroll-snap-align: start

  // 平板版以上：取消固定寬度，恢復響應式
  @include tablet
    width: auto
    flex-shrink: 1
    border-radius: $border-radius-lg

  @include desktop
    border-radius: $border-radius-lg

  &:hover
    transform: scale(1.03)
    box-shadow: 0 8px 25px rgba(210, 105, 30, 0.15)

  // 手機版：點擊效果
  @include mobile-only
    &:active
      transform: scale(0.98)

  .photo-placeholder
    width: 100%
    height: 100%
    background: $caramel-soft
    cursor: pointer
    transition: all 0.3s ease
    background-image: url('@/assets/img/sym/cat_error.png')
    background-size: contain
    background-position: center
    background-repeat: no-repeat
    @include flex-center

    &:hover
      background-color: rgba(210, 105, 30, 0.2)
      transform: scale(1.02)

      @include mobile-only
        transform: scale(1.01)

    &.loading
      background-color: rgba(210, 105, 30, 0.3)
      background-image: url('@/assets/img/sym/cat_error.png')
      animation: pulse 1.5s infinite

.photo-img
  width: 100%
  height: 100%
  background-size: cover
  background-position: center
  background-repeat: no-repeat
  cursor: pointer
  transition: transform 0.3s ease

  &:hover
    transform: scale(1.05)

    @include mobile-only
      transform: scale(1.02)

// ===================================
// 動畫定義
// ===================================
@keyframes pulse
  0%, 100%
    opacity: 1

  50%
    opacity: 0.7

// ===================================
// 響應式優化
// ===================================

// 手機版特殊處理
@include mobile-only
  .travel-trace
    padding: $spacing-sm

  .travel-container
    border-radius: $border-radius-md
    box-shadow: 0 6px 20px rgba(145, 181, 0, 0.08)

  .travel-header
    padding: $spacing-md

    h1
      font-size: 20px

    p
      font-size: 13px

  .travel-list
    padding: $spacing-sm

  .item-header
    padding: $spacing-sm

  .expand-btn
    top: $spacing-sm
    right: $spacing-sm
    width: 28px
    height: 28px
    font-size: 12px

  .details-content
    padding: $spacing-sm

  .photo-gallery
    gap: 8px
    padding: $spacing-xs 0

    // 添加漸變遮罩提示可滾動
    &::after
      content: ''
      position: sticky
      right: 0
      top: 0
      width: 20px
      height: 100%
      background: linear-gradient(to left, rgba(255,248,240,0.8), transparent)
      pointer-events: none
      z-index: 1

  .photo-container
    width: 200px

    // 小屏手機更小的寬度
    @media (max-width: 350px)
      width: 180px

// 大桌面版優化
@include large-desktop
  .photo-gallery
    gap: $spacing-xl

  .travel-container
    max-width: 1600px

  .travel-header
    h1
      font-size: 36px

    p
      font-size: 18px
</style>