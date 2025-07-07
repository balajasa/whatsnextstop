// src/types/check-item.ts
// CheckList 組件相關的型別定義

// ===================================
// 基礎資料型別
// ===================================

// 清單項目介面
export interface CheckItem {
  id: number
  text: string
  packed: boolean
  createdAt: Date
  order: number // 用於手動排序
  isEditing?: boolean // 編輯狀態
  originalText?: string // 編輯時的原始文字
}

// 資料庫序列化後的項目（Date 轉成 string）
export interface SerializedCheckItem {
  id: number
  text: string
  packed: boolean
  createdAt: string // ISO 字串格式
  order: number
}

// localStorage 儲存格式（與 SerializedCheckItem 相同，但語意不同）
export interface StoredCheckItem extends SerializedCheckItem {}

// ===================================
// 篩選相關型別
// ===================================

// 過濾器類型
export type FilterType = 'all' | 'unpacked' | 'packed'

// 過濾選項介面
export interface FilterOption {
  value: FilterType
  label: string
}