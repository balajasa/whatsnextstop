// src/composables/cat-photo/useCatPhoto.ts
// 貓咪拍照主要邏輯 Composable

import { computed, onMounted, onUnmounted } from 'vue'
import { useCatPhotoStore } from '../../stores/catPhotoStore'
import type { PageState } from '../../types/cat-photo'

export function useCatPhoto() {
  const store = useCatPhotoStore()

  // ===================================
  // 響應式狀態
  // ===================================

  const currentPage = computed(() => store.currentPage)
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)
  const hasPhoto = computed(() => store.hasPhoto)
  const hasCat = computed(() => store.hasCat)
  const photoOrientation = computed(() => store.photoOrientation)
  const canProceedToResult = computed(() => store.canProceedToResult)
  const availableCats = computed(() => store.availableCats) // 加上這個

  // ===================================
  // 頁面導航方法
  // ===================================

  /**
   * 切換到指定頁面
   */
  const navigateToPage = async (page: PageState) => {
    try {
      await store.navigateToPage(page)
    } catch (error) {
      console.error('Navigation failed:', error)
    }
  }

  /**
   * 返回主頁面
   */
  const returnToMain = async () => {
    try {
      await store.returnToMain()
    } catch (error) {
      console.error('Return to main failed:', error)
    }
  }

  /**
   * 開始拍照流程
   */
  const startPhotoProcess = async () => {
    await navigateToPage('camera')
  }

  /**
   * 完成照片編輯
   */
  const completePhoto = async () => {
    if (!canProceedToResult.value) {
      store.setError('照片或貓咪資料不完整')
      return
    }
    await navigateToPage('final')
  }

  // ===================================
  // 貓咪相關方法
  // ===================================

  /**
   * 隨機選擇貓咪
   */
  const selectRandomCat = () => {
    try {
      return store.selectRandomCat()
    } catch (error) {
      console.error('Select random cat failed:', error)
      store.setError('選擇貓咪失敗')
      return null
    }
  }

  /**
   * 更換貓咪
   */
  const changeCat = () => {
    try {
      return store.changeCat()
    } catch (error) {
      console.error('Change cat failed:', error)
      store.setError('更換貓咪失敗')
      return null
    }
  }

  /**
   * 自動添加隨機貓咪（拍照後調用）
   */
  const addRandomCatToPhoto = () => {
    if (!hasPhoto.value) {
      store.setError('沒有照片可以添加貓咪')
      return null
    }
    return selectRandomCat()
  }

  // ===================================
  // 錯誤處理
  // ===================================

  /**
   * 清除錯誤
   */
  const clearError = () => {
    store.clearError()
  }

  /**
   * 顯示錯誤訊息
   */
  const showError = (message: string) => {
    store.setError(message)
  }

  // ===================================
  // 初始化和清理
  // ===================================

  /**
   * 初始化應用
   */
  const initializeApp = async () => {
    try {
      // 檢查瀏覽器支援
      if (!store.checkCameraSupport()) {
        showError('您的瀏覽器不支援相機功能')
        return false
      }

      if (!store.checkCanvasSupport()) {
        showError('您的瀏覽器不支援 Canvas 功能')
        return false
      }

      // 預載貓咪圖片
      await store.preloadCatImages()

      return true
    } catch (error) {
      console.error('App initialization failed:', error)
      showError('應用初始化失敗')
      return false
    }
  }

  /**
   * 重置應用狀態
   */
  const resetApp = () => {
    store.resetState()
  }

  // ===================================
  // 生命週期處理
  // ===================================

  onMounted(async () => {
    // 組件掛載時初始化
    await initializeApp()
  })

  onUnmounted(async () => {
    // 組件卸載時清理資源
    await store.stopCamera()
  })

  // ===================================
  // 工具方法
  // ===================================

  /**
   * 格式化貓咪名稱顯示
   */
  const formatCatName = (catName?: string) => {
    return catName ? `遇到了${catName}！` : '等待貓咪出現...'
  }

  /**
   * 獲取頁面標題
   */
  const getPageTitle = () => {
    switch (currentPage.value) {
      case 'main':
        return '隨機貓咪拍照'
      case 'camera':
        return '拍攝照片'
      case 'result':
        return '預覽結果'
      case 'final':
        return '完成作品'
      default:
        return '貓咪拍照'
    }
  }

  /**
   * 獲取當前步驟描述
   */
  const getCurrentStepDescription = () => {
    switch (currentPage.value) {
      case 'main':
        return '點擊開始你的貓咪冒險'
      case 'camera':
        return '拍攝一張照片，讓貓咪加入'
      case 'result':
        return '調整你的貓咪照片'
      case 'final':
        return '分享你的作品給朋友'
      default:
        return ''
    }
  }

  // ===================================
  // 返回 API
  // ===================================

  return {
    // 響應式狀態
    currentPage,
    isLoading,
    error,
    hasPhoto,
    hasCat,
    photoOrientation,
    canProceedToResult,
    availableCats, // 加上這個

    // 頁面導航
    navigateToPage,
    returnToMain,
    startPhotoProcess,
    completePhoto,

    // 貓咪相關
    selectRandomCat,
    changeCat,
    addRandomCatToPhoto,

    // 錯誤處理
    clearError,
    showError,

    // 初始化
    initializeApp,
    resetApp,

    // 工具方法
    formatCatName,
    getPageTitle,
    getCurrentStepDescription
  }
}
