<template>
  <div class="bottom-tab-root">
    <!-- 子選單背景遮罩 -->
    <div v-if="openKey" class="sheet-backdrop" @click="openKey = null"></div>

    <!-- 子選單（從 tab 上方彈出） -->
    <div v-if="openCategory" class="sheet" :class="`cat-${openCategory.key}`" role="menu"
      :aria-label="openCategory.name">
      <div class="sheet__title">{{ openCategory.name }}</div>
      <router-link v-for="item in openCategory.items" :key="item.path" :to="item.path" class="sheet__item"
        :class="{ 'is-current': isCurrent(item.path) }" role="menuitem"
        @click="onItemClick(item.name, item.path, openCategory.name)">
        {{ item.name }}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </router-link>
    </div>

    <nav class="bottom-tab" aria-label="主選單">
      <template v-for="cat in NAV_CATEGORIES" :key="cat.key">
        <router-link v-if="!cat.items" :to="cat.path!" class="tab" :class="[`cat-${cat.key}`, { 'is-active': activeKey === cat.key }]"
          :aria-current="activeKey === cat.key ? 'page' : undefined" @click="onHomeClick(cat)">
          <span class="tab__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="cat.icon"></svg>
          </span>
          <span class="tab__label">{{ cat.name }}</span>
        </router-link>
        <button v-else type="button" class="tab" :class="[`cat-${cat.key}`, { 'is-active': activeKey === cat.key, 'is-open': openKey === cat.key }]"
          :aria-expanded="openKey === cat.key" aria-haspopup="menu" @click="toggle(cat.key)">
          <span class="tab__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="cat.icon"></svg>
          </span>
          <span class="tab__label">{{ cat.name }}</span>
        </button>
      </template>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { event } from 'vue-gtag'
import { NAV_CATEGORIES, findActiveCategory, type NavCategory } from '@/constants/navigation'

const route = useRoute()
const openKey = ref<NavCategory['key'] | null>(null)

const activeKey = computed(() => findActiveCategory(route.path))
const openCategory = computed(() => NAV_CATEGORIES.find((c) => c.key === openKey.value && c.items) ?? null)

const isCurrent = (path: string): boolean => route.path === path || route.path.startsWith(`${path}-`)

const toggle = (key: NavCategory['key']): void => {
  openKey.value = openKey.value === key ? null : key
}

const track = (name: string, path: string, category: string): void => {
  event('nav_click', {
    source: 'bottom_tab',
    item_name: name,
    item_path: path,
    category,
    device: 'mobile'
  })
}

const onHomeClick = (cat: NavCategory): void => {
  openKey.value = null
  track(cat.name, cat.path!, cat.name)
}

const onItemClick = (name: string, path: string, category: string): void => {
  track(name, path, category)
  openKey.value = null
}

const handleKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') openKey.value = null
}

watch(() => route.path, () => {
  openKey.value = null
})

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// 平板以上不顯示（改用頂部導覽）
.bottom-tab-root
  @include tablet
    display: none

.bottom-tab
  position: fixed
  left: 0
  right: 0
  bottom: 0
  z-index: $z-bottom-tab
  height: calc(#{$bottom-tab-height} + env(safe-area-inset-bottom))
  padding: 6px 8px env(safe-area-inset-bottom)
  background: $nb-card
  border-top: 2px dashed $nb-dash
  display: grid
  grid-template-columns: repeat(4, minmax(0, 1fr))
  gap: 4px

.tab
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 3px
  border: none
  background: transparent
  color: $nb-muted
  font-size: 12px
  text-decoration: none
  cursor: pointer
  -webkit-tap-highlight-color: transparent

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: -2px
    border-radius: 12px

.tab__icon
  display: flex
  align-items: center
  justify-content: center
  width: 48px
  height: 30px
  border-radius: 999px
  transition: background-color 0.2s ease

// 各分類的圖示顏色與 active 樣式
@mixin tab-color($main, $soft, $strong)
  .tab__icon
    color: $main
  &.is-active, &.is-open
    color: $nb-ink
    font-weight: 700
    .tab__icon
      background: $soft
      color: $strong

.cat-home
  @include tab-color($nb-muted, $nb-yellow, $nb-ink)
.cat-go
  @include tab-color($nb-go, $nb-go-soft, $nb-go-strong)
.cat-footprint
  @include tab-color($nb-footprint, $nb-footprint-soft, $nb-footprint-strong)
.cat-fun
  @include tab-color($nb-fun, $nb-fun-soft, $nb-fun-strong)

// 子選單
.sheet-backdrop
  position: fixed
  inset: 0
  z-index: $z-bottom-tab - 1
  background: rgba(58, 51, 44, 0.25)

.sheet
  position: fixed
  left: 12px
  right: 12px
  bottom: calc(#{$bottom-tab-height} + env(safe-area-inset-bottom) + 8px)
  z-index: $z-bottom-tab
  padding: 12px
  background: $nb-card
  border: 1px solid $nb-line
  border-radius: 18px
  box-shadow: $nb-float-shadow
  display: flex
  flex-direction: column
  gap: 4px

.sheet__title
  padding: 4px 8px 8px
  font-size: 12px
  letter-spacing: 2px
  color: $nb-muted

.sheet__item
  display: flex
  align-items: center
  justify-content: space-between
  min-height: 48px
  padding: 0 14px
  border-radius: 12px
  color: $nb-ink
  font-size: 16px
  text-decoration: none

  &:active
    background: $nb-paper

@mixin sheet-color($soft, $strong)
  .sheet__item.is-current
    background: $soft
    color: $strong
    font-weight: 700

.sheet.cat-go
  @include sheet-color($nb-go-soft, $nb-go-strong)
.sheet.cat-footprint
  @include sheet-color($nb-footprint-soft, $nb-footprint-strong)
.sheet.cat-fun
  @include sheet-color($nb-fun-soft, $nb-fun-strong)
</style>
