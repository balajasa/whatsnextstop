<template>
  <div class="spots-filter">
    <!-- 國家頁籤 -->
    <div class="country-tabs">
      <button @click="$emit('update:selectedCountry', '')" :class="['country-tab', { active: selectedCountry === '' }]">
        全部國家
      </button>
      <button v-for="country in countries" :key="country" @click="$emit('update:selectedCountry', country)"
        :class="['country-tab', { active: selectedCountry === country }]">
        {{ country }}
      </button>
    </div>

    <!-- 搜尋和篩選區 -->
    <div class="search-filter-row">
      <SimpleSelect :model-value="selectedCategory" @update:model-value="handleCategoryChange"
        :options="selectCategoryOptions" placeholder="請選擇類別" class="category-select-wrapper" />

      <SearchInput :model-value="searchKeyword" @update:model-value="$emit('update:searchKeyword', $event)"
        @search="$emit('update:searchKeyword', $event)" placeholder="搜尋景點名稱、描述..." class="search-input-wrapper" />

      <button @click="$emit('clear-filters')" class="clear-btn">重設</button>
    </div>

    <!-- 結果統計 -->
    <div class="results-info">
      <span class="results-count">
        共有 {{ totalResults }} 個景點
        <span v-if="hasActiveFilters" class="filter-indicator">（已套用篩選）</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SpotCategory } from '../../types/spots'
import SearchInput from '../../components/common/SearchInput.vue'
import SimpleSelect from '../../components/common/SimpleSelect.vue'

interface Props {
  searchKeyword: string
  selectedCountry: string
  selectedCategory: SpotCategory | ''
  countries: string[]
  categoryOptions: Array<{ value: SpotCategory | '', label: string }>
  totalResults: number
  hasActiveFilters: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:searchKeyword': [value: string]
  'update:selectedCountry': [value: string]
  'update:selectedCategory': [value: SpotCategory | '']
  'clear-filters': []
}>()

// 轉換 categoryOptions 為 SimpleSelect 格式
const selectCategoryOptions = computed(() => [
  { value: '', label: '全部類別' },
  ...props.categoryOptions.map(option => ({
    value: option.value,
    label: option.label
  }))
])

// 處理類別選擇
const handleCategoryChange = (value: string) => {
  emit('update:selectedCategory', value as SpotCategory | '')
}
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.spots-filter
  max-width: 100%
  margin: 0 auto $spacing-xl auto
  background: $filter-bg
  border-radius: $border-radius-lg
  padding: $spacing-lg
  border: 1px solid $search-input-border
  box-shadow: 0 4px 20px rgba(23, 24, 75, 0.08)

// 國家頁籤
.country-tabs
  display: flex
  gap: 4px
  flex-wrap: wrap
  justify-content: center
  margin-bottom: $spacing-lg

  @include tablet
    gap: 12px

.country-tab
  flex: 1
  min-width: 0
  padding: $spacing-sm $spacing-xs
  font-size: 12px
  border: 1px solid $country-tab-border
  background: white
  color: $country-tab-text
  border-radius: $border-radius-md
  cursor: pointer
  transition: all 0.3s ease
  white-space: nowrap
  font-weight: 500

  @include tablet
    flex: none
    padding: $spacing-sm $spacing-md
    font-size: 14px

  &:hover
    background: $country-tab-hover
    border-color: $country-tab-border
    transform: translateY(-1px)

  &.active
    background: $country-tab-active-bg
    color: $country-tab-active-text
    border-color: $country-tab-active-bg
    box-shadow: 0 3px 12px rgba(0, 92, 175, 0.3)

// 搜尋和篩選區
.search-filter-row
  display: flex
  flex-direction: column  // 手機版預設垂直排列
  align-items: stretch
  gap: $spacing-sm
  margin-bottom: 12px

  // 平板以上：水平排列
  @include tablet
    flex-direction: row
    align-items: center
    gap: $spacing-md
    height: 50px

.search-input-wrapper
  @include tablet
    flex: 2

  // 覆蓋 SearchInput 組件的高度和樣式
  :deep(.search-input),
  :deep(input)
    height: 46px
    border-color: $search-input-border

    &:focus
      border-color: $search-input-focus
      box-shadow: 0 0 0 3px rgba(0, 92, 175, 0.1)

.category-select-wrapper
  @include tablet
    flex: 1
    min-width: 180px

  // 覆蓋 SimpleSelect 組件的高度和樣式
  :deep(.select-display),
  :deep(.option)
    height: 46px
    border-color: $search-input-border

  :deep(.select-display)
    &:hover
      border-color: $search-input-focus

    &.is-open
      border-color: $search-input-focus
      box-shadow: 0 0 0 3px rgba(0, 92, 175, 0.1)

.clear-btn
  padding: $spacing-sm $spacing-lg
  background: $clear-btn-bg
  border: 1px solid $country-tab-border
  border-radius: $border-radius-md
  color: $clear-btn-text
  cursor: pointer
  transition: all 0.3s ease
  height: 46px
  min-width: 100px
  font-weight: 500

  &:hover
    background: rgba(0, 92, 175, 0.15)
    border-color: $country-tab-border
    transform: translateY(-1px)
    box-shadow: 0 2px 8px rgba(0, 92, 175, 0.2)

// 結果統計
.results-info
  text-align: center

.results-count
  font-size: 12px
  color: $spot-text-primary
  font-weight: 500

.filter-indicator
  color: $spot-text-secondary
  font-style: italic
</style>