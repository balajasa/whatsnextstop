<template>
  <aside class="sidebar" :class="sidebarClasses">
    <!-- 關閉按鈕 -->
    <button class="sidebar-close" @click="closeSidebar" type="button">
      <!-- <span class="close-icon">×</span> -->
    </button>
    <div class="sidebar-content">
      <ul class="sidebar-menu">
        <!-- 首頁 -->
        <li>
          <router-link
            to="/"
            class="sidebar-item home-item"
            :class="{ active: isActive('/') }"
            @click="handleItemClick"
          >
            <div class="sidebar-icon">🏠</div>
            <span class="sidebar-text">首頁</span>
          </router-link>
        </li>

        <!-- 分類 -->
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
              @click="handleItemClick"
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
import { SidebarItem, SidebarProps } from '../types/ILayout'

const props = withDefaults(defineProps<SidebarProps>(), {
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
    path: '/travel-trace'
  },
  {
    category: '小小樂趣',
    name: '小遊戲',
    icon: '🎮',
    path: '/minigame'
  }
]

// 根據分類獲取項目
const getItemsByCategory = (category: string): SidebarItem[] => {
  return sidebarList.filter(item => item.category === category)
}

// 計算側邊欄的CSS類別
const sidebarClasses = computed(() => {
  return {
    isOpen: isSidebarOpen.value && !props.isMobile,
    'mobile-open': isSidebarOpen.value && props.isMobile,
    'mobile-version': props.isMobile
  }
})

// 判斷是否為當前路由
const isActive = (path: string): boolean => {
  return route.path === path
}

// 處理側邊欄項目點擊
const handleItemClick = (): void => {
  // 點擊任何連結都關閉側邊欄
  closeSidebar()
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

// Sidebar.vue
<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

// ===================================
// 側邊欄主體
// ===================================
.sidebar {
  @include sidebar-base;
  width: $sidebar-width-mobile;
  background: $bg-sidebar;
  padding-top: $header-height;

  @include desktop {
    width: $sidebar-width-desktop;
    background: $bg-sidebar-desktop;
    backdrop-filter: blur(8px);
  }

  // 展開狀態
  &.isOpen {
    transform: translateX(0);
  }

  // 手機版展開
  &.mobile-open {
    transform: translateX(0);
  }

  // 手機版樣式
  &.mobile-version {
    background: $bg-sidebar;
    backdrop-filter: none;
  }
}

// ===================================
// 側邊欄內容
// ===================================
.sidebar-content {
  height: 100%;
  padding: $spacing-lg 0;
  overflow-y: auto;
  position: relative;

  @include desktop {
    padding: $spacing-xl 0;
  }
}

// ===================================
// 關閉按鈕（和漢堡選單相同位置和樣式）
// ===================================
.sidebar-close {
  position: absolute;
  top: 8px; // 與 header 中的漢堡選單對齊
  left: $spacing-md;
  width: 40px; // 與漢堡選單相同大小
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
  z-index: 10;

  // 使用 SVG 作為背景圖片
  background-image: url('@/assets/img/icon/close.svg');
  background-size: 20px 20px;
  background-position: center;
  background-repeat: no-repeat;

  // 如果 SVG 需要變色（假設原本是深色，要變成符合設計的顏色）
  filter: brightness(0) saturate(100%) invert(50%);

  @include tablet {
    left: $spacing-lg;
    background-size: 24px 24px;
  }

  &:hover {
    background-color: rgba(56, 178, 172, 0.1);
    // hover 時改變 SVG 顏色
    filter: brightness(0) saturate(100%) invert(43%) sepia(86%) saturate(1733%) hue-rotate(146deg)
      brightness(97%) contrast(86%);
  }

  &:active {
    background-color: rgba(56, 178, 172, 0.2);
  }
}

// ===================================
// 側邊欄選單
// ===================================
.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

// 選單項目
.sidebar-item {
  display: flex;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  text-decoration: none;
  color: $text-secondary;
  transition: all 0.2s ease-in-out;
  border-left: 4px solid transparent;
  gap: $spacing-md;

  @include desktop {
    padding: $spacing-md $spacing-xl;
  }

  &:hover {
    background: rgba(56, 178, 172, 0.1);
    color: $accent-color-1;
    transform: translateX(4px);
  }

  &.active {
    background: rgba(56, 178, 172, 0.15);
    color: $accent-color-1;
    border-left-color: $accent-color-1;
    font-weight: 600;
  }
}

// 首頁項目特殊樣式
.home-item {
  margin-bottom: $spacing-md;

  .sidebar-icon {
    font-size: 20px;
  }
}

// ===================================
// 分類樣式
// ===================================
.sidebar-category {
  margin-top: $spacing-lg;

  &:first-child {
    margin-top: 0;
  }
}

.category-title {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-lg;
  color: $text-muted;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;

  @include desktop {
    padding: $spacing-sm $spacing-xl;
  }
}

.category-icon {
  font-size: 16px;
  color: $accent-color-2;
}

.category-text {
  flex: 1;
}

// 分類項目
.category-item {
  position: relative;
  margin-left: $spacing-md;

  &:hover::before,
  &.active::before {
    background: $accent-color-1;
    transform: translateY(-50%) scale(1.5);
  }
}

// ===================================
// 圖標樣式
// ===================================
.sidebar-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;

  @include desktop {
    font-size: 20px;
    width: 28px;
  }
}

.sidebar-text {
  font-size: 15px;
  font-weight: 500;

  @include desktop {
    font-size: 16px;
  }
}

// ===================================
// 滾動條樣式
// ===================================
.sidebar-content {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: $border-primary;
    border-radius: 3px;

    &:hover {
      background: $accent-color-1;
    }
  }
}

// ===================================
// 響應式調整
// ===================================

// 手機版
@include mobile-only {
  .sidebar-item {
    padding: $spacing-md;
  }

  .category-title {
    padding: $spacing-sm $spacing-md;
  }

  .category-item {
    margin-left: $spacing-sm;

    &::before {
      left: calc(#{$spacing-md} - 8px);
    }
  }
}

// 平板版特殊調整
@include tablet-only {
  .sidebar {
    box-shadow: 2px 0 8px $shadow-medium;
  }
}

// 桌面版特殊效果
@include desktop {
  .sidebar-item {
    border-radius: 0 24px 24px 0;
    margin-right: $spacing-md;

    &:hover {
      box-shadow: 2px 2px 8px $shadow-light;
    }
  }

  .category-item {
    margin-right: $spacing-lg;
  }
}
</style>
