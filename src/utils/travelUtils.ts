import type { TravelData } from '../types/response'

/**
 * 格式化日期範圍
 * @param startDate 開始日期 (MM-DD)
 * @param endDate 結束日期 (MM-DD)
 * @returns 格式化後的日期範圍字符串
 */
export function formatDateRange(startDate: string, endDate: string): string {
  return `${startDate.replace('-', '/')}/${endDate.replace('-', '/')}`
}

/**
 * 計算旅行天數
 * @param startDate 開始日期 (MM-DD)
 * @param endDate 結束日期 (MM-DD)
 * @param year 年份，默認為2024
 * @returns 旅行天數
 */
export function calculateDays(startDate: string, endDate: string, year: number = 2024): number {
  const [startMonth, startDay] = startDate.split('-').map(Number)
  const [endMonth, endDay] = endDate.split('-').map(Number)

  const start = new Date(year, startMonth - 1, startDay)
  const end = new Date(year, endMonth - 1, endDay)

  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

/**
 * 格式化地點顯示
 * @param travel 旅行資料
 * @returns 格式化後的地點字符串
 */
export function formatLocations(travel: TravelData): string {
  return travel.cityTW?.join('、') || travel.city.join('、')
}

/**
 * 開啟照片
 * @param url 照片URL
 */
export function openPhoto(url: string): void {
  window.open(url, '_blank')
}