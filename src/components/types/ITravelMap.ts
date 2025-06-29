// types/ITravelMap.ts
/**
 * 旅遊行程資料介面
 */
export interface TravelData {
  year: string
  startDate: string
  endDate: string
  country: string[]
  stateTW: string[]
  city: string[]
  cityTW?: string[]
  folderName: string
  photo: string[]
}

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
  trips?: TravelData[]
}

/**
 * 旅遊圖釘元件的 Props 介面
 */
export interface MapPinProps {
  projection: any  // D3 投影函數
  worldData: any   // GeoJSON 世界地圖資料
  currentTransform: Transform
  currentScale: number
}

/**
 * 拖曳邊界介面
 */
export interface DragBounds {
  maxX: number
  maxY: number
  minX: number
  minY: number
}

/**
 * 地圖事件介面
 */
export interface MapEvents {
  'map-ready': [{ projection: any; worldData: any }]
  'view-change': [{ scale: number; transform: Transform }]
  'country-hover': [string]
  'country-click': [string]
  'status-change': [string]
}

/**
 * 世界地圖元件的 Props 介面
 */
export interface WorldMapProps {
  width?: number
  height?: number
  minScale?: number
  maxScale?: number
}

/**
 * 地圖資訊面板的 Props 介面
 */
export interface InfoPanelProps {
  selectedPin: ProcessedPin | null
}