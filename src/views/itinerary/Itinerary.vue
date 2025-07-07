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
            <div style="
                position: relative;
                width: 100%;
                height: 0;
                padding-top: 141.4286%;
                padding-bottom: 0;
                box-shadow: 0 2px 8px 0 rgba(63, 69, 81, 0.16);
                margin-top: 1em;
                margin-bottom: 0.9em;
                overflow: hidden;
                border-radius: 8px;
                will-change: transform;
              ">
              <iframe loading="lazy" style="
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  top: 0;
                  left: 0;
                  border: none;
                  padding: 0;
                  margin: 0;
                " src="https://www.canva.com/design/DAGo__QAg-I/ZUWMoq-agdfYIO8WE9nLhA/view?embed" allowfullscreen
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
  width: 700px
  min-height: 100vh
  background: $bg-primary
  margin: 0 auto

// ===================================
// 主要內容區域
// ===================================
.schedule-content
  max-width: 750px
  margin: 0 auto
  padding: 0 $spacing-md

  @include tablet
    padding: 0 $spacing-lg

  @include desktop
    padding: 0 $spacing-xl

.schedule-section
  margin-bottom: $spacing-2xl

.section-container
  width: 100%


// ===================================
// iframe 容器
// ===================================
.iframe-container
  width: 100%
  border-radius: $border-radius-lg
  box-shadow: 0 8px 32px $shadow-medium
  background: $bg-card

  @include tablet
    border-radius: $border-radius-xl

// ===================================
// 響應式調整
// ===================================
// 平板版本 (≥ 768px)

// .itinerary-container
// 手機版特殊處理
@include mobile-only
  .itinerary-container
    padding: $spacing-lg

  .schedule-content
    padding: $spacing-xs $spacing-lg

  // .home-float-btn,
  // .nav-toggle
  //   width: 44px
  //   height: 44px

  // .home-icon,
  // .nav-icon
  //   font-size: 18px

  // .back-to-top
  //   bottom: $spacing-md
  //   right: $spacing-sm
  //   width: 44px
  //   height: 44px
  //   font-size: 16px

</style>
