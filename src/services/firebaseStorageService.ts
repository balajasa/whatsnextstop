// src/services/firebaseStorageService.ts

import {
  ref,
  set,
  get,
  remove,
  onValue,
  off,
  update,
  DatabaseReference,
  DataSnapshot
} from 'firebase/database'
import { database } from '../firebase'
import type { CheckItem, SerializedCheckItem } from '../types/check-item'
import type { IStorageService, User } from '../types/fb-service'
import { serverTimestamp } from 'firebase/database'

// ===================================
// 型別定義
// ===================================

type DataChangeCallback = (items: CheckItem[]) => void

interface FirebaseStorageServiceConfig {
  enableRealTimeSync?: boolean // 是否啟用即時同步
}

// ===================================
// FirebaseStorageService 類別
// ===================================

export class FirebaseStorageService implements IStorageService {
  private currentUserId: string | null = null
  private dataChangeCallbacks: Set<DataChangeCallback> = new Set()
  private currentListener: DatabaseReference | null = null
  private config: FirebaseStorageServiceConfig

  constructor(config: FirebaseStorageServiceConfig = {}) {
    this.config = {
      enableRealTimeSync: true,
      ...config
    }
  }

  // ===================================
  // IStorageService 實作
  // ===================================

  /**
   * 儲存 CheckItem 陣列到 Firebase
   */
  async saveItems(items: CheckItem[]): Promise<boolean> {
    if (!this.currentUserId) {
      console.error('使用者未登入，無法儲存到雲端')
      return false
    }

    try {
      const userItemsRef = this.getUserItemsRef()
      const metadataRef = this.getMetadataRef()
      const serializedItems = this.serializeItems(items)
      const itemsObject = this.arrayToObject(serializedItems)

      // 同時更新項目和 metadata
      await Promise.all([
        set(userItemsRef, itemsObject),
        set(metadataRef, {
          lastUpdated: serverTimestamp(),
          itemCount: items.length
        })
      ])

      return true
    } catch (error) {
      console.error('儲存到 Firebase 失敗:', error)
      return false
    }
  }

  /**
   * 從 Firebase 載入 CheckItem 陣列
   */
  async loadItems(): Promise<CheckItem[]> {
    if (!this.currentUserId) {
      console.warn('使用者未登入，無法從雲端載入資料')
      return []
    }

    try {
      const userItemsRef = this.getUserItemsRef()
      const snapshot = await get(userItemsRef)

      if (snapshot.exists()) {
        const itemsObject = snapshot.val()
        const serializedItems = this.objectToArray(itemsObject)
        return this.deserializeItems(serializedItems)
      }

      return []
    } catch (error) {
      console.error('從 Firebase 載入資料失敗:', error)
      return []
    }
  }

  /**
   * 清除使用者的所有資料
   */
  async clearItems(): Promise<boolean> {
    if (!this.currentUserId) {
      console.error('使用者未登入，無法清除雲端資料')
      return false
    }

    try {
      const userItemsRef = this.getUserItemsRef()
      const metadataRef = this.getMetadataRef()

      // 同時清除項目和 metadata
      await Promise.all([
        remove(userItemsRef),
        remove(metadataRef)
      ])

      return true
    } catch (error) {
      console.error('清除 Firebase 資料失敗:', error)
      return false
    }
  }

  /**
   * 獲取 metadata (包含最後更新時間)
   */
  async getMetadata(): Promise<{ lastUpdated: Date | null; itemCount: number } | null> {
    if (!this.currentUserId) {
      return null
    }

    try {
      const metadataRef = this.getMetadataRef()
      const snapshot = await get(metadataRef)

      if (snapshot.exists()) {
        const data = snapshot.val()
        return {
          lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : null,
          itemCount: data.itemCount || 0
        }
      }

      return null
    } catch (error) {
      console.error('獲取 metadata 失敗:', error)
      return null
    }
  }

  /**
   * 檢查是否有儲存的資料
   */
  async hasStoredData(): Promise<boolean> {
    if (!this.currentUserId) {
      return false
    }

    try {
      const userItemsRef = this.getUserItemsRef()
      const snapshot = await get(userItemsRef)
      return snapshot.exists() && snapshot.hasChildren()
    } catch (error) {
      console.error('檢查 Firebase 資料失敗:', error)
      return false
    }
  }

  /**
   * 獲取儲存資料的大小（估計值）
   */
  async getStorageSize(): Promise<number> {
    try {
      const items = await this.loadItems()
      const jsonString = JSON.stringify(items)
      return new Blob([jsonString]).size
    } catch (error) {
      console.error('計算 Firebase 資料大小失敗:', error)
      return 0
    }
  }

  /**
   * 匯出資料為 JSON 字串
   */
  async exportData(): Promise<string | null> {
    try {
      const items = await this.loadItems()
      return JSON.stringify(items, null, 2)
    } catch (error) {
      console.error('匯出 Firebase 資料失敗:', error)
      return null
    }
  }

  /**
   * 從 JSON 字串匯入資料
   */
  async importData(jsonData: string): Promise<boolean> {
    try {
      const items = JSON.parse(jsonData) as CheckItem[]

      // 驗證資料格式
      if (!Array.isArray(items)) {
        throw new Error('資料格式不正確：應為陣列')
      }

      // 驗證每個項目的必要欄位
      const validItems = items.filter(item => this.isValidCheckItem(item))

      if (validItems.length !== items.length) {
        console.warn(`匯入資料時過濾了 ${items.length - validItems.length} 個無效項目`)
      }

      // 確保資料格式正確
      const normalizedItems: CheckItem[] = validItems.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        order: item.order || 0
      }))

      return await this.saveItems(normalizedItems)
    } catch (error) {
      console.error('匯入 Firebase 資料失敗:', error)
      return false
    }
  }

  // ===================================
  // Firebase 特有功能
  // ===================================

  /**
   * 設定當前使用者
   */
  setCurrentUser(user: User | null): void {
    const newUserId = user?.uid || null

    // 如果使用者改變，停止舊的監聽器
    if (newUserId !== this.currentUserId) {
      this.stopRealTimeSync()
      this.currentUserId = newUserId

      // 如果啟用即時同步且有新使用者，開始監聽
      if (this.config.enableRealTimeSync && newUserId) {
        this.startRealTimeSync()
      }
    }
  }

  /**
   * 獲取當前使用者 ID
   */
  getCurrentUserId(): string | null {
    return this.currentUserId
  }

  /**
   * 開始即時同步監聽
   */
  startRealTimeSync(): void {
    if (!this.currentUserId || this.currentListener) {
      return
    }

    const userItemsRef = this.getUserItemsRef()
    this.currentListener = userItemsRef

    onValue(userItemsRef, (snapshot: DataSnapshot) => {
      try {
        let items: CheckItem[] = []

        if (snapshot.exists()) {
          const itemsObject = snapshot.val()
          const serializedItems = this.objectToArray(itemsObject)
          items = this.deserializeItems(serializedItems)
        }

        // 通知所有訂閱者
        this.dataChangeCallbacks.forEach(callback => {
          try {
            callback(items)
          } catch (error) {
            console.error('即時同步回調執行失敗:', error)
          }
        })
      } catch (error) {
        console.error('處理即時同步資料失敗:', error)
      }
    })
  }

  /**
   * 停止即時同步監聽
   */
  stopRealTimeSync(): void {
    if (this.currentListener) {
      off(this.currentListener)
      this.currentListener = null
    }
  }

  /**
   * 訂閱資料變化
   */
  onDataChanged(callback: DataChangeCallback): () => void {
    this.dataChangeCallbacks.add(callback)

    // 返回取消訂閱函數
    return () => {
      this.dataChangeCallbacks.delete(callback)
    }
  }

  /**
   * 新增單個項目
   */
  async addItem(item: CheckItem): Promise<boolean> {
    if (!this.currentUserId) {
      return false
    }

    try {
      const userItemsRef = this.getUserItemsRef()
      const serializedItem = this.serializeItem(item)

      // 使用項目 ID 作為 key
      const itemRef = ref(database, `${userItemsRef.toString()}/${item.id}`)
      await set(itemRef, serializedItem)

      return true
    } catch (error) {
      console.error('新增項目到 Firebase 失敗:', error)
      return false
    }
  }

  /**
   * 更新單個項目
   */
  async updateItem(item: CheckItem): Promise<boolean> {
    if (!this.currentUserId) {
      return false
    }

    try {
      const itemRef = ref(database, `users/${this.currentUserId}/checkItems/${item.id}`)
      const serializedItem = this.serializeItem(item)

      await update(itemRef, serializedItem)
      return true
    } catch (error) {
      console.error('更新項目到 Firebase 失敗:', error)
      return false
    }
  }

  /**
   * 刪除單個項目
   */
  async deleteItem(itemId: number): Promise<boolean> {
    if (!this.currentUserId) {
      return false
    }

    try {
      const itemRef = ref(database, `users/${this.currentUserId}/checkItems/${itemId}`)
      await remove(itemRef)
      return true
    } catch (error) {
      console.error('從 Firebase 刪除項目失敗:', error)
      return false
    }
  }

  // ===================================
  // 私有方法
  // ===================================

  /**
   * 獲取當前使用者的項目參考
   */
  private getUserItemsRef(): DatabaseReference {
    if (!this.currentUserId) {
      throw new Error('使用者未登入')
    }
    return ref(database, `users/${this.currentUserId}/checkItems`)
  }

  /**
   * 序列化 CheckItem 陣列
   */
  private serializeItems(items: CheckItem[]): SerializedCheckItem[] {
    return items.map(item => this.serializeItem(item))
  }

  /**
   * 序列化單個 CheckItem
   */
  private serializeItem(item: CheckItem): SerializedCheckItem {
    return {
      id: item.id,
      text: item.text,
      packed: item.packed,
      createdAt: item.createdAt.toISOString(),
      order: item.order
    }
  }

  /**
   * 反序列化 CheckItem 陣列
   */
  private deserializeItems(serializedItems: SerializedCheckItem[]): CheckItem[] {
    return serializedItems.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }))
  }

  /**
   * 將陣列轉換為物件（Firebase 儲存格式）
   */
  private arrayToObject(items: SerializedCheckItem[]): Record<string, SerializedCheckItem> {
    const result: Record<string, SerializedCheckItem> = {}
    items.forEach(item => {
      result[item.id.toString()] = item
    })
    return result
  }

  /**
   * 將物件轉換為陣列
   */
  private objectToArray(itemsObject: Record<string, SerializedCheckItem>): SerializedCheckItem[] {
    if (!itemsObject) return []

    return Object.values(itemsObject).sort((a, b) => a.order - b.order)
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

  /**
   * 獲取當前使用者的 metadata 參考
   */
  private getMetadataRef(): DatabaseReference {
    if (!this.currentUserId) {
      throw new Error('使用者未登入')
    }
    return ref(database, `users/${this.currentUserId}/metadata`)
  }
}

// ===================================
// 預設匯出單例實例
// ===================================

export const firebaseStorageService = new FirebaseStorageService({
  enableRealTimeSync: true
})

export default firebaseStorageService