<template>
  <div class="main-content-wrapper">
    <div class="schedule-section">
      <!-- <div class="schedule-header">
        <p class="schedule-subtitle">精心規劃的{{ totalDays }}天完美旅程</p>
      </div> -->

      <!-- 封面圖片區域 -->
      <div class="cover-image-area">
        <swiper :modules="modules" :slides-per-view="1" :space-between="0" :loop="true"
          :autoplay="{ delay: 4000, disableOnInteraction: false }"
          :pagination="{ clickable: true, dynamicBullets: true }" :navigation="true" effect="fade"
          :fade-effect="{ crossFade: true }" class="cover-swiper">
          <swiper-slide v-for="image in coverImages" :key="image.id">
            <div class="cover-slide">
              <img :src="image.src" :alt="image.alt" />
            </div>
          </swiper-slide>
        </swiper>
      </div>

      <!-- 主要功能區域 -->
      <div class="schedule-main-grid">
        <div v-for="card in mainCards" :key="card.id" :class="['schedule-card', card.class]"
          @click="navigateToSection(card.route, card.section)">
          <div class="schedule-icon">{{ card.icon }}</div>
          <h3>{{ card.title }}</h3>
        </div>
      </div>

      <!-- 每日行程區域 -->
      <div class="daily-schedule-section">
        <h3 class="daily-title">📅 每日詳細行程</h3>
        <div class="daily-grid">
          <div class="daily-block">

            <div v-for="day in totalDays" :key="day" class="daily-card" @click="navigateToDay(day)">
              Day{{ day }}
            </div>
          </div>
        </div>
      </div>

      <div class="countdown-section">
        <TravelCountdown />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Ref } from 'vue'
import TravelCountdown from '@/components/layout/TravelCountdown.vue'

// 導入 Swiper 組件和模組
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'

// 導入 Swiper 樣式
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import 'swiper/css/effect-fade'

import banner01 from '@/assets/img/bg/banner_01.jpg'
import banner02 from '@/assets/img/bg/banner_02.jpg'
import banner03 from '@/assets/img/bg/banner_03.jpg'

// 定義類型接口
interface CoverImage {
  id: number
  src: string
  alt?: string
}

interface MainCard {
  id: string
  route: string
  section?: string
  class: string
  icon: string
  title: string
}

interface Props {
  sidebarOpen?: boolean
  isMobile?: boolean
}

// 接收側邊欄狀態和手機版狀態
defineProps<Props>()

const router = useRouter()

// Swiper 模組註冊
const modules = [Navigation, Pagination, Autoplay, EffectFade]

// 封面圖片數據
const coverImages: Ref<CoverImage[]> = ref([
  {
    id: 1,
    src: banner01,
    alt: '旅程封面圖片 1'
  },
  {
    id: 2,
    src: banner02,
    alt: '旅程封面圖片 2'
  },
  {
    id: 3,
    src: banner03,
    alt: '旅程封面圖片 3'
  }
])

// 總天數配置
const totalDays: Ref<number> = ref(6)

// 主要功能卡片數據
const mainCards: Ref<MainCard[]> = ref([
  {
    id: 'overview',
    route: 'ItineraryDetail',
    section: 'overview',
    class: 'overview-card',
    icon: '📋',
    title: '行程總覽'
  },
  {
    id: 'flight',
    route: 'ItineraryDetail',
    section: 'flight',
    class: 'flight-card',
    icon: '✈️',
    title: '航班資訊'
  },
  {
    id: 'map',
    route: 'ItineraryDetail',
    section: 'map',
    class: 'map-card',
    icon: '🗺️',
    title: '路線地圖'
  },
  {
    id: 'packing',
    route: 'ItineraryDetail',
    section: 'packing',
    class: 'packing-card',
    icon: '🎒',
    title: '必帶物品'
  },
])

// 導航方法
const navigateToSection = (routeName: string, section?: string): void => {
  const routeConfig: { name: string; hash?: string } = { name: routeName }
  if (section) {
    routeConfig.hash = `#${section}`
  }
  router.push(routeConfig)
}

const navigateToDay = (day: number): void => {
  router.push({
    name: 'ItineraryDetail',
    hash: `#day${day}`
  })
}
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// 主要內容包裝
// ===================================
.main-content-wrapper
  margin: 0 auto
  padding: $spacing-md
  max-width: 1200px
  width: 100%

  @include tablet
    padding: 8px $spacing-lg

  @include desktop
    padding: 16px $spacing-xl

// ===================================
// 行程區塊
// ===================================
.schedule-section
  width: 100%

.schedule-header
  margin-bottom: $spacing-xl
  text-align: center

  @include tablet
    margin-bottom: $spacing-2xl

.schedule-subtitle
  margin: 0
  color: $text-secondary
  font-weight: 500
  font-size: 18px

  @include tablet
    font-size: 22px

  @include desktop
    font-size: 24px

// ===================================
// 輪播圖區域
// ===================================
.cover-image-area
  overflow: hidden
  margin-bottom: $spacing-xl
  border-radius: $border-radius-lg
  box-shadow: 0 8px 32px $shadow-medium

  @include tablet
    margin-bottom: $spacing-2xl
    border-radius: $border-radius-xl

.cover-swiper
  width: 100%
  height: 250px

  @include tablet
    height: 350px

  @include desktop
    height: 400px

  @include large-desktop
    height: 450px

.cover-slide
  position: relative
  width: 100%
  height: 100%

  img
    width: 100%
    height: 100%
    object-fit: cover
    object-position: center

// ===================================
// Swiper 自訂樣式 (合併重複區塊)
// ===================================

// 導航按鈕
:deep(.swiper-button-next),
:deep(.swiper-button-prev)
  margin-top: -22px
  width: 44px
  height: 44px
  border-radius: 50%
  background: rgba(255, 255, 255, 0.9)
  box-shadow: 0 2px 8px $shadow-light
  color: $primary-color
  transition: all 0.2s ease

  @include mobile-only
    margin-top: -18px
    width: 36px
    height: 36px

    &:after
      font-size: 14px

  &:after
    font-weight: bold
    font-size: 18px

  &:hover
    background: $accent-color-1
    color: $text-white
    transform: scale(1.1)

:deep(.swiper-button-prev)
  left: 15px

  @include tablet
    left: 20px

:deep(.swiper-button-next)
  right: 15px

  @include tablet
    right: 20px

// 分頁指示器
:deep(.swiper-pagination)
  bottom: 15px

  @include tablet
    bottom: 20px

:deep(.swiper-pagination-bullet)
  width: 12px
  height: 12px
  background: rgba(255, 255, 255, 0.5)
  opacity: 1
  transition: all 0.3s ease

  &:hover
    background: rgba(255, 255, 255, 0.8)
    transform: scale(1.2)

:deep(.swiper-pagination-bullet-active)
  background: $accent-color-2
  box-shadow: 0 2px 8px rgba(230, 168, 107, 0.4)
  transform: scale(1.3)

// ===================================
// 主要功能卡片區域
// ===================================
.schedule-main-grid
  display: grid
  margin-bottom: $spacing-xl
  grid-template-columns: 1fr
  gap: $spacing-md

  @include tablet
    margin-bottom: $spacing-2xl
    grid-template-columns: repeat(2, 1fr)
    gap: $spacing-lg

  @include desktop
    grid-template-columns: repeat(3, 1fr)

  @include large-desktop
    grid-template-columns: repeat(5, 1fr)

.schedule-card
  @include card-hover
  display: flex
  align-items: center
  flex-direction: column
  justify-content: center
  padding: $spacing-lg
  min-height: 120px
  border-radius: $border-radius-lg
  background: $bg-card
  box-shadow: 0 2px 8px $shadow-light
  color: inherit
  text-decoration: none

  @include tablet
    padding: $spacing-xl
    min-height: 140px

  h3
    margin: $spacing-sm 0 0
    color: $text-primary
    text-align: center
    font-weight: 600
    font-size: 16px

    @include tablet
      font-size: 18px

.schedule-icon
  margin-bottom: $spacing-sm
  font-size: 32px

  @include tablet
    font-size: 36px

// 各卡片特殊樣式
.overview-card .schedule-icon
  color: $primary-color

.flight-card .schedule-icon
  color: $accent-color-1

.map-card .schedule-icon
  color: $accent-color-2

.packing-card .schedule-icon
  color: $timeline-medium

.checklist-card .schedule-icon
  color: $timeline-recent

.notice-card .schedule-icon
  color: $timeline-recent

// ===================================
// 每日行程區域
// ===================================
.daily-schedule-section
  margin-top: $spacing-2xl

.daily-title
  margin-bottom: $spacing-lg
  color: $text-primary
  text-align: center
  font-weight: 600
  font-size: 20px

  @include tablet
    text-align: left
    font-size: 24px

.daily-grid
  width: 100%

.daily-block
  display: grid
  grid-template-columns: repeat(2, 1fr)
  gap: $spacing-md

  @include tablet
    grid-template-columns: repeat(3, 1fr)
    gap: $spacing-lg

  @include desktop
    grid-template-columns: repeat(4, 1fr)

  @include large-desktop
    grid-template-columns: repeat(6, 1fr)

.daily-card
  @include card-hover
  display: flex
  align-items: center
  justify-content: center
  padding: $spacing-lg
  min-height: 80px
  border-radius: $border-radius-md
  background: linear-gradient(135deg, #6366F1, #4F46E5) // 預設：調暗的薰衣草紫
  box-shadow: 0 4px 12px $shadow-city
  color: $text-white
  text-decoration: none
  font-weight: 600
  font-size: 16px

  @include tablet
    min-height: 90px
    font-size: 18px

  &:hover
    box-shadow: 0 4px 16px $shadow-medium
    transform: scale(1.02) translateY(-2px)

  // 每日卡片顏色變化
  &:nth-child(odd)
    background: linear-gradient(135deg, #22C55E, #16A34A) // 奇數：調暗的薄荷綠

  &:nth-child(3n)
    background: linear-gradient(135deg, #EC4899, #DB2777) // 3的倍數：調暗的粉紅

// ===================================
// 倒數元件
// ===================================
.countdown-section
  margin-top: 60px

// ===================================
// 響應式調整
// ===================================

// 手機版特殊處理
@include mobile-only
  .main-content-wrapper
    padding: $spacing-sm

  .schedule-card
    padding: $spacing-md
    min-height: 100px

    h3
      font-size: 14px

  .schedule-icon
    font-size: 28px

  .daily-card
    min-height: 70px
    font-size: 14px

// 大桌面版優化
@include large-desktop
  .main-content-wrapper
    max-width: 1400px

  .cover-swiper
    height: 500px
</style>
