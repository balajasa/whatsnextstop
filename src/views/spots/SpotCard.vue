<template>
  <div class="spot-card-wrapper">
    <!-- 桌面版卡片 (≥ 1024px) -->
    <SpotCardDesktop 
      v-if="isDesktop" 
      :spot="spot" 
      class="desktop-card"
    />
    
    <!-- 手機版卡片 (< 1024px) -->
    <SpotCardMobile 
      v-else 
      :spot="spot" 
      class="mobile-card"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SpotCardMobile from './SpotCardMobile.vue'
import SpotCardDesktop from './SpotCardDesktop.vue'
import type { SpotCardProps } from '../../types/spots'

// Props
defineProps<SpotCardProps>()

// 響應式資料
const isDesktop = ref(false)

// 斷點常數
const DESKTOP_BREAKPOINT = 1024

// 檢查螢幕尺寸
const checkScreenSize = () => {
  isDesktop.value = window.innerWidth >= DESKTOP_BREAKPOINT
}

// 生命週期
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style lang="sass" scoped>
.spot-card-wrapper
  width: 100%
  
  // 確保卡片切換時的平滑過渡
  .desktop-card,
  .mobile-card
    transition: opacity 0.2s ease
</style>