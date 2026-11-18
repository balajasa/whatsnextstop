// ===================================
// pelipper 行程列表：Firebase 的 pelipper/<行程 ID>，後台（gengar）打開「前台顯示」的才列出來
// 行程內容由 pelipper 套件自己讀，這裡只拿列表要用的欄位
// ===================================

import { collection, getDocs, query, where } from 'firebase/firestore'
import type { Trip } from '@pelipper/pelipper'
import { db } from '../../firebase'

const COLLECTION_NAME = 'pelipper'

export type PelipperTripSummary = Pick<Trip, 'id' | 'title' | 'startDate' | 'endDate'>

export async function getSiteTrips(): Promise<PelipperTripSummary[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION_NAME), where('showOnSite', '==', true)))
  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as Partial<Trip>
      return { id: doc.id, title: data.title ?? '', startDate: data.startDate ?? '', endDate: data.endDate ?? '' }
    })
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
}
