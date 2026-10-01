<template>
  <header class="page-header" :class="`accent-${accentKey}`">
    <BreadcrumbNav :manual-items="breadcrumbItems" :manual-show="showBreadcrumb" />
    <div class="page-header__title-row">
      <span class="page-header__bar" aria-hidden="true"></span>
      <h1 class="page-header__title">{{ displayTitle }}</h1>
    </div>
    <p v-if="subtitle" class="page-header__sub">{{ subtitle }}</p>
    <slot />
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import { findActiveCategory } from '@/constants/navigation'
import type { BreadcrumbItem } from '@/types/common/ui-layout'

interface Props {
  /** 沒給就用路由 meta.title */
  title?: string
  subtitle?: string
  /** 沒給就用路由 meta.breadcrumb */
  breadcrumbItems?: BreadcrumbItem[] | null
  showBreadcrumb?: boolean | null
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  breadcrumbItems: null,
  showBreadcrumb: null
})

const route = useRoute()

const displayTitle = computed(() => props.title || (route.meta?.title as string) || '')

// 標題色條跟著所屬分類的主題色
const accentKey = computed(() => findActiveCategory(route.path) ?? 'go')
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.page-header
  display: flex
  flex-direction: column
  gap: 8px
  margin-bottom: $spacing-lg
  @include tablet
    gap: 10px
    margin-bottom: 28px

.page-header__title-row
  display: flex
  align-items: center
  gap: 10px

.page-header__bar
  flex-shrink: 0
  width: 8px
  height: 24px
  border-radius: 3px
  transform: rotate(-4deg)
  @include tablet
    width: 10px
    height: 28px

.page-header__title
  margin: 0
  font-family: $font-display
  font-size: 28px
  font-weight: 700
  line-height: 1.3
  color: $nb-ink
  @include tablet
    font-size: 34px

.page-header__sub
  margin: 0
  font-size: 14px
  color: $nb-muted
  @include tablet
    font-size: 15px

.accent-go .page-header__bar
  background: $nb-go
.accent-footprint .page-header__bar
  background: $nb-footprint
.accent-fun .page-header__bar
  background: $nb-fun
.accent-home .page-header__bar
  background: $nb-accent
</style>
