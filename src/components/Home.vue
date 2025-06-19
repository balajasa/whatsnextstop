<template>
  <div class="home">
    <!-- Header -->
    <header class="header">
      <div class="hamburger" :class="{ active: sidebarOpen }" @click="handleToggleSidebar">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <h1 class="header-title">Header (50px)</h1>
    </header>

    <!-- 側邊欄 -->
    <Sidebar 
      ref="sidebarRef"
      :isMobile="isMobile"
      :headerHeight="50"
      @keydown-escape="handleEscapeKey"
    />
    
    <!-- 覆蓋層 (僅手機版) -->
    <div class="overlay" :class="{ active: sidebarOpen && isMobile }" @click="closeMobileSidebar"></div>

    <!-- 主內容區域 -->
    <main class="main-container" :class="{ 'sidebar-open': sidebarOpen && !isMobile }">
      <div class="main-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/main/Sidebar.vue'

const route = useRoute()
const sidebarRef = ref(null)
const isMobile = ref(false)

const sidebarOpen = computed(() => {
  return sidebarRef.value?.isSidebarOpen ?? false
})

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const handleResize = () => {
  const wasMobile = isMobile.value
  checkMobile()
  
  // 視窗大小改變時重置狀態
  if (wasMobile !== isMobile.value && sidebarRef.value) {
    sidebarRef.value.resetSidebarState()
  }
}

const handleToggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.toggleSidebar()
  }
}

const closeMobileSidebar = () => {
  if (isMobile.value && sidebarRef.value) {
    sidebarRef.value.closeSidebar()
  }
}

const handleEscapeKey = () => {
  closeMobileSidebar()
}

const handleKeydown = (e) => {
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  margin-left: 15px;
  font-size: 18px;
  color: $text-primary-warm;
  font-weight: 600;
}

/* Main Content */
.main-container {
  margin-top: 50px;
  margin-left: 60px;
  min-height: calc(100vh - 50px);
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.main-container.sidebar-open {
  margin-left: 250px;
}

.main-content {
  width: 100%;
  max-width: 800px;
  background-color: $warm-bg-content;
  backdrop-filter: blur(8px);
  border-radius: 12px;
  box-shadow: $warm-shadow-medium;
  border: $warm-border-light;
  padding: 40px;
  transition: all 0.3s ease;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: $warm-gradient-bg;
    border-radius: 12px;
    opacity: 0.5;
    pointer-events: none;
    z-index: -1;
  }
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
    margin-left: 0 !important;
    padding: 15px;
  }

  .main-content {
    padding: 20px;
    border-radius: 8px;
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

  .main-content {
    padding: 15px;
    border-radius: 6px;
  }
}
</style>