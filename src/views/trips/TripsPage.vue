<template>
  <div class="trips-page">
    <PageHeader subtitle="選一趟旅程，看看每日行程和要去的景點" />

    <StateView v-if="loading" type="loading" message="載入旅程中..." />

    <StateView v-else-if="error" type="error" :message="error" @action="loadTrips" />

    <StateView v-else-if="calendarTrips.length === 0" type="empty" title="還沒有旅程" message="下一趟旅程還在規劃中" />

    <!-- 一趟旅程一本桌曆：翻到出發那天；有行程才有「每日行程」、有景點才有「景點探索」 -->
    <ul v-else class="calendar-grid">
      <li v-for="trip in calendarTrips" :key="trip.key">
        <article class="calendar" :style="{ '--head': trip.color }">
          <span class="calendar__rings" aria-hidden="true">
            <span v-for="n in 4" :key="n"></span>
          </span>
          <div class="calendar__page">
            <header class="calendar__head">
              <span class="calendar__month">
                <template v-if="trip.start"><b>{{ MONTHS[trip.start.getMonth()] }}</b> {{ trip.start.getFullYear() }}</template>
                <template v-else>日期未定</template>
              </span>
              <span v-if="trip.key === upcomingKey" class="calendar__tag">即將出發</span>
            </header>

            <div class="calendar__body">
              <span :class="['calendar__date', { 'calendar__date--sunday': trip.start?.getDay() === 0 }]">
                <b>{{ trip.start ? trip.start.getDate() : '?' }}</b>
                <span>{{ trip.start ? WEEKDAYS[trip.start.getDay()] : '' }}</span>
              </span>
              <div class="calendar__info">
                <h2 class="calendar__title">{{ trip.title }}</h2>
                <span v-if="trip.subtitle" class="calendar__subtitle">{{ trip.subtitle }}</span>
                <span class="calendar__range">{{ trip.rangeText }}</span>
              </div>
            </div>

            <nav :class="['calendar__actions', { 'calendar__actions--single': !(trip.pelipperId && trip.spotsTrip) }]">
              <router-link v-if="trip.pelipperId" :to="{ name: 'ItineraryDetail', params: { tripId: trip.pelipperId } }"
                @click="trackClick(trip, 'itinerary')">
                每日行程 →
              </router-link>
              <router-link v-if="trip.spotsTrip" :to="generateTripSpotsUrl(trip.spotsTrip)" @click="trackClick(trip, 'spots')">
                景點探索 →
              </router-link>
            </nav>
          </div>
        </article>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// ===================================
// 旅程列表：景點旅程（trips）＋後台打開「前台顯示」的 pelipper 行程，合在一起一趟一本桌曆
// 後台在行程上設了 spotsTripId 的，行程和景點放同一本
// ===================================
import { computed, onMounted, ref } from 'vue'
import { event } from 'vue-gtag'
import '@fontsource/oswald/600.css'
import '@fontsource/oswald/700.css'
import PageHeader from '@/components/common/PageHeader.vue'
import StateView from '@/components/common/StateView.vue'
import { calendarColor } from '@/constants/tripCalendar'
import { getSiteTrips, type PelipperTripSummary } from '@/services/pelipper/pelipperService'
import { generateTripSpotsUrl, getAllTripsWithShortId, type TripWithShortId } from '@/services/spots/tripsService'

interface CalendarTrip {
  key: string
  title: string
  subtitle: string
  start: Date | null
  rangeText: string
  color: string
  /** 有就顯示「每日行程」 */
  pelipperId: string
  /** 有就顯示「景點探索」 */
  spotsTrip: TripWithShortId | null
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const spotsTrips = ref<TripWithShortId[]>([])
const siteTrips = ref<PelipperTripSummary[]>([])
const loading = ref(true)
const error = ref('')

const loadTrips = async () => {
  loading.value = true
  error.value = ''
  try {
    const [spots, site] = await Promise.all([
      getAllTripsWithShortId(),
      // 行程讀不到不影響景點：當作沒有行程
      getSiteTrips().catch((err) => {
        console.error('讀取行程失敗', err)
        return [] as PelipperTripSummary[]
      }),
    ])
    spotsTrips.value = spots
    siteTrips.value = site
  } catch (err) {
    error.value = err instanceof Error && err.message ? err.message : '載入旅程列表失敗'
  } finally {
    loading.value = false
  }
}

const parseDate = (value?: string): Date | null => {
  const [year, month, day] = (value ?? '').split('-').map(Number)
  return year && month && day ? new Date(year, month - 1, day) : null
}

// 2/25 – 3/11 · 15 天
const formatRange = (start: Date | null, end: Date | null): string => {
  if (!start) return '日期尚未決定'
  const short = (date: Date): string => `${date.getMonth() + 1}/${date.getDate()}`
  if (!end || end < start) return `${short(start)} 出發`
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
  return `${short(start)} – ${short(end)} · ${days} 天`
}

const toCalendarTrip = (spotsTrip: TripWithShortId | null, siteTrip: PelipperTripSummary | null): CalendarTrip => {
  // 有行程就用行程的名稱、日期（後台排行程時填的）；沒有才用景點旅程的
  const fullTitle = siteTrip?.title || spotsTrip?.name || '未命名旅程'
  const [title, ...rest] = fullTitle.split('|')
  const start = parseDate(siteTrip?.startDate || spotsTrip?.startDate)
  const end = parseDate(siteTrip?.endDate || spotsTrip?.endDate)
  const key = spotsTrip?.id ?? siteTrip!.id
  return {
    key,
    title: title.trim(),
    subtitle: rest.join('|').trim(),
    start,
    rangeText: formatRange(start, end),
    color: calendarColor(key),
    pelipperId: siteTrip?.id ?? '',
    spotsTrip,
  }
}

// 景點旅程各一本（有連結的行程放進同一本），沒連結景點的行程自己一本；出發日期新的在前
const calendarTrips = computed<CalendarTrip[]>(() => {
  const linked = new Set<string>()
  const fromSpots = spotsTrips.value.map((spotsTrip) => {
    const siteTrip = siteTrips.value.find((trip) => trip.spotsTripId === spotsTrip.id) ?? null
    if (siteTrip) linked.add(siteTrip.id)
    return toCalendarTrip(spotsTrip, siteTrip)
  })
  const siteOnly = siteTrips.value.filter((trip) => !linked.has(trip.id)).map((trip) => toCalendarTrip(null, trip))
  return [...fromSpots, ...siteOnly].sort((a, b) => (b.start?.getTime() ?? -Infinity) - (a.start?.getTime() ?? -Infinity))
})

// 即將出發：今天以後最近出發的那一趟
const upcomingKey = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcoming = calendarTrips.value
    .filter((trip) => trip.start && trip.start >= today)
    .sort((a, b) => a.start!.getTime() - b.start!.getTime())
  return upcoming[0]?.key ?? null
})

const trackClick = (trip: CalendarTrip, target: 'itinerary' | 'spots'): void => {
  event('trips_list_click', {
    source: 'trips_list',
    item_name: trip.title,
    item_path: target === 'itinerary' ? `/itinerary/${trip.pelipperId}` : `/trips/${trip.spotsTrip?.shortId}/spots`,
    category: target === 'itinerary' ? '旅程列表・每日行程' : '旅程列表・景點探索',
    trip_id: target === 'itinerary' ? trip.pelipperId : trip.spotsTrip?.shortId,
    device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
  })
}

onMounted(loadTrips)
</script>

<style lang="sass" scoped>
// 日曆用的數字字體（窄長粗體）
$font-calendar: 'Oswald', 'Arial Narrow', sans-serif
$calendar-ink: #2B2724
$calendar-muted: #77706A
$calendar-red: #D7362B
$calendar-dash: #D9D1C5

// 手機一欄、平板兩欄、電腦三欄
.calendar-grid
  display: grid
  grid-template-columns: 1fr
  gap: 28px
  margin: 0
  padding: 8px 0 0
  list-style: none
  @include tablet
    grid-template-columns: repeat(2, minmax(0, 1fr))
    gap: 32px 24px
  @include desktop
    grid-template-columns: repeat(3, minmax(0, 1fr))

// ===================================
// 桌曆
// ===================================
.calendar
  position: relative
  padding-top: 12px

// 頂端的線圈
.calendar__rings
  position: absolute
  top: 0
  right: 0
  left: 0
  z-index: 1
  display: flex
  justify-content: space-evenly
  span
    width: 8px
    height: 22px
    border-radius: 5px
    background: linear-gradient(90deg, #8E8780, #E2DDD6, #8E8780)

// 紙張：底下疊兩張，像一整本
.calendar__page
  overflow: hidden
  border-radius: 10px
  background: #fff
  box-shadow: 0 1px 0 $nb-line, 0 6px 0 -2px #F1ECE4, 0 10px 0 -4px #E6DFD4, 0 14px 18px -8px rgba(43, 39, 36, 0.22)

.calendar__head
  display: flex
  align-items: center
  justify-content: space-between
  padding: 12px 16px 6px
  background: var(--head)
  color: #fff

.calendar__month
  font-family: $font-calendar
  font-size: 14px
  letter-spacing: 2px
  b
    font-weight: 700
    font-size: 16px

.calendar__tag
  padding: 1px 7px
  border-radius: 3px
  background: #fff
  color: var(--head)
  font-weight: 700
  font-size: 11px

.calendar__body
  display: flex
  align-items: center
  gap: 18px
  padding: 18px 20px

// 日期方塊：出發日＋星期；星期日紅色
.calendar__date
  display: flex
  flex-shrink: 0
  flex-direction: column
  align-items: center
  justify-content: center
  padding: 6px 0 8px
  width: 68px
  border: 1.5px solid #ECE6DD
  border-radius: 8px
  color: $calendar-ink
  b
    font-family: $font-calendar
    font-weight: 600
    font-size: 40px
    line-height: 1.05
  span
    color: $calendar-muted
    font-family: $font-calendar
    font-size: 12px
    letter-spacing: 2px

.calendar__date--sunday
  b,
  span
    color: $calendar-red

.calendar__info
  display: flex
  flex-direction: column
  gap: 2px
  min-width: 0

.calendar__title
  margin: 0
  color: $calendar-ink
  font-weight: 700
  font-size: 19px
  font-family: $font-body
  line-height: 1.35
  letter-spacing: 0.5px

.calendar__subtitle
  color: $calendar-muted
  font-size: 13px

.calendar__range
  margin-top: 4px
  color: $calendar-muted
  font-size: 13px
  font-variant-numeric: tabular-nums

// 入口：虛線分兩格；只有一個入口就一整格
.calendar__actions
  display: grid
  grid-template-columns: 1fr 1fr
  border-top: 1.5px dashed $calendar-dash
  a
    padding: 12px 0
    color: $calendar-ink
    font-weight: 700
    font-size: 14px
    text-align: center
    text-decoration: none
    transition: color 0.2s ease
    &:hover
      color: var(--head)
    &:focus-visible
      outline: 2px solid var(--head)
      outline-offset: -4px
    & + a
      border-left: 1.5px dashed $calendar-dash

.calendar__actions--single
  grid-template-columns: 1fr
</style>
