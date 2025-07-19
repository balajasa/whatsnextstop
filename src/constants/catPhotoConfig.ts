// constants/catPhotoConfig.ts
// 貓咪拍照功能基礎配置

import type { CameraConfig, CatConfig } from '../types/cat-photo'
import eatCatImg from '@/assets/img/minigame/cat/eat_cat.png'
import lazyCatImg from '@/assets/img/minigame/cat/lazy_cat.png'
import travelCatImg from '@/assets/img/minigame/cat/travel_cat.png'
import wallCatImg from '@/assets/img/minigame/cat/wall_cat.png'
import sleepCatImg from '@/assets/img/minigame/cat/sleep_cat.png'
import swimCatImg from '@/assets/img/minigame/cat/swim_cat.png'

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

// 預設位置定義
export const POSITION_PRESETS = {
  top_left: { x: 0.15, y: 0.25 },
  top_center: { x: 0.5, y: 0.25 },
  top_right: { x: 0.85, y: 0.25 },
  upper_left: { x: 0.15, y: 0.4 },
  middle_right: { x: 0.85, y: 0.6 },
  lower_left: { x: 0.03, y: 1.0 },
  lower_center: { x: 0.5, y: 1.0 },
  lower_right: { x: 1.0, y: 1.0 }
}

// 貓咪隨機位置規則
export const CAT_POSITION_RULES: Record<string, string[]> = {
  eat_cat: ['lower_left', 'lower_center', 'lower_right'],
  sleep_cat: ['top_left', 'top_right', 'lower_center', 'lower_right', 'middle_right'],
  travel_cat: ['lower_left', 'lower_right'],
  wall_cat: ['lower_right'],
  lazy_cat: [
    'top_left',
    'top_center',
    'top_right',
    'upper_left',
    'middle_right',
    'lower_left',
    'lower_center',
    'lower_right'
  ],
  swim_cat: ['upper_left', 'middle_right', 'lower_left', 'lower_center', 'lower_right']
}

// 獲取貓咪的隨機位置
export const getRandomPositionForCat = (catId: string): { x: number; y: number } | null => {
  const positionNames = CAT_POSITION_RULES[catId]
  if (!positionNames || positionNames.length === 0) {
    return POSITION_PRESETS.lower_left // 沒有隨機位置配置，預設左下角
  }

  // 隨機選擇一個位置名稱
  const randomIndex = Math.floor(Math.random() * positionNames.length)
  const selectedPositionName = positionNames[randomIndex]

  // 返回對應的座標
  return POSITION_PRESETS[selectedPositionName as keyof typeof POSITION_PRESETS]
}

// 為貓咪配置應用隨機位置
export const applyCatRandomPosition = (catConfig: CatConfig): CatConfig => {
  const randomPosition = getRandomPositionForCat(catConfig.id)

  if (!randomPosition) {
    // 沒有隨機配置，返回原配置
    return catConfig
  }

  return {
    ...catConfig,
    positions: {
      // 統一應用到 portrait 和 landscape
      portrait: {
        ...randomPosition,
        maxWidth: catConfig.originalSize.width,
        maxHeight: catConfig.originalSize.height
      },
      landscape: {
        ...randomPosition,
        maxWidth: catConfig.originalSize.width,
        maxHeight: catConfig.originalSize.height
      }
    }
  }
}

// 預設的貓咪配置
export const DEFAULT_CAT_CONFIGS: CatConfig[] = [
  {
    id: 'eat_cat',
    name: '吃飯貓貓',
    image: eatCatImg,
    originalSize: {
      width: 439,
      height: 450
    }
  },
  {
    id: 'sleep_cat',
    name: '趴著貓貓',
    image: sleepCatImg,
    originalSize: {
      width: 500,
      height: 332
    }
  },
  {
    id: 'travel_cat',
    name: '旅行貓貓',
    image: travelCatImg,
    originalSize: {
      width: 325,
      height: 500
    }
  },
  {
    id: 'wall_cat',
    name: '門邊貓貓',
    image: wallCatImg,
    originalSize: {
      width: 282,
      height: 500
    }
  },
  {
    id: 'lazy_cat',
    name: '躺著貓貓',
    image: lazyCatImg,
    originalSize: {
      width: 500,
      height: 378
    }
  },
  {
    id: 'swim_cat',
    name: '游泳貓貓',
    image: swimCatImg,
    originalSize: {
      width: 380,
      height: 500
    }
  }
]

// 獲取應用隨機位置的貓咪配置
export const getCatConfigsWithRandomPositions = (): CatConfig[] => {
  return DEFAULT_CAT_CONFIGS.map(config => applyCatRandomPosition(config))
}

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

// Z-index 層級
export const Z_INDEX = {
  debugInfo: 1000,
  closeButton: 100,
  captureButton: 50,
  overlay: 998
}
