// ===================================
// 後台旅行服務 - 連接後台 Firebase 資料
// ===================================

import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { countryTranslation } from '../composables/countryTranslation'

// 後台資料結構定義
interface TripOptions {
  showSeconds?: boolean
  showWeather?: boolean
}

interface BackendTripCountdown {
  id?: string
  countries: string[]
  tripDate: string
  title: string
  coordinates?: {
    lat: number
    lon: number
  }
  notes?: string
  status: 'planning' | 'upcoming' | 'ongoing' | 'completed'
  options?: TripOptions
  createdAt?: Timestamp
  updatedAt?: Timestamp
  createdBy?: string
}

// 前台需要的資料格式
interface FrontendTravelConfig {
  destination: string
  tripDate: string
  countryFlag: string
  title: string
  countries: string[] // 新增：國家列表
  options: {
    showSeconds: boolean
    showWeather: boolean
  }
}

const COLLECTION_NAME = 'trip_countdowns'

/**
 * 資料轉換：後台 → 前台格式
 */
function convertBackendToFrontend(trip: BackendTripCountdown): FrontendTravelConfig {
  const { getCountryFlag } = countryTranslation()
  
  // 取第一個國家作為主要目的地
  const primaryCountry = trip.countries[0] || 'Unknown'
  
  // 建立目的地字串 - 統一為所有國家添加國旗
  const destination = trip.countries.map(country => `${getCountryFlag(country)} ${country}`).join(', ')
  
  return {
    destination,
    tripDate: trip.tripDate,
    countryFlag: getCountryFlag(primaryCountry),
    title: trip.title,
    countries: trip.countries, // 新增：保留完整國家列表
    options: {
      showSeconds: trip.options?.showSeconds ?? true,
      showWeather: trip.options?.showWeather ?? true
    }
  }
}

/**
 * 取得即將到來的旅行清單（前台顯示用）
 * 支援多筆資料，按日期排序
 */
export async function getUpcomingTripsForFrontend(): Promise<FrontendTravelConfig[]> {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    
    // 簡化查詢：只按日期排序
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('tripDate', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    
    // 客戶端過濾和排序
    const validTrips: BackendTripCountdown[] = []
    
    querySnapshot.docs.forEach(doc => {
      const tripData = {
        id: doc.id,
        ...doc.data()
      } as BackendTripCountdown
      
      // 過濾條件：日期未過期 且 狀態為規劃中、即將到來或進行中
      const isValidDate = tripData.tripDate >= today
      const isValidStatus = ['planning', 'upcoming', 'ongoing'].includes(tripData.status)
      
      if (isValidDate && isValidStatus) {
        validTrips.push(tripData)
      }
    })
    
    if (validTrips.length > 0) {
      
      // 轉換為前台格式
      return validTrips.map(trip => convertBackendToFrontend(trip))
    }
    
    return []
  } catch (error) {
    console.error('❌ 取得即將到來的旅行失敗:', error)
    throw error
  }
}

/**
 * 取得單一即將到來的旅行（保留兼容性）
 */
export async function getUpcomingTripForFrontend(): Promise<FrontendTravelConfig | null> {
  const trips = await getUpcomingTripsForFrontend()
  return trips.length > 0 ? trips[0] : null
}

/**
 * 取得所有旅行資料（備用功能）
 */
export async function getAllTripsForFrontend(): Promise<FrontendTravelConfig[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('tripDate', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    
    const trips: FrontendTravelConfig[] = []
    
    querySnapshot.docs.forEach(doc => {
      const tripData = {
        id: doc.id,
        ...doc.data()
      } as BackendTripCountdown
      
      trips.push(convertBackendToFrontend(tripData))
    })
    
    return trips
  } catch (error) {
    console.error('❌ 取得所有旅行失敗:', error)
    throw error
  }
}

// 匯出類型供其他檔案使用
export type { FrontendTravelConfig, BackendTripCountdown, TripOptions }