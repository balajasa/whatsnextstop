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
          <a
            v-for="section in infoSections"
            :key="section.id"
            :href="`#${section.id}`"
            @click="scrollToSection(section.id)"
            :class="{ 'itinerary-detail-active': activeSection === section.id }"
          >
            {{ section.name }}
          </a>
        </div>
        <div class="itinerary-detail-nav-section">
          <h4>📅 每日行程</h4>
          <a
            v-for="day in totalDays"
            :key="day"
            :href="`#day${day}`"
            @click="scrollToSection(`day${day}`)"
            :class="{ 'itinerary-detail-active': activeSection === `day${day}` }"
          >
            第{{ day }}天
          </a>
        </div>
      </div>
    </nav>

    <h1 class="itinerary-detail-title">行程規劃</h1>

    <!-- 主要內容區域 -->
    <div class="itinerary-detail-schedule-content">
      <!-- 行程資訊區域 -->
      <section
        v-for="section in infoSections"
        :key="section.id"
        :id="section.id"
        :class="`itinerary-detail-schedule-section ${section.class}`"
      >
        <div class="itinerary-detail-section-container">
          <!-- 顯示圖片 -->
          <div
            v-for="(image, index) in section.images"
            :key="index"
            class="itinerary-detail-image-container"
          >
            <img :src="image.src" :alt="image.alt" class="itinerary-detail-schedule-image" />
          </div>
        </div>
      </section>

      <!-- 每日詳細行程 -->
      <section
        v-for="day in totalDays"
        :key="day"
        :id="`day${day}`"
        class="itinerary-detail-schedule-section itinerary-detail-daily-section"
      >
        <div class="itinerary-detail-section-container">
          <div class="itinerary-detail-image-container">
            <img
              :src="`/src/assets/img/itinerary/page${day + 6}.jpg`"
              :alt="`第${day}天詳細行程`"
              class="itinerary-detail-schedule-image"
            />
          </div>
        </div>
      </section>

      <!-- 顯示所有的 iframe，放在最後 -->
      <section
        v-for="section in infoSections.filter(s => s.iframe)"
        :key="`${section.id}-iframe`"
        :id="`${section.id}-iframe`"
        class="itinerary-detail-schedule-section itinerary-detail-iframe-section"
      >
        <div class="itinerary-detail-section-container">
          <div v-if="section.iframe" class="itinerary-detail-iframe-container">
            <iframe
              :src="section.iframe.src"
              :title="section.iframe.title || section.name"
              :width="section.iframe.width || '100%'"
              :height="section.iframe.height || '600px'"
              :frameborder="section.iframe.frameborder || '0'"
              :allowfullscreen="section.iframe.allowfullscreen || false"
              class="itinerary-detail-iframe"
            ></iframe>
          </div>
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
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
import { InfoSection } from '../types/IItinerary'

const route = useRoute()

// 響應式數據
const showNav: Ref<boolean> = ref(true)
const navOpen: Ref<boolean> = ref(false)
const showBackToTop: Ref<boolean> = ref(false)
const activeSection: Ref<string> = ref('cover')

// 總天數配置
const totalDays: Ref<number> = ref(6)

// 行程資訊區域配置
const infoSections: Ref<InfoSection[]> = ref([
  {
    id: 'cover',
    name: '封面',
    class: 'cover-section',
    images: [{ src: '/src/assets/img/itinerary/page1.jpg', alt: '行程首頁封面' }]
  },
  {
    id: 'flight',
    name: '航班資訊',
    class: 'flight-section',
    images: [{ src: '/src/assets/img/itinerary/page2.jpg', alt: '航班資訊' }]
  },
  {
    id: 'packing',
    name: '必帶物品',
    class: 'packing-section',
    images: [
      { src: '/src/assets/img/itinerary/page3.jpg', alt: '必帶物品清單第1頁' },
      { src: '/src/assets/img/itinerary/page4.jpg', alt: '必帶物品清單第2頁' }
    ]
  },
  {
    id: 'map',
    name: '路線地圖',
    class: 'map-section',
    images: [{ src: '/src/assets/img/itinerary/page5.jpg', alt: '遊玩路線圖' }]
  },
  {
    id: 'overview',
    name: '行程總覽',
    class: 'overview-section',
    images: [{ src: '/src/assets/img/itinerary/page6.jpg', alt: '行程總覽' }]
  },
  {
    id: 'notice',
    name: '注意事項',
    class: 'notice-section',
    images: [],
    iframe: {
      src: 'https://docs.google.com/document/d/e/2PACX-1vTK7btGRH5N2Cc5HM3HV12U5jcWTZLBXy4Z3viVb_CKprY8Qh8QHMoe2PSSYydGQc41qC350fzbiV_i/pub?embedded=true',
      width: '100%',
      height: '800px',
      frameborder: '0',
      allowfullscreen: false
    }
  }
])

// 計算屬性：生成所有區域ID供滾動檢測使用
const allSections = computed((): string[] => {
  const info = infoSections.value.map(section => section.id)
  const days = Array.from({ length: totalDays.value }, (_, i) => `day${i + 1}`)
  return [...info, ...days]
})

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

  for (let i = allSections.value.length - 1; i >= 0; i--) {
    const section = document.getElementById(allSections.value[i])
    if (section && section.offsetTop <= scrollPos) {
      activeSection.value = allSections.value[i]
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

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

// ===================================
// 主容器
// ===================================
.itinerary-detail-container {
  width: 700px;
  min-height: 100vh;
  background: $bg-primary;
  margin: 0 auto;
}

// ===================================
// 頁面標題
// ===================================
.itinerary-detail-title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: $text-primary;
  margin: $spacing-lg 0 $spacing-xl;
  padding: 0 $spacing-md;

  @include tablet {
    font-size: 32px;
    margin: $spacing-xl 0 $spacing-2xl;
  }

  @include desktop {
    font-size: 36px;
  }
}

// ===================================
// 主要內容區域
// ===================================
.itinerary-detail-schedule-content {
  max-width: 750px;
  margin: 0 auto;
  padding: 0 $spacing-md $spacing-xl;

  @include tablet {
    padding: 0 $spacing-lg $spacing-2xl;
  }

  @include desktop {
    padding: 0 $spacing-xl $spacing-2xl;
  }

  @include large-desktop {
    max-width: 1400px;
  }
}

// ===================================
// 內容區塊
// ===================================
.itinerary-detail-schedule-section {
  margin-bottom: $spacing-2xl;

  &:last-child {
    margin-bottom: 0;
  }
}

.itinerary-detail-section-container {
  width: 100%;
}

// ===================================
// 圖片容器
// ===================================
.itinerary-detail-image-container {
  margin-bottom: $spacing-lg;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: 0 8px 32px $shadow-medium;
  background: $bg-card;

  @include tablet {
    margin-bottom: $spacing-xl;
    border-radius: $border-radius-xl;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.itinerary-detail-schedule-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
}

// ===================================
// iframe 區域
// ===================================
.itinerary-detail-iframe-section {
  .itinerary-detail-section-container {
    border-radius: $border-radius-lg;
    overflow: hidden;
    box-shadow: 0 8px 32px $shadow-medium;
    background: $bg-card;

    @include tablet {
      border-radius: $border-radius-xl;
    }
  }
}

.itinerary-detail-iframe-container {
  width: 100%;
  position: relative;
  min-height: 600px;

  @include tablet {
    min-height: 700px;
  }

  @include desktop {
    min-height: 800px;
  }
}

.itinerary-detail-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  min-height: inherit;
}

// ===================================
// 浮動導航
// ===================================
.itinerary-detail-floating-nav {
  position: fixed;
  top: 50%;
  right: $spacing-md;
  transform: translateY(-50%);
  z-index: 100;
  transition: all 0.3s ease-in-out;

  @include tablet {
    right: $spacing-lg;
  }

  @include desktop {
    right: $spacing-xl;
  }

  // 隱藏狀態
  &.itinerary-detail-nav-hidden {
    opacity: 0;
    transform: translateY(-50%) translateX(100px);
    pointer-events: none;
  }
}

// 導航切換按鈕
.itinerary-detail-nav-toggle {
  width: 48px;
  height: 48px;
  background: $primary-color;
  color: $text-white;
  border-radius: 50%;
  @include flex-center;
  cursor: pointer;
  box-shadow: 0 4px 12px $shadow-medium;
  transition: all 0.2s ease;

  &:hover {
    background: #2d3748;
    transform: scale(1.1);
    box-shadow: 0 6px 20px $shadow-strong;
  }

  @include tablet {
    width: 52px;
    height: 52px;
  }
}

.itinerary-detail-nav-icon {
  font-size: 20px;

  @include tablet {
    font-size: 22px;
  }
}

// 導航選單
.itinerary-detail-nav-menu {
  position: absolute;
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  margin-right: $spacing-md;
  background: $bg-card;
  border-radius: $border-radius-lg;
  box-shadow: 0 8px 32px $shadow-medium;
  min-width: 200px;
  padding: $spacing-md;
  border: 1px solid $border-light;

  @include tablet {
    min-width: 220px;
    padding: $spacing-lg;
  }

  // 小箭頭指向切換按鈕
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 20px;
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-left: 8px solid $bg-card;
  }
}

.itinerary-detail-nav-section {
  margin-bottom: $spacing-md;

  &:last-child {
    margin-bottom: 0;
  }

  h4 {
    color: $text-secondary;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: $spacing-sm;
    padding-bottom: $spacing-xs;
    border-bottom: 1px solid $border-light;

    @include tablet {
      font-size: 15px;
    }
  }

  a {
    display: block;
    color: $text-muted;
    text-decoration: none;
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-sm;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(56, 178, 172, 0.1);
      color: $accent-color-1;
      transform: translateX(4px);
    }

    &.itinerary-detail-active {
      background: rgba(230, 168, 107, 0.1);
      color: $accent-color-2;
      font-weight: 500;
    }

    @include tablet {
      font-size: 15px;
      padding: $spacing-sm;
    }
  }
}

// ===================================
// 回到頂部按鈕
// ===================================
.itinerary-detail-back-to-top {
  position: fixed;
  bottom: $spacing-lg;
  right: $spacing-md;
  width: 48px;
  height: 48px;
  background: $accent-color-2;
  color: $text-white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  @include flex-center;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s ease;
  z-index: 99;

  &:hover {
    background: #d4941b;
    transform: translateY(-4px) scale(1.1);
    box-shadow: 0 8px 25px rgba(230, 168, 107, 0.6);
  }

  &:active {
    transform: translateY(-2px) scale(1.05);
  }

  @include tablet {
    bottom: $spacing-xl;
    right: $spacing-lg;
    width: 52px;
    height: 52px;
    font-size: 20px;
  }

  @include desktop {
    right: $spacing-xl;
  }
}

// ===================================
// 特殊區塊樣式
// ===================================

// 封面區塊
.cover-section {
  .itinerary-detail-image-container {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent 70%, rgba(56, 178, 172, 0.1));
      pointer-events: none;
    }
  }
}

// 航班資訊區塊
.flight-section {
  .itinerary-detail-image-container {
    border-left: 4px solid $accent-color-1;
  }
}

// 必帶物品區塊
.packing-section {
  .itinerary-detail-image-container {
    border-left: 4px solid $accent-color-2;
  }
}

// 地圖區塊
.map-section {
  .itinerary-detail-image-container {
    border-left: 4px solid $primary-color;
  }
}

// 總覽區塊
.overview-section {
  .itinerary-detail-image-container {
    border-left: 4px solid $timeline-recent;
  }
}

// 注意事項區塊
.notice-section {
  .itinerary-detail-iframe-container {
    border: 2px solid $timeline-old;
  }
}

// 每日行程區塊
.itinerary-detail-daily-section {
  .itinerary-detail-image-container {
    border-left: 4px solid $city-gradient-start;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: $spacing-sm;
      left: $spacing-sm;
      background: $city-gradient-start;
      color: $text-white;
      padding: $spacing-xs $spacing-sm;
      border-radius: $border-radius-sm;
      font-size: 12px;
      font-weight: 600;
    }
  }
}

// ===================================
// 響應式調整
// ===================================

// 手機版特殊處理
@include mobile-only {
  .itinerary-detail-floating-nav {
    right: $spacing-sm;
  }

  .itinerary-detail-nav-menu {
    min-width: 180px;
    padding: $spacing-sm;
    margin-bottom: $spacing-sm;

    &::after {
      right: 16px;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid $bg-card;
    }
  }

  .itinerary-detail-nav-toggle {
    width: 44px;
    height: 44px;
  }

  .itinerary-detail-nav-icon {
    font-size: 18px;
  }

  .itinerary-detail-back-to-top {
    bottom: $spacing-md;
    right: $spacing-sm;
    width: 44px;
    height: 44px;
    font-size: 16px;
  }

  .itinerary-detail-title {
    font-size: 24px;
  }

  .itinerary-detail-iframe-container {
    min-height: 500px;
  }
}

// 大桌面版優化
@include large-desktop {
  .itinerary-detail-floating-nav {
    right: calc((100vw - 1400px) / 2 + #{$spacing-xl});
  }

  .itinerary-detail-back-to-top {
    right: calc((100vw - 1400px) / 2 + #{$spacing-xl});
  }
}
</style>
