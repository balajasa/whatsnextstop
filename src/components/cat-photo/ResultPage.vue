<template>
  <div class="result-page">
    <!-- 返回按鈕 -->
    <button class="back-button" @click="handleClose">
      <div class="back-icon"></div>
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
    </div>

    <!-- 操作按鈕區域 -->
    <div class="action-section">
      <div class="action-buttons">

        <button class="action-button secondary" @click="handleRetake" :disabled="isProcessing">
          <div class="button-icon"></div>
          <span>重拍</span>
        </button>

        <button class="action-button primary" @click="handleComplete" :disabled="isProcessing || !canProceed">
          <div class="button-icon"></div>
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
  canProceedToResult,
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
    showError('更新顯示失敗')
  }
}

// ===================================
// 生命週期
// ===================================

onMounted(async () => {
  try {
    await nextTick()
    await updateDisplay()
  } catch (error) {
    showError('頁面初始化失敗')
  }
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.result-page
  display: flex
  overflow-y: auto
  flex-direction: column
  // 計算實際可用高度：扣除 Header(50px) 和 BreadcrumbNav(約50px)
  min-height: calc(100vh - 260px)
  background: $camera-pure

// ===================================
// 返回按鈕
// ===================================

.back-button
  @include flex-center
  position: absolute
  top: 8%
  left: calc(15px + env(safe-area-inset-left, 0px))
  z-index: 10
  width: 40px
  height: 40px
  border: none
  border-radius: 50%
  background: $camera-bg-overlay
  color: $camera-text-white
  cursor: pointer
  transition: all 0.2s ease
  backdrop-filter: blur(4px)

  @include tablet
    top: calc(20px + env(safe-area-inset-top, 0px))
    left: calc(20px + env(safe-area-inset-left, 0px))
    width: 44px
    height: 44px

// 返回按鈕圖片
.back-icon
  width: 20px
  height: 20px
  background-image: url('@/assets/img/icon/back.png')
  background-position: center
  background-size: contain
  background-repeat: no-repeat

  @include tablet
    width: 24px
    height: 24px

// ===================================
// 照片預覽區域
// ===================================

.photo-preview-section
  @include flex-center
  flex: 1
  flex-direction: column
  padding: $spacing-lg $spacing-sm $spacing-md
  margin-top: 60px

  @include tablet
    padding: $spacing-xl $spacing-md $spacing-lg

.photo-container
  position: relative
  overflow: hidden
  margin-bottom: $spacing-lg
  max-width: calc(100vw - 32px)
  width: 100%
  border-radius: $border-radius-lg
  background: $camera-text-white
  box-shadow: 0 6px 24px rgba(28, 28, 28, 0.1), 0 2px 6px rgba(28, 28, 28, 0.06)

  @include tablet
    max-width: 500px

  @include desktop
    max-width: 600px

.result-canvas
  display: block
  width: 100%
  height: auto

.processing-overlay
  @include absolute-center
  @include flex-center
  flex-direction: column
  width: 100%
  height: 100%
  background: rgba(255, 255, 255, 0.95)
  backdrop-filter: blur(4px)

  .loading-spinner
    margin-bottom: $spacing-md
    width: 36px
    height: 36px
    border: 3px solid rgba(236, 109, 81, 0.2)
    border-top: 3px solid #EC6D51
    border-radius: 50%
    animation: spin 1s linear infinite

    @include tablet
      width: 40px
      height: 40px

  p
    color: #1C1C1C
    font-weight: 500
    font-size: 14px

    @include tablet
      font-size: 16px

// ===================================
// 操作按鈕區域
// ===================================

.action-section
  flex-shrink: 0
  padding: $spacing-md $spacing-md calc($spacing-md + env(safe-area-inset-bottom, 16px))
  border-top: 1px solid rgba(155, 155, 130, 0.2)
  background: rgba(255, 255, 251, 0.95)

  @include tablet
    padding: $spacing-lg $spacing-lg calc($spacing-lg + env(safe-area-inset-bottom, 16px))

.action-buttons
  display: flex
  margin: 0 auto
  max-width: 320px
  gap: $spacing-sm

  @include tablet
    max-width: 400px
    gap: $spacing-md

  @include desktop
    max-width: 500px

.action-button
  @include flex-center
  flex: 1
  padding: $spacing-sm $spacing-md
  min-height: 44px
  border: none
  border-radius: $border-radius-md
  font-weight: 600
  font-size: 14px
  cursor: pointer
  gap: $spacing-xs

  // 按鈕圖示樣式
  .button-icon
    flex-shrink: 0
    width: 16px
    height: 16px
    background-position: center
    background-size: contain
    background-repeat: no-repeat

  // 重拍按鈕圖示
  &.secondary .button-icon
    background-image: url('@/assets/img/icon/undo.png')

  // 完成按鈕圖示
  &.primary .button-icon
    background-image: url('@/assets/img/icon/done.png')

  // 完成按鈕 - 直接使用顏色值
  &.primary
    background: #EC6D51  // 洗朱色
    color: #ffffff       // 白色文字
    box-shadow: 0 4px 12px rgba(236, 109, 81, 0.3)

    &:hover:not(:disabled)
      background: rgba(236, 109, 81, 0.9)
      box-shadow: 0 4px 12px rgba(236, 109, 81, 0.4)

  // 重拍按鈕 - 直接使用顏色值
  &.secondary
    border: 1px solid rgba(155, 155, 130, 0.3)
    background: #FFFFFB  // 純白背景
    color: #1C1C1C      // 深色文字

    &:hover:not(:disabled)
      background: rgba(255, 255, 251, 0.8)

  &:disabled
    opacity: 0.6
    cursor: not-allowed
    transform: none

  @include tablet
    padding: $spacing-md $spacing-lg
    min-height: 48px
    font-size: 16px

    .button-icon
      width: 18px
      height: 18px

// ===================================
// 桌面版調整
// ===================================

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