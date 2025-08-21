<template>
  <div class="pagination">
    <!-- 桌面版分頁 -->
    <div class="pagination-desktop">
      <div class="pagination-nav">
        <button class="pagination-btn" :disabled="currentPage === 1" @click="goToPage(1)">
          <div class="pagination-icon first-page-icon"></div>
        </button>

        <button class="pagination-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
          <div class="pagination-icon prev-page-icon"></div>
        </button>

        <div class="pagination-pages">
          <button v-for="page in visiblePages" :key="page" class="pagination-page"
            :class="{ 'active': page === currentPage, 'ellipsis': page === '...' }" :disabled="page === '...'"
            @click="page !== '...' && goToPage(page as number)">
            {{ page }}
          </button>
        </div>

        <button class="pagination-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
          <div class="pagination-icon next-page-icon"></div>
        </button>

        <button class="pagination-btn" :disabled="currentPage === totalPages" @click="goToPage(totalPages)">
          <div class="pagination-icon last-page-icon"></div>
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
        <button class="pagination-btn" :disabled="currentPage === 1" @click="goToPage(1)">
          <div class="pagination-icon first-page-icon"></div>
        </button>

        <button class="pagination-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
          <div class="pagination-icon prev-page-icon"></div>
        </button>

        <div class="pagination-pages">
          <button v-for="page in visiblePages" :key="page" class="pagination-page"
            :class="{ 'active': page === currentPage, 'ellipsis': page === '...' }" :disabled="page === '...'"
            @click="page !== '...' && goToPage(page as number)">
            {{ page }}
          </button>
        </div>

        <button class="pagination-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
          <div class="pagination-icon next-page-icon"></div>
        </button>

        <button class="pagination-btn" :disabled="currentPage === totalPages" @click="goToPage(totalPages)">
          <div class="pagination-icon last-page-icon"></div>
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
  margin-top: 60px

.pagination-desktop
  display: flex
  align-items: center
  width: 100%
  max-width: 1200px
  position: relative

.pagination-mobile
  display: none

.pagination-nav
  display: flex
  align-items: center
  gap: $spacing-sm
  margin: 0 auto

.pagination-btn
  width: 32px
  height: 32px
  border: 1px solid $border-light
  background: $bg-primary
  border-radius: $border-radius-sm
  cursor: pointer
  display: flex
  align-items: center
  justify-content: center
  transition: all 0.2s ease

  &:hover:not(:disabled)
    border-color: $primary-color
    color: $primary-color

  &:disabled
    opacity: 0.5
    cursor: not-allowed

.pagination-pages
  display: flex
  gap: 4px
  margin: 0 $spacing-sm

.pagination-page
  width: 32px
  height: 32px
  border: 1px solid $border-light
  background: $bg-primary
  border-radius: $border-radius-sm
  cursor: pointer
  font-size: 14px
  color: $text-primary
  transition: all 0.2s ease
  display: flex
  align-items: center
  justify-content: center

  &:hover:not(:disabled):not(.active)
    border-color: $primary-color
    color: $primary-color

  &.active
    background: $primary-color
    border-color: $primary-color
    color: white

  &.ellipsis
    border: none
    cursor: default
    color: $text-tertiary

    &:hover
      border: none
      color: $text-tertiary

.pagination-info
  display: flex
  align-items: center
  gap: $spacing-lg
  position: absolute
  right: 0

.page-size-selector
  display: flex
  flex-direction: row
  align-items: center
  gap: $spacing-xs
  font-size: 14px
  color: $text-secondary

  .page-size-text
    white-space: nowrap
    margin: 0 6px

  // 調整下拉選單高度
  :deep(.simple-select)
    display: inline-block
    height: 32px
    min-width: 60px

    .select-display
      height: 32px
      min-height: 32px
      padding: 6px $spacing-sm
      font-size: 14px
      line-height: 1

      .selected-text
        font-size: 14px
        line-height: 1

      .dropdown-arrow
        font-size: 10px

// 手機版樣式
@include mobile-tablet
  .pagination-desktop
    display: none

  .pagination-mobile
    display: flex
    flex-direction: column
    gap: $spacing-md
    width: 100%
    align-items: center

  .pagination-nav
    gap: $spacing-xs
    flex-wrap: wrap
    justify-content: center

  .pagination-pages
    gap: 2px
    margin: 0 $spacing-xs

  .pagination-btn,
  .pagination-page
    width: 28px
    height: 28px
    font-size: 12px

  .pagination-info-mobile
    display: flex
    justify-content: center

    .page-size-selector
      display: flex
      align-items: center
      gap: $spacing-xs
      font-size: 14px
      color: $text-secondary

      .page-size-text
        white-space: nowrap

      :deep(.simple-select)
        height: 28px
        min-width: 50px

        .select-display
          height: 28px
          min-height: 28px
          padding: 4px $spacing-xs
          font-size: 12px

          .selected-text
            font-size: 12px

          .dropdown-arrow
            font-size: 8px

// 分頁圖標樣式
.pagination-icon
  width: 16px
  height: 16px
  background-size: contain
  background-repeat: no-repeat
  background-position: center

.first-page-icon
  background-image: url('@/assets/img/icon/common/arrow_left_double.png')

.prev-page-icon
  background-image: url('@/assets/img/icon/common/arrow_left_key.png')

.next-page-icon
  background-image: url('@/assets/img/icon/common/arrow_right_key.png')

.last-page-icon
  background-image: url('@/assets/img/icon/common/arrow_right_double.png')
</style>
