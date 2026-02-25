<template>
  <nav v-if="shouldShowBreadcrumb" class="breadcrumb-nav">
    <div class="breadcrumb-container">
      <router-link to="/home" class="breadcrumb-home"
        @click="handleBreadcrumbClick({ text: homeText, path: '/home', isHome: true })">
        <span class="breadcrumb-icon">🏠</span>
        <span class="breadcrumb-text">{{ homeText }}</span>
      </router-link>

      <template v-for="(item, index) in breadcrumbItems" :key="index">
        <span class="breadcrumb-separator">{{ separator }}</span>

        <span v-if="index === breadcrumbItems.length - 1 && !item.path" class="breadcrumb-current">
          <span v-if="item.icon" class="breadcrumb-icon">{{ item.icon }}</span>
          {{ item.text }}
        </span>

        <router-link v-else-if="item.path" :to="item.path" class="breadcrumb-link"
          @click="handleBreadcrumbClick({ text: item.text, path: item.path })">
          <span v-if="item.icon" class="breadcrumb-icon">{{ item.icon }}</span>
          {{ item.text }}
        </router-link>

        <span v-else class="breadcrumb-item">
          <span v-if="item.icon" class="breadcrumb-icon">{{ item.icon }}</span>
          {{ item.text }}
        </span>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { event } from 'vue-gtag'
import type { BreadcrumbItem, BreadcrumbProps } from '../../types/common/ui-layout'

const route = useRoute()

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  homeText: '首頁',
  separator: '›',
  manualItems: null,
  manualShow: null
})

const shouldShowBreadcrumb = computed(() => {
  if (props.manualShow !== null) {
    return props.manualShow
  }
  return route.meta?.showBreadcrumb ?? false
})

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  if (props.manualItems) {
    return props.manualItems
  }
  return (route.meta?.breadcrumb as BreadcrumbItem[]) || []
})

const handleBreadcrumbClick = (item: { text: string; path: string; isHome?: boolean }): void => {
  event('breadcrumb_click', {
    source: 'breadcrumb',
    item_name: item.text,
    item_path: item.path,
    category: item.isHome ? '首頁' : '麵包屑',
    device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
  })
}
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.breadcrumb-nav
  padding: $spacing-sm 0

  @include tablet
    padding: $spacing-md 0

.breadcrumb-container
  margin: 0 auto
  padding: 0 $spacing-md
  @include flex-center
  justify-content: flex-start
  flex-wrap: wrap
  gap: $spacing-xs

  @include tablet
    padding: 0 $spacing-lg
    gap: $spacing-sm

  @include desktop
    padding: 0 $spacing-xl

.breadcrumb-home
  @include flex-center
  gap: $spacing-xs
  color: $accent-color-1
  text-decoration: none
  font-weight: 500
  padding: $spacing-xs $spacing-sm
  border-radius: $border-radius-sm
  transition: all 0.2s ease

  &:hover
    background: rgba(56, 178, 172, 0.1)
    color: $accent-color-1

  @include tablet
    padding: $spacing-sm
    gap: $spacing-sm

.breadcrumb-link
  @include flex-center
  gap: $spacing-xs
  color: $text-secondary
  text-decoration: none
  font-weight: 500
  padding: $spacing-xs $spacing-sm
  border-radius: $border-radius-sm
  transition: all 0.2s ease

  &:hover
    background: rgba(74, 85, 104, 0.1)
    color: $primary-color

  @include tablet
    padding: $spacing-sm
    gap: $spacing-sm

.breadcrumb-current
  @include flex-center
  gap: $spacing-xs
  color: $text-primary
  font-weight: 600
  padding: $spacing-xs $spacing-sm
  background: rgba(230, 168, 107, 0.1)
  border-radius: $border-radius-lg

  @include tablet
    padding: $spacing-sm
    gap: $spacing-sm

.breadcrumb-item
  @include flex-center
  gap: $spacing-xs
  color: $text-muted
  padding: $spacing-xs $spacing-sm

  @include tablet
    padding: $spacing-sm
    gap: $spacing-sm

.breadcrumb-icon
  font-size: 16px

  @include tablet
    font-size: 18px

.breadcrumb-text
  font-size: 14px

  @include tablet
    font-size: 15px

  @include desktop
    font-size: 16px

.breadcrumb-separator
  color: $text-light
  font-weight: 300
  font-size: 14px
  margin: 0 2px
  user-select: none

  @include tablet
    font-size: 16px
    margin: 0 4px

// 手機版特殊處理
@include mobile-only
  .breadcrumb-nav
    position: relative // 手機版不需要 sticky
    top: auto

  .breadcrumb-container
    padding: 0 $spacing-sm
    gap: 2px

  .breadcrumb-text
    display: none

  .breadcrumb-home .breadcrumb-text
    display: inline

  .breadcrumb-separator
    margin: 0 4px
    font-size: 12px

</style>
