// ===================================
// 地圖資料型別
// ===================================

import type { HistoryTrip } from '../history-travel/travel-history'

/**
 * 地圖變換狀態介面
 */
export interface Transform {
  x: number
  y: number
  scale: number
}

/**
 * 處理後的地圖圖釘資料介面
 */
export interface ProcessedPin {
  country: string
  displayName: string
  visitCount: number
  latestVisit: string
  cities: string
  x: number
  y: number
  centroid: [number, number],
  trips?: HistoryTrip[]
}

/**
 * 地圖資訊面板的 Props 介面
 */
export interface InfoPanelProps {
  selectedPin: ProcessedPin | null
}