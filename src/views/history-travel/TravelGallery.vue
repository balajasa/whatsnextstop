<template>
  <div class="travel-gallery">
    <!-- 麵包屑導航 -->
    <BreadcrumbNav />

    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-text">載入旅程中...</div>
    </div>

    <!-- 旅程卡片列表 -->
    <div v-else class="cards-container">
      <TravelPhotoCard v-for="trip in trips" :key="trip.id" :trip="trip"
        :should-load-photos="trip.id ? photoLoadingStates[trip.id] || false : false"
        :ref="el => trip.id && setTripCardRef(el, trip.id)" class="gallery-card" />

      <!-- 載入更多指示器 -->
      <div v-if="loadingMore" class="loading-more-container">
        <div class="loading-more-spinner"></div>
        <div class="loading-more-text">載入更多旅程中...</div>
      </div>

      <!-- 已載入完全部資料 -->
      <div v-else-if="!hasMore && trips.length > 0" class="all-loaded-container">
        <div class="all-loaded-text">已顯示全部 {{ trips.length }} 筆旅程</div>
      </div>

      <!-- 空狀態 -->
      <div v-if="trips.length === 0" class="empty-state">
        <div class="empty-icon">📸</div>
        <div class="empty-title">還沒有旅程記錄</div>
        <div class="empty-subtitle">開始你的第一段旅程吧！</div>
      </div>

      <!-- 滾動監聽的觸發器 -->
      <div ref="loadMoreTrigger" class="load-more-trigger"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, reactive } from 'vue'
import { useHistoryTripStore } from '@/stores/useHistoryTripStore'
import { storeToRefs } from 'pinia'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import TravelPhotoCard from '../history-travel/TravelPhotoCard.vue'

// Store
const historyTripStore = useHistoryTripStore()
const { trips, loading, loadingMore, hasMore } = storeToRefs(historyTripStore)

// Template refs
const loadMoreTrigger = ref<HTMLElement | null>(null)
const tripCardRefs = ref<Map<string, HTMLElement>>(new Map())

// 照片載入狀態管理
const photoLoadingStates = reactive<Record<string, boolean>>({})

// Intersection Observer
let scrollObserver: IntersectionObserver | null = null // 用於無限滾動
let photoObserver: IntersectionObserver | null = null // 用於照片懶加載

// 設置卡片 ref
const setTripCardRef = (el: any, tripId: string) => {
  if (el && tripId) {
    // Vue 3 中 el 可能是元件實例或 DOM 元素
    const element = el.$el || el
    tripCardRefs.value.set(tripId, element)
  } else if (!el && tripId) {
    // 當元素被銷毀時，清理 ref
    tripCardRefs.value.delete(tripId)
  }
}

// 設置照片懶加載
const setupPhotoLazyLoading = async () => {
  await nextTick() // 等待 DOM 更新

  // 清理舊的 observer
  if (photoObserver) {
    photoObserver.disconnect()
  }

  photoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 找到對應的旅程 ID
          const tripElement = entry.target as HTMLElement
          const tripId = Array.from(tripCardRefs.value.entries())
            .find(([_, element]) => element === tripElement)?.[0]

          if (tripId && !photoLoadingStates[tripId]) {
            photoLoadingStates[tripId] = true
            // 停止觀察這個元素，因為照片已經開始載入
            photoObserver?.unobserve(entry.target)
          }
        }
      })
    },
    {
      rootMargin: '50px', // 在距離可視區域 50px 時就開始載入
      threshold: 0.1
    }
  )

  // 觀察所有已載入的旅程卡片
  tripCardRefs.value.forEach((element) => {
    photoObserver?.observe(element)
  })
}

// 設置無限滾動
const setupInfiniteScroll = async () => {
  await nextTick() // 等待 DOM 更新

  if (!loadMoreTrigger.value) return

  scrollObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      // 當觸發器進入視窗且還有更多資料時，載入更多
      if (entry.isIntersecting && hasMore.value && !loadingMore.value) {
        historyTripStore.loadMoreTrips().then(() => {
          // 載入完成後重新設置觀察器
          setupInfiniteScroll()
          setupPhotoLazyLoading() // 也要重新設置照片懶加載
        })
      }
    },
    {
      rootMargin: '50px', // 在距離底部 50px 時就開始載入
      threshold: 0.1
    }
  )

  scrollObserver.observe(loadMoreTrigger.value)
}

// 初始化載入資料
onMounted(async () => {
  await historyTripStore.loadTrips()
  await setupInfiniteScroll()
  await setupPhotoLazyLoading()
})

// 清理
onUnmounted(() => {
  if (scrollObserver) {
    scrollObserver.disconnect()
    scrollObserver = null
  }
  if (photoObserver) {
    photoObserver.disconnect()
    photoObserver = null
  }
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// 主容器
// ===================================
.travel-gallery
  min-height: 100vh
  background: $bg-primary
  padding: 0 $spacing-lg $spacing-lg

  @include tablet
    padding: 0 $spacing-lg $spacing-xl

  @include desktop
    padding: 0 $spacing-xl $spacing-xl

// ===================================
// 載入狀態
// ===================================
.loading-container
  @include flex-center
  min-height: 200px
  padding: $spacing-lg 0

  @include tablet
    min-height: 400px
    padding: $spacing-xl 0

.loading-text
  font-size: 16px
  color: $text-muted
  text-align: center

  @include tablet
    font-size: 20px

// ===================================
// 卡片容器
// ===================================
.cards-container
  max-width: 800px
  margin: $spacing-md auto

  @include desktop
    max-width: 900px

  @include large-desktop
    max-width: 1000px

// ===================================
// 空狀態
// ===================================
.empty-state
  text-align: center
  padding: $spacing-xl 0
  color: $text-muted

  @include tablet
    padding: $spacing-2xl 0

.empty-icon
  font-size: 48px
  margin-bottom: $spacing-lg
  opacity: 0.5

  @include tablet
    font-size: 80px

.empty-title
  font-size: 18px
  font-weight: 600
  margin-bottom: $spacing-sm
  color: $text-primary

  @include tablet
    font-size: 20px

.empty-subtitle
  font-size: 16px
  opacity: 0.7

  @include tablet
    font-size: 18px

// ===================================
// 載入更多狀態
// ===================================
.loading-more-container
  @include flex-center
  flex-direction: column
  padding: $spacing-xl 0
  color: $text-muted

  @include tablet
    padding: $spacing-2xl 0

.loading-more-spinner
  width: 24px
  height: 24px
  border: 2px solid rgba($accent-color-1, 0.3)
  border-top: 2px solid $accent-color-1
  border-radius: 50%
  animation: spin 1s linear infinite
  margin-bottom: $spacing-sm

.loading-more-text
  font-size: 14px
  text-align: center

  @include tablet
    font-size: 16px

// 已載入全部
.all-loaded-container
  text-align: center
  padding: $spacing-lg 0
  color: $text-muted

  @include tablet
    padding: $spacing-xl 0

.all-loaded-text
  font-size: 14px
  opacity: 0.7

  @include tablet
    font-size: 16px

// 滾動觸發器（不可見）
.load-more-trigger
  height: 10px
  width: 100%

// 載入動畫
@keyframes spin
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)
</style>
