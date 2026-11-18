<template>
  <section class="trip-window-card">
    <!-- 一排飛機窗（手機 1 扇、平板 2 扇、電腦 3 扇）：窗外天色看瀏覽者所在地的時間，打開頁面時決定 -->
    <div class="windows" aria-hidden="true">
      <div v-for="index in 3" :key="index" class="window" :style="{ '--offset': `${(index - 1) * -3}s` }">
        <div :class="['sky', `sky--${sky}`]">
          <span class="stars"></span>
          <span class="orb"></span>
          <span v-if="showAurora" class="aurora"></span>
          <span class="cloud cloud--1"></span>
          <span class="cloud cloud--2"></span>
          <span class="cloud cloud--3"></span>
          <span class="glare"></span>
        </div>
      </div>
    </div>

    <div class="trip-text">
      <h2 class="trip-title">{{ titleParts.main }}</h2>
      <span v-if="titleParts.sub" class="trip-sub">{{ titleParts.sub }}</span>
      <span class="trip-meta">{{ dateText }}</span>
      <router-link :to="{ name: 'ItineraryDetail', params: { tripId: trip.id } }" class="trip-cta" @click="trackClick">
        看行程 →
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
// ===================================
// 首頁行程卡：後台打開「前台顯示」的行程，用飛機窗呈現
// 窗外天色看 useSky；北歐行程的夜晚多了極光
// ===================================
import { computed } from 'vue'
import { event } from 'vue-gtag'
import { getSky } from '@/composables/useSky'
import { AURORA_COUNTRIES } from '@/constants/tripWindow'
import type { PelipperTripSummary } from '@/services/pelipper/pelipperService'

const props = defineProps<{ trip: PelipperTripSummary }>()

// 打開頁面時決定一次，重新整理才會換
const sky = getSky()

const showAurora = computed(
  () => sky === 'night' && props.trip.countries.some((code) => AURORA_COUNTRIES.includes(code))
)

// 「主標 | 副標」拆成兩行；沒有 | 就只有一行
const titleParts = computed(() => {
  const [main, ...rest] = props.trip.title.split('|')
  return { main: main.trim(), sub: rest.join('|').trim() }
})

const parseDate = (value: string): Date | null => {
  const [year, month, day] = value.split('-').map(Number)
  return year && month && day ? new Date(year, month - 1, day) : null
}

// 2/25 – 3/11 · 15 天
const dateText = computed(() => {
  const start = parseDate(props.trip.startDate)
  const end = parseDate(props.trip.endDate)
  if (!start) return '日期尚未決定'
  const short = (date: Date): string => `${date.getMonth() + 1}/${date.getDate()}`
  if (!end || end < start) return short(start)
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
  return `${short(start)} – ${short(end)} · ${days} 天`
})

const trackClick = (): void => {
  event('home_card_click', {
    source: 'home_trip_window',
    item_name: props.trip.title,
    item_path: 'ItineraryDetail',
    category: '首頁行程卡',
    sky,
    device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
  })
}
</script>

<style lang="sass" scoped>
// ===================================
// 卡片
// ===================================
.trip-window-card
  display: flex
  align-items: center
  gap: 16px
  // 跟貓咪卡一樣的上下間距
  margin-bottom: $spacing-xl
  padding: 16px
  border: 1px solid $nb-line
  border-radius: 18px
  background: $nb-card
  box-shadow: $nb-card-shadow
  color: $nb-ink
  // 平板以上：文字在左、一排窗在右
  @include tablet
    justify-content: space-between
    gap: 32px
    margin-bottom: 44px
    padding: 28px 36px 28px 40px
  @include desktop
    padding: 34px 56px 34px 52px

.trip-text
  display: flex
  flex-direction: column
  gap: 6px
  min-width: 0
  @include tablet
    order: 1

.windows
  display: flex
  flex-shrink: 0
  gap: 32px
  @include tablet
    order: 2
  @include desktop
    gap: 46px

// 行程名稱用方正的黑體（跟旅程列表的桌曆一樣），黑體看起來比手寫字大，字級跟著調小一點
.trip-title
  margin: 0
  font-weight: 700
  font-size: 20px
  font-family: $font-body
  line-height: 1.35
  letter-spacing: 0.5px
  text-wrap: balance
  @include tablet
    font-size: 26px
  @include desktop
    font-size: 30px

.trip-sub
  color: $nb-muted
  font-size: 14px
  font-family: $font-body
  @include tablet
    font-size: 16px
  @include desktop
    font-size: 17px

.trip-meta
  color: $nb-muted
  font-size: 13px
  font-variant-numeric: tabular-nums
  @include tablet
    font-size: 15px
  @include desktop
    font-size: 16px

.trip-cta
  align-self: flex-start
  margin-top: 6px
  padding: 6px 14px
  border-radius: 999px
  background: $nb-accent
  color: $nb-card
  font-weight: 700
  font-size: 13px
  text-decoration: none
  transition: background 0.2s ease
  @include tablet
    margin-top: 10px
    padding: 9px 20px
    font-size: 15px
  @include desktop
    padding: 10px 22px
    font-size: 16px
  &:hover
    background: $nb-accent-hover
  &:focus-visible
    outline: 2px solid $nb-ink
    outline-offset: 3px

// ===================================
// 飛機窗
// ===================================
.window
  position: relative
  flex-shrink: 0
  padding: 9px
  width: 120px
  height: 160px
  border-radius: 60px
  background: linear-gradient(145deg, #F4EEE4, #DCD2C2)
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 3px 8px rgba(58, 51, 44, 0.25)
  @include tablet
    padding: 11px
    width: 150px
    height: 200px
    border-radius: 75px
  // 手機只顯示第 1 扇、平板 2 扇、電腦 3 扇
  &:nth-child(n + 2)
    display: none
  @include tablet
    &:nth-child(2)
      display: block
  @include desktop
    &:nth-child(3)
      display: block

// 同一片天空：左邊的窗稍暗、越往右越亮
@include tablet
  .window:nth-child(1) .sky
    filter: brightness(0.96)
@include desktop
  .window:nth-child(1) .sky
    filter: brightness(0.94) saturate(1.05)
  .window:nth-child(2) .sky
    filter: brightness(0.97)

// 太陽／月亮只出現在一扇窗：最右邊那扇；清晨的太陽從中間升起（電腦版第 2 扇）
.orb
  display: none
.window:nth-child(1) .orb
  display: block
@include tablet
  .window:nth-child(1) .sky:not(.sky--dawn) .orb
    display: none
  .window:nth-child(2) .sky:not(.sky--dawn) .orb
    display: block
@include desktop
  .window:nth-child(1) .sky--dawn .orb,
  .window:nth-child(2) .sky:not(.sky--dawn) .orb
    display: none
  .window:nth-child(2) .sky--dawn .orb,
  .window:nth-child(3) .sky:not(.sky--dawn) .orb
    display: block

.sky
  --cloud: rgba(255, 255, 255, 0.92)
  position: relative
  overflow: hidden
  width: 100%
  height: 100%
  border-radius: 52px
  box-shadow: inset 0 0 0 3px #CFC4B2, inset 0 6px 14px rgba(0, 0, 0, 0.35)
  @include tablet
    border-radius: 64px

.glare
  position: absolute
  inset: 0
  border-radius: inherit
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.25), transparent 35%)
  pointer-events: none

.orb
  position: absolute
  border-radius: 50%

// .orb 的 display 由上面「只出現在一扇窗」的規則決定

.stars
  position: absolute
  inset: 0
  background-image: radial-gradient(1px 1px at 20% 15%, #fff, transparent), radial-gradient(1px 1px at 70% 10%, #fff, transparent), radial-gradient(1.2px 1.2px at 45% 28%, #fff, transparent), radial-gradient(1px 1px at 85% 35%, #fff, transparent), radial-gradient(1px 1px at 30% 42%, #fff, transparent), radial-gradient(1px 1px at 60% 50%, #fff, transparent), radial-gradient(1.2px 1.2px at 12% 55%, #fff, transparent)

.aurora
  position: absolute
  top: 6%
  right: -30%
  left: -30%
  height: 48%
  background: radial-gradient(ellipse 50% 40% at 40% 60%, rgba(110, 255, 180, 0.65), transparent 70%), radial-gradient(ellipse 40% 35% at 70% 40%, rgba(150, 120, 255, 0.45), transparent 70%)
  filter: blur(4px)
  animation: aurora 6s ease-in-out infinite alternate

@keyframes aurora
  from
    opacity: 0.75
    transform: translateX(-8%) skewX(-6deg)
  to
    opacity: 1
    transform: translateX(8%) skewX(6deg)

.cloud
  position: absolute
  height: 18px
  border-radius: 20px
  background: var(--cloud)
  filter: blur(1px)
  animation: drift linear infinite
  &::before,
  &::after
    content: ''
    position: absolute
    border-radius: 50%
    background: inherit
  &::before
    top: -11px
    left: 8px
    width: 22px
    height: 22px
  &::after
    top: -7px
    left: 24px
    width: 16px
    height: 16px

// 每扇窗的雲錯開（--offset 由第幾扇窗決定），看起來像一路飄過去
.cloud--1
  bottom: 26px
  width: 50px
  animation-duration: 9s
  animation-delay: var(--offset, 0s)

.cloud--2
  bottom: 52px
  width: 38px
  opacity: 0.75
  animation-duration: 13s
  animation-delay: calc(var(--offset, 0s) - 6s)

.cloud--3
  bottom: 6px
  width: 60px
  animation-duration: 7s
  animation-delay: calc(var(--offset, 0s) - 3s)

@keyframes drift
  from
    transform: translateX(160px)
  to
    transform: translateX(-80px)

// 清晨：晨藍轉淡黃，上方殘留星星，太陽剛從中間露出
.sky--dawn
  background: linear-gradient(180deg, #4F6FA8 0%, #7E9DCB 35%, #BCD0E6 68%, #FFEBB8 100%)
  --cloud: rgba(255, 255, 255, 0.9)
  .stars
    opacity: 0.55
    mask-image: linear-gradient(180deg, #000 0%, transparent 45%)
  .orb
    bottom: -14px
    left: 50%
    margin-left: -17px
    width: 34px
    height: 34px
    background: #FFF1C2
    box-shadow: 0 0 26px 14px rgba(255, 232, 160, 0.85)

// 白天：藍天、太陽、白雲
.sky--day
  background: linear-gradient(180deg, #3F86C2 0%, #79B4E0 45%, #BFE0F4 80%, #E8F4FB 100%)
  .stars
    display: none
  .orb
    top: 20px
    right: 14px
    width: 28px
    height: 28px
    background: #FFF6CC
    box-shadow: 0 0 24px 10px rgba(255, 240, 170, 0.75)

// 黃昏：藍灰轉金橘，大夕陽在左下，亮色雲帶橘邊
.sky--dusk
  background: linear-gradient(180deg, #5F74AC 0%, #B58BA0 30%, #EE9A62 60%, #F8BF64 85%, #FFD88A 100%)
  --cloud: rgba(255, 226, 196, 0.92)
  .stars
    display: none
  .cloud
    box-shadow: 0 3px 0 rgba(240, 140, 80, 0.55)
  .orb
    bottom: 4px
    left: 10px
    width: 44px
    height: 44px
    background: radial-gradient(circle, #FFE08A 40%, #FF9A3C 65%, rgba(255, 120, 50, 0) 75%)
    box-shadow: 0 0 34px 16px rgba(255, 110, 50, 0.6)

// 夜晚：深藍夜空、星星、月亮
.sky--night
  background: linear-gradient(180deg, #0B1530 0%, #1A2F52 50%, #2D4C70 100%)
  --cloud: rgba(170, 190, 215, 0.55)
  .orb
    top: 22px
    right: 18px
    width: 22px
    height: 22px
    background: #F3EED8
    box-shadow: inset -6px -2px 0 0 #D9D2B8, 0 0 16px 4px rgba(243, 238, 216, 0.35)

@media (prefers-reduced-motion: reduce)
  .aurora,
  .cloud
    animation: none
</style>
