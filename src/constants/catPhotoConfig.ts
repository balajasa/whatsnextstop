// constants/catPhotoConfig.ts
// 貓咪拍照功能基礎配置

import type { FixedPositions, CameraConfig, CatConfig } from '../types/cat-photo'

// 固定位置配置
export const FIXED_POSITIONS: FixedPositions = {
  portrait: {
    x: 80,
    y: 350,
    maxWidth: 120,
    maxHeight: 140
  },
  landscape: {
    x: 250,
    y: 120,
    maxWidth: 120,
    maxHeight: 140
  },
  square: {
    x: 150,
    y: 200,
    maxWidth: 120,
    maxHeight: 140
  }
}

// 相機配置
export const CAMERA_CONFIG: CameraConfig = {
  video: {
    facingMode: 'environment', // 預設使用後鏡頭
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
}

// 照片方向判斷閾值
export const ORIENTATION_THRESHOLDS = {
  landscape: 1.2, // 寬高比 > 1.2 為橫式
  portrait: 0.8 // 寬高比 < 0.8 為直式
}

// 預設的貓咪配置../../assets/img src\assets\img\minigame\cat\cat_eat.png
export const DEFAULT_CAT_CONFIGS: CatConfig[] = [
  {
    id: 'eat_cat',
    name: '吃飯貓貓',
    image: '../../assets/img/cat/eat_cat.png',
    originalSize: {
      width: 500,
      height: 513
    }
  },
  {
    id: 'lazy_cat',
    name: '趴著貓貓',
    image: '../../assets/img/cat/lazy_cat.png',
    originalSize: {
      width: 500,
      height: 332
    }
  },
  {
    id: 'travel_cat',
    name: '旅行貓貓',
    image: '../../assets/img/cat/travel_cat.png',
    originalSize: {
      width: 325,
      height: 500
    }
  },
  {
    id: 'wall_cat',
    name: '門邊貓貓',
    image: '../../assets/img/cat/wall_cat.png',
    originalSize: {
      width: 297,
      height: 500
    }
  }
]

// 分享配置
export const SHARE_CONFIG = {
  title: '我的隨機貓咪照片',
  text: '看看我遇到了什麼貓咪！',
  filename: 'cat-photo.jpg',
  quality: 0.9
}

// 動畫時長配置
export const ANIMATION_DURATIONS = {
  pageTransition: 300,
  cameraInit: 500,
  photoCapture: 800,
  catOverlay: 1000
}

// 錯誤訊息
export const ERROR_MESSAGES = {
  CAMERA_ACCESS_DENIED: '無法開啟相機，請確認相機權限',
  CAMERA_NOT_FOUND: '找不到相機設備',
  PHOTO_CAPTURE_FAILED: '拍照失敗，請重試',
  CAT_LOADING_FAILED: '貓咪圖片載入失敗',
  SHARE_NOT_SUPPORTED: '您的裝置不支援分享功能',
  CANVAS_NOT_SUPPORTED: '您的瀏覽器不支援 Canvas'
}

// Z-index 層級（配合現有設計系統）
export const Z_INDEX = {
  debugInfo: 1000,
  closeButton: 100,
  captureButton: 50,
  overlay: 998
}
