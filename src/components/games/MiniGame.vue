<template>
  <div class="main-game">
    <div class="main-game-container">
      <!-- 當沒有子路由時顯示選擇功能 -->
      <template v-if="!$route.path.includes('/minigame/')">
        <!-- 小遊戲區域 -->
        <div class="games-section">
          <div class="games-title">🎮 休閒小遊戲</div>
          <div class="game-link">
            <div class="nav-links">
              <router-link to="/minigame/dropblock" class="nav-link">
                <div class="link-card dropblock-card mini-card">
                  <div class="card-icon">🧊</div>
                  <div class="card-title">從天而降</div>
                  <p>這次會出現什麼任務呢？</p>
                  <div class="card-decoration"></div>
                </div>
              </router-link>
            </div>
            <div class="nav-links">
              <router-link to="/minigame/foodwheel" class="nav-link">
                <div class="link-card foodwheel-card mini-card">
                  <div class="card-icon">🎪</div>
                  <div class="card-title">美食轉輪</div>
                  <p>讓轉輪決定今天吃什麼</p>
                  <div class="card-decoration"></div>
                </div>
              </router-link>
            </div>
            <div class="nav-links">
              <router-link to="/minigame/takemetravel" class="nav-link">
                <div class="link-card takemetravel-card mini-card">
                  <div class="card-icon">📸</div>
                  <div class="card-title">放空自己</div>
                  <p>記錄旅行的每一刻</p>
                  <div class="card-decoration"></div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </template>

      <!-- 子路由內容顯示區域 -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.main-game {
  position: relative;
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 100vh;
  background: #f8f9fa;

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(circle at 20% 30%, rgba($coral-red, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba($golden-yellow, 0.06) 0%, transparent 45%),
      radial-gradient(circle at 60% 80%, rgba($teal-green, 0.07) 0%, transparent 50%),
      radial-gradient(circle at 30% 70%, rgba($mint-green, 0.05) 0%, transparent 40%);
    content: '';
    pointer-events: none;
  }
}

.main-game-container {
  position: relative;
  z-index: 1;
  padding: 3rem 2.5rem;
  max-width: 1200px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 25px 50px rgba($deep-blue, 0.15),
    0 10px 25px rgba($teal-green, 0.1);

  backdrop-filter: blur(20px);
}

/* 過渡動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

h1 {
  position: relative;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, $coral-red, $deep-blue);
  -webkit-background-clip: text;
  background-clip: text;
  text-align: center;
  letter-spacing: 2px;
  font-weight: 700;
  font-size: clamp(1.8rem, 4vw, 2.5rem);

  -webkit-text-fill-color: transparent;

  &::after {
    position: absolute;
    top: 50%;
    right: -40px;
    content: '✨';
    font-size: clamp(1.3rem, 3vw, 2rem);
    transform: translateY(-50%);
    animation: sparkle 3s ease-in-out infinite;
  }
}

@keyframes sparkle {

  0%,
  100% {
    opacity: 1;
    transform: translateY(-50%) rotate(0deg) scale(1);
  }

  50% {
    opacity: 0.7;
    transform: translateY(-60%) rotate(10deg) scale(1.1);
  }
}

/* 小遊戲區域 */
.games-section {
  .games-title {
    margin-bottom: 2rem;
    background: linear-gradient(135deg, $coral-red, $golden-yellow);
    -webkit-background-clip: text;
    background-clip: text;
    text-align: center;
    font-weight: 600;
    font-size: clamp(1.4rem, 3vw, 1.8rem);

    -webkit-text-fill-color: transparent;
  }
}

.game-link {
  display: grid;
  align-items: stretch;
  margin: 0 auto;
  max-width: 1000px;

  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  justify-items: center;
}

.nav-links {
  max-width: 320px;
  width: 100%;
}

.nav-link {
  display: block;
  color: inherit;
  text-decoration: none;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

.link-card {
  position: relative;
  display: flex;
  overflow: hidden;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: 2rem 1.5rem;
  width: 100%;
  height: 200px;
  border: 2px solid transparent;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 25px rgba($deep-blue, 0.12);
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  backdrop-filter: blur(15px);

  &:hover {
    box-shadow: 0 15px 40px rgba($deep-blue, 0.2);
    transform: translateY(-4px) scale(1.02);
  }

  .card-decoration {
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    opacity: 0.08;
    transition: all 0.4s ease;
  }

  &:hover .card-decoration {
    opacity: 0.15;
    transform: scale(1.3) rotate(45deg);
  }
}

.dropblock-card {
  border-color: rgba($coral-red, 0.3);

  .card-decoration {
    background: linear-gradient(135deg, $coral-red, $golden-yellow);
  }

  &:hover {
    border-color: rgba($coral-red, 0.6);
  }

  .card-title {
    color: $coral-red;
  }
}

.foodwheel-card {
  border-color: rgba($teal-green, 0.3);

  .card-decoration {
    background: linear-gradient(135deg, $teal-green, $mint-green);
  }

  &:hover {
    border-color: rgba($teal-green, 0.6);
  }

  .card-title {
    color: $teal-green;
  }
}

.takemetravel-card {
  border-color: rgba($golden-yellow, 0.3);

  .card-decoration {
    background: linear-gradient(135deg, $golden-yellow, $mint-green);
  }

  &:hover {
    border-color: rgba($golden-yellow, 0.6);
  }

  .card-title {
    color: $golden-yellow;
  }
}

.card-icon {
  margin-bottom: 1rem;
  font-size: clamp(2rem, 4vw, 2.5rem);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-8px);
  }
}

.card-title {
  position: relative;
  z-index: 2;
  margin-bottom: 0.8rem;
  letter-spacing: 0.8px;
  font-weight: 700;
  font-size: clamp(1.2rem, 2.5vw, 1.4rem);
}

p {
  position: relative;
  z-index: 2;
  margin: 0;
  color: $deep-blue;
  font-weight: 400;
  font-size: clamp(0.85rem, 2vw, 0.95rem);
  line-height: 1.5;
  opacity: 0.8;
}

/* 平板響應式 (1024px 以下) */
@media (max-width: 1024px) {
  .main-game-container {
    padding: 2.5rem 2rem;
    max-width: 900px;
  }

  .game-link {
    gap: 1.8rem;
  }

  .link-card {
    padding: 1.8rem 1.3rem;
    height: 180px;
  }
}

/* 手機橫屏和小平板 (768px 以下) */
@media (max-width: 768px) {
  .main-game {
    padding: 1.5rem 1rem;
  }

  .main-game-container {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }

  .games-section .games-title {
    margin-bottom: 1.8rem;
  }

  .game-link {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .nav-links {
    max-width: 100%;
  }

  .link-card {
    padding: 1.5rem 1.2rem;
    height: 160px;
    border-radius: 16px;
  }

  h1::after {
    right: -30px;
  }
}

/* 手機直屏 (480px 以下) */
@media (max-width: 480px) {
  .main-game {
    padding: 1rem 0.8rem;
  }

  .main-game-container {
    padding: 1.8rem 1.2rem;
    border-radius: 16px;
  }

  .games-section .games-title {
    margin-bottom: 1.5rem;
  }

  .game-link {
    max-width: 100%;

    grid-template-columns: 1fr;
    gap: 1.2rem;
  }

  .nav-links {
    max-width: 100%;
  }

  .link-card {
    padding: 1.2rem 1rem;
    height: 140px;
    border-radius: 14px;
  }

  .card-icon {
    margin-bottom: 0.8rem;
  }

  .card-title {
    margin-bottom: 0.6rem;
  }

  h1::after {
    right: -25px;
  }
}

/* 極小螢幕 (360px 以下) */
@media (max-width: 360px) {
  .main-game {
    padding: 0.8rem 0.5rem;
  }

  .main-game-container {
    padding: 1.5rem 1rem;
  }

  .game-link {
    gap: 1rem;
  }

  .link-card {
    padding: 1rem 0.8rem;
    height: 130px;
  }

  .card-title {
    margin-bottom: 0.5rem;
  }

  h1::after {
    right: -20px;
  }
}

/* 高解析度螢幕優化 */
@media (min-width: 1400px) {
  .main-game-container {
    padding: 3.5rem 3rem;
    max-width: 1300px;
  }

  .game-link {
    max-width: 1100px;

    gap: 2.5rem;
  }

  .link-card {
    padding: 2.2rem 1.8rem;
    height: 220px;
  }
}

/* 觸控設備優化 */
@media (hover: none) and (pointer: coarse) {
  .nav-link:hover {
    transform: none;
  }

  .link-card:hover {
    box-shadow: 0 8px 25px rgba($deep-blue, 0.12);
    transform: none;
  }

  .link-card:active {
    transform: scale(0.98);
  }
}

/* 減少動畫偏好設定 */
@media (prefers-reduced-motion: reduce) {

  .card-icon,
  h1::after {
    animation: none;
  }

  .fade-enter-active,
  .fade-leave-active,
  .nav-link,
  .link-card {
    transition: none;
  }
}
</style>