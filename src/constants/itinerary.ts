// ===================================
// 行程手冊區塊設定（首頁與詳細行程頁共用）
// ===================================

/**
 * 行程開關
 * true：首頁顯示行程手冊與 Day 卡，詳細行程頁顯示內容
 * false：首頁顯示貓咪卡，詳細行程頁顯示 Coming Soon
 */
export const HAS_ITINERARY = false

export interface SectionConfig {
  type: 'info' | 'daily'
  id: string
  name: string
  pages: string[]
  day?: number
}

export const ITINERARY_SECTIONS: SectionConfig[] = [
  { type: 'info', id: 'cover', name: '封面', pages: ['page1'] },
  { type: 'info', id: 'flight', name: '航班資訊', pages: ['page2'] },
  { type: 'info', id: 'packing', name: '必帶物品', pages: ['page3', 'page4'] },
  { type: 'info', id: 'map', name: '路線地圖', pages: ['page5'] },
  { type: 'info', id: 'overview', name: '行程總覽', pages: ['page6'] },
  { type: 'daily', id: 'day1', day: 1, name: '第1天', pages: ['page7', 'page8'] },
  { type: 'daily', id: 'day2', day: 2, name: '第2天', pages: ['page9'] },
  { type: 'daily', id: 'day3', day: 3, name: '第3天', pages: ['page10'] },
  { type: 'daily', id: 'day4', day: 4, name: '第4天', pages: ['page11'] },
  { type: 'daily', id: 'day5', day: 5, name: '第5天', pages: ['page12'] },
  { type: 'daily', id: 'day6', day: 6, name: '第6天', pages: ['page13'] }
]

/** 每日行程區塊 */
export const DAILY_SECTIONS = ITINERARY_SECTIONS.filter((section) => section.type === 'daily')
