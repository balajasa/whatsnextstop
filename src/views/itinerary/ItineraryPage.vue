<template>
  <div class="itinerary-page">
    <PageHeader />

    <!-- 有連結時顯示 Canva 行程表，外面包一層貼紙膠帶的紙框 -->
    <section v-if="canvaUrl" class="canva-frame" aria-label="行程表">
      <span class="tape tape--blue" aria-hidden="true"></span>
      <span class="tape tape--yellow" aria-hidden="true"></span>
      <div class="iframe-wrapper">
        <iframe loading="lazy" class="canva-iframe" :src="canvaUrl" title="行程表" allowfullscreen
          allow="fullscreen"></iframe>
      </div>
    </section>

    <!-- 沒有連結時 -->
    <StateView v-else type="empty" title="下一趟旅程" message="正在擲飛鏢決定中..." />
  </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/common/PageHeader.vue'
import StateView from '@/components/common/StateView.vue'
import { ITINERARY_CANVA_URL } from '@/constants/itinerary'

// Canva 網址
const canvaUrl = ITINERARY_CANVA_URL
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// 紙框
.canva-frame
  position: relative
  margin: 8px auto 0
  max-width: 900px
  padding: 8px
  border: 1px solid $nb-line
  border-radius: 16px
  background: $nb-card
  box-shadow: $nb-card-shadow
  @include tablet
    padding: 16px
    border-radius: 20px

.tape
  position: absolute
  top: -10px
  z-index: 1
  width: 64px
  height: 20px
  pointer-events: none
  @include tablet
    top: -12px
    width: 110px
    height: 28px

.tape--blue
  left: 24px
  background: $nb-tape-blue
  transform: rotate(-4deg)
  @include tablet
    left: 48px

.tape--yellow
  right: 24px
  background: $nb-tape-yellow
  transform: rotate(4deg)
  @include tablet
    right: 48px

// iframe 包裝器
.iframe-wrapper
  position: relative
  overflow: hidden
  // 手機：撐滿可視高度（扣掉 Header、頁首、底部 tab）
  height: max(480px, calc(100dvh - 260px))
  border-radius: 10px
  background: $nb-paper

  // 平板以上：用比例控制
  @include tablet
    height: 0
    padding-top: 120%

  @include desktop
    padding-top: 130%

  @include large-desktop
    padding-top: 120%

.canva-iframe
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  border: none
</style>
