<template>
  <div class="main-content-wrapper">
    <div class="schedule-section">
      <div class="schedule-header">
        <p class="schedule-subtitle">精心規劃的{{ totalDays }}天完美旅程</p>
      </div>

      <!-- 封面圖片區域 -->
      <div class="cover-image-area">
        <swiper
          :modules="modules"
          :slides-per-view="1"
          :space-between="0"
          :loop="true"
          :autoplay="{ delay: 4000, disableOnInteraction: false }"
          :pagination="{ clickable: true, dynamicBullets: true }"
          :navigation="true"
          effect="fade"
          :fade-effect="{ crossFade: true }"
          class="cover-swiper"
        >
          <swiper-slide v-for="image in coverImages" :key="image.id">
            <div class="cover-slide">
              <img :src="image.src" :alt="image.alt" />
            </div>
          </swiper-slide>
        </swiper>
      </div>

      <!-- 主要功能區域 -->
      <div class="schedule-main-grid">
        <a
          v-for="card in mainCards"
          :key="card.id"
          :href="card.href"
          :class="['schedule-card', card.class]"
        >
          <div class="schedule-icon">{{ card.icon }}</div>
          <h3>{{ card.title }}</h3>
        </a>
      </div>

      <!-- 每日行程區域 -->
      <div class="daily-schedule-section">
        <h3 class="daily-title">📅 每日詳細行程</h3>
        <div class="daily-grid">
          <!-- 使用 v-for 生成每日行程 -->
          <div class="daily-block">
            <a
              v-for="day in totalDays"
              :key="day"
              :href="`itinerary-detail#day${day}`"
              class="daily-card"
            >
              Day{{ day }}
            </a>
          </div>
        </div>
      </div>
      <div class="test">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium praesentium aperiam vel
        corporis numquam, quibusdam aliquid officia nobis ipsum, excepturi illo. Velit doloremque
        quis laborum nemo, similique inventore nostrum sequi.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 導入 Swiper 組件和模組
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'

// 導入 Swiper 樣式
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import 'swiper/css/effect-fade'

// 接收側邊欄狀態和手機版狀態
defineProps({
  sidebarOpen: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

// Swiper 模組註冊
const modules = [Navigation, Pagination, Autoplay, EffectFade]
// 封面圖片數據
const coverImages = ref([
  {
    id: 1,
    src: '/src/assets/img/bg/banner_01.jpg'
  },
  {
    id: 2,
    src: '/src/assets/img/bg/banner_02.jpg'
  },
  {
    id: 3,
    src: '/src/assets/img/bg/banner_03.jpg'
  }
])

// 總天數配置
const totalDays = ref(6)
// 主要功能卡片數據
const mainCards = ref([
  {
    id: 'overview',
    href: 'itinerary-detail#overview',
    class: 'overview-card',
    icon: '📋',
    title: '行程總覽'
  },
  {
    id: 'flight',
    href: 'itinerary-detail#flight',
    class: 'flight-card',
    icon: '✈️',
    title: '航班資訊'
  },
  {
    id: 'map',
    href: 'itinerary-detail#map',
    class: 'map-card',
    icon: '🗺️',
    title: '路線地圖'
  },
  {
    id: 'packing',
    href: 'itinerary-detail#packing',
    class: 'packing-card',
    icon: '🎒',
    title: '必帶物品'
  },
  {
    id: 'notice',
    href: 'itinerary-detail#notice',
    class: 'notice-card',
    icon: '⚠️',
    title: '注意事項'
  }
])
</script>

<style lang="scss" scoped>
@use '@/styles/index' as *;

// 行程頁面 <style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

// ===================================
// 主要內容包裝
// ===================================
.main-content-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-md;

  @include tablet {
    padding: $spacing-lg;
  }

  @include desktop {
    padding: $spacing-xl;
  }
}

// ===================================
// 行程區塊
// ===================================
.schedule-section {
  width: 100%;
}

.schedule-header {
  text-align: center;
  margin-bottom: $spacing-xl;

  @include tablet {
    margin-bottom: $spacing-2xl;
  }
}

.schedule-subtitle {
  font-size: 18px;
  color: $text-secondary;
  font-weight: 500;
  margin: 0;

  @include tablet {
    font-size: 22px;
  }

  @include desktop {
    font-size: 24px;
  }
}

// ===================================
// 輪播圖區域
// ===================================
.cover-image-area {
  margin-bottom: $spacing-xl;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: 0 8px 32px $shadow-medium;

  @include tablet {
    margin-bottom: $spacing-2xl;
    border-radius: $border-radius-xl;
  }
}

.cover-swiper {
  width: 100%;
  height: 250px;

  @include tablet {
    height: 350px;
  }

  @include desktop {
    height: 400px;
  }

  @include large-desktop {
    height: 450px;
  }
}

.cover-slide {
  width: 100%;
  height: 100%;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
}

// ===================================
// Swiper 自訂樣式
// ===================================

// 導航按鈕
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: $primary-color;
  background: rgba(255, 255, 255, 0.9);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-top: -22px;
  box-shadow: 0 2px 8px $shadow-light;
  transition: all 0.2s ease;

  &:after {
    font-size: 18px;
    font-weight: bold;
  }

  &:hover {
    background: $accent-color-1;
    color: $text-white;
    transform: scale(1.1);
  }

  @include mobile-only {
    width: 36px;
    height: 36px;
    margin-top: -18px;

    &:after {
      font-size: 14px;
    }
  }
}

.swiper-button-prev {
  left: 15px;

  @include tablet {
    left: 20px;
  }
}

.swiper-button-next {
  right: 15px;

  @include tablet {
    right: 20px;
  }
}

// 分頁指示器
:deep(.swiper-pagination) {
  bottom: 15px;

  @include tablet {
    bottom: 20px;
  }
}

:deep(.swiper-pagination-bullet) {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 1;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: scale(1.2);
  }
}

:deep(.swiper-pagination-bullet-active) {
  background: $accent-color-2;
  transform: scale(1.3);
  box-shadow: 0 2px 8px rgba(230, 168, 107, 0.4);
}

// ===================================
// 主要功能卡片區域
// ===================================
.schedule-main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-lg;
    margin-bottom: $spacing-2xl;
  }

  @include desktop {
    grid-template-columns: repeat(3, 1fr);
  }

  @include large-desktop {
    grid-template-columns: repeat(5, 1fr);
  }
}

.schedule-card {
  @include card-hover;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
  background: $bg-card;
  border-radius: $border-radius-lg;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 8px $shadow-light;
  min-height: 120px;

  @include tablet {
    padding: $spacing-xl;
    min-height: 140px;
  }

  h3 {
    margin: $spacing-sm 0 0;
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    text-align: center;

    @include tablet {
      font-size: 18px;
    }
  }
}

.schedule-icon {
  font-size: 32px;
  margin-bottom: $spacing-sm;

  @include tablet {
    font-size: 36px;
  }
}

// 各卡片特殊樣式
.overview-card .schedule-icon {
  color: $primary-color;
}
.flight-card .schedule-icon {
  color: $accent-color-1;
}
.map-card .schedule-icon {
  color: $accent-color-2;
}
.packing-card .schedule-icon {
  color: $timeline-medium;
}
.notice-card .schedule-icon {
  color: $timeline-recent;
}

// ===================================
// 每日行程區域
// ===================================
.daily-schedule-section {
  margin-top: $spacing-2xl;
}

.daily-title {
  font-size: 20px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-lg;
  text-align: center;

  @include tablet {
    font-size: 24px;
    text-align: left;
  }
}

.daily-grid {
  width: 100%;
}

.daily-block {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;

  @include tablet {
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-lg;
  }

  @include desktop {
    grid-template-columns: repeat(4, 1fr);
  }

  @include large-desktop {
    grid-template-columns: repeat(6, 1fr);
  }
}

.daily-card {
  @include card-hover;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
  background: linear-gradient(135deg, $accent-color-1, $city-gradient-end);
  color: $text-white;
  text-decoration: none;
  border-radius: $border-radius-md;
  font-weight: 600;
  font-size: 16px;
  min-height: 80px;
  box-shadow: 0 4px 12px $shadow-city;

  @include tablet {
    font-size: 18px;
    min-height: 90px;
  }

  &:hover {
    box-shadow: 0 6px 20px $shadow-city-hover;
    transform: scale(1.02) translateY(-2px);
  }

  // 每日卡片顏色變化
  &:nth-child(odd) {
    background: linear-gradient(135deg, $accent-color-2, #d4941b);
  }

  &:nth-child(3n) {
    background: linear-gradient(135deg, $primary-color, #2d3748);
  }
}

// ===================================
// 測試區域樣式
// ===================================
.test {
  margin-top: $spacing-2xl;
  padding: $spacing-lg;
  background: $bg-card;
  border-radius: $border-radius-md;
  color: $text-muted;
  line-height: 1.6;
  box-shadow: 0 2px 8px $shadow-light;
}

// ===================================
// 響應式調整
// ===================================

// 手機版特殊處理
@include mobile-only {
  .main-content-wrapper {
    padding: $spacing-sm;
  }

  .schedule-card {
    min-height: 100px;
    padding: $spacing-md;

    h3 {
      font-size: 14px;
    }
  }

  .schedule-icon {
    font-size: 28px;
  }

  .daily-card {
    min-height: 70px;
    font-size: 14px;
  }
}

// 大桌面版優化
@include large-desktop {
  .main-content-wrapper {
    max-width: 1400px;
  }

  .cover-swiper {
    height: 500px;
  }
}

// ===================================
// Swiper 自訂樣式
// ===================================

// 導航按鈕
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: $primary-color;
  background: rgba(255, 255, 255, 0.9);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-top: -22px;
  box-shadow: 0 2px 8px $shadow-light;
  transition: all 0.2s ease;

  &:after {
    font-size: 18px;
    font-weight: bold;
  }

  &:hover {
    background: $accent-color-1;
    color: $text-white;
    transform: scale(1.1);
  }

  @include mobile-only {
    width: 36px;
    height: 36px;
    margin-top: -18px;

    &:after {
      font-size: 14px;
    }
  }
}

// 左右按鈕位置
:deep(.swiper-button-prev) {
  left: 15px;

  @include tablet {
    left: 20px;
  }
}

:deep(.swiper-button-next) {
  right: 15px;

  @include tablet {
    right: 20px;
  }
}

// 分頁指示器
:deep(.swiper-pagination) {
  bottom: 15px;

  @include tablet {
    bottom: 20px;
  }
}

:deep(.swiper-pagination-bullet) {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 1;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: scale(1.2);
  }
}

:deep(.swiper-pagination-bullet-active) {
  background: $accent-color-2;
  transform: scale(1.3);
  box-shadow: 0 2px 8px rgba(230, 168, 107, 0.4);
}
</style>
