// stores/useTravelStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TravelData } from '../types/response'
import { TravelService } from '../services/travelService'
import { RegionDisplayInfo } from '../constants/regionConfig'

export const useTravelStore = defineStore('travel', () => {
  // State
  const travels = ref<TravelData[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const initialized = ref<boolean>(false)

  // Getters
  const travelCount = computed(() => travels.value.length)
  const hasData = computed(() => travels.value.length > 0)

  // Actions
  async function loadTravels(): Promise<void> {
    // 如果已經載入過，直接返回
    if (initialized.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const data = await TravelService.fetchTravels()
      travels.value = data.data
      initialized.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '載入失敗'
    } finally {
      loading.value = false
    }
  }

  // 強制重新載入
  async function refreshTravels(): Promise<void> {
    initialized.value = false
    await loadTravels()
  }

  // 獲取圖片 URL
  function getImageUrl(travel: TravelData, photoName: string): string {
    return TravelService.getImageUrl(travel, photoName)
  }

  // 獲取國家資訊（原有方法，地圖元件使用）
  function getCountryInfo(travel: TravelData): RegionDisplayInfo {
    return TravelService.getCountryInfo(travel)
  }

  // 獲取地區顯示資訊（新方法，有特例處理）
  function getDisplayRegion(travel: TravelData): RegionDisplayInfo {
    return TravelService.getDisplayRegion(travel)
  }

  // 獲取配置
  function getConfig() {
    return TravelService.getConfig()
  }

  // 其他業務邏輯方法
  function getTravelsByCountry(country: string): TravelData[] {
    return travels.value.filter(travel => travel.country.includes(country))
  }

  function getTravelsByYear(year: number | string): TravelData[] {
    const yearStr = year.toString()
    return travels.value.filter(travel => travel.year === yearStr)
  }

  // 根據地區顯示資訊分組（新方法）
  function getTravelsByDisplayRegion(): Record<string, TravelData[]> {
    const grouped: Record<string, TravelData[]> = {}

    travels.value.forEach(travel => {
      const regionInfo = getDisplayRegion(travel) // 直接呼叫函數
      const key = regionInfo.displayName

      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(travel)
    })

    return grouped
  }

  // 清除資料
  function clearTravels(): void {
    travels.value = []
    initialized.value = false
    error.value = null
  }

  return {
    // State
    travels,
    loading,
    error,
    initialized,

    // Getters
    travelCount,
    hasData,

    // Actions
    loadTravels,
    refreshTravels,
    getImageUrl,
    getCountryInfo, // 原有方法
    getDisplayRegion, // 新方法
    getConfig,
    getTravelsByCountry,
    getTravelsByYear,
    getTravelsByDisplayRegion, // 新方法
    clearTravels
  }
})
