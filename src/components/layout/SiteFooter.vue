<template>
  <div class="site-footer">
    <div class="copy-section">
      <div class="copy-text">咖豆旅行社 | 沒有營業，沒有立案</div>
      <div class="copy-text">© 2026 OolongLatte</div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.site-footer
  display: none
  width: 100%
  background: $nb-footer
  color: $nb-muted

  @include tablet
    display: block

.copy-section
  display: flex
  align-items: center
  flex-direction: column
  justify-content: center
  padding: 16px 0
  font-size: 12px
  gap: 2px
</style>
