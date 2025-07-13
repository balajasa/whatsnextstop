// src/composables/cat-photo/useCamera.ts
// 相機操作 Composable

import { ref, computed, onUnmounted } from 'vue'
import { useCatPhotoStore } from '../../stores/catPhotoStore'
import { CAMERA_CONFIG } from '../../constants/catPhotoConfig'
import { throttle } from '../../utils/photoUtils'

export function useCamera() {
  const store = useCatPhotoStore()

  // ===================================
  // 響應式狀態
  // ===================================

  const videoElement = ref<HTMLVideoElement | null>(null)
  const canvasElement = ref<HTMLCanvasElement | null>(null)
  const isInitializing = ref(false)
  const isCameraReady = ref(false)

  // ===================================
  // 計算屬性
  // ===================================

  const isCameraActive = computed(() => store.isCameraActive)
  const isLoading = computed(() => store.isLoading || isInitializing.value)

  // ===================================
  // 相機初始化
  // ===================================

  /**
   * 初始化相機
   */
  const initializeCamera = async (videoEl: HTMLVideoElement) => {
    if (!videoEl) {
      throw new Error('Video element is required')
    }

    isInitializing.value = true
    videoElement.value = videoEl

    try {
      const stream = await store.startCamera()

      // 設置視頻元素
      videoEl.srcObject = stream

      // 等待視頻準備就緒
      await new Promise<void>((resolve, reject) => {
        const onLoadedMetadata = () => {
          videoEl.removeEventListener('loadedmetadata', onLoadedMetadata)
          videoEl.removeEventListener('error', onError)
          isCameraReady.value = true
          resolve()
        }

        const onError = (error: Event) => {
          videoEl.removeEventListener('loadedmetadata', onLoadedMetadata)
          videoEl.removeEventListener('error', onError)
          reject(new Error('Video loading failed'))
        }

        videoEl.addEventListener('loadedmetadata', onLoadedMetadata)
        videoEl.addEventListener('error', onError)

        // 開始播放
        videoEl.play().catch(reject)
      })

      return stream
    } catch (error) {
      isCameraReady.value = false
      throw error
    } finally {
      isInitializing.value = false
    }
  }

  /**
   * 停止相機
   */
  const stopCamera = async () => {
    try {
      await store.stopCamera()

      if (videoElement.value) {
        videoElement.value.srcObject = null
      }

      isCameraReady.value = false
    } catch (error) {
      console.error('Stop camera failed:', error)
    }
  }

  // ===================================
  // 拍照功能
  // ===================================

  /**
   * 拍攝照片
   */
  const capturePhoto = async (): Promise<string | null> => {
    if (!videoElement.value || !isCameraReady.value) {
      store.setError('相機未準備就緒')
      return null
    }

    try {
      // 創建 canvas 來捕獲照片
      const canvas = canvasElement.value || document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('無法取得 Canvas context')
      }

      // 設置 canvas 尺寸為視頻尺寸
      canvas.width = videoElement.value.videoWidth
      canvas.height = videoElement.value.videoHeight

      // 繪製當前視頻幀到 canvas
      ctx.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height)

      // 使用 store 處理照片
      const photoData = await store.capturePhoto(canvas)

      return photoData
    } catch (error) {
      console.error('Capture photo failed:', error)
      store.setError('拍照失敗，請重試')
      return null
    }
  }

  /**
   * 節流版本的拍照（防止快速重複點擊）
   */
  const throttledCapturePhoto = throttle(capturePhoto, 1000)

  // ===================================
  // 相機設置
  // ===================================

  /**
   * 切換前後鏡頭
   */
  const switchCamera = async () => {
    if (!isCameraActive.value) return

    try {
      await stopCamera()

      // 切換鏡頭設置
      const currentFacingMode = CAMERA_CONFIG.video.facingMode
      const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment'

      // 更新配置並重新啟動
      CAMERA_CONFIG.video.facingMode = newFacingMode

      if (videoElement.value) {
        await initializeCamera(videoElement.value)
      }
    } catch (error) {
      console.error('Switch camera failed:', error)
      store.setError('切換鏡頭失敗')
    }
  }

  /**
   * 獲取相機資訊
   */
  const getCameraInfo = () => {
    if (!videoElement.value || !isCameraReady.value) {
      return null
    }

    return {
      width: videoElement.value.videoWidth,
      height: videoElement.value.videoHeight,
      aspectRatio: videoElement.value.videoWidth / videoElement.value.videoHeight,
      facingMode: CAMERA_CONFIG.video.facingMode
    }
  }

  // ===================================
  // 權限檢查
  // ===================================

  /**
   * 檢查相機權限
   */
  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      if (!navigator.permissions) {
        // 某些瀏覽器不支援 permissions API，直接嘗試存取
        return true
      }

      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
      return permission.state === 'granted' || permission.state === 'prompt'
    } catch (error) {
      console.warn('Cannot check camera permission:', error)
      return true // 假設有權限，讓使用者自己處理
    }
  }

  /**
   * 請求相機權限
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      })

      // 立即停止，只是為了請求權限
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      console.error('Camera permission denied:', error)
      return false
    }
  }

  // ===================================
  // 生命週期
  // ===================================

  onUnmounted(async () => {
    await stopCamera()
  })

  // ===================================
  // 工具方法
  // ===================================

  /**
   * 設置 canvas 元素引用
   */
  const setCanvasRef = (canvas: HTMLCanvasElement) => {
    canvasElement.value = canvas
  }

  /**
   * 獲取建議的視頻約束
   */
  const getVideoConstraints = (preferredFacingMode?: 'user' | 'environment') => {
    return {
      facingMode: preferredFacingMode || CAMERA_CONFIG.video.facingMode,
      width: CAMERA_CONFIG.video.width,
      height: CAMERA_CONFIG.video.height
    }
  }

  /**
   * 檢查是否支援特定功能
   */
  const checkCameraFeatures = () => {
    return {
      hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      hasEnumerateDevices: !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices),
      hasPermissions: !!navigator.permissions
    }
  }

  // ===================================
  // 返回 API
  // ===================================

  return {
    // 響應式狀態
    videoElement,
    canvasElement,
    isInitializing,
    isCameraReady,
    isCameraActive,
    isLoading,

    // 相機操作
    initializeCamera,
    stopCamera,
    capturePhoto,
    throttledCapturePhoto,
    switchCamera,

    // 權限和檢查
    checkCameraPermission,
    requestCameraPermission,
    checkCameraFeatures,

    // 工具方法
    setCanvasRef,
    getCameraInfo,
    getVideoConstraints
  }
}
