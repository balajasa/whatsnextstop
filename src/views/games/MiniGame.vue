<template>
  <div class="main-game">
    <div class="main-game-container">
      <!-- 小遊戲區域 -->
      <div class="games-section">
        <div class="game-linklist">
          <div class="nav-links">
            <router-link to="/dropblock" class="nav-link">
              <div class="link-card dropblock-card mini-card">
                <div class="card-icon">🧊</div>
                <div class="card-title">從天而降</div>
                <p>天上會掉下來什麼呢？</p>
                <div class="card-decoration"></div>
              </div>
            </router-link>
          </div>
          <div class="nav-links">
            <router-link to="/foodwheel" class="nav-link">
              <div class="link-card foodwheel-card mini-card">
                <div class="card-icon">🍽️</div>
                <div class="card-title">命運輪盤</div>
                <p>3 2 1...什麼時候停止呢？</p>
                <div class="card-decoration"></div>
              </div>
            </router-link>
          </div>
          <div class="nav-links">
            <router-link to="/takemetravel" class="nav-link">
              <div class="link-card takemetravel-card mini-card">
                <div class="card-icon">📸</div>
                <div class="card-title">帶我去旅行</div>
                <p>記錄旅行的每一刻</p>
                <div class="card-decoration"></div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// 主容器
// ===================================
.main-game
  // min-height: 100vh
  background: $bg-primary

.main-game-container
  width: 100%
  // max-width: 900px
  // margin: 0 auto


// ===================================
// 遊戲區域
// ===================================
.games-section
  text-align: center

.games-title
  font-size: 28px
  font-weight: 700
  color: $text-primary
  margin-bottom: $spacing-2xl
  display: inline-block
  position: relative

  @include tablet
    font-size: 32px

  @include desktop
    font-size: 36px

  // 裝飾效果
  &::after
    content: ''
    position: absolute
    bottom: -8px
    left: 50%
    transform: translateX(-50%)
    width: 60px
    height: 4px
    background: linear-gradient(90deg, $accent-color-1, $accent-color-2)
    border-radius: 2px

.game-linklist
  display: grid
  grid-template-columns: 1fr
  gap: $spacing-lg
  // max-width: 800px
  margin: 0 auto

  @include tablet
    grid-template-columns: repeat(3, 1fr)
    gap: $spacing-xl

  // @include desktop
  //   grid-template-columns: repeat(3, 1fr)

// ===================================
// 導航鏈接
// ===================================
.nav-links
  width: 100%

.nav-link
  display: block
  text-decoration: none
  width: 100%

// ===================================
// 遊戲卡片
// ===================================
.link-card
  @include card-hover
  position: relative
  background: $bg-card
  border-radius: $border-radius-lg
  padding: $spacing-xl
  text-align: center
  box-shadow: 0 8px 32px $shadow-medium
  border: 1px solid $border-light
  overflow: hidden
  min-height: 240px
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center

  // Hover 時的特殊效果
  &:hover
    .card-decoration
      transform: scale(1.2) rotate(180deg)
      opacity: 0.8

    .card-icon
      transform: scale(1.1) rotate(-5deg)

// 卡片圖標
.card-icon
  font-size: 48px
  margin-bottom: $spacing-md
  transition: all 0.3s ease
  display: block

  @include tablet
    font-size: 56px
    margin-bottom: $spacing-lg

// 卡片標題
.card-title
  font-size: 20px
  font-weight: 600
  color: $text-primary
  margin-bottom: $spacing-sm

  @include tablet
    font-size: 22px

  @include desktop
    font-size: 24px

// 卡片描述
.link-card p
  color: $text-muted
  font-size: 14px
  line-height: 1.5
  margin: 0

  @include tablet
    font-size: 15px

  @include desktop
    font-size: 16px

// 卡片裝飾
.card-decoration
  position: absolute
  top: -20px
  right: -20px
  width: 80px
  height: 80px
  border-radius: 50%
  opacity: 0.1
  transition: all 0.4s ease
  pointer-events: none

// ===================================
// 各遊戲主題色彩
// ===================================

// 從天而降卡片
.dropblock-card
  border-left: 4px solid $accent-color-1

  .card-icon
    color: $accent-color-1

  .card-decoration
    background: $accent-color-1

  &:hover
    box-shadow: 0 12px 40px rgba(56, 178, 172, 0.2)

// 輪盤卡片
.foodwheel-card
  border-left: 4px solid $accent-color-2

  .card-icon
    color: $accent-color-2

  .card-decoration
    background: $accent-color-2

  &:hover
    box-shadow: 0 12px 40px rgba(230, 168, 107, 0.2)

// 放空自己卡片
.takemetravel-card
  border-left: 4px solid $primary-color

  .card-icon
    color: $primary-color

  .card-decoration
    background: $primary-color

  &:hover
    box-shadow: 0 12px 40px rgba(74, 85, 104, 0.2)

// ===================================
// 路由過渡動畫
// ===================================
.fade-enter-active,
.fade-leave-active
  transition: all 0.3s ease

.fade-enter-from
  opacity: 0
  transform: translateY(20px)

.fade-leave-to
  opacity: 0
  transform: translateY(-20px)

// ===================================
// 響應式調整
// ===================================

// 手機版特殊處理
@include mobile-only
  .games-title
    font-size: 24px
    margin-bottom: $spacing-xl

  .game-linklist
    gap: $spacing-md

  .link-card
    padding: $spacing-lg
    min-height: 220px

    .card-icon
      font-size: 40px

    .card-title
      font-size: 18px

    p
      font-size: 13px

// 大桌面版優化
@include large-desktop
  .link-card
    min-height: 320px

    .card-icon
      font-size: 64px
</style>
