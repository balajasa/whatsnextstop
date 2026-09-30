<template>
  <div class="home">
    <SiteHeader />

    <main class="main-container">
      <router-view />
    </main>

    <Footer />
    <BottomTab />
  </div>
</template>

<script setup lang="ts">
import SiteHeader from '@/components/layout/SiteHeader.vue'
import BottomTab from '@/components/layout/BottomTab.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.home
  min-height: 100vh
  background: $nb-paper
  display: flex
  flex-direction: column

// 主內容區域
.main-container
  flex: 1
  padding: $spacing-md
  padding-bottom: $spacing-xl

  @include tablet
    padding: $spacing-lg
    padding-bottom: $spacing-2xl

  @include desktop
    padding: 20px 32px 48px 32px
</style>
