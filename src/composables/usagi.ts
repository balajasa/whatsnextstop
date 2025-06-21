import { ref, type Ref } from 'vue'

// 定義型別
interface TravelData {
  year: string
  startDate: string
  endDate: string
  country: string
  city: string[]
  photo: string[]
}

interface TravelsResponse {
  data: TravelData[]
}

interface UsePhotosReturn {
  travels: Ref<TravelData[]>
  loading: Ref<boolean>
  loadTravels: () => Promise<void>
  getImageUrl: (folderPath: string, filename: string) => string
}

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