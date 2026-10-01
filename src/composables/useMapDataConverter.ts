// ===================================
// 地圖資料轉換 composable
// ===================================

import { computed } from 'vue'
import { worldGeoJson } from '@monster/smeargle'
import { useHistoryTripStore } from '@/stores/useHistoryTripStore'
import { storeToRefs } from 'pinia'
import { countryTranslation } from '@/translation/composables/countryTranslation'
import { getManualCoordinates, getCountryCoordinatesFromGeoJSON } from '@/translation/constants/mapCoordinates'
import type { HistoryTrip } from '@/types/history-travel/travel-history'
import type { FeatureCollection } from 'geojson'

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
  const historyTripStore = useHistoryTripStore()
  const { allTrips } = storeToRefs(historyTripStore)  // 改為使用全部資料
  const { getCountryInfo } = countryTranslation()

  const worldData = worldGeoJson as FeatureCollection

  // 計算已訪問的國家列表（用於地圖著色）
  const visitedCountries = computed(() => {
    const countries = new Set<string>()

    allTrips.value.forEach((trip: HistoryTrip) => {
      trip.destinations.forEach((destination) => {
        const countryInfo = getCountryInfo(destination.country)

        // 使用小寫英文國家名稱
        if (countryInfo.english) {
          countries.add(countryInfo.english.toLowerCase())
        } else {
          countries.add(destination.country.toLowerCase())
        }
      })
    })

    return Array.from(countries)
  })

  /**
   * 簡化的圖釘資料轉換
   * 移除複雜的投影轉換和容器縮放邏輯
   */
  const mapPins = computed((): WorldMapPin[] => {
    if (!allTrips.value.length) return []

    // 簡化的國家分組邏輯
    const countryGroups: Record<string, HistoryTrip[]> = {}

    allTrips.value.forEach((trip: HistoryTrip) => {
      trip.destinations.forEach((destination) => {
        const countryKey = destination.country.toLowerCase()
        if (!countryGroups[countryKey]) {
          countryGroups[countryKey] = []
        }
        countryGroups[countryKey].push(trip)
      })
    })

    const pins: WorldMapPin[] = []

    // 座標處理
    Object.entries(countryGroups).forEach(([country, trips]) => {
      const countryInfo = getCountryInfo(country)
      let coordinates: [number, number] | null = null

      // 使用 GeoJSON 自動計算
      const geoCoords = getCountryCoordinatesFromGeoJSON(countryInfo.english, worldData)
      if (geoCoords) {
        coordinates = geoCoords
      }

      // GeoJSON 找不到才使用 MANUAL_COORDINATES
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
          label: `${countryInfo.chinese} (${trips.length}次)`,
        })
      }
    })

    return pins
  })

  return {
    visitedCountries,
    mapPins,
  }
}
