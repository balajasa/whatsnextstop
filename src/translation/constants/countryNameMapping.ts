// ===================================
// 國家名稱對應表
// ===================================

/**
 * 地圖資料中的國家名稱對應表
 * 處理正式國名與地圖資料名稱不一致的問題
 */
export const MAP_ENGLISH_NAMES: Record<string, string> = {
  CN: 'China', // 而不是 People's Republic of China
  TR: 'Turkey', // 而不是 Türkiye
  GU: 'Guam', // 關島
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
  tr: 'TR',
}
