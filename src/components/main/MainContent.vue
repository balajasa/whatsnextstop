<template>
  <div class="schedule-section">
    <div class="schedule-header">
      <h2>🗓️</h2>
      <p class="schedule-subtitle">精心規劃的6天完美旅程</p>
    </div>

    <!-- 封面圖片區域 -->
    <div class="cover-image-area">
      <div class="cover-placeholder">
        <span class="cover-text">[封面圖片區域]</span>
      </div>
    </div>

    <!-- 主要功能區域 -->
    <div class="schedule-main-grid">
      <a href="itinerary#overview" class="schedule-card overview-card">
        <div class="schedule-icon">📋</div>
        <h3>行程總覽</h3>
      </a>
      <a href="itinerary#flight" class="schedule-card flight-card">
        <div class="schedule-icon">✈️</div>
        <h3>航班資訊</h3>
      </a>
      <a href="itinerary#map" class="schedule-card map-card">
        <div class="schedule-icon">🗺️</div>
        <h3>路線地圖</h3>
      </a>
      <a href="itinerary#packing" class="schedule-card packing-card">
        <div class="schedule-icon">🎒</div>
        <h3>必帶物品</h3>
      </a>
    </div>

    <!-- 每日行程區域 -->
    <div class="daily-schedule-section">
      <h3 class="daily-title">📅 每日詳細行程</h3>
      <div class="daily-grid">
        <!-- 上排：Day1-Day4 -->
        <div class="daily-block daily-block-top">
          <a href="itinerary#day1" class="daily-card">Day1</a>
          <a href="itinerary#day2" class="daily-card">Day2</a>
          <a href="itinerary#day3" class="daily-card">Day3</a>
          <a href="itinerary#day4" class="daily-card">Day4</a>
        </div>
        <!-- 下排：Day5-Day6 -->
        <div class="daily-block daily-block-bottom">
          <a href="itinerary#day5" class="daily-card">Day5</a>
          <a href="itinerary#day6" class="daily-card">Day6</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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
  margin-bottom: 30px;
}

.cover-placeholder {
  height: 200px;
  background: $warm-gradient-primary;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
  box-shadow: $warm-shadow-medium;
  border: $warm-border-light;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1.5" fill="rgba(255,255,255,0.15)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
    opacity: 0.3;
  }
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

  .cover-placeholder {
    height: 150px;
    font-size: 16px;
    border-radius: 10px;
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

  .content-placeholder {
    height: 100px;
    font-size: 14px;
    border-radius: 8px;
  }
}
</style>