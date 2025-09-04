// ===================================
// 國家翻譯 Composable
// ===================================

import countries from 'i18n-iso-countries'
import zhTW from 'i18n-iso-countries/langs/zh.json'
import enLocale from 'i18n-iso-countries/langs/en.json'
import { COUNTRY_NAME_VARIANTS, MAP_ENGLISH_NAMES } from '../constants/countryNameMapping'
import { TRADITIONAL_CHINESE_OVERRIDES } from '../constants/countryDisplay'

// 初始化語言包（只初始化一次）
let isInitialized = false
const initializeLocale = () => {
  if (!isInitialized) {
    countries.registerLocale(zhTW)
    countries.registerLocale(enLocale)
    isInitialized = true
  }
}

/**
 * 國家翻譯 Composable
 * 城市翻譯由 API 資料提供，不在此處理
 */
export const countryTranslation = () => {
  // 初始化語言包
  initializeLocale()

  // 動態快取，避免重複查詢
  const countryCache = new Map<
    string,
    {
      chinese: string
      english: string
      flag: string
      code: string
    }
  >()

  /**
   * 根據中文國家名稱查找國家代碼
   * @param chineseName 中文國家名稱
   * @returns ISO 國家代碼或 null
   */
  const findCountryCodeFromChinese = (chineseName: string): string | null => {
    // 遍歷 TRADITIONAL_CHINESE_OVERRIDES 找到匹配的中文名稱
    for (const [code, chinese] of Object.entries(TRADITIONAL_CHINESE_OVERRIDES)) {
      if (chinese === chineseName) {
        return code
      }
    }
    return null
  }

  /**
   * 根據國家英文名稱自動查找國家代碼
   * @param countryName 國家英文名稱
   * @returns ISO 國家代碼或 null
   */
  const findCountryCode = (countryName: string): string | null => {
    const normalizedName = countryName.toLowerCase().trim()

    const countryCode = COUNTRY_NAME_VARIANTS[normalizedName]
    // 先檢查常見變體
    if (countryCode) {
      return countryCode
    }

    // 使用 i18n-iso-countries 的反向查詢
    try {
      // 嘗試直接查詢（適用於標準英文名稱）
      const code = countries.getAlpha2Code(countryName, 'en')
      if (code) return code

      // 如果直接查詢失敗，遍歷所有國家代碼找匹配
      const allCodes = Object.keys(countries.getNames('en'))
      for (const code of allCodes) {
        const officialName = countries.getName(code, 'en')?.toLowerCase()
        if (officialName === normalizedName) {
          return code
        }
      }
    } catch (error) {
      console.warn(`無法找到國家代碼: ${countryName}`, error)
    }

    return null
  }

  /**
   * 根據國家代碼生成國旗 emoji
   * @param countryCode ISO 國家代碼
   * @returns 國旗 emoji
   */
  const generateFlag = (countryCode: string): string => {
    if (!countryCode || countryCode.length !== 2) return '❌'

    try {
      // 將 ISO 代碼轉換為 Unicode 區域指示符號
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0))

      return String.fromCodePoint(...codePoints)
    } catch (error) {
      console.warn(`無法生成國旗: ${countryCode}`, error)
      return '❌'
    }
  }

  /**
   * 獲取繁體中文國家名稱
   * @param countryCode ISO 國家代碼
   * @returns 繁體中文國家名稱，如果沒有覆蓋則返回 null
   */
  const getTraditionalChineseName = (countryCode: string): string | null => {
    return TRADITIONAL_CHINESE_OVERRIDES[countryCode.toUpperCase()] || null
  }

  /**
   * 檢查是否有自定義的繁體中文名稱
   * @param countryCode ISO 國家代碼
   * @returns 是否有自定義名稱
   */
  const hasCustomChineseName = (countryCode: string): boolean => {
    return countryCode.toUpperCase() in TRADITIONAL_CHINESE_OVERRIDES
  }

  /**
   * 獲取所有支援自定義名稱的國家代碼
   * @returns 國家代碼陣列
   */
  const getSupportedCountryCodes = (): string[] => {
    return Object.keys(TRADITIONAL_CHINESE_OVERRIDES)
  }

  /**
   * 獲取繁體中文國家名稱
   * @param countryCode ISO 國家代碼
   * @returns 繁體中文國家名稱
   */
  const getChineseName = (countryCode: string): string => {
    // 先檢查自定義的繁體中文覆蓋表
    const customName = getTraditionalChineseName(countryCode)
    if (customName) {
      return customName
    }

    // 如果沒有自定義名稱，使用 i18n-iso-countries 的結果
    const chineseName = countries.getName(countryCode, 'zh')
    return chineseName || ''
  }

  /**
   * 獲取國家完整資訊（支援中英文輸入）
   * @param country 國家名稱（中文或英文）
   * @returns 國家完整資訊
   */
  const getCountryInfo = (country: string) => {
    const cacheKey = country.toLowerCase().trim()

    // 檢查快取
    if (countryCache.has(cacheKey)) {
      return countryCache.get(cacheKey)!
    }

    // 優先嘗試中文查找
    let countryCode = findCountryCodeFromChinese(country)

    // 如果中文查找失敗，嘗試英文查找
    if (!countryCode) {
      countryCode = findCountryCode(country)
    }

    // console.log(`🔍 查找國家: ${country} -> 代碼: ${countryCode}`)
    let chinese = country
    let english = country
    let flag = '🌍'

    if (countryCode) {
      // 獲取繁體中文翻譯（使用覆蓋表）
      const chineseName = getChineseName(countryCode)
      if (chineseName) {
        chinese = chineseName
      }

      // 獲取英文正式名稱
      const mapEnglishName = MAP_ENGLISH_NAMES[countryCode]
      if (mapEnglishName) {
        english = mapEnglishName
      } else {
        const englishName = countries.getName(countryCode, 'en')
        if (englishName) {
          english = englishName
        }
      }

      // 生成國旗
      flag = generateFlag(countryCode)
    } else {
      console.warn(`找不到國家: ${country}，使用原始名稱`)
    }

    const result = {
      chinese,
      english,
      flag,
      code: countryCode || ''
    }

    // 儲存到快取
    countryCache.set(cacheKey, result)

    return result
  }

  /**
   * 獲取國家中文名稱
   * @param country 國家名稱（英文）
   * @returns 中文國家名稱
   */
  const getCountryChineseName = (country: string): string => {
    return getCountryInfo(country).chinese
  }

  /**
   * 獲取國家英文正式名稱
   * @param country 國家名稱
   * @returns 英文正式國家名稱
   */
  const getCountryEnglishName = (country: string): string => {
    return getCountryInfo(country).english
  }

  /**
   * 獲取國家國旗 emoji
   * @param country 國家名稱
   * @returns 國旗 emoji
   */
  const getCountryFlag = (country: string): string => {
    return getCountryInfo(country).flag
  }

  /**
   * 清除快取（用於測試或重新整理）
   */
  const clearCache = () => {
    countryCache.clear()
  }

  /**
   * 獲取快取統計
   */
  const getCacheStats = () => {
    return {
      size: countryCache.size,
      countries: Array.from(countryCache.keys())
    }
  }

  // 回傳所有公開的方法
  return {
    // 主要功能
    getCountryChineseName,
    getCountryEnglishName,
    getCountryFlag,
    getCountryInfo,

    // 工具功能
    clearCache,
    getCacheStats,

    // 底層工具（供進階使用）
    findCountryCode,
    generateFlag,
    getChineseName,

    // 名稱配置相關功能
    getTraditionalChineseName,
    hasCustomChineseName,
    getSupportedCountryCodes
  }
}
