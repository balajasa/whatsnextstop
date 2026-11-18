<template>
  <div class="itinerary-detail-page">
    <!-- 只放麵包屑，不放大標題 -->
    <BreadcrumbNav class="detail-header" :manual-items="breadcrumbItems" />

    <div class="detail-layout" :class="{ 'has-toc': outline }">
      <!-- 桌機：左側目錄 -->
      <nav v-if="outline" class="toc" aria-label="行程目錄">
        <div class="toc__group-title">行程資訊</div>
        <a v-for="item in infoItems" :key="item.id" :href="`#${item.id}`" class="toc__item"
          :class="{ 'is-active': activeSection === item.id }"
          :aria-current="activeSection === item.id ? 'true' : undefined" @click.prevent="scrollToSection(item.id)">
          {{ item.label }}
        </a>
        <template v-if="dayItems.length">
          <div class="toc__divider" aria-hidden="true"></div>
          <div class="toc__group-title">每日行程</div>
          <div class="toc__days">
            <a v-for="item in dayItems" :key="item.id" :href="`#${item.id}`" class="toc__item"
              :class="{ 'is-active': activeSection === item.id }"
              :aria-current="activeSection === item.id ? 'true' : undefined" @click.prevent="scrollToSection(item.id)">
              {{ item.label }}
            </a>
          </div>
        </template>
      </nav>

      <!-- 行程內容：pelipper 套件（載入中、找不到、Coming Soon 也由它顯示） -->
      <div class="trip-content">
        <PelipperTrip :trip-id="tripId" :is-visible="isVisible" @loaded="onLoaded" />
      </div>
    </div>

    <!-- 手機／平板：懸浮目錄，平常在回到頂部的位置，回到頂部出現時往上疊一格 -->
    <!-- 區塊照頁面順序，每日行程的天數排成方格接在下面（5 欄），不用在選單裡捲 -->
    <template v-if="outline">
      <div v-if="menuOpen" class="float-menu-backdrop" aria-hidden="true" @click="closeMenu"></div>
      <nav v-show="menuOpen" id="float-menu" ref="menuPanel" class="float-menu" :class="{ 'is-raised': showBackToTop }"
        aria-label="章節">
        <template v-for="section in outline.sections" :key="section.id">
          <a :href="`#${section.id}`" class="float-menu__item" :class="{ 'is-active': isSectionActive(section) }"
            :aria-current="isSectionActive(section) ? 'true' : undefined" @click.prevent="jumpFromMenu(section.id)">
            {{ section.name }}
          </a>
          <div v-if="section.type === 'daily' && dayItems.length" class="float-menu__days">
            <a v-for="day in dayItems" :key="day.id" :href="`#${day.id}`" class="float-menu__day"
              :class="{ 'is-active': activeSection === day.id }"
              :aria-current="activeSection === day.id ? 'true' : undefined" :aria-label="`${day.label}，${day.date}`"
              @click.prevent="jumpFromMenu(day.id)">
              <span class="float-menu__day-number">D{{ day.dayNumber }}</span>
              <span class="float-menu__day-date">{{ day.date }}</span>
            </a>
          </div>
        </template>
      </nav>
      <button ref="menuButton" type="button" class="float-menu-button"
        :class="{ 'is-raised': showBackToTop, 'is-open': menuOpen }" :aria-expanded="menuOpen"
        aria-controls="float-menu" :aria-label="menuOpen ? '關閉目錄' : '開啟目錄'" @click="toggleMenu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path v-if="menuOpen" d="M6 6l12 12M18 6L6 18" />
          <path v-else d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      </button>
    </template>

    <!-- 回到頂部按鈕 -->
    <button v-show="showBackToTop" type="button" class="back-to-top" aria-label="回到頂部" @click="scrollToTop">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 19V5M6 11l6-6 6 6" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { PelipperTrip, setFirestore, type Trip, type TripOutline } from '@pelipper/pelipper'
import '@pelipper/pelipper/style.css'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import { db } from '@/firebase'
import type { BreadcrumbItem } from '@/types/common/ui-layout'

// pelipper 用前台的 Firestore
setFirestore(db)

const props = defineProps<{ tripId: string }>()

const route = useRoute()

// 前台只顯示後台打開「前台顯示」的行程，其他顯示 Coming Soon
const isVisible = (trip: Trip): boolean => trip.showOnSite === true

interface MenuItem {
  id: string
  label: string
}

interface DayItem extends MenuItem {
  dayNumber: number
  date: string
}

const shortDate = (date: string): string => {
  const [, month, day] = date.split('-')
  return month && day ? `${Number(month)}/${Number(day)}` : date
}

const outline = ref<TripOutline | null>(null)
const showBackToTop = ref(false)
const activeSection = ref('')

const breadcrumbItems = computed<BreadcrumbItem[] | null>(() =>
  outline.value ? [{ text: '行程規劃', path: '/itinerary' }, { text: outline.value.title }] : null
)

// 桌機目錄：行程資訊
const infoItems = computed<MenuItem[]>(() =>
  (outline.value?.sections ?? [])
    .filter((section) => section.type !== 'daily')
    .map((section) => ({ id: section.id, label: section.name }))
)

const dayItems = computed<DayItem[]>(() =>
  (outline.value?.days ?? []).map((day) => ({
    id: day.anchor,
    label: `Day ${day.dayNumber}`,
    dayNumber: day.dayNumber,
    date: shortDate(day.date),
  }))
)

const pageItems = computed<MenuItem[]>(() =>
  (outline.value?.sections ?? []).flatMap((section) =>
    section.type === 'daily' && dayItems.value.length ? dayItems.value : [{ id: section.id, label: section.name }]
  )
)

const isSectionActive = (section: TripOutline['sections'][number]): boolean =>
  activeSection.value === section.id ||
  (section.type === 'daily' && dayItems.value.some((day) => day.id === activeSection.value))

// 手機／平板的目錄選單
const menuOpen = ref(false)
const menuPanel = ref<HTMLElement | null>(null)
const menuButton = ref<HTMLButtonElement | null>(null)

const openMenu = async (): Promise<void> => {
  menuOpen.value = true
  await nextTick()
  // 選單比螢幕高時，先捲到目前所在的那一項
  menuPanel.value?.querySelector<HTMLElement>('.is-active')?.scrollIntoView({ block: 'nearest' })
  menuPanel.value?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
}

const closeMenu = (): void => {
  menuOpen.value = false
}

const toggleMenu = (): void => {
  if (menuOpen.value) closeMenu()
  else openMenu()
}

const jumpFromMenu = (sectionId: string): void => {
  closeMenu()
  scrollToSection(sectionId)
}

// Esc 關掉選單，焦點回到按鈕
const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key !== 'Escape' || !menuOpen.value) return
  closeMenu()
  menuButton.value?.focus()
}

// 上方被蓋住的高度：Header（手機 56、平板以上 72）＋一點留白
const scrollOffset = (): number => (window.innerWidth >= 768 ? 72 : 56) + 16

const scrollToSection = (sectionId: string): void => {
  const element = document.getElementById(sectionId)
  if (!element) return
  const top = element.getBoundingClientRect().top + window.scrollY - scrollOffset()
  window.scrollTo({ top, behavior: 'smooth' })
}

const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 更新目前所在的區塊：最後一個已經捲到上方的
const updateActiveSection = (): void => {
  const threshold = scrollOffset() + 8
  const items = pageItems.value
  for (let i = items.length - 1; i >= 0; i--) {
    const section = document.getElementById(items[i].id)
    if (section && section.getBoundingClientRect().top <= threshold) {
      activeSection.value = items[i].id
      return
    }
  }
  activeSection.value = items[0]?.id ?? ''
}

const handleScroll = (): void => {
  showBackToTop.value = window.scrollY > 300
  if (outline.value) updateActiveSection()
}

const onLoaded = async (loaded: TripOutline | null): Promise<void> => {
  outline.value = loaded
  if (!loaded) return
  await nextTick()
  updateActiveSection()
  if (route.hash) {
    const sectionId = route.hash.substring(1)
    setTimeout(() => scrollToSection(sectionId), 100)
  }
}

// 換行程時先收起舊的目錄，等新的大綱
watch(() => props.tripId, () => {
  outline.value = null
  activeSection.value = ''
  closeMenu()
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="sass" scoped>
// ===================================
// 頁首：只有麵包屑
.detail-header
  margin-bottom: $spacing-lg
  @include tablet
    margin-bottom: 28px

// ===================================
// 版面：桌機左側目錄 + 右側內容
// ===================================
.detail-layout.has-toc
  @include desktop
    display: grid
    grid-template-columns: 240px minmax(0, 1fr)
    gap: 32px
    align-items: start

.trip-content
  min-width: 0

.toc
  display: none

  @include desktop
    position: sticky
    top: calc(#{$header-height-desktop} + 24px)
    display: flex
    flex-direction: column
    gap: 4px
    max-height: calc(100vh - #{$header-height-desktop} - 48px)
    overflow-y: auto
    overscroll-behavior: contain
    padding: 18px 12px
    border: 1px solid $nb-line
    border-radius: 16px
    background: $nb-card
    box-shadow: $nb-card-shadow

.toc__group-title
  padding: 0 14px 6px
  font-size: 13px
  letter-spacing: 2px
  color: $nb-muted

.toc__divider
  margin: 10px 14px
  border-top: 2px dashed $nb-dash

.toc__days
  display: grid
  grid-template-columns: repeat(2, minmax(0, 1fr))
  gap: 4px

.toc__item
  padding: 10px 14px
  border-radius: 10px
  color: $nb-ink
  font-size: 15px
  text-decoration: none

  &:hover
    background: $nb-paper

  &.is-active
    background: $nb-go-soft
    color: $nb-go-strong
    font-weight: 700

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

// ===================================
// 各區塊
// ===================================
.itinerary-detail-page
  --float-base: calc(#{$bottom-tab-height} + env(safe-area-inset-bottom) + #{$spacing-md})
  @include tablet
    --float-base: #{$spacing-lg}

// ===================================
// 回到頂部
// ===================================
.back-to-top
  position: fixed
  right: $spacing-md
  bottom: var(--float-base)
  z-index: 99
  display: flex
  align-items: center
  justify-content: center
  width: 48px
  height: 48px
  border: none
  border-radius: 50%
  background: $nb-ink
  color: $nb-card
  box-shadow: 0 6px 16px rgba(58, 51, 44, 0.25)
  cursor: pointer

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 3px

  @include tablet
    right: $spacing-lg

// ===================================
// 手機／平板：懸浮目錄
// ===================================
$float-step: 60px

.float-menu-button
  position: fixed
  right: $spacing-md
  bottom: var(--float-base)
  z-index: 101
  display: flex
  align-items: center
  justify-content: center
  width: 48px
  height: 48px
  border: 1.5px solid $nb-ink
  border-radius: 50%
  background: $nb-card
  color: $nb-ink
  box-shadow: 0 6px 16px rgba(58, 51, 44, 0.2)
  cursor: pointer
  transition: bottom 0.2s

  &.is-raised
    bottom: calc(var(--float-base) + #{$float-step})

  &.is-open
    background: $nb-ink
    color: $nb-card

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 3px

  @include tablet
    right: $spacing-lg

  @include desktop
    display: none

.float-menu-backdrop
  position: fixed
  inset: 0
  z-index: 100
  background: rgba($nb-ink, 0.12)

  @include desktop
    display: none

.float-menu
  position: fixed
  right: $spacing-md
  bottom: calc(var(--float-base) + #{$float-step})
  z-index: 101
  display: flex
  flex-direction: column
  gap: 2px
  width: min(300px, calc(100vw - #{$spacing-md * 2}))
  max-height: calc(100vh - var(--float-base) - #{$float-step * 2})
  overflow-y: auto
  overscroll-behavior: contain
  padding: 10px
  border: 1px solid $nb-line
  border-radius: 16px
  background: $nb-card
  box-shadow: $nb-float-shadow

  &.is-raised
    bottom: calc(var(--float-base) + #{$float-step * 2})
    max-height: calc(100vh - var(--float-base) - #{$float-step * 3})

  @include tablet
    right: $spacing-lg

  @include desktop
    display: none !important

.float-menu__item
  display: flex
  align-items: center
  min-height: 44px
  padding: 0 14px
  border-radius: 10px
  color: $nb-ink
  font-size: 15px
  text-decoration: none

  &.is-active
    background: $nb-go-soft
    color: $nb-go-strong
    font-weight: 700

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

.float-menu__days
  display: grid
  grid-template-columns: repeat(5, minmax(0, 1fr))
  gap: 6px
  padding: 4px 4px 2px

.float-menu__day
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  min-height: 44px
  border: 1px solid $nb-line
  border-radius: 10px
  background: $nb-paper
  color: $nb-ink
  text-decoration: none

  &.is-active
    border-color: $nb-go
    background: $nb-go-soft
    color: $nb-go-strong

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

.float-menu__day-number
  font-size: 13px
  font-weight: 700
  line-height: 1.2

.float-menu__day-date
  font-size: 10px
  font-variant-numeric: tabular-nums
  color: $nb-muted

  .is-active &
    color: inherit
</style>
