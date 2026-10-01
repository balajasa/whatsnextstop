<template>
  <article class="travel-photo-card" :class="`tape-${tapeIndex}`" :style="{ '--tilt': `${tilt}deg` }">
    <span class="tape" aria-hidden="true"></span>

    <header class="card-header">
      <span class="country-flag" aria-hidden="true">{{ getCountryFlag(trip.destinations[0].country) }}</span>
      <h2 class="trip-title">{{ trip.title }}</h2>
    </header>

    <!-- 照片區域 -->
    <div class="photo-section">
      <div v-if="isInitialLoading" class="photo-loading">
        <StateView type="loading" size="sm" message="載入照片中..." />
      </div>

      <div v-else-if="hasNoPhotos" class="photo-placeholder">
        <span class="country-flag-large" aria-hidden="true">{{ getCountryFlag(trip.destinations[0].country) }}</span>
        <span class="no-photos-text">暫無照片</span>
      </div>

      <div v-else class="photo-container">
        <swiper :slides-per-view="1" :space-between="0" :pagination="{
          clickable: true,
          dynamicBullets: false
        }" :keyboard="{ enabled: true }" :modules="[Pagination, Keyboard]" @swiper="onSwiper"
          @slide-change="onSlideChange" class="photo-swiper">
          <swiper-slide v-for="(photo, index) in displayedPhotos" :key="index" class="photo-slide">
            <div class="photo-img" :style="{ backgroundImage: `url(${photo})` }" role="img"
              :aria-label="`${trip.title} 第 ${index + 1} 張照片`"></div>
          </swiper-slide>

          <swiper-slide v-if="isLoadingMore" class="loading-slide">
            <StateView type="loading" size="sm" message="載入更多照片中..." />
          </swiper-slide>
        </swiper>

        <button v-if="displayedPhotos.length > 1" type="button" class="nav-btn nav-btn--prev" aria-label="上一張"
          :disabled="currentSlide === 0" @click="goToPrevSlide">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <button v-if="displayedPhotos.length > 1" type="button" class="nav-btn nav-btn--next" aria-label="下一張"
          :disabled="currentSlide === displayedPhotos.length - 1" @click="goToNextSlide">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        <span class="photo-count">{{ currentSlide + 1 }}/{{ photos.length }}</span>
      </div>
    </div>

    <footer class="card-footer">
      <ul class="cities">
        <li v-for="city in getCities(trip)" :key="city" class="city-tag">{{ city }}</li>
      </ul>
      <span class="date-range">{{ formatDateRange(trip) }}</span>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Keyboard } from 'swiper/modules'
import type { Swiper as SwiperClass } from 'swiper/types'
import { event } from 'vue-gtag'
import { PhotoService } from '@/services/photos/photoService'
import { countryTranslation } from '@/translation/composables/countryTranslation'
import type { HistoryTrip } from '@/types/history-travel/travel-history'
import StateView from '@/components/common/StateView.vue'
import 'swiper/css'
import 'swiper/css/pagination'

interface TravelPhotoCardProps {
  trip: HistoryTrip
  shouldLoadPhotos?: boolean // 是否應該載入照片，用於懶加載控制
}

const { trip, shouldLoadPhotos = false } = defineProps<TravelPhotoCardProps>()

const { getCountryFlag } = countryTranslation()

const photos = ref<string[]>([])
const displayedPhotos = ref<string[]>([])
const currentSlide = ref(0)

const swiperInstance = shallowRef<SwiperClass | null>(null)
const isLoadingMore = ref(false)
const isInitialLoading = ref(true)
const hasNoPhotos = ref(false)

// 拍立得的歪斜角度與紙膠帶顏色：依旅程 id 固定，重新整理也不會亂跳
const seed = computed(() =>
  [...(trip.id ?? trip.title)].reduce((sum, char) => sum + char.charCodeAt(0), 0)
)
const tilt = computed(() => ((seed.value % 5) - 2) * 0.4)
const tapeIndex = computed(() => seed.value % 3)

const INITIAL_LOAD_COUNT = 10
const PRELOAD_TRIGGER_OFFSET = 3
const BATCH_SIZE = 5

const loadPhotos = async () => {
  try {
    isInitialLoading.value = true
    hasNoPhotos.value = false

    const photoNames = await PhotoService.getPhotoList(trip)
    const photoUrls = await Promise.all(
      photoNames.map(name => PhotoService.getPhotoBase64(trip, name))
    )
    const validPhotoUrls = photoUrls.filter(url => url !== '')

    photos.value = validPhotoUrls

    if (validPhotoUrls.length === 0) {
      hasNoPhotos.value = true
      displayedPhotos.value = []
    } else {
      displayedPhotos.value = validPhotoUrls.slice(0, INITIAL_LOAD_COUNT)
    }

    isInitialLoading.value = false
  } catch (error) {
    console.error('載入照片失敗:', error)
    isInitialLoading.value = false
    hasNoPhotos.value = true
  }
}

const preloadMorePhotos = async () => {
  if (isLoadingMore.value || displayedPhotos.value.length >= photos.value.length) {
    return
  }

  isLoadingMore.value = true

  await new Promise(resolve => setTimeout(resolve, 500))

  const currentCount = displayedPhotos.value.length
  const nextBatch = photos.value.slice(currentCount, currentCount + BATCH_SIZE)

  displayedPhotos.value = [...displayedPhotos.value, ...nextBatch]
  isLoadingMore.value = false

}

const checkPreload = () => {
  const remaining = displayedPhotos.value.length - currentSlide.value
  if (remaining <= PRELOAD_TRIGGER_OFFSET && !isLoadingMore.value) {
    preloadMorePhotos()
  }
}

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

  if (startStr === endStr) {
    return startStr
  }

  return `${startStr} - ${endStr}`
}

const getCities = (trip: HistoryTrip): string[] => {
  const allCities = trip.destinations.flatMap(dest => dest.cities)
  return [...new Set(allCities)]
}

const onSwiper = (swiper: SwiperClass) => {
  swiperInstance.value = swiper
}

const onSlideChange = (swiper: SwiperClass) => {
  currentSlide.value = swiper.activeIndex

  // GA4 追蹤：照片瀏覽
  event('photo_view', {
    category: 'history_travel',
    trip_id: trip.id,
    trip_title: trip.title,
    photo_index: currentSlide.value + 1,
    total_photos: photos.value.length,
    device: window.innerWidth < 768 ? 'mobile' : 'desktop'
  })

  checkPreload()
}

const goToPrevSlide = () => {
  if (swiperInstance.value && currentSlide.value > 0) {
    swiperInstance.value.slidePrev()
  }
}

const goToNextSlide = () => {
  if (swiperInstance.value && currentSlide.value < displayedPhotos.value.length - 1) {
    swiperInstance.value.slideNext()
  }
}

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
// 拍立得卡片
// ===================================
.travel-photo-card
  position: relative
  display: flex
  flex-direction: column
  gap: 12px
  padding: 12px 12px 16px
  border-radius: 6px
  background: $nb-card
  box-shadow: 0 6px 16px rgba(58, 51, 44, 0.12)
  transform: rotate(calc(var(--tilt) * 0.5))
  @include tablet
    padding: 14px 14px 18px
    transform: rotate(var(--tilt))

.tape
  position: absolute
  top: -10px
  left: 50%
  z-index: 1
  width: 80px
  height: 22px
  margin-left: -40px
  transform: rotate(calc(var(--tilt) * -3))
  pointer-events: none

.tape-0 .tape
  background: $nb-tape-yellow
.tape-1 .tape
  background: $nb-tape-blue
.tape-2 .tape
  background: rgba(240, 176, 140, 0.6)

// ===================================
// 頂部
// ===================================
.card-header
  display: flex
  align-items: center
  gap: 8px
  padding-top: 4px

.country-flag
  font-size: 20px

.trip-title
  margin: 0
  font-family: $font-display
  font-size: 19px
  font-weight: 700
  color: $nb-ink
  @include tablet
    font-size: 21px

// ===================================
// 照片區
// ===================================
.photo-section
  position: relative
  overflow: hidden
  aspect-ratio: 4 / 3
  border-radius: 4px
  background: $nb-paper

.photo-loading
  display: flex
  align-items: center
  justify-content: center
  height: 100%

.photo-placeholder
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 8px
  height: 100%
  background: repeating-linear-gradient(135deg, #F4ECDD 0 14px, #EFE5D2 14px 28px)

.country-flag-large
  font-size: 48px

.no-photos-text
  font-size: 14px
  color: $nb-muted

.photo-container,
.photo-swiper,
.photo-slide,
.photo-img
  width: 100%
  height: 100%

.photo-img
  background-position: center
  background-size: cover
  background-repeat: no-repeat

.loading-slide
  display: flex
  align-items: center
  justify-content: center
  background: rgba($nb-paper, 0.95)

.nav-btn
  display: none

  @include tablet
    position: absolute
    top: 50%
    z-index: 10
    display: flex
    align-items: center
    justify-content: center
    width: 36px
    height: 36px
    margin-top: -18px
    border: none
    border-radius: 50%
    background: rgba($nb-card, 0.88)
    color: $nb-ink
    cursor: pointer
    transition: background-color 0.2s ease

  &:hover:not(:disabled)
    background: $nb-card

  &:disabled
    opacity: 0.35
    cursor: not-allowed

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

.nav-btn--prev
  left: 8px

.nav-btn--next
  right: 8px

// 照片計數
.photo-count
  position: absolute
  right: 10px
  bottom: 10px
  z-index: 10
  padding: 3px 10px
  border-radius: 999px
  background: rgba($nb-ink, 0.7)
  color: $nb-card
  font-size: 12px

// Swiper 分頁小圓點
:deep(.swiper-pagination.swiper-pagination-bullets)
  bottom: 12px
  z-index: 10

  .swiper-pagination-bullet
    width: 5px
    height: 5px
    margin: 0 3px
    border-radius: 3px
    background: rgba($nb-card, 0.6)
    opacity: 1
    transition: width 0.2s ease

  .swiper-pagination-bullet-active
    width: 16px
    background: $nb-card

// ===================================
// 底部
// ===================================
.card-footer
  display: flex
  align-items: center
  justify-content: space-between
  gap: 8px

.cities
  display: flex
  flex-wrap: wrap
  gap: 6px
  margin: 0
  padding: 0
  list-style: none

.city-tag
  padding: 4px 10px
  border-radius: 999px
  background: $nb-footprint-soft
  color: $nb-footprint-strong
  font-size: 12px
  font-weight: 500

.date-range
  flex-shrink: 0
  font-size: 13px
  color: $nb-muted
</style>
