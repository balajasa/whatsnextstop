// ===================================
// src/types/travel-countdown.ts
// 旅行倒數元件類型定義
// ===================================

// 座標介面
export interface Coordinates {
  lat: number
  lon: number
}

// 天氣資料介面
export interface WeatherData {
  temperature: number
  weatherCode: number
  code: string // 天氣圖片代碼，例如: 'sunny', 'rain', 'snow'
  description: string
  isDay: boolean
}

// 倒數資料介面
export interface CountdownData {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalDays: number
  progress: number // 從現在到旅行日期的百分比 (0-100)
}

// 元件 props 介面
export interface TravelCountdownProps {
  destination: string
  tripDate: string // ISO 8601 格式: '2026-12-25'
  coordinates: Coordinates
  countryFlag: string
  title?: string // 可選的自訂標題
  showSeconds?: boolean // 是否顯示秒數，預設 true
  showWeather?: boolean // 是否顯示天氣，預設 true
  showProgress?: boolean // 是否顯示進度條，預設 true
}

// Open-Meteo 天氣 API 響應介面
export interface WeatherApiResponse {
  current: {
    temperature_2m: number
    is_day: number
    weather_code: number
  }
}

// 錯誤狀態介面
export interface ErrorState {
  hasError: boolean
  message: string
}

// 載入狀態介面
export interface LoadingState {
  weather: boolean
  countdown: boolean
}

// 天氣代碼對應表類型
export type WeatherCodeMap = {
  [key: number]: {
    code: string // 圖片檔名代碼
    description: string
  }
}

// Store 狀態介面
export interface TravelCountdownState {
  weatherData: WeatherData | null
  countdownData: CountdownData | null
  loading: LoadingState
  error: ErrorState
}
