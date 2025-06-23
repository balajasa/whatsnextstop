import { ref } from "vue"
import { TravelData, TravelsResponse, GetTravels } from "../components/types/IResponse"

export function getTravelsData(): GetTravels {
  const travels = ref<TravelData[]>([])
  const loading = ref<boolean>(false)

  // true = 本地API, false = 線上API
  const isDev = false

  const localUrl = '/api/usagi'
  const prodUrl = 'https://raw.githubusercontent.com/balajasa/coffeeisadog/main'
  const baseUrl = isDev ? localUrl : prodUrl

  async function loadTravels(): Promise<void> {
    loading.value = true

    try {
      const response = await fetch(`${baseUrl}/data/travels.json`)
      if (!response.ok) throw new Error(`HTTP ${response.status}: 載入失敗`)

      const data: TravelsResponse = await response.json()
      travels.value = data.data

      console.log(`成功讀取 ${data.data.length} 筆旅遊資料`)
    } catch (error) {
      console.error(`載入失敗:`, error)
      if (isDev) {
        console.log('💡 本地API需要確保 Vite proxy 設定正確')
      }
    } finally {
      loading.value = false
    }
  }

  function getImageUrl(folderPath: string, filename: string): string {
    return `${baseUrl}/images/photo/${folderPath}/${filename}.jpg`
  }

  function getConfig() {
    return {
      isDev,
      baseUrl
    }
  }

  return {
    travels,
    loading,
    loadTravels,
    getImageUrl,
    getConfig
  }
}