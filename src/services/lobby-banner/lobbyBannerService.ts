// ===================================
// src/services/lobby-banner/lobbyBannerService.ts
// 前台 Lobby Banner 服務層
// ===================================

import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'

// ============================
// TypeScript 類型定義
// ============================

export interface LobbyBanner {
  id?: string
  title: string
  imageUrl: string
  link: string
  order: number
  isActive: boolean
  createdAt: any
  updatedAt: any
}

const COLLECTION_NAME = 'lobby_banner'

// ============================
// API 函數
// ============================

/**
 * 取得所有啟用中的 Lobby Banner（依順序排列）
 */
export const getActiveLobbyBanners = async (): Promise<LobbyBanner[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LobbyBanner[]
  } catch (error) {
    console.error('取得 Lobby Banner 失敗:', error)
    throw error
  }
}
