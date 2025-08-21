// ===================================
// 景點資料相關類型定義
// ===================================

// 景點基礎資料介面
export interface Spot {
  id?: string
  name: string
  country: string
  region: string
  category: SpotCategory
  description: string
  businessHours: string
  ticketPrice: number
  currency: string
  googleMapUrl: string
  notes: string
  createdAt?: string
  updatedAt?: string
}

// 景點類別類型
export type SpotCategory = '景點' | '美食' | '住宿' | '購物' | '交通'

// 景點類別選項
export interface CategoryOption {
  value: SpotCategory | ''
  label: string
}

// 國家選項
export interface CountryOption {
  value: string
  label: string
  flag: string
}

// 篩選參數
export interface SpotFilters {
  country: string
  category: SpotCategory | ''
  keyword: string
}

// 景點列表響應
export interface SpotsResponse {
  spots: Spot[]
  countries: string[]
  totalCount: number
}

// 景點卡片 Props
export interface SpotCardProps {
  spot: Spot
}

// 景點搜尋參數
export interface SpotSearchParams {
  country?: string
  category?: SpotCategory
  keyword?: string
  limit?: number
  offset?: number
}

// 格式化後的景點資料（用於顯示）
export interface FormattedSpot extends Spot {
  displayPrice: string
  displayHours: string
  hasMap: boolean
}