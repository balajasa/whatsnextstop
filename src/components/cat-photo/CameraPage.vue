<template>
  <div class="camera-page">
    <!-- 關閉按鈕（使用自定義圖片） -->
    <button class="close-button" @click="handleClose">
      <div class="close-icon"></div>
    </button>

    <!-- 切換鏡頭按鈕（使用自定義圖片） -->
    <button class="switch-camera-button" @click="handleSwitchCamera" :disabled="!isCameraReady || isLoading">
      <div class="sync-icon"></div>
    </button>

    <!-- 相機容器 -->
    <div class="camera-container">
      <!-- 視頻元素 -->
      <video ref="videoElement" class="camera-video" autoplay playsinline muted></video>

      <!-- 載入狀態 -->
      <div v-if="isInitializing || !isCameraReady" class="camera-loading">
        <div class="loading-spinner"></div>
        <p>{{ getLoadingText() }}</p>
      </div>

      <!-- 相機未就緒提示 -->
      <div v-if="!isInitializing && !isCameraReady && !error" class="camera-error">
        <div class="error-icon">📷</div>
        <p>相機準備中...</p>
      </div>

      <!-- 📸 照片處理中覆蓋層 -->
      <div v-if="isProcessingPhoto" class="photo-processing-overlay">
        <div class="processing-content">
          <div class="dots-spinner">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <p class="processing-text">正在處理照片...</p>
        </div>
      </div>

      <!-- 拍照指引 -->
      <div v-if="isCameraReady && !isCapturing && !isProcessingPhoto" class="camera-guide">
        <div class="guide-frame"></div>
        <p class="guide-text">將相機對準想要拍攝的場景</p>
      </div>

      <!-- 拍照按鈕 -->
      <button v-if="isCameraReady && !isProcessingPhoto" class="capture-button" @click="handleCapture"
        :disabled="isCapturing || isLoading">
        <div class="capture-inner" :class="{ capturing: isCapturing }"></div>
      </button>
    </div>

    <!-- 隱藏的 Canvas 用於拍照處理 -->
    <canvas ref="canvasElement" class="hidden-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useCamera } from '../../composables/cat-photo/useCamera'
import { useCatPhoto } from '../../composables/cat-photo/useCatPhoto'

// ===================================
// Props & Emits
// ===================================

const emit = defineEmits<{
  photoCaptured: []
  close: []
}>()

// ===================================
// Refs
// ===================================

const videoElement = ref<HTMLVideoElement | null>(null)
const canvasElement = ref<HTMLCanvasElement | null>(null)
const isCapturing = ref(false)
const isProcessingPhoto = ref(false) // 🆕 照片處理狀態

// ===================================
// Composables
// ===================================

const {
  isInitializing,
  isCameraReady,
  isLoading,
  initializeCamera,
  stopCamera,
  capturePhoto,
  switchCamera,
  setCanvasRef
} = useCamera()

const {
  error,
  clearError,
  showError
} = useCatPhoto()

// ===================================
// 事件處理
// ===================================

/**
 * 處理拍照 - 動態調整處理時間版本
 */
const handleCapture = async () => {
  if (isCapturing.value || !isCameraReady.value) return

  isCapturing.value = true
  clearError()

  try {
    // 1. 執行拍照
    const photoData = await capturePhoto()

    if (photoData) {
      // 2. 拍照完成，立即顯示處理動畫
      isCapturing.value = false
      isProcessingPhoto.value = true

      // 3. 記錄開始時間
      const startTime = Date.now()

      // 4. 🔥 實際的照片處理邏輯
      await performPhotoProcessing(photoData)

      // 5. 計算已經過的時間
      const elapsedTime = Date.now() - startTime
      const minDisplayTime = 1200 // 最少顯示 1.2 秒

      // 6. 如果處理太快，延長顯示時間
      if (elapsedTime < minDisplayTime) {
        await new Promise(resolve =>
          setTimeout(resolve, minDisplayTime - elapsedTime)
        )
      }

      // 7. 完成後跳轉
      emit('photoCaptured')
    }
  } catch (error) {
    console.error('Capture failed:', error)
    showError('拍照失敗，請重試')
  } finally {
    // 8. 重置狀態
    isProcessingPhoto.value = false
  }
}

/**
 * 🆕 實際的照片處理邏輯
 * 處理照片並準備合成
 */
const performPhotoProcessing = async (photoData: any) => {
  try {
    // 這裡放實際的照片處理邏輯
    // 例如：照片壓縮、格式轉換、儲存到狀態等

    // 如果你有照片壓縮函數
    // const compressedPhoto = await compressImage(photoData)

    // 如果需要儲存到全域狀態
    // await savePhotoToState(photoData)

    // 如果需要預處理
    // await preparePhotoForCatOverlay(photoData)

    console.log('Photo processing completed')
    return photoData
  } catch (error) {
    console.error('Photo processing failed:', error)
    throw error
  }
}

/**
 * 處理關閉
 */
const handleClose = async () => {
  try {
    await stopCamera()
    emit('close')
  } catch (error) {
    console.error('Close camera failed:', error)
    emit('close') // 即使失敗也要關閉頁面
  }
}

/**
 * 處理切換鏡頭
 */
const handleSwitchCamera = async () => {
  try {
    await switchCamera()
  } catch (error) {
    console.error('Switch camera failed:', error)
    showError('切換鏡頭失敗')
  }
}

// ===================================
// 工具方法
// ===================================

/**
 * 獲取載入文字
 */
const getLoadingText = (): string => {
  if (isInitializing.value) {
    return '啟動相機中...'
  }
  if (!isCameraReady.value) {
    return '準備相機中...'
  }
  return '載入中...'
}

// ===================================
// 生命週期
// ===================================

onMounted(async () => {
  try {
    await nextTick()

    if (videoElement.value && canvasElement.value) {
      // 設置 canvas 引用
      setCanvasRef(canvasElement.value)

      // 初始化相機
      await initializeCamera(videoElement.value)
    }
  } catch (error) {
    console.error('Camera initialization failed:', error)
    showError('無法開啟相機，請檢查權限設定')
  }
})

onUnmounted(async () => {
  await stopCamera()
})

// ===================================
// 觸摸事件處理（防止誤觸）
// ===================================

const handleTouchStart = (event: TouchEvent) => {
  // 防止多點觸控時的誤操作
  if (event.touches.length > 1) {
    event.preventDefault()
  }
}

onMounted(() => {
  document.addEventListener('touchstart', handleTouchStart, { passive: false })
})

onUnmounted(() => {
  document.removeEventListener('touchstart', handleTouchStart)
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.camera-page
  position: fixed !important
  top: 0 !important
  left: 0 !important
  z-index: $z-camera
  overflow: hidden
  width: 100vw !important
  height: 100dvh !important
  background: $camera-text

// ===================================
// 控制按鈕（使用自定義圖片）
// ===================================

.close-button,
.switch-camera-button
  @include flex-center
  position: absolute
  z-index: 10鈕
  width: 40px
  height: 40px
  border: none
  border-radius: 50%
  background: $camera-bg-overlay
  cursor: pointer
  transition: all 0.2s ease
  backdrop-filter: blur(4px)

  &:hover:not(:disabled)
    background: rgba(120, 124, 123, 0.9)
    transform: scale(1.1)

  &:disabled
    opacity: 0.5
    cursor: not-allowed

  // Tablet - 中等尺寸
  @include tablet
    width: 44px
    height: 44px

.close-button
  top: 15px
  left: 15px

  @include tablet
    top: 20px
    left: 20px

.switch-camera-button
  top: 15px
  right: 15px

  @include tablet
    top: 20px
    right: 20px

// 關閉按鈕圖片
.close-icon
  width: 20px
  height: 20px
  background-image: url('@/assets/img/icon/close_w.png')
  background-position: center
  background-size: contain
  background-repeat: no-repeat

  @include tablet
    width: 24px
    height: 24px

// 同步/旋轉按鈕圖片
.sync-icon
  width: 20px
  height: 20px
  background-image: url('@/assets/img/icon/cached.png')
  background-position: center
  background-size: contain
  background-repeat: no-repeat

  @include tablet
    width: 24px
    height: 24px

// ===================================
// 相機容器
// ===================================

.camera-container
  @include flex-center
  position: relative
  width: 100%
  height: 100%

.camera-video
  width: 100%
  height: 100%
  object-fit: cover

// ===================================
// 載入狀態
// ===================================

.camera-loading,
.camera-error
  @include absolute-center
  @include flex-center
  z-index: 5
  flex-direction: column
  color: $camera-text-white

.loading-spinner
  margin-bottom: $spacing-mdpinner
  width: 36px
  height: 36px
  border: 3px solid rgba(255, 255, 255, 0.2)
  border-top: 3px solid $camera-text-white
  border-radius: 50%
  animation: spin 1s linear infinite

  @include tablet
    width: 40px
    height: 40px

.error-icon
  margin-bottom: $spacing-md
  font-size: 40px

  @include tablet
    font-size: 48px

.camera-loading p,
.camera-error p
  margin: 0
  text-align: center
  font-size: 14px

  @include tablet
    font-size: 16px

// ===================================
// 🆕 照片處理中覆蓋層
// ===================================

.photo-processing-overlay
  @include absolute-center
  @include flex-center
  z-index: 15
  width: 100%
  height: 100%
  background: rgba(0, 0, 0, 0.85)
  backdrop-filter: blur(8px)

.processing-content
  @include flex-center
  flex-direction: column
  text-align: center

.dots-spinner
  @include flex-center
  margin-bottom: $spacing-lg
  gap: 8px

  @include tablet
    gap: 10px

.dot
  width: 12px
  height: 12px
  background: $camera-btn-primary // 使用主題色 #EC6D51
  border-radius: 50%
  animation: bounce 1.4s ease-in-out infinite

  @include tablet
    width: 14px
    height: 14px

  &:nth-child(2)
    animation-delay: 0.2s

  &:nth-child(3)
    animation-delay: 0.4s

.processing-text
  margin: 0
  color: $camera-text-white
  font-size: 16px
  font-weight: 500

  @include tablet
    font-size: 18px

// ===================================
// 拍照指引
// ===================================

.camera-guide
  position: absolute
  top: 50%
  left: 50%
  z-index: 3
  transform: translate(-50%, -50%)
  pointer-events: none

.guide-frame
  margin-bottom: $spacing-md
  width: 180px
  height: 180px
  border: 2px solid rgba(255, 255, 255, 0.6)
  border-radius: $border-radius-lg

  @include tablet
    width: 250px
    height: 250px

.guide-text
  margin: 0
  padding: $spacing-sm $spacing-md
  border-radius: $border-radius-md
  background: $camera-bg-modal
  color: $camera-text-white
  text-align: center
  font-size: 13px
  backdrop-filter: blur(4px)

  @include tablet
    font-size: 14px

// ===================================
// 拍照按鈕
// ===================================

.capture-button
  position: absolute
  z-index: 10
  width: 70px
  height: 70px
  border: 4px solid rgba(255, 255, 255, 0.7)
  border-radius: 50%
  background: rgba(255, 255, 255, 0.9)
  cursor: pointer

  &:disabled
    opacity: 0.6
    cursor: not-allowed

  // 直立模式：底部中央
  bottom: calc(30px + env(safe-area-inset-bottom, 20px))
  left: 50%
  transform: translateX(-50%)

  @include tablet
    bottom: 50px
    width: 90px
    height: 90px

  // 橫向模式：右側中央
  @media (orientation: landscape)
    top: 50%
    right: calc(40px + env(safe-area-inset-right, 20px))
    bottom: auto
    left: auto
    transform: translateY(-50%)

.capture-inner
  width: 100%
  height: 100%
  border-radius: 50%
  background: $camera-text-white
  transition: all 0.3s ease

  &.capturing
    background: $camera-accent

// ===================================
// 隱藏元素
// ===================================

.hidden-canvas
  display: none

// ===================================
// 動畫
// ===================================

@keyframes spin
  from
    transform: rotate(0deg)
  to
    transform: rotate(360deg)

@keyframes bounce
  0%, 100%
    transform: translateY(0)
  50%
    transform: translateY(-12px)
</style>