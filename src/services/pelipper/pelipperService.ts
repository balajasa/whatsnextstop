// ===================================
// pelipper 行程列表：Firebase 的 pelipper/<行程 ID>，後台（gengar）打開「前台顯示」的才列出來
// 行程內容由 pelipper 套件自己讀，這裡只拿列表要用的欄位
// ===================================

import { collection, getDocs, query, where } from 'firebase/firestore'
import type { Trip } from '@pelipper/pelipper'
import { db } from '../../firebase'

const COLLECTION_NAME = 'pelipper'

export type PelipperTripSummary = Pick<Trip, 'id' | 'title' | 'startDate' | 'endDate'> & {
  /** 行程地點、路線城市的國家代碼（不重複），首頁飛機窗用來判斷是不是北歐 */
  countries: string[]
  /** 後台連結的景點旅程（trips/{id}）；旅程列表用來把行程和景點放在同一張桌曆，沒連結是空字串 */
  spotsTripId: string
}

const collectCountries = (data: Partial<Trip>): string[] => {
  const codes = [
    ...(data.places ?? []).map((place) => place.country),
    ...(data.routeMap?.cities ?? []).map((city) => city.country),
  ]
  return [...new Set(codes.filter(Boolean))]
}

export async function getSiteTrips(): Promise<PelipperTripSummary[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION_NAME), where('showOnSite', '==', true)))
  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as Partial<Trip> & { spotsTripId?: unknown }
      return {
        id: doc.id,
        title: data.title ?? '',
        startDate: data.startDate ?? '',
        endDate: data.endDate ?? '',
        countries: collectCountries(data),
        spotsTripId: typeof data.spotsTripId === 'string' ? data.spotsTripId : '',
      }
    })
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
}
