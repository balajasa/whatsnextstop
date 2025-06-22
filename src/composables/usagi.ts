import { ref } from "vue"
import { TravelData, TravelsResponse, UsePhotosReturn } from "../components/types/IResponse"

export function usePhotos(): UsePhotosReturn {
  const travels = ref<TravelData[]>([])
  const loading = ref<boolean>(false)

  // 開發環境用 proxy，生產環境用 GitHub Pages
  const isUseHub = false  // true = GitHub, false = 本地

  const isDev = import.meta.env.DEV
  const baseUrl = (isDev && !isUseHub)
    ? '/api/usagi'
    : 'https://balajasa.github.io/coffeeisadog'

  async function loadTravels(): Promise<void> {
    loading.value = true
    try {
      const response = await fetch(`${baseUrl}/data/travels.json`)
      if (!response.ok) throw new Error('載入失敗')

      const data: TravelsResponse = await response.json()
      travels.value = data.data
    } catch (error) {
      console.error('載入資料失敗:', error)
    } finally {
      loading.value = false
    }
  }

  function getImageUrl(folderPath: string, filename: string): string {
    return `${baseUrl}/images/photo/${folderPath}/${filename}.jpg`
  }

  return {
    travels,
    loading,
    loadTravels,
    getImageUrl
  }
}