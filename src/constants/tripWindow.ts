// ===================================
// 首頁飛機窗的設定（TripWindowCard.vue、useSky.ts 用）
// ===================================

/**
 * 時區 → 代表地點的緯度、經度，用來算當地的日出日落
 * 沒列到的時區用固定時段，去新的地方前想讓窗外準一點再加一行
 */
export const TIMEZONE_COORDS: Record<string, [number, number]> = {
  'Asia/Taipei': [25.03, 121.56],
  'Asia/Tokyo': [35.68, 139.69],
  'Asia/Seoul': [37.57, 126.98],
  'Asia/Hong_Kong': [22.32, 114.17],
  'Asia/Macau': [22.2, 113.54],
  'Asia/Macao': [22.2, 113.54],
  'Asia/Kuala_Lumpur': [3.14, 101.69],
  'Asia/Ho_Chi_Minh': [10.82, 106.63],
  'Asia/Saigon': [10.82, 106.63],
  'Asia/Manila': [14.6, 120.98],
  'Pacific/Guam': [13.44, 144.79],
  'Asia/Jakarta': [-6.21, 106.85],
  'Asia/Makassar': [-8.65, 115.22],
  'Europe/Istanbul': [41.01, 28.98],
  // 芬蘭全國同一個時區；去芬蘭主要在拉普蘭，用羅瓦涅米
  'Europe/Helsinki': [66.5, 25.73],
  'Europe/Tallinn': [59.44, 24.75],
  'Europe/Stockholm': [59.33, 18.07],
}

/** 夜晚會出現極光的國家（行程去了其中一國，夜晚的窗外就有極光） */
export const AURORA_COUNTRIES = ['NO', 'SE', 'FI', 'IS', 'GL', 'FO']
