<template>
  <div class="sidebar-container">
    <!-- 手機版漢堡按鈕 -->
    <button class="mobile-toggle" @click="toggleSidebar" :aria-label="isSidebarOpen ? '收合選單' : '展開選單'">
      <div class="hamburger" :class="{ active: isSidebarOpen }">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>

    <!-- 側邊欄 -->
    <aside class="sidebar" :class="{ expanded: isSidebarOpen }">
      <!-- 桌面版漢堡按鈕 -->
      <div class="sidebar-toggle" @click="toggleSidebar">
        <div class="hamburger" :class="{ active: isSidebarOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- 導航內容 -->
      <nav class="sidebar-content">
        <ul class="nav-list">
          <li class="nav-item" v-for="item in sidebarList" :key="item.path">
            <a :href="item.path" class="nav-link" :title="!isSidebarOpen ? item.name : ''">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-text" v-show="isSidebarOpen">{{ item.name }}</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 覆蓋層 (僅手機版) -->
    <div class="overlay" :class="{ active: isSidebarOpen && isMobile }" @click="closeSidebar"></div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['keydown-escape'])

// 側邊欄開關狀態 (桌面版預設收合，行動版預設關閉)
const isSidebarOpen = ref(false)

// 側邊欄列表
const sidebarList = [
  {
    name: '首頁',
    icon: '🏠',
    path: '/'
  },
  {
    name: '世界地圖',
    icon: '🗺️',
    path: '/map'
  },
  {
    name: '行程表',
    icon: '🗓️',
    path: '/schedule'
  },
  {
    name: '我的足跡',
    icon: '👣',
    path: '/footprint'
  },
  {
    name: '小遊戲',
    icon: '🎮',
    path: '/tools'
  }
]

// 切換側邊欄
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// 關閉側邊欄 (手機版專用)
const closeSidebar = () => {
  if (props.isMobile) {
    isSidebarOpen.value = false
  }
}

// 暴露狀態和方法給父元件使用
defineExpose({
  isSidebarOpen,
  toggleSidebar
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

/* 手機版漢堡按鈕 */
.mobile-toggle {
  display: none;
  position: fixed;
  top: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: $warm-bg-sidebar;
  border: none;
  z-index: 1001;
  box-shadow: $warm-shadow-medium;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $warm-shadow-hover;
  }
}

/* 側邊欄容器 */
.sidebar-container {
  position: relative;
}

/* 側邊欄樣式 */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 60px;
  background: $warm-bg-sidebar;
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(238, 184, 104, 0.15);
  transition: width 0.3s ease;
  z-index: 1000;
  overflow: hidden;
  box-shadow: $warm-shadow-light;

  &.expanded {
    width: 250px;
    box-shadow: $warm-shadow-medium;
  }
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background: rgba(238, 184, 104, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(238, 184, 104, 0.1);

  &:hover {
    background: $hover-primary;
    backdrop-filter: blur(5px);
  }
}

/* 優化後的漢堡選單樣式 */
.hamburger {
  position: relative;
  width: 24px;
  height: 24px;
  cursor: pointer;

  span {
    display: block;
    position: absolute;
    height: 3px;
    width: 100%;
    background: $golden-yellow;
    border-radius: 2px;
    opacity: 1;
    left: 0;
    transform-origin: center;
    transition: all 0.3s cubic-bezier(0.77, 0.2, 0.05, 1.0);
    box-shadow: 0 1px 3px rgba(238, 184, 104, 0.3);

    &:nth-child(1) {
      top: 4px;
    }

    &:nth-child(2) {
      top: 11px;
    }

    &:nth-child(3) {
      top: 18px;
    }
  }

  &.active {
    span {
      background: $coral-red;
      box-shadow: 0 1px 3px rgba(239, 118, 122, 0.4);

      &:nth-child(1) {
        top: 11px;
        transform: rotate(45deg);
      }

      &:nth-child(2) {
        opacity: 0;
        transform: rotate(0deg) scale(0.2);
      }

      &:nth-child(3) {
        top: 11px;
        transform: rotate(-45deg);
      }
    }
  }
}

/* 側邊欄內容 */
.sidebar-content {
  padding: 60px 0 20px 0;
  opacity: 1;
  transition: opacity 0.3s ease;
}

/* 導航列表 */
.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  color: $deep-blue;
  text-decoration: none;
  transition: all 0.3s ease;
  min-height: 48px;
  border-radius: 0 25px 25px 0;
  margin-right: 10px;
  position: relative;
  justify-content: flex-start;

  // 未展開時居中顯示圖標
  .sidebar:not(.expanded) & {
    justify-content: center;
    padding: 14px 0;
    margin-right: 0;
    border-radius: 8px;
    margin: 4px 8px;
  }

  &:hover {
    background: $hover-primary;
    color: $golden-yellow;
    transform: translateX(5px);
    box-shadow: $warm-shadow-light;

    // 未展開時不移動
    .sidebar:not(.expanded) & {
      transform: translateY(-2px);
    }

    .nav-icon {
      transform: scale(1.1);
    }
  }

  &:active {
    background: rgba(238, 184, 104, 0.2);
  }
}

.nav-icon {
  font-size: 22px;
  min-width: 22px;
  text-align: center;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 1px 2px rgba(69, 105, 144, 0.2));
}

.nav-text {
  margin-left: 14px;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.3px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;

  // 展開時顯示文字
  .sidebar.expanded & {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 覆蓋層 */
.overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(69, 105, 144, 0.4);
  backdrop-filter: blur(3px);
  z-index: 999;
  transition: all 0.3s ease;

  &.active {
    display: block;
  }
}

/* 手機版樣式 */
@media (max-width: 768px) {
  .mobile-toggle {
    display: flex;
  }

  .sidebar {
    width: 0;
    background: rgba(253, 249, 243, 0.98);
    backdrop-filter: blur(15px);
    border-right: none;

    &.expanded {
      width: 250px;
      box-shadow: $warm-shadow-heavy;
    }
  }

  .sidebar-toggle {
    display: none;
  }

  .sidebar-content {
    padding-top: 80px;
    opacity: 1;
  }

  .nav-link {
    padding: 18px 20px;
    margin-right: 0;
    border-radius: 0;

    &:hover {
      transform: none;
      background: $hover-primary;
    }
  }

  .nav-icon {
    font-size: 26px;
  }

  .nav-text {
    font-size: 17px;
    margin-left: 16px;
  }
}

/* 平板優化 */
@media (min-width: 769px) and (max-width: 1024px) {
  .nav-text {
    font-size: 14px;
  }

  .nav-icon {
    font-size: 20px;
  }
}
</style>