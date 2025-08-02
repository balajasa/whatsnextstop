// constants/regionConfig.ts

/**
 * 地圖資料中的國家名稱對應表
 * 處理正式國名與地圖資料名稱不一致的問題
 */
export const MAP_ENGLISH_NAMES: Record<string, string> = {
  CN: 'China', // 而不是 People's Republic of China
  TR: 'Turkey', // 而不是 Türkiye
  GU: 'Guam' // 關島
}

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
  hongkong: 'HK',
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
 * 手動座標配置(地圖標示用)
 */
export const MANUAL_COORDINATES: Record<string, [number, number]> = {
  // 美國領土
  guam: [144.7937, 13.4443],
  'puerto rico': [-66.590149, 18.220833],
  'us virgin islands': [-64.896335, 17.7539],
  'american samoa': [-170.132217, -14.270972],

  // 英國領土
  bermuda: [-64.7505, 32.3078],
  'cayman islands': [-81.2546, 19.3133],
  'british virgin islands': [-64.639968, 18.420695],

  // 法國領土
  'french polynesia': [-149.406843, -17.679742],
  'new caledonia': [165.618042, -20.904305],

  // 荷蘭領土
  aruba: [-69.968338, 12.52111],
  curacao: [-68.99002, 12.16957],

  // 其他特殊地區
  gibraltar: [-5.353585, 36.140751],
  'faroe islands': [-6.911806, 61.892635],

  // 特別行政區-為了讓地圖能顯示，所以硬改
  hongkong: [113, 22.3193], // 正確經緯度: (114.1694, 22.3193)
  macao: [108, 22.1987] // 正確經緯度: (113.5439, 22.1987)
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

/**
 * 檢查是否需要使用手動座標
 */
export const needsManualCoordinates = (country: string): boolean => {
  return country.toLowerCase() in MANUAL_COORDINATES
}

/**
 * 獲取手動座標
 */
export const getManualCoordinates = (country: string): [number, number] | null => {
  return MANUAL_COORDINATES[country.toLowerCase()] || null
}
