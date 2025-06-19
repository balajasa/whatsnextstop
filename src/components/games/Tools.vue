<template>
  <div class="tools">
    <div class="tools-container">
      <!-- 當沒有子路由時顯示選擇功能 -->
      <template v-if="!$route.path.includes('/tools/')">
        <h1>選擇功能</h1>

        <!-- 小遊戲區域 -->
        <div class="games-section">
          <h2 class="games-title">🎮 休閒小遊戲</h2>
          <div class="nav-links">
            <router-link to="/tools/dropblock" class="nav-link">
              <div class="link-card dropblock-card mini-card">
                <div class="card-icon">🎯</div>
                <h3>跳格子</h3>
                <p>經典的跳格子遊戲</p>
                <div class="card-decoration"></div>
              </div>
            </router-link>
            <router-link to="/tools/foodwheel" class="nav-link">
              <div class="link-card foodwheel-card mini-card">
                <div class="card-icon">🎪</div>
                <h3>美食轉輪</h3>
                <p>讓轉輪決定今天吃什麼</p>
                <div class="card-decoration"></div>
              </div>
            </router-link>
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

<script setup lang="ts">
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.tools {
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

.tools-container {
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
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;
  width: 100%;

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
  width: 100%;
  max-width: 400px;
  margin: 0 auto;

  &.mini-card {
    padding: 1.5rem 1.2rem;
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

  0%,
  100% {
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
  .tools {
    padding: 1rem;
  }

  .tools-container {
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
  .tools-container {
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
}
</style>