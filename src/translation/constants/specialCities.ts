// ===================================
// 特例城市資訊
// ===================================

/**
 * 地區顯示資訊介面
 */
export interface RegionDisplayInfo {
  flagCode: string
  displayName: string
}

/**
 * 這些城市需要顯示自己的旗幟，而不是所屬國家的旗幟 (內部使用)
 */
const CITY_TO_FLAG_MAP: Record<string, RegionDisplayInfo> = {
  hongkong: {
    flagCode: 'HK',
    displayName: '香港',
  },
  macao: {
    flagCode: 'MO',
    displayName: '澳門',
  },
}

/**
 * 城市名稱變體對應表
 */
const CITY_NAME_VARIANTS: Record<string, string> = {
  'hong kong': 'hongkong',
  hongkong: 'hongkong',
  hk: 'hongkong',
  香港: 'hongkong',
  macao: 'macao',
  macau: 'macao',
  mo: 'macao',
  澳門: 'macao',
  澳门: 'macao',
}

/**
 * 城市名稱正規化函數 (內部使用)
 */
function normalizeCityName(cityName: string): string {
  return cityName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '') // 移除所有空格
    .replace(/[^\w]/g, '') // 移除特殊字符
}

/**
 * 取得特例城市的顯示資訊
 */
export const getSpecialCityInfo = (city: string): RegionDisplayInfo | null => {
  const normalizedCity = normalizeCityName(city)
  const standardCity = CITY_NAME_VARIANTS[normalizedCity] || normalizedCity
  return CITY_TO_FLAG_MAP[standardCity] || null
}