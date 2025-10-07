<template>
  <div class="travel-review">
    <!-- 麵包屑導航 -->
    <BreadcrumbNav />

    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-text">載入行程中...</div>
    </div>

    <!-- 書架容器 -->
    <div v-else class="bookshelf-container">
      <!-- 空狀態 -->
      <div v-if="journals.length === 0" class="empty-state">
        <div class="empty-icon">📚</div>
        <div class="empty-text">還沒有旅程記錄</div>
      </div>

      <!-- 書架 -->
      <div v-else class="bookshelf">
        <div v-for="journal in journals" :key="journal.id" class="book-card" @click="openJournal(journal.journalLink)">
          <div class="book-cover">
            <!-- 封面圖片 -->
            <img v-if="journal.coverImageUrl" :src="journal.coverImageUrl" :alt="journal.title" />
            <div v-else class="placeholder-cover">
              {{ journal.title.substring(0, 2) }}
            </div>

            <!-- 書背右側 3D 效果 -->
            <div class="book-spine"></div>
          </div>
          <div class="book-title">{{ journal.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import { getPublishedJournals, type HistoryJournal } from '@/services/history-travel/historyJournalService'

const loading = ref(true)
const journals = ref<HistoryJournal[]>([])

// 開啟旅程日誌
const openJournal = (url: string) => {
  if (url && url !== '#') {
    window.open(url, '_blank')
  }
}

// 載入旅程回顧資料
const loadJournals = async () => {
  try {
    loading.value = true
    journals.value = await getPublishedJournals()
  } catch (error) {
    console.error('載入旅程回顧失敗:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadJournals()
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.travel-review
  // min-height: 100vh
  background: $traveler-cream
  padding: 0 20px 40px

  @include tablet
    padding: 0 20px 40px

  @include desktop
    padding: 0 40px 40px

// ===================================
// 載入狀態
// ===================================
.loading-container
  display: flex
  justify-content: center
  align-items: center
  min-height: 50vh

.loading-text
  color: $traveler-brown
  font-size: 16px

// ===================================
// 書架容器
// ===================================
.bookshelf-container
  max-width: 1400px
  margin: 0 auto

// ===================================
// 空狀態
// ===================================
.empty-state
  grid-column: 1 / -1
  text-align: center
  padding: 100px 20px
  color: $traveler-brown

.empty-icon
  font-size: 80px
  margin-bottom: 20px
  opacity: 0.6

.empty-text
  font-size: 24px
  opacity: 0.7

// ===================================
// 書架
// ===================================
.bookshelf
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))
  gap: 35px
  padding: 40px 20px
  background: $traveler-walnut
  border-radius: 12px
  box-shadow: 0 4px 12px $traveler-shadow-light, inset 0 2px 4px rgba(255, 255, 255, 0.1)
  position: relative
  min-height: 600px

  @include tablet
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))
    gap: 45px
    padding: 50px 30px
    min-height: 800px

  @include desktop
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))
    gap: 50px
    padding: 60px 40px
    min-height: 800px

  // 書架木紋質感
  &::before
    content: ''
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(89, 88, 87, 0.03) 2px, rgba(89, 88, 87, 0.03) 4px)
    border-radius: 12px
    pointer-events: none

  // 書架底部陰影
  &::after
    content: ''
    position: absolute
    bottom: 0
    left: 10px
    right: 10px
    height: 8px
    background: linear-gradient(to bottom, transparent, rgba(89, 88, 87, 0.2))
    border-radius: 0 0 12px 12px

// ===================================
// 書本卡片
// ===================================
.book-card
  position: relative
  cursor: pointer
  z-index: 1

// ===================================
// 書本封面
// ===================================
.book-cover
  position: relative
  width: 100%
  aspect-ratio: 0.707
  border-radius: 6px
  overflow: hidden
  box-shadow: 0 8px 24px $traveler-shadow-medium, 0 2px 8px $traveler-shadow-light
  transition: box-shadow 0.3s ease, transform 0.3s ease
  background: $traveler-cream

  .book-card:hover &
    transform: translateY(-15px) scale(1.03)
    box-shadow: 0 16px 40px $traveler-shadow-strong, 0 6px 16px $traveler-shadow-medium

  // 封面圖片
  img
    width: 100%
    height: 100%
    object-fit: cover
    display: block

  // 預設封面（無圖片時）
  .placeholder-cover
    width: 100%
    height: 100%
    display: flex
    align-items: center
    justify-content: center
    font-size: 48px
    font-weight: 700
    color: $traveler-brown
    background: linear-gradient(135deg, $traveler-cream 0%, rgba($traveler-walnut, 0.2) 100%)

  // 書背效果（左側色條）
  &::before
    content: ''
    position: absolute
    top: 0
    left: 0
    width: 8px
    height: 100%
    z-index: 1

  // 交替使用洗朱色和胡桃色
  .book-card:nth-child(odd) &::before
    background: $traveler-coral

  .book-card:nth-child(even) &::before
    background: $traveler-walnut

  // Hover 時的光澤效果
  &::after
    content: ''
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    background: linear-gradient(135deg, rgba(251, 250, 245, 0) 0%, rgba(251, 250, 245, 0.15) 50%, rgba(251, 250, 245, 0) 100%)
    opacity: 0
    transition: opacity 0.3s ease

  .book-card:hover &::after
    opacity: 1

// 書本右側面效果（3D感）
.book-spine
  position: absolute
  top: 0
  right: -6px
  width: 6px
  height: 100%
  background: linear-gradient(to right, rgba(89, 88, 87, 0.3), rgba(89, 88, 87, 0.1))
  transform: skewY(-2deg)

// ===================================
// 書名標籤
// ===================================
.book-title
    margin-top: 15px
    text-align: center
    color: #E0C48F
    font-weight: 600
    font-size: 14px
    letter-spacing: 0.05em // 增加文字間距
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4), 0 0 4px rgba(224, 196, 143, 0.3)

    @include desktop
      font-size: 16px

// ===================================
// RWD 調整
// ===================================
@media (max-width: 480px)
  .bookshelf
    grid-template-columns: repeat(2, 1fr)
    gap: 20px
    padding: 20px 12px
</style>
