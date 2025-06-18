<template>
  <div class="itinerary-container">
    <!-- 返回首頁按鈕 -->
    <div class="back-to-home">
      <router-link to="/home" class="back-btn">
        <span class="back-icon">←</span>
        返回首頁
      </router-link>
    </div>

    <!-- 浮動導航目錄 -->
    <nav class="floating-nav" :class="{ 'nav-hidden': !showNav }">
      <div class="nav-toggle" @click="toggleNav">
        <span class="nav-icon">📋</span>
      </div>
      <div class="nav-menu" v-show="navOpen">
        <div class="nav-section">
          <h4>📋 行程資訊</h4>
          <a href="#cover" @click="scrollToSection('cover')" :class="{ active: activeSection === 'cover' }">封面</a>
          <a href="#flight" @click="scrollToSection('flight')" :class="{ active: activeSection === 'flight' }">航班資訊</a>
          <a href="#packing" @click="scrollToSection('packing')" :class="{ active: activeSection === 'packing' }">必帶物品</a>
          <a href="#map" @click="scrollToSection('map')" :class="{ active: activeSection === 'map' }">路線地圖</a>
          <a href="#overview" @click="scrollToSection('overview')" :class="{ active: activeSection === 'overview' }">行程總覽</a>
        </div>
        <div class="nav-section">
          <h4>📅 每日行程</h4>
          <a href="#day1" @click="scrollToSection('day1')" :class="{ active: activeSection === 'day1' }">第1天</a>
          <a href="#day2" @click="scrollToSection('day2')" :class="{ active: activeSection === 'day2' }">第2天</a>
          <a href="#day3" @click="scrollToSection('day3')" :class="{ active: activeSection === 'day3' }">第3天</a>
          <a href="#day4" @click="scrollToSection('day4')" :class="{ active: activeSection === 'day4' }">第4天</a>
          <a href="#day5" @click="scrollToSection('day5')" :class="{ active: activeSection === 'day5' }">第5天</a>
          <a href="#day6" @click="scrollToSection('day6')" :class="{ active: activeSection === 'day6' }">第6天</a>
          <a href="#day7" @click="scrollToSection('day7')" :class="{ active: activeSection === 'day7' }">第7天</a>
        </div>
      </div>
    </nav>

    <h1>行程規劃</h1>

    <!-- 主要內容區域 -->
    <div class="schedule-content">

      <!-- 封面 (Page 1) -->
      <section id="cover" class="schedule-section cover-section">
        <div class="section-container">
          <div class="image-container">
            <img src="/src/assets/img/itinerary/page1.jpg" alt="行程首頁封面" class="schedule-image" />
          </div>
        </div>
      </section>

      <!-- 航班資訊 (Page 2) -->
      <section id="flight" class="schedule-section flight-section">
        <div class="section-container">
          <div class="image-container">
            <img src="/src/assets/img/itinerary/page2.jpg" alt="航班資訊" class="schedule-image" />
          </div>
        </div>
      </section>

      <!-- 必帶物品 (Page 3-4) -->
      <section id="packing" class="schedule-section packing-section">
        <div class="section-container">
          <div class="image-container">
            <img src="/src/assets/img/itinerary/page3.jpg" alt="必帶物品清單第1頁" class="schedule-image" />
          </div>
          <div class="image-container">
            <img src="/src/assets/img/itinerary/page4.jpg" alt="必帶物品清單第2頁" class="schedule-image" />
          </div>
        </div>
      </section>

      <!-- 路線地圖 (Page 5) -->
      <section id="map" class="schedule-section map-section">
        <div class="section-container">
          <div class="image-container">
            <img src="/src/assets/img/itinerary/page5.jpg" alt="遊玩路線圖" class="schedule-image" />
          </div>
        </div>
      </section>

      <!-- 行程總覽 (Page 6) -->
      <section id="overview" class="schedule-section overview-section">
        <div class="section-container">
          <div class="image-container">
            <img src="/src/assets/img/itinerary/page6.jpg" alt="行程總覽" class="schedule-image" />
          </div>
        </div>
      </section>

      <!-- 每日詳細行程 (Page 7-13) -->
      <section id="day1" class="schedule-section daily-section">
        <div class="section-container">
          <div class="image-container">
            <img src="/src/assets/img/itinerary/page7.jpg" alt="第1天詳細行程" class="schedule-image" />
          </div>
        </div>
      </section>

      <section id="day2" class="schedule-section daily-section">
        <div class="section-container">
          <div class="image-container">
            <img src="/src/assets/img/itinerary/page8.jpg" alt="第2天詳細行程" class="schedule-image" />
          </div>
        </div>
      </section>

      <section id="day3" class="schedule-section daily-section">
        <div class="section-container">
          <div class="image-container">
            <img src="/src/assets/img/itinerary/page9.jpg" alt="第3天詳細行程" class="schedule-image" />
          </div>
        </div>
      </section>

      <section id="day4" class="schedule-section daily-section">
        <div class="section-container">
          <div class="image-container">
            <img src="/src/assets/img/itinerary/page10.jpg" alt="第4天詳細行程" class="schedule-image" />
          </div>
        </div>
      </section>

      <section id="day5" class="schedule-section daily-section">
        <div class="section-container">
          <div class="image-container">
            <img src="/src/assets/img/itinerary/page11.jpg" alt="第5天詳細行程" class="schedule-image" />
          </div>
        </div>
      </section>

      <section id="day6" class="schedule-section daily-section">
        <div class="section-container">
          <div class="image-container">
            <img src="/src/assets/img/itinerary/page12.jpg" alt="第6天詳細行程" class="schedule-image" />
          </div>
        </div>
      </section>

      <section id="day7" class="schedule-section daily-section">
        <div class="section-container">
          <div class="image-container">
            <img src="/src/assets/img/itinerary/page13.jpg" alt="第7天詳細行程" class="schedule-image" />
          </div>
        </div>
      </section>

    </div>

    <!-- 回到頂部按鈕 -->
    <button class="back-to-top" @click="scrollToTop" v-show="showBackToTop">
      ↑
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 響應式數據
const showNav = ref(true)
const navOpen = ref(false)
const showBackToTop = ref(false)
const activeSection = ref('cover')

// 切換導航顯示
const toggleNav = () => {
  navOpen.value = !navOpen.value
}

// 滾動到指定區域
const scrollToSection = (sectionId) => {
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
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 處理滾動事件
const handleScroll = () => {
  const scrollY = window.scrollY

  // 控制返回頂部按鈕顯示
  showBackToTop.value = scrollY > 300

  // 控制導航顯示/隱藏
  showNav.value = scrollY < 100 || navOpen.value

  // 更新當前活動區域
  updateActiveSection()
}

// 更新當前活動區域
const updateActiveSection = () => {
  const sections = ['cover', 'flight', 'packing', 'map', 'overview', 'day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7']
  const scrollPos = window.scrollY + 100

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = document.getElementById(sections[i])
    if (section && section.offsetTop <= scrollPos) {
      activeSection.value = sections[i]
      break
    }
  }
}

// 處理路由中的錨點
const handleRouteHash = () => {
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

<style scoped>
.itinerary-container {
  min-height: 100vh;
  background: #F8F9FA;
  position: relative;
}

/* 返回首頁按鈕 */
.back-to-home {
  position: fixed;
  top: 2rem;
  left: 2rem;
  z-index: 1000;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  text-decoration: none;
  color: #2E8B57;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.back-icon {
  font-size: 1.2rem;
}

/* 浮動導航 */
.floating-nav {
  position: fixed;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  z-index: 999;
  transition: all 0.3s ease;
}

.floating-nav.nav-hidden {
  transform: translateY(-50%) translateX(calc(100% + 1rem));
}

.nav-toggle {
  background: #2E8B57;
  color: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  margin-left: auto;
}

.nav-toggle:hover {
  transform: scale(1.1);
  background: #236645;
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-menu {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  margin-top: 1rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  min-width: 200px;
  max-height: 60vh;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 1.5rem;
}

.nav-section:last-child {
  margin-bottom: 0;
}

.nav-section h4 {
  color: #2E8B57;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  border-bottom: 1px solid rgba(46, 139, 87, 0.2);
  padding-bottom: 0.5rem;
}

.nav-section a {
  display: block;
  color: #2C3E50;
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.nav-section a:hover {
  background: rgba(46, 139, 87, 0.1);
  color: #2E8B57;
}

.nav-section a.active {
  background: #2E8B57;
  color: white;
  font-weight: 600;
}

/* 主標題 */
h1 {
  color: #2E8B57;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  padding: 2rem;
}

/* 主要內容區域 */
.schedule-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.schedule-section {
  margin-bottom: 2rem;
  scroll-margin-top: 100px; /* 為錨點定位留出空間 */
}

.schedule-section:last-child {
  margin-bottom: 1rem;
}

.section-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.image-container {
  margin-bottom: 2rem;
}

.image-container:last-child {
  margin-bottom: 0;
}

.schedule-image {
  width: 100%;
  height: auto;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.schedule-image:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

/* 回到頂部按鈕 */
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  background: #FF6B6B;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 998;
}

.back-to-top:hover {
  background: #e55a5a;
  transform: translateY(-3px);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .back-to-home {
    top: 1rem;
    left: 1rem;
  }

  .back-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .floating-nav {
    right: 1rem;
  }

  .nav-toggle {
    width: 45px;
    height: 45px;
  }

  .nav-menu {
    min-width: 180px;
    padding: 1.2rem;
  }

  .schedule-content {
    padding: 1rem;
  }

  .section-container {
    padding: 1rem;
  }

  .image-placeholder {
    min-height: 400px;
  }

  .placeholder-text {
    font-size: 1.1rem;
    padding: 1rem;
  }

  .back-to-top {
    bottom: 1rem;
    right: 1rem;
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }

  h1 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .schedule-section {
    margin-bottom: 1rem;
  }

  .image-placeholder {
    min-height: 300px;
  }

  .placeholder-text {
    font-size: 1rem;
  }

  h1 {
    font-size: 1.8rem;
  }
}
</style>