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

// 總天數配置 - 改回6天與原始設計保持一致
const totalDays = ref(6)

// 主要功能卡片數據 - 全部改為 itinerary-detail 路徑
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
  }
])
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.main-content-wrapper {
  width: 1200px; /* 固定寬度 1200px */
  height: 100vh;
  margin: 0 auto;
  padding: 20px;
  background-color: $warm-bg-content;
  border-radius: 12px;
  box-shadow: $warm-shadow-medium;

  /* 確保在小螢幕上不會超出視窗 */
  @media (max-width: 1240px) {
    width: calc(100vw - 40px);
    max-width: 1200px;
  }
}

/* 行程表主區域 */
.schedule-section {
  width: 100%;
}

.schedule-header {
  text-align: center;
  margin-bottom: 30px;

  h2 {
    font-size: 3rem;
    margin-bottom: 10px;
    filter: drop-shadow(0 2px 4px rgba($primary-warm, 0.3));
  }
}

.schedule-subtitle {
  color: $text-secondary-warm;
  font-size: 1.1rem;
  font-weight: 500;
}

/* 封面圖片區域 */
.cover-image-area {
  width: 100%;
  height: 400px;
  margin-bottom: 30px;
  border-radius: 12px;
  box-shadow: $warm-shadow-medium;
}

.cover-image {
  width: 100%;
  height: 400px;
  background: url('@/assets/img/bg/polar_bear.jpg');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.cover-text {
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  z-index: 1;
  position: relative;
}

/* 主要功能區域 - 針對 1200px 寬度優化 */
.schedule-main-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 個等寬欄位 */
  gap: 24px; /* 增加間距以充分利用 1200px 寬度 */
  margin-bottom: 40px;

  /* 在 1200px 寬度下每個卡片約 270px 寬 */
}

.schedule-card {
  background: $warm-bg-card;
  backdrop-filter: blur(8px);
  border: $warm-border-light;
  border-radius: 12px;
  padding: 28px 24px; /* 增加內距 */
  text-align: center;
  text-decoration: none;
  color: $text-primary-warm;
  transition: all 0.3s ease;
  box-shadow: $warm-shadow-light;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: $warm-gradient-bg;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: $warm-shadow-hover;
    border-color: rgba($primary-warm, 0.3);

    &::before {
      opacity: 1;
    }

    .schedule-icon {
      transform: scale(1.1);
    }

    h3 {
      color: $primary-warm;
    }
  }
}

.schedule-icon {
  font-size: 2.4rem; /* 稍微增大圖標 */
  margin-bottom: 16px;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba($primary-warm, 0.2));
}

.schedule-card h3 {
  margin: 0;
  font-size: 1.2rem; /* 稍微增大文字 */
  font-weight: 600;
  color: $text-primary-warm;
  transition: color 0.3s ease;
}

/* 每日行程區域 */
.daily-schedule-section {
  margin-bottom: 30px;
}

.daily-title {
  text-align: center;
  margin-bottom: 24px;
  color: $text-primary-warm;
  font-size: 1.4rem;
  font-weight: 600;
}

.daily-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.daily-block {
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* 6 天排成一排 */
  gap: 20px; /* 在 1200px 寬度下每個按鈕約 180px 寬 */
  width: 100%;
  max-width: 1160px; /* 扣除外邊距後的最大寬度 */
}

.daily-card {
  background: $warm-gradient-primary;
  color: white;
  padding: 28px 20px; /* 增加垂直內距 */
  border-radius: 12px;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: $warm-shadow-medium;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: $warm-shadow-hover;

    &::before {
      opacity: 1;
    }
  }
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .schedule-main-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .daily-block {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .schedule-header h2 {
    font-size: 2.5rem;
  }

  .schedule-main-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .schedule-card {
    padding: 18px 15px;
    border-radius: 10px;
  }

  .daily-grid {
    gap: 15px;
  }

  .daily-block {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .daily-card {
    padding: 20px 16px;
    border-radius: 10px;
  }
}

@media (max-width: 480px) {
  .schedule-header h2 {
    font-size: 2rem;
  }

  .schedule-subtitle {
    font-size: 1rem;
  }

  .cover-image-area {
    height: 150px;
    border-radius: 10px;
  }

  .cover-image {
    height: 150px;
  }

  .schedule-main-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .schedule-card {
    border-radius: 8px;
    padding: 16px 12px;
  }

  .schedule-icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }

  .schedule-card h3 {
    font-size: 1rem;
  }

  .daily-block {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .daily-card {
    border-radius: 8px;
    padding: 18px 12px;
  }
}
</style>
