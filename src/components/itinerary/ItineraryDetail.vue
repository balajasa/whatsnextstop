<template>
  <div class="itinerary-detail-container">
    <!-- 麵包屑 -->
    <BreadcrumbNav />

    <!-- 浮動導航目錄 -->
    <nav class="itinerary-detail-floating-nav" :class="{ 'itinerary-detail-nav-hidden': !showNav }">
      <div class="itinerary-detail-nav-toggle" @click="toggleNav">
        <span class="itinerary-detail-nav-icon">📋</span>
      </div>
      <div class="itinerary-detail-nav-menu" v-show="navOpen">
        <div class="itinerary-detail-nav-section">
          <h4>📋 行程資訊</h4>
          <a
            v-for="section in infoSections"
            :key="section.id"
            :href="`#${section.id}`"
            @click="scrollToSection(section.id)"
            :class="{ 'itinerary-detail-active': activeSection === section.id }"
          >
            {{ section.name }}
          </a>
        </div>
        <div class="itinerary-detail-nav-section">
          <h4>📅 每日行程</h4>
          <a
            v-for="day in totalDays"
            :key="day"
            :href="`#day${day}`"
            @click="scrollToSection(`day${day}`)"
            :class="{ 'itinerary-detail-active': activeSection === `day${day}` }"
          >
            第{{ day }}天
          </a>
        </div>
      </div>
    </nav>

    <h1 class="itinerary-detail-title">行程規劃</h1>

    <!-- 主要內容區域 -->
    <div class="itinerary-detail-schedule-content">
      <!-- 行程資訊區域 -->
      <section
        v-for="section in infoSections"
        :key="section.id"
        :id="section.id"
        :class="`itinerary-detail-schedule-section ${section.class}`"
      >
        <div class="itinerary-detail-section-container">
          <div
            v-for="(image, index) in section.images"
            :key="index"
            class="itinerary-detail-image-container"
          >
            <img :src="image.src" :alt="image.alt" class="itinerary-detail-schedule-image" />
          </div>
        </div>
      </section>

      <!-- 每日詳細行程 -->
      <section
        v-for="day in totalDays"
        :key="day"
        :id="`day${day}`"
        class="itinerary-detail-schedule-section itinerary-detail-daily-section"
      >
        <div class="itinerary-detail-section-container">
          <div class="itinerary-detail-image-container">
            <img
              :src="`/src/assets/img/itinerary/page${day + 6}.jpg`"
              :alt="`第${day}天詳細行程`"
              class="itinerary-detail-schedule-image"
            />
          </div>
        </div>
      </section>
    </div>

    <!-- 回到頂部按鈕 -->
    <button class="itinerary-detail-back-to-top" @click="scrollToTop" v-show="showBackToTop">
      ↑
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Ref } from 'vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
import { InfoSection } from '../types/IItinerary'

const route = useRoute()

// 響應式數據
const showNav: Ref<boolean> = ref(true)
const navOpen: Ref<boolean> = ref(false)
const showBackToTop: Ref<boolean> = ref(false)
const activeSection: Ref<string> = ref('cover')

// 總天數配置
const totalDays: Ref<number> = ref(6)

// 行程資訊區域配置
const infoSections: Ref<InfoSection[]> = ref([
  {
    id: 'cover',
    name: '封面',
    class: 'cover-section',
    images: [{ src: '/src/assets/img/itinerary/page1.jpg', alt: '行程首頁封面' }]
  },
  {
    id: 'flight',
    name: '航班資訊',
    class: 'flight-section',
    images: [{ src: '/src/assets/img/itinerary/page2.jpg', alt: '航班資訊' }]
  },
  {
    id: 'packing',
    name: '必帶物品',
    class: 'packing-section',
    images: [
      { src: '/src/assets/img/itinerary/page3.jpg', alt: '必帶物品清單第1頁' },
      { src: '/src/assets/img/itinerary/page4.jpg', alt: '必帶物品清單第2頁' }
    ]
  },
  {
    id: 'map',
    name: '路線地圖',
    class: 'map-section',
    images: [{ src: '/src/assets/img/itinerary/page5.jpg', alt: '遊玩路線圖' }]
  },
  {
    id: 'overview',
    name: '行程總覽',
    class: 'overview-section',
    images: [{ src: '/src/assets/img/itinerary/page6.jpg', alt: '行程總覽' }]
  }
])

// 計算屬性：生成所有區域ID供滾動檢測使用
const allSections = computed((): string[] => {
  const info = infoSections.value.map(section => section.id)
  const days = Array.from({ length: totalDays.value }, (_, i) => `day${i + 1}`)
  return [...info, ...days]
})

// 切換導航顯示
const toggleNav = (): void => {
  navOpen.value = !navOpen.value
}

// 滾動到指定區域
const scrollToSection = (sectionId: string): void => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
  navOpen.value = false // 關閉導航選單
}

// 滾動到頂部
const scrollToTop = (): void => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 處理滾動事件
const handleScroll = (): void => {
  const scrollY = window.scrollY

  // 控制返回頂部按鈕顯示
  showBackToTop.value = scrollY > 300

  // 控制導航顯示/隱藏
  showNav.value = scrollY < 100 || navOpen.value

  // 更新當前活動區域
  updateActiveSection()
}

// 更新當前活動區域
const updateActiveSection = (): void => {
  const scrollPos = window.scrollY + 100

  for (let i = allSections.value.length - 1; i >= 0; i--) {
    const section = document.getElementById(allSections.value[i])
    if (section && section.offsetTop <= scrollPos) {
      activeSection.value = allSections.value[i]
      break
    }
  }
}

// 處理路由中的錨點
const handleRouteHash = (): void => {
  if (route.hash) {
    const sectionId = route.hash.substring(1) // 移除 # 符號
    setTimeout(() => {
      scrollToSection(sectionId)
    }, 100)
  }
}

// 在組件載入時執行
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleRouteHash() // 處理錨點跳轉
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.itinerary-detail-container {
  position: relative;
  background: #f8f9fa;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: $warm-bg-content;
  border-radius: 12px;
  box-shadow: $warm-shadow-medium;
}

/* 浮動導航 */
.itinerary-detail-floating-nav {
  position: fixed;
  top: 50%;
  right: 2rem;
  z-index: 999;
  transition: all 0.3s ease;
  transform: translateY(-50%);
}

.itinerary-detail-floating-nav.itinerary-detail-nav-hidden {
  transform: translateY(-50%) translateX(calc(100% + 1rem));
}

.itinerary-detail-nav-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #2e8b57;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.itinerary-detail-nav-toggle:hover {
  background: #236645;
  transform: scale(1.1);
}

.itinerary-detail-nav-icon {
  font-size: 1.2rem;
}

.itinerary-detail-nav-menu {
  overflow-y: auto;
  margin-top: 1rem;
  padding: 1.5rem;
  min-width: 200px;
  max-height: 60vh;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.itinerary-detail-nav-section {
  margin-bottom: 1.5rem;
}

.itinerary-detail-nav-section:last-child {
  margin-bottom: 0;
}

.itinerary-detail-nav-section h4 {
  margin-bottom: 0.8rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(46, 139, 87, 0.2);
  color: #2e8b57;
  font-weight: 600;
  font-size: 0.9rem;
}

.itinerary-detail-nav-section a {
  display: block;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  color: #2c3e50;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.itinerary-detail-nav-section a:hover {
  background: rgba(46, 139, 87, 0.1);
  color: #2e8b57;
}

.itinerary-detail-nav-section a.itinerary-detail-active {
  background: #2e8b57;
  color: white;
  font-weight: 600;
}

/* 主標題 */
.itinerary-detail-title {
  padding: 2rem;
  color: #2e8b57;
  text-align: center;
  font-weight: 700;
  font-size: 2.5rem;
}

/* 主要內容區域 */
.itinerary-detail-schedule-content {
  margin: 0 auto;
  padding: 2rem;
  max-width: 1200px;
}

.itinerary-detail-schedule-section {
  margin-bottom: 2rem;
  scroll-margin-top: 100px;
}

.itinerary-detail-schedule-section:last-child {
  margin-bottom: 1rem;
}

.itinerary-detail-section-container {
  padding: 2rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.itinerary-detail-image-container {
  margin-bottom: 2rem;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.itinerary-detail-image-container:last-child {
  margin-bottom: 0;
}

.itinerary-detail-image-container:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.itinerary-detail-schedule-image {
  width: 100%;
  height: auto;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 回到頂部按鈕 */
.itinerary-detail-back-to-top {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 998;
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: #ff6b6b;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.itinerary-detail-back-to-top:hover {
  background: #e55a5a;
  transform: translateY(-3px);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .itinerary-detail-back-to-home {
    top: 1rem;
    left: 1rem;
  }

  .itinerary-detail-back-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .itinerary-detail-floating-nav {
    right: 1rem;
  }

  .itinerary-detail-nav-toggle {
    width: 45px;
    height: 45px;
  }

  .itinerary-detail-nav-menu {
    padding: 1.2rem;
    min-width: 180px;
  }

  .itinerary-detail-schedule-content {
    padding: 1rem;
  }

  .itinerary-detail-section-container {
    padding: 1rem;
  }

  .itinerary-detail-back-to-top {
    right: 1rem;
    bottom: 1rem;
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }

  .itinerary-detail-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .itinerary-detail-schedule-section {
    margin-bottom: 1rem;
  }

  .itinerary-detail-title {
    font-size: 1.8rem;
  }
}
</style>
