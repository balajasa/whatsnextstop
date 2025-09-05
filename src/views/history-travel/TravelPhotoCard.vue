<template>
  <div class="travel-photo-card">
    <!-- 頂部資訊區 -->
    <div class="card-header">
      <div class="trip-info">
        <div class="country-flag">{{ getCountryFlag(trip.destinations[0].country) }}</div>
        <div class="trip-title">{{ trip.title }}</div>
      </div>
    </div>

    <!-- 照片滑動區域 -->
    <div class="photo-section">
      <!-- 載入中狀態 -->
      <div v-if="isInitialLoading" class="photo-loading">
        <div class="loading-placeholder">載入照片中...</div>
      </div>

      <!-- 沒有照片時顯示國旗 -->
      <div v-else-if="hasNoPhotos" class="photo-placeholder">
        <div class="country-flag-large">{{ getCountryFlag(trip.destinations[0].country) }}</div>
        <div class="no-photos-text">暫無照片</div>
      </div>

      <!-- 有照片時顯示滑動區域 -->
      <div v-else class="photo-container">
        <swiper ref="swiperRef" :slides-per-view="1" :space-between="0" :pagination="{
          clickable: true,
          dynamicBullets: false
        }" :keyboard="{ enabled: true }" :modules="[Pagination, Keyboard]" @slide-change="onSlideChange"
          class="photo-swiper">
          <swiper-slide v-for="(photo, index) in displayedPhotos" :key="index" class="photo-slide">
            <div class="photo-img" :style="{ backgroundImage: `url(${photo})` }"></div>
          </swiper-slide>

          <!-- 載入更多指示器 -->
          <swiper-slide v-if="isLoadingMore" class="loading-slide">
            <div class="loading-more-indicator">
              <div class="loading-spinner"></div>
              <div class="loading-text">載入更多照片中...</div>
            </div>
          </swiper-slide>
        </swiper>

        <!-- 左右切換按鈕 -->
        <button v-if="displayedPhotos.length > 1" class="nav-btn nav-btn--prev" @click="goToPrevSlide"
          :disabled="currentSlide === 0">
        </button>

        <button v-if="displayedPhotos.length > 1" class="nav-btn nav-btn--next" @click="goToNextSlide"
          :disabled="currentSlide === displayedPhotos.length - 1">
        </button>
      </div>
    </div>

    <!-- 底部資訊區 -->
    <div class="card-footer">
      <!-- 第一行：日期範圍 -->
      <div class="date-range">
        {{ formatDateRange(trip) }}
      </div>

      <!-- 城市標籤與照片計數 -->
      <div class="footer-row">
        <div class="cities">
          <span v-for="city in getCities(trip)" :key="city" class="city-tag">
            {{ city }}
          </span>
        </div>
        <div v-if="!hasNoPhotos" class="photo-count">
          {{ currentSlide + 1 }}/{{ photos.length }}
          <span v-if="isLoadingMore" class="loading-indicator">⏳</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Keyboard } from 'swiper/modules'
import { PhotoService } from '@/services/photos/photoService'
import { countryTranslation } from '@/translation/composables/countryTranslation'
import type { HistoryTrip } from '@/types/history-travel/travel-history'

// Swiper CSS
import 'swiper/css'
import 'swiper/css/pagination'

// Props
interface TravelPhotoCardProps {
  trip: HistoryTrip
  shouldLoadPhotos?: boolean // 是否應該載入照片，用於懶加載控制
}

const { trip, shouldLoadPhotos = false } = defineProps<TravelPhotoCardProps>()

// Composables
const { getCountryFlag } = countryTranslation()

// 響應式資料
const photos = ref<string[]>([])
const displayedPhotos = ref<string[]>([])
const currentSlide = ref(0)
const swiperRef = ref<any>(null)
const isLoadingMore = ref(false)
const isInitialLoading = ref(true)
const hasNoPhotos = ref(false)

// 常數設定
const INITIAL_LOAD_COUNT = 10
const PRELOAD_TRIGGER_OFFSET = 3 // 距離末尾3張時開始預載
const BATCH_SIZE = 5 // 每次預載5張

// 載入照片
const loadPhotos = async () => {
  try {
    isInitialLoading.value = true
    hasNoPhotos.value = false

    const photoNames = await PhotoService.getPhotoList(trip)
    const photoUrls = photoNames.map(name => PhotoService.getPhotoUrl(trip, name)).filter(url => url !== '')

    photos.value = photoUrls

    if (photoUrls.length === 0) {
      hasNoPhotos.value = true
      displayedPhotos.value = []
    } else {
      // 初始只顯示前10張
      displayedPhotos.value = photoUrls.slice(0, INITIAL_LOAD_COUNT)
    }

    isInitialLoading.value = false
  } catch (error) {
    console.error('載入照片失敗:', error)
    isInitialLoading.value = false
    hasNoPhotos.value = true
  }
}

// 智慧預載更多照片
const preloadMorePhotos = async () => {
  if (isLoadingMore.value || displayedPhotos.value.length >= photos.value.length) {
    return
  }

  isLoadingMore.value = true

  // 模擬載入延遲，避免載入太快
  await new Promise(resolve => setTimeout(resolve, 500))

  const currentCount = displayedPhotos.value.length
  const nextBatch = photos.value.slice(currentCount, currentCount + BATCH_SIZE)

  displayedPhotos.value = [...displayedPhotos.value, ...nextBatch]
  isLoadingMore.value = false

  // console.log(`預載完成，目前顯示 ${displayedPhotos.value.length}/${photos.value.length} 張照片`)
}

// 檢查是否需要預載
const checkPreload = () => {
  const remaining = displayedPhotos.value.length - currentSlide.value
  if (remaining <= PRELOAD_TRIGGER_OFFSET && !isLoadingMore.value) {
    preloadMorePhotos()
  }
}

// 格式化日期範圍
const formatDateRange = (trip: HistoryTrip): string => {
  const startDate = new Date(trip.date.startDate)
  const endDate = new Date(trip.date.endDate)

  const formatSingleDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  const startStr = formatSingleDate(startDate)
  const endStr = formatSingleDate(endDate)

  // 如果是同一天，只顯示一個日期
  if (startStr === endStr) {
    return startStr
  }

  return `${startStr} - ${endStr}`
}

// 取得城市列表
const getCities = (trip: HistoryTrip): string[] => {
  const allCities = trip.destinations.flatMap(dest => dest.cities)
  return [...new Set(allCities)]
}

// 滑動切換事件
const onSlideChange = (swiper: any) => {
  currentSlide.value = swiper.activeIndex
  // 檢查是否需要預載更多照片
  checkPreload()
}

// 取得 Swiper 實例
const getSwiperInstance = () => {
  if (!swiperRef.value) return null

  // 嘗試不同的 Swiper 實例訪問方式
  return swiperRef.value.$el?.swiper ||
    swiperRef.value.swiper ||
    swiperRef.value
}

// 切換到上一張
const goToPrevSlide = () => {
  const swiper = getSwiperInstance()
  if (swiper && typeof swiper.slidePrev === 'function' && currentSlide.value > 0) {
    swiper.slidePrev()
  } else {
    console.warn('Swiper slidePrev not available:', swiper)
  }
}

// 切換到下一張
const goToNextSlide = () => {
  const swiper = getSwiperInstance()
  if (swiper && typeof swiper.slideNext === 'function' && currentSlide.value < displayedPhotos.value.length - 1) {
    swiper.slideNext()
  } else {
    console.warn('Swiper slideNext not available:', swiper)
  }
}

// 監聽是否應該載入照片
watch(() => shouldLoadPhotos, (newValue) => {
  if (newValue && photos.value.length === 0) {
    loadPhotos()
  }
}, { immediate: true }) // immediate: true 讓它在元件掛載時就檢查一次

</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// 主卡片容器
// ===================================
.travel-photo-card
  width: 100%
  margin-bottom: $spacing-xl
  background: white
  border-radius: $border-radius-md
  overflow: hidden
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)

  @include tablet
    margin-bottom: $spacing-xl
    border-radius: $border-radius-xl

  @include desktop
    max-width: 600px
    margin: 0 auto $spacing-xl

// ===================================
// 頂部資訊區
// ===================================
.card-header
  padding: $spacing-sm $spacing-md
  border-bottom: 1px solid rgba(0, 0, 0, 0.05)

  @include tablet
    padding: 16px $spacing-lg

.trip-info
  display: flex
  align-items: center
  gap: $spacing-sm

.country-flag
  font-size: 24px

  @include tablet
    font-size: 28px

.trip-title
  flex: 1
  font-size: 16px
  font-weight: 600
  color: $text-primary

  @include tablet
    font-size: 20px

// ===================================
// 照片區域 (核心部分)
// ===================================
.photo-section
  position: relative
  aspect-ratio: 1
  background: $bg-primary

  @include tablet
    aspect-ratio: 4/3

.photo-loading
  @include flex-center
  height: 100%
  color: $text-muted

.loading-placeholder
  font-size: 16px
  text-align: center

// 沒有照片時的國旗佔位符
.photo-placeholder
  @include flex-center
  flex-direction: column
  height: 100%
  background: linear-gradient(135deg, rgba(200, 200, 200, 0.6), rgba(180, 180, 180, 0.4))
  backdrop-filter: blur(40px)
  -webkit-backdrop-filter: blur(40px)
  border: 1px solid rgba(255, 255, 255, 0.3)

.country-flag-large
  font-size: 48px
  margin-bottom: $spacing-sm
  opacity: 0.8

  @include tablet
    font-size: 60px
    margin-bottom: $spacing-md

.no-photos-text
  font-size: 14px
  color: rgba(0, 0, 0, 0.7)
  font-weight: 500
  opacity: 0.8

  @include tablet
    font-size: 16px

.photo-container
  position: relative
  width: 100%
  height: 100%

.photo-swiper
  width: 100%
  height: 100%

.photo-slide
  width: 100%
  height: 100%

.photo-img
  width: 100%
  height: 100%
  background-size: cover
  background-position: center
  background-repeat: no-repeat

// ===================================
// 導航按鈕 (平板以上才顯示)
// ===================================
.nav-btn
  display: none // 手機版隱藏

  @include tablet
    display: block
    position: absolute
    top: 50%
    transform: translateY(-50%)
    z-index: 10
    width: 30px
    height: 30px
    border: none
    border-radius: 50%
    background: rgba(255, 255, 255, 0.9)
    cursor: pointer
    transition: all 0.2s ease
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1)
    background-repeat: no-repeat
    background-position: center
    background-size: 18px 18px

  &:hover
    background-color: white
    transform: translateY(-50%) scale(1.05)
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2)

  &:active
    transform: translateY(-50%) scale(0.95)

  &:disabled
    opacity: 0.4
    cursor: not-allowed
    transform: translateY(-50%)

    &:hover
      background-color: rgba(255, 255, 255, 0.9)
      transform: translateY(-50%)

.nav-btn--prev
  background-image: url('@/assets/img/icon/common/arrow_left_key.png')

  @include tablet
    left: $spacing-md

.nav-btn--next
  background-image: url('@/assets/img/icon/common/arrow_right_key.png')

  @include tablet
    right: $spacing-md

// ===================================
// Swiper 分頁指示器客製化
// ===================================
:deep(.swiper-pagination.swiper-pagination-bullets)
  bottom: $spacing-sm
  text-align: center
  z-index: 10

  @include tablet
    bottom: $spacing-md

  .swiper-pagination-bullet
    width: 4px
    height: 4px
    background: rgba(255, 255, 255, 0.4)
    opacity: 1
    margin-left: 3px
    margin-right: 3px
    border-radius: 50%
    transition: all 0.3s ease
    cursor: pointer

    @include tablet
      width: 5px
      height: 5px
      margin-left: 4px
      margin-right: 4px

    &:hover
      background: rgba(255, 255, 255, 0.7)
      transform: scale(1.2)

  .swiper-pagination-bullet-active
    background: white
    transform: scale(1.3)

    @include tablet
      transform: scale(1.4)

// 手機版小圓點更小
// @include mobile-only
//   :deep(.swiper-pagination.swiper-pagination-bullets)
//     bottom: 4px

//     .swiper-pagination-bullet
//       width: 3px
//       height: 3px
//       margin-left: 2px
//       margin-right: 2px

// ===================================
// 載入更多指示器
// ===================================
.loading-slide
  @include flex-center
  background: rgba($bg-primary, 0.95)

.loading-more-indicator
  text-align: center
  padding: $spacing-xl

.loading-spinner
  width: 24px
  height: 24px
  border: 2px solid rgba($text-muted, 0.3)
  border-top: 2px solid $accent-color-1
  border-radius: 50%
  animation: spin 1s linear infinite
  margin: 0 auto $spacing-md

.loading-text
  font-size: 14px
  color: $text-muted

@keyframes spin
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)

.loading-indicator
  font-size: 10px
  margin-left: 4px

// ===================================
// 底部資訊區
// ===================================
.card-footer
  padding: $spacing-md
  display: flex
  flex-direction: column
  gap: 6px

  @include tablet
    padding: $spacing-lg

// 日期範圍顯示
.date-range
  font-size: 12px
  font-weight: 600
  color: $text-primary
  letter-spacing: 0.3px

  @include tablet
    font-size: 14px

// 城市標籤與照片計數
.footer-row
  display: flex
  justify-content: space-between
  align-items: flex-start
  gap: 6px

.cities
  display: flex
  align-items: center
  flex-wrap: wrap
  flex: 1
  gap: 4px

.city-tag
  font-size: 11px
  color: $text-primary
  font-weight: 500
  background: rgba($accent-color-2, 0.1)
  padding: 3px 6px
  border-radius: $border-radius-sm
  border: 1px solid rgba($accent-color-2, 0.2)

  @include tablet
    font-size: 13px
    padding: 5px 10px

.photo-count
  font-size: 12px
  color: $text-muted
  white-space: nowrap

  @include tablet
    font-size: 14px

</style>
