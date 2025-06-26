// types/IResponse.ts
import type { Ref } from 'vue'

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

export interface TravelsResponse {
  data: TravelData[]
}

export interface GetTravels {
  travels: Ref<TravelData[]>
  loading: Ref<boolean>
  loadTravels: () => Promise<void>
  getImageUrl: (travel: TravelData, photoName: string) => string
  getConfig: () => ConfigInfo
}

export interface ConfigInfo {
  isDev: boolean
  baseUrl: string
}
