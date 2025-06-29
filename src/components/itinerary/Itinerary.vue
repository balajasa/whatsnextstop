<template>
  <div class="itinerary-container">
    <!-- 麵包屑 -->
    <BreadcrumbNav />

    <!-- 浮動導航目錄 -->
    <nav class="floating-nav" :class="{ 'nav-hidden': !showNav }">
      <!-- 返回首頁按鈕 -->
      <router-link to="/home" class="home-float-btn" title="返回首頁">
        <span class="home-icon">🏠</span>
      </router-link>

      <div class="nav-toggle" @click="toggleNav">
        <span class="nav-icon">📋</span>
      </div>
      <div class="nav-menu" v-show="navOpen">
        <div class="nav-section">
          <h4>📋 行程資訊</h4>
          <a
            href="#itinerary"
            @click="scrollToSection('itinerary')"
            :class="{ active: activeSection === 'itinerary' }"
            >行程內容</a
          >
        </div>
      </div>
    </nav>

    <!-- 主要內容區域 -->
    <div class="schedule-content">
      <!-- 行程內容 -->
      <section id="itinerary" class="schedule-section itinerary-section">
        <div class="section-container">
          <div class="iframe-container">
            <div
              style="
                position: relative;
                width: 100%;
                height: 0;
                padding-top: 141.4286%;
                padding-bottom: 0;
                box-shadow: 0 2px 8px 0 rgba(63, 69, 81, 0.16);
                margin-top: 1em;
                margin-bottom: 0.9em;
                overflow: hidden;
                border-radius: 8px;
                will-change: transform;
              "
            >
              <iframe
                loading="lazy"
                style="
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  top: 0;
                  left: 0;
                  border: none;
                  padding: 0;
                  margin: 0;
                "
                src="https://www.canva.com/design/DAGo__QAg-I/ZUWMoq-agdfYIO8WE9nLhA/view?embed"
                allowfullscreen
                allow="fullscreen"
              >
              </iframe>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 回到頂部按鈕 -->
    <button class="back-to-top" @click="scrollToTop" v-show="showBackToTop">↑</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Ref } from 'vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'

const route = useRoute()

// 響應式數據
const showNav: Ref<boolean> = ref(true)
const navOpen: Ref<boolean> = ref(false)
const showBackToTop: Ref<boolean> = ref(false)
const activeSection: Ref<string> = ref('itinerary')

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
  const sections = ['itinerary']
  const scrollPos = window.scrollY + 100

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = document.getElementById(sections[i])
    if (section && section.offsetTop <= scrollPos) {
      activeSection.value = sections[i]
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
.itinerary-container {
  width: 700px;
  min-height: 100vh;
  background: $bg-primary;
  margin: 0 auto;
}

// ===================================
// 主要內容區域
// ===================================
.schedule-content {
  max-width: 750px;
  margin: 0 auto;
  padding: 0 $spacing-md;

  @include tablet {
    padding: 0 $spacing-lg;
  }

  @include desktop {
    padding: 0 $spacing-xl;
  }
}

.schedule-section {
  margin-bottom: $spacing-2xl;
}

.section-container {
  width: 100%;
}

// ===================================
// 浮動導航
// ===================================
.floating-nav {
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
  &.nav-hidden {
    opacity: 0;
    transform: translateY(-50%) translateX(100px);
    pointer-events: none;
  }
}

// 返回首頁按鈕
.home-float-btn {
  display: block;
  width: 48px;
  height: 48px;
  background: $accent-color-1;
  color: $text-white;
  border-radius: 50%;
  @include flex-center;
  text-decoration: none;
  margin-bottom: $spacing-sm;
  box-shadow: 0 4px 12px $shadow-city;
  transition: all 0.2s ease;

  &:hover {
    background: $city-gradient-end;
    transform: scale(1.1);
    box-shadow: 0 6px 20px $shadow-city-hover;
  }

  @include tablet {
    width: 52px;
    height: 52px;
  }
}

.home-icon {
  font-size: 20px;

  @include tablet {
    font-size: 22px;
  }
}

// 導航切換按鈕
.nav-toggle {
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

.nav-icon {
  font-size: 20px;

  @include tablet {
    font-size: 22px;
  }
}

// 導航選單
.nav-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: $spacing-md;
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
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid $bg-card;
  }
}

.nav-section {
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

    &.active {
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
// iframe 容器
// ===================================
.iframe-container {
  width: 100%;
  border-radius: $border-radius-lg;
  // overflow: hidden;
  box-shadow: 0 8px 32px $shadow-medium;
  background: $bg-card;

  @include tablet {
    border-radius: $border-radius-xl;
  }
}

// ===================================
// 回到頂部按鈕
// ===================================
.back-to-top {
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
  box-shadow: 0 4px 12px rgba(230, 168, 107, 0.4);
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
// 響應式調整
// ===================================
// 平板版本 (≥ 768px)

// .itinerary-container
// 手機版特殊處理
@include mobile-only {
  .itinerary-container {
    padding: $spacing-lg;
  }

  .schedule-content {
    padding: $spacing-xs $spacing-lg;
  }

  .floating-nav {
    right: $spacing-sm;
  }

  .nav-menu {
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

  .home-float-btn,
  .nav-toggle {
    width: 44px;
    height: 44px;
  }

  .home-icon,
  .nav-icon {
    font-size: 18px;
  }

  .back-to-top {
    bottom: $spacing-md;
    right: $spacing-sm;
    width: 44px;
    height: 44px;
    font-size: 16px;
  }
}

// 大桌面版優化
@include large-desktop {
  .floating-nav {
    right: calc((100vw - 1400px) / 2 + #{$spacing-xl});
  }

  .back-to-top {
    right: calc((100vw - 1400px) / 2 + #{$spacing-xl});
  }
}
</style>
