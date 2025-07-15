// src/types/cat-photo.ts
// 貓咪拍照功能型別定義

// 相機約束類型（支援 min, max, ideal, exact）
export interface MediaTrackConstraintSet {
  min?: number
  max?: number
  ideal?: number
  exact?: number
}

// 視頻約束介面
export interface VideoConstraints {
  facingMode?: 'user' | 'environment'
  width?: number | MediaTrackConstraintSet
  height?: number | MediaTrackConstraintSet
  frameRate?: number | MediaTrackConstraintSet
  aspectRatio?: number | MediaTrackConstraintSet
  deviceId?: string | { exact: string }
}

// 相機配置介面
export interface CameraConfig {
  video: VideoConstraints | boolean
  audio?: boolean
}

// 貓咪配置介面
export interface CatConfig {
  id: string
  name: string
  image: string // 圖片路徑
  originalSize: {
    width: number
    height: number
  }
  positions: {
    portrait: Position
    landscape: Position
  }
}

// 位置配置介面
export interface Position {
  x: number
  y: number
  maxWidth: number
  maxHeight: number
}

// 照片方向（移除 square）
export type PhotoOrientation = 'portrait' | 'landscape'

// 頁面狀態
export type PageState = 'main' | 'camera' | 'result' | 'final'

// 應用狀態介面
export interface CatPhotoState {
  currentPage: PageState
  photoData: string | null
  selectedCat: CatConfig | null
  photoOrientation: PhotoOrientation | null
  cameraStream: MediaStream | null
  isLoading: boolean
  error: string | null
}

// 計算後的貓咪尺寸
export interface CalculatedCatSize {
  width: number
  height: number
  scale: number
}

// Canvas 繪製參數
export interface DrawCatParams {
  cat: CatConfig
  position: Position
  calculatedSize: CalculatedCatSize
  canvasWidth: number
  canvasHeight: number
}

// 分享選項
export interface ShareOptions {
  title: string
  text: string
  files?: File[]
}

// API 回應格式（如果未來需要）
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 事件類型
export interface CatPhotoEvents {
  'page-change': PageState
  'photo-captured': string
  'cat-selected': CatConfig
  'share-photo': string
  error: string
}