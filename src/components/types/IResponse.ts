// types/IResponse.ts
import type { Ref } from 'vue'

export interface TravelData {
  year: string
  startDate: string
  endDate: string
  country: string
  city: string[]
  photo: string[]
}

export interface TravelsResponse {
  data: TravelData[]
}

export interface UsePhotosReturn {
  travels: Ref<TravelData[]>
  loading: Ref<boolean>
  loadTravels: () => Promise<void>
  getImageUrl: (folderPath: string, filename: string) => string
}

// 如果需要，可以加入其他相關的型別
export interface PhotoConfig {
  baseUrl: string
  isUseHub: boolean
}

export interface ApiResponse<T> {
  data: T
  status?: number
  message?: string
}