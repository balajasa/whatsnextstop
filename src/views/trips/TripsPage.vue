<template>
  <div class="trips-page">
    <PageHeader subtitle="點一趟旅程，看看這次要去哪些景點" />

    <StateView v-if="loading" type="loading" message="載入旅程中..." />

    <StateView v-if="error" type="error" :message="error" @action="loadTrips" />

    <template v-if="!loading && !error">
      <StateView v-if="trips.length === 0" type="empty" title="還沒有旅程" message="下一趟旅程還在規劃中" />

      <ul v-else class="trips-grid">
        <li v-for="trip in trips" :key="trip.id">
          <button type="button" class="ticket" @click="navigateToTripSpots(trip)">
            <span class="ticket__top">
              <span class="ticket__meta">
                <span v-if="trip.id === upcomingTripId" class="ticket__badge">即將出發</span>
                <span v-else class="ticket__year">{{ getYear(trip) }}</span>
                <svg class="ticket__pin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
              </span>
              <span class="ticket__name">{{ trip.name }}</span>
            </span>
            <span class="ticket__perforation" aria-hidden="true"></span>
            <span class="ticket__bottom">
              <span class="ticket__info">
                <span class="ticket__date">{{ formatTripDuration(trip) }}</span>
                <span v-if="getDays(trip)" class="ticket__days">{{ getDays(trip) }} 天</span>
              </span>
              <span class="ticket__go" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </span>
          </button>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { event } from 'vue-gtag'
import { getAllTripsWithShortId, generateTripSpotsUrl } from '../../services/spots/tripsService'
import type { TripWithShortId } from '../../services/spots/tripsService'
import PageHeader from '@/components/common/PageHeader.vue'
import StateView from '@/components/common/StateView.vue'

const router = useRouter()

const trips = ref<TripWithShortId[]>([])
const loading = ref(true)
const error = ref('')

const loadTrips = async () => {
  try {
    loading.value = true
    error.value = ''
    trips.value = await getAllTripsWithShortId()
  } catch (err) {
    error.value = err instanceof Error && err.message ? err.message : '載入旅程列表失敗'
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
  if (trip.startDate && trip.endDate) {
    return `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`
  }

  if (trip.startDate) {
    return `${formatDate(trip.startDate)} - 結束日期未定`
  }

  return "日期尚未決定"
}

const getDays = (trip: TripWithShortId): number | null => {
  if (!trip.startDate || !trip.endDate) return null
  const start = new Date(trip.startDate).getTime()
  const end = new Date(trip.endDate).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null
  return Math.round((end - start) / 86400000) + 1
}

const getYear = (trip: TripWithShortId): string => {
  if (!trip.startDate) return '日期未定'
  const year = new Date(trip.startDate).getFullYear()
  return Number.isNaN(year) ? '日期未定' : String(year)
}

const upcomingTripId = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcoming = trips.value
    .filter((trip) => trip.startDate && new Date(trip.startDate) >= today)
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())
  return upcoming[0]?.id ?? null
})

onMounted(() => {
  loadTrips()
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.trips-grid
  display: grid
  grid-template-columns: 1fr
  gap: $spacing-md
  margin: 0
  padding: 8px 0 0
  list-style: none
  @include tablet
    grid-template-columns: repeat(2, minmax(0, 1fr))
    gap: 28px 24px
  @include desktop
    grid-template-columns: repeat(3, minmax(0, 1fr))

// 票根卡片
.ticket
  --notch: 16px
  position: relative
  display: flex
  flex-direction: column
  width: 100%
  padding: 0
  border: 1px solid $nb-line
  border-radius: 16px
  background: $nb-card
  box-shadow: $nb-card-shadow
  color: $nb-ink
  text-align: left
  cursor: pointer
  transition: transform 0.2s ease

  &:hover
    transform: translateY(-3px) rotate(-0.4deg)

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 3px

.ticket__top
  display: flex
  flex-direction: column
  gap: 10px
  padding: 18px 20px 14px
  @include tablet
    padding: 22px 24px 18px

.ticket__meta
  display: flex
  align-items: center
  justify-content: space-between

.ticket__badge
  padding: 4px 10px
  border-radius: 999px
  background: $nb-yellow
  font-size: 12px
  font-weight: 700

.ticket__year
  font-size: 12px
  letter-spacing: 2px
  color: $nb-muted

.ticket__pin
  color: $nb-go

.ticket__name
  font-family: $font-display
  font-size: 22px
  font-weight: 700
  line-height: 1.3
  @include tablet
    font-size: 26px

// 撕線與兩側缺口
.ticket__perforation
  position: relative
  margin: 0 14px
  border-top: 2px dashed #D9CBB3

  &::before, &::after
    content: ''
    position: absolute
    top: calc(var(--notch) / -2 - 1px)
    width: var(--notch)
    height: var(--notch)
    border-radius: 50%
    background: $nb-paper

  &::before
    left: calc(-14px - var(--notch) / 2 - 1px)
    border-right: 1px solid $nb-line

  &::after
    right: calc(-14px - var(--notch) / 2 - 1px)
    border-left: 1px solid $nb-line

.ticket__bottom
  display: flex
  align-items: center
  justify-content: space-between
  gap: 12px
  padding: 14px 20px 16px
  @include tablet
    padding: 16px 24px 20px

.ticket__info
  display: flex
  flex-direction: column
  gap: 4px

.ticket__date
  font-size: 14px
  color: $nb-muted

.ticket__days
  font-size: 15px
  font-weight: 700
  color: $nb-go-strong

.ticket__go
  display: flex
  flex-shrink: 0
  align-items: center
  justify-content: center
  width: 40px
  height: 40px
  border-radius: 50%
  background: $nb-go-soft
  color: $nb-go-strong
</style>
