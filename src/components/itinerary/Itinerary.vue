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
          <a href="#itinerary" @click="scrollToSection('itinerary')"
            :class="{ active: activeSection === 'itinerary' }">行程內容</a>
        </div>
      </div>
    </nav>

    <!-- 主要內容區域 -->
    <div class="schedule-content">
      <!-- 行程內容 -->
      <section id="itinerary" class="schedule-section itinerary-section">
        <div class="section-container">
          <div class="iframe-container">
            <div style="position: relative; width: 100%; height: 0; padding-top: 141.4286%;
              padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
              border-radius: 8px; will-change: transform;">
              <iframe loading="lazy"
                style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
                src="https://www.canva.com/design/DAGo__QAg-I/ZUWMoq-agdfYIO8WE9nLhA/view?embed"
                allowfullscreen="allowfullscreen" allow="fullscreen">
              </iframe>
            </div>
            <!-- <div class="iframe-attribution">
              <a href="https://www.canva.com/design/DAGo__QAg-I/ZUWMoq-agdfYIO8WE9nLhA/view?utm_content=DAGo__QAg-I&utm_campaign=designshare&utm_medium=embeds&utm_source=link"
                target="_blank" rel="noopener"></a>
            </div> -->
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
const activeSection = ref('itinerary')

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
  const sections = ['itinerary']
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

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.itinerary-container {
  min-height: 100vh;
  background: $warm-bg-base; // 使用統一的暖米白背景
  position: relative;

  // 添加溫暖的背景漸變效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(circle at 25% 30%, rgba(238, 184, 104, 0.08) 0%, transparent 55%),
      radial-gradient(circle at 70% 20%, rgba(239, 118, 122, 0.06) 0%, transparent 50%),
      radial-gradient(circle at 60% 80%, rgba(69, 105, 144, 0.04) 0%, transparent 45%);
    pointer-events: none;
    z-index: 0;
  }
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
  background: $warm-bg-card;
  border-radius: 25px;
  text-decoration: none;
  color: $text-primary-warm;
  font-weight: 600;
  box-shadow: $warm-shadow-medium;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border: $warm-border-light;

  &:hover {
    background: $warm-bg-card-hover;
    transform: translateY(-2px);
    box-shadow: $warm-shadow-hover;
    color: $coral-red;
    border-color: rgba(239, 118, 122, 0.3);
  }
}

.back-icon {
  font-size: 1.2rem;
  color: $golden-yellow;
}

/* 浮動導航 */
.floating-nav {
  position: fixed;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  z-index: 999;
  transition: all 0.3s ease;

  &.nav-hidden {
    transform: translateY(-50%) translateX(calc(100% + 1rem));
  }
}

.nav-toggle {
  background: $primary-warm; // 金黃色
  color: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: $warm-shadow-medium;
  transition: all 0.3s ease;
  margin-left: auto;

  &:hover {
    transform: scale(1.1);
    background: $coral-red; // hover時變珊瑚紅
    box-shadow: $warm-shadow-hover;
  }
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-menu {
  background: $warm-bg-card;
  border-radius: 15px;
  padding: 1.5rem;
  margin-top: 1rem;
  box-shadow: $warm-shadow-heavy;
  backdrop-filter: blur(10px);
  min-width: 200px;
  max-height: 60vh;
  overflow-y: auto;
  border: $warm-border-light;
}

.nav-section {
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }

  h4 {
    color: $primary-warm; // 金黃色標題
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
    border-bottom: 1px solid rgba(238, 184, 104, 0.2);
    padding-bottom: 0.5rem;
  }

  a {
    display: block;
    color: $text-primary-warm;
    text-decoration: none;
    padding: 0.5rem 0.8rem;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
      background: $hover-primary;
      color: $coral-red;
    }

    &.active {
      background: $primary-warm;
      color: white;
      font-weight: 600;
    }
  }
}

/* 主要內容區域 */
.schedule-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.schedule-section {
  margin-bottom: 2rem;
  scroll-margin-top: 100px;

  &:last-child {
    margin-bottom: 1rem;
  }
}

.section-container {
  background: $warm-bg-section;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: $warm-shadow-heavy;
  backdrop-filter: blur(10px);
  border: $warm-border-light;
  position: relative;

  // 添加溫暖的內部光暈效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: $warm-gradient-bg;
    border-radius: 20px;
    opacity: 0.3;
    pointer-events: none;
  }
}

.iframe-container {
  width: 100%;
  position: relative;
  z-index: 1;

  // 覆蓋內聯樣式的陰影，使用溫暖色調
  div[style*="box-shadow"] {
    box-shadow: $warm-shadow-medium !important;
  }
}

.iframe-attribution {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: $text-secondary-warm;

  a {
    color: $primary-warm;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: $coral-red;
      text-decoration: underline;
    }
  }
}

/* 回到頂部按鈕 */
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  background: $secondary-warm; // 珊瑚紅
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: $warm-shadow-medium;
  transition: all 0.3s ease;
  z-index: 998;

  &:hover {
    background: $primary-warm; // hover時變金黃色
    transform: translateY(-3px);
    box-shadow: $warm-shadow-hover;
  }
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
    border-radius: 16px;
  }

  .back-to-top {
    bottom: 1rem;
    right: 1rem;
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .schedule-section {
    margin-bottom: 1rem;
  }

  .section-container {
    padding: 0.8rem;
    border-radius: 12px;
  }
}
</style>