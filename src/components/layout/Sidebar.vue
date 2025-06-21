<template>
  <aside class="sidebar" :class="sidebarClasses">
    <div class="sidebar-content">
      <ul class="sidebar-menu">
        <!-- 首頁 - 始終顯示 -->
        <li>
          <router-link to="/" class="sidebar-item home-item" :class="{ active: isActive('/') }">
            <div class="sidebar-icon">🏠</div>
            <span class="sidebar-text">首頁</span>
          </router-link>
        </li>

        <!-- 按分類顯示 - 只在展開時顯示 -->
        <template v-for="category in sidebarCategory" :key="category">
          <li class="sidebar-category">
            <div class="category-title">
              <span class="category-icon">📍</span>
              <span class="category-text">{{ category }}</span>
            </div>
          </li>
          <li v-for="item in getItemsByCategory(category)" :key="item.path">
            <router-link
              :to="item.path"
              class="sidebar-item category-item"
              :class="{ active: isActive(item.path) }"
            >
              <div class="sidebar-icon">{{ item.icon }}</div>
              <span class="sidebar-text">{{ item.name }}</span>
            </router-link>
          </li>
        </template>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Ref } from 'vue'

interface Props {
  isMobile?: boolean
  headerHeight?: number
}

interface SidebarItem {
  name: string
  icon: string
  path: string
  category?: string
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false,
  headerHeight: 50
})

defineEmits<{
  'keydown-escape': []
}>()

const route = useRoute()

// 側邊欄開關狀態
const isSidebarOpen: Ref<boolean> = ref(false)

// 側邊欄分類
const sidebarCategory: string[] = ['要去哪裡', '踏踏腳印', '小小樂趣']

// 側邊欄列表
const sidebarList: SidebarItem[] = [
  {
    name: '首頁',
    icon: '🏠',
    path: '/'
  },
  {
    category: '要去哪裡',
    name: '行程表',
    icon: '🗓️',
    path: '/itinerary'
  },
  {
    category: '踏踏腳印',
    name: '旅行地圖',
    icon: '🗺️',
    path: '/travelmap'
  },
  {
    category: '踏踏腳印',
    name: '我的足跡',
    icon: '👣',
    path: '/history'
  },
  {
    category: '小小樂趣',
    name: '小遊戲',
    icon: '🎮',
    path: '/tools'
  }
]

// 根據分類獲取項目
const getItemsByCategory = (category: string): SidebarItem[] => {
  return sidebarList.filter(item => item.category === category)
}

// 計算側邊欄的CSS類別
const sidebarClasses = computed(() => {
  return {
    expanded: isSidebarOpen.value && !props.isMobile,
    'mobile-open': isSidebarOpen.value && props.isMobile
  }
})

// 判斷是否為當前路由
const isActive = (path: string): boolean => {
  return route.path === path
}

// 切換側邊欄
const toggleSidebar = (): void => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// 關閉側邊欄
const closeSidebar = (): void => {
  isSidebarOpen.value = false
}

// 重置側邊欄狀態（當螢幕尺寸改變時使用）
const resetSidebarState = (): void => {
  isSidebarOpen.value = false
}

// 暴露狀態和方法給父元件使用
defineExpose({
  isSidebarOpen,
  toggleSidebar,
  closeSidebar,
  resetSidebarState
})
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

/* Sidebar */
.sidebar {
  position: fixed;
  top: 50px;
  left: 0;
  width: 60px;
  height: calc(100vh - 50px);
  background-color: $warm-bg-sidebar;
  backdrop-filter: blur(12px);
  border-right: $warm-border-light;
  transition: width 0.3s ease;
  overflow: hidden;
  z-index: 900;
  box-shadow: $warm-shadow-light;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: $warm-gradient-bg;
    opacity: 0.3;
    pointer-events: none;
    z-index: -1;
  }
}

.sidebar.expanded {
  width: 250px;
  box-shadow: $warm-shadow-medium;
}

.sidebar-content {
  padding: 0;
  width: 250px;
}

/* 側邊欄選單項目 */
.sidebar-menu {
  list-style: none;
  padding: 15px 0;
  margin: 0;
}

/* 分類標題 */
.sidebar-category {
  margin: 20px 0 8px 0;

  &:first-child {
    margin-top: 10px;
  }
}

.category-title {
  padding: 8px 18px;
  position: relative;
  display: flex;
  align-items: center;
}

.category-icon {
  font-size: 12px;
  margin-right: 8px;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.category-text {
  font-size: 12px;
  font-weight: 600;
  color: rgba($text-secondary-warm, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 1;
  transition: opacity 0.3s ease;
}

/* 收起狀態：隱藏分類容器和分類下的項目，但保留首頁 */
.sidebar:not(.expanded) .sidebar-category {
  display: none;
}

.sidebar:not(.expanded) .category-item {
  display: none;
}

/* 側邊欄項目 */
.sidebar-item {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  color: $text-secondary-warm;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  border-radius: 0 8px 8px 0;
  margin: 2px 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    background: $warm-gradient-primary;
    transition: width 0.3s ease;
    border-radius: 0 4px 4px 0;
  }

  &:hover {
    background-color: $hover-primary;
    color: $text-primary-warm;
    transform: translateX(2px);

    &::before {
      width: 3px;
    }
  }

  &.active {
    background-color: $active-primary;
    color: $primary-warm;
    font-weight: 600;
    box-shadow:
      inset -3px 0 0 $primary-warm,
      $warm-shadow-light;

    &::before {
      width: 4px;
      background: $primary-warm;
    }

    .sidebar-icon {
      color: $primary-warm;
      transform: scale(1.1);
    }
  }
}

/* 首頁項目特殊樣式 */
.home-item {
  /* 確保首頁項目始終可見且樣式正確 */
  margin: 8px 6px;
  border-radius: 8px;
}

/* 分類下的項目縮排 */
.category-item {
  padding-left: 30px;
  margin-left: 8px;
}

.sidebar-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s ease;
  color: inherit;
}

.sidebar-text {
  opacity: 1;
  transition: opacity 0.3s ease;
  font-weight: 500;
}

/* 收起狀態：隱藏文字但保持首頁圖示可見 */
.sidebar:not(.expanded) .sidebar-text {
  opacity: 0;
}

/* 收起狀態：調整項目居中，特別處理首頁項目 */
.sidebar:not(.expanded) .sidebar-item {
  justify-content: center;
  padding: 14px 12px;
  border-radius: 8px;
  margin: 3px 6px;

  &::before {
    display: none;
  }

  &:hover,
  &.active {
    transform: translateX(0);
    box-shadow: $warm-shadow-light;
  }
}

/* 收起狀態下的首頁項目 */
.sidebar:not(.expanded) .home-item {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 16px 12px !important;
  margin: 8px 6px !important;
  border-radius: 8px !important;

  .sidebar-icon {
    margin-right: 0 !important;
    font-size: 18px;
  }

  .sidebar-text {
    display: none;
  }

  &:hover {
    background-color: $hover-primary;
    transform: translateY(-1px);
  }

  &.active {
    background-color: $active-primary;
    color: $primary-warm;

    .sidebar-icon {
      color: $primary-warm;
      transform: scale(1.15);
    }
  }
}

.sidebar:not(.expanded) .sidebar-icon {
  margin-right: 0;
}

/* Tablet and Mobile */
@media (max-width: 768px) {
  .sidebar {
    width: 0;
    z-index: 2000;
    box-shadow: $warm-shadow-heavy;
    border-right: $warm-border-medium;
  }

  .sidebar.mobile-open {
    width: 250px;
  }

  /* 手機版顯示完整內容 */
  .sidebar-item {
    justify-content: flex-start !important;
    padding: 14px 18px !important;
    margin: 2px 8px !important;
    border-radius: 8px !important;

    &::before {
      display: block !important;
    }
  }

  .home-item {
    justify-content: flex-start !important;
    padding: 14px 18px !important;

    .sidebar-text {
      display: inline !important;
      opacity: 1 !important;
    }

    .sidebar-icon {
      margin-right: 12px !important;
      font-size: 16px !important;
    }
  }

  .category-item {
    padding-left: 30px !important;
  }

  .sidebar-icon {
    margin-right: 12px !important;
  }

  .sidebar-text,
  .category-text,
  .category-icon {
    opacity: 1 !important;
  }

  .sidebar-category {
    display: block !important;
  }
}
</style>
