<template>
  <aside class="sidebar" :class="sidebarClasses">
    <div class="sidebar-content">
      <ul class="sidebar-menu">
        <!-- 首頁 - 始終顯示 -->
        <li>
          <router-link to="/" class="sidebar-item home-item" :class="{ active: isActive('/') }"
            @click="handleItemClick">
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
            <router-link :to="item.path" class="sidebar-item category-item" :class="{ active: isActive(item.path) }"
              @click="handleItemClick">
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

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.sidebar {
  position: fixed;
  top: 65px; // Header height + border
  bottom: 0;
  left: 0;
  z-index: 950;
  overflow-y: auto;
  padding: 32px 24px;
  width: 250px;
  height: 100vh;
  border-right: 1px solid $border-primary;
  background: $bg-sidebar;
  transition: transform 0.3s ease;
  transform: translateX(-100%);

  // 桌面版展開狀態
  &.isOpen {
    position: relative;
    top: auto;
    bottom: auto;
    left: auto;
    transform: translateX(0);

    grid-row: 2;
  }

  // 手機版開啟狀態
  &.mobile-open {
    transform: translateX(0);
  }

  // 手機版樣式調整
  &.mobile-version {
    top: 46px; // 調整手機版 header 高度
    width: 250px;
  }
}

.sidebar-content {
  height: 100%;
}

.sidebar-menu {
  margin: 0;
  margin-bottom: 32px;
  padding: 0;
  list-style: none;

  li {
    margin-bottom: 8px;
  }
}

// 分類標題
.sidebar-category {
  margin-top: 24px;
  margin-bottom: 16px;

  &:first-child {
    margin-top: 0;
  }
}

.category-title {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  color: $primary-color;
  font-weight: 600;
  font-size: 16px;
  opacity: 0.8;

  gap: 8px;
}

.category-icon {
  font-size: 16px;
}

.category-text {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 14px;
}

// 側邊欄項目
.sidebar-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 8px;
  color: #4A5568; // 預設文字顏色
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;

  gap: 16px;

  &:hover {
    background: #E6A86B; // 橙色背景
    color: white; // 白色文字
    transform: translateX(4px); // 跟 HTML 模板一樣的移動效果
  }

  &.active {
    background: #4A5568; // 深灰背景
    color: white; // 白色文字
    font-weight: 600;
  }
}

.sidebar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  font-size: 18px;
}

.sidebar-text {
  flex: 1;
  font-size: 14px;
}

// 首頁項目特殊樣式
.home-item {
  margin-bottom: 24px;
  border-bottom: 1px solid $border-light;
  font-weight: 600;

  .sidebar-icon {
    font-size: 20px;
  }

  .sidebar-text {
    font-size: 16px;
  }
}

// 分類項目樣式
.category-item {
  margin-left: 16px;
  padding-left: 24px;

  &:hover {
    border-left-color: $accent-color-1;
  }

  &.active {
    border-left-color: $accent-color-2;
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .sidebar {
    top: 57px; // 手機版 header 高度
    width: 280px;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);

    .mobile-version {
      top: 0;
    }
  }

  .category-title {
    font-size: 15px;
  }

  .sidebar-item {
    padding: 10px 14px;
  }

  .sidebar-text {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    padding: 24px 16px;
    width: 260px;
  }

  .category-title {
    padding: 8px;
  }

  .sidebar-item {
    padding: 10px 14px;
  }
}

/* 自定義滾動條 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  border-radius: 3px;
  background: rgba($border-primary, 0.3);
}

.sidebar::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: $border-primary;

  &:hover {
    background: rgba($primary-color, 0.5);
  }
}
</style>