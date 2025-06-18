<template>
  <div class="home">
    <div class="home-container">
      <h1>選擇功能</h1>

      <!-- 行程表主區域 -->
      <div class="schedule-section">
        <div class="schedule-header">
          <h2>🗓️ 我的旅遊行程表</h2>
          <p class="schedule-subtitle">精心規劃的7天完美旅程</p>
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
            <a href="itinerary#day1" class="daily-card">Day1</a>
            <a href="itinerary#day2" class="daily-card">Day2</a>
            <a href="itinerary#day3" class="daily-card">Day3</a>
            <a href="itinerary#day4" class="daily-card">Day4</a>
            <a href="itinerary#day5" class="daily-card">Day5</a>
            <a href="itinerary#day6" class="daily-card">Day6</a>
            <a href="itinerary#day7" class="daily-card">Day7</a>
          </div>
        </div>
      </div>

      <!-- 小遊戲區域 -->
      <div class="games-section">
        <h2 class="games-title">🎮 休閒小遊戲</h2>
        <div class="nav-links">
          <router-link to="/dropblock" class="nav-link">
            <div class="link-card dropblock-card mini-card">
              <div class="card-icon">🎯</div>
              <h3>跳格子</h3>
              <p>經典的跳格子遊戲</p>
              <div class="card-decoration"></div>
            </div>
          </router-link>
          <router-link to="/foodwheel" class="nav-link">
            <div class="link-card foodwheel-card mini-card">
              <div class="card-icon">🎪</div>
              <h3>美食轉輪</h3>
              <p>讓轉輪決定今天吃什麼</p>
              <div class="card-decoration"></div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.home {
  min-height: 100vh;
  background: #F8F9FA;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(circle at 20% 30%, rgba($coral-red, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba($golden-yellow, 0.06) 0%, transparent 45%),
      radial-gradient(circle at 60% 80%, rgba($teal-green, 0.07) 0%, transparent 50%),
      radial-gradient(circle at 30% 70%, rgba($mint-green, 0.05) 0%, transparent 40%);
    pointer-events: none;
    z-index: 0;
  }
}

.home-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  box-shadow:
    0 25px 50px rgba($deep-blue, 0.15),
    0 10px 25px rgba($teal-green, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  position: relative;
  z-index: 1;
  max-width: 900px;
  width: 100%;
}

h1 {
  background: linear-gradient(135deg, $coral-red, $deep-blue);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: 2px;
  position: relative;

  &::after {
    content: '✨';
    position: absolute;
    right: -40px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 2rem;
    animation: sparkle 3s ease-in-out infinite;
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 1;
    transform: translateY(-50%) rotate(0deg) scale(1);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-60%) rotate(10deg) scale(1.1);
  }
}

/* 行程表區域 */
.schedule-section {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 8px 25px rgba($deep-blue, 0.08);
  border: 1px solid rgba($teal-green, 0.1);
}

.schedule-header {
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    font-size: 2rem;
    font-weight: 600;
    background: linear-gradient(135deg, $teal-green, $deep-blue);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }

  .schedule-subtitle {
    color: $deep-blue;
    font-size: 1.1rem;
    opacity: 0.8;
    margin-bottom: 0;
  }
}

/* 封面圖片區域 */
.cover-image-area {
  margin-bottom: 2rem;

  .cover-placeholder {
    width: 100%;
    height: 200px;
    background: linear-gradient(135deg, rgba($teal-green, 0.1), rgba($mint-green, 0.1));
    border: 2px dashed rgba($teal-green, 0.3);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, rgba($teal-green, 0.15), rgba($mint-green, 0.15));
      border-color: rgba($teal-green, 0.5);
    }

    .cover-text {
      color: $teal-green;
      font-size: 1.2rem;
      font-weight: 500;
      opacity: 0.7;
    }
  }
}

/* 主要功能網格 */
.schedule-main-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.schedule-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 4px 15px rgba($deep-blue, 0.08);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  min-height: 120px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba($deep-blue, 0.15);
  }

  .schedule-icon {
    font-size: 2.5rem;
    margin-bottom: 0.8rem;
  }

  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
  }
}

.overview-card {
  border-color: rgba($coral-red, 0.2);
  &:hover { border-color: rgba($coral-red, 0.4); }
  h3 { color: $coral-red; }
}

.flight-card {
  border-color: rgba($golden-yellow, 0.2);
  &:hover { border-color: rgba($golden-yellow, 0.4); }
  h3 { color: #E67E22; }
}

.map-card {
  border-color: rgba($teal-green, 0.2);
  &:hover { border-color: rgba($teal-green, 0.4); }
  h3 { color: $teal-green; }
}

.packing-card {
  border-color: rgba($mint-green, 0.2);
  &:hover { border-color: rgba($mint-green, 0.4); }
  h3 { color: $mint-green; }
}

/* 每日行程區域 */
.daily-schedule-section {
  background: rgba($teal-green, 0.05);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba($teal-green, 0.1);

  .daily-title {
    text-align: center;
    font-size: 1.5rem;
    font-weight: 600;
    color: $teal-green;
    margin-bottom: 1.5rem;
  }

  .daily-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;

    @media (max-width: 600px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .daily-card {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    padding: 1rem;
    text-decoration: none;
    color: $teal-green;
    font-weight: 600;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba($teal-green, 0.1);

    &:hover {
      background: rgba($teal-green, 0.1);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba($teal-green, 0.2);
    }
  }
}

/* 小遊戲區域 */
.games-section {
  .games-title {
    font-size: 1.8rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, $coral-red, $golden-yellow);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.nav-links {
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: stretch;
}

.nav-link {
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

.link-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba($deep-blue, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 2px solid transparent;

  &.mini-card {
    padding: 1.5rem 1.2rem;
    width: 200px;
    min-height: 140px;
  }

  &:hover {
    box-shadow: 0 10px 30px rgba($deep-blue, 0.15);
    transform: translateY(-2px) scale(1.02);
  }

  .card-decoration {
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    opacity: 0.1;
    transition: all 0.3s ease;
  }

  &:hover .card-decoration {
    transform: scale(1.2) rotate(45deg);
    opacity: 0.15;
  }
}

.dropblock-card {
  border-color: rgba($coral-red, 0.3);

  .card-decoration {
    background: linear-gradient(135deg, $coral-red, $golden-yellow);
  }

  &:hover {
    border-color: rgba($coral-red, 0.5);
  }

  h3 {
    color: $coral-red;
  }
}

.foodwheel-card {
  border-color: rgba($teal-green, 0.3);

  .card-decoration {
    background: linear-gradient(135deg, $teal-green, $mint-green);
  }

  &:hover {
    border-color: rgba($teal-green, 0.5);
  }

  h3 {
    color: $teal-green;
  }
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 0.8rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 2;
}

p {
  color: $deep-blue;
  font-size: 0.9rem;
  line-height: 1.4;
  opacity: 0.8;
  position: relative;
  z-index: 2;
  font-weight: 400;
  margin: 0;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .home-container {
    padding: 2rem 1.5rem;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;

    &::after {
      right: -30px;
      font-size: 1.5rem;
    }
  }

  .schedule-section {
    padding: 2rem 1.5rem;
    margin-bottom: 2rem;
  }

  .schedule-header h2 {
    font-size: 1.6rem;
  }

  .cover-image-area .cover-placeholder {
    height: 150px;
  }

  .schedule-main-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .daily-schedule-section {
    padding: 1.5rem;
  }

  .nav-links {
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }

  .link-card.mini-card {
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .home-container {
    padding: 1.5rem 1rem;
    border-radius: 16px;
  }

  h1 {
    font-size: 1.8rem;
    letter-spacing: 1px;

    &::after {
      right: -25px;
      font-size: 1.3rem;
    }
  }

  .schedule-header h2 {
    font-size: 1.4rem;
  }

  .cover-image-area .cover-placeholder {
    height: 120px;
  }

  .daily-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>