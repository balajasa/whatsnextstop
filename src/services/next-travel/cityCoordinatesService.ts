// ===================================
// src/services/geocodingService.ts
// 地理編碼服務 - 城市名稱轉座標
// ===================================

import axios from 'axios'
import { cityCoordinates } from '../../constants/countryLocationConfig'
import type { Coordinates } from '../../types/next-travel/travel-countdown'

// Nominatim API 回應格式
interface NominatimResponse {
  lat: string
  lon: string
  display_name: string
  type: string
}

// 城市座標字典類型
type CityCoordinatesDict = Record<string, Coordinates>

// 快取前綴
const CACHE_PREFIX = 'travel_coords_'
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7天過期

/**
 * 從快取中取得座標
 * @param cityName - 城市名稱
 * @returns 座標或 null
 */
function getCachedCoordinates(cityName: string): Coordinates | null {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + cityName)
    if (!cached) return null

    const data = JSON.parse(cached)
    const now = Date.now()

    // 檢查是否過期
    if (now - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_PREFIX + cityName)
      return null
    }

    return data.coordinates
  } catch (error) {
    console.warn('讀取座標快取失敗:', error)
    return null
  }
}

/**
 * 將座標存入快取
 * @param cityName - 城市名稱
 * @param coordinates - 座標
 */
function setCachedCoordinates(cityName: string, coordinates: Coordinates): void {
  try {
    const cacheData = {
      coordinates,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_PREFIX + cityName, JSON.stringify(cacheData))
  } catch (error) {
    console.warn('儲存座標快取失敗:', error)
  }
}

/**
 * 呼叫 Nominatim API 查詢座標
 * @param cityName - 城市名稱
 * @returns 座標或 null
 */
async function queryNominatimAPI(cityName: string): Promise<Coordinates | null> {
  try {
    // console.log(`🌍 查詢城市座標: ${cityName}`)

    const response = await axios.get<NominatimResponse[]>(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          format: 'json',
          q: cityName,
          limit: 1,
          'accept-language': 'en' // 統一使用英文回應
        },
        timeout: 8000
      }
    )

    if (response.data && response.data.length > 0) {
      const result = response.data[0]
      const coordinates = {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon)
      }

      return coordinates
    } else {
      console.warn(`❌ 找不到城市: ${cityName}`)
      return null
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.warn(`🌍 地理編碼 API HTTP 錯誤: ${error.response.status}`)
      } else if (error.request) {
        console.warn('🌍 地理編碼 API 網路錯誤')
      } else {
        console.warn('🌍 地理編碼 API 請求設定錯誤:', error.message)
      }
    } else {
      console.warn('🌍 地理編碼未知錯誤:', error)
    }
    return null
  }
}

/**
 * 取得城市座標 (主要函數)
 * @param cityName - 城市名稱
 * @returns 座標
 */
export async function getCityCoordinates(cityName: string): Promise<Coordinates> {
  // 正規化城市名稱
  const normalizedCityName = cityName.trim()

  // console.log(`🗺️ 開始查詢座標: ${normalizedCityName}`)

  // 1. 優先查詢預設庫 (使用類型斷言)
  const coords = (cityCoordinates as CityCoordinatesDict)[normalizedCityName]
  if (coords) {
    // console.log(`📚 從預設庫找到座標:`, coords)
    return coords
  }

  // 2. 查詢快取
  const cachedCoords = getCachedCoordinates(normalizedCityName)
  if (cachedCoords) {
    // console.log(`💾 從快取找到座標:`, cachedCoords)
    return cachedCoords
  }

  // 3. 呼叫 API 查詢
  const apiCoords = await queryNominatimAPI(normalizedCityName)
  if (apiCoords) {
    // 存入快取
    setCachedCoordinates(normalizedCityName, apiCoords)
    return apiCoords
  }

  // 4. 所有方法都失敗，使用預設座標 (Taichung)
  // console.warn(`⚠️ 無法取得 ${normalizedCityName} 的座標，使用預設座標 (Taichung)`)
  const fallbackCoords = { lat: 120.6794, lon: 24.1439 }

  // 也快取預設座標，避免重複查詢
  setCachedCoordinates(normalizedCityName, fallbackCoords)

  return fallbackCoords
}

/**
 * 清除座標快取
 * @param cityName - 可選，清除特定城市，不提供則清除全部
 */
export function clearCoordinatesCache(cityName?: string): void {
  try {
    if (cityName) {
      localStorage.removeItem(CACHE_PREFIX + cityName)
      // console.log(`🗑️ 已清除 ${cityName} 的座標快取`)
    } else {
      // 清除所有座標快取
      const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX))
      keys.forEach(key => localStorage.removeItem(key))
      // console.log(`🗑️ 已清除所有座標快取 (${keys.length} 個項目)`)
    }
  } catch (error) {
    console.warn('清除座標快取失敗:', error)
  }
}

/**
 * 預熱常用城市座標 (可選功能)
 * @param cities - 城市名稱陣列
 */
export async function preloadCityCoordinates(cities: string[]): Promise<void> {
  // console.log('🔥 開始預熱城市座標...')

  const promises = cities.map(async city => {
    try {
      await getCityCoordinates(city)
    } catch (error) {
      console.warn(`預熱城市 ${city} 失敗:`, error)
    }
  })

  await Promise.allSettled(promises)
  // console.log('✅ 城市座標預熱完成')
}

export default {
  getCityCoordinates,
  clearCoordinatesCache,
  preloadCityCoordinates
}
