<template>
  <div class="home">
    <!-- Header -->
    <header class="header">
      <div class="hamburger" :class="{ active: sidebarOpen }" @click="handleToggleSidebar"></div>
      <div class="header-title">
        <router-link to="/home">
          <div class="header-logo"></div>
        </router-link>
      </div>
    </header>

    <div class="home-content">
      <div class="sidebar" :class="{ active: sidebarOpen }">
        <!-- 側邊欄 -->
        <Sidebar ref="sidebarRef" :isMobile="isMobile" :headerHeight="50" @keydown-escape="handleEscapeKey" />
      </div>
      <!-- 覆蓋層 (僅手機版) -->
      <div class="sidebar-overlay" :class="{ active: sidebarOpen }" @click="closeMobileSidebar"></div>

      <!-- 主內容區域 -->
      <main class="main-container">
        <router-view />
      </main>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <Footer />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Footer from '@/components/layout/Footer.vue'
import { SidebarRef } from '../types/layout'

const sidebarRef: Ref<SidebarRef | null> = ref(null)
const isMobile: Ref<boolean> = ref(false)

const sidebarOpen = computed((): boolean => {
  return sidebarRef.value?.isSidebarOpen ?? false
})

const checkMobile = (): void => {
  isMobile.value = window.innerWidth <= 768
}

const handleResize = (): void => {
  const wasMobile = isMobile.value
  checkMobile()

  // 視窗大小改變時重置狀態
  if (wasMobile !== isMobile.value && sidebarRef.value) {
    sidebarRef.value.resetSidebarState()
  }
}

const handleToggleSidebar = (): void => {
  if (sidebarRef.value) {
    sidebarRef.value.toggleSidebar()
  }
}

const closeMobileSidebar = (): void => {
  if (isMobile.value && sidebarRef.value) {
    sidebarRef.value.closeSidebar()
  }
}

const handleEscapeKey = (): void => {
  closeMobileSidebar()
}

const handleKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    handleEscapeKey()
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.home
  min-height: 100vh
  background: $bg-primary
  display: flex
  flex-direction: column

// ===================================
// Header 樣式
// ===================================
.header
  position: fixed
  top: 0
  left: 0
  right: 0
  height: $header-height
  background: $primary-color
  color: $text-white
  display: flex
  align-items: center
  justify-content: center
  padding: 0 $spacing-md
  z-index: $z-header
  box-shadow: 0 2px 4px $shadow-light

  @include tablet
    padding: 0 $spacing-lg


// 漢堡選單按鈕
.hamburger
  position: absolute
  left: $spacing-md
  width: 40px
  height: 40px
  cursor: pointer
  background: url('@/assets/img/icon/dehaze.png')
  background-size: 24px 24px
  background-position: center
  background-repeat: no-repeat
  border-radius: 4px
  transition: all 0.3s ease

  @include tablet
    left: $spacing-lg
    width: 44px
    height: 44px
    background-size: 28px 28px


  &:hover
    background-color: rgba(255, 255, 255, 0.1)


  &:active
    background-color: rgba(255, 255, 255, 0.2)


  // 當側邊欄展開時的效果
  &.active
    transform: rotate(180deg)


// Header 標題區域
.header-title
  @include flex-center

  a
    @include flex-center
    text-decoration: none
    color: inherit
    gap: $spacing-sm


.header-logo
  width: 40px
  height: 40px
  background: url('@/assets/img/logo.png')
  background-size: contain
  background-position: center
  background-repeat: no-repeat

  @include tablet
    width: 36px
    height: 36px


  @include desktop
    width: 40px
    height: 40px


// ===================================
// 主要內容區域
// ===================================
.home-content
  position: relative
  padding-top: $header-height
  // min-height: 100vh
  height: 100%

// 側邊欄容器
.sidebar
  @include sidebar-base
  width: $sidebar-width-mobile
  background: $bg-sidebar

  @include desktop
    width: $sidebar-width-desktop
    background: $bg-sidebar-desktop
    backdrop-filter: blur(8px)


  &.active
    transform: translateX(0)


// 覆蓋層
.sidebar-overlay
  @include sidebar-overlay

  &.active
    opacity: 1
    visibility: visible


// 主內容區域
.main-container
  flex: 1 // 自動填滿剩餘空間
  padding: $spacing-md
  padding-bottom: $spacing-xl // 底部額外間距
  transition: all 0.3s ease-in-out

  @include tablet
    padding: $spacing-lg
    padding-bottom: $spacing-2xl


  @include desktop
    padding: 20px 32px 48px 32px
    // padding-bottom: $spacing-2xl


// Footer 樣式
.footer
  // background: $primary-color
  // color: $text-white
  // padding: $spacing-lg $spacing-md
  margin-top: auto // 推到最底部

  // @include tablet
  //   padding: $spacing-xl $spacing-lg
  //

  // @include desktop
  //   padding: $spacing-xl
  //

// ===================================
// 響應式調整
// ===================================
@include mobile-only
  .main-container
    padding: $spacing-sm
    padding-bottom: $spacing-lg


  .header
    padding: 0 $spacing-sm


  // .footer
  //   padding: $spacing-md $spacing-sm
  //

@include tablet-only
  .main-container
    max-width: 100%
    margin: 0 auto


@include desktop
  .main-container
    max-width: 1200px
    margin: 0 auto


@include large-desktop
  .main-container
    max-width: 1200px
    padding: $spacing-2xl
    padding-bottom: $spacing-2xl

</style>