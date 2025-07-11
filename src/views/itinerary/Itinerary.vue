<template>
  <div class="itinerary-container">
    <!-- 麵包屑 -->
    <BreadcrumbNav />

    <!-- 主要內容區域 -->
    <div class="schedule-content">
      <!-- 行程內容 -->
      <section id="itinerary" class="schedule-section itinerary-section">
        <div class="section-container">
          <div class="iframe-container">
            <div class="iframe-wrapper">
              <iframe loading="lazy" class="canva-iframe"
                src="https://www.canva.com/design/DAGo__QAg-I/ZUWMoq-agdfYIO8WE9nLhA/view?embed" allowfullscreen
                allow="fullscreen">
              </iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// 主容器
// ===================================
.itinerary-container
  // 手機版
  width: 100%
  height: 100vh // 固定為視窗高度
  background: $bg-primary
  margin: 0 auto
  padding: $spacing-xs
  display: flex
  flex-direction: column

  // 平板版本 (≥ 768px)
  @include tablet
    max-width: 750px
    padding: $spacing-sm
    margin: 0 auto
    height: auto
    min-height: 100vh

  // 桌面版本 (≥ 1024px)
  @include desktop
    max-width: 900px
    padding: $spacing-md

  // 大桌面版本 (≥ 1280px)
  @include large-desktop
    max-width: 1000px
    padding: $spacing-lg

// ===================================
// 主要內容區域
// ===================================
.schedule-content
  // 手機版
  width: 100%
  flex: 1
  display: flex
  flex-direction: column
  margin: 0
  padding: 0

  // 平板版本
  @include tablet
    padding: 0 $spacing-md
    flex: none

  // 桌面版本
  @include desktop
    padding: 0 $spacing-lg

.schedule-section
  // 手機版
  flex: 1
  display: flex
  flex-direction: column
  margin-bottom: 0

  // 平板版本
  @include tablet
    flex: none
    margin-bottom: $spacing-sm

  // 桌面版本
  @include desktop
    margin-bottom: $spacing-md

.section-container
  // 手機版 - 填滿空間
  width: 100%
  height: 100%
  display: flex
  flex-direction: column

  // 平板版本以上
  @include tablet
    height: auto

// ===================================
// iframe 容器
// ===================================
.iframe-container
  // 手機版
  width: 100%
  flex: 1 // 填滿剩餘空間
  border-radius: $border-radius-md
  box-shadow: 0 4px 16px $shadow-light
  background: $bg-card
  overflow: hidden
  display: flex
  flex-direction: column

  // 平板版本
  @include tablet
    flex: none
    border-radius: $border-radius-lg
    box-shadow: 0 6px 24px $shadow-medium

  // 桌面版本
  @include desktop
    border-radius: $border-radius-xl
    box-shadow: 0 8px 32px $shadow-strong

// iframe 包裝器 - 響應式比例
.iframe-wrapper
  // 手機版（預設）- 填滿可用空間，無需滑動
  width: 100%
  height: 100% // 直接填滿父容器
  position: relative

  // 平板版本 - 使用比例控制
  @include tablet
    height: 0
    padding-top: 120% // 平板使用比例

  // 桌面版本 - 調整比例適合桌面
  @include desktop
    padding-top: 130%

  // 大桌面版本 - 進一步優化
  @include large-desktop
    padding-top: 120%

// iframe 本體
.canva-iframe
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  border: none
  padding: 0
  margin: 0

// ===================================
// 特殊情況處理
// ===================================

// 極小螢幕優化 (< 360px)
@media (max-width: 359px)
  .itinerary-container
    padding: $spacing-xs

// 橫向手機優化
@media (max-width: 767px) and (orientation: landscape)
  .itinerary-container
    height: 100vh // 橫向也填滿視窗

// 超大螢幕優化 (≥ 1600px)
@media (min-width: 1600px)
  .itinerary-container
    max-width: 1200px

  .iframe-wrapper
    padding-top: 110%

// ===================================
// 手機版專用：確保不需滑動
// ===================================
@media (max-width: 767px)
  // 確保整個頁面不會超出視窗高度
  body, html
    overflow-x: hidden

  // 考慮 Header 高度的調整（如果有的話）
  .itinerary-container
    // 如果有 header，需要減去 header 高度
    // height: calc(100vh - #{$header-height})

    // 確保不產生垂直滾動條
    overflow-y: hidden

// ===================================
// 效能優化
// ===================================

// 使用 GPU 加速
.iframe-container
  will-change: transform
  transform: translateZ(0)

// 圖片和媒體優化
.canva-iframe
  loading: lazy

  // 提升渲染效能
  will-change: contents
</style>