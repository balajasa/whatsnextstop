// ===================================
// 旅程回顧服務
// ===================================

import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore'
import { db } from '../../firebase'

export interface HistoryJournal {
  id?: string
  title: string
  journalLink: string
  coverImageUrl?: string
  isPublished: boolean
  order: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
  createdBy?: string
}

const COLLECTION_NAME = 'history_journals'

/**
 * 取得所有已發布的旅程回顧（按順序排列）
 */
export async function getPublishedJournals(): Promise<HistoryJournal[]> {
  try {
    // 只用 orderBy，在客戶端過濾 isPublished（避免需要複合索引）
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('order', 'asc')
    )

    const querySnapshot = await getDocs(q)

    // 客戶端過濾已發布的旅程
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as HistoryJournal)
      .filter(journal => journal.isPublished === true)
  } catch (error) {
    console.error('載入旅程回顧失敗:', error)
    throw error
  }
}

/**
 * 取得所有旅程回顧（包含未發布，管理後台用）
 */
export async function getAllJournals(): Promise<HistoryJournal[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('order', 'asc')
    )

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HistoryJournal[]
  } catch (error) {
    console.error('載入所有旅程回顧失敗:', error)
    throw error
  }
}
