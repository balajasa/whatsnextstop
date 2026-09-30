<template>
  <header class="site-header">
    <div class="site-header__inner">
      <router-link to="/home" class="brand" aria-label="What's Next Stop 首頁">
        <img src="@/assets/img/logo.png" alt="" class="brand__logo" />
        <span class="brand__name">What's Next Stop</span>
      </router-link>

      <!-- 桌機／平板：頂部導覽（手機改用底部 tab） -->
      <nav ref="navRef" class="top-nav" aria-label="主選單">
        <template v-for="cat in NAV_CATEGORIES" :key="cat.key">
          <!-- 沒有子項目：直接連結 -->
          <router-link v-if="!cat.items" :to="cat.path!" class="top-nav__link"
            :class="{ 'is-active': activeKey === cat.key }" @click="track(cat.name, cat.path!, cat.name)">
            {{ cat.name }}
          </router-link>

          <!-- 有子項目：下拉選單 -->
          <div v-else class="top-nav__group" :class="`cat-${cat.key}`" @mouseenter="openKey = cat.key"
            @mouseleave="openKey = null">
            <button type="button" class="top-nav__link" :class="{ 'is-active': activeKey === cat.key }"
              :aria-expanded="openKey === cat.key" aria-haspopup="true" @click="toggle(cat.key)">
              <span class="dot" aria-hidden="true"></span>
              {{ cat.name }}
              <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div v-show="openKey === cat.key" class="dropdown">
              <router-link v-for="item in cat.items" :key="item.path" :to="item.path" class="dropdown__item"
                :class="{ 'is-current': isCurrent(item.path) }" @click="onItemClick(item.name, item.path, cat.name)">
                {{ item.name }}
              </router-link>
            </div>
          </div>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { event } from 'vue-gtag'
import { NAV_CATEGORIES, findActiveCategory, type NavCategory } from '@/constants/navigation'

const route = useRoute()
const navRef = ref<HTMLElement | null>(null)
const openKey = ref<NavCategory['key'] | null>(null)

const activeKey = computed(() => findActiveCategory(route.path))

const isCurrent = (path: string): boolean => route.path === path || route.path.startsWith(`${path}-`)

const toggle = (key: NavCategory['key']): void => {
  openKey.value = openKey.value === key ? null : key
}

const track = (name: string, path: string, category: string): void => {
  event('nav_click', {
    source: 'top_nav',
    item_name: name,
    item_path: path,
    category,
    device: 'desktop'
  })
}

const onItemClick = (name: string, path: string, category: string): void => {
  track(name, path, category)
  openKey.value = null
}

// 點外面或按 Esc 關閉下拉
const handleClickOutside = (e: MouseEvent): void => {
  if (navRef.value && !navRef.value.contains(e.target as Node)) openKey.value = null
}
const handleKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') openKey.value = null
}

watch(() => route.path, () => {
  openKey.value = null
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.site-header
  position: sticky
  top: 0
  z-index: $z-header
  background: $nb-card
  border-bottom: 2px dashed $nb-dash

.site-header__inner
  height: $header-height
  max-width: 1376px
  margin: 0 auto
  padding: 0 $spacing-md
  display: flex
  align-items: center
  justify-content: center

  @include tablet
    height: $header-height-desktop
    padding: 0 $spacing-lg
    justify-content: space-between

  @include desktop
    padding: 0 $spacing-xl

// 品牌
.brand
  display: flex
  align-items: center
  gap: 10px
  text-decoration: none
  color: $nb-ink

.brand__logo
  width: 34px
  height: 34px

  @include tablet
    width: 44px
    height: 44px

.brand__name
  font-family: $font-display
  font-weight: 700
  font-size: 20px
  letter-spacing: 0.5px

  @include tablet
    font-size: 24px

// 頂部導覽（手機隱藏）
.top-nav
  display: none

  @include tablet
    display: flex
    align-items: center
    gap: 6px

.top-nav__group
  position: relative

.top-nav__link
  display: flex
  align-items: center
  gap: 6px
  min-height: 44px
  padding: 0 16px
  border: none
  border-radius: 999px
  background: transparent
  color: $nb-ink
  font-size: 15px
  font-weight: 500
  text-decoration: none
  cursor: pointer
  transition: background-color 0.2s ease

  &:hover
    background: $nb-paper

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

  // 首頁（無子項目）的 active：深色膠囊
  &.is-active:not(button)
    background: $nb-ink
    color: $nb-card

.chevron
  transition: transform 0.2s ease

[aria-expanded="true"] .chevron
  transform: rotate(180deg)

.dot
  width: 8px
  height: 8px
  border-radius: 50%

// 分類主題色
@mixin category-color($main, $soft, $strong)
  .dot
    background: $main
  button.is-active
    background: $soft
    color: $strong
    font-weight: 700
  .dropdown__item.is-current
    background: $soft
    color: $strong
    font-weight: 700

.cat-go
  @include category-color($nb-go, $nb-go-soft, $nb-go-strong)
.cat-footprint
  @include category-color($nb-footprint, $nb-footprint-soft, $nb-footprint-strong)
.cat-fun
  @include category-color($nb-fun, $nb-fun-soft, $nb-fun-strong)

// 下拉選單
.dropdown
  position: absolute
  top: 100%
  left: 0
  min-width: 180px
  z-index: 1
  display: flex
  flex-direction: column
  gap: 2px
  // 用 padding-top 取代 margin，滑鼠從按鈕移到選單時不會斷掉
  padding-top: 6px

  &::before
    content: ''
    position: absolute
    inset: 6px 0 0
    background: $nb-card
    border: 1px solid $nb-line
    border-radius: 14px
    box-shadow: $nb-float-shadow
    z-index: -1

.dropdown__item
  position: relative
  margin: 0 8px
  padding: 12px 14px
  border-radius: 10px
  color: $nb-ink
  font-size: 15px
  text-decoration: none

  &:first-child
    margin-top: 8px
  &:last-child
    margin-bottom: 8px

  &:hover
    background: $nb-paper
</style>
