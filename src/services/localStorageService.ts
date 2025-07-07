// src/services/localStorageService.ts

import type { CheckItem, StoredCheckItem } from '../types/check-item'
import type { IStorageService } from '../types/fb-service'

// ===================================
// LocalStorageService 類別
// ===================================

export class LocalStorageService implements IStorageService {
  private readonly storageKey = 'checkItems'

  /**
   * 儲存 CheckItem 陣列到 localStorage
   * @param items - 要儲存的 CheckItem 陣列
   */
  saveItems(items: CheckItem[]): boolean {
    try {
      // 清理資料：移除編輯狀態，轉換日期格式
      const itemsToSave: StoredCheckItem[] = items.map(item => ({
        id: item.id,
        text: item.text,
        packed: item.packed,
        createdAt: item.createdAt.toISOString(),
        order: item.order
      }))

      localStorage.setItem(this.storageKey, JSON.stringify(itemsToSave))
      return true
    } catch (error) {
      console.error('儲存到本地失敗:', error)
      return false
    }
  }

  /**
   * 從 localStorage 載入 CheckItem 陣列
   * @returns CheckItem 陣列，如果載入失敗則返回空陣列
   */
  loadItems(): CheckItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) {
        return []
      }

      const parsed = JSON.parse(stored) as StoredCheckItem[]

      // 轉換資料格式，復原日期物件
      const items: CheckItem[] = parsed.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        order: item.order || 0 // 向後相容：舊資料沒有 order 欄位
      }))

      // 修復缺少 order 的舊資料
      return this.fixOrderForLegacyData(items)

    } catch (error) {
      console.error('載入本地資料失敗:', error)
      return []
    }
  }

  /**
   * 清除所有儲存的資料
   */
  clearItems(): boolean {
    try {
      localStorage.removeItem(this.storageKey)
      return true
    } catch (error) {
      console.error('清除本地資料失敗:', error)
      return false
    }
  }

  /**
   * 檢查是否有儲存的資料
   */
  hasStoredData(): boolean {
    return localStorage.getItem(this.storageKey) !== null
  }

  /**
   * 獲取儲存資料的大小（字節）
   */
  getStorageSize(): number {
    const stored = localStorage.getItem(this.storageKey)
    return stored ? new Blob([stored]).size : 0
  }

  /**
   * 備份資料到 JSON 字串
   */
  exportData(): string | null {
    try {
      const items = this.loadItems()
      return JSON.stringify(items, null, 2)
    } catch (error) {
      console.error('匯出資料失敗:', error)
      return null
    }
  }

  /**
   * 從 JSON 字串匯入資料
   */
  importData(jsonData: string): boolean {
    try {
      const items = JSON.parse(jsonData) as CheckItem[]

      // 驗證資料格式
      if (!Array.isArray(items)) {
        throw new Error('資料格式不正確：應為陣列')
      }

      // 驗證每個項目的必要欄位
      const validItems = items.filter(item =>
        this.isValidCheckItem(item)
      )

      if (validItems.length !== items.length) {
        console.warn(`匯入資料時過濾了 ${items.length - validItems.length} 個無效項目`)
      }

      // 確保資料格式正確
      const normalizedItems: CheckItem[] = validItems.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        order: item.order || 0
      }))

      return this.saveItems(normalizedItems)
    } catch (error) {
      console.error('匯入資料失敗:', error)
      return false
    }
  }

  // ===================================
  // 私有方法
  // ===================================

  /**
   * 修復舊資料的 order 欄位
   */
  private fixOrderForLegacyData(items: CheckItem[]): CheckItem[] {
    // 找出沒有 order 或 order 為 0 的項目
    const itemsWithoutOrder = items.filter(item => !item.order || item.order === 0)

    if (itemsWithoutOrder.length > 0) {
      // 獲取現有最大 order 值
      const maxOrder = Math.max(...items.map(item => item.order || 0))

      // 為沒有 order 的項目分配新的 order 值
      itemsWithoutOrder.forEach((item, index) => {
        item.order = maxOrder + index + 1
      })
    }

    return items
  }

  /**
   * 驗證 CheckItem 物件是否有效
   */
  private isValidCheckItem(item: any): item is CheckItem {
    return (
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'number' &&
      typeof item.text === 'string' &&
      typeof item.packed === 'boolean' &&
      (item.createdAt instanceof Date || typeof item.createdAt === 'string') &&
      (typeof item.order === 'number' || item.order === undefined)
    )
  }
}

// ===================================
// 預設匯出單例實例
// ===================================

export const localStorageService = new LocalStorageService()
export default localStorageService