// ===================================
// 首頁的行程手冊區塊設定
// 首頁接 pelipper 之前先保留：開關打開時，首頁的入口卡會連到沒有行程 ID 的詳細行程頁，現在不能打開
// ===================================

/**
 * 行程開關
 * true：首頁顯示行程手冊與 Day 卡
 * false：首頁顯示貓咪卡
 */
export const HAS_ITINERARY = false

// 行程表頁的 Canva 內嵌網址，留空就顯示「下一趟旅程」
export const ITINERARY_CANVA_URL = ''

export interface SectionConfig {
  type: 'info' | 'daily'
  id: string
  name: string
  day?: number
}

export const ITINERARY_SECTIONS: SectionConfig[] = [
  { type: 'info', id: 'cover', name: '封面' },
  { type: 'info', id: 'flight', name: '航班資訊' },
  { type: 'info', id: 'packing', name: '必帶物品' },
  { type: 'info', id: 'map', name: '路線地圖' },
  { type: 'info', id: 'overview', name: '行程總覽' },
  { type: 'daily', id: 'day1', day: 1, name: '第1天' },
  { type: 'daily', id: 'day2', day: 2, name: '第2天' },
  { type: 'daily', id: 'day3', day: 3, name: '第3天' },
  { type: 'daily', id: 'day4', day: 4, name: '第4天' },
  { type: 'daily', id: 'day5', day: 5, name: '第5天' },
  { type: 'daily', id: 'day6', day: 6, name: '第6天' }
]

// 每日行程區塊
export const DAILY_SECTIONS = ITINERARY_SECTIONS.filter((section) => section.type === 'daily')
