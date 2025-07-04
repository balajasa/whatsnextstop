// stores/useTravelStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TravelData } from '../types/response'
import { TravelService } from '../services/travelService'

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

  // 獲取配置
  function getConfig() {
    return TravelService.getConfig()
  }

  // 其他業務邏輯方法
  function getTravelsByCountry(country: string): TravelData[] {
    return travels.value.filter(travel =>
      travel.country.includes(country)
    )
  }

  function getTravelsByYear(year: number): TravelData[] {
    return travels.value.filter(travel => travel.year === year)
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
    getConfig,
    getTravelsByCountry,
    getTravelsByYear,
    clearTravels
  }
})