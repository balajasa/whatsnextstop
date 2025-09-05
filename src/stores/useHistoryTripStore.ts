// ===================================
// 歷史旅程 Store
// ===================================

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { HistoryTripService } from '../services/history-travel/historyTripService'
import type { HistoryTrip } from '../types/history-travel/travel-history'
import type { RegionDisplayInfo } from '../translation/constants/specialCities'
import { countryTranslation } from '../translation/composables/countryTranslation'
import { getSpecialCityInfo } from '../translation/constants/specialCities'

/**
 * 新的歷史旅程 Store
 */
export const useHistoryTripStore = defineStore('historyTrip', () => {
  // State
  const trips = ref<HistoryTrip[]>([])
  const loading = ref<boolean>(false)
  const loadingMore = ref<boolean>(false)
  const error = ref<string | null>(null)
  const initialized = ref<boolean>(false)
  const allTrips = ref<HistoryTrip[]>([]) // 完整的旅程列表
  const currentPage = ref<number>(0)
  const pageSize = ref<number>(5) // 每頁載入5筆
  const hasMore = ref<boolean>(true) // 是否還有更多資料


  // Actions
  async function loadPhotoTrips(): Promise<void> {
    // 如果已經載入過，直接返回
    if (initialized.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      // 載入所有旅程資料
      const data = await HistoryTripService.fetchAllTrips()
      allTrips.value = data

      // 初始顯示前5筆
      trips.value = data.slice(0, pageSize.value)
      currentPage.value = 1
      hasMore.value = data.length > pageSize.value

      initialized.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '載入失敗'
      console.error('HistoryTripStore 載入失敗:', err)
    } finally {
      loading.value = false
    }
  }

  // 載入更多旅程
  async function loadMoreTrips(): Promise<void> {
    if (loadingMore.value || !hasMore.value) {
      return
    }

    loadingMore.value = true

    try {
      const startIndex = currentPage.value * pageSize.value
      const endIndex = startIndex + pageSize.value
      const moreTrips = allTrips.value.slice(startIndex, endIndex)

      if (moreTrips.length > 0) {
        trips.value.push(...moreTrips)
        currentPage.value++

        // 檢查是否還有更多
        hasMore.value = endIndex < allTrips.value.length
      } else {
        hasMore.value = false
      }
    } catch (err) {
      console.error('載入更多旅程失敗:', err)
    } finally {
      loadingMore.value = false
    }
  }

  // 重置狀態（用於重新載入）
  function resetState(): void {
    trips.value = []
    allTrips.value = []
    currentPage.value = 0
    hasMore.value = true
    initialized.value = false
    loading.value = false
    loadingMore.value = false
    error.value = null
  }


  // 獲取地區顯示資訊（處理特例城市如香港、澳門）
  function getDisplayRegion(trip: HistoryTrip): RegionDisplayInfo {
    // 檢查是否有特例城市
    const allCities = trip.destinations.flatMap((dest) => dest.cities)

    for (const city of allCities) {
      const specialRegion = getSpecialCityInfo(city)
      if (specialRegion) {
        return specialRegion
      }
    }

    // 沒有特例，返回國家資訊
    const { getCountryInfo } = countryTranslation()
    const firstCountry = trip.destinations[0]?.country || ''
    const countryInfo = getCountryInfo(firstCountry)

    return {
      flagCode: countryInfo.code || firstCountry.toUpperCase(),
      displayName: countryInfo.chinese || firstCountry,
    }
  }


  // 新增：載入所有資料的方法（不分頁）
  async function loadAllTrips(): Promise<void> {
    // 如果已經載入過，直接返回
    if (initialized.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      // 載入所有旅程資料
      const data = await HistoryTripService.fetchAllTrips()
      allTrips.value = data

      // 直接顯示全部資料（不分頁）
      trips.value = data
      hasMore.value = false

      initialized.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '載入失敗'
      console.error('HistoryTripStore 載入失敗:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    trips,
    loading,
    loadingMore,
    error,
    initialized,
    hasMore,
    currentPage,
    pageSize,
    allTrips,
    loadPhotoTrips,
    loadAllTrips,
    loadMoreTrips,
    resetState,
    getDisplayRegion,
  }
})
