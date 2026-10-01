<template>
  <div class="home">
    <SiteHeader />

    <main class="main-container">
      <router-view />
    </main>

    <SiteFooter />
    <BottomTab />
  </div>
</template>

<script setup lang="ts">
import SiteHeader from '@/components/layout/SiteHeader.vue'
import BottomTab from '@/components/layout/BottomTab.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
</script>

<style lang="sass" scoped>
.home
  min-height: 100vh
  background: $nb-paper
  display: flex
  flex-direction: column
  padding-bottom: calc(#{$bottom-tab-height} + env(safe-area-inset-bottom))

  @include tablet
    padding-bottom: 0

// 主內容區域：寬度與左右留白跟 Header 一致
.main-container
  flex: 1
  width: 100%
  max-width: 1376px
  margin: 0 auto
  padding: $spacing-md
  padding-bottom: $spacing-xl

  @include tablet
    padding: $spacing-lg
    padding-bottom: $spacing-2xl

  @include desktop
    padding: 20px 32px 48px 32px
</style>
