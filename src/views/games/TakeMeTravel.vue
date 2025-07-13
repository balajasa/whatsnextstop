<template>
  <div class="take-me-travel">
    <!-- 麵包屑 -->
    <BreadcrumbNav />
    <!-- 錯誤提示 -->
    <div v-if="error" class="error-toast" @click="clearError">
      {{ error }}
    </div>

    <!-- 載入提示 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>{{ getLoadingMessage() }}</p>
    </div>

    <!-- ========== 主頁面區域 ========== -->
    <div v-if="currentPage === 'main'" class="main-section">
      <div class="main-content">
        <!-- 標題區域 -->
        <div class="title-section">
          <h1 class="main-title">隨機貓咪拍照</h1>
          <p class="subtitle">拍張照片，讓可愛的貓咪加入你的世界</p>
        </div>

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

        <!-- 功能介紹 -->
        <div class="features-section">
          <div class="feature-item">
            <div class="feature-icon">📸</div>
            <h3>拍攝照片</h3>
            <p>使用相機拍攝你喜歡的場景</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🐱</div>
            <h3>隨機貓咪</h3>
            <p>系統會隨機添加可愛的貓咪</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✨</div>
            <h3>即時分享</h3>
            <p>完成後立即分享給朋友</p>
          </div>
        </div>

        <!-- 開發模式：位置測試 -->
        <div v-if="isDevelopmentMode" style="margin-top: 20px; padding: 20px; border: 2px dashed #ccc;">
          <h3>🧪 開發模式 - 貓咪位置測試</h3>

          <div style="display: flex; gap: 30px; justify-content: center; align-items: flex-start; margin: 20px 0">
            <!-- 直式照片 -->
            <div style="text-align: center;">
              <h4>直式照片 (Portrait)</h4>
              <div
                style="position: relative; width: 200px; height: 350px; border: 1px solid #999; background: #f5f5f5; overflow: hidden;">
                <img v-for="cat in testCats" :key="cat.id + '-portrait'" :src="cat.image"
                  :style="getCatImageStyle('portrait', cat)" style="position: absolute; object-fit: contain;" />
              </div>
              <p style="font-size: 12px; margin: 5px 0;">{{ getCurrentCatPortraitInfo() }}</p>
            </div>

            <!-- 橫式照片 -->
            <div style="text-align: center;">
              <h4>橫式照片 (Landscape)</h4>
              <div
                style="position: relative; width: 300px; height: 200px; border: 1px solid #999; background: #f5f5f5; overflow: hidden;">
                <img v-for="cat in testCats" :key="cat.id + '-landscape'" :src="cat.image"
                  :style="getCatImageStyle('landscape', cat)" style="position: absolute; object-fit: contain;" />
              </div>
              <p style="font-size: 12px; margin: 5px 0;">{{ getCurrentCatLandscapeInfo() }}</p>
            </div>
          </div>

          <!-- 貓咪切換控制 -->
          <div style="text-align: center; margin: 20px 0;">
            <p style="margin-bottom: 10px;">當前顯示: <strong>{{ currentTestCat.name }}</strong></p>
            <button v-for="cat in testCats" :key="cat.id" @click="setCurrentTestCat(cat)" :style="{
              background: currentTestCat.id === cat.id ? '#91B500' : '#e0e0e0',
              color: currentTestCat.id === cat.id ? 'white' : 'black',
              border: 'none',
              padding: '6px 12px',
              margin: '0 5px',
              borderRadius: '4px',
              cursor: 'pointer'
            }">
              {{ cat.name }}
            </button>
          </div>

          <button @click="toggleDevelopmentMode"
            style="background: #91B500; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
            隱藏開發模式
          </button>
        </div>

        <!-- 開發模式切換按鈕 -->
        <div v-else style="margin-top: 20px; text-align: center;">
          <button @click="toggleDevelopmentMode"
            style="background: #91B500; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
            🧪 顯示開發模式 (測試貓咪位置)
          </button>
        </div>
      </div>

      <!-- 底部說明 -->
      <div class="bottom-info">
        <p class="info-text">
          <span class="info-icon">💡</span>
          建議使用後鏡頭拍攝效果更佳
        </p>
      </div>
    </div>

    <!-- ========== 其他頁面組件 ========== -->
    <CameraPage v-if="currentPage === 'camera'" @photo-captured="handlePhotoCaptured" @close="returnToMain" />

    <ResultPage v-if="currentPage === 'result'" @retake="handleRetake" @change-cat="handleChangeCat"
      @complete="handleComplete" @close="returnToMain" />

    <FinalResultPage v-if="currentPage === 'final'" @share="handleShare" @close="returnToMain" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useCatPhoto } from '../../composables/cat-photo/useCatPhoto'
import CameraPage from '@/components/cat-photo/CameraPage.vue'
import ResultPage from '@/components/cat-photo/ResultPage.vue'
import FinalResultPage from '@/components/cat-photo/FinalResultPage.vue'
import { DEFAULT_CAT_CONFIGS } from '../../constants/catPhotoConfig'
import { calculateCatSizeAndPosition } from '../../utils/photoUtils'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

// ===================================
// Composables
// ===================================

const {
  // 響應式狀態
  currentPage,
  isLoading,
  error,
  // 方法
  startPhotoProcess,
  returnToMain,
  selectRandomCat,
  changeCat,
  completePhoto,
  clearError,
  initializeApp,
  resetApp,
  navigateToPage
} = useCatPhoto()

// ===================================
// 開發模式
// ===================================

const isDevelopmentMode = ref(false)
const currentTestCat = ref(DEFAULT_CAT_CONFIGS[0])

// 測試用的貓咪清單
const testCats = computed(() => DEFAULT_CAT_CONFIGS)

const toggleDevelopmentMode = () => {
  isDevelopmentMode.value = !isDevelopmentMode.value
}

const setCurrentTestCat = (cat: any) => {
  currentTestCat.value = cat
}

// 獲取貓咪圖片樣式（使用新的位置配置）
const getCatImageStyle = (orientation: 'portrait' | 'landscape', cat: any) => {
  // 只顯示當前選中的貓咪
  if (cat.id !== currentTestCat.value.id) {
    return { display: 'none' }
  }

  // 使用貓咪自己的位置配置
  if (!cat.positions || !cat.positions[orientation]) {
    console.warn(`Cat ${cat.id} missing position config for ${orientation}`)
    return { display: 'none' }
  }

  const position = cat.positions[orientation]
  const containerWidth = orientation === 'portrait' ? 200 : 300
  const containerHeight = orientation === 'portrait' ? 350 : 200

  // 計算實際像素位置和尺寸
  const calculated = calculateCatSizeAndPosition(
    cat,
    position,
    containerWidth,
    containerHeight
  )

  return {
    left: `${calculated.actualX}px`,
    top: `${calculated.actualY}px`,
    width: `${calculated.width}px`,
    height: `${calculated.height}px`,
    display: 'block'
  }
}

// 獲取當前貓咪的位置資訊
const getCurrentCatPortraitInfo = () => {
  const cat = currentTestCat.value
  if (!cat.positions?.portrait) return '無位置配置'
  const pos = cat.positions.portrait
  return `位置: (${(pos.x * 100).toFixed(0)}%, ${(pos.y * 100).toFixed(0)}%) | 最大: ${pos.maxWidth}×${pos.maxHeight}`
}

const getCurrentCatLandscapeInfo = () => {
  const cat = currentTestCat.value
  if (!cat.positions?.landscape) return '無位置配置'
  const pos = cat.positions.landscape
  return `位置: (${(pos.x * 100).toFixed(0)}%, ${(pos.y * 100).toFixed(0)}%) | 最大: ${pos.maxWidth}×${pos.maxHeight}`
}

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
 * 處理更換貓咪
 */
const handleChangeCat = () => {
  try {
    changeCat()
  } catch (error) {
    console.error('Change cat failed:', error)
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
  console.log('Share initiated')
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
  width: 100%
  height: 100vh
  overflow: hidden
  background: $warm-white
  font-family: 'Microsoft JhengHei', sans-serif

// ===================================
// 錯誤提示
// ===================================

.error-toast
  position: fixed
  top: 20px
  left: 50%
  transform: translateX(-50%)
  background: rgba($caramel-orange, 0.95)
  color: white
  padding: 12px 24px
  border-radius: $border-radius-lg
  font-size: 14px
  font-weight: 500
  z-index: $z-modal
  cursor: pointer
  box-shadow: 0 4px 12px rgba($caramel-orange, 0.3)
  animation: slideInFromTop 0.3s ease-out
  max-width: 90%
  text-align: center

  @include tablet
    max-width: 400px
    font-size: 16px

  &:hover
    background: rgba($caramel-orange, 1)
    transform: translateX(-50%) scale(1.02)

// ===================================
// 載入覆蓋層
// ===================================

.loading-overlay
  position: fixed
  top: 0
  left: 0
  width: 100%
  height: 100%
  background: rgba($warm-white, 0.95)
  @include flex-center
  flex-direction: column
  z-index: $z-modal
  backdrop-filter: blur(4px)

  p
    margin-top: 16px
    color: $text-dark
    font-size: 16px
    font-weight: 500

.loading-spinner
  width: 40px
  height: 40px
  border: 3px solid rgba($matcha-bright, 0.2)
  border-top: 3px solid $matcha-bright
  border-radius: 50%
  animation: spin 1s linear infinite

// ===================================
// 主頁面區域
// ===================================

.main-section
  @include flex-center
  flex-direction: column
  min-height: 100vh
  padding: $spacing-lg $spacing-md
  background: linear-gradient(135deg, $matcha-soft 0%, $almond-soft 100%)

.main-content
  flex: 1
  @include flex-center
  flex-direction: column
  max-width: 400px
  width: 100%

// ===================================
// 標題區域
// ===================================

.title-section
  text-align: center
  margin-bottom: $spacing-2xl

.main-title
  font-size: 28px
  font-weight: 700
  color: $text-dark
  margin-bottom: $spacing-sm
  letter-spacing: 0.5px

  @include tablet
    font-size: 32px

.subtitle
  font-size: 16px
  color: $warm-text-light
  line-height: 1.5
  margin: 0

  @include tablet
    font-size: 18px

// ===================================
// 相機按鈕
// ===================================

.camera-section
  margin-bottom: $spacing-2xl

.camera-button
  @include flex-center
  flex-direction: column
  width: 160px
  height: 160px
  background: $matcha-bright
  border: none
  border-radius: 50%
  color: white
  cursor: pointer
  transition: all 0.3s ease
  box-shadow: 0 8px 25px rgba($matcha-bright, 0.3)

  @include tablet
    width: 180px
    height: 180px

  &:hover:not(:disabled)
    transform: scale(1.05)
    box-shadow: 0 12px 35px rgba($matcha-bright, 0.4)

  &:active:not(:disabled)
    transform: scale(0.98)

  &:disabled
    opacity: 0.7
    cursor: not-allowed

.camera-icon
  width: 60px
  height: 60px
  margin-bottom: $spacing-sm

  @include tablet
    width: 70px
    height: 70px

  svg
    width: 100%
    height: 100%

.button-text
  font-size: 14px
  font-weight: 600
  text-align: center

  @include tablet
    font-size: 16px

// ===================================
// 功能介紹
// ===================================

.features-section
  display: grid
  grid-template-columns: 1fr
  gap: $spacing-lg
  margin-bottom: $spacing-2xl
  width: 100%

  @include tablet
    grid-template-columns: repeat(3, 1fr)
    gap: $spacing-xl

.feature-item
  text-align: center
  padding: $spacing-lg
  background: rgba(white, 0.7)
  border-radius: $border-radius-lg
  backdrop-filter: blur(10px)

.feature-icon
  font-size: 32px
  margin-bottom: $spacing-sm

.feature-item h3
  font-size: 16px
  font-weight: 600
  color: $text-dark
  margin-bottom: $spacing-xs

.feature-item p
  font-size: 14px
  color: $warm-text-light
  line-height: 1.4
  margin: 0

// ===================================
// 底部資訊
// ===================================

.bottom-info
  margin-top: auto
  padding-top: $spacing-lg

.info-text
  @include flex-center
  font-size: 14px
  color: $warm-text-light
  margin: 0

.info-icon
  margin-right: $spacing-xs
  font-size: 16px

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

// ===================================
// 響應式調整
// ===================================

@include mobile-only
  .main-section
    padding: $spacing-md $spacing-sm

  .main-title
    font-size: 24px

  .feature-item
    padding: $spacing-md

@include desktop
  .main-content
    max-width: 500px
</style>