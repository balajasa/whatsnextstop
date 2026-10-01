<template>
  <div class="pagination">
    <!-- 桌面版分頁 -->
    <div class="pagination-desktop">
      <div class="pagination-nav">
        <button type="button" class="pagination-btn" aria-label="第一頁" :disabled="currentPage === 1" @click="goToPage(1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
        </button>

        <button type="button" class="pagination-btn" aria-label="上一頁" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
        </button>

        <div class="pagination-pages">
          <button v-for="page in visiblePages" :key="page" type="button" class="pagination-page"
            :class="{ 'active': page === currentPage, 'ellipsis': page === '...' }" :disabled="page === '...'" :aria-current="page === currentPage ? 'page' : undefined"
            @click="page !== '...' && goToPage(page as number)">
            {{ page }}
          </button>
        </div>

        <button type="button" class="pagination-btn" aria-label="下一頁" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
        </button>

        <button type="button" class="pagination-btn" aria-label="最後一頁" :disabled="currentPage === totalPages" @click="goToPage(totalPages)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
        </button>
      </div>

      <div class="pagination-info">
        <div class="page-size-selector">
          <div class="page-size-text">每頁</div>
          <SimpleSelect v-model="selectedPageSize" :options="pageSizeOptions" @change="handlePageSizeChange" />
          <div class="page-size-text">筆</div>
        </div>
      </div>
    </div>

    <!-- 手機版分頁 -->
    <div class="pagination-mobile">
      <div class="pagination-nav">
        <button type="button" class="pagination-btn" aria-label="第一頁" :disabled="currentPage === 1" @click="goToPage(1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
        </button>

        <button type="button" class="pagination-btn" aria-label="上一頁" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
        </button>

        <div class="pagination-pages">
          <button v-for="page in visiblePages" :key="page" type="button" class="pagination-page"
            :class="{ 'active': page === currentPage, 'ellipsis': page === '...' }" :disabled="page === '...'" :aria-current="page === currentPage ? 'page' : undefined"
            @click="page !== '...' && goToPage(page as number)">
            {{ page }}
          </button>
        </div>

        <button type="button" class="pagination-btn" aria-label="下一頁" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
        </button>

        <button type="button" class="pagination-btn" aria-label="最後一頁" :disabled="currentPage === totalPages" @click="goToPage(totalPages)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
        </button>
      </div>

      <div class="pagination-info-mobile">
        <div class="page-size-selector">
          <div class="page-size-text">每頁</div>
          <SimpleSelect v-model="selectedPageSize" :options="pageSizeOptions" @change="handlePageSizeChange" />
          <div class="page-size-text">筆</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SimpleSelect from './SimpleSelect.vue'

interface Props {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  pageSizeOptions?: { value: string; label: string }[]
}

interface Emits {
  (e: 'update:currentPage', page: number): void
  (e: 'update:itemsPerPage', size: number): void
  (e: 'change', page: number, size: number): void
}

const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' },
    { value: '100', label: '100' }
  ]
})

const emit = defineEmits<Emits>()

// 響應式資料
const selectedPageSize = ref(props.itemsPerPage.toString())

// 計算屬性
const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage)
})

const visiblePages = computed(() => {
  const current = props.currentPage
  const total = totalPages.value
  const pages: (number | string)[] = []

  if (total <= 7) {
    // 總頁數 <= 7，顯示所有頁碼
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 總頁數 > 7，需要省略號
    if (current <= 4) {
      // 當前頁在前面
      pages.push(1, 2, 3, 4, 5, '...', total)
    } else if (current >= total - 3) {
      // 當前頁在後面
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } else {
      // 當前頁在中間
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }

  return pages
})

// 方法
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('change', page, props.itemsPerPage)
  }
}

const handlePageSizeChange = () => {
  const newSize = parseInt(selectedPageSize.value)
  emit('update:itemsPerPage', newSize)
  emit('change', 1, newSize) // 改變每頁筆數時跳回第一頁
}

// 監聽 itemsPerPage 變化，同步 selectedPageSize
watch(() => props.itemsPerPage, (newSize) => {
  selectedPageSize.value = newSize.toString()
}, { immediate: true })
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.pagination
  display: flex
  justify-content: center
  align-items: center
  margin-top: $spacing-md

.pagination-desktop
  position: relative
  display: flex
  align-items: center
  width: 100%

.pagination-mobile
  display: none

.pagination-nav
  display: flex
  align-items: center
  gap: 6px
  margin: 0 auto

.pagination-pages
  display: flex
  gap: 6px
  margin: 0 4px

.pagination-btn,
.pagination-page
  display: flex
  align-items: center
  justify-content: center
  width: 40px
  height: 40px
  border: 1px solid $nb-line
  border-radius: 50%
  background: $nb-card
  color: $nb-ink
  font-size: 14px
  cursor: pointer
  transition: background-color 0.2s ease, border-color 0.2s ease

  &:hover:not(:disabled):not(.active)
    border-color: $nb-dash-strong
    background: $nb-paper

  &:disabled
    opacity: 0.4
    cursor: not-allowed

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

.pagination-page
  &.active
    border-color: $nb-ink
    background: $nb-ink
    color: $nb-card
    font-weight: 700

  &.ellipsis
    border: none
    background: transparent
    color: $nb-muted
    opacity: 1
    cursor: default

.pagination-info
  position: absolute
  right: 0
  display: flex
  align-items: center

.page-size-selector
  display: flex
  align-items: center
  gap: 6px
  font-size: 14px
  color: $nb-muted

  .page-size-text
    white-space: nowrap

  :deep(.simple-select)
    min-width: 64px

// 手機、平板
@include mobile-tablet
  .pagination-desktop
    display: none

  .pagination-mobile
    display: flex
    flex-direction: column
    align-items: center
    gap: $spacing-md
    width: 100%

  .pagination-nav
    flex-wrap: wrap
    justify-content: center
    gap: 4px

  .pagination-pages
    gap: 4px
    margin: 0 2px

  .pagination-btn,
  .pagination-page
    width: 36px
    height: 36px
    font-size: 13px

  .pagination-info-mobile
    display: flex
    justify-content: center
</style>
