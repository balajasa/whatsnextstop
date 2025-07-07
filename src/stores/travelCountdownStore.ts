// ===================================
// src/stores/TravelCountdownStore.ts
// ===================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import weatherService from '../services/weatherService'
import { getCityCoordinates } from '../services/geocodingService'
import { countryLocationConfig } from '../constants/countryLocationConfig'
import type {
  WeatherData,
  CountdownData,
  Coordinates,
  LoadingState,
  ErrorState,
  TravelCountdownState
} from '../types/travel-countdown'

export const useTravelCountdownStore = defineStore('travelCountdown', () => {
  // ===================================
  // 狀態 (State)
  // ===================================

  const weatherData = ref<WeatherData | null>(null)
  const countdownData = ref<CountdownData | null>(null)
  const coordinates = ref<Coordinates | null>(null)

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
    countdownData: countdownData.value,
    loading: loading.value,
    error: error.value
  }))

  // 檢查是否有天氣資料
  const hasWeatherData = computed(() => weatherData.value !== null)

  // 檢查是否有倒數資料
  const hasCountdownData = computed(() => countdownData.value !== null)

  // 檢查是否正在載入
  const isLoading = computed(() => loading.value.weather || loading.value.countdown)

  // 取得設定資料
  const config = computed(() => countryLocationConfig)

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
        totalDays: 0,
        progress: 100
      }
    }

    // 計算各時間單位
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

    // 計算總天數和進度
    const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    // 進度計算：假設從一年前開始規劃旅行
    const oneYearAgo = new Date(trip)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const totalPlanningMs = trip.getTime() - oneYearAgo.getTime()
    const elapsedMs = now.getTime() - oneYearAgo.getTime()
    const progress = Math.min(100, Math.max(0, (elapsedMs / totalPlanningMs) * 100))

    return {
      days,
      hours,
      minutes,
      seconds,
      totalDays,
      progress: Math.round(progress)
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

  // 從設定檔自動初始化 (新增的主要函數)
  async function initializeFromConfig() {
    try {
      // 重置狀態
      reset()

      // 1. 取得城市座標
      // console.log(`🗺️ 查詢城市座標: ${countryLocationConfig.destination}`)
      const coords = await getCityCoordinates(countryLocationConfig.destination)
      coordinates.value = coords
      // console.log('✅ 座標取得成功:', coords)

      // 2. 並行處理天氣和倒數
      await Promise.all([
        loadWeatherData(coords),
        new Promise<void>(resolve => {
          updateCountdown(countryLocationConfig.tripDate)
          resolve()
        })
      ])
    } catch (err) {
      console.error('❌ TravelCountdown 初始化失敗:', err)
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
    countdownData.value = null
    coordinates.value = null
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
    console.log(`🔄 更新目的地: ${newDestination}`)

    try {
      const coords = await getCityCoordinates(newDestination)
      coordinates.value = coords

      // 重新載入天氣
      await loadWeatherData(coords)

      // console.log('✅ 目的地更新成功')
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
    countdownData,
    coordinates,
    loading,
    error,

    // 計算屬性
    state,
    config,
    hasWeatherData,
    hasCountdownData,
    isLoading,

    // 動作
    calculateCountdown,
    updateCountdown,
    loadWeatherData,
    initializeFromConfig, // 新的主要初始化函數
    initialize, // 原有函數 (兼容性)
    reset,
    refreshWeather,
    updateDestination // 新增功能
  }
})
