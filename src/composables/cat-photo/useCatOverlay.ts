// ===================================
// src/composables/cat-photo/useCatOverlay.ts
// 貓咪疊加功能 Composable
// ===================================

import { ref, computed } from 'vue'
import { useCatPhotoStore } from '../../stores/catPhotoStore'
import type { CatConfig, PhotoOrientation, CalculatedCatSize } from '../../types/cat-photo'
import { SHARE_CONFIG } from '../../constants/catPhotoConfig'
import { calculateCatSizeAndPosition, loadImage, canvasToBlob } from '../../utils/photoUtils'

export function useCatOverlay() {
  const store = useCatPhotoStore()

  // ===================================
  // 響應式狀態
  // ===================================

  const overlayCanvas = ref<HTMLCanvasElement | null>(null)
  const isProcessing = ref(false)
  const lastProcessedPhoto = ref<string | null>(null)

  // ===================================
  // 計算屬性
  // ===================================

  const photoData = computed(() => store.photoData)
  const selectedCat = computed(() => store.selectedCat)
  const photoOrientation = computed(() => store.photoOrientation)

  // ===================================
  // 核心疊加功能
  // ===================================

  /**
   * 在照片上疊加貓咪
   */
  const addCatToPhoto = async (
    photo: string,
    cat: CatConfig,
    orientation: PhotoOrientation,
    canvas?: HTMLCanvasElement
  ): Promise<HTMLCanvasElement> => {
    isProcessing.value = true

    try {
      // 使用提供的 canvas 或創建新的
      const targetCanvas = canvas || overlayCanvas.value || document.createElement('canvas')
      const ctx = targetCanvas.getContext('2d')

      if (!ctx) {
        throw new Error('無法取得 Canvas context')
      }

      // 載入照片
      const photoImg = await loadImage(photo)

      // 設置 canvas 尺寸
      targetCanvas.width = photoImg.width
      targetCanvas.height = photoImg.height

      // 繪製照片背景
      ctx.drawImage(photoImg, 0, 0)

      // 載入貓咪圖片
      const catImg = await loadImage(cat.image)

      // 獲取貓咪的位置配置
      const position = cat.positions[orientation]
      if (!position) {
        throw new Error(`貓咪 ${cat.id} 缺少 ${orientation} 方向的位置配置`)
      }

      // 計算貓咪尺寸和位置
      const calculated = calculateCatSizeAndPosition(
        cat,
        position,
        targetCanvas.width,
        targetCanvas.height
      )

      // 繪製貓咪
      ctx.drawImage(
        catImg,
        calculated.actualX,
        calculated.actualY,
        calculated.width,
        calculated.height
      )

      lastProcessedPhoto.value = targetCanvas.toDataURL('image/jpeg', SHARE_CONFIG.quality)

      return targetCanvas
    } catch (error) {
      console.error('Add cat to photo failed:', error)
      throw new Error(`疊加貓咪失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 使用當前 store 狀態疊加貓咪
   */
  const addCurrentCatToPhoto = async (
    canvas?: HTMLCanvasElement
  ): Promise<HTMLCanvasElement | null> => {
    if (!photoData.value || !selectedCat.value || !photoOrientation.value) {
      store.setError('照片、貓咪或方向資料不完整')
      return null
    }

    try {
      return await addCatToPhoto(photoData.value, selectedCat.value, photoOrientation.value, canvas)
    } catch (error) {
      console.error('Add current cat failed:', error)
      store.setError(error instanceof Error ? error.message : '添加貓咪失敗')
      return null
    }
  }

  /**
   * 更新顯示的合成照片
   */
  const updatePhotoDisplay = async (displayCanvas: HTMLCanvasElement): Promise<boolean> => {
    try {
      const resultCanvas = await addCurrentCatToPhoto()
      if (!resultCanvas) return false

      // 複製結果到顯示 canvas
      const displayCtx = displayCanvas.getContext('2d')
      if (!displayCtx) {
        throw new Error('顯示 Canvas context 無效')
      }

      displayCanvas.width = resultCanvas.width
      displayCanvas.height = resultCanvas.height
      displayCtx.drawImage(resultCanvas, 0, 0)

      return true
    } catch (error) {
      console.error('Update photo display failed:', error)
      return false
    }
  }

  // ===================================
  // 分享功能
  // ===================================

  /**
   * 準備分享用的照片
   */
  const preparePhotoForShare = async (): Promise<Blob | null> => {
    try {
      const canvas = await addCurrentCatToPhoto()
      if (!canvas) return null

      return await canvasToBlob(canvas, SHARE_CONFIG.quality)
    } catch (error) {
      console.error('Prepare photo for share failed:', error)
      return null
    }
  }

  /**
   * 分享照片
   */
  const sharePhoto = async (): Promise<boolean> => {
    try {
      const blob = await preparePhotoForShare()
      if (!blob) {
        store.setError('準備分享照片失敗')
        return false
      }

      const file = new File([blob], SHARE_CONFIG.filename, { type: 'image/jpeg' })

      // 檢查原生分享支援
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: SHARE_CONFIG.title,
          text: SHARE_CONFIG.text,
          files: [file]
        })
        return true
      } else {
        // 備用方案：下載
        return downloadPhoto(blob)
      }
    } catch (error) {
      console.error('Share photo failed:', error)

      if (error instanceof Error && error.name === 'AbortError') {
        // 使用者取消分享，不算錯誤
        return false
      }

      store.setError('分享照片失敗')
      return false
    }
  }

  /**
   * 下載照片（備用分享方案）
   */
  const downloadPhoto = (blob: Blob): boolean => {
    try {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = SHARE_CONFIG.filename
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
      return true
    } catch (error) {
      console.error('Download photo failed:', error)
      return false
    }
  }

  // ===================================
  // 工具方法
  // ===================================

  /**
   * 設置 overlay canvas 引用
   */
  const setOverlayCanvasRef = (canvas: HTMLCanvasElement) => {
    overlayCanvas.value = canvas
  }

  /**
   * 獲取貓咪在照片上的預覽位置
   */
  const getCatPreviewPosition = (
    cat: CatConfig,
    orientation: PhotoOrientation,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const position = cat.positions[orientation]
    if (!position) {
      console.warn(`Cat ${cat.id} missing position config for ${orientation}`)
      return null
    }

    return {
      x: position.x * canvasWidth,
      y: position.y * canvasHeight,
      maxWidth: position.maxWidth,
      maxHeight: position.maxHeight,
      // 計算相對位置（百分比）
      relativeX: position.x,
      relativeY: position.y
    }
  }

  /**
   * 預覽貓咪尺寸
   */
  const previewCatSize = (
    cat: CatConfig,
    orientation: PhotoOrientation,
    canvasWidth: number,
    canvasHeight: number
  ): CalculatedCatSize | null => {
    const position = cat.positions[orientation]
    if (!position) return null

    return calculateCatSizeAndPosition(cat, position, canvasWidth, canvasHeight)
  }

  /**
   * 檢查照片和貓咪的兼容性
   */
  const checkCompatibility = (
    photo: string,
    cat: CatConfig,
    orientation: PhotoOrientation
  ): boolean => {
    try {
      // 基本檢查
      if (!photo || !cat || !orientation) return false

      // 檢查位置配置
      if (!cat.positions || !cat.positions[orientation]) return false

      // 檢查貓咪尺寸配置
      if (!cat.originalSize || cat.originalSize.width <= 0 || cat.originalSize.height <= 0) {
        return false
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * 獲取處理狀態資訊
   */
  const getProcessingInfo = () => {
    return {
      isProcessing: isProcessing.value,
      hasLastProcessed: !!lastProcessedPhoto.value,
      canProcess: !!(photoData.value && selectedCat.value && photoOrientation.value)
    }
  }

  /**
   * 清理資源
   */
  const cleanup = () => {
    if (lastProcessedPhoto.value) {
      lastProcessedPhoto.value = null
    }
    isProcessing.value = false
  }

  // ===================================
  // 返回 API
  // ===================================

  return {
    // 響應式狀態
    overlayCanvas,
    isProcessing,
    lastProcessedPhoto,

    // 核心功能
    addCatToPhoto,
    addCurrentCatToPhoto,
    updatePhotoDisplay,

    // 分享功能
    sharePhoto,
    downloadPhoto,
    preparePhotoForShare,

    // 工具方法
    setOverlayCanvasRef,
    getCatPreviewPosition,
    previewCatSize,
    checkCompatibility,
    getProcessingInfo,
    cleanup
  }
}
