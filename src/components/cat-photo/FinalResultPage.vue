<template>
  <div class="final-result-page">
    <!-- 返回按鈕 -->
    <button class="back-button" @click="handleClose">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </svg>
    </button>

    <!-- 成功標題 -->
    <div class="success-header">
      <div class="success-icon">🎉</div>
      <h1 class="success-title">作品完成！</h1>
      <p class="success-subtitle">你的貓咪照片已經準備好了</p>
    </div>

    <!-- 最終照片顯示 -->
    <div class="final-photo-section">
      <div class="photo-frame">
        <canvas ref="finalCanvas" class="final-canvas"></canvas>

        <!-- 載入覆蓋層 -->
        <div v-if="isProcessing" class="processing-overlay">
          <div class="loading-spinner"></div>
          <p>準備分享中...</p>
        </div>
      </div>
    </div>

    <!-- 分享按鈕區域 -->
    <div class="share-section">
      <div class="share-buttons">
        <button class="share-button primary" @click="handleShare" :disabled="isProcessing || isSharing">
          <svg v-if="!isSharing" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
          </svg>
          <div v-else class="loading-spinner small"></div>
          <span>{{ isSharing ? '分享中...' : '分享照片' }}</span>
        </button>

        <button class="share-button secondary" @click="handleDownload" :disabled="isProcessing">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
          <span>下載照片</span>
        </button>
      </div>

      <!-- 分享提示 -->
      <div class="share-tips">
        <div class="tip-item">
          <span class="tip-icon">💡</span>
          <span class="tip-text">點擊分享按鈕可以傳送給朋友</span>
        </div>
        <div class="tip-item">
          <span class="tip-icon">📱</span>
          <span class="tip-text">也可以下載到相簿保存</span>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="showSuccessMessage" class="success-toast">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useCatPhoto } from '../../composables/cat-photo/useCatPhoto'
import { useCatOverlay } from '../../composables/cat-photo/useCatOverlay'

// ===================================
// Props & Emits
// ===================================

const emit = defineEmits<{
  share: []
  close: []
}>()

// ===================================
// Refs
// ===================================

const finalCanvas = ref<HTMLCanvasElement | null>(null)
const isSharing = ref(false)
const showSuccessMessage = ref(false)
const successMessage = ref('')

// ===================================
// Composables
// ===================================

const {
  showError
} = useCatPhoto()

const {
  isProcessing,
  updatePhotoDisplay,
  sharePhoto,
  downloadPhoto,
  preparePhotoForShare
} = useCatOverlay()

// ===================================
// 事件處理
// ===================================

/**
 * 處理分享
 */
const handleShare = async () => {
  if (isSharing.value || isProcessing.value) return

  isSharing.value = true

  try {
    const success = await sharePhoto()

    if (success) {
      showSuccess('分享成功！')
      emit('share')
    } else {
      // 用戶取消分享或其他非錯誤情況
      console.log('Share cancelled or failed silently')
    }
  } catch (error) {
    console.error('Share failed:', error)
    showError('分享失敗，請嘗試下載照片')
  } finally {
    isSharing.value = false
  }
}

/**
 * 處理下載
 */
const handleDownload = async () => {
  try {
    const blob = await preparePhotoForShare()
    if (blob) {
      const success = downloadPhoto(blob)
      if (success) {
        showSuccess('照片已下載到您的裝置！')
      } else {
        showError('下載失敗，請重試')
      }
    } else {
      showError('準備下載失敗')
    }
  } catch (error) {
    console.error('Download failed:', error)
    showError('下載失敗，請重試')
  }
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
 * 更新最終顯示
 */
const updateFinalDisplay = async () => {
  if (!finalCanvas.value) return

  try {
    const success = await updatePhotoDisplay(finalCanvas.value)
    if (!success) {
      showError('載入照片失敗')
    }
  } catch (error) {
    console.error('Update final display failed:', error)
    showError('載入照片失敗')
  }
}

/**
 * 顯示成功訊息
 */
const showSuccess = (message: string) => {
  successMessage.value = message
  showSuccessMessage.value = true

  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

// ===================================
// 生命週期
// ===================================

onMounted(async () => {
  try {
    await nextTick()
    await updateFinalDisplay()
  } catch (error) {
    console.error('Final result page initialization failed:', error)
    showError('頁面初始化失敗')
  }
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.final-result-page
  display: flex
  flex-direction: column
  min-height: 100vh
  background: linear-gradient(135deg, $matcha-soft 0%, $almond-soft 100%)
  overflow-y: auto

// ===================================
// 返回按鈕
// ===================================

.back-button
  position: fixed
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
// 成功標題
// ===================================

.success-header
  text-align: center
  padding: $spacing-2xl $spacing-md $spacing-lg
  margin-top: $spacing-xl

.success-icon
  font-size: 64px
  margin-bottom: $spacing-md

.success-title
  font-size: 28px
  font-weight: 700
  color: $text-dark
  margin: 0 0 $spacing-sm 0

.success-subtitle
  font-size: 16px
  color: $warm-text-light
  margin: 0

// ===================================
// 最終照片區域
// ===================================

.final-photo-section
  flex: 1
  padding: 0 $spacing-md $spacing-lg
  @include flex-center
  flex-direction: column

.photo-frame
  position: relative
  width: 100%
  max-width: 400px
  background: white
  border-radius: $border-radius-xl
  box-shadow: 0 12px 40px rgba($text-dark, 0.2)
  overflow: hidden
  margin-bottom: $spacing-lg

.final-canvas
  width: 100%
  height: auto
  display: block

.processing-overlay
  @include absolute-center
  @include flex-center
  flex-direction: column
  background: rgba(white, 0.95)
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
// 分享區域
// ===================================

.share-section
  background: white
  padding: $spacing-xl $spacing-md
  border-top: 1px solid rgba($warm-border, 0.3)
  flex-shrink: 0

.share-buttons
  display: flex
  gap: $spacing-md
  margin-bottom: $spacing-lg
  max-width: 400px
  margin-left: auto
  margin-right: auto

.share-button
  flex: 1
  @include flex-center
  gap: $spacing-xs
  padding: $spacing-lg
  border: none
  border-radius: $border-radius-lg
  font-size: 16px
  font-weight: 600
  cursor: pointer
  transition: all 0.2s ease
  min-height: 56px

  svg
    width: 20px
    height: 20px
    flex-shrink: 0

  .loading-spinner.small
    width: 20px
    height: 20px
    border: 2px solid rgba(white, 0.3)
    border-top: 2px solid white
    border-radius: 50%
    animation: spin 1s linear infinite

  &.primary
    background: $matcha-bright
    color: white
    box-shadow: 0 6px 20px rgba($matcha-bright, 0.3)

    &:hover:not(:disabled)
      background: rgba($matcha-bright, 0.9)
      transform: translateY(-2px)
      box-shadow: 0 8px 25px rgba($matcha-bright, 0.4)

  &.secondary
    background: $caramel-orange
    color: white
    box-shadow: 0 6px 20px rgba($caramel-orange, 0.3)

    &:hover:not(:disabled)
      background: rgba($caramel-orange, 0.9)
      transform: translateY(-2px)
      box-shadow: 0 8px 25px rgba($caramel-orange, 0.4)

  &:disabled
    opacity: 0.6
    cursor: not-allowed
    transform: none

// ===================================
// 分享提示
// ===================================

.share-tips
  @include flex-center
  flex-direction: column
  gap: $spacing-sm
  max-width: 400px
  margin: 0 auto

.tip-item
  @include flex-center
  gap: $spacing-xs
  font-size: 14px
  color: $warm-text-light

.tip-icon
  font-size: 16px

.tip-text
  text-align: center

// ===================================
// 成功提示
// ===================================

.success-toast
  position: fixed
  top: 80px
  left: 50%
  transform: translateX(-50%)
  background: rgba($matcha-bright, 0.95)
  color: white
  padding: 12px 24px
  border-radius: $border-radius-lg
  font-size: 14px
  font-weight: 500
  z-index: 20
  box-shadow: 0 4px 12px rgba($matcha-bright, 0.3)
  animation: slideInFromTop 0.3s ease-out

// ===================================
// 動畫定義
// ===================================

@keyframes spin
  from
    transform: rotate(0deg)
  to
    transform: rotate(360deg)

@keyframes slideInFromTop
  from
    opacity: 0
    transform: translateX(-50%) translateY(-20px)
  to
    opacity: 1
    transform: translateX(-50%) translateY(0)

// ===================================
// 響應式調整
// ===================================

@include mobile-only
  .success-header
    padding: $spacing-lg $spacing-md $spacing-sm
    margin-top: $spacing-md

  .success-icon
    font-size: 48px

  .success-title
    font-size: 24px

  .final-photo-section
    padding: 0 $spacing-sm $spacing-md

  .photo-info
    padding: $spacing-md

  .share-buttons
    flex-direction: column

  .share-button
    width: 100%

@include tablet
  .photo-frame
    max-width: 500px

  .photo-info
    max-width: 500px

  .share-buttons
    max-width: 500px

@include desktop
  .final-photo-section
    padding: 0 $spacing-lg $spacing-xl

  .share-buttons
    flex-direction: row
</style>