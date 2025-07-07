<template>
  <nav v-if="shouldShowBreadcrumb" class="breadcrumb-nav">
    <div class="breadcrumb-container">
      <!-- 首頁鏈接 -->
      <router-link to="/home" class="breadcrumb-home">
        <span class="breadcrumb-icon">🏠</span>
        <span class="breadcrumb-text">{{ homeText }}</span>
      </router-link>

      <!-- 動態麵包屑項目 -->
      <template v-for="(item, index) in breadcrumbItems" :key="index">
        <span class="breadcrumb-separator">{{ separator }}</span>

        <!-- 如果是最後一項且不是鏈接，顯示為當前頁面 -->
        <span v-if="index === breadcrumbItems.length - 1 && !item.path" class="breadcrumb-current">
          <span v-if="item.icon" class="breadcrumb-icon">{{ item.icon }}</span>
          {{ item.text }}
        </span>

        <!-- 如果有路徑，顯示為鏈接 -->
        <router-link v-else-if="item.path" :to="item.path" class="breadcrumb-link">
          <span v-if="item.icon" class="breadcrumb-icon">{{ item.icon }}</span>
          {{ item.text }}
        </router-link>

        <!-- 純文字項目 -->
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
import { BreadcrumbItem, BreadcrumbProps } from '../../types/layout'

const route = useRoute()

// 定義 props 介面

// 簡化的 props，移除不需要的配置
const props = withDefaults(defineProps<BreadcrumbProps>(), {
  homeText: '首頁',
  separator: '›',
  manualItems: null,
  manualShow: null
})

// 是否顯示麵包屑
const shouldShowBreadcrumb = computed(() => {
  if (props.manualShow !== null) {
    return props.manualShow
  }
  return route.meta?.showBreadcrumb ?? false
})

// 麵包屑項目
const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  if (props.manualItems) {
    return props.manualItems
  }
  return (route.meta?.breadcrumb as BreadcrumbItem[]) || []
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// 麵包屑導航
// ===================================
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

// ===================================
// 麵包屑項目
// ===================================

// 首頁鏈接
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
    transform: translateY(-1px)

  @include tablet
    padding: $spacing-sm
    gap: $spacing-sm

// 一般鏈接
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
    transform: translateY(-1px)

  @include tablet
    padding: $spacing-sm
    gap: $spacing-sm

// 當前頁面
.breadcrumb-current
  @include flex-center
  gap: $spacing-xs
  color: $text-primary
  font-weight: 600
  padding: $spacing-xs $spacing-sm
  background: rgba(230, 168, 107, 0.1)
  border-radius: $border-radius-sm

  @include tablet
    padding: $spacing-sm
    gap: $spacing-sm

// 純文字項目
.breadcrumb-item
  @include flex-center
  gap: $spacing-xs
  color: $text-muted
  padding: $spacing-xs $spacing-sm

  @include tablet
    padding: $spacing-sm
    gap: $spacing-sm

// ===================================
// 麵包屑元素
// ===================================

// 圖標
.breadcrumb-icon
  font-size: 16px

  @include tablet
    font-size: 18px

// 文字
.breadcrumb-text
  font-size: 14px

  @include tablet
    font-size: 15px

  @include desktop
    font-size: 16px

// 分隔符號
.breadcrumb-separator
  color: $text-light
  font-weight: 300
  font-size: 14px
  margin: 0 $spacing-xs
  user-select: none

  @include tablet
    font-size: 16px
    margin: 0 $spacing-sm

// ===================================
// 響應式調整
// ===================================

// 手機版特殊處理
@include mobile-only
  .breadcrumb-nav
    position: relative // 手機版不需要 sticky
    top: auto

  .breadcrumb-container
    padding: 0 $spacing-sm
    gap: 2px

  .breadcrumb-text
    display: none // 手機版只顯示圖標

  .breadcrumb-home .breadcrumb-text
    display: inline // 首頁文字保持顯示

  .breadcrumb-separator
    margin: 0 4px
    font-size: 12px

// 大桌面版優化
@include large-desktop
  .breadcrumb-container
    max-width: 1400px
</style>
