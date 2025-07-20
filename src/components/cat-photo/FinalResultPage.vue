<template>

  <div class="final-result-page">
    <!-- 返回按鈕 -->
    <button class="back-button" @click="handleClose">
      <div class="back-icon"></div>
    </button>

    <!-- 最終照片顯示 -->
    <div class="final-photo-section">
      <div class="photo-container">
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
      <div class="action-buttons">
        <button class="action-button primary" @click="handleShare" :disabled="isProcessing || isSharing">
          <div v-if="!isSharing" class="button-icon"></div>
          <div v-else class="loading-spinner"></div>
          <span>{{ isSharing ? '分享中...' : '分享照片' }}</span>
        </button>
        <button class="action-button secondary" @click="handleDownload" :disabled="isProcessing">
          <div class="button-icon"></div>
          <span>下載照片</span>
        </button>
      </div>
    </div>
  </div>
  <!-- 成功提示 -->
  <div v-if="showSuccessMessage" class="success-toast">
    {{ successMessage }}
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
  if (isProcessing.value) return

  try {
    const blob = await preparePhotoForShare()
    if (!blob) {
      showError('準備下載失敗，請重試')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string

      // 🚀 就這一行！直接導頁到照片
      window.location.href = dataUrl
    }

    reader.onerror = () => {
      showError('處理照片失敗，請重試')
    }

    reader.readAsDataURL(blob)
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
// 最終照片區域
// ===================================
.final-photo-section
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
  border-radius: $border-radius-xl
  background: #ffffff
  box-shadow: 0 8px 32px rgba(28, 28, 28, 0.12), 0 2px 8px rgba(28, 28, 28, 0.08)

  @include tablet
    max-width: 500px

  @include desktop
    max-width: 600px

.final-canvas
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
// 分享區域
// ===================================

.share-section
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

  // 分享按鈕圖示
  &.primary .button-icon
    background-image: url('@/assets/img/icon/share.png')

  // 下載按鈕圖示
  &.secondary .button-icon
    background-image: url('@/assets/img/icon/download.png')

  // 完成按鈕 - 直接使用顏色值
  &.primary
    background: $camera-btn-primary // 洗朱色
    color: #ffffff       // 白色文字
    box-shadow: 0 4px 12px rgba(236, 109, 81, 0.3)

    &:hover:not(:disabled)
      background: rgba(236, 109, 81, 0.9)
      transform: translateY(-1px)
      box-shadow: 0 4px 12px rgba(236, 109, 81, 0.4)

  // 重拍按鈕 - 直接使用顏色值
  &.secondary
    border: 1px solid rgba(155, 155, 130, 0.3)
    background: $camera-btn-secondary  // 鉛色
    color: #FFFFFF      // 深色文字

    &:hover:not(:disabled)
      background: rgba(155, 155, 130, 0.9)
      transform: translateY(-1px)

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
  .final-photo-section
    padding: $spacing-2xl $spacing-lg

  .action-buttons
    justify-content: center
    gap: $spacing-lg

  .action-button
    flex: none
    min-width: 120px

// ===================================
// 成功提示
// ===================================

.success-toast
  position: fixed
  top: calc(70px + env(safe-area-inset-top, 0px))
  left: 50%
  z-index: 20
  padding: 10px 20px
  border-radius: $border-radius-lg
  background: rgba(145, 181, 0, 0.95)
  box-shadow: 0 4px 12px rgba(145, 181, 0, 0.3)
  color: #ffffff
  font-weight: 500
  font-size: 13px
  transform: translateX(-50%)
  animation: slideInFromTop 0.3s ease-out

  @include tablet
    padding: 12px 24px
    font-size: 14px

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


</style>