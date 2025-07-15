// constants/catPhotoConfig.ts
// 貓咪拍照功能基礎配置

import type { CameraConfig, CatConfig } from '../types/cat-photo'
import eatCatImg from '@/assets/img/minigame/cat/eat_cat.png'
import lazyCatImg from '@/assets/img/minigame/cat/lazy_cat.png'
import travelCatImg from '@/assets/img/minigame/cat/travel_cat.png'
import wallCatImg from '@/assets/img/minigame/cat/wall_cat.png'

// 相機配置
export const CAMERA_CONFIG: CameraConfig = {
  video: {
    facingMode: 'environment',
    width: { max: 2048 }, // 不超過 2K
    height: { max: 1536 } // 避免過度耗能
  }
}

// 照片方向判斷閾值
export const ORIENTATION_THRESHOLDS = {
  landscape: 1.2, // 寬高比 > 1.2 為橫式
  portrait: 0.8 // 寬高比 < 0.8 為直式
}

// 預設的貓咪配置
export const DEFAULT_CAT_CONFIGS: CatConfig[] = [
  {
    id: 'eat_cat',
    name: '吃飯貓貓',
    image: eatCatImg,
    originalSize: {
      width: 500,
      height: 513
    },
    positions: {
      portrait: { x: 0.25, y: 1.0, maxWidth: 500, maxHeight: 513 },
      landscape: { x: 0.05, y: 1.0, maxWidth: 500, maxHeight: 513 }
    }
  },
  {
    id: 'sleep_cat',
    name: '趴著貓貓',
    image: lazyCatImg,
    originalSize: {
      width: 500,
      height: 332
    },
    positions: {
      portrait: { x: 0.75, y: 1.0, maxWidth: 500, maxHeight: 332 },
      landscape: { x: 0.75, y: 1.0, maxWidth: 500, maxHeight: 332 }
    }
  },
  {
    id: 'travel_cat',
    name: '旅行貓貓',
    image: travelCatImg,
    originalSize: {
      width: 325,
      height: 500
    },
    positions: {
      portrait: { x: 0.03, y: 1.0, maxWidth: 325, maxHeight: 500 },
      landscape: { x: 0.05, y: 1.0, maxWidth: 325, maxHeight: 500 }
    }
  },
  {
    id: 'wall_cat',
    name: '門邊貓貓',
    image: wallCatImg,
    originalSize: {
      width: 297,
      height: 500
    },
    positions: {
      portrait: { x: 1.0, y: 1.0, maxWidth: 297, maxHeight: 500 },
      landscape: { x: 1.0, y: 1.0, maxWidth: 297, maxHeight: 500 }
    }
  },
  {
    id: 'lazy_cat',
    name: '躺著貓貓',
    image: lazyCatImg,
    originalSize: {
      width: 500,
      height: 378
    },
    positions: {
      portrait: { x: 0.05, y: 0.25, maxWidth: 500, maxHeight: 378 },
      landscape: { x: 1.0, y: 0.8, maxWidth: 500, maxHeight: 378 }
    }
  }
]

// 分享配置
export const SHARE_CONFIG = {
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
