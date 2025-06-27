<template>
  <div class="home">
    <!-- Header -->
    <header class="header">
      <div class="hamburger" :class="{ active: sidebarOpen }" @click="handleToggleSidebar">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="header-title">
        <router-link to="/">
          <div class="header-logo"></div>
          <div class="header-text">123456</div>
        </router-link>
      </div>
    </header>

    <div class="home-content">
      <div class="sidebar" :class="{ active: sidebarOpen && isMobile }">
        <!-- 側邊欄 -->
        <Sidebar ref="sidebarRef" :isMobile="isMobile" :headerHeight="50" @keydown-escape="handleEscapeKey" />
      </div>
      <!-- 覆蓋層 (僅手機版) -->
      <div class="sidebar-overlay" :class="{ active: sidebarOpen && isMobile }" @click="closeMobileSidebar"></div>


      <!-- 主內容區域 -->
      <main class="main-container" :class="{ 'sidebar-open': sidebarOpen && !isMobile }">
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
import { SidebarRef } from './types/ILayout'

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

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.home {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: $bg-primary
}

/* Header */
.header {
  position: relative;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 30px;
  border-bottom: 3px solid $accent-color-2;
  background: $primary-color;
  box-shadow: 0 2px 12px $shadow-light;
  color: $text-white;
}

.hamburger {
  position: absolute;
  left: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 18px;
  cursor: pointer;

  span {
    display: block;
    width: 100%;
    height: 2px;
    border-radius: 1px;
    background: $text-white;
    transition: all 0.3s ease;
  }

  &.active {
    span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }

    span:nth-child(2) {
      opacity: 0;
    }

    span:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -6px);
    }
  }
}

.header-title {
  a {
    display: flex;
    align-items: center;
    text-decoration: none;

    gap: 8px; // logo 和 text 之間的間距

    // 確保整個區域都可以點擊
    &:hover {
      opacity: 0.8;
      transition: opacity 0.3s ease;
    }
  }
}

.header-logo {
  width: 40px;
  height: 40px;
  background: url('@/assets/img/logo.png');
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
}

.home-content {
  position: relative;
  display: flex;
  flex: 1;
}

/* sidebar 覆蓋層 */
.sidebar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  height: calc(100vh - 50px);
}

.sidebar-overlay {
  position: fixed;
  top: 46px;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 900;
  display: none;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;

  &.active {
    display: block;
    opacity: 1;
  }
}

/* 主內容區域 */
.main-container {
  flex: 1;
  margin-left: 0; // 預設值，sidebar 開啟時會動態調整
  transition: margin-left 0.3s ease;

  &.sidebar-open {
    margin-left: 20px;
    // margin-left: 50px; // sidebar 寬度
  }
}

.footer {
  width: 100%;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .header {
    padding: 8px 16px; // 減少左右 padding
  }

  .home-content {
    position: static; // 手機版改回 static
  }

  .sidebar {
    position: fixed; // 手機版使用 fixed 定位
    top: 0;
    left: 0;
    z-index: 1000; // 提高層級確保在最上層
    width: 280px; // 設定固定寬度，可依需求調整
    height: 100vh; // 手機版佔滿整個視窗高度
    transition: transform 0.3s ease;
    transform: translateX(-100%); // 預設隱藏在左側

    // 當 sidebar 開啟時
    &.active {
      transform: translateX(0); // 滑入視窗
    }
  }

  .sidebar-overlay {
    position: fixed; // 覆蓋整個視窗
    top: 0; // 從視窗頂部開始
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 999; // 在 sidebar 下方
    display: none;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease;

    &.active {
      display: block;
      opacity: 1;
    }
  }

  .main-container {
    margin-left: 0; // 手機版不需要 margin-left
    padding: 16px; // 減少 padding

    // 手機版不需要 sidebar-open 的 margin 調整
    &.sidebar-open {
      margin-left: 0;
    }
  }
}

@media (max-width: 480px) {
  .header {
    padding: 6px 12px; // 更小螢幕進一步減少 padding
  }

  .header-logo {
    width: 32px;
    height: 32px;
  }

  .hamburger {
    width: 20px;
    height: 16px;
  }

  .sidebar {
    width: 260px; // 小螢幕稍微縮小 sidebar 寬度
  }

  .main-container {
    padding: 8px; // 最小螢幕最少 padding
  }
}

/* 平板尺寸調整 */
@media (min-width: 769px) and (max-width: 1024px) {
  .main-container {
    padding: 24px; // 平板用中等 padding

    &.sidebar-open {
      margin-left: 280px; // 平板的 sidebar 寬度調整
    }
  }
}
</style>