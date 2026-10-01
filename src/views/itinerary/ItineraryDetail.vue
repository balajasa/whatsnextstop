<template>
  <div class="itinerary-detail-page">
    <PageHeader />

    <!-- 沒有行程 -->
    <StateView v-if="!hasItinerary" type="empty" title="下一趟旅程" message="正在擲飛鏢決定中..." />

    <!-- 有行程 -->
    <template v-else>
      <!-- 手機／平板：橫向章節列，捲動時黏在 Header 下方 -->
      <nav class="chapter-bar" aria-label="章節">
        <a v-for="section in allSections" :key="section.id" :ref="(el) => setChipRef(section.id, el)"
          :href="`#${section.id}`" class="chapter-chip" :class="{ 'is-active': activeSection === section.id }"
          :aria-current="activeSection === section.id ? 'true' : undefined" @click.prevent="scrollToSection(section.id)">
          {{ getShortLabel(section) }}
        </a>
      </nav>

      <div class="detail-layout">
        <!-- 桌機：左側目錄 -->
        <nav class="toc" aria-label="行程目錄">
          <div class="toc__group-title">行程資訊</div>
          <a v-for="section in infoSections" :key="section.id" :href="`#${section.id}`" class="toc__item"
            :class="{ 'is-active': activeSection === section.id }"
            :aria-current="activeSection === section.id ? 'true' : undefined"
            @click.prevent="scrollToSection(section.id)">
            {{ section.name }}
          </a>
          <div class="toc__divider" aria-hidden="true"></div>
          <div class="toc__group-title">每日行程</div>
          <div class="toc__days">
            <a v-for="section in dailySections" :key="section.id" :href="`#${section.id}`" class="toc__item"
              :class="{ 'is-active': activeSection === section.id }"
              :aria-current="activeSection === section.id ? 'true' : undefined"
              @click.prevent="scrollToSection(section.id)">
              {{ getShortLabel(section) }}
            </a>
          </div>
        </nav>

        <!-- 各區塊：紙膠帶標籤 + 圖片 -->
        <div class="sections">
          <section v-for="(section, index) in allSections" :key="section.id" :id="section.id"
            class="detail-section" :aria-labelledby="`${section.id}-label`">
            <h2 :id="`${section.id}-label`" class="detail-section__label" :class="`tape-${index % 4}`">
              {{ section.name }}
            </h2>
            <div class="detail-section__frame">
              <img v-for="(image, imageIndex) in generateImages(section)" :key="imageIndex" :src="image.src"
                :alt="image.alt" class="detail-section__image" />
            </div>
          </section>
        </div>
      </div>

      <!-- 回到頂部按鈕 -->
      <button v-show="showBackToTop" type="button" class="back-to-top" aria-label="回到頂部" @click="scrollToTop">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StateView from '@/components/common/StateView.vue'
import { HAS_ITINERARY, ITINERARY_SECTIONS, type SectionConfig } from '@/constants/itinerary'

const route = useRoute()

// 行程開關
const hasItinerary = HAS_ITINERARY

// 響應式數據
const showBackToTop: Ref<boolean> = ref(false)
const activeSection: Ref<string> = ref('cover')

// 統一區域配置
const allSections: Ref<SectionConfig[]> = ref(ITINERARY_SECTIONS)

// 計算屬性：行程資訊區域
const infoSections = computed(() =>
  allSections.value.filter(section => section.type === 'info')
)

// 計算屬性：每日行程區域
const dailySections = computed(() =>
  allSections.value.filter(section => section.type === 'daily')
)

// 計算屬性：所有區域ID供滾動檢測使用
const allSectionIds = computed(() =>
  allSections.value.map(section => section.id)
)

// 動態生成圖片配置
const generateImages = (section: SectionConfig) => {
  return section.pages.map((filename, index) => ({
    src: new URL(`../../assets/img/itinerary/${filename}.jpg`, import.meta.url).href,
    alt: section.pages.length > 1
      ? `${section.name} - 第${index + 1}頁`
      : section.name
  }))
}

// 章節列、目錄用的短標籤：每日行程顯示 Day N
const getShortLabel = (section: SectionConfig): string =>
  section.type === 'daily' ? `Day ${section.day}` : section.name

// 章節列：目前區塊的標籤自動捲到看得見的位置
const chipRefs = new Map<string, HTMLElement>()
const setChipRef = (id: string, el: unknown): void => {
  if (el instanceof HTMLElement) chipRefs.set(id, el)
  else chipRefs.delete(id)
}
watch(activeSection, (id) => {
  chipRefs.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
})

// 滾動到指定區域
const scrollToSection = (sectionId: string): void => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

// 滾動到頂部
const scrollToTop = (): void => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 處理滾動事件
const handleScroll = (): void => {
  const scrollY = window.scrollY

  // 控制返回頂部按鈕顯示
  showBackToTop.value = scrollY > 300

  // 更新當前活動區域
  updateActiveSection()
}

// 更新當前活動區域
const updateActiveSection = (): void => {
  // 扣掉黏在上方的 Header（與手機的章節列）
  const offset = window.innerWidth >= 1024 ? 120 : 160

  for (let i = allSectionIds.value.length - 1; i >= 0; i--) {
    const section = document.getElementById(allSectionIds.value[i])
    if (section && section.getBoundingClientRect().top <= offset) {
      activeSection.value = allSectionIds.value[i]
      return
    }
  }
  activeSection.value = allSectionIds.value[0] ?? ''
}

// 處理路由中的錨點
const handleRouteHash = (): void => {
  if (route.hash) {
    const sectionId = route.hash.substring(1) // 移除 # 符號
    setTimeout(() => {
      scrollToSection(sectionId)
    }, 100)
  }
}

// 在元件載入時執行
onMounted(() => {
  if (hasItinerary) {
    window.addEventListener('scroll', handleScroll)
    handleRouteHash() // 處理錨點跳轉
  }
})

onUnmounted(() => {
  if (hasItinerary) {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// 手機／平板：橫向章節列
// ===================================
.chapter-bar
  position: sticky
  top: $header-height
  z-index: $z-header - 1
  display: flex
  gap: 8px
  overflow-x: auto
  margin: 0 (-$spacing-md) $spacing-lg
  padding: 10px $spacing-md
  border-bottom: 1px solid $nb-line
  background: rgba($nb-paper, 0.96)
  scrollbar-width: none
  // 右側淡出，提示可以往右滑
  mask-image: linear-gradient(to right, #000 calc(100% - 32px), transparent)

  &::-webkit-scrollbar
    display: none

  @include tablet
    top: $header-height-desktop
    margin: 0 (-$spacing-lg) $spacing-lg
    padding: 10px $spacing-lg

  @include desktop
    display: none

.chapter-chip
  flex-shrink: 0
  display: inline-flex
  align-items: center
  min-height: 38px
  padding: 0 16px
  border: 1px solid $nb-line
  border-radius: 999px
  background: $nb-card
  color: $nb-ink
  font-size: 14px
  text-decoration: none
  white-space: nowrap

  &.is-active
    border-color: $nb-ink
    background: $nb-ink
    color: $nb-card
    font-weight: 700

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

// ===================================
// 版面：桌機左側目錄 + 右側內容
// ===================================
.detail-layout
  @include desktop
    display: grid
    grid-template-columns: 240px minmax(0, 1fr)
    gap: 32px
    align-items: start

.toc
  display: none

  @include desktop
    position: sticky
    top: calc(#{$header-height-desktop} + 24px)
    display: flex
    flex-direction: column
    gap: 4px
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
.sections
  display: flex
  flex-direction: column
  gap: 28px
  max-width: 880px
  @include tablet
    gap: 36px

.detail-section
  display: flex
  flex-direction: column
  gap: 10px
  // 點目錄跳轉時，標題不會被 Header／章節列蓋住
  scroll-margin-top: calc(#{$header-height} + 72px)
  @include tablet
    scroll-margin-top: calc(#{$header-height-desktop} + 72px)
  @include desktop
    scroll-margin-top: calc(#{$header-height-desktop} + 24px)

// 紙膠帶標籤
.detail-section__label
  align-self: flex-start
  margin: 0
  padding: 3px 14px
  font-size: 15px
  font-weight: 700
  color: $nb-ink
  transform: rotate(-2deg)
  @include tablet
    font-size: 16px

.tape-0
  background: $nb-tape-blue
.tape-1
  background: rgba(242, 201, 76, 0.6)
.tape-2
  background: rgba(240, 176, 140, 0.6)
.tape-3
  background: rgba(170, 200, 140, 0.6)

.detail-section__frame
  display: flex
  flex-direction: column
  gap: 10px
  padding: 10px
  border: 1px solid $nb-line
  border-radius: 14px
  background: $nb-card
  box-shadow: $nb-card-shadow
  @include tablet
    gap: 16px
    padding: 16px
    border-radius: 16px

.detail-section__image
  display: block
  width: 100%
  height: auto
  border-radius: 8px

// ===================================
// 回到頂部
// ===================================
.back-to-top
  position: fixed
  right: $spacing-md
  // 手機要避開底部 tab
  bottom: calc(#{$bottom-tab-height} + env(safe-area-inset-bottom) + #{$spacing-md})
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
    bottom: $spacing-lg
</style>
