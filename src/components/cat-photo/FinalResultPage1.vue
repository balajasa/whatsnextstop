<template>
  <!-- 成功提示 -->
  <div v-if="showSuccessMessage" class="success-toast">
    {{ successMessage }}
  </div>
  <div class="final-result-page">
    <!-- 分享按鈕區域 -->
    <div class="share-section">
      <div class="share-buttons">
        <button class="share-button primary" @click="handleShare">
          <div v-if="!isSharing" class="icon share-icon"></div>
          <div v-else class="loading-spinner small"></div>
          <span>{{ isSharing ? '分享中...' : '分享照片' }}</span>
        </button>

        <button class="share-button secondary" @click="handleDownload">
          <div class="icon download-icon"></div>
          <span>下載照片</span>
        </button>
      </div>
    </div>
    <button @click="handleShare">
      <span>分享照片 =___=</span>
    </button>
    <button @click="handleDownload">
      <span>下測試按鈕~~~~~~ @@</span>
    </button>
    <div class="button">測試按鈕~~~~~~ v1.3</div>
    <div style="position: fixed; top: 100px; left: 10px; background: yellow; z-index: 9999;">
      isProcessing: {{ isProcessing }}<br>
      hasCanvas: {{ !!finalCanvas }}<br>
      按鈕應該顯示: {{ !isSharing && !isProcessing }}
    </div>
    <!-- 調試面板 - 只在開發環境顯示 -->
    <div v-if="isDev" class="debug-panel">
      <h4>Debug Info</h4>
      <div class="debug-item">isProcessing: {{ isProcessing }}</div>
      <div class="debug-item">hasCanvas: {{ !!finalCanvas }}</div>
      <div class="debug-item">photoData: {{ !!photoData }}</div>
      <div class="debug-item">selectedCat: {{ !!selectedCat }}</div>
      <div class="debug-item">Logs:</div>
      <div class="debug-logs">
        <div v-for="(log, index) in debugLogs" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
    </div>
    <!-- 返回按鈕 -->
    <button class="back-button" @click="handleClose">
      <div class="back-icon"></div>
    </button>
    <!-- 成功標題 -->
    <div class="success-header">
    </div>

    <!-- 最終照片顯示 -->
    <div class="final-photo-section">
      <div class="photo-frame">
        <div class="testPic"></div>
        <canvas ref="finalCanvas" class="final-canvas"></canvas>
        <!-- 載入覆蓋層 -->
        <div v-if="isProcessing" class="processing-overlay">
          <div class="loading-spinner"></div>
          <p>準備分享中...</p>
        </div>
      </div>
    </div>


  </div>

</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useCatPhoto } from '../../composables/cat-photo/useCatPhoto'
import { useCatOverlay } from '../../composables/cat-photo/useCatOverlay'
import { useCatPhotoStore } from '../../stores/catPhotoStore'  // 添加這行

// 調試相關
const isDev = import.meta.env.DEV
const debugLogs = ref<string[]>([])

// 添加 log 的方法
const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  debugLogs.value.push(`${timestamp}: ${message}`)
  if (debugLogs.value.length > 10) {
    debugLogs.value.shift() // 只保留最新的 10 條
  }
  console.log(message) // 同時輸出到 console
}
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

// 正確獲取 store 狀態
const store = useCatPhotoStore()  // 這行要加
const photoData = computed(() => store.photoData)
const selectedCat = computed(() => store.selectedCat)

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
  addLog('updateFinalDisplay 開始')

  if (!finalCanvas.value) {
    addLog('finalCanvas 為 null，直接返回')
    return
  }

  try {
    addLog('調用 updatePhotoDisplay')
    const success = await updatePhotoDisplay(finalCanvas.value)
    addLog(`updatePhotoDisplay 結果: ${success}`)

    if (!success) {
      addLog('updatePhotoDisplay 失敗')
      showError('載入照片失敗')
    }
  } catch (error) {
    addLog(`updatePhotoDisplay 錯誤: ${error}`)
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
  addLog('=== FinalResultPage onMounted START ===')
  addLog(`初始狀態 - isProcessing: ${isProcessing.value}`)
  addLog(`Store狀態 - hasPhoto: ${!!photoData.value}, hasCat: ${!!selectedCat.value}`)

  try {
    await nextTick()
    addLog('nextTick 完成')

    if (!finalCanvas.value) {
      addLog('ERROR: finalCanvas 為 null')
      return
    }

    addLog('開始 updateFinalDisplay')
    await updateFinalDisplay()
    addLog('updateFinalDisplay 完成')

  } catch (error) {
    addLog(`ERROR: ${error}`)
    console.error('Final result page initialization failed:', error)
    showError('頁面初始化失敗')
  }

  addLog(`最終狀態 - isProcessing: ${isProcessing.value}`)
  addLog('=== FinalResultPage onMounted END ===')
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *
.force-debug
  position: fixed
  top: 50px
  left: 0
  right: 0
  background: red !important
  color: white !important
  padding: 20px !important
  z-index: 99999 !important
  font-size: 16px !important
  text-align: center !important

.final-result-page
  display: flex
  overflow-y: auto
  flex-direction: column
  // 計算實際可用高度：扣除 Header(50px) 和 BreadcrumbNav(約50px)
  height: calc(100vh - 260px)
  background: linear-gradient(135deg, #FFFFFB 0%, rgba(255, 255, 251, 0.9) 100%)

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
  background: rgba(120, 124, 123, 0.8)
  color: #ffffff
  cursor: pointer
  transition: all 0.2s ease
  backdrop-filter: blur(4px)

  &:hover
    background: rgba(120, 124, 123, 0.9)
    transform: scale(1.1)

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
  flex: 1 1 0
  overflow-y: auto
  flex-direction: column
  padding: $spacing-lg $spacing-sm $spacing-md
  margin-top: 60px

  @include tablet
    padding: $spacing-xl $spacing-md $spacing-lg

.photo-frame
  position: relative
  overflow: hidden
  margin-bottom: $spacing-lg
  max-width: calc(100vw - 32px)
  width: 100%
  border-radius: $border-radius-xl
  background: #ffffff
  box-shadow: 0 8px 32px rgba(28, 28, 28, 0.12), 0 2px 8px rgba(28, 28, 28, 0.08)
  transition: all 0.3s ease

  // Hover 效果 - 適度增強
  &:hover
    transform: translateY(-3px)
    box-shadow: 0 12px 48px rgba(28, 28, 28, 0.16), 0 4px 12px rgba(28, 28, 28, 0.12)

  @include tablet
    max-width: 500px

  @include desktop
    max-width: 600px

.final-canvas
  display: block
  width: 100%
  height: auto

.testPic
  width: 100%
  height: 200px
  background: url('@/assets/img/minigame/stone/body_01.png')

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
  flex: 0 0 auto
  // flex-shrink: 0
  padding: $spacing-md $spacing-sm calc($spacing-lg + env(safe-area-inset-bottom, 16px))
  border-top: 1px solid rgba(155, 155, 130, 0.2)
  background: #ffffff
  background: red !important
  border: 3px solid blue !important
  min-height: 200px !important

  @include tablet
    padding: $spacing-lg $spacing-md calc($spacing-xl + env(safe-area-inset-bottom, 16px))

.share-buttons
  display: flex
  margin-top: 100px
  // margin: 0 auto
  max-width: 320px
  gap: $spacing-sm

  @include tablet
    max-width: 400px
    gap: $spacing-md

  @include desktop
    max-width: 500px
    flex-direction: row

.share-button
  @include flex-center
  // flex: 1
  padding: $spacing-md
  height: 52px
  border: 3px solid green
  border-radius: $border-radius-lg
  font-weight: 600
  font-size: 14px
  cursor: pointer
  transition: all 0.2s ease
  // gap: $spacing-xs

  // 分享和下載按鈕圖片
  .icon
    // flex-shrink: 0
    width: 18px
    height: 18px
    background-position: center
    background-size: contain
    background-repeat: no-repeat

  .loading-spinner.small
    width: 18px
    height: 18px
    border: 2px solid rgba(255, 255, 255, 0.3)
    border-top: 2px solid #ffffff
    border-radius: 50%
    animation: spin 1s linear infinite

  // 分享按鈕
  &.primary
    background: #EC6D51  // 洗朱色
    box-shadow: 0 6px 20px rgba(236, 109, 81, 0.3)
    color: #ffffff

  // 下載按鈕
  &.secondary
    border: 1px solid rgba(155, 155, 130, 0.3)
    background: #FFFFFB  // 純白背景
    box-shadow: 0 2px 6px rgba(28, 28, 28, 0.06)
    color: #1C1C1C      // 深色文字

  &:disabled
    opacity: 0.6
    cursor: not-allowed
    transform: none

  @include tablet
    padding: $spacing-lg
    min-height: 56px
    font-size: 16px

    .icon
      width: 20px
      height: 20px

    .loading-spinner.small
      width: 20px
      height: 20px

.share-icon
  background-image: url('@/assets/img/icon/share.png')

.download-icon
  background-image: url('@/assets/img/icon/download.png')

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