<template>
  <div class="main-content-wrapper">
    <div class="schedule-section">
      <div class="schedule-header">
        <p class="schedule-subtitle">精心規劃的{{ totalDays }}天完美旅程</p>
      </div>

      <!-- 封面圖片區域 -->
      <div class="cover-image-area">
        <div class="cover-image"></div>
      </div>

      <!-- 主要功能區域 -->
      <div class="schedule-main-grid">
        <a v-for="card in mainCards" :key="card.id" :href="card.href" :class="['schedule-card', card.class]">
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
            <a v-for="day in totalDays" :key="day" :href="`itinerary-detail#day${day}`" class="daily-card">
              Day{{ day }}
            </a>
          </div>
        </div>
      </div>
      <div class="test">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium praesentium aperiam vel corporis numquam,
        quibusdam aliquid officia nobis ipsum, excepturi illo. Velit doloremque quis laborum nemo, similique inventore
        nostrum sequi.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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
@use '@/styles/variables' as *;

.main-content-wrapper {
  min-height: 100%;
  background: $bg-primary;
}

.schedule-section {
  margin: 0 auto;
  padding: 0;
  max-width: 1200px;
}

/* 頁面標題區域 */
.schedule-header {
  margin-bottom: 32px;
}

.schedule-subtitle {
  position: relative;
  margin: 0;
  padding: 24px 0;
  border-bottom: 2px solid $border-light;
  color: $text-secondary;
  text-align: center;
  font-weight: 600;
  font-size: 20px;

  &::before {
    margin-right: 8px;
    content: '✈️';
  }
}

/* 封面圖片區域 */
.cover-image-area {
  margin-bottom: 30px;
  width: 100%;
  height: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(238, 184, 104, 0.15);
}

.cover-image {
  width: 100%;
  height: 400px;
  background-position: center;
  // background: url('@/assets/img/bg/polar_bear.jpg');
  background-size: contain;
  background-repeat: no-repeat;

}

/* 主要功能卡片網格 */
.schedule-main-grid {
  display: grid;
  margin-bottom: 40px;

  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.schedule-card {
  position: relative;
  display: flex;
  overflow: hidden;
  align-items: center;
  flex-direction: column;
  padding: 24px;
  border: 1px solid $border-light;
  border-radius: 12px;
  background: $bg-card;
  box-shadow: 0 4px 12px $shadow-light;
  color: $text-primary;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s ease;

  &::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 4px;
    // background: linear-gradient(90deg, $accent-color-1, $accent-color-2);
    content: '';
    transition: transform 0.3s ease;
    transform: scaleX(0);
  }

  &:hover {
    border-color: $accent-color-1;
    box-shadow: 0 12px 32px $shadow-strong;
    transform: translateY(-4px);

    &::before {
      transform: scaleX(1);
    }

    .schedule-icon {
      transform: scale(1.1);
    }
  }

  h3 {
    margin: 16px 0 0 0;
    color: $text-secondary;
    font-weight: 600;
    font-size: 16px;
  }
}

.schedule-icon {
  margin-bottom: 8px;
  font-size: 32px;
  transition: transform 0.3s ease;
}

/* 每日行程區域 */
.daily-schedule-section {
  margin-top: 40px;
}

.daily-title {
  position: relative;
  margin-bottom: 24px;
  padding-bottom: 16px;
  color: $primary-color;
  text-align: center;
  font-weight: 700;
  font-size: 24px;

  &::after {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 80px;
    height: 3px;
    border-radius: 2px;
    background: linear-gradient(90deg, $accent-color-1, $accent-color-2);
    content: '';
    transform: translateX(-50%);
  }
}

.daily-grid {
  display: flex;
  justify-content: center;
}

.daily-block {
  display: grid;
  max-width: 800px;
  width: 100%;

  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.daily-card {
  position: relative;
  overflow: hidden;
  padding: 24px 16px;
  border: 2px solid $border-light;
  border-radius: 12px;
  background: $bg-card;
  color: $text-secondary;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;

  &::before {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    // background: linear-gradient(135deg, $accent-color-1, $accent-color-2);
    content: '';
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &::after {
    position: relative;
    z-index: 1;
    display: none;
    content: attr(href);
  }

  &:hover {
    border-color: $accent-color-1;
    box-shadow: 0 8px 24px $shadow-city;
    // color: white;
    transform: translateY(-2px);

    &::before {
      opacity: 1;
    }
  }
}

/* 響應式設計 */
@media (max-width: 968px) {
  .schedule-main-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }

  .cover-image {
    height: 200px;

    &::after {
      font-size: 20px;
    }
  }

  .daily-block {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .schedule-section {
    padding: 0 16px;
  }

  .schedule-subtitle {
    padding: 16px 0;
    font-size: 18px;
  }

  .schedule-main-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .schedule-card {
    padding: 16px;

    h3 {
      font-size: 14px;
    }
  }

  .schedule-icon {
    font-size: 28px;
  }

  .cover-image {
    height: 160px;
    border-radius: 8px;

    &::after {
      font-size: 16px;
    }
  }

  .daily-title {
    font-size: 20px;
  }

  .daily-block {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .daily-card {
    padding: 16px 8px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .schedule-main-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .schedule-card {
    padding: 24px 16px;
  }

  .daily-block {
    grid-template-columns: repeat(2, 1fr);
  }

  .cover-image {
    height: 140px;

    &::after {
      padding: 0 16px;
      font-size: 14px;
    }
  }
}
</style>