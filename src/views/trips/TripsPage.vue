<template>
  <div class="trips-page">
    <!-- 麵包屑 -->
    <BreadcrumbNav />

    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>載入旅程中...</p>
    </div>

    <!-- 錯誤狀態 -->
    <div v-if="error" class="error-section">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button @click="loadTrips" class="retry-btn">重試</button>
    </div>

    <!-- 旅程列表 -->
    <div v-if="!loading && !error" class="trips-list">
      <div v-if="trips.length === 0" class="empty-state">
        <div class="empty-icon">✈️</div>
        <h3>暫無旅程資料</h3>
        <p>還沒有建立任何旅程</p>
      </div>

      <div v-else class="trips-grid">
        <div v-for="trip in trips" :key="trip.id" class="trip-card" @click="navigateToTripSpots(trip)">
          <div class="trip-header">
            <h3 class="trip-name">{{ trip.name }}</h3>
          </div>
          <div class="trip-body">
            <div class="trip-duration">
              {{ formatTripDuration(trip) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { event } from 'vue-gtag'
import { getAllTripsWithShortId, generateTripSpotsUrl } from '../../services/spots/tripsService'
import type { TripWithShortId } from '../../services/spots/tripsService'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

const router = useRouter()

// 響應式資料
const trips = ref<TripWithShortId[]>([])
const loading = ref(true)
const error = ref('')

// 方法
const loadTrips = async () => {
  try {
    loading.value = true
    error.value = ''
    trips.value = await getAllTripsWithShortId()
  } catch (err: any) {
    error.value = err.message || '載入旅程列表失敗'
  } finally {
    loading.value = false
  }
}

const navigateToTripSpots = (trip: TripWithShortId) => {
  // GA4 追蹤
  event('trips_list_click', {
    source: 'trips_list',
    item_name: trip.name,
    item_path: `/trips/${trip.shortId}/spots`,
    category: '旅程列表',
    trip_id: trip.shortId,
    device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
  })

  const url = generateTripSpotsUrl(trip)
  router.push(url)
}

const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return dateStr
  }
}

const formatTripDuration = (trip: TripWithShortId): string => {
  // 如果有 startDate 和 endDate 欄位
  if (trip.startDate && trip.endDate) {
    return `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`
  }

  // 只有開始日期
  if (trip.startDate) {
    return `${formatDate(trip.startDate)} - 結束日期未定`
  }

  // 都沒有的話，顯示規劃狀態
  return "日期尚未決定"
}

// 生命週期
onMounted(() => {
  loadTrips()
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.trips-page
  min-height: 100vh
  padding: 0 $spacing-lg $spacing-lg

  @include tablet
    padding: 0 $spacing-lg $spacing-xl

  @include desktop
    padding: 0 $spacing-xl $spacing-xl

// 載入和錯誤狀態
.loading-section, .error-section
  text-align: center
  margin-top: $spacing-lg
  padding: $spacing-xl

  @include tablet
    margin-top: $spacing-lg
    padding: $spacing-2xl

.loading-spinner
  width: 40px
  height: 40px
  border: 3px solid rgba($spot-text-primary, 0.1)
  border-top: 3px solid $spot-text-primary
  border-radius: 50%
  animation: spin 1s linear infinite
  margin: 0 auto $spacing-lg auto

@keyframes spin
  to
    transform: rotate(360deg)

.error-icon
  font-size: 48px
  margin-bottom: $spacing-lg

.error-message
  color: $spot-text-primary
  margin-bottom: $spacing-lg

.retry-btn
  padding: $spacing-md $spacing-xl
  background: $spot-text-primary
  color: white
  border: none
  border-radius: $border-radius-md
  cursor: pointer

  &:hover
    background: rgba($spot-text-primary, 0.9)

// 旅程列表
.trips-list
  max-width: 1200px
  margin: 24px auto

.empty-state
  text-align: center
  padding: $spacing-xl

  @include tablet
    padding: $spacing-2xl

  .empty-icon
    font-size: 64px
    margin-bottom: $spacing-lg

  h3
    color: $spot-text-primary
    margin-bottom: $spacing-md

  p
    color: rgba($spot-text-primary, 0.6)

.trips-grid
  display: grid
  grid-template-columns: 1fr
  gap: $spacing-lg

  // 平板以上：多欄佈局
  @media (min-width: 768px)
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))
    gap: $spacing-xl

// 旅程卡片
.trip-card
  background: white
  border-radius: 12px
  padding: $spacing-lg
  cursor: pointer
  transition: all 0.2s ease
  border: 1px solid $border-light
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04)

  // 平板以上：較大 padding
  @media (min-width: 768px)
    padding: $spacing-xl


.trip-header
  margin-bottom: $spacing-md

.trip-name
  font-size: 1.3rem
  font-weight: 600
  color: $text-primary
  margin: 0
  line-height: 1.3

.trip-duration
  font-size: 0.9rem
  color: $text-secondary
  display: flex
  align-items: center

  &::before
    content: "📅"
    margin-right: $spacing-xs

</style>
