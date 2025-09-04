// ===================================
// 旅程資料服務
// ===================================

import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import { db } from '../../firebase'

// 旅程介面定義
export interface Trip {
  id: string
  name: string
  startDate?: string // 旅行開始日期
  endDate?: string // 旅行結束日期
  createdAt: string // 系統建立時間
  updatedAt?: string // 系統更新時間
  // 其他旅程相關欄位可以在這裡擴展
}

// 帶有短 ID 的旅程介面
export interface TripWithShortId extends Trip {
  shortId: string
}

const TRIPS_COLLECTION = 'trips'

/**
 * 取得所有旅程列表
 */
export async function getAllTrips(): Promise<Trip[]> {
  try {
    const tripsRef = collection(db, TRIPS_COLLECTION)
    const q = query(tripsRef, orderBy('updatedAt', 'desc'))
    const querySnapshot = await getDocs(q)

    const trips: Trip[] = []
    querySnapshot.docs.forEach(doc => {
      trips.push({
        id: doc.id,
        ...doc.data()
      } as Trip)
    })

    return trips
  } catch (error) {
    console.error('取得旅程列表失敗:', error)
    throw error
  }
}

/**
 * 取得帶有短 ID 的旅程列表
 */
export async function getAllTripsWithShortId(): Promise<TripWithShortId[]> {
  try {
    const trips = await getAllTrips()

    return trips.map(trip => ({
      ...trip,
      shortId: generateShortId(trip.id)
    }))
  } catch (error) {
    console.error('取得旅程列表失敗:', error)
    throw error
  }
}

/**
 * 根據短 ID 查找完整的旅程資料
 */
export async function findTripByShortId(shortId: string): Promise<Trip | null> {
  try {
    const tripsRef = collection(db, TRIPS_COLLECTION)
    // 使用前綴查詢找到符合短 ID 的旅程
    const q = query(
      tripsRef,
      where('__name__', '>=', shortId),
      where('__name__', '<', shortId + '\uf8ff')
    )

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    // 取第一個符合的結果
    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as Trip
  } catch (error) {
    console.error(`根據短 ID ${shortId} 查找旅程失敗:`, error)
    throw error
  }
}

/**
 * 根據完整 ID 取得旅程資料
 */
export async function getTripById(tripId: string): Promise<Trip | null> {
  try {
    const tripsRef = collection(db, TRIPS_COLLECTION)
    const q = query(tripsRef, where('__name__', '==', tripId))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as Trip
  } catch (error) {
    console.error(`取得旅程 ${tripId} 失敗:`, error)
    throw error
  }
}

/**
 * 產生短 ID（取前8碼）
 */
export function generateShortId(firebaseId: string): string {
  return firebaseId.substring(0, 8)
}

/**
 * 產生旅程的景點頁面 URL
 */
export function generateTripSpotsUrl(trip: Trip): string {
  const shortId = generateShortId(trip.id)
  return `/trips/${shortId}/spots`
}

/**
 * 根據短 ID 產生景點頁面 URL
 */
export function generateSpotsUrlFromShortId(shortId: string): string {
  return `/trips/${shortId}/spots`
}
