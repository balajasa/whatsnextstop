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
        </router-link>
      </div>
    </header>

    <!-- 側邊欄 -->
    <Sidebar ref="sidebarRef" :isMobile="isMobile" :headerHeight="50" @keydown-escape="handleEscapeKey" />

    <!-- 覆蓋層 (僅手機版) -->
    <div class="overlay" :class="{ active: sidebarOpen && isMobile }" @click="closeMobileSidebar"></div>

    <!-- 主內容區域 - 移除寬度限制 -->
    <main class="main-container" :class="{ 'sidebar-open': sidebarOpen && !isMobile }">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
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

<style scoped lang="scss">
@use '@/styles/variables' as *;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home {
  background-color: $warm-bg-base;
  color: $text-primary-warm;
  overflow-x: hidden;
  min-height: 100vh;
  position: relative;

  // 溫暖背景漸變效果
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(circle at 25% 30%, rgba(238, 184, 104, 0.08) 0%, transparent 55%),
      radial-gradient(circle at 70% 20%, rgba(239, 118, 122, 0.06) 0%, transparent 50%),
      radial-gradient(circle at 60% 80%, rgba(69, 105, 144, 0.04) 0%, transparent 45%);
    pointer-events: none;
    z-index: -1;
  }
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: $warm-bg-card;
  backdrop-filter: blur(10px);
  border-bottom: $warm-border-light;
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 1000;
  box-shadow: $warm-shadow-light;
}

.hamburger {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background-color: $hover-primary;
  }
}

.hamburger span {
  width: 20px;
  height: 2px;
  background-color: $text-primary-warm;
  margin: 2px 0;
  transition: all 0.3s ease;
  border-radius: 1px;
}

.hamburger.active {
  background-color: $active-primary;

  span:nth-child(1) {
    transform: rotate(-45deg) translate(-4px, 4px);
    background-color: $primary-warm;
  }

  span:nth-child(2) {
    opacity: 0;
  }

  span:nth-child(3) {
    transform: rotate(45deg) translate(-4px, -4px);
    background-color: $primary-warm;
  }
}

.header-title {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: $text-primary-warm;
  font-weight: 600;
}

.header-logo {
  width: 40px;
  height: 40px;
  background: url('@/assets/img/logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

/* Main Content - 移除所有寬度限制 */
.main-container {
  margin-top: 50px;
  margin-left: 60px;
  min-height: calc(100vh - 50px);
  transition: all 0.3s ease;
  width: calc(100% - 60px); // 動態計算寬度
  position: relative;
  z-index: 1;
}

.main-container.sidebar-open {
  margin-left: 250px;
  width: calc(100% - 250px); // 側邊欄打開時的寬度
}

/* 遮罩層 */
.overlay {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(69, 105, 144, 0.4);
  backdrop-filter: blur(4px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1500;
}

.overlay.active {
  opacity: 1;
  visibility: visible;
}

/* Tablet */
@media (max-width: 768px) {
  .main-container {
    margin-left: 0;
    width: 100%;
    padding: 15px;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .header {
    padding: 0 15px;
  }

  .main-container {
    padding: 10px;
  }
}
</style>
