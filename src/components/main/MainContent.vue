<template>
  <div class="schedule-section">
    <div class="schedule-header">
      <p class="schedule-subtitle">精心規劃的6天完美旅程</p>
    </div>

    <!-- 封面圖片區域 -->
    <div class="cover-image-area">
      <div class="cover-image">
      </div>
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
          <a v-for="day in totalDaysArr" :key="day.id" :href="day.href" class="daily-card">
            {{ day.label }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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

// 主要功能卡片数据
const mainCards = [
  {
    id: 'overview',
    href: 'itinerary#overview',
    class: 'overview-card',
    icon: '📋',
    title: '行程總覽'
  },
  {
    id: 'flight',
    href: 'itinerary#flight',
    class: 'flight-card',
    icon: '✈️',
    title: '航班資訊'
  },
  {
    id: 'map',
    href: 'itinerary#map',
    class: 'map-card',
    icon: '🗺️',
    title: '路線地圖'
  },
  {
    id: 'packing',
    href: 'itinerary#packing',
    class: 'packing-card',
    icon: '🎒',
    title: '必帶物品'
  }
]

// 每日行程天數
const totalDays = 6;
const totalDaysArr = computed(() => {
  return Array.from({ length: 6 }, (_, index) => ({
    id: `day${index + 1}`,
    href: `itinerary#day${index + 1}`,
    label: `Day${index + 1}`
  }))
})
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

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
  height: 250px;
  margin-bottom: 30px;
  border-radius: 12px;
  box-shadow: $warm-shadow-medium;
}

.cover-image {
  width: 100%;
  height: 250px;
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

/* 主要功能區域 */
.schedule-main-grid {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.schedule-card {
  background: $warm-bg-card;
  backdrop-filter: blur(8px);
  border: $warm-border-light;
  border-radius: 12px;
  padding: 24px 20px;
  text-align: center;
  text-decoration: none;
  color: $text-primary-warm;
  transition: all 0.3s ease;
  box-shadow: $warm-shadow-light;
  position: relative;
  overflow: hidden;
  flex: 1;

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
  font-size: 2.2rem;
  margin-bottom: 12px;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba($primary-warm, 0.2));
}

.schedule-card h3 {
  margin: 0;
  font-size: 1.1rem;
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
  margin-bottom: 20px;
  color: $text-primary-warm;
  font-size: 1.3rem;
  font-weight: 600;
}

.daily-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.daily-block {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.daily-card {
  background: $warm-gradient-primary;
  color: white;
  padding: 24px 20px;
  border-radius: 12px;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  min-width: 80px;
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
@media (max-width: 768px) {
  .schedule-header h2 {
    font-size: 2.5rem;
  }

  .schedule-main-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 15px;
  }

  .schedule-card {
    padding: 18px 15px;
    border-radius: 10px;
    min-width: unset;
    max-width: unset;
    flex: unset;
  }

  .daily-grid {
    gap: 15px;
  }

  .daily-block {
    gap: 12px;
  }

  .daily-card {
    padding: 20px 16px;
    border-radius: 10px;
    min-width: 70px;
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
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 12px;
  }

  .schedule-card {
    border-radius: 8px;
    padding: 16px 12px;
    min-width: unset;
  }

  .schedule-icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }

  .schedule-card h3 {
    font-size: 1rem;
  }

  .daily-block {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .daily-block-top {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    width: 100%;
    max-width: 300px;
  }

  .daily-block-bottom {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }

  .daily-card {
    border-radius: 8px;
    padding: 18px 12px;
    min-width: 60px;
  }
}
</style>