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
import { BreadcrumbItem, BreadcrumbProps } from '../types/ILayout'

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

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.breadcrumb-nav {
  margin-bottom: $spacing-lg;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid $border-light;
  background: $bg-card;
  box-shadow: 0 2px 4px rgba($primary-color, 0.05);
}

.breadcrumb-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: 0 auto;
  max-width: 1200px;
  font-size: 14px;

  gap: $spacing-xs;
}

/* 首頁鏈接 */
.breadcrumb-home {
  display: flex;
  align-items: center;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  color: $accent-color-1;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;

  gap: $spacing-xs;

  &:hover {
    background: rgba($accent-color-1, 0.1);
    color: darken($accent-color-1, 10%);
    transform: translateY(-1px);
  }

  .breadcrumb-icon {
    font-size: 16px;
  }

  .breadcrumb-text {
    font-size: 14px;
  }
}

/* 分隔符 */
.breadcrumb-separator {
  margin: 0 $spacing-xs;
  color: $text-muted;
  font-weight: 400;
  font-size: 16px;

  user-select: none;
}

/* 麵包屑鏈接 */
.breadcrumb-link {
  display: flex;
  align-items: center;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  color: $text-secondary;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;

  gap: $spacing-xs;

  &:hover {
    background: rgba($primary-color, 0.08);
    color: $primary-color;
    transform: translateY(-1px);
  }

  .breadcrumb-icon {
    font-size: 14px;
    opacity: 0.8;
  }
}

/* 純文字項目 */
.breadcrumb-item {
  display: flex;
  align-items: center;
  padding: $spacing-xs $spacing-sm;
  color: $text-muted;
  font-weight: 500;

  gap: $spacing-xs;

  .breadcrumb-icon {
    font-size: 14px;
    opacity: 0.7;
  }
}

/* 當前頁面項目 */
.breadcrumb-current {
  position: relative;
  display: flex;
  align-items: center;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  background: rgba($primary-color, 0.08);
  color: $primary-color;
  font-weight: 600;

  gap: $spacing-xs;

  &::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 3px;
    border-radius: 0 2px 2px 0;
    background: $accent-color-2;
    content: '';
  }

  .breadcrumb-icon {
    color: $accent-color-2;
    font-size: 14px;
  }
}

/* 響應式設計 */
@media (max-width: $breakpoint-mobile) {
  .breadcrumb-nav {
    margin-bottom: $spacing-md;
    padding: $spacing-sm $spacing-md;
  }

  .breadcrumb-container {
    font-size: 13px;

    gap: $spacing-xs;
  }

  .breadcrumb-home,
  .breadcrumb-link,
  .breadcrumb-item,
  .breadcrumb-current {
    padding: $spacing-xs;
  }

  .breadcrumb-home .breadcrumb-icon {
    font-size: 14px;
  }

  .breadcrumb-home .breadcrumb-text,
  .breadcrumb-link,
  .breadcrumb-item,
  .breadcrumb-current {
    font-size: 13px;
  }

  .breadcrumb-separator {
    margin: 0 2px;
    font-size: 14px;
  }

  /* 超長路徑處理 */
  .breadcrumb-container {
    overflow-x: auto;

    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}

@media (max-width: 480px) {
  .breadcrumb-nav {
    padding: $spacing-xs $spacing-sm;
  }

  .breadcrumb-container {
    font-size: 12px;
  }

  .breadcrumb-home .breadcrumb-text {
    /* 極小螢幕隱藏文字，只顯示圖標 */
    display: none;
  }

  .breadcrumb-link,
  .breadcrumb-item,
  .breadcrumb-current {
    overflow: hidden;
    max-width: 80px;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
  }
}

/* 深色模式支援（可選） */
@media (prefers-color-scheme: dark) {
  .breadcrumb-nav {
    border-bottom-color: darken($border-light, 10%);
    background: darken($bg-card, 5%);
  }
}

/* 自定義滾動條（手機版） */
.breadcrumb-container::-webkit-scrollbar {
  height: 2px;
}

.breadcrumb-container::-webkit-scrollbar-track {
  background: transparent;
}

.breadcrumb-container::-webkit-scrollbar-thumb {
  border-radius: 1px;
  background: rgba($primary-color, 0.3);
}
</style>