// services/travelService.ts
import { travelHttpClient } from './travelHttpClient'
import { TravelData, TravelsResponse } from '../types/response'
import { RegionUtils } from '../utils/regionUtils'
import { RegionDisplayInfo } from '../constants/regionConfig'
import { countryTranslation } from '../composables/countryTranslation'

export class TravelService {
  // 獲取所有旅遊資料
  static async fetchTravels(): Promise<TravelsResponse> {
    try {
      const data = await travelHttpClient.get<TravelsResponse>('/data/travels.json')
      // console.log(`成功讀取 ${data.data.length} 筆旅遊資料`)
      return data
    } catch (error) {
      console.error(`載入失敗:`, error)
      if (travelHttpClient.getConfig().isDev) {
        // console.log('💡 本地API需要確保 Vite proxy 設定正確')
      }
      throw error
    }
  }

  // 獲取圖片 URL
  static getImageUrl(travel: TravelData, photoName: string): string {
    // 路徑格式：images/photo/{year}/{country}/{photoName}.jpg
    // 如果有多個國家，使用第一個國家
    const country = travel.country[0]
    return `${travelHttpClient.baseUrl}/images/photo/${travel.year}/${country}/${photoName}.jpg`
  }

  // 獲取國家資訊（原有方法，地圖元件使用）
  static getCountryInfo(travel: TravelData): RegionDisplayInfo {
    const { getCountryInfo } = countryTranslation()

    // 使用第一個國家來獲取資訊
    const countryName = travel.country[0]
    const countryInfo = getCountryInfo(countryName)

    return {
      flagCode: countryInfo.code || travel.country[0].toUpperCase(),
      displayName: countryInfo.chinese || countryName // 使用中文國家名，如果沒有就用原始名稱
    }
  }

  // 獲取地區顯示資訊（新方法，有特例處理）
  static getDisplayRegion(travel: TravelData): RegionDisplayInfo {
    // 1. 先檢查是否有特例城市
    const specialRegion = RegionUtils.checkSpecialCity(travel.city)
    if (specialRegion) {
      return specialRegion
    }

    // 2. 沒有特例，回傳國家資訊（使用翻譯功能）
    return this.getCountryInfo(travel)
  }

  // 獲取配置
  static getConfig() {
    return travelHttpClient.getConfig()
  }

  // 未來可以擴展的方法
  static async createTravel(travelData: Omit<TravelData, 'id'>): Promise<TravelData> {
    return travelHttpClient.post<TravelData>('/travels', travelData)
  }

  static async updateTravel(id: string, travelData: Partial<TravelData>): Promise<TravelData> {
    return travelHttpClient.post<TravelData>(`/travels/${id}`, travelData)
  }
}
