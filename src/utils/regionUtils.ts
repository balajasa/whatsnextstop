// utils/regionUtils.ts
import {
  CITY_TO_FLAG_MAP,
  RegionDisplayInfo,
  getSpecialCities,
  isSpecialCity as checkIsSpecialCity,
  getSpecialCityInfo
} from '../constants/regionConfig'

/**
 * 特殊地區工具類
 * 處理需要特殊顯示邏輯的城市（如香港、澳門）
 */
export class RegionUtils {
  /**
   * 檢查城市清單中是否包含特例城市
   * @param cities 城市代碼陣列
   * @returns 如果找到特例城市，回傳對應的顯示資訊；否則回傳 null
   */
  static checkSpecialCity(cities: string[]): RegionDisplayInfo | null {
    // 遍歷城市清單，檢查是否有特例
    for (const city of cities) {
      const specialInfo = getSpecialCityInfo(city)
      if (specialInfo) {
        return specialInfo
      }
    }

    return null
  }

  /**
   * 檢查單一城市是否為特例
   * @param city 城市代碼
   * @returns 是否為特例城市
   */
  static isSpecialCity(city: string): boolean {
    return checkIsSpecialCity(city)
  }

  /**
   * 獲取特例城市的顯示資訊
   * @param city 城市代碼
   * @returns 顯示資訊，如果不是特例城市則回傳 null
   */
  static getSpecialCityInfo(city: string): RegionDisplayInfo | null {
    return getSpecialCityInfo(city)
  }

  /**
   * 獲取所有特例城市清單
   * @returns 特例城市代碼陣列
   */
  static getAllSpecialCities(): string[] {
    return getSpecialCities()
  }

  /**
   * 獲取所有城市映射表
   * @returns 城市到旗幟的映射表
   */
  static getAllCityMappings(): Record<string, RegionDisplayInfo> {
    return { ...CITY_TO_FLAG_MAP }
  }
}
