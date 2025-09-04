// ===================================
// 景點資料服務
// ===================================

import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { countryTranslation } from '../../translation/composables/countryTranslation'
import type {
  Spot,
  SpotFilters,
  SpotsResponse,
  SpotSearchParams,
  FormattedSpot,
  CategoryOption,
  CountryOption
} from '../../types/spots/spots'

const COLLECTION_NAME = 'spots'

// 景點類別選項配置
export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: '', label: '全部類別' },
  { value: '景點', label: '景點' },
  { value: '美食', label: '美食' },
  { value: '住宿', label: '住宿' },
  { value: '購物', label: '購物' },
  { value: '交通', label: '交通' }
]

/**
 * 根據旅程 ID 取得景點資料
 */
export async function getSpotsByTrip(tripId: string): Promise<Spot[]> {
  try {
    const spotsRef = collection(db, 'trips', tripId, 'spots')
    const querySnapshot = await getDocs(spotsRef)

    const spots: Spot[] = []
    querySnapshot.docs.forEach(doc => {
      spots.push({
        id: doc.id,
        ...doc.data()
      } as Spot)
    })

    // 客戶端排序
    spots.sort((a, b) => {
      if (a.country !== b.country) {
        return a.country.localeCompare(b.country)
      }
      return a.name.localeCompare(b.name)
    })

    return spots
  } catch (error) {
    console.error(`取得旅程 ${tripId} 的景點資料失敗:`, error)
    throw error
  }
}

/**
 * 取得所有景點資料（向下相容用，從所有旅程聚合）
 */
export async function getAllSpots(): Promise<Spot[]> {
  try {
    // 這個函數現在需要先取得所有旅程，再聚合景點
    // 暫時保留原邏輯，但建議改用 getSpotsByTrip
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))

    const spots: Spot[] = []
    querySnapshot.docs.forEach(doc => {
      spots.push({
        id: doc.id,
        ...doc.data()
      } as Spot)
    })

    // 客戶端排序
    spots.sort((a, b) => {
      if (a.country !== b.country) {
        return a.country.localeCompare(b.country)
      }
      return a.name.localeCompare(b.name)
    })

    return spots
  } catch (error) {
    console.error('取得景點資料失敗:', error)
    throw error
  }
}

/**
 * 根據國家取得景點資料
 */
export async function getSpotsByCountry(country: string): Promise<Spot[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('country', '==', country))

    const querySnapshot = await getDocs(q)

    const spots: Spot[] = []
    querySnapshot.docs.forEach(doc => {
      spots.push({
        id: doc.id,
        ...doc.data()
      } as Spot)
    })

    // 客戶端排序
    spots.sort((a, b) => a.name.localeCompare(b.name))

    return spots
  } catch (error) {
    console.error(`取得 ${country} 景點資料失敗:`, error)
    throw error
  }
}

/**
 * 搜尋景點資料
 */
export async function searchSpots(params: SpotSearchParams): Promise<SpotsResponse> {
  try {
    // 先取得所有資料，再進行客戶端篩選
    const allSpots = await getAllSpots()

    let filteredSpots = allSpots

    // 國家篩選
    if (params.country) {
      filteredSpots = filteredSpots.filter(spot => spot.country === params.country)
    }

    // 類別篩選
    if (params.category) {
      filteredSpots = filteredSpots.filter(spot => spot.category === params.category)
    }

    // 關鍵字搜尋
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredSpots = filteredSpots.filter(
        spot =>
          spot.name.toLowerCase().includes(keyword) ||
          spot.description.toLowerCase().includes(keyword) ||
          spot.region.toLowerCase().includes(keyword) ||
          spot.notes.toLowerCase().includes(keyword)
      )
    }

    // 分頁處理
    const totalCount = filteredSpots.length
    if (params.limit && params.offset !== undefined) {
      const start = params.offset
      const end = start + params.limit
      filteredSpots = filteredSpots.slice(start, end)
    }

    // 取得所有國家列表
    const countries = [...new Set(allSpots.map(spot => spot.country))].sort()

    return {
      spots: filteredSpots,
      countries,
      totalCount
    }
  } catch (error) {
    console.error('搜尋景點失敗:', error)
    throw error
  }
}

/**
 * 取得國家選項列表
 */
export async function getCountryOptions(): Promise<CountryOption[]> {
  try {
    const spots = await getAllSpots()
    const countries = [...new Set(spots.map(spot => spot.country))].sort()
    const { getCountryFlag } = countryTranslation()

    const options: CountryOption[] = [{ value: '', label: '全部國家', flag: '🌍' }]

    countries.forEach(country => {
      options.push({
        value: country,
        label: country,
        flag: getCountryFlag(country) // 現在支援中文輸入
      })
    })

    return options
  } catch (error) {
    console.error('取得國家選項失敗:', error)
    throw error
  }
}

/**
 * 格式化景點資料供顯示使用
 */
export function formatSpotForDisplay(spot: Spot): FormattedSpot {
  // 格式化價格顯示
  let displayPrice = '未設定'

  if (spot.ticketPrice === 0) {
    displayPrice = '免費'
  } else if (spot.ticketPrice && spot.currency) {
    displayPrice = `${spot.currency} ${spot.ticketPrice}`
  } else if (spot.ticketPrice && !spot.currency) {
    displayPrice = `${spot.ticketPrice}`
  }

  // 格式化營業時間
  const displayHours = spot.businessHours === '24hr' ? '24小時開放' : spot.businessHours || '未設定'

  return {
    ...spot,
    displayPrice,
    displayHours,
    hasMap: !!spot.googleMapUrl
  }
}

/**
 * 客戶端篩選景點資料
 */
export function filterSpotsLocally(spots: Spot[], filters: SpotFilters): Spot[] {
  return spots.filter(spot => {
    // 國家篩選
    if (filters.country && spot.country !== filters.country) {
      return false
    }

    // 類別篩選
    if (filters.category && spot.category !== filters.category) {
      return false
    }

    // 關鍵字搜尋
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      return (
        spot.name.toLowerCase().includes(keyword) ||
        spot.description.toLowerCase().includes(keyword) ||
        spot.region.toLowerCase().includes(keyword) ||
        spot.notes.toLowerCase().includes(keyword)
      )
    }

    return true
  })
}

// 匯出類型供其他檔案使用
export type { Spot, SpotFilters, SpotsResponse, FormattedSpot } from '../../types/spots/spots'
