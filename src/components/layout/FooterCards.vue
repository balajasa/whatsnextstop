<template>
  <div class="footer-cards">
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
    </div>
  </div>
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

const TARGET_COUNTRIES = [
  'norway', 'finland', 'sweden', 'australia', 'new zealand', 'egypt', 'switzerland', 'united kingdom'
]

const initCountries = () => {
  const visitedRegions = new Set<string>()
  const visitedCountryCards: CountryCard[] = []

  historyTripStore.allTrips.forEach((trip) => {
    trip.destinations.forEach(destination => {
      destination.cities.forEach(city => {
        const tempTrip = {
          ...trip,
          destinations: [{ country: destination.country, cities: [city] }]
        }
        const regionInfo = historyTripStore.getDisplayRegion(tempTrip)

        if (!visitedRegions.has(regionInfo.flagCode)) {
          visitedRegions.add(regionInfo.flagCode)

          try {
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

  const unvisitedCountryCards: CountryCard[] = []

  TARGET_COUNTRIES.forEach(countryName => {
    try {
      const countryInfo = getCountryInfo(countryName)
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

  displayCountries.value = [...visitedCountryCards, ...unvisitedCountryCards]
}

const loadData = async () => {
  try {
    await historyTripStore.loadAllTrips()
    initCountries()
  } catch (error) {
    console.error('載入旅遊資料失敗:', error)
    initCountries()
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.footer-cards
  position: relative
  overflow: hidden
  width: 100%
  height: 120px
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%)
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15)
  color: #ffffff
  touch-action: pan-x pan-y

  &::before
    position: absolute
    top: -50%
    left: -50%
    width: 200%
    height: 200%
    background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)
    content: ''
    animation: sparkle 8s linear infinite
    pointer-events: none

  @keyframes sparkle
    0%
      transform: rotate(0deg)
    100%
      transform: rotate(360deg)

  @media (min-width: 768px)
    height: 150px

.footer-container
  display: flex
  overflow: hidden
  flex-direction: column
  justify-content: space-between
  margin: 0 auto
  padding: 12px $spacing-md 8px
  max-width: 1200px
  height: 100%

  @media (min-width: 768px)
    padding: 12px $spacing-lg 10px

// ====================================
// Header 區域
// ====================================
.header-section
  display: flex
  align-items: center
  flex-shrink: 0

.stats-badge
  padding: 4px 8px
  border: 1px solid rgba(255, 255, 255, 0.2)
  border-radius: $border-radius-xl
  background: rgba(255, 255, 255, 0.15)
  color: $text-white
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2)
  font-weight: 700
  font-size: 12px
  backdrop-filter: blur(10px)

  @media (min-width: 768px)
    padding: 6px 12px

  @media (min-width: 1024px)
    padding: 8px 16px

// ====================================
// 卡片區域
// ====================================
.cards-section
  display: flex
  overflow: visible
  align-items: center
  flex: 1
  justify-content: center
  margin-top: 24px
  min-height: 0
  max-height: 100%

.cards-container
  display: flex
  overflow-x: auto
  overflow-y: hidden
  -webkit-overflow-scrolling: touch
  align-items: center
  flex-wrap: nowrap
  padding: 0 $spacing-sm
  min-height: 60px
  max-height: 80px
  width: 100%
  gap: 10px
  scroll-behavior: smooth
  scrollbar-width: thin
  scrollbar-color: rgba(255, 255, 255, 0.5) rgba(255, 255, 255, 0.1)

  @media (max-width: 767px)
    box-sizing: border-box
    padding: 5px $spacing-sm
    padding-right: 20px
    padding-left: 20px
    max-height: 70px
    gap: 8px

  @media (min-width: 768px)
    padding: 10px $spacing-md
    min-height: 70px
    gap: 8px

    &::-webkit-scrollbar
      height: 6px

  @media (min-width: 1024px)
    padding: 0 $spacing-lg
    min-height: 80px
    gap: 12px

// ====================================
// 卡片樣式
// ====================================
.card-holder
  flex-shrink: 0
  @media (max-width: 767px)
    margin: 0 2px

.travel-card
  position: relative
  width: 35px
  height: 45px
  touch-action: manipulation

  @media (min-width: 768px)
    width: 50px
    height: 65px

  @media (min-width: 1024px)
    width: 55px
    height: 70px

  &:has(.card-surface.collected):hover
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25))
    transform: scale(1.05)

.card-surface
  position: relative
  display: flex
  align-items: center
  flex-direction: column
  justify-content: center
  padding: 3px
  width: 100%
  height: 100%
  border: 2px solid rgba(255, 255, 255, 0.3)
  border-radius: $border-radius-md
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2)
  text-align: center

  @media (min-width: 768px)
    padding: 4px
    border-radius: $border-radius-lg

  @media (min-width: 1024px)
    padding: 6px

// ====================================
// 已收集的卡片
// ====================================
.card-surface.collected
  border-color: #ffd93d
  background: linear-gradient(135deg,
      rgba(255, 229, 180, 0.95) 0%,
      rgba(255, 250, 205, 0.98) 50%,
      rgba(230, 243, 255, 0.95) 100%)
  box-shadow: 0 4px 12px rgba(255, 217, 61, 0.4), 0 0 0 1px rgba(255, 217, 61, 0.6)
  animation: gentleGlow 3s ease-in-out infinite alternate

  @keyframes gentleGlow
    0%
      box-shadow: 0 4px 12px rgba(255, 217, 61, 0.4), 0 0 0 1px rgba(255, 217, 61, 0.6)
    100%
      box-shadow: 0 6px 16px rgba(255, 217, 61, 0.5), 0 0 0 2px rgba(255, 217, 61, 0.7)

  &::before
    position: absolute
    top: -3px
    right: -3px
    content: '✨'
    font-size: 10px
    animation: sparkle-star 2s ease-in-out infinite

    @media (min-width: 768px)
      top: -4px
      right: -4px
      font-size: 12px

    @media (min-width: 1024px)
      top: -6px
      right: -6px
      font-size: 14px

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
  border: 2px dashed rgba(149, 165, 166, 0.8)
  background: linear-gradient(135deg,
      rgba(189, 195, 199, 0.9) 0%,
      rgba(232, 232, 232, 0.95) 100%)
  opacity: 0.8

  &::after
    position: absolute
    top: 50%
    left: 50%
    z-index: 10
    margin-top: -4px
    content: '🔒'
    font-size: 12px
    transform: translate(-50%, -50%)
    animation: lockShake 3s ease-in-out infinite

    @media (min-width: 768px)
      margin-top: -5px
      font-size: 14px

    @media (min-width: 1024px)
      margin-top: -6px
      font-size: 16px

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
  position: relative
  z-index: 5
  margin-bottom: 2px
  font-size: 14px
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))

  @media (min-width: 768px)
    margin-bottom: 3px
    font-size: 18px

  @media (min-width: 1024px)
    margin-bottom: 4px
    font-size: 20px

.country-text
  position: relative
  z-index: 5
  color: $text-primary
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8)
  font-weight: 700
  font-size: 10px
  line-height: 1.1

  @media (min-width: 768px)
    font-size: 11px

  @media (min-width: 1024px)
    font-size: 12px
</style>
