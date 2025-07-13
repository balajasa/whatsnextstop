<template>
  <div class="camera-page">
    <!-- 關閉按鈕 -->
    <button class="close-button" @click="handleClose">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    </button>

    <!-- 切換鏡頭按鈕 -->
    <button class="switch-camera-button" @click="handleSwitchCamera" :disabled="!isCameraReady || isLoading">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M16 7h2.5l-3-3h-5L8 7h2.5L9 9H7c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V11c0-1.1-.9-2-2-2h-2l-1-2zm-3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
      </svg>
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

      <!-- 拍照指引 -->
      <div v-if="isCameraReady && !isCapturing" class="camera-guide">
        <div class="guide-frame"></div>
        <p class="guide-text">將相機對準想要拍攝的場景</p>
      </div>

      <!-- 拍照按鈕 -->
      <button v-if="isCameraReady" class="capture-button" @click="handleCapture" :disabled="isCapturing || isLoading">
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

// ===================================
// Composables
// ===================================

const {
  isInitializing,
  isCameraReady,
  isCameraActive,
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
 * 處理拍照
 */
const handleCapture = async () => {
  if (isCapturing.value || !isCameraReady.value) return

  isCapturing.value = true
  clearError()

  try {
    const photoData = await capturePhoto()

    if (photoData) {
      // 短暫延遲讓使用者看到拍照效果
      await new Promise(resolve => setTimeout(resolve, 800))
      emit('photoCaptured')
    }
  } catch (error) {
    console.error('Capture failed:', error)
    showError('拍照失敗，請重試')
  } finally {
    isCapturing.value = false
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
  position: relative
  width: 100%
  height: 100vh
  background: black
  overflow: hidden

// ===================================
// 控制按鈕
// ===================================

.close-button,
.switch-camera-button
  position: absolute
  width: 44px
  height: 44px
  background: rgba(0, 0, 0, 0.6)
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

  &:hover:not(:disabled)
    background: rgba(0, 0, 0, 0.8)
    transform: scale(1.1)

  &:disabled
    opacity: 0.5
    cursor: not-allowed

.close-button
  top: 20px
  left: 20px

.switch-camera-button
  top: 20px
  right: 20px

// ===================================
// 相機容器
// ===================================

.camera-container
  position: relative
  width: 100%
  height: 100%
  @include flex-center

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
  flex-direction: column
  color: white
  z-index: 5

.loading-spinner
  width: 40px
  height: 40px
  border: 3px solid rgba(white, 0.2)
  border-top: 3px solid white
  border-radius: 50%
  animation: spin 1s linear infinite
  margin-bottom: $spacing-md

.error-icon
  font-size: 48px
  margin-bottom: $spacing-md

.camera-loading p,
.camera-error p
  font-size: 16px
  text-align: center
  margin: 0

// ===================================
// 拍照指引
// ===================================

.camera-guide
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  pointer-events: none
  z-index: 3

.guide-frame
  width: 200px
  height: 200px
  border: 2px solid rgba(white, 0.6)
  border-radius: $border-radius-lg
  margin-bottom: $spacing-md

  @include tablet
    width: 250px
    height: 250px

.guide-text
  color: white
  text-align: center
  font-size: 14px
  background: rgba(0, 0, 0, 0.6)
  padding: $spacing-sm $spacing-md
  border-radius: $border-radius-md
  backdrop-filter: blur(4px)
  margin: 0

// ===================================
// 拍照按鈕
// ===================================

.capture-button
  position: absolute
  bottom: 40px
  left: 50%
  transform: translateX(-50%)
  width: 80px
  height: 80px
  background: rgba(white, 0.9)
  border: 4px solid rgba(white, 0.7)
  border-radius: 50%
  cursor: pointer
  transition: all 0.2s ease
  z-index: 10

  @include tablet
    width: 90px
    height: 90px
    bottom: 50px

  &:hover:not(:disabled)
    transform: translateX(-50%) scale(1.05)
    background: white

  &:active:not(:disabled)
    transform: translateX(-50%) scale(0.95)

  &:disabled
    opacity: 0.6
    cursor: not-allowed

.capture-inner
  width: 100%
  height: 100%
  background: white
  border-radius: 50%
  transition: all 0.3s ease

  &.capturing
    background: $caramel-orange
    animation: pulse 0.8s ease-in-out

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

@keyframes pulse
  0%, 100%
    transform: scale(1)
  50%
    transform: scale(0.8)

// ===================================
// 響應式調整
// ===================================

@include mobile-only
  .close-button,
  .switch-camera-button
    width: 40px
    height: 40px
    top: 15px

    svg
      width: 20px
      height: 20px

  .close-button
    left: 15px

  .switch-camera-button
    right: 15px

  .capture-button
    width: 70px
    height: 70px
    bottom: 30px

  .guide-frame
    width: 180px
    height: 180px

  .guide-text
    font-size: 13px
</style>