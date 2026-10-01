<template>
  <div class="main-content-wrapper">
    <div class="schedule-section">
      <!-- Banner 輪播區域 -->
      <LobbyBanner />

      <!-- 有行程：行程手冊 + 每日行程 -->
      <template v-if="hasItinerary">
        <section class="home-block" aria-labelledby="handbook-title">
          <div class="block-head">
            <span class="block-bar" aria-hidden="true"></span>
            <h2 id="handbook-title" class="block-title">行程手冊</h2>
          </div>
          <div class="handbook-grid">
            <button v-for="card in mainCards" :key="card.id" type="button" :class="['handbook-card', card.class]"
              @click="navigateToSection(card.route, card.section, card.title)">
              <span class="tape" aria-hidden="true"></span>
              <span class="handbook-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                  stroke-linejoin="round" aria-hidden="true" v-html="card.icon"></svg>
              </span>
              <span class="handbook-title">{{ card.title }}</span>
            </button>
          </div>
        </section>

        <section class="home-block" aria-labelledby="daily-title">
          <div class="block-head">
            <span class="block-bar" aria-hidden="true"></span>
            <h2 id="daily-title" class="block-title">每日詳細行程</h2>
            <span class="block-count">共 {{ DAILY_SECTIONS.length }} 天</span>
          </div>
          <!-- 超過兩排在區塊內捲動 -->
          <div class="daily-scroll">
            <div class="daily-grid" :style="{ '--cols': Math.min(DAILY_SECTIONS.length, 7) }">
              <button v-for="section in DAILY_SECTIONS" :key="section.id" type="button" class="day-card"
                :aria-label="`Day ${section.day}`" @click="navigateToDay(section.day!)">
                <span class="day-card__label" aria-hidden="true">DAY</span>
                <span class="day-card__num" aria-hidden="true">{{ section.day }}</span>
              </button>
            </div>
          </div>
        </section>
      </template>

      <!-- 沒行程：貓咪空狀態卡 -->
      <section v-else class="empty-trip-card" aria-label="下一趟行程">
        <span class="tape tape--yellow" aria-hidden="true"></span>
        <span class="tape tape--blue" aria-hidden="true"></span>
        <img src="@/assets/img/sym/cat_travel.png" alt="背著背包的虎斑貓" class="empty-trip-card__cat" />
        <div class="empty-trip-card__body">
          <p class="empty-trip-card__text">行程還沒排好，豆豆已經先把背包背起來了。</p>
          <div class="empty-trip-card__actions">
            <router-link to="/trips" class="btn btn--primary" @click="trackEmptyCard('看看旅程列表', '/trips')">
              看看旅程列表
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </router-link>
            <router-link to="/travel-gallery" class="btn btn--ghost"
              @click="trackEmptyCard('翻翻我的足跡', '/travel-gallery')">翻翻我的足跡</router-link>
          </div>
        </div>
      </section>


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
import { DAILY_SECTIONS, HAS_ITINERARY } from '@/constants/itinerary'

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

// 行程開關
const hasItinerary = HAS_ITINERARY

// 主要功能卡片數據
const mainCards: Ref<MainCard[]> = ref([
  {
    id: 'overview',
    route: 'ItineraryDetail',
    section: 'overview',
    class: 'overview-card',
    icon: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 11h6M9 15h4"/>',
    title: '行程總覽'
  },
  {
    id: 'flight',
    route: 'ItineraryDetail',
    section: 'flight',
    class: 'flight-card',
    icon: '<path d="M2 16l20-8-6 12-3-5-5 3z"/><path d="M13 15l9-7"/>',
    title: '航班資訊'
  },
  {
    id: 'map',
    route: 'ItineraryDetail',
    section: 'map',
    class: 'map-card',
    icon: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    title: '路線地圖'
  },
  {
    id: 'packing',
    route: 'ItineraryDetail',
    section: 'packing',
    class: 'packing-card',
    icon: '<path d="M6 10a6 6 0 0 1 12 0v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M9 5V3h6v2"/><path d="M9 14h6v4H9z"/>',
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
      has_itinerary: hasItinerary,
      device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
    })
  }

  // 入口卡只在有行程時顯示
  router.push({
    name: routeName,
    hash: section ? `#${section}` : undefined
  })
}

// 沒行程卡片的按鈕追蹤
const trackEmptyCard = (name: string, path: string): void => {
  event('home_card_click', {
    source: 'home_empty_card',
    item_name: name,
    item_path: path,
    category: '首頁空狀態',
    has_itinerary: hasItinerary,
    device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
  })
}

const navigateToDay = (day: number): void => {
  // GA4 追蹤
  event('home_itinerary_card_click', {
    source: 'home_itinerary_card',
    item_name: `Day${day}`,
    item_path: 'ItineraryDetail',
    category: '首頁每日行程',
    day_number: day,
    has_itinerary: hasItinerary,
    device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
  })

  router.push({
    name: 'ItineraryDetail',
    hash: `#day${day}`
  })
}
</script>

<style lang="sass" scoped>
// ===================================
// 主要內容包裝
// ===================================
.main-content-wrapper
  margin: 0 auto
  padding: $spacing-sm
  max-width: 1200px
  width: 100%
  @include tablet
    padding: 8px $spacing-lg
  @include desktop
    padding: 16px $spacing-xl

.schedule-section
  width: 100%

// ===================================
// 區塊標題
// ===================================
.home-block
  display: flex
  flex-direction: column
  gap: $spacing-md
  margin-bottom: $spacing-xl
  @include tablet
    gap: 20px
    margin-bottom: 44px

.block-head
  display: flex
  align-items: center
  gap: 10px

.block-bar
  width: 8px
  height: 20px
  border-radius: 3px
  background: $nb-go
  transform: rotate(-4deg)
  @include tablet
    height: 22px

.block-title
  margin: 0
  color: $nb-ink
  font-weight: 700
  font-size: 22px
  font-family: $font-display
  @include tablet
    font-size: 28px

// ===================================
// 紙膠帶（共用）
// ===================================
.tape
  position: absolute
  top: -9px
  left: 50%
  margin-left: -28px
  width: 56px
  height: 16px
  pointer-events: none
  @include tablet
    top: -11px
    margin-left: -40px
    width: 80px
    height: 22px

// ===================================
// 行程手冊（入口卡）
// ===================================
.handbook-grid
  display: grid
  grid-template-columns: repeat(2, minmax(0, 1fr))
  gap: $spacing-md 12px
  padding-top: 4px
  @include desktop
    grid-template-columns: repeat(4, minmax(0, 1fr))
    gap: $spacing-lg

.handbook-card
  position: relative
  display: flex
  align-items: center
  flex-direction: column
  gap: 10px
  padding: 18px 10px 16px
  border: 1px solid $nb-line
  border-radius: 14px
  background: $nb-card
  box-shadow: $nb-card-shadow
  color: $nb-ink
  cursor: pointer
  transition: transform 0.2s ease
  @include tablet
    gap: 14px
    padding: 30px 16px 24px
    border-radius: 18px
  &:hover
    transform: translateY(-3px) rotate(-0.5deg)
  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 3px

.handbook-icon
  display: flex
  align-items: center
  justify-content: center
  width: 52px
  height: 52px
  border-radius: 50%
  @include tablet
    width: 72px
    height: 72px
    svg
      width: 34px
      height: 34px
  svg
    width: 26px
    height: 26px

.handbook-title
  font-weight: 700
  font-size: 18px
  font-family: $font-display
  @include tablet
    font-size: 22px

// 各卡片的顏色
@mixin handbook-color($soft, $strong, $tape)
  .handbook-icon
    background: $soft
    color: $strong
  .tape
    background: $tape

.overview-card
  @include handbook-color($nb-go-soft, $nb-go-strong, $nb-tape-blue)

.flight-card
  @include handbook-color($nb-fun-soft, $nb-fun-strong, $nb-tape-yellow)
  .tape
    transform: rotate(3deg)

.map-card
  @include handbook-color($nb-footprint-soft, $nb-footprint-strong, rgba(240, 176, 140, 0.6))
  .tape
    transform: rotate(-2deg)

.packing-card
  @include handbook-color(#E6F0DD, #3F6224, rgba(170, 200, 140, 0.6))

// ===================================
// 每日行程
// ===================================
.block-count
  padding: 2px 10px
  border-radius: 999px
  background: $nb-footprint-soft
  color: $nb-footprint-strong
  font-weight: 700
  font-size: 13px

// 外層：最多顯示兩排半，其餘在區塊內捲動
.daily-scroll
  overflow-y: auto
  scrollbar-width: thin
  scrollbar-color: $nb-dash transparent
  --row-gap: 10px
  margin: calc(var(--pad-y) * -1) -4px 0
  padding: var(--pad-y) 4px
  max-height: calc(var(--day-h) * 2.5 + var(--row-gap) * 2 + var(--pad-y))
  --day-h: 78px
  // 上下留白給卡片陰影與 hover 位移
  --pad-y: 6px
  @include desktop
    --row-gap: 18px
    --day-h: 118px

// 手機：一排 4 張
// 平板以上：欄數 = 天數（最多 7 欄），每張最寬 180px，放不滿時整排置中
.daily-grid
  display: grid
  grid-template-columns: repeat(4, minmax(0, 1fr))
  gap: var(--row-gap) 8px
  @include tablet
    justify-content: center
    grid-template-columns: repeat(var(--cols), minmax(0, 180px))
    column-gap: 12px
  @include desktop
    column-gap: 18px

.day-card
  display: flex
  overflow: hidden
  flex-direction: column
  padding: 0
  height: var(--day-h)
  border: 1px solid $nb-line
  border-radius: 10px
  background: $nb-card
  box-shadow: $nb-card-shadow
  color: $nb-ink
  cursor: pointer
  transition: transform 0.2s ease
  @include desktop
    border-radius: 12px
  &:hover
    transform: translateY(-3px)
  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

.day-card__label
  padding: 4px 0
  background: $nb-accent
  color: $nb-card
  letter-spacing: 2px
  font-weight: 700
  font-size: 10px
  @include desktop
    padding: 6px 0
    letter-spacing: 3px
    font-size: 13px

.day-card__num
  display: flex
  align-items: center
  flex: 1
  justify-content: center
  border-top: 2px dashed $nb-dash
  // 文楷粗體偏細，加描邊增加份量
  -webkit-text-stroke: 0.6px currentColor
  font-weight: 700
  font-size: 28px
  font-family: $font-display
  line-height: 1
  @include desktop
    -webkit-text-stroke: 1px currentColor
    font-size: 48px

// ===================================
// 沒行程：貓咪空狀態卡
// ===================================
.empty-trip-card
  position: relative
  display: flex
  align-items: center
  flex-direction: column
  gap: 10px
  margin-bottom: $spacing-xl
  padding: 24px 20px
  border: 1px solid $nb-line
  border-radius: 18px
  background: $nb-card
  box-shadow: $nb-card-shadow
  text-align: center
  @include tablet
    align-items: flex-end
    flex-direction: row
    gap: 40px
    margin-bottom: 44px
    padding: 36px 48px 0 60px
    border-radius: 20px
    text-align: left
  .tape
    left: 30px
    margin-left: 0
    transform: rotate(-5deg)
    @include tablet
      left: 60px
  .tape--yellow
    background: $nb-tape-yellow
  .tape--blue
    right: 34px
    left: auto
    background: $nb-tape-blue
    transform: rotate(6deg)
    @include tablet
      right: 70px

.empty-trip-card__cat
  width: auto
  height: 170px
  @include tablet
    flex-shrink: 0
    height: 240px

.empty-trip-card__body
  display: flex
  flex-direction: column
  gap: 10px
  @include tablet
    align-self: center
    gap: 14px
    padding-bottom: 36px

.empty-trip-card__text
  margin: 0
  max-width: 560px
  color: $nb-muted
  font-size: 14px
  line-height: 1.7
  @include tablet
    font-size: 16px

.empty-trip-card__actions
  display: flex
  flex-direction: column
  gap: 10px
  margin-top: 6px
  width: 100%
  @include tablet
    flex-direction: row
    width: auto

.btn
  display: inline-flex
  align-items: center
  justify-content: center
  gap: 8px
  padding: 0 24px
  min-height: 48px
  border-radius: 999px
  text-decoration: none
  font-size: 15px
  transition: background-color 0.2s ease
  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 3px

.btn--primary
  background: $nb-accent
  color: $nb-card
  font-weight: 700
  &:hover
    background: $nb-accent-hover

.btn--ghost
  border: 1.5px dashed #C9B89F
  color: $nb-ink
  font-weight: 500
  &:hover
    background: $nb-paper

// ===================================
// 倒數元件
// ===================================
.countdown-section
  margin-top: 40px
  @include tablet
    margin-top: 28px
</style>
