<template>
  <nav v-if="shouldShowBreadcrumb" class="breadcrumb-nav" aria-label="麵包屑">
    <div class="breadcrumb-container">
      <router-link to="/home" class="breadcrumb-home"
        @click="handleBreadcrumbClick({ text: homeText, path: '/home', isHome: true })">
        {{ homeText }}
      </router-link>

      <template v-for="(item, index) in breadcrumbItems" :key="index">
        <span class="breadcrumb-separator">{{ separator }}</span>

        <span v-if="index === breadcrumbItems.length - 1 && !item.path" class="breadcrumb-current" aria-current="page">
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
  separator: '/',
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
.breadcrumb-container
  display: flex
  flex-wrap: wrap
  align-items: center
  gap: 6px
  font-size: 13px
  @include tablet
    font-size: 14px

.breadcrumb-home,
.breadcrumb-link
  display: inline-flex
  align-items: center
  gap: 4px
  color: $nb-muted
  text-decoration: none
  border-radius: 4px
  transition: color 0.2s ease

  &:hover
    color: $nb-accent
    text-decoration: underline

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

.breadcrumb-current
  display: inline-flex
  align-items: center
  gap: 4px
  color: $nb-ink
  font-weight: 500

.breadcrumb-item
  display: inline-flex
  align-items: center
  gap: 4px
  color: $nb-muted

.breadcrumb-separator
  color: #C9B89F
  user-select: none
</style>
