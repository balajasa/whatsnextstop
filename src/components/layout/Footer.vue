<template>
  <footer class="travel-collection-footer">
    <div class="footer-container">
      <div class="header-section">
        <div class="stats-badge">已收集 {{ collectedCount }}</div>
      </div>

      <div class="cards-section">
        <div class="cards-container">
          <div v-for="country in displayCountries" :key="country.code" class="card-holder">
            <div class="travel-card">
              <div class="card-surface" :class="{
                'collected': country.isCollected,
                'locked': !country.isCollected
              }">
                <div class="country-flag">{{ country.flag }}</div>
                <div class="country-text">{{ country.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="copy-section">
        <div class="copy-text">© 2025 OolongLatte</div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHistoryTripStore } from '../../stores/useHistoryTripStore'
import { countryTranslation } from '../../translation/composables/countryTranslation'

interface CountryCard {
  code: string
  name: string
  flag: string
  isCollected: boolean
}

const historyTripStore = useHistoryTripStore()
const { getCountryInfo } = countryTranslation()

const displayCountries = ref<CountryCard[]>([])
const collectedCount = computed(() =>
  displayCountries.value.filter(c => c.isCollected).length
)

// 目標國家清單
const TARGET_COUNTRIES = [
  'norway', 'finland', 'sweden', 'australia', 'new zealand', 'egypt', 'switzerland', 'united kingdom'
]

/**
* 初始化國家清單
*/
const initCountries = () => {
  // 從 API 取得已去過的地區
  const visitedRegions = new Set<string>()
  const visitedCountryCards: CountryCard[] = []

  // 處理已去過的地區
  historyTripStore.allTrips.forEach((trip) => {
    // 為每個目的地的每個城市檢查是否為特例
    trip.destinations.forEach(destination => {
      destination.cities.forEach(city => {
        // 創建臨時的 trip 物件來檢查特例城市
        const tempTrip = {
          ...trip,
          destinations: [{ country: destination.country, cities: [city] }]
        }
        const regionInfo = historyTripStore.getDisplayRegion(tempTrip)

        // 如果還沒有收集過這個地區
        if (!visitedRegions.has(regionInfo.flagCode)) {
          visitedRegions.add(regionInfo.flagCode)

          try {
            // 取得旗幟資訊
            const flagInfo = getCountryInfo(regionInfo.flagCode)

            visitedCountryCards.push({
              code: regionInfo.flagCode,
              name: regionInfo.displayName,
              flag: flagInfo.flag,
              isCollected: true
            })
          } catch (error) {
            console.error(`處理地區 ${regionInfo.displayName} 時出錯:`, error)
          }
        }
      })
    })
  })

  // 處理未去過的熱門國家
  const unvisitedCountryCards: CountryCard[] = []

  TARGET_COUNTRIES.forEach(countryName => {
    try {
      const countryInfo = getCountryInfo(countryName)
      // 如果這個國家沒有在已去過的清單中
      if (!visitedRegions.has(countryInfo.code.toUpperCase()) && countryInfo.code) {
        unvisitedCountryCards.push({
          code: countryInfo.code,
          name: countryInfo.chinese,
          flag: countryInfo.flag,
          isCollected: false
        })
      }
    } catch (error) {
      console.error(`處理未去過的國家 ${countryName} 時出錯:`, error)
    }
  })

  // 合併已去過 + 未去過
  displayCountries.value = [...visitedCountryCards, ...unvisitedCountryCards]
}

/**
* 載入資料
*/
const loadData = async () => {

  try {
    await historyTripStore.loadAllTrips()  // 載入全部資料來統計所有國家

    initCountries()

  } catch (error) {
    console.error('載入旅遊資料失敗:', error)
    // 即使載入失敗也要初始化基本清單
    initCountries()
  }
}

// ====================================
// 生命週期
// ====================================
onMounted(() => {
  loadData()
})
</script>


<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.travel-collection-footer
  width: 100%
  height: 130px
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%)
  color: #ffffff
  position: relative
  overflow-x: hidden
  overflow-y: hidden  // 修改：所有版本都禁止Y軸滾動
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15)
  // 添加觸控優化
  touch-action: pan-x pan-y

  @media (min-width: 768px)
    height: 160px

  &::before
    content: ''
    position: absolute
    top: -50%
    left: -50%
    width: 200%
    height: 200%
    background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)
    animation: sparkle 8s linear infinite
    pointer-events: none

  @keyframes sparkle
    0%
      transform: rotate(0deg)

    100%
      transform: rotate(360deg)

.footer-container
  max-width: 1200px
  margin: 0 auto
  height: 100%
  padding: 12px $spacing-md 4px
  display: flex
  flex-direction: column
  justify-content: space-between
  overflow: hidden  // 添加：防止內容溢出

  @media (min-width: 768px)
    padding: 12px $spacing-lg 6px

// ====================================
// Header 區域
// ====================================
.header-section
  display: flex
  align-items: center
  margin-bottom: $spacing-xs
  flex-shrink: 0

  @media (min-width: 768px)
    margin-bottom: $spacing-sm

.stats-badge
  background: rgba(255, 255, 255, 0.15)
  color: $text-white
  padding: 4px 8px
  border-radius: $border-radius-xl
  font-size: 12px
  font-weight: 700
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2)
  backdrop-filter: blur(10px)
  border: 1px solid rgba(255, 255, 255, 0.2)

  @media (min-width: 768px)
    padding: 6px 12px

  @media (min-width: 1024px)
    padding: 8px 16px

// ====================================
// 卡片區域
// ====================================
.cards-section
  flex: 1
  display: flex
  align-items: center
  justify-content: center
  overflow: visible
  min-height: 0
  max-height: 100%

.cards-container
  display: flex
  gap: 10px
  overflow-x: auto
  overflow-y: hidden
  align-items: center
  padding: 0 $spacing-sm
  width: 100%
  min-height: 60px
  max-height: 80px
  flex-wrap: nowrap
  -webkit-overflow-scrolling: touch
  scroll-behavior: smooth
  scrollbar-width: thin
  scrollbar-color: rgba(255, 255, 255, 0.5) rgba(255, 255, 255, 0.1)

  // 針對移動端優化觸控滾動
  @media (max-width: 767px)
    gap: 8px
    padding: 5px $spacing-sm
    padding-left: 20px
    padding-right: 20px
    box-sizing: border-box
    max-height: 70px

  @media (min-width: 768px)
    gap: 8px
    padding: 10px $spacing-md
    min-height: 70px

    &::-webkit-scrollbar
      height: 6px

  @media (min-width: 1024px)
    gap: 12px
    padding: 0 $spacing-lg
    min-height: 80px

// ====================================
// 卡片樣式
// ====================================
.card-holder
  flex-shrink: 0
  @media (max-width: 767px)
    margin: 0 2px

.travel-card
  width: 35px
  height: 45px
  position: relative
  touch-action: manipulation

  @media (min-width: 768px)
    width: 50px
    height: 65px

  @media (min-width: 1024px)
    width: 55px
    height: 70px

  &:has(.card-surface.collected):hover
    transform: scale(1.05)
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25))

.card-surface
  width: 100%
  height: 100%
  border-radius: $border-radius-md
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  text-align: center
  padding: 3px
  border: 2px solid rgba(255, 255, 255, 0.3)
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2)
  position: relative

  @media (min-width: 768px)
    padding: 4px
    border-radius: $border-radius-lg

  @media (min-width: 1024px)
    padding: 6px

// ====================================
// 已收集的卡片
// ====================================
.card-surface.collected
  background: linear-gradient(135deg,
      rgba(255, 229, 180, 0.95) 0%,
      rgba(255, 250, 205, 0.98) 50%,
      rgba(230, 243, 255, 0.95) 100%)
  border-color: #ffd93d
  box-shadow: 0 4px 12px rgba(255, 217, 61, 0.4), 0 0 0 1px rgba(255, 217, 61, 0.6)
  animation: gentleGlow 3s ease-in-out infinite alternate

  @keyframes gentleGlow
    0%
      box-shadow: 0 4px 12px rgba(255, 217, 61, 0.4), 0 0 0 1px rgba(255, 217, 61, 0.6)

    100%
      box-shadow: 0 6px 16px rgba(255, 217, 61, 0.5), 0 0 0 2px rgba(255, 217, 61, 0.7)

  &::before
    content: '✨'
    position: absolute
    top: -3px
    right: -3px
    font-size: 10px
    animation: sparkle-star 2s ease-in-out infinite

    @media (min-width: 768px)
      font-size: 12px
      top: -4px
      right: -4px

    @media (min-width: 1024px)
      font-size: 14px
      top: -6px
      right: -6px

  @keyframes sparkle-star
    0%,
    100%
      opacity: 1
      transform: scale(1) rotate(0deg)

    50%
      opacity: 0.6
      transform: scale(1.2) rotate(180deg)

// ====================================
// 未收集的卡片
// ====================================
.card-surface.locked
  background: linear-gradient(135deg,
      rgba(189, 195, 199, 0.9) 0%,
      rgba(232, 232, 232, 0.95) 100%)
  border: 2px dashed rgba(149, 165, 166, 0.8)
  opacity: 0.8

  &::after
    content: '🔒'
    position: absolute
    top: 50%
    left: 50%
    transform: translate(-50%, -50%)
    font-size: 12px
    z-index: 10
    animation: lockShake 3s ease-in-out infinite
    margin-top: -4px

    @media (min-width: 768px)
      font-size: 14px
      margin-top: -5px

    @media (min-width: 1024px)
      font-size: 16px
      margin-top: -6px

  @keyframes lockShake
    0%,
    90%,
    100%
      transform: translate(-50%, -50%) rotate(0deg)
    92%,
    96%
      transform: translate(-50%, -50%) rotate(-3deg)
    94%,
    98%
      transform: translate(-50%, -50%) rotate(3deg)

  .country-flag
    opacity: 0.2
    filter: grayscale(100%) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))

  .country-text
    opacity: 0.7
    filter: grayscale(80%) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))

// ====================================
// 國家內容
// ====================================
.country-flag
  font-size: 14px
  margin-bottom: 2px
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))
  z-index: 5
  position: relative

  @media (min-width: 768px)
    font-size: 18px
    margin-bottom: 3px

  @media (min-width: 1024px)
    font-size: 20px
    margin-bottom: 4px

.country-text
  font-size: 10px
  font-weight: 700
  color: $text-primary
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8)
  line-height: 1.1
  z-index: 5
  position: relative

  @media (min-width: 768px)
    font-size: 11px

  @media (min-width: 1024px)
    font-size: 12px

.copy-section
  display: flex
  justify-content: center
  font-size: 10px
  margin-top: 10px
</style>
