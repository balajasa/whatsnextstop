// ===================================
// 旅程列表的桌曆設定（TripsPage.vue 用）
// ===================================

/** 桌曆上方色帶：真實日曆常見的顏色，每趟旅程依 ID 固定挑一個 */
export const CALENDAR_COLORS = [
  '#E2557B', // 粉紅
  '#7B2D3B', // 酒紅
  '#E8A200', // 芥末黃
  '#D7362B', // 日曆紅
  '#2E7D5B', // 松綠
  '#3A6EA5', // 鋼藍
  '#E07B39', // 柿橘
  '#6B4E9B', // 葡萄紫
]

/** 同一個 ID 每次都拿到同一個顏色 */
export const calendarColor = (id: string): string => {
  const sum = Array.from(id).reduce((total, char) => total + char.charCodeAt(0), 0)
  return CALENDAR_COLORS[sum % CALENDAR_COLORS.length]
}
