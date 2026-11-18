<template>
  <div class="itinerary-page">
    <PageHeader />

    <!-- 後台打開「前台顯示」的行程：點進去看詳細行程 -->
    <StateView v-if="loading" type="loading" />
    <StateView v-else-if="error" type="error" :message="error" @action="loadTrips" />
    <ul v-else-if="trips.length" class="trip-list" aria-label="行程">
      <li v-for="trip in trips" :key="trip.id">
        <router-link :to="{ name: 'ItineraryDetail', params: { tripId: trip.id } }" class="trip-card"
          @click="trackTripClick(trip)">
          <span class="trip-card__text">
            <span class="trip-card__title">{{ trip.title || '未命名行程' }}</span>
            <span class="trip-card__date">{{ formatDateRange(trip) }}</span>
          </span>
          <span class="trip-card__go" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </router-link>
      </li>
    </ul>

    <!-- 有連結時顯示 Canva 行程表，外面包一層貼紙膠帶的紙框 -->
    <section v-if="canvaUrl" class="canva-frame" aria-label="行程表">
      <span class="tape tape--blue" aria-hidden="true"></span>
      <span class="tape tape--yellow" aria-hidden="true"></span>
      <div class="iframe-wrapper">
        <iframe loading="lazy" class="canva-iframe" :src="canvaUrl" title="行程表" allowfullscreen
          allow="fullscreen"></iframe>
      </div>
    </section>

    <!-- 沒有行程也沒有 Canva 連結 -->
    <StateView v-else-if="!loading && !error && !trips.length" type="empty" title="下一趟旅程"
      message="正在擲飛鏢決定中..." />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { event } from 'vue-gtag'
import PageHeader from '@/components/common/PageHeader.vue'
import StateView from '@/components/common/StateView.vue'
import { ITINERARY_CANVA_URL } from '@/constants/itinerary'
import { getSiteTrips, type PelipperTripSummary } from '@/services/pelipper/pelipperService'

// Canva 網址
const canvaUrl = ITINERARY_CANVA_URL

const trips = ref<PelipperTripSummary[]>([])
const loading = ref(true)
const error = ref('')

const loadTrips = async (): Promise<void> => {
  loading.value = true
  error.value = ''
  try {
    trips.value = await getSiteTrips()
  } catch (err) {
    console.error('讀取行程列表失敗', err)
    error.value = '讀取行程列表失敗'
  } finally {
    loading.value = false
  }
}

// 2027-02-25 → 2027/02/25；同一天只寫一次
const formatDateRange = (trip: PelipperTripSummary): string => {
  const format = (date: string): string => date.replaceAll('-', '/')
  if (!trip.startDate) return '日期尚未決定'
  if (!trip.endDate || trip.endDate === trip.startDate) return format(trip.startDate)
  return `${format(trip.startDate)} – ${format(trip.endDate)}`
}

const trackTripClick = (trip: PelipperTripSummary): void => {
  event('itinerary_trip_click', {
    source: 'itinerary_list',
    item_name: trip.title,
    item_path: `/itinerary/${trip.id}`,
    category: '行程規劃',
    device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
  })
}

onMounted(loadTrips)
</script>

<style lang="sass" scoped>
// ===================================
// 行程列表
// ===================================
.trip-list
  display: grid
  gap: 14px
  max-width: 900px
  margin: 8px auto 0
  padding: 0
  list-style: none
  @include tablet
    grid-template-columns: repeat(2, minmax(0, 1fr))
    gap: 18px

.trip-card
  display: flex
  align-items: center
  justify-content: space-between
  gap: 12px
  padding: 18px 20px
  border: 1px solid $nb-line
  border-radius: 16px
  background: $nb-card
  box-shadow: $nb-card-shadow
  color: $nb-ink
  text-decoration: none
  transition: transform 0.2s ease
  @include tablet
    padding: 22px 24px

  &:hover
    transform: translateY(-3px) rotate(-0.4deg)

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 3px

.trip-card__text
  display: flex
  flex-direction: column
  gap: 6px
  min-width: 0

.trip-card__title
  font-family: $font-display
  font-size: 20px
  font-weight: 700
  line-height: 1.3
  @include tablet
    font-size: 22px

.trip-card__date
  font-size: 14px
  color: $nb-muted

.trip-card__go
  display: flex
  flex-shrink: 0
  align-items: center
  justify-content: center
  width: 40px
  height: 40px
  border-radius: 50%
  background: $nb-go-soft
  color: $nb-go-strong

// 紙框
.canva-frame
  position: relative
  margin: 8px auto 0

  // 上面有行程列表時拉開距離
  .trip-list + &
    margin-top: 32px
  max-width: 900px
  padding: 8px
  border: 1px solid $nb-line
  border-radius: 16px
  background: $nb-card
  box-shadow: $nb-card-shadow
  @include tablet
    padding: 16px
    border-radius: 20px

.tape
  position: absolute
  top: -10px
  z-index: 1
  width: 64px
  height: 20px
  pointer-events: none
  @include tablet
    top: -12px
    width: 110px
    height: 28px

.tape--blue
  left: 24px
  background: $nb-tape-blue
  transform: rotate(-4deg)
  @include tablet
    left: 48px

.tape--yellow
  right: 24px
  background: $nb-tape-yellow
  transform: rotate(4deg)
  @include tablet
    right: 48px

// iframe 包裝器
.iframe-wrapper
  position: relative
  overflow: hidden
  // 手機：撐滿可視高度（扣掉 Header、頁首、底部 tab）
  height: max(480px, calc(100dvh - 260px))
  border-radius: 10px
  background: $nb-paper

  // 平板以上：用比例控制
  @include tablet
    height: 0
    padding-top: 120%

  @include desktop
    padding-top: 130%

  @include large-desktop
    padding-top: 120%

.canva-iframe
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  border: none
</style>
