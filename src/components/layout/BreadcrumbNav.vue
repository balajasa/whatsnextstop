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
        <span v-if="index === breadcrumbItems.length - 1 && !item.path"
              class="breadcrumb-current">
          <span v-if="item.icon" class="breadcrumb-icon">{{ item.icon }}</span>
          {{ item.text }}
        </span>

        <!-- 如果有路徑，顯示為鏈接 -->
        <router-link v-else-if="item.path"
                     :to="item.path"
                     class="breadcrumb-link">
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

const route = useRoute()

// 定義 props 介面
interface BreadcrumbItem {
  text: string
  icon?: string
  path?: string
}

interface Props {
  homeText?: string
  separator?: string
  manualItems?: BreadcrumbItem[] | null
  manualShow?: boolean | null
}

// 簡化的 props，移除不需要的配置
const props = withDefaults(defineProps<Props>(), {
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

/* 麵包屑導航 */
.breadcrumb-nav {
  padding: 0.5rem 2rem 0.3rem 2rem; // 縮小 padding，往上移
}

.breadcrumb-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  font-size: 0.75rem; // 從 0.9rem 縮小到 0.75rem
  flex-wrap: wrap;
  gap: 0.2rem; // 縮小間距
}

.breadcrumb-home,
.breadcrumb-link {
  display: flex;
  align-items: center;
  color: rgba($text-secondary-warm, 0.7); // 降低透明度，更低調
  text-decoration: none;
  padding: 0.2rem 0.4rem; // 縮小 padding
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: $primary-warm;
    background: rgba($primary-warm, 0.08); // 更淡的背景
  }
}

.breadcrumb-icon {
  margin-right: 0.3rem; // 縮小間距
  font-size: 0.8rem; // 縮小圖標
  opacity: 0.6; // 更低調

  .breadcrumb-home:hover &,
  .breadcrumb-link:hover & {
    opacity: 0.9;
  }
}

.breadcrumb-text {
  font-weight: 400;
}

.breadcrumb-separator {
  margin: 0 0.3rem; // 縮小間距
  color: $text-secondary-warm;
  opacity: 0.3; // 更低調的分隔符
  font-size: 0.8rem; // 縮小分隔符
  user-select: none;
}

.breadcrumb-current {
  color: rgba($text-primary-warm, 0.8); // 稍微降低當前頁面的突出度
  font-weight: 500; // 從 600 降到 500
  display: flex;
  align-items: center;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;

  .breadcrumb-icon {
    opacity: 0.8;
    color: $primary-warm;
  }
}

.breadcrumb-item {
  color: rgba($text-secondary-warm, 0.7);
  font-weight: 400;
  display: flex;
  align-items: center;
  padding: 0.2rem 0.4rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .breadcrumb-nav {
    padding: 0.4rem 1rem 0.2rem 1rem;
  }

  .breadcrumb-container {
    font-size: 0.7rem; // 手機版更小
  }

  .breadcrumb-icon {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .breadcrumb-nav {
    padding: 0.3rem 0.8rem 0.1rem 0.8rem;
  }

  .breadcrumb-container {
    font-size: 0.65rem; // 更小的手機版
  }

  .breadcrumb-icon {
    margin-right: 0.2rem;
    font-size: 0.7rem;
  }

  .breadcrumb-separator {
    margin: 0 0.2rem;
    font-size: 0.7rem;
  }
}
</style>