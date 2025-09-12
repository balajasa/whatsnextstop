<template>
  <div class="take-me-travel">
    <BreadcrumbNav />

    <div v-if="error && currentPage !== 'camera'" class="error-toast" @click="clearError">
      {{ error }}
    </div>

    <div v-if="isLoading && currentPage !== 'camera'" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>{{ getLoadingMessage() }}</p>
    </div>

    <!-- 主頁面區域 -->
    <div v-if="currentPage === 'main'" class="main-section">
      <div class="main-content">
        <!-- 相機圖示按鈕 -->
        <div class="camera-section">
          <button class="camera-button" @click="handleStartPhoto" :disabled="isLoading">
            <div class="camera-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 15.2c1.9 0 3.5-1.6 3.5-3.5s-1.6-3.5-3.5-3.5-3.5 1.6-3.5 3.5 1.6 3.5 3.5 3.5zm4.3-6.8c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5-1.5.7-1.5 1.5.7 1.5 1.5 1.5zM12 9c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z" />
              </svg>
            </div>
            <span class="button-text">點擊開始拍照</span>
          </button>
        </div>

        <!-- 底部資訊 -->
        <div class="bottom-info">
          <span class="info-icon">💡</span>
          <div class="info-text">
            <div>建議使用直式拍攝&後鏡頭效果更佳</div>
            <div>除非把螢幕鎖定打開，讓手機真的倒下來</div>
            <div>我也不知道為什麼</div>
          </div>
        </div>
      </div>


    </div>

    <!-- 其他頁面元件 -->
    <ResultPage v-if="currentPage === 'result'" @retake="handleRetake" @complete="handleComplete"
      @close="returnToMain" />

    <FinalResultPage v-if="currentPage === 'final'" @share="handleShare" @close="returnToMain" />
  </div>

  <!-- 使用 Teleport 將相機頁面傳送到 body -->
  <Teleport to="body" v-if="currentPage === 'camera'">
    <CameraPage @photo-captured="handlePhotoCaptured" @close="returnToMain" />

    <!-- 相機頁面的錯誤提示 -->
    <div v-if="error" class="camera-error-toast" @click="clearError">
      {{ error }}
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, Teleport } from 'vue'
import { useCatPhoto } from '../../composables/cat-photo/useCatPhoto'
import CameraPage from '@/components/cat-photo/CameraPage.vue'
import ResultPage from '@/components/cat-photo/ResultPage.vue'
import FinalResultPage from '@/components/cat-photo/FinalResultPage.vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

// ===================================
// Composables
// ===================================

const {
  currentPage,
  isLoading,
  error,
  startPhotoProcess,
  returnToMain,
  selectRandomCat,
  completePhoto,
  clearError,
  initializeApp,
  resetApp,
  navigateToPage
} = useCatPhoto()

// ===================================
// 主頁面事件處理
// ===================================

/**
 * 處理開始拍照
 */
const handleStartPhoto = async () => {
  try {
    await startPhotoProcess()
  } catch (error) {
    console.error('Start photo failed:', error)
  }
}

// ===================================
// 其他頁面事件處理
// ===================================

/**
 * 處理照片拍攝完成
 */
const handlePhotoCaptured = async () => {
  try {
    // 自動添加隨機貓咪
    const cat = selectRandomCat()
    if (cat) {
      // 短暫延遲讓用戶看到貓咪
      await new Promise(resolve => setTimeout(resolve, 500))
      await navigateToPage('result')
    }
  } catch (error) {
    console.error('Handle photo captured failed:', error)
  }
}

/**
 * 處理重新拍照
 */
const handleRetake = async () => {
  try {
    await startPhotoProcess()
  } catch (error) {
    console.error('Retake photo failed:', error)
  }
}

/**
 * 處理完成照片
 */
const handleComplete = async () => {
  try {
    await completePhoto()
  } catch (error) {
    console.error('Complete photo failed:', error)
  }
}

/**
 * 處理分享
 */
const handleShare = () => {
  // console.log('Share initiated')
}

// ===================================
// 工具方法
// ===================================

/**
 * 獲取載入訊息
 */
const getLoadingMessage = (): string => {
  switch (currentPage.value) {
    case 'main':
      return '初始化中...'
    case 'camera':
      return '啟動相機中...'
    case 'result':
      return '處理照片中...'
    case 'final':
      return '準備分享中...'
    default:
      return '載入中...'
  }
}

// ===================================
// 生命週期
// ===================================

onMounted(async () => {
  try {
    await initializeApp()
  } catch (error) {
    console.error('App initialization failed:', error)
  }
})

onUnmounted(() => {
  resetApp()
})

// ===================================
// 鍵盤事件處理
// ===================================

const handleKeydown = (event: KeyboardEvent) => {
  // ESC 鍵返回主頁面
  if (event.key === 'Escape') {
    returnToMain()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="sass" scoped>
@use '@/styles/mixins' as *
@use '@/styles/variables' as *

.take-me-travel
  position: relative
  overflow: hidden
  width: 100%
  // 移除 min-height，讓內容決定高度

// ===================================
// 錯誤提示
// ===================================

.error-toast
  position: fixed
  top: 20px
  left: 50%
  z-index: $z-modal
  padding: 10px 20px
  max-width: 90%
  border-radius: $border-radius-lg
  background: rgba(211, 47, 47, 0.95)
  box-shadow: $camera-shadow-strong
  color: $camera-text-white
  text-align: center
  font-weight: 500
  font-size: 13px
  cursor: pointer
  transform: translateX(-50%)
  animation: slideInFromTop 0.3s ease-out

  &:hover
    background: rgba(211, 47, 47, 1)
    transform: translateX(-50%) scale(1.02)

  @include tablet
    padding: 12px 24px
    max-width: 400px
    font-size: 14px

  @include desktop
    font-size: 16px

// 相機頁面的錯誤提示
.camera-error-toast
  position: fixed
  top: calc(80px + env(safe-area-inset-top, 0px))
  left: 50%
  z-index: calc($z-camera + 1)
  padding: 10px 20px
  max-width: 90%
  border-radius: $border-radius-lg
  background: rgba(211, 47, 47, 0.95)
  box-shadow: $camera-shadow-strong
  color: $camera-text-white
  text-align: center
  font-weight: 500
  font-size: 13px
  cursor: pointer
  transform: translateX(-50%)
  animation: slideInFromTop 0.3s ease-out

  &:hover
    background: rgba(211, 47, 47, 1)
    transform: translateX(-50%) scale(1.02)

  @include tablet
    padding: 12px 24px
    max-width: 400px
    font-size: 14px

// ===================================
// 載入覆蓋層
// ===================================

.loading-overlay
  @include flex-center
  position: fixed
  top: 0
  left: 0
  z-index: $z-modal
  flex-direction: column
  width: 100%
  height: 100%
  background: rgba(255, 255, 251, 0.95)
  backdrop-filter: blur(4px)

  p
    margin-top: $spacing-md
    color: $camera-text-primary
    font-weight: 500
    font-size: 14px

    @include tablet
      font-size: 16px

.loading-spinner
  width: 36px
  height: 36px
  border: 3px solid rgba(236, 109, 81, 0.2)
  border-top: 3px solid $camera-accent
  border-radius: 50%
  animation: spin 1s linear infinite

  @include tablet
    width: 40px
    height: 40px

// ===================================
// 主頁面區域
// ===================================

.main-section
  @include flex-center
  // 計算實際可用高度：扣除 Header(50px) 和 BreadcrumbNav(約50px)
  min-height: calc(100vh - 260px)
  padding: $spacing-md $spacing-sm
  background: linear-gradient(135deg, $camera-bg-primary 0%, rgba(255, 255, 251, 0.8) 100%)

  @include tablet
    padding: $spacing-lg $spacing-md

  @include desktop
    padding: $spacing-xl $spacing-lg

.main-content
  @include flex-center
  flex-direction: column
  max-width: 320px
  width: 100%

  @include tablet
    max-width: 400px

  @include desktop
    max-width: 500px

// ===================================
// 相機按鈕
// ===================================

.camera-section
  margin-bottom: $spacing-xl

  @include tablet
    margin-bottom: $spacing-2xl

.camera-button
  @include flex-center
  flex-direction: column
  width: 140px
  height: 140px
  border: none
  border-radius: 50%
  background: $camera-accent
  box-shadow: $camera-shadow-accent
  color: $camera-text-white
  cursor: pointer
  transition: all 0.3s ease

  &:hover:not(:disabled)
    box-shadow: 0 12px 30px rgba(236, 109, 81, 0.4)
    transform: scale(1.05)

  &:active:not(:disabled)
    transform: scale(0.98)

  &:disabled
    opacity: 0.7
    cursor: not-allowed

  @include tablet
    width: 160px
    height: 160px

  @include desktop
    width: 180px
    height: 180px

.camera-icon
  margin-bottom: $spacing-sm
  width: 50px
  height: 50px
  background-image: url('@/assets/img/icon/camera.png')
  background-position: center
  background-size: contain
  background-repeat: no-repeat

  @include tablet
    width: 60px
    height: 60px

  @include desktop
    width: 70px
    height: 70px

.button-text
  text-align: center
  font-weight: 600
  font-size: 13px

  @include tablet
    font-size: 14px

  @include desktop
    font-size: 16px

// ===================================
// 功能介紹
// ===================================

.features-section
  display: flex
  width: 100%
  margin-bottom: $spacing-lg

.feature-item
  padding: $spacing-md
  border-radius: $border-radius-lg
  background: rgba(255, 255, 255, 0.7)
  text-align: center
  backdrop-filter: blur(10px)

  @include tablet
    padding: $spacing-lg

.feature-icon
  font-size: 36px
  margin-bottom: $spacing-sm

  @include tablet
    font-size: 48px

.feature-item h3
  margin-bottom: $spacing-xs
  color: $camera-text-primary
  font-weight: 600
  font-size: 15px

  @include tablet
    font-size: 16px

  @include desktop
    font-size: 18px

.feature-item p
  margin: 0
  color: $camera-text-light
  font-size: 13px
  line-height: 1.4

  @include tablet
    font-size: 14px

// ===================================
// 底部資訊
// ===================================

.bottom-info
  display: flex
  align-items: flex-start
  margin-top: auto
  padding: $spacing-lg $spacing-md
  border-radius: $border-radius-lg
  background: rgba(255, 255, 255, 0.8)
  backdrop-filter: blur(10px)
  gap: $spacing-md

.info-icon
  flex-shrink: 0
  display: flex
  align-items: center
  justify-content: center
  width: 32px
  height: 32px
  border-radius: 50%
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%)
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.3)
  font-size: 16px
  animation: pulse-glow 2s infinite

  @include tablet
    width: 36px
    height: 36px
    font-size: 18px

.info-text
  flex: 1
  display: flex
  flex-direction: column
  gap: $spacing-xs

  div
    color: $camera-text-secondary
    font-size: 13px
    line-height: 1.5

    @include tablet
      font-size: 14px


// 燈泡發光動畫
@keyframes pulse-glow
  0%, 100%
    box-shadow: 0 2px 8px rgba(255, 165, 0, 0.3)
    transform: scale(1)
  50%
    box-shadow: 0 4px 16px rgba(255, 165, 0, 0.5)
    transform: scale(1.05)

// ===================================
// 動畫定義
// ===================================

@keyframes slideInFromTop
  from
    opacity: 0
    transform: translateX(-50%) translateY(-20px)
  to
    opacity: 1
    transform: translateX(-50%) translateY(0)

@keyframes spin
  from
    transform: rotate(0deg)
  to
    transform: rotate(360deg)
</style>
