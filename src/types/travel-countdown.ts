// ===================================
// src/types/travel-countdown.ts
// 旅行倒數相關類型定義
// ===================================

// 座標類型
export interface Coordinates {
  lat: number
  lon: number
}

// 天氣代碼對應
export interface WeatherCodeMap {
  [key: number]: {
    code: string
    description: string
  }
}

// 天氣 API 回應
export interface WeatherApiResponse {
  current: {
    temperature_2m: number
    weather_code: number
    is_day: number
  }
}

// 單一國家天氣資料
export interface WeatherData {
  temperature: number
  weatherCode: number
  code: string
  description: string
  isDay: boolean
}

// 國家天氣資料（包含國家資訊）
export interface CountryWeatherData extends WeatherData {
  country: string
  coordinates: Coordinates
}

// 多國天氣資料
export interface MultiCountryWeatherData {
  countries: CountryWeatherData[]
  primaryWeather: WeatherData
}

// 倒數資料
export interface CountdownData {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalDays: number
}

// 載入狀態
export interface LoadingState {
  weather: boolean
  countdown: boolean
}

// 錯誤狀態
export interface ErrorState {
  hasError: boolean
  message: string
}

// 旅行倒數完整狀態
export interface TravelCountdownState {
  weatherData: WeatherData | null
  multiCountryWeatherData: MultiCountryWeatherData | null
  countdownData: CountdownData | null
  loading: LoadingState
  error: ErrorState
}