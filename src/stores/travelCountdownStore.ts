// ===================================
// src/stores/TravelCountdownStore.ts
// ===================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import weatherService from '../services/weatherService'
import { getCityCoordinates } from '../services/geocodingService'
import { countryLocationConfig } from '../constants/countryLocationConfig'
import { getUpcomingTripsForFrontend, type FrontendTravelConfig } from '../services/backendTravelService'
import { countryTranslation } from '../composables/countryTranslation'
import type {
  WeatherData,
  CountdownData,
  Coordinates,
  LoadingState,
  ErrorState,
  TravelCountdownState,
  MultiCountryWeatherData
} from '../types/travel-countdown'

export const useTravelCountdownStore = defineStore('travelCountdown', () => {
  // ===================================
  // 狀態 (State)
  // ===================================

  const weatherData = ref<WeatherData | null>(null)
  const multiCountryWeatherData = ref<MultiCountryWeatherData | null>(null) // 新增多國天氣
  const countdownData = ref<CountdownData | null>(null)
  const coordinates = ref<Coordinates | null>(null)

  // 新增：動態配置資料（支援多筆）
  const travelConfigs = ref<FrontendTravelConfig[]>([])
  const travelConfig = ref<FrontendTravelConfig | null>(null) // 保留單一資料兼容性

  // 新增：每筆旅行的天氣資料（獨立儲存）
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

  // 取得設定資料（優先使用後台資料，fallback 為靜態配置）
  const config = computed(() => travelConfig.value || countryLocationConfig)

  // ===================================
  // 動作 (Actions)
  // ===================================

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
    const { getCountryFlag } = countryTranslation()

    try {

      const multiWeatherData = await weatherService.fetchMultiCountryWeatherData(
        countries,
        getCityCoordinates,
        getCountryFlag
      )

      if (multiWeatherData) {
        multiCountryWeatherData.value = multiWeatherData
        // 同時更新主要天氣數據（向後兼容）
        weatherData.value = multiWeatherData.primaryWeather
      } else {
        console.warn('⚠️ 多國天氣載入失敗，使用預設天氣')
        multiCountryWeatherData.value = null
        weatherData.value = weatherService.getDefaultWeather()
      }

      error.value = { hasError: false, message: '' }
    } catch (err) {
      console.warn('❌ 多國天氣載入錯誤:', err)
      multiCountryWeatherData.value = null
      weatherData.value = weatherService.getDefaultWeather()
    } finally {
      loading.value.weather = false
    }
  }

  // 載入所有旅行的天氣資料
  async function loadAllTravelWeatherData() {
    if (travelConfigs.value.length === 0) return

    const { getCountryFlag } = countryTranslation()

    // 並行載入所有旅行的天氣
    const weatherPromises = travelConfigs.value.map(async (travel, index) => {
      try {
        if (travel.countries.length > 1) {
          // 多國旅行
          const multiWeatherData = await weatherService.fetchMultiCountryWeatherData(
            travel.countries,
            getCityCoordinates,
            getCountryFlag
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
        console.warn(`❌ 第${index + 1}筆旅行天氣載入失敗:`, error)
        // 使用預設天氣
        travelWeatherMap.value.set(index, weatherService.getDefaultWeather())
      }
    })

    await Promise.all(weatherPromises)
  }

  // 從後台載入旅行資料並初始化（支援多筆）
  async function initializeFromBackend() {
    try {

      // 重置狀態
      reset()

      // 1. 嘗試從後台載入多筆資料
      const backendDataList = await getUpcomingTripsForFrontend()

      if (backendDataList.length > 0) {

        // 存儲多筆資料
        travelConfigs.value = backendDataList

        // 為了向後兼容，將第一筆設為主要配置
        travelConfig.value = backendDataList[0]

        // 2. 載入所有旅行的天氣資料（並行處理）
        await Promise.all([
          loadAllTravelWeatherData(), // 載入所有旅行的天氣
          new Promise<void>(resolve => {
            updateCountdown(backendDataList[0].tripDate)
            resolve()
          })
        ])

        // 3. 設定第一筆旅行的主要天氣資料（向後兼容）
        const firstTravelWeather = getTravelWeather(0)
        if (firstTravelWeather) {
          if ('countries' in firstTravelWeather) {
            // 多國天氣
            multiCountryWeatherData.value = firstTravelWeather as MultiCountryWeatherData
            weatherData.value = (firstTravelWeather as MultiCountryWeatherData).primaryWeather
          } else {
            // 單國天氣
            weatherData.value = firstTravelWeather as WeatherData
          }
        }

      } else {

        // Fallback 到靜態配置
        await initializeFromStaticConfig()
      }
    } catch (err) {
      console.error('❌ 後台資料載入失敗，使用靜態配置:', err)

      // 發生錯誤時 fallback 到靜態配置
      await initializeFromStaticConfig()
    }
  }

  // 從靜態設定檔初始化 (保留作為 fallback)
  async function initializeFromStaticConfig() {
    try {

      // 清除後台配置，使用靜態配置
      travelConfigs.value = []
      travelConfig.value = null

      // 取得城市座標
      const coords = await getCityCoordinates(countryLocationConfig.destination)
      coordinates.value = coords

      // 並行處理天氣和倒數
      await Promise.all([
        loadWeatherData(coords),
        new Promise<void>(resolve => {
          updateCountdown(countryLocationConfig.tripDate)
          resolve()
        })
      ])

    } catch (err) {
      console.error('❌ 靜態配置初始化失敗:', err)
      error.value = {
        hasError: true,
        message: '初始化失敗，請檢查網路連線'
      }
    }
  }

  // 原有的初始化函數 (保留兼容性)
  async function initialize(tripDate: string, coords: Coordinates) {
    // 同時載入天氣和計算倒數
    await Promise.all([
      loadWeatherData(coords),
      new Promise<void>(resolve => {
        updateCountdown(tripDate)
        resolve()
      })
    ])
  }

  // 重置所有資料
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

  // 刷新天氣資料
  async function refreshWeather() {
    if (coordinates.value) {
      await loadWeatherData(coordinates.value)
    } else {
      console.warn('無座標資料，無法刷新天氣')
    }
  }

  // 手動更新目的地 (可選功能)
  async function updateDestination(newDestination: string) {

    try {
      const coords = await getCityCoordinates(newDestination)
      coordinates.value = coords

      // 重新載入天氣
      await loadWeatherData(coords)

    } catch (err) {
      console.error('❌ 目的地更新失敗:', err)
      error.value = {
        hasError: true,
        message: '目的地更新失敗'
      }
    }
  }

  // ===================================
  // 回傳 Store
  // ===================================

  return {
    // 狀態
    weatherData,
    multiCountryWeatherData, // 新增：多國天氣資料
    countdownData,
    coordinates,
    travelConfigs, // 新增：多筆資料
    travelConfig,
    travelWeatherMap, // 新增：旅行天氣對應表
    loading,
    error,

    // 計算屬性
    state,
    config,
    hasWeatherData,
    hasMultiCountryWeatherData, // 新增：檢查多國天氣
    hasCountdownData,
    hasMultipleTravels, // 新增：是否有多筆資料
    isLoading,

    // 工具函數
    getTravelWeather, // 新增：取得特定旅行天氣
    hasTravelWeather, // 新增：檢查特定旅行天氣

    // 動作
    calculateCountdown,
    updateCountdown,
    loadWeatherData,
    loadMultiCountryWeatherData, // 新增：載入多國天氣
    loadAllTravelWeatherData, // 新增：載入所有旅行天氣
    initializeFromBackend, // 新的主要初始化函數
    initializeFromStaticConfig, // 靜態配置 fallback
    initialize, // 原有函數 (兼容性)
    reset,
    refreshWeather,
    updateDestination // 新增功能
  }
})
