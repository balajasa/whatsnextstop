<template>
  <div class="result-page">
    <!-- 返回按鈕 -->
    <button class="back-button" @click="handleClose">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </svg>
    </button>

    <!-- 照片預覽區域 -->
    <div class="photo-preview-section">
      <div class="photo-container">
        <canvas ref="resultCanvas" class="result-canvas"></canvas>

        <!-- 載入覆蓋層 -->
        <div v-if="isProcessing" class="processing-overlay">
          <div class="loading-spinner"></div>
          <p>處理中...</p>
        </div>
      </div>

      <!-- 貓咪資訊卡片 -->
      <div v-if="selectedCat" class="cat-info-card">
        <div class="cat-emoji">🐱</div>
        <div class="cat-details">
          <h3>{{ formatCatName(selectedCat.name) }}</h3>
          <p class="cat-description">{{ getCatDescription() }}</p>
        </div>
      </div>
    </div>

    <!-- 操作按鈕區域 -->
    <div class="action-section">
      <div class="action-buttons">
        <button class="action-button secondary" @click="handleRetake" :disabled="isProcessing">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
          </svg>
          <span>重拍</span>
        </button>

        <button class="action-button secondary" @click="handleChangeCat" :disabled="isProcessing">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>換貓咪</span>
        </button>

        <button class="action-button primary" @click="handleComplete" :disabled="isProcessing || !canProceed">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
          </svg>
          <span>完成</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useCatPhoto } from '../../composables/cat-photo/useCatPhoto'
import { useCatOverlay } from '../../composables/cat-photo/useCatOverlay'

// ===================================
// Props & Emits
// ===================================

const emit = defineEmits<{
  retake: []
  changeCat: []
  complete: []
  close: []
}>()

// ===================================
// Refs
// ===================================

const resultCanvas = ref<HTMLCanvasElement | null>(null)

// ===================================
// Composables
// ===================================

const {
  selectedCat,
  canProceedToResult,
  formatCatName,
  changeCat,
  showError
} = useCatPhoto()

const {
  isProcessing,
  updatePhotoDisplay
} = useCatOverlay()

// ===================================
// 計算屬性
// ===================================

const canProceed = computed(() => canProceedToResult.value && !isProcessing.value)

// ===================================
// 事件處理
// ===================================

/**
 * 處理重拍
 */
const handleRetake = () => {
  emit('retake')
}

/**
 * 處理更換貓咪
 */
const handleChangeCat = async () => {
  try {
    const newCat = changeCat()
    if (newCat && resultCanvas.value) {
      await updateDisplay()
    }
  } catch (error) {
    console.error('Change cat failed:', error)
    showError('更換貓咪失敗')
  }
}

/**
 * 處理完成
 */
const handleComplete = () => {
  if (!canProceed.value) {
    showError('請等待處理完成')
    return
  }
  emit('complete')
}

/**
 * 處理關閉
 */
const handleClose = () => {
  emit('close')
}

// ===================================
// 工具方法
// ===================================

/**
 * 更新顯示
 */
const updateDisplay = async () => {
  if (!resultCanvas.value) return

  try {
    const success = await updatePhotoDisplay(resultCanvas.value)
    if (!success) {
      showError('更新顯示失敗')
    }
  } catch (error) {
    console.error('Update display failed:', error)
    showError('更新顯示失敗')
  }
}

/**
 * 獲取貓咪描述
 */
const getCatDescription = (): string => {
  if (!selectedCat.value) return ''

  const descriptions: Record<string, string> = {
    'eat_cat': '正在享用美食的小貓咪',
    'lazy_cat': '慵懶地趴著休息',
    'travel_cat': '準備踏上旅程的冒險家',
    'wall_cat': '在門邊靜靜守候'
  }

  return descriptions[selectedCat.value.id] || '一隻可愛的小貓咪'
}

// ===================================
// 生命週期
// ===================================

onMounted(async () => {
  try {
    await nextTick()
    await updateDisplay()
  } catch (error) {
    console.error('Result page initialization failed:', error)
    showError('頁面初始化失敗')
  }
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.result-page
  display: flex
  flex-direction: column
  height: 100vh
  background: $warm-white

// ===================================
// 返回按鈕
// ===================================

.back-button
  position: absolute
  top: 20px
  left: 20px
  width: 44px
  height: 44px
  background: rgba($text-dark, 0.8)
  color: white
  border: none
  border-radius: 50%
  @include flex-center
  cursor: pointer
  z-index: 10
  transition: all 0.2s ease
  backdrop-filter: blur(4px)

  svg
    width: 24px
    height: 24px

  &:hover
    background: $text-dark
    transform: scale(1.1)

// ===================================
// 照片預覽區域
// ===================================

.photo-preview-section
  flex: 1
  padding: $spacing-xl $spacing-md $spacing-lg
  @include flex-center
  flex-direction: column

.photo-container
  position: relative
  width: 100%
  max-width: 400px
  background: white
  border-radius: $border-radius-lg
  box-shadow: 0 8px 30px rgba($text-dark, 0.15)
  overflow: hidden
  margin-bottom: $spacing-lg

.result-canvas
  width: 100%
  height: auto
  display: block

.processing-overlay
  @include absolute-center
  @include flex-center
  flex-direction: column
  background: rgba(white, 0.9)
  width: 100%
  height: 100%
  backdrop-filter: blur(4px)

  .loading-spinner
    width: 40px
    height: 40px
    border: 3px solid rgba($matcha-bright, 0.2)
    border-top: 3px solid $matcha-bright
    border-radius: 50%
    animation: spin 1s linear infinite
    margin-bottom: $spacing-md

  p
    color: $text-dark
    font-weight: 500

// ===================================
// 貓咪資訊卡片
// ===================================

.cat-info-card
  display: flex
  align-items: center
  background: linear-gradient(135deg, $almond-cream 0%, $almond-soft 100%)
  padding: $spacing-lg
  border-radius: $border-radius-lg
  width: 100%
  max-width: 400px
  box-shadow: 0 4px 15px rgba($text-dark, 0.1)

.cat-emoji
  font-size: 48px
  margin-right: $spacing-lg
  flex-shrink: 0

.cat-details
  flex: 1

  h3
    font-size: 20px
    font-weight: 700
    color: $text-dark
    margin: 0 0 $spacing-xs 0

  .cat-description
    font-size: 14px
    color: $warm-text-light
    margin: 0
    line-height: 1.4

// ===================================
// 操作按鈕區域
// ===================================

.action-section
  background: white
  padding: $spacing-lg
  border-top: 1px solid $warm-border
  flex-shrink: 0

.action-buttons
  display: flex
  gap: $spacing-md
  max-width: 400px
  margin: 0 auto

.action-button
  flex: 1
  @include flex-center
  gap: $spacing-xs
  padding: $spacing-md $spacing-lg
  border: none
  border-radius: $border-radius-md
  font-size: 14px
  font-weight: 600
  cursor: pointer
  transition: all 0.2s ease
  min-height: 48px

  svg
    width: 18px
    height: 18px
    flex-shrink: 0

  &.primary
    background: $matcha-bright
    color: white

    &:hover:not(:disabled)
      background: rgba($matcha-bright, 0.9)
      transform: translateY(-1px)

  &.secondary
    background: $almond-cream
    color: $text-dark
    border: 1px solid $warm-border

    &:hover:not(:disabled)
      background: rgba($almond-cream, 0.8)
      transform: translateY(-1px)

  &:disabled
    opacity: 0.6
    cursor: not-allowed
    transform: none

// ===================================
// 動畫
// ===================================

@keyframes spin
  from
    transform: rotate(0deg)
  to
    transform: rotate(360deg)

// ===================================
// 響應式調整
// ===================================

@include mobile-only
  .photo-preview-section
    padding: $spacing-lg $spacing-sm $spacing-md

  .cat-info-card
    padding: $spacing-md

  .cat-emoji
    font-size: 40px
    margin-right: $spacing-md

  .cat-details h3
    font-size: 18px

  .action-buttons
    flex-direction: column

  .action-button
    width: 100%

@include tablet
  .photo-container
    max-width: 500px

  .cat-info-card
    max-width: 500px

  .action-buttons
    max-width: 500px

@include desktop
  .photo-preview-section
    padding: $spacing-2xl $spacing-lg

  .action-buttons
    justify-content: center
    gap: $spacing-lg

  .action-button
    flex: none
    min-width: 120px
</style>