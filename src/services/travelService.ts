// services/travelService.ts
import { ApiService } from './api'
import { TravelData, TravelsResponse } from '../types/response'

export class TravelService {
  // 獲取所有旅遊資料
  static async fetchTravels(): Promise<TravelsResponse> {
    try {
      const data = await ApiService.get<TravelsResponse>('/data/travels.json')
      console.log(`成功讀取 ${data.data.length} 筆旅遊資料`)
      return data
    } catch (error) {
      console.error(`載入失敗:`, error)
      if (ApiService.getConfig().isDev) {
        console.log('💡 本地API需要確保 Vite proxy 設定正確')
      }
      throw error
    }
  }

  // 獲取圖片 URL
  static getImageUrl(travel: TravelData, photoName: string): string {
    // 路徑格式：images/photo/{year}/{country}/{photoName}.jpg
    // 如果有多個國家，使用第一個國家
    const country = travel.country[0]
    return `${ApiService.baseUrl}/images/photo/${travel.year}/${country}/${photoName}.jpg`
  }

  // 獲取配置
  static getConfig() {
    return ApiService.getConfig()
  }

  // 未來可以擴展的方法
  static async createTravel(travelData: Omit<TravelData, 'id'>): Promise<TravelData> {
    return ApiService.post<TravelData>('/travels', travelData)
  }

  static async updateTravel(id: string, travelData: Partial<TravelData>): Promise<TravelData> {
    return ApiService.post<TravelData>(`/travels/${id}`, travelData)
  }
}