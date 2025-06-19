<template>
  <div class="home">
    <Sidebar ref="sidebarRef" :isMobile="isMobile" @keydown-escape="handleEscapeKey" />
    <MainContent :sidebar-open="sidebarOpen" :isMobile="isMobile" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/components/main/Sidebar.vue'
import MainContent from '@/components/main/MainContent.vue'

const sidebarRef = ref(null)
const isMobile = ref(false)

// 計算側邊欄是否打開 (注意邏輯相反：展開時為 true)
const sidebarOpen = computed(() => {
  return sidebarRef.value?.isSidebarOpen ?? false
})

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const handleResize = () => {
  checkMobile()
}

const handleEscapeKey = () => {
  if (sidebarRef.value?.isSidebarOpen) {
    sidebarRef.value?.toggleSidebar()
  }
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

<style lang="scss">
@use '@/styles/variables' as *;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: $warm-bg-base;
  color: $deep-blue;
  overflow-x: hidden;
  min-height: 100vh;
}
</style>