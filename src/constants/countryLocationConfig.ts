// ===================================
// src/config/countryLocationConfig.ts
// 旅行倒數元件設定檔
// ===================================

export const countryLocationConfig = {
  destination: 'Oslo, Norway', // 目的地城市, 國家
  tripDate: '2026-12-25', // 旅行日期（ISO 8601 格式：YYYY-MM-DD）
  countryFlag: '🇳🇴', // 國家旗幟 emoji
  title: '北歐聖誕之旅', // 自訂標題
  // 顯示選項
  options: {
    showSeconds: true, // 是否顯示秒數
    showWeather: true, // 是否顯示天氣
    showProgress: true // 是否顯示進度條
  }
}

// 常見城市座標預設庫（備用，加快查詢速度）
export const cityCoordinates = {
  // 歐洲
  'Oslo, Norway': { lat: 59.9139, lon: 10.7522 },
  'Stockholm, Sweden': { lat: 59.3293, lon: 18.0686 },
  'Copenhagen, Denmark': { lat: 55.6761, lon: 12.5683 },
  'Helsinki, Finland': { lat: 60.1699, lon: 24.9384 },
  'Paris, France': { lat: 48.8566, lon: 2.3522 },
  'London, UK': { lat: 51.5074, lon: -0.1278 },
  'Berlin, Germany': { lat: 52.52, lon: 13.405 },
  'Rome, Italy': { lat: 41.9028, lon: 12.4964 },
  'Madrid, Spain': { lat: 40.4168, lon: -3.7038 },
  'Amsterdam, Netherlands': { lat: 52.3676, lon: 4.9041 },

  // 亞洲
  'Tokyo, Japan': { lat: 35.6762, lon: 139.6503 },
  'Seoul, South Korea': { lat: 37.5665, lon: 126.978 },
  'Bangkok, Thailand': { lat: 13.7563, lon: 100.5018 },
  Singapore: { lat: 1.3521, lon: 103.8198 },
  'Hong Kong': { lat: 22.3193, lon: 114.1694 },
  Macau: { lat: 22.1987, lon: 113.5439 },
  'Taipei, Taiwan': { lat: 25.033, lon: 121.5654 },

  // 美洲
  'New York, USA': { lat: 40.7128, lon: -74.006 },
  'Los Angeles, USA': { lat: 34.0522, lon: -118.2437 },
  'Toronto, Canada': { lat: 43.6532, lon: -79.3832 },
  'Vancouver, Canada': { lat: 49.2827, lon: -123.1207 },

  // 大洋洲
  'Sydney, Australia': { lat: -33.8688, lon: 151.2093 },
  'Melbourne, Australia': { lat: -37.8136, lon: 144.9631 },
  'Auckland, New Zealand': { lat: -36.8485, lon: 174.7633 }
}
