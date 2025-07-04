import { ref } from 'vue'
import type { TravelData } from '../types/response'

/**
 * 旅行照片管理 Composable
 */
export function useTravelPhotos(getPhotoUrl: (travel: TravelData, photoName: string) => string) {
  const loadedPhotos = ref<Set<string>>(new Set())
  const loadingPhotos = ref<Set<string>>(new Set())

  /**
   * 載入照片
   * @param travel 旅行資料
   * @param photoName 照片名稱
   */
  function loadPhoto(travel: TravelData, photoName: string): void {
    const url = getPhotoUrl(travel, photoName)

    if (loadedPhotos.value.has(url) || loadingPhotos.value.has(url)) {
      return
    }

    loadingPhotos.value.add(url)

    const img = new Image()
    img.onload = () => {
      setTimeout(() => {
        loadingPhotos.value.delete(url)
        loadedPhotos.value.add(url)
      }, 300)
    }
    img.onerror = () => {
      loadingPhotos.value.delete(url)
    }
    img.src = url
  }

  /**
   * 批量載入照片（帶延遲）
   * @param travel 旅行資料
   * @param delay 每張照片載入間隔（毫秒）
   */
  function loadPhotosWithDelay(travel: TravelData, delay: number = 200): void {
    travel.photo.forEach((photoName: string, photoIndex: number) => {
      setTimeout(() => {
        loadPhoto(travel, photoName)
      }, photoIndex * delay)
    })
  }

  return {
    loadedPhotos,
    loadingPhotos,
    loadPhoto,
    loadPhotosWithDelay
  }
}