// ===================================
// src/services/weatherService.ts
// 天氣服務 - Open-Meteo API 呼叫
// ===================================

import axios from 'axios'
import type {
  Coordinates,
  WeatherData,
  WeatherApiResponse,
  WeatherCodeMap
} from '../types/travel-countdown'

// 天氣代碼對應表 (基於 Open-Meteo 文檔)
const WEATHER_CODE_MAP: WeatherCodeMap = {
  0: { code: 'sunny', description: '晴朗' },
  1: { code: 'mostly-sunny', description: '大致晴朗' },
  2: { code: 'partly-cloudy', description: '部分多雲' },
  3: { code: 'cloudy', description: '陰天' },
  45: { code: 'fog', description: '霧' },
  48: { code: 'fog', description: '霧凇' },
  51: { code: 'light-rain', description: '輕微毛毛雨' },
  53: { code: 'rain', description: '毛毛雨' },
  55: { code: 'rain', description: '濃密毛毛雨' },
  56: { code: 'freezing-rain', description: '輕微凍雨' },
  57: { code: 'freezing-rain', description: '凍雨' },
  61: { code: 'light-rain', description: '輕微雨' },
  63: { code: 'rain', description: '中雨' },
  65: { code: 'heavy-rain', description: '大雨' },
  66: { code: 'freezing-rain', description: '輕微凍雨' },
  67: { code: 'freezing-rain', description: '凍雨' },
  71: { code: 'light-snow', description: '輕微雪' },
  73: { code: 'snow', description: '中雪' },
  75: { code: 'heavy-snow', description: '大雪' },
  77: { code: 'snow', description: '雪粒' },
  80: { code: 'light-rain', description: '輕微陣雨' },
  81: { code: 'rain', description: '陣雨' },
  82: { code: 'heavy-rain', description: '強陣雨' },
  85: { code: 'light-snow', description: '輕微陣雪' },
  86: { code: 'snow', description: '陣雪' },
  95: { code: 'thunderstorm', description: '雷暴' },
  96: { code: 'thunderstorm-hail', description: '輕微雷暴冰雹' },
  99: { code: 'thunderstorm-severe', description: '強雷暴冰雹' }
}

// 取得天氣代碼對應的圖片代碼和描述
function getWeatherInfo(weatherCode: number): { code: string; description: string } {
  return WEATHER_CODE_MAP[weatherCode] || { code: 'mostly-sunny', description: '未知天氣' }
}

// 呼叫 Open-Meteo API 取得天氣資料 (使用 Axios)
async function fetchWeatherData(coordinates: Coordinates): Promise<WeatherData | null> {
  try {
    const { lat, lon } = coordinates
    const url = `https://api.open-meteo.com/v1/forecast`

    const response = await axios.get<WeatherApiResponse>(url, {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,is_day,weather_code'
      },
      timeout: 8000, // 8 秒超時
      headers: {
        Accept: 'application/json'
      }
    })

    const current = response.data.current

    if (!current) {
      console.warn('天氣 API 回應格式錯誤')
      return null
    }

    const weatherInfo = getWeatherInfo(current.weather_code)

    return {
      temperature: Math.round(current.temperature_2m),
      weatherCode: current.weather_code,
      code: weatherInfo.code,
      description: weatherInfo.description,
      isDay: current.is_day === 1
    }
  } catch (error) {
    // 靜默錯誤處理 - 不拋出異常
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // HTTP 錯誤 (4xx, 5xx)
        console.warn(`天氣 API HTTP 錯誤: ${error.response.status}`)
      } else if (error.request) {
        // 網路錯誤
        console.warn('天氣 API 網路錯誤:', error.message)
      } else {
        // 其他 Axios 錯誤
        console.warn('天氣 API 請求設定錯誤:', error.message)
      }
    } else {
      // 非 Axios 錯誤
      console.warn('天氣服務未知錯誤:', error)
    }
    return null
  }
}

// 取得預設天氣 (當 API 失敗時)
function getDefaultWeather(): WeatherData {
  return {
    temperature: 20,
    weatherCode: 1,
    code: 'mostly-sunny',
    description: '大致晴朗',
    isDay: true
  }
}

// 導出天氣服務
export const weatherService = {
  fetchWeatherData,
  getDefaultWeather,
  getWeatherInfo
}

export default weatherService
