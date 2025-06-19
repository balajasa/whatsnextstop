<template>
  <aside class="sidebar" :class="sidebarClasses">
    <div class="sidebar-content">
      <ul class="sidebar-menu">
        <li v-for="item in sidebarList" :key="item.path">
          <router-link :to="item.path" class="sidebar-item" :class="{ active: isActive(item.path) }">
            <div class="sidebar-icon">{{ item.icon }}</div>
            <span class="sidebar-text">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false
  },
  headerHeight: {
    type: Number,
    default: 50
  }
})

const emit = defineEmits(['keydown-escape'])

const route = useRoute()

// 側邊欄開關狀態
const isSidebarOpen = ref(false)

// 側邊欄列表
const sidebarList = [
  {
    name: '新對話',
    icon: '💬',
    path: '/'
  },
  {
    name: '歷史記錄',
    icon: '📚',
    path: '/history'
  },
  {
    name: '我的最愛',
    icon: '⭐',
    path: '/favorites'
  },
  {
    name: '文件庫',
    icon: '📄',
    path: '/documents'
  },
  {
    name: '設定',
    icon: '🔧',
    path: '/settings'
  },
  {
    name: '幫助',
    icon: '❓',
    path: '/help'
  }
]

// 計算側邊欄的CSS類別
const sidebarClasses = computed(() => {
  return {
    expanded: isSidebarOpen.value && !props.isMobile,
    'mobile-open': isSidebarOpen.value && props.isMobile
  }
})

// 判斷是否為當前路由
const isActive = (path) => {
  return route.path === path
}

// 切換側邊欄
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// 關閉側邊欄
const closeSidebar = () => {
  isSidebarOpen.value = false
}

// 重置側邊欄狀態（當螢幕尺寸改變時使用）
const resetSidebarState = () => {
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
    box-shadow: inset -3px 0 0 $primary-warm,
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

/* 收起狀態：隱藏文字 */
.sidebar:not(.expanded) .sidebar-text {
  opacity: 0;
}

/* 收起狀態：調整項目居中 */
.sidebar:not(.expanded) .sidebar-item {
  justify-content: center;
  padding: 14px 12px;
  border-radius: 6px;
  margin: 3px 6px;
  
  &::before {
    display: none;
  }
  
  &:hover, &.active {
    transform: translateX(0);
    box-shadow: $warm-shadow-light;
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

  .sidebar-icon {
    margin-right: 12px !important;
  }

  .sidebar-text {
    opacity: 1 !important;
  }
}
</style>