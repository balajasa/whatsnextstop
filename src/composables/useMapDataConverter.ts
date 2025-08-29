// composables/useMapDataConverter.ts
import { computed, ref, onMounted } from 'vue'
import { useTravelStore } from '@/stores/useTravelStore'
import { storeToRefs } from 'pinia'
import { countryTranslation } from '@/composables/countryTranslation'
import { getManualCoordinates, getCountryCoordinatesFromGeoJSON } from '@/constants/regionConfig'
import type { TravelData } from '@/types/history-travel/travel-history'

// WorldMapPin 類型定義
export interface WorldMapPin {
  id: string
  lat: number
  lng: number
  visitCount: number
  label?: string
}

/**
 * 簡化的地圖資料轉換 composable
 * 直接使用 MANUAL_COORDINATES，避免複雜的座標計算和投影轉換
 */
export function useMapDataConverter() {
  const travelStore = useTravelStore()
  const { travels } = storeToRefs(travelStore)
  const { getCountryInfo } = countryTranslation()
  
  // 載入 GeoJSON 世界地圖資料
  const worldData = ref<any>(null)
  
  const loadWorldData = async () => {
    if (worldData.value) return
    
    try {
      const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      worldData.value = await response.json()
    } catch (error) {
      console.error('載入 GeoJSON 失敗:', error)
    }
  }
  
  onMounted(() => {
    loadWorldData()
  })

  // 計算已訪問的國家列表（用於地圖著色）
  const visitedCountries = computed(() => {
    const countries = new Set<string>()
    
    travels.value.forEach((travel: TravelData) => {
      const countryList = Array.isArray(travel.country) ? travel.country : [travel.country]
      countryList.forEach((country: string) => {
        // 直接使用原始國家名稱，讓 smeargle 自己處理對應
        countries.add(country.toLowerCase())
      })
    })
    
    return Array.from(countries)
  })

  /**
   * 簡化的圖釘資料轉換 - 只使用 MANUAL_COORDINATES
   * 移除複雜的投影轉換和容器縮放邏輯
   */
  const mapPins = computed((): WorldMapPin[] => {
    if (!travels.value.length) return []

    // 簡化的國家分組邏輯
    const countryGroups: Record<string, TravelData[]> = {}
    
    travels.value.forEach((travel: TravelData) => {
      const countryList = Array.isArray(travel.country) ? travel.country : [travel.country]
      
      countryList.forEach((country: string) => {
        const countryKey = country.toLowerCase()
        if (!countryGroups[countryKey]) {
          countryGroups[countryKey] = []
        }
        countryGroups[countryKey].push(travel)
      })
    })

    const pins: WorldMapPin[] = []

    // 座標處理 - 優先 MANUAL_COORDINATES，再用 GeoJSON 計算
    Object.entries(countryGroups).forEach(([country, trips]) => {
      const countryInfo = getCountryInfo(country)
      let coordinates: [number, number] | null = null
      
      // 1. 優先使用 GeoJSON 自動計算
      if (worldData.value) {
        const geoCoords = getCountryCoordinatesFromGeoJSON(countryInfo.english, worldData.value)
        if (geoCoords) {
          coordinates = geoCoords
        }
      }
      
      // 2. GeoJSON 找不到才使用 MANUAL_COORDINATES
      if (!coordinates) {
        const manualCoords = getManualCoordinates(country)
        if (manualCoords) {
          coordinates = manualCoords
        }
      }
      
      if (coordinates) {
        const [lat, lng] = coordinates
        
        pins.push({
          id: country,
          lat,
          lng,
          visitCount: trips.length,
          label: `${countryInfo.chinese} (${trips.length}次)`
        })
      }
    })

    return pins
  })

  /**
   * 當 GeoJSON 地圖資料載入後，重新計算缺少的座標
   */
  const updatePinsWithGeoJSON = (worldData: any): WorldMapPin[] => {
    if (!travels.value.length) return []

    const countryGroups: Record<string, TravelData[]> = {}
    
    travels.value.forEach((travel: TravelData) => {
      const countryList = Array.isArray(travel.country) ? travel.country : [travel.country]
      
      countryList.forEach((country: string) => {
        const countryKey = country.toLowerCase()
        if (!countryGroups[countryKey]) {
          countryGroups[countryKey] = []
        }
        countryGroups[countryKey].push(travel)
      })
    })

    const pins: WorldMapPin[] = []

    Object.entries(countryGroups).forEach(([country, trips]) => {
      const countryInfo = getCountryInfo(country)
      let coordinates: [number, number] | null = null
      
      // 1. 優先使用 GeoJSON 自動計算
      const geoCoords = getCountryCoordinatesFromGeoJSON(countryInfo.english, worldData)
      if (geoCoords) {
        coordinates = geoCoords
      } else {
        // 2. GeoJSON 找不到才使用 MANUAL_COORDINATES
        const manualCoords = getManualCoordinates(country)
        if (manualCoords) {
          coordinates = manualCoords
        }
      }
      
      if (coordinates) {
        const [lat, lng] = coordinates
        
        pins.push({
          id: country,
          lat,
          lng,
          visitCount: trips.length,
          label: `${countryInfo.chinese} (${trips.length}次)`
        })
      } else {
        console.warn(`⚠️ 無法計算座標: ${country} (${countryInfo.chinese})`)
      }
    })

    return pins
  }

  return {
    visitedCountries,
    mapPins,
    updatePinsWithGeoJSON
  }
}