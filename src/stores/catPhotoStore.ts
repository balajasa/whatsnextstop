// src/stores/catPhotoStore.ts
// 貓咪拍照功能 Pinia Store

import { defineStore } from 'pinia'
import type { CatPhotoState, PageState, CatConfig, PhotoOrientation } from '../types/games/cat-photo'
import {
  DEFAULT_CAT_CONFIGS,
  ERROR_MESSAGES,
  ANIMATION_DURATIONS,
  getCatConfigsWithRandomPositions
} from '../constants/catPhotoConfig'
import { detectPhotoOrientation, getRandomCat } from '../utils/photoUtils'

export const useCatPhotoStore = defineStore('catPhoto', {
  // ===================================
  // State
  // ===================================
  state: (): CatPhotoState => ({
    currentPage: 'main',
    photoData: null,
    selectedCat: null,
    photoOrientation: null,
    cameraStream: null,
    isLoading: false,
    error: null
  }),

  // ===================================
  // Getters
  // ===================================
  getters: {
    // 是否在相機頁面
    isOnCameraPage: (state): boolean => state.currentPage === 'camera',

    // 是否有照片資料
    hasPhoto: (state): boolean => !!state.photoData,

    // 是否有選中的貓咪
    hasCat: (state): boolean => !!state.selectedCat,

    // 是否可以進行下一步
    canProceedToResult: (state): boolean =>
      !!state.photoData && !!state.selectedCat && !!state.photoOrientation,

    // 是否相機正在運行
    isCameraActive: (state): boolean => !!state.cameraStream,

    // 取得可用的貓咪清單
    availableCats: (): CatConfig[] => DEFAULT_CAT_CONFIGS,

    // 取得當前錯誤訊息
    currentError: (state): string | null => state.error
  },

  // ===================================
  // Actions
  // ===================================
  actions: {
    // -----------------------------------
    // 頁面導航
    // -----------------------------------

    /**
     * 切換到指定頁面
     */
    async navigateToPage(page: PageState) {
      this.setLoading(true)

      try {
        // 如果離開相機頁面，關閉相機
        if (this.currentPage === 'camera' && page !== 'camera') {
          await this.stopCamera()
        }

        this.currentPage = page
        this.clearError()

        // 模擬頁面切換動畫時間
        await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATIONS.pageTransition))
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * 返回主頁面並重置狀態
     */
    async returnToMain() {
      await this.stopCamera()
      this.resetState()
      this.currentPage = 'main'
    },

    // -----------------------------------
    // 相機操作
    // -----------------------------------

    /**
     * 啟動相機
     */
    async startCamera(): Promise<MediaStream> {
      this.setLoading(true)
      this.clearError()

      try {
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        this.cameraStream = stream

        // 模擬相機初始化時間
        await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATIONS.cameraInit))

        return stream
      } catch (error) {
        console.error('Camera start failed:', error)

        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            this.setError(ERROR_MESSAGES.CAMERA_ACCESS_DENIED)
          } else if (error.name === 'NotFoundError') {
            this.setError(ERROR_MESSAGES.CAMERA_NOT_FOUND)
          } else {
            this.setError(`相機啟動失敗: ${error.message}`)
          }
        }

        throw error
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * 停止相機
     */
    async stopCamera() {
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(track => track.stop())
        this.cameraStream = null
      }
    },

    // -----------------------------------
    // 照片處理
    // -----------------------------------

    /**
     * 拍攝照片
     */
    async capturePhoto(canvas: HTMLCanvasElement): Promise<string> {
      this.setLoading(true)
      this.clearError()

      try {
        // 檢測照片方向
        const orientation = detectPhotoOrientation(canvas)
        this.photoOrientation = orientation

        // 轉換為 base64
        const photoData = canvas.toDataURL('image/jpeg', 0.9)
        this.photoData = photoData

        // 停止相機
        await this.stopCamera()

        // 模擬照片處理時間
        await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATIONS.photoCapture))

        return photoData
      } catch (error) {
        console.error('Photo capture failed:', error)
        this.setError(ERROR_MESSAGES.PHOTO_CAPTURE_FAILED)
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * 重新拍照
     */
    async retakePhoto() {
      this.photoData = null
      this.selectedCat = null
      this.photoOrientation = null
      this.clearError()

      await this.navigateToPage('camera')
    },

    // -----------------------------------
    // 貓咪選擇
    // -----------------------------------

    /**
     * 隨機選擇貓咪
     */
    selectRandomCat(): CatConfig {
      const randomizedCats = getCatConfigsWithRandomPositions()
      const randomCat = getRandomCat(randomizedCats)
      this.selectedCat = randomCat
      return randomCat
    },

    /**
     * 更換貓咪
     */
    changeCat(): CatConfig {
      const randomizedCats = getCatConfigsWithRandomPositions()
      const availableCats = randomizedCats.filter(cat => cat.id !== this.selectedCat?.id)

      if (availableCats.length === 0) {
        return this.selectRandomCat()
      }

      const randomCat = getRandomCat(availableCats)
      this.selectedCat = randomCat
      return randomCat
    },

    /**
     * 選擇特定貓咪
     */
    selectCat(catId: string): CatConfig | null {
      const randomizedCats = getCatConfigsWithRandomPositions()
      const cat = randomizedCats.find(c => c.id === catId)
      if (cat) {
        this.selectedCat = cat
        return cat
      }
      return null
    },

    // -----------------------------------
    // 狀態管理
    // -----------------------------------

    /**
     * 設置載入狀態
     */
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    /**
     * 設置錯誤訊息
     */
    setError(error: string) {
      this.error = error
    },

    /**
     * 清除錯誤訊息
     */
    clearError() {
      this.error = null
    },

    /**
     * 重置所有狀態
     */
    resetState() {
      this.photoData = null
      this.selectedCat = null
      this.photoOrientation = null
      this.cameraStream = null
      this.isLoading = false
      this.error = null
    },

    /**
     * 設置照片資料（用於測試或外部設置）
     */
    setPhotoData(photoData: string, orientation?: PhotoOrientation) {
      this.photoData = photoData
      if (orientation) {
        this.photoOrientation = orientation
      }
    },

    // -----------------------------------
    // 工具方法
    // -----------------------------------

    /**
     * 檢查是否支援相機
     */
    checkCameraSupport(): boolean {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    },

    /**
     * 檢查是否支援 Canvas
     */
    checkCanvasSupport(): boolean {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext && canvas.getContext('2d'))
    },

    /**
     * 預載貓咪圖片
     */
    async preloadCatImages(): Promise<void> {
      this.setLoading(true)

      try {
        const imagePromises = DEFAULT_CAT_CONFIGS.map(cat => {
          return new Promise<void>((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve()
            img.onerror = () => reject(new Error(`Failed to load: ${cat.image}`))
            img.src = cat.image
          })
        })

        await Promise.all(imagePromises)
      } catch (error) {
        console.error('Failed to preload cat images:', error)
        this.setError(ERROR_MESSAGES.CAT_LOADING_FAILED)
      } finally {
        this.setLoading(false)
      }
    }
  }
})
