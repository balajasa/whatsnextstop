// ===================================
// 照片服務
// ===================================

import type { HistoryTrip } from '@/types/history-travel/travel-history'

// Repository 配置
const REPO_OWNER = import.meta.env.VITE_REPO_OWNER
const REPO_NAME = import.meta.env.VITE_REPO_NAME
const PHOTOS_BASE_PATH = 'images/photo'
const INDEX_FILE_PATH = 'data/folderData.json'

// 照片索引資料介面
interface PhotoFolderData {
  year: string
  folderName: string
  photosName: string[]
}

interface PhotoIndexResponse {
  folderData: PhotoFolderData[]
}

/**
 * 照片服務
 * 資料流：取得 folderName → 取得照片清單 → Raw URL 顯示照片
 */
export class PhotoService {
  // 快取照片索引資料
  private static cachedIndex: PhotoIndexResponse | null = null

  /**
   * 載入照片索引檔案
   * @returns Promise<PhotoIndexResponse | null>
   */
  private static async loadPhotoIndex(): Promise<PhotoIndexResponse | null> {
    // 如果已有快取，直接回傳
    if (this.cachedIndex) {
      return this.cachedIndex
    }

    try {
      const indexUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${INDEX_FILE_PATH}`

      const response = await fetch(indexUrl)

      if (!response.ok) {
        console.warn(`照片索引載入失敗: ${response.status} ${response.statusText}`)
        return null
      }

      const data: PhotoIndexResponse = await response.json()
      this.cachedIndex = data // 快取結果
      return data
    } catch (error) {
      console.error('載入照片索引失敗:', error)
      return null
    }
  }

  /**
   * 取得指定旅程的所有照片清單
   * @param trip HistoryTrip 物件
   * @returns Promise<string[]> 照片檔名清單
   */
  static async getPhotoList(trip: HistoryTrip): Promise<string[]> {
    try {
      // 檢查 folderName 是否存在且非空
      if (!trip.folderName || trip.folderName.trim() === '') {
        console.warn(`旅程 folderName 為空或未定義 - Trip: ${trip.title}`)
        return []
      }

      const index = await this.loadPhotoIndex()
      if (!index) {
        // console.warn(`照片索引不存在，無法載入照片: ${trip.folderName}`)
        return []
      }
      // 根據 folderName 找對應的照片清單
      const folderData = index.folderData.find((item) => item.folderName === trip.folderName.trim())
      if (!folderData) {
        console.warn(`找不到照片資料夾: ${trip.folderName}`)
        // console.log(`可用資料夾列表:`, index.folderData.map(item => item.folderName))
        return []
      }

      // console.log(`找到照片資料夾，照片數量: ${folderData.photosName.length}`)

      return folderData.photosName
    } catch (error) {
      console.error('載入照片清單失敗:', error)
      return []
    }
  }

  /**
   * 取得照片的完整 URL
   * @param trip HistoryTrip 物件
   * @param photoName 照片檔名（不含副檔名）
   * @returns string 照片的完整 URL
   */
  static getPhotoUrl(trip: HistoryTrip, photoName: string): string {
    // 檢查必要參數
    if (!trip.folderName || trip.folderName.trim() === '') {
      console.warn(`無法產生照片 URL：folderName 為空 (${trip.title || 'Unknown Trip'})`)
      return '' // 回傳空字串而不是無效 URL
    }

    if (!photoName || photoName.trim() === '') {
      console.warn(`無法產生照片 URL：photoName 為空 (folder: ${trip.folderName})`)
      return ''
    }

    const year = new Date(trip.date.startDate).getFullYear()
    const folderPath = `${PHOTOS_BASE_PATH}/${year}/${trip.folderName.trim()}`
    const fullUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${folderPath}/${photoName.trim()}.jpg`

    // 統一使用 .jpg 副檔名
    return fullUrl
  }

  /**
   * 預先載入照片 (檢查照片是否存在)
   * @param photoUrl 照片 URL
   * @returns Promise<boolean> 照片是否成功載入
   */
  static async preloadPhoto(photoUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      // console.log(`開始預載照片: ${photoUrl}`)

      const img = new Image()

      img.onload = () => {
        // console.log(`照片載入成功: ${photoUrl}`)
        resolve(true)
      }

      img.onerror = (error) => {
        console.error(`照片載入失敗 (404): ${photoUrl}`)
        console.error('   錯誤詳情:', error)
        resolve(false)
      }

      // 設定載入超時 (10秒)
      setTimeout(() => {
        console.warn(`照片載入超時 (10秒): ${photoUrl}`)
        resolve(false)
      }, 10000)

      img.src = photoUrl
    })
  }

  /**
   * 取得照片的 Base64 格式
   * @param trip HistoryTrip 物件
   * @param photoName 照片檔名（不含副檔名）
   * @returns Promise<string> 照片的 Base64 資料或原始 URL（失敗時）
   */
  static async getPhotoBase64(trip: HistoryTrip, photoName: string): Promise<string> {
    const photoUrl = this.getPhotoUrl(trip, photoName)
    
    if (!photoUrl) {
      return ''
    }

    try {
      const response = await fetch(photoUrl)
      if (!response.ok) {
        console.warn(`無法取得照片: ${response.status} ${photoUrl}`)
        return photoUrl // 失敗時返回原始 URL
      }
      
      const blob = await response.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => {
          console.error(`Base64 轉換失敗: ${photoUrl}`)
          resolve(photoUrl) // 失敗時返回原始 URL
        }
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error(`取得照片 Base64 失敗: ${photoUrl}`, error)
      return photoUrl // 失敗時返回原始 URL
    }
  }

  /**
   * 批量預載照片
   * @param trip HistoryTrip 物件
   * @param photoNames 照片檔名清單
   * @returns Promise<string[]> 成功載入的照片 URL 清單
   */
  static async preloadPhotos(trip: HistoryTrip, photoNames: string[]): Promise<string[]> {
    // 檢查基本參數
    if (!trip.folderName || trip.folderName.trim() === '') {
      console.warn(`無法預載照片：folderName 為空 (${trip.title || 'Unknown Trip'})`)
      return []
    }

    if (!Array.isArray(photoNames) || photoNames.length === 0) {
      console.warn(`無法預載照片：photoNames 為空陣列或無效 (folder: ${trip.folderName})`)
      return []
    }

    const loadingPromises = photoNames.map(async (photoName) => {
      const photoUrl = this.getPhotoUrl(trip, photoName)

      // 如果 URL 為空，直接跳過
      if (!photoUrl) {
        return null
      }

      const success = await this.preloadPhoto(photoUrl)
      return success ? photoUrl : null
    })

    const results = await Promise.all(loadingPromises)
    return results.filter((url): url is string => url !== null)
  }
}
