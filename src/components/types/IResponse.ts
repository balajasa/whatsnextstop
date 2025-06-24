// types/IResponse.ts
import type { Ref } from 'vue'

export interface TravelData {
  year: string
  startDate: string
  endDate: string
  country: string
  state_tw: string[]
  city: string[]
  city_tw?: string[]
  photo: string[]
}

export interface TravelsResponse {
  data: TravelData[]
}

export interface GetTravels {
  travels: Ref<TravelData[]>
  loading: Ref<boolean>
  loadTravels: () => Promise<void>
  getImageUrl: (folderPath: string, filename: string) => string
  getConfig: () => ConfigInfo
}

export interface ConfigInfo {
  isDev: boolean
  baseUrl: string
}
