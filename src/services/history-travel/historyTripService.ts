// services/history-travel/historyTripService.ts
import { collection, getDocs, doc, getDoc, query, orderBy, where, limit } from 'firebase/firestore'
import { db } from '@/firebase'
import type { HistoryTrip } from '@/types/history-travel/travel-history'

const COLLECTION_NAME = 'history_trips'

/**
 * Firebase HistoryTrip 資料服務
 * 提供從 Firebase Firestore 讀取旅程資料的功能
 */
export class HistoryTripService {
  /**
   * 獲取所有歷史旅程資料
   * @returns Promise<HistoryTrip[]>
   */
  static async fetchAllTrips(): Promise<HistoryTrip[]> {
    try {
      const tripsRef = collection(db, COLLECTION_NAME)
      const tripsQuery = query(tripsRef, orderBy('date.startDate', 'desc'))
      const querySnapshot = await getDocs(tripsQuery)

      const trips: HistoryTrip[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<HistoryTrip, 'id'>),
      }))

      return trips
    } catch (error) {
      throw new Error('無法載入旅程資料，請檢查網路連線或重試')
    }
  }

  /**
   * 根據 ID 獲取單一旅程
   * @param id - 旅程 ID
   * @returns Promise<HistoryTrip | null>
   */
  static async fetchTripById(id: string): Promise<HistoryTrip | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as HistoryTrip
      } else {
        console.warn(`⚠️ 找不到 ID 為 ${id} 的旅程`)
        return null
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * 根據年份獲取旅程
   * @param year - 年份 (如: 2024)
   * @returns Promise<HistoryTrip[]>
   */
  static async fetchTripsByYear(year: number): Promise<HistoryTrip[]> {
    try {
      const tripsRef = collection(db, COLLECTION_NAME)
      const startOfYear = `${year}-01-01`
      const endOfYear = `${year}-12-31`

      const tripsQuery = query(
        tripsRef,
        where('date.startDate', '>=', startOfYear),
        where('date.startDate', '<=', endOfYear),
        orderBy('date.startDate', 'desc'),
      )

      const querySnapshot = await getDocs(tripsQuery)

      const trips: HistoryTrip[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<HistoryTrip, 'id'>),
      }))

      return trips
    } catch (error) {
      throw error
    }
  }

  /**
   * 獲取最近的 N 筆旅程
   * @param limitCount - 限制筆數
   * @returns Promise<HistoryTrip[]>
   */
  static async fetchRecentTrips(limitCount: number = 10): Promise<HistoryTrip[]> {
    try {
      const tripsRef = collection(db, COLLECTION_NAME)
      const tripsQuery = query(tripsRef, orderBy('date.startDate', 'desc'), limit(limitCount))

      const querySnapshot = await getDocs(tripsQuery)

      const trips: HistoryTrip[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<HistoryTrip, 'id'>),
      }))

      return trips
    } catch (error) {
      throw error
    }
  }

  /**
   * 獲取所有不重複的國家列表
   * @returns Promise<string[]>
   */
  static async fetchAllCountries(): Promise<string[]> {
    try {
      const trips = await this.fetchAllTrips()
      const countries = new Set<string>()

      trips.forEach((trip) => {
        trip.destinations.forEach((dest) => {
          countries.add(dest.country)
        })
      })

      return Array.from(countries).sort()
    } catch (error) {
      throw error
    }
  }

  /**
   * 獲取所有年份列表
   * @returns Promise<number[]>
   */
  static async fetchAllYears(): Promise<number[]> {
    try {
      const trips = await this.fetchAllTrips()
      const years = new Set<number>()

      trips.forEach((trip) => {
        const year = new Date(trip.date.startDate).getFullYear()
        years.add(year)
      })

      return Array.from(years).sort((a, b) => b - a) // 降序排列
    } catch (error) {
      throw error
    }
  }
}
