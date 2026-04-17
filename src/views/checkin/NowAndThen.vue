<template>
  <div class="nowandthen">
    <h2 class="page-title">NOW AND THEN</h2>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *

.nowandthen
  display: flex
  flex-direction: column
  margin: 0 auto
  padding: $spacing-lg
  max-width: 480px
  gap: $spacing-lg

.page-title
  margin: 0
  font-size: 20px
  font-weight: 700
  letter-spacing: 0.15em
  color: $camera-text-primary
</style>
