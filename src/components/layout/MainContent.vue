<template>
  <div class="main-content-wrapper">
    <div class="schedule-section">
      <!-- Banner 輪播區域 -->
      <LobbyBanner />

      <!-- 主要功能區域 -->
      <div class="schedule-main-grid">
        <div v-for="card in mainCards" :key="card.id" :class="['schedule-card', card.class]"
          @click="navigateToSection(card.route, card.section, card.title)">
          <div class="schedule-icon">{{ card.icon }}</div>
          <h3>{{ card.title }}</h3>
        </div>
      </div>

      <!-- 每日行程區域 -->
      <div class="daily-schedule-section">
        <div class="section-title">📅 每日詳細行程</div>
        <div class="daily-grid">
          <div class="daily-block">
            <!-- 有行程時顯示天數卡片 -->
            <div v-if="hasItinerary" v-for="day in totalDays" :key="day" class="daily-card" @click="navigateToDay(day)">
              Day{{ day }}
            </div>

            <!-- 沒有行程時顯示 Coming Soon -->
            <div v-else class="coming-soon-card">
              <div class="coming-soon-icon">🚀</div>
              <div class="coming-soon-text">Coming Soon</div>
              <div class="coming-soon-subtitle">敬請期待精彩行程</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 小遊戲區域 -->
      <!-- <div class="minigame-section">
        <div class="section-title">🎮 小小樂趣</div>
        <MiniGame />
      </div> -->

      <!-- 倒數計時區域 -->
      <div class="countdown-section">
        <TravelCountdown />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { event } from 'vue-gtag'
import type { Ref } from 'vue'
import TravelCountdown from '@/components/layout/travel-countdown/TravelCountdown.vue'
import LobbyBanner from '@/components/common/LobbyBanner.vue'
// import MiniGame from '@/views/games/MiniGame.vue'

// 定義類型接口
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

// 行程開關控制
const hasItinerary: Ref<boolean> = ref(false)

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
const navigateToSection = (routeName: string, section?: string, cardTitle?: string): void => {
  // GA4 追蹤
  if (cardTitle) {
    event('home_card_click', {
      source: 'home_card',
      item_name: cardTitle,
      item_path: routeName,
      category: '首頁功能卡片',
      section: section || '',
      has_itinerary: hasItinerary.value,
      device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
    })
  }

  if (!hasItinerary.value) {
    // 沒有行程時，統一導向基本頁面，並傳遞狀態
    router.push({
      name: routeName,
      query: { hasItinerary: 'false' }
    })
    return
  }

  // 有行程時使用原本邏輯
  const routeConfig: { name: string; hash?: string; query: any } = {
    name: routeName,
    query: { hasItinerary: 'true' }
  }
  if (section) {
    routeConfig.hash = `#${section}`
  }
  router.push(routeConfig)
}

const navigateToDay = (day: number): void => {
  // GA4 追蹤
  event('home_itinerary_card_click', {
    source: 'home_itinerary_card',
    item_name: `Day${day}`,
    item_path: 'ItineraryDetail',
    category: '首頁每日行程',
    day_number: day,
    has_itinerary: hasItinerary.value,
    device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
  })

  if (!hasItinerary.value) {
    // 沒有行程時，統一導向基本頁面
    router.push({
      name: 'ItineraryDetail',
      query: { hasItinerary: 'false' }
    })
    return
  }

  router.push({
    name: 'ItineraryDetail',
    hash: `#day${day}`,
    query: { hasItinerary: 'true' }
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
  @include card-hover
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

.section-title
  margin-bottom: $spacing-lg
  color: $text-primary
  text-align: center
  font-weight: 600
  font-size: 20px
  @include tablet
    text-align: left
    font-size: 24px

// ===================================
// 每日行程區域
// ===================================
.daily-schedule-section
  margin-top: $spacing-2xl

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
  display: flex
  align-items: center
  justify-content: center
  padding: $spacing-lg
  min-height: 80px
  border-radius: $border-radius-md
  background: linear-gradient(135deg, #6366F1, #4F46E5)
  box-shadow: 0 4px 12px $shadow-city
  color: $text-white
  text-decoration: none
  font-weight: 600
  font-size: 16px

  @include card-hover
  @include tablet
    min-height: 90px
    font-size: 18px

  &:hover
    box-shadow: 0 4px 16px $shadow-medium
    transform: scale(1.02) translateY(-2px)

  // 每日卡片顏色變化
  &:nth-child(odd)
    background: linear-gradient(135deg, #22C55E, #16A34A)

  &:nth-child(3n)
    background: linear-gradient(135deg, #EC4899, #DB2777)

// ===================================
// Coming Soon 卡片樣式
// ===================================
.coming-soon-card
  display: flex
  align-items: center
  flex-direction: column
  justify-content: center
  padding: $spacing-xl
  min-height: 200px
  border-radius: $border-radius-lg
  background: linear-gradient(135deg, #F3F4F6, #E5E7EB)
  box-shadow: 0 4px 12px $shadow-light
  color: $text-secondary
  grid-column: 1 / -1 // 佔滿整行
  @include tablet
    padding: $spacing-2xl
    min-height: 240px

.coming-soon-icon
  margin-bottom: $spacing-md
  font-size: 48px
  opacity: 0.8
  @include tablet
    font-size: 64px
.coming-soon-text
  margin-bottom: $spacing-sm
  font-weight: 600
  font-size: 24px
  @include tablet
    font-size: 28px
.coming-soon-subtitle
  text-align: center
  font-size: 14px
  opacity: 0.7
  @include tablet
    font-size: 16px

// ===================================
// 小遊戲元件
// ===================================
.minigame-section
  margin-top: $spacing-2xl

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

  .coming-soon-card
    padding: $spacing-lg
    min-height: 160px

  .coming-soon-icon
    font-size: 40px

  .coming-soon-text
    font-size: 20px

  .coming-soon-subtitle
    font-size: 12px

// 大桌面版優化
@include large-desktop
  .main-content-wrapper
    max-width: 1400px
</style>
