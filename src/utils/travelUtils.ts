import type { TravelData } from '../types/response'

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
