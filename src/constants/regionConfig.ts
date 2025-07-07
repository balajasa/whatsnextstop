// constants/regionConfig.ts

/**
 * 國家名稱變體對應表
 * 處理各種國家名稱的變體和 ISO 代碼對應
 */
export const COUNTRY_NAME_VARIANTS: Record<string, string> = {
  philippines: 'PH',
  indonesia: 'ID',
  japan: 'JP',
  thailand: 'TH',
  singapore: 'SG',
  malaysia: 'MY',
  vietnam: 'VN',
  cambodia: 'KH',
  myanmar: 'MM',
  laos: 'LA',
  'south korea': 'KR',
  korea: 'KR',
  taiwan: 'TW',
  china: 'CN',
  'hong kong': 'HK',
  macau: 'MO',
  'united states': 'US',
  usa: 'US',
  america: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  britain: 'GB',
  england: 'GB',
  turkey: 'TR',
  türkiye: 'TR',
  turkiye: 'TR',
  ph: 'PH',
  id: 'ID',
  jp: 'JP',
  th: 'TH',
  sg: 'SG',
  my: 'MY',
  vn: 'VN',
  kh: 'KH',
  mm: 'MM',
  la: 'LA',
  kr: 'KR',
  tw: 'TW',
  cn: 'CN',
  hk: 'HK',
  mo: 'MO',
  us: 'US',
  gb: 'GB',
  gu: 'GU',
  guam: 'GU',
  tr: 'TR'
}

/**
 * 地區顯示資訊介面
 */
export interface RegionDisplayInfo {
  flagCode: string
  displayName: string
}

/**
 * 這些城市需要顯示自己的旗幟，而不是所屬國家的旗幟
 */
export const CITY_TO_FLAG_MAP: Record<string, RegionDisplayInfo> = {
  hongkong: {
    flagCode: 'HK',
    displayName: '香港'
  },
  macao: {
    flagCode: 'MO',
    displayName: '澳門'
  }
}

/**
 * 城市名稱變體對應表
 */
export const CITY_NAME_VARIANTS: Record<string, string> = {
  'hong kong': 'hongkong',
  hongkong: 'hongkong',
  hk: 'hongkong',
  香港: 'hongkong',
  macao: 'macao',
  macau: 'macao',
  mo: 'macao',
  澳門: 'macao',
  澳门: 'macao'
}

/**
 * 取得所有特例城市清單
 */
export const getSpecialCities = (): string[] => {
  return Object.keys(CITY_TO_FLAG_MAP)
}

/**
 * 城市名稱正規化函數
 * 將各種格式的城市名稱轉換為標準格式
 */
export const normalizeCityName = (cityName: string): string => {
  return cityName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '') // 移除所有空格
    .replace(/[^\w]/g, '') // 移除特殊字符
}

/**
 * 檢查是否為特例城市
 */
export const isSpecialCity = (city: string): boolean => {
  const normalizedCity = normalizeCityName(city)
  const standardCity = CITY_NAME_VARIANTS[normalizedCity] || normalizedCity
  return standardCity in CITY_TO_FLAG_MAP
}

/**
 * 取得特例城市的顯示資訊
 */
export const getSpecialCityInfo = (city: string): RegionDisplayInfo | null => {
  const normalizedCity = normalizeCityName(city)
  const standardCity = CITY_NAME_VARIANTS[normalizedCity] || normalizedCity
  return CITY_TO_FLAG_MAP[standardCity] || null
}

/**
 * 取得國家代碼對應
 */
export const getCountryCode = (countryName: string): string | null => {
  const normalizedName = countryName.toLowerCase().trim()
  return COUNTRY_NAME_VARIANTS[normalizedName] || null
}
