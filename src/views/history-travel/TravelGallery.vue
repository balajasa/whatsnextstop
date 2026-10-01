<template>
  <div class="travel-gallery">
    <PageHeader subtitle="每一趟旅程，都貼進這本相簿裡" />

    <!-- 載入狀態 -->
    <StateView v-if="loading" type="loading" message="載入旅程中..." class="state-block" />

    <!-- 錯誤狀態 -->
    <StateView v-else-if="error" type="error" :message="error" class="state-block" @action="retry" />

    <!-- 旅程卡片列表 -->
    <div v-else class="cards-container">
      <TravelPhotoCard v-for="trip in trips" :key="trip.id" :trip="trip"
        :should-load-photos="trip.id ? photoLoadingStates[trip.id] || false : false"
        :ref="el => trip.id && setTripCardRef(el, trip.id)" class="gallery-card" />

      <!-- 載入更多指示器 -->
      <StateView v-if="loadingMore" type="loading" size="sm" message="載入更多旅程中..." />

      <!-- 已載入完全部資料 -->
      <div v-else-if="!hasMore && trips.length > 0" class="all-loaded-container">
        <div class="all-loaded-text">已顯示全部 {{ trips.length }} 筆旅程</div>
      </div>

      <!-- 空狀態 -->
      <StateView v-if="trips.length === 0" type="empty" title="相簿還是空的" message="等你帶照片回來" />

      <!-- 滾動監聽的觸發器 -->
      <div ref="loadMoreTrigger" class="load-more-trigger"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, reactive } from 'vue'
import { useHistoryTripStore } from '@/stores/useHistoryTripStore'
import { storeToRefs } from 'pinia'
import { event } from 'vue-gtag'
import PageHeader from '@/components/common/PageHeader.vue'
import StateView from '@/components/common/StateView.vue'
import TravelPhotoCard from '../history-travel/TravelPhotoCard.vue'

// Store
const historyTripStore = useHistoryTripStore()
const { trips, loading, loadingMore, hasMore, error } = storeToRefs(historyTripStore)

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
        // GA4 追蹤：載入更多旅程
        event('load_more_trips', {
          category: 'history_travel',
          current_trips_count: trips.value.length,
          has_more: hasMore.value
        })

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

// 載入失敗時重試
const retry = async () => {
  await historyTripStore.loadPhotoTrips()
  await setupInfiniteScroll()
  await setupPhotoLazyLoading()
}

// 初始化載入資料
onMounted(async () => {
  await historyTripStore.loadPhotoTrips()
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
// 拍立得牆：手機 1 欄、平板 2 欄、桌機 3 欄
// ===================================
.cards-container
  display: grid
  grid-template-columns: minmax(0, 1fr)
  gap: 36px 24px
  padding-top: 12px
  @include tablet
    grid-template-columns: repeat(2, minmax(0, 1fr))
    gap: 44px 28px
  @include desktop
    grid-template-columns: repeat(3, minmax(0, 1fr))
    gap: 48px 32px

  // 載入更多、已顯示全部、空狀態、捲動觸發器都佔滿整排
  > :not(.gallery-card)
    grid-column: 1 / -1

// 已載入全部：兩側虛線
.all-loaded-container
  display: flex
  align-items: center
  justify-content: center
  gap: 12px
  padding: $spacing-lg 0
  color: $nb-muted
  @include tablet
    padding: $spacing-xl 0

  &::before, &::after
    content: ''
    width: 60px
    border-top: 2px dashed $nb-dash

.all-loaded-text
  font-size: 14px

// 滾動觸發器（不可見）
.load-more-trigger
  height: 10px
  width: 100%
</style>
