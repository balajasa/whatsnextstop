// utils/photoUtils.ts
// 貓咪拍照工具函式

import type { CatConfig, Position, CalculatedCatSize } from '../types/games/cat-photo'

/**
 * 偵測照片方向（只分直式和橫式）
 * @param canvas Canvas 元素
 * @returns 照片方向
 */
export function detectPhotoOrientation(canvas: HTMLCanvasElement): 'portrait' | 'landscape' {
  const aspectRatio = canvas.width / canvas.height

  if (aspectRatio > 1.0) {
    return 'landscape' // 寬高比 > 1.0 為橫式
  } else {
    return 'portrait' // 寬高比 ≤ 1.0 為直式（包含方形）
  }
}

/**
 * 計算貓咪縮放後的尺寸和實際位置
 * @param catConfig 貓咪配置
 * @param position 相對位置配置
 * @param canvasWidth 畫布寬度
 * @param canvasHeight 畫布高度
 * @returns 計算後的尺寸和位置
 */
export function calculateCatSizeAndPosition(
  catConfig: CatConfig,
  position: Position,
  canvasWidth: number,
  canvasHeight: number
): CalculatedCatSize & { actualX: number; actualY: number } {
  const { width: originalWidth, height: originalHeight } = catConfig.originalSize
  const { maxWidth, maxHeight } = position

  // 計算縮放比例，保持寬高比
  const scaleX = maxWidth / originalWidth
  const scaleY = maxHeight / originalHeight
  const scale = Math.min(scaleX, scaleY, 1) // 不放大，只縮小

  const finalWidth = Math.round(originalWidth * scale)
  const finalHeight = Math.round(originalHeight * scale)

  // 計算實際像素位置（左下角錨點）
  const actualX = Math.round(position.x * canvasWidth) // 左邊對齊
  const actualY = Math.round(position.y * canvasHeight - finalHeight) // 底部對齊

  return {
    width: finalWidth,
    height: finalHeight,
    scale,
    actualX: Math.max(0, Math.min(actualX, canvasWidth - finalWidth)), // 確保不超出邊界
    actualY: Math.max(0, Math.min(actualY, canvasHeight - finalHeight))
  }
}

/**
 * 隨機選擇貓咪
 * @param catConfigs 貓咪配置陣列
 * @returns 隨機選中的貓咪配置
 */
export function getRandomCat(catConfigs: CatConfig[]): CatConfig {
  const randomIndex = Math.floor(Math.random() * catConfigs.length)
  return catConfigs[randomIndex]
}

/**
 * 載入圖片
 * @param src 圖片路徑
 * @returns Promise<HTMLImageElement>
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

/**
 * Canvas 轉 Blob
 * @param canvas Canvas 元素
 * @param quality 品質 (0-1)
 * @returns Promise<Blob>
 */
export function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas to blob conversion failed'))
        }
      },
      'image/jpeg',
      quality
    )
  })
}

/**
 * 檢查瀏覽器分享支援
 * @param files 是否需要檔案分享支援
 * @returns 是否支援分享
 */
export function checkShareSupport(files = true): boolean {
  if (!navigator.share) return false

  if (files && navigator.canShare) {
    return navigator.canShare({ files: [new File([''], 'test.jpg')] })
  }

  return true
}

/**
 * 格式化檔案大小
 * @param bytes 位元組數
 * @returns 格式化的檔案大小字串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 防抖函式
 * @param func 要防抖的函式
 * @param wait 等待時間
 * @returns 防抖後的函式
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 節流函式
 * @param func 要節流的函式
 * @param limit 限制時間
 * @returns 節流後的函式
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
