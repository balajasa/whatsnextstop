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
 * 手動座標配置(地圖標示用) - 格式：[緯度, 經度]
 */
export const MANUAL_COORDINATES: Record<string, [number, number]> = {
  // 美國領土
  guam: [13.4443, 144.7937],
  'puerto rico': [18.220833, -66.590149],
  'us virgin islands': [17.7539, -64.896335],
  'american samoa': [-14.270972, -170.132217],

  // 英國領土
  bermuda: [32.3078, -64.7505],
  'cayman islands': [19.3133, -81.2546],
  'british virgin islands': [18.420695, -64.639968],

  // 法國領土
  'french polynesia': [-17.679742, -149.406843],
  'new caledonia': [-20.904305, 165.618042],

  // 荷蘭領土
  aruba: [12.52111, -69.968338],
  curacao: [12.16957, -68.99002],

  // 其他特殊地區
  gibraltar: [36.140751, -5.353585],
  'faroe islands': [61.892635, -6.911806],

  // 特別行政區-使用市中心座標而非地理中心
  hongkong: [22.2783, 114.1747], // 香港島中心
  macao: [22.1987, 113.5439], // 澳門市中心

  // 城市國家-使用市中心座標
  singapore: [1.3521, 103.8198] // 新加坡市中心
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

/**
 * 從 GeoJSON Feature 計算幾何中心點
 * @param feature GeoJSON Feature 物件
 * @returns [lat, lng] 座標或 null (為了統一專案格式，緯度在前)
 */
export const calculateFeatureCentroid = (feature: any): [number, number] | null => {
  if (!feature || !feature.geometry) {
    return null
  }

  try {
    // 注意：GeoJSON 原始格式是 [lng, lat]，但這裡為了統一專案格式回傳 [lat, lng]
    const geometry = feature.geometry
    
    if (geometry.type === 'Polygon') {
      return calculatePolygonCentroid(geometry.coordinates[0])
    } else if (geometry.type === 'MultiPolygon') {
      // 取最大的 Polygon 來計算中心點
      let largestPolygon = geometry.coordinates[0][0]
      let largestArea = 0
      
      geometry.coordinates.forEach((polygon: number[][][]) => {
        const area = calculatePolygonArea(polygon[0])
        if (area > largestArea) {
          largestArea = area
          largestPolygon = polygon[0]
        }
      })
      
      return calculatePolygonCentroid(largestPolygon)
    }
    
    return null
  } catch (error) {
    console.warn('計算幾何中心點失敗:', error)
    return null
  }
}

/**
 * 計算 Polygon 的中心點（重心）
 * @param coordinates Polygon 座標陣列 [[lng, lat], ...] (GeoJSON 標準格式)
 * @returns [lat, lng] 座標 (為了統一專案格式，改為緯度在前)
 */
function calculatePolygonCentroid(coordinates: number[][]): [number, number] {
  let x = 0
  let y = 0
  let area = 0
  
  for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
    const xi = coordinates[i][0]  // 經度 (GeoJSON 格式)
    const yi = coordinates[i][1]  // 緯度 (GeoJSON 格式)
    const xj = coordinates[j][0]
    const yj = coordinates[j][1]
    
    const a = xi * yj - xj * yi
    area += a
    x += (xi + xj) * a
    y += (yi + yj) * a
  }
  
  area *= 0.5
  x /= (6.0 * area)  // 計算得出的是經度
  y /= (6.0 * area)  // 計算得出的是緯度
  
  // 注意：為了統一專案格式 [lat, lng]，這裡故意交換順序回傳
  return [y, x]  // [緯度, 經度] - 與 GeoJSON 標準 [lng, lat] 相反
}

/**
 * 計算 Polygon 面積（用於找出 MultiPolygon 中最大的 Polygon）
 * @param coordinates Polygon 座標陣列
 * @returns 面積值
 */
function calculatePolygonArea(coordinates: number[][]): number {
  let area = 0
  
  for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
    const xi = coordinates[i][0]
    const yi = coordinates[i][1]
    const xj = coordinates[j][0]
    const yj = coordinates[j][1]
    
    area += xi * yj - xj * yi
  }
  
  return Math.abs(area) / 2
}

/**
 * 從 WorldData 中查找國家並計算中心點
 * @param countryName 國家名稱
 * @param worldData GeoJSON 世界地圖資料
 * @returns [lat, lng] 座標或 null (為了統一專案格式，緯度在前)
 */
export const getCountryCoordinatesFromGeoJSON = (
  countryName: string, 
  worldData: any
): [number, number] | null => {
  if (!worldData || !worldData.features) {
    return null
  }

  // 先嘗試從手動座標取得 (已經是 [lat, lng] 格式)
  const manualCoords = getManualCoordinates(countryName)
  if (manualCoords) {
    return manualCoords
  }

  // 標準化國家名稱進行比對
  const normalizedCountryName = countryName.toLowerCase().trim()
  
  // 在 GeoJSON 中查找對應的國家 Feature
  const countryFeature = worldData.features.find((feature: any) => {
    const featureName = (feature.properties?.name || feature.properties?.NAME || '').toLowerCase()
    
    // 完全匹配
    if (featureName === normalizedCountryName) {
      return true
    }
    
    // 部分匹配（處理國家名稱變體）
    if (featureName.includes(normalizedCountryName) || normalizedCountryName.includes(featureName)) {
      return true
    }
    
    return false
  })

  if (countryFeature) {
    return calculateFeatureCentroid(countryFeature)
  }

  console.warn(`❌ 無法在 GeoJSON 中找到國家: ${countryName}`)
  return null
}
