// ===================================
// 旅行倒數 Store
// ===================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import weatherService from '../services/next-travel/weatherService'
import { getCityCoordinates } from '../services/next-travel/cityCoordinatesService'
import { getUpcomingTripsForFrontend, type FrontendTravelConfig } from '../services/next-travel/nextTravelService'
import type {
  WeatherData,
  CountdownData,
  Coordinates,
  LoadingState,
  ErrorState,
  TravelCountdownState,
  MultiCountryWeatherData
} from '../types/next-travel/travel-countdown'

export const useTravelCountdownStore = defineStore('travelCountdown', () => {
  // ===================================
  // 狀態 (State)
  // ===================================

  const weatherData = ref<WeatherData | null>(null)
  const multiCountryWeatherData = ref<MultiCountryWeatherData | null>(null) // 新增多國天氣
  const countdownData = ref<CountdownData | null>(null)
  const coordinates = ref<Coordinates | null>(null)

  const travelConfigs = ref<FrontendTravelConfig[]>([])
  const travelConfig = ref<FrontendTravelConfig | null>(null) // 保留單一資料兼容性

  const travelWeatherMap = ref<Map<number, WeatherData | MultiCountryWeatherData>>(new Map())

  const loading = ref<LoadingState>({
    weather: false,
    countdown: false
  })

  const error = ref<ErrorState>({
    hasError: false,
    message: ''
  })

  // ===================================
  // 計算屬性 (Getters)
  // ===================================

  // 取得完整狀態
  const state = computed<TravelCountdownState>(() => ({
    weatherData: weatherData.value,
    multiCountryWeatherData: multiCountryWeatherData.value,
    countdownData: countdownData.value,
    loading: loading.value,
    error: error.value
  }))

  // 檢查是否有天氣資料
  const hasWeatherData = computed(() => weatherData.value !== null)

  // 檢查是否有多國天氣資料
  const hasMultiCountryWeatherData = computed(() => multiCountryWeatherData.value !== null)

  // 取得特定旅行的天氣資料
  const getTravelWeather = (index: number) => {
    return travelWeatherMap.value.get(index) || null
  }

  // 檢查特定旅行是否有天氣資料
  const hasTravelWeather = (index: number) => {
    return travelWeatherMap.value.has(index)
  }

  // 檢查是否有倒數資料
  const hasCountdownData = computed(() => countdownData.value !== null)

  // 檢查是否正在載入
  const isLoading = computed(() => loading.value.weather || loading.value.countdown)

  // 檢查是否有多筆旅行資料
  const hasMultipleTravels = computed(() => travelConfigs.value.length > 0)

  // 取得設定資料（只使用後台資料）
  const config = computed(() => travelConfig.value || {
    destination: 'Unknown',
    tripDate: new Date().toISOString().split('T')[0],
    countryFlag: '🏖️',
    title: '旅行倒數',
    options: {
      showSeconds: false,
      showWeather: false
    }
  })

  // 計算倒數資料
  function calculateCountdown(tripDate: string): CountdownData {
    const now = new Date()
    const trip = new Date(tripDate)
    const diffMs = trip.getTime() - now.getTime()

    // 如果已經過期，回傳零值
    if (diffMs <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalDays: 0
      }
    }

    // 計算各時間單位
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

    // 計算總天數
    const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    return {
      days,
      hours,
      minutes,
      seconds,
      totalDays
    }
  }

  // 更新倒數資料
  function updateCountdown(tripDate: string) {
    loading.value.countdown = true

    try {
      countdownData.value = calculateCountdown(tripDate)
      error.value = { hasError: false, message: '' }
    } catch (err) {
      error.value = {
        hasError: true,
        message: '倒數計算失敗'
      }
      console.error('倒數計算錯誤:', err)
    } finally {
      loading.value.countdown = false
    }
  }

  // 載入天氣資料
  async function loadWeatherData(coords: Coordinates) {
    loading.value.weather = true

    try {
      const data = await weatherService.fetchWeatherData(coords)

      if (data) {
        weatherData.value = data
      } else {
        // API 失敗時使用預設天氣
        weatherData.value = weatherService.getDefaultWeather()
      }

      error.value = { hasError: false, message: '' }
    } catch (err) {
      // 使用預設天氣，不顯示錯誤給用戶
      weatherData.value = weatherService.getDefaultWeather()
      console.warn('天氣載入失敗，使用預設天氣:', err)
    } finally {
      loading.value.weather = false
    }
  }

  // 載入多國天氣資料
  async function loadMultiCountryWeatherData(countries: string[]) {
    if (countries.length <= 1) {
      // 單國或無國家時，清除多國天氣數據
      multiCountryWeatherData.value = null
      return
    }

    loading.value.weather = true

    try {

      const multiWeatherData = await weatherService.fetchMultiCountryWeatherData(
        countries,
        getCityCoordinates
      )

      if (multiWeatherData) {
        multiCountryWeatherData.value = multiWeatherData
        // 同時更新主要天氣數據（向後兼容）
        weatherData.value = multiWeatherData.primaryWeather
      } else {
        console.warn('多國天氣載入失敗，使用預設天氣')
        multiCountryWeatherData.value = null
        weatherData.value = weatherService.getDefaultWeather()
      }

      error.value = { hasError: false, message: '' }
    } catch (err) {
      console.warn('多國天氣載入錯誤:', err)
      multiCountryWeatherData.value = null
      weatherData.value = weatherService.getDefaultWeather()
    } finally {
      loading.value.weather = false
    }
  }

  // 載入所有旅行的天氣資料
  async function loadAllTravelWeatherData() {
    if (travelConfigs.value.length === 0) return

    // 並行載入所有旅行的天氣
    const weatherPromises = travelConfigs.value.map(async (travel, index) => {
      try {
        if (travel.countries.length > 1) {
          // 多國旅行
          const multiWeatherData = await weatherService.fetchMultiCountryWeatherData(
            travel.countries,
            getCityCoordinates
          )
          if (multiWeatherData) {
            travelWeatherMap.value.set(index, multiWeatherData)
          }
        } else {
          // 單國旅行
          const coords = await getCityCoordinates(travel.destination)
          const weatherData = await weatherService.fetchWeatherData(coords)
          if (weatherData) {
            travelWeatherMap.value.set(index, weatherData)
          }
        }
      } catch (error) {
        console.warn(`第${index + 1}筆旅行天氣載入失敗:`, error)
        // 使用預設天氣
        travelWeatherMap.value.set(index, weatherService.getDefaultWeather())
      }
    })

    await Promise.all(weatherPromises)
  }

  // 從後台載入旅行資料並初始化（支援多筆）
  async function initializeFromBackend() {
    try {

      reset()

      const backendDataList = await getUpcomingTripsForFrontend()

      if (backendDataList.length > 0) {

        travelConfigs.value = backendDataList

        travelConfig.value = backendDataList[0]

        await Promise.all([
          loadAllTravelWeatherData(),
          new Promise<void>(resolve => {
            updateCountdown(backendDataList[0].tripDate)
            resolve()
          })
        ])

        const firstTravelWeather = getTravelWeather(0)
        if (firstTravelWeather) {
          if ('countries' in firstTravelWeather) {
            multiCountryWeatherData.value = firstTravelWeather as MultiCountryWeatherData
            weatherData.value = (firstTravelWeather as MultiCountryWeatherData).primaryWeather
          } else {
            weatherData.value = firstTravelWeather as WeatherData
          }
        }

      } else {
        // 沒有後台資料時清空狀態
        console.warn('沒有找到任何旅行配置資料')
        travelConfigs.value = []
        travelConfig.value = null
        weatherData.value = null
        coordinates.value = null
      }
    } catch (err) {
      console.error('後台資料載入失敗:', err)

      // 發生錯誤時清空狀態
      travelConfigs.value = []
      travelConfig.value = null
      weatherData.value = null
      coordinates.value = null
    }
  }


  async function initialize(tripDate: string, coords: Coordinates) {
    await Promise.all([
      loadWeatherData(coords),
      new Promise<void>(resolve => {
        updateCountdown(tripDate)
        resolve()
      })
    ])
  }

  function reset() {
    weatherData.value = null
    multiCountryWeatherData.value = null // 新增清除多國天氣
    countdownData.value = null
    coordinates.value = null
    travelConfigs.value = []
    travelConfig.value = null
    travelWeatherMap.value.clear() // 清除旅行天氣對應表
    loading.value = {
      weather: false,
      countdown: false
    }
    error.value = {
      hasError: false,
      message: ''
    }
  }

  async function refreshWeather() {
    if (coordinates.value) {
      await loadWeatherData(coordinates.value)
    } else {
      console.warn('無座標資料，無法刷新天氣')
    }
  }


  // ===================================
  // 回傳 Store
  // ===================================

  return {
    // 狀態
    weatherData,
    multiCountryWeatherData,
    countdownData,
    coordinates,
    travelConfigs,
    travelConfig,
    travelWeatherMap,
    loading,
    error,

    // 計算屬性
    state,
    config,
    hasWeatherData,
    hasMultiCountryWeatherData,
    hasCountdownData,
    hasMultipleTravels,
    isLoading,

    // 工具函數
    getTravelWeather,
    hasTravelWeather,

    // 動作
    calculateCountdown,
    updateCountdown,
    loadWeatherData,
    loadMultiCountryWeatherData,
    loadAllTravelWeatherData,
    initializeFromBackend,
    initialize,
    reset,
    refreshWeather
  }
})
