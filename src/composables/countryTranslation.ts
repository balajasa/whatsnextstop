// composables/countryTranslation.ts
import countries from 'i18n-iso-countries'
import zhTW from 'i18n-iso-countries/langs/zh.json'
import enLocale from 'i18n-iso-countries/langs/en.json'

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
 * 國家翻譯 Composable - 專注於國家翻譯
 * 城市翻譯由 API 資料提供，不在此處理
 */
export const countryTranslation = () => {
  // 初始化語言包
  initializeLocale()

  // 動態快取，避免重複查詢
  const countryCache = new Map<string, {
    chinese: string
    english: string
    flag: string
    code: string
  }>()

  /**
   * 根據國家英文名稱自動查找國家代碼
   * @param countryName 國家英文名稱
   * @returns ISO 國家代碼或 null
   */
  const findCountryCode = (countryName: string): string | null => {
    const normalizedName = countryName.toLowerCase().trim()

    // 常見的國家名稱變體對應
    const nameVariants: Record<string, string> = {
      'philippines': 'PH',
      'indonesia': 'ID',
      'japan': 'JP',
      'thailand': 'TH',
      'singapore': 'SG',
      'malaysia': 'MY',
      'vietnam': 'VN',
      'cambodia': 'KH',
      'myanmar': 'MM',
      'laos': 'LA',
      'south korea': 'KR',
      'korea': 'KR',
      'taiwan': 'TW',
      'china': 'CN',
      'hong kong': 'HK',
      'macau': 'MO',
      'united states': 'US',
      'usa': 'US',
      'america': 'US',
      'united kingdom': 'GB',
      'uk': 'GB',
      'britain': 'GB',
      'england': 'GB'
    }

    // 先檢查常見變體
    if (nameVariants[normalizedName]) {
      return nameVariants[normalizedName]
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
    if (!countryCode || countryCode.length !== 2) return '🏳️'

    try {
      // 將 ISO 代碼轉換為 Unicode 區域指示符號
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0))

      return String.fromCodePoint(...codePoints)
    } catch (error) {
      console.warn(`無法生成國旗: ${countryCode}`, error)
      return '🏳️'
    }
  }

  /**
   * 獲取國家完整資訊（完全自動查詢）
   * @param country 國家名稱（英文）
   * @returns 國家完整資訊
   */
  const getCountryInfo = (country: string) => {
    const cacheKey = country.toLowerCase().trim()

    // 檢查快取
    if (countryCache.has(cacheKey)) {
      return countryCache.get(cacheKey)!
    }

    // 查找國家代碼
    const countryCode = findCountryCode(country)

    let chinese = country
    let english = country
    let flag = '🏳️'

    if (countryCode) {
      // 獲取中文翻譯
      const chineseName = countries.getName(countryCode, 'zh')
      if (chineseName) {
        chinese = chineseName
      }

      // 獲取英文正式名稱
      const englishName = countries.getName(countryCode, 'en')
      if (englishName) {
        english = englishName
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
    generateFlag
  }
}