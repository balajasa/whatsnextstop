<template>
  <main class="main-container" :class="{ 'sidebar-expanded': sidebarOpen && !isMobile }">
    <div class="main-content">
      <!-- 世界地圖 -->
      <!-- <div class="world-map-section">
        <router-link to="/worldmap" class="nav-link">
          <div class="link-card">
            <div class="card-icon">🎯</div>
            <h3>🗺️ 世界地圖</h3>
            <p class="world-map-subtitle">探索世界各地的風景</p>
            <div class="card-decoration"></div>
          </div>
        </router-link>
      </div> -->

      <!-- 行程表主區域 -->
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
            <div class="daily-block">
              <a href="itinerary#day1" class="daily-card">Day1</a>
              <a href="itinerary#day2" class="daily-card">Day2</a>
              <a href="itinerary#day3" class="daily-card">Day3</a>
              <a href="itinerary#day4" class="daily-card">Day4</a>
            </div>
            <div class="daily-block">
              <a href="itinerary#day5" class="daily-card">Day5</a>
              <a href="itinerary#day6" class="daily-card">Day6</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
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

<style lang="scss" scoped>
@use '@/styles/variables' as *;

/* 主內容容器 */
.main-container {
  margin-left: 60px;
  min-height: 100vh;
  padding: 20px;
  transition: margin-left 0.3s ease;
  background: $warm-gradient-bg;

  &.sidebar-expanded {
    margin-left: 250px;
  }
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 世界地圖區域 */
.world-map-section {
  margin-bottom: 40px;
}

.nav-link {
  text-decoration: none;
  color: inherit;
}

.link-card {
  background: $warm-gradient-primary;
  border-radius: 20px;
  padding: 35px;
  text-align: center;
  color: white;
  box-shadow: $warm-shadow-medium;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  border: $warm-border-light;

  &:hover {
    transform: translateY(-8px);
    box-shadow: $warm-shadow-hover;
    background: linear-gradient(135deg, lighten($golden-yellow, 5%), lighten($coral-red, 5%));
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
}

.card-icon {
  font-size: 52px;
  margin-bottom: 18px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.link-card h3 {
  font-size: 32px;
  margin-bottom: 10px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.world-map-subtitle {
  font-size: 18px;
  opacity: 0.95;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.card-decoration {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 行程表區域 */
.schedule-section {
  background: $warm-bg-card;
  border-radius: 20px;
  padding: 40px;
  box-shadow: $warm-shadow-light;
  border: $warm-border-light;
  backdrop-filter: blur(10px);
}

.schedule-header {
  text-align: center;
  margin-bottom: 35px;

  h2 {
    font-size: 56px;
    margin-bottom: 12px;
    filter: drop-shadow(0 2px 4px rgba(238, 184, 104, 0.3));
  }
}

.schedule-subtitle {
  font-size: 20px;
  color: $text-secondary-warm;
  margin: 0;
  font-weight: 500;
}

/* 封面圖片區域 */
.cover-image-area {
  margin-bottom: 35px;
}

.cover-placeholder {
  height: 220px;
  background: $warm-gradient-bg;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(238, 184, 104, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background: $warm-gradient-hover;
    border-color: rgba(238, 184, 104, 0.5);
  }
}

.cover-text {
  color: $text-secondary-warm;
  font-size: 18px;
  font-weight: 500;
}

/* 主要功能網格 */
.schedule-main-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 45px;
}

.schedule-card {
  background: $warm-bg-card-hover;
  border: $warm-border-light;
  border-radius: 16px;
  padding: 28px;
  text-align: center;
  text-decoration: none;
  color: $text-primary-warm;
  transition: all 0.3s ease;
  box-shadow: $warm-shadow-light;
  position: relative;
  overflow: hidden;

  &:hover {
    border: $warm-border-accent;
    transform: translateY(-5px);
    box-shadow: $warm-shadow-hover;
    background: $warm-bg-card;

    .schedule-icon {
      transform: scale(1.1);
    }
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: $warm-gradient-primary;
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
}

.schedule-icon {
  font-size: 36px;
  margin-bottom: 15px;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(238, 184, 104, 0.2));
}

.schedule-card h3 {
  font-size: 18px;
  margin: 0;
  color: $text-primary-warm;
  font-weight: 600;
}

/* 每日行程區域 */
.daily-schedule-section {
  border-top: $warm-border-light;
  padding-top: 35px;
}

.daily-title {
  font-size: 24px;
  margin-bottom: 25px;
  color: $text-primary-warm;
  text-align: center;
  font-weight: 600;
}

.daily-grid {
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  padding: 18px 28px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: $warm-shadow-light;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;

  &:hover {
    transform: translateY(-3px);
    box-shadow: $warm-shadow-hover;
    background: linear-gradient(135deg, lighten($golden-yellow, 3%), lighten($coral-red, 3%));
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
    pointer-events: none;
  }
}

/* 手機版樣式 */
@media (max-width: 768px) {
  .main-container {
    margin-left: 0;
    padding: 80px 15px 20px;

    &.sidebar-expanded {
      margin-left: 0;
    }
  }

  .main-content {
    padding: 10px;
  }

  .link-card {
    padding: 28px;
    border-radius: 16px;

    h3 {
      font-size: 28px;
    }
  }

  .card-icon {
    font-size: 44px;
  }

  .world-map-subtitle {
    font-size: 16px;
  }

  .schedule-section {
    padding: 28px 20px;
    border-radius: 16px;

    .schedule-header h2 {
      font-size: 48px;
    }

    .schedule-subtitle {
      font-size: 18px;
    }
  }

  .cover-placeholder {
    height: 180px;
  }

  .cover-text {
    font-size: 16px;
  }

  .schedule-main-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .schedule-card {
    padding: 24px 16px;

    .schedule-icon {
      font-size: 32px;
    }

    h3 {
      font-size: 16px;
    }
  }

  .daily-title {
    font-size: 22px;
  }

  .daily-block {
    gap: 10px;
  }

  .daily-card {
    padding: 14px 20px;
    font-size: 15px;
    border-radius: 10px;
  }
}

/* 平板樣式 */
@media (min-width: 769px) and (max-width: 1024px) {
  .main-content {
    max-width: 900px;
  }

  .schedule-main-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }

  .link-card {
    padding: 32px;

    h3 {
      font-size: 30px;
    }
  }

  .schedule-section {
    padding: 35px;
  }
}

/* 大螢幕樣式 */
@media (min-width: 1400px) {
  .main-content {
    max-width: 1400px;
  }

  .link-card {
    padding: 40px;

    .card-icon {
      font-size: 58px;
    }

    h3 {
      font-size: 36px;
    }

    .world-map-subtitle {
      font-size: 20px;
    }
  }

  .schedule-section {
    padding: 45px;
  }

  .schedule-main-grid {
    gap: 25px;
  }

  .schedule-card {
    padding: 32px;

    .schedule-icon {
      font-size: 40px;
    }

    h3 {
      font-size: 20px;
    }
  }
}
</style>