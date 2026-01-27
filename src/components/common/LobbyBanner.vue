<template>
  <div v-if="banners.length > 0" class="lobby-banner">
    <div class="banner-container">
      <!-- Banner 輪播 -->
      <div class="banner-slider">
        <div v-for="(banner, index) in banners" :key="banner.id" class="banner-slide"
          :class="{ active: index === currentIndex }">
          <a v-if="banner.link" :href="banner.link" class="banner-link" @click.prevent="handleBannerClick(banner.link)">
            <img :src="banner.imageUrl" :alt="banner.title" />
          </a>
          <div v-else class="banner-image">
            <img :src="banner.imageUrl" :alt="banner.title" />
          </div>
        </div>
      </div>

      <!-- 指示器 -->
      <div v-if="banners.length > 1" class="banner-indicators">
        <button v-for="(banner, index) in banners" :key="`indicator-${banner.id}`" class="indicator"
          :class="{ active: index === currentIndex }" @click="goToSlide(index)"
          :aria-label="`前往第 ${index + 1} 張 Banner`"></button>
      </div>

      <!-- 左右箭頭 -->
      <button v-if="banners.length > 1" class="arrow arrow-left" @click="prevSlide" aria-label="上一張">
        ‹
      </button>
      <button v-if="banners.length > 1" class="arrow arrow-right" @click="nextSlide" aria-label="下一張">
        ›
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getActiveLobbyBanners, type LobbyBanner } from '@/services/lobby-banner/lobbyBannerService'

const router = useRouter()

// 狀態
const banners = ref<LobbyBanner[]>([])
const currentIndex = ref(0)
let autoPlayInterval: number | null = null

// 載入 Banner
const loadBanners = async () => {
  try {
    banners.value = await getActiveLobbyBanners()
    if (banners.value.length > 1) {
      startAutoPlay()
    }
  } catch (error) {
    console.error('載入 Banner 失敗:', error)
  }
}

// 切換到指定 slide
const goToSlide = (index: number) => {
  currentIndex.value = index
  resetAutoPlay()
}

// 上一張
const prevSlide = () => {
  currentIndex.value = currentIndex.value === 0 ? banners.value.length - 1 : currentIndex.value - 1
  resetAutoPlay()
}

// 下一張
const nextSlide = () => {
  currentIndex.value = currentIndex.value === banners.value.length - 1 ? 0 : currentIndex.value + 1
  resetAutoPlay()
}

// 自動播放
const startAutoPlay = () => {
  autoPlayInterval = window.setInterval(() => {
    nextSlide()
  }, 5000) // 每 5 秒切換
}

// 重置自動播放
const resetAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval)
    startAutoPlay()
  }
}

// 停止自動播放
const stopAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval)
    autoPlayInterval = null
  }
}

// 處理 Banner 點擊
const handleBannerClick = (link: string) => {
  if (link.startsWith('http')) {
    window.open(link, '_blank')
  } else {
    router.push(link)
  }
}

// 生命週期
onMounted(() => {
  loadBanners()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.lobby-banner
  position: relative
  overflow: hidden
  margin-bottom: $spacing-xl
  width: 100%
  border-radius: $border-radius-lg
  box-shadow: 0 8px 32px $shadow-medium
  @include tablet
    margin-bottom: $spacing-2xl
    border-radius: $border-radius-xl
.banner-container
  position: relative
  padding-bottom: 33.33%
  width: 100%
  background: #f5f5f5

.banner-slider
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%

.banner-slide
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  opacity: 0
  transition: opacity 0.5s ease-in-out
  pointer-events: none

  &.active
    opacity: 1
    pointer-events: auto

.banner-link,
.banner-image
  display: block
  width: 100%
  height: 100%

  img
    width: 100%
    height: 100%

    object-fit: cover

.banner-link
  cursor: pointer

  &:hover img
    transition: transform 0.3s ease
    transform: scale(1.02)

// 指示器
.banner-indicators
  position: absolute
  bottom: $spacing-lg
  left: 50%
  z-index: 10
  display: flex
  transform: translateX(-50%)

  gap: $spacing-sm

.indicator
  padding: 0
  width: 12px
  height: 12px
  border: 2px solid white
  border-radius: 50%
  background: rgba(255, 255, 255, 0.5)
  cursor: pointer
  transition: all 0.3s ease

  &:hover
    background: rgba(255, 255, 255, 0.8)

  &.active
    background: white

// 箭頭
.arrow
  position: absolute
  top: 50%
  z-index: 10
  display: flex
  align-items: center
  justify-content: center
  padding: 0
  width: 40px
  height: 40px
  border: none
  border-radius: 50%
  background: rgba(0, 0, 0, 0.5)
  color: white
  font-size: 24px
  cursor: pointer
  transition: all 0.3s ease
  transform: translateY(-50%)

  &:hover
    background: rgba(0, 0, 0, 0.7)

  &.arrow-left
    left: $spacing-lg

  &.arrow-right
    right: $spacing-lg

// 響應式設計
@include mobile-tablet
  .banner-container
    padding-bottom: 50%

  .arrow
    width: 32px
    height: 32px
    font-size: 20px

    &.arrow-left
      left: $spacing-sm

    &.arrow-right
      right: $spacing-sm

  .banner-indicators
    bottom: $spacing-sm

  .indicator
    width: 10px
    height: 10px

@include mobile-only
  .banner-container
    padding-bottom: 60%

  .arrow
    display: none
</style>
