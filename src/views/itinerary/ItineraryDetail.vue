<template>
  <div class="itinerary-detail-container">
    <!-- 麵包屑 -->
    <BreadcrumbNav />

    <!-- 浮動導航目錄 -->
    <nav class="itinerary-detail-floating-nav" :class="{ 'itinerary-detail-nav-hidden': !showNav }">
      <div class="itinerary-detail-nav-toggle" @click="toggleNav">
        <span class="itinerary-detail-nav-icon">📋</span>
      </div>
      <div class="itinerary-detail-nav-menu" v-show="navOpen">
        <div class="itinerary-detail-nav-section">
          <h4>📋 行程資訊</h4>
          <a v-for="section in infoSections" :key="section.id" :href="`#${section.id}`"
            @click="scrollToSection(section.id)" :class="{ 'itinerary-detail-active': activeSection === section.id }">
            {{ section.name }}
          </a>
        </div>
        <div class="itinerary-detail-nav-section">
          <h4>📅 每日行程</h4>
          <a v-for="section in dailySections" :key="section.id" :href="`#${section.id}`"
            @click="scrollToSection(section.id)" :class="{ 'itinerary-detail-active': activeSection === section.id }">
            {{ section.name }}
          </a>
        </div>
      </div>
    </nav>

    <!-- 主要內容區域 -->
    <div class="itinerary-detail-schedule-content">
      <!-- 所有區域統一渲染 -->
      <section v-for="section in allSections" :key="section.id" :id="section.id"
        :class="`itinerary-detail-schedule-section ${getSectionClass(section)}`">
        <div class="itinerary-detail-section-container">
          <!-- 顯示圖片 -->
          <div v-for="(image, index) in generateImages(section)" :key="index" class="itinerary-detail-image-container">
            <img :src="image.src" :alt="image.alt" class="itinerary-detail-schedule-image" />
          </div>

          <!-- iframe 區域（如果有的話） -->
          <!-- <div v-if="section.iframe" class="itinerary-detail-iframe-container">
            <iframe :src="section.iframe.src" :title="section.iframe.title || section.name"
              :width="section.iframe.width || '100%'" :height="section.iframe.height || '600px'"
              :frameborder="section.iframe.frameborder || '0'"
              :allowfullscreen="section.iframe.allowfullscreen || false" class="itinerary-detail-iframe"></iframe>
          </div> -->
        </div>
      </section>
    </div>

    <!-- 回到頂部按鈕 -->
    <button class="itinerary-detail-back-to-top" @click="scrollToTop" v-show="showBackToTop">
      ↑
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Ref } from 'vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

// 定義區域配置類型
interface SectionConfig {
  type: 'info' | 'daily'
  id: string
  name: string
  pages: string[]
  day?: number
  iframe?: {
    src: string
    title?: string
    width?: string
    height?: string
    frameborder?: string
    allowfullscreen?: boolean
  }
}

const route = useRoute()

// 響應式數據
const showNav: Ref<boolean> = ref(true)
const navOpen: Ref<boolean> = ref(false)
const showBackToTop: Ref<boolean> = ref(false)
const activeSection: Ref<string> = ref('cover')

// 統一的區域配置
const allSections: Ref<SectionConfig[]> = ref([
  { type: 'info', id: 'cover', name: '封面', pages: ['page1'] },
  { type: 'info', id: 'flight', name: '航班資訊', pages: ['page2'] },
  { type: 'info', id: 'packing', name: '必帶物品', pages: ['page3', 'page4'] },
  { type: 'info', id: 'map', name: '路線地圖', pages: ['page5'] },
  { type: 'info', id: 'overview', name: '行程總覽', pages: ['page6'] },
  { type: 'daily', id: 'day1', day: 1, name: '第1天', pages: ['page7', 'page8'] },
  { type: 'daily', id: 'day2', day: 2, name: '第2天', pages: ['page9'] },
  { type: 'daily', id: 'day3', day: 3, name: '第3天', pages: ['page10'] },
  { type: 'daily', id: 'day4', day: 4, name: '第4天', pages: ['page11'] },
  { type: 'daily', id: 'day5', day: 5, name: '第5天', pages: ['page12'] },
  { type: 'daily', id: 'day6', day: 6, name: '第6天', pages: ['page13'] }
])

// 計算屬性：行程資訊區域
const infoSections = computed(() =>
  allSections.value.filter(section => section.type === 'info')
)

// 計算屬性：每日行程區域
const dailySections = computed(() =>
  allSections.value.filter(section => section.type === 'daily')
)

// 計算屬性：總天數
// const totalDays = computed(() => dailySections.value.length)

// 計算屬性：所有區域ID供滾動檢測使用
const allSectionIds = computed(() =>
  allSections.value.map(section => section.id)
)

// 動態生成圖片配置
const generateImages = (section: SectionConfig) => {
  return section.pages.map((filename, index) => ({
    src: `src/assets/img/itinerary/${filename}.jpg`,
    alt: section.pages.length > 1
      ? `${section.name} - 第${index + 1}頁`
      : section.name
  }))
}

// 獲取區域樣式類別
const getSectionClass = (section: SectionConfig): string => {
  const classMap: { [key: string]: string } = {
    'cover': 'cover-section',
    'flight': 'flight-section',
    'packing': 'packing-section',
    'map': 'map-section',
    'overview': 'overview-section'
  }

  if (section.type === 'daily') {
    return 'itinerary-detail-daily-section'
  }

  return classMap[section.id] || ''
}

// 切換導航顯示
const toggleNav = (): void => {
  navOpen.value = !navOpen.value
}

// 滾動到指定區域
const scrollToSection = (sectionId: string): void => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
  navOpen.value = false // 關閉導航選單
}

// 滾動到頂部
const scrollToTop = (): void => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 處理滾動事件
const handleScroll = (): void => {
  const scrollY = window.scrollY

  // 控制返回頂部按鈕顯示
  showBackToTop.value = scrollY > 300

  // 控制導航顯示/隱藏
  showNav.value = scrollY < 100 || navOpen.value

  // 更新當前活動區域
  updateActiveSection()
}

// 更新當前活動區域
const updateActiveSection = (): void => {
  const scrollPos = window.scrollY + 100

  for (let i = allSectionIds.value.length - 1; i >= 0; i--) {
    const section = document.getElementById(allSectionIds.value[i])
    if (section && section.offsetTop <= scrollPos) {
      activeSection.value = allSectionIds.value[i]
      break
    }
  }
}

// 處理路由中的錨點
const handleRouteHash = (): void => {
  if (route.hash) {
    const sectionId = route.hash.substring(1) // 移除 # 符號
    setTimeout(() => {
      scrollToSection(sectionId)
    }, 100)
  }
}

// 在組件載入時執行
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleRouteHash() // 處理錨點跳轉
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// 主容器 (Mobile First)
// ===================================
.itinerary-detail-container
  width: 100%
  min-height: 100vh
  background: $bg-primary

  @include tablet
    max-width: 700px
    margin: 0 auto

  @include desktop
    max-width: 800px

  @include large-desktop
    max-width: 900px

// ===================================
// 頁面標題 (Mobile First)
// ===================================
.itinerary-detail-title
  margin: $spacing-md 0 $spacing-lg
  padding: 0 $spacing-md
  color: $text-primary
  text-align: center
  font-weight: 700
  font-size: 20px

  @include tablet
    margin: $spacing-lg 0 $spacing-xl
    font-size: 28px

  @include desktop
    margin: $spacing-xl 0 $spacing-2xl
    font-size: 32px

  @include large-desktop
    font-size: 36px

// ===================================
// 主要內容區域 (Mobile First)
// ===================================
.itinerary-detail-schedule-content
  width: 100%
  padding: 0 $spacing-sm $spacing-lg

  @include tablet
    padding: 0 $spacing-md $spacing-xl

  @include desktop
    padding: 0 $spacing-lg $spacing-2xl

  @include large-desktop
    padding: 0 $spacing-xl $spacing-2xl

// ===================================
// 內容區塊 (Mobile First)
// ===================================
.itinerary-detail-schedule-section
  margin-bottom: $spacing-lg

  @include tablet
    margin-bottom: $spacing-xl

  @include desktop
    margin-bottom: $spacing-2xl

  &:last-child
    margin-bottom: 0

.itinerary-detail-section-container
  width: 100%

// ===================================
// 圖片容器 (Mobile First)
// ===================================
.itinerary-detail-image-container
  overflow: hidden
  margin-bottom: $spacing-md
  border-radius: $border-radius-md
  background: $bg-card
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1)

  @include tablet
    margin-bottom: $spacing-lg
    border-radius: $border-radius-lg
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12)

  @include desktop
    margin-bottom: $spacing-xl
    border-radius: $border-radius-xl
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15)

  &:last-child
    margin-bottom: 0

.itinerary-detail-schedule-image
  display: block
  width: 100%
  height: auto
  transition: transform 0.3s ease

  &:hover
    @include tablet
      transform: scale(1.02)

// ===================================
// iframe 區域 (Mobile First)
// ===================================
.itinerary-detail-iframe-container
  position: relative
  min-height: 300px
  width: 100%
  overflow: hidden
  border-radius: $border-radius-md
  background: $bg-card
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1)

  @include tablet
    min-height: 500px
    border-radius: $border-radius-lg
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12)

  @include desktop
    min-height: 700px
    border-radius: $border-radius-xl
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15)

  @include large-desktop
    min-height: 800px

.itinerary-detail-iframe
  display: block
  min-height: inherit
  width: 100%
  height: 100%
  border: none

// ===================================
// 浮動導航 (Mobile First)
// ===================================
.itinerary-detail-floating-nav
  position: fixed
  top: 50%
  right: $spacing-sm
  z-index: 100
  transition: all 0.3s ease-in-out
  transform: translateY(-50%)

  @include tablet
    right: $spacing-md

  @include desktop
    right: $spacing-lg

  @include large-desktop
    right: calc((100vw - 900px) / 2 + #{$spacing-lg})

  // 隱藏狀態
  &.itinerary-detail-nav-hidden
    opacity: 0
    transform: translateY(-50%) translateX(80px)
    pointer-events: none

    @include tablet
      transform: translateY(-50%) translateX(100px)

// 導航切換按鈕 (Mobile First)
.itinerary-detail-nav-toggle
  @include flex-center
  width: 40px
  height: 40px
  border-radius: 50%
  background: $primary-color
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2)
  color: $text-white
  cursor: pointer
  transition: all 0.2s ease

  @include tablet
    width: 48px
    height: 48px
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25)

  @include desktop
    width: 52px
    height: 52px

  &:hover
    @include tablet
      background: rgba(45, 55, 72, 1)
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3)
      transform: scale(1.1)

.itinerary-detail-nav-icon
  font-size: 16px

  @include tablet
    font-size: 20px

  @include desktop
    font-size: 22px

// 導航選單 (Mobile First)
.itinerary-detail-nav-menu
  position: absolute
  top: 50%
  right: 100%
  margin-right: $spacing-xs
  padding: $spacing-sm
  min-width: 160px
  border: 1px solid $border-light
  border-radius: $border-radius-md
  background: $bg-card
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2)
  transform: translateY(-50%)

  @include tablet
    margin-right: $spacing-sm
    padding: $spacing-md
    min-width: 200px
    border-radius: $border-radius-lg
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25)

  @include desktop
    padding: $spacing-lg
    min-width: 220px

  // 小箭頭指向切換按鈕
  &::after
    position: absolute
    top: 50%
    right: -8px
    transform: translateY(-50%)
    width: 0
    height: 0
    border-top: 6px solid transparent
    border-bottom: 6px solid transparent
    border-left: 8px solid $bg-card
    content: ''

    @include tablet
      right: -10px
      border-top: 8px solid transparent
      border-bottom: 8px solid transparent
      border-left: 10px solid $bg-card

.itinerary-detail-nav-section
  margin-bottom: $spacing-sm

  @include tablet
    margin-bottom: $spacing-md

  &:last-child
    margin-bottom: 0

  h4
    margin-bottom: $spacing-xs
    padding-bottom: $spacing-xs
    border-bottom: 1px solid $border-light
    color: $text-secondary
    font-weight: 600
    font-size: 12px

    @include tablet
      margin-bottom: $spacing-sm
      font-size: 14px

    @include desktop
      font-size: 15px

  a
    display: block
    padding: $spacing-xs
    border-radius: $border-radius-sm
    color: $text-muted
    text-decoration: none
    font-size: 12px
    transition: all 0.2s ease

    @include tablet
      padding: $spacing-xs $spacing-sm
      font-size: 14px

    @include desktop
      padding: $spacing-sm
      font-size: 15px

    &:hover
      background: rgba(56, 178, 172, 0.1)
      color: $accent-color-1

      @include tablet
        transform: translateX(4px)

    &.itinerary-detail-active
      background: rgba(230, 168, 107, 0.1)
      color: $accent-color-2
      font-weight: 500

// ===================================
// 回到頂部按鈕 (Mobile First)
// ===================================
.itinerary-detail-back-to-top
  @include flex-center
  position: fixed
  right: $spacing-sm
  bottom: $spacing-md
  z-index: 99
  width: 40px
  height: 40px
  border: none
  border-radius: 50%
  background: $accent-color-2
  color: $text-white
  font-weight: bold
  font-size: 16px
  cursor: pointer
  transition: all 0.3s ease

  @include tablet
    right: $spacing-md
    bottom: $spacing-lg
    width: 48px
    height: 48px
    font-size: 18px

  @include desktop
    right: $spacing-lg
    bottom: $spacing-xl
    width: 52px
    height: 52px
    font-size: 20px

  @include large-desktop
    right: calc((100vw - 900px) / 2 + #{$spacing-lg})

  &:hover
    @include tablet
      background: rgba(212, 148, 27, 1)
      box-shadow: 0 8px 25px rgba(230, 168, 107, 0.6)
      transform: translateY(-4px) scale(1.1)

  &:active
    transform: translateY(-2px) scale(1.05)

    @include tablet
      transform: translateY(-2px) scale(1.05)

// ===================================
// 特殊區塊樣式 (Mobile First)
// ===================================

// 封面區塊
.cover-section
  .itinerary-detail-image-container
    position: relative

    &::after
      position: absolute
      top: 0
      right: 0
      bottom: 0
      left: 0
      background: linear-gradient(45deg, transparent 70%, rgba(56, 178, 172, 0.1))
      content: ''
      pointer-events: none

// 航班資訊區塊
.flight-section
  .itinerary-detail-image-container
    border-left: 2px solid $accent-color-1

    @include tablet
      border-left: 4px solid $accent-color-1

// 必帶物品區塊
.packing-section
  .itinerary-detail-image-container
    border-left: 2px solid $accent-color-2

    @include tablet
      border-left: 4px solid $accent-color-2

// 地圖區塊
.map-section
  .itinerary-detail-image-container
    border-left: 2px solid $primary-color

    @include tablet
      border-left: 4px solid $primary-color

// 總覽區塊
.overview-section
  .itinerary-detail-image-container
    border-left: 2px solid $timeline-recent

    @include tablet
      border-left: 4px solid $timeline-recent

// 每日行程區塊
.itinerary-detail-daily-section
  .itinerary-detail-image-container
    position: relative
    border-left: 2px solid $city-gradient-start

    @include tablet
      border-left: 4px solid $city-gradient-start
</style>