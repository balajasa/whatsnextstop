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
      <SearchInput :model-value="searchKeyword" @update:model-value="$emit('update:searchKeyword', $event)"
        @search="$emit('update:searchKeyword', $event)" placeholder="搜尋景點名稱、描述..." class="search-input-wrapper" />

      <SimpleSelect :model-value="selectedCategory" @update:model-value="handleCategoryChange"
        :options="selectCategoryOptions" placeholder="請選擇類別" class="category-select-wrapper" />

      <button @click="$emit('clear-filters')" class="clear-btn">清除篩選</button>
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
  categoryOptions: Array<{ value: SpotCategory | '', label: string, icon: string }>
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
    label: `${option.icon} ${option.label}`
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
  max-width: 800px
  margin: 0 auto $spacing-xl auto

// 國家頁籤
.country-tabs
  display: flex
  gap: $spacing-xs
  flex-wrap: wrap
  justify-content: center
  margin-bottom: $spacing-lg

  @include mobile-only
    gap: $spacing-xs

.country-tab
  padding: $spacing-sm $spacing-md
  border: 1px solid rgba($spot-text-primary, 0.2)
  background: white
  color: $spot-text-primary
  border-radius: $border-radius-md
  cursor: pointer
  transition: all 0.2s ease
  font-size: 14px
  white-space: nowrap

  &:hover
    background: rgba($spot-text-primary, 0.05)
    border-color: rgba($spot-text-primary, 0.3)

  &.active
    background: $spot-text-primary
    color: white
    border-color: $spot-text-primary
    box-shadow: 0 2px 4px rgba($spot-text-primary, 0.2)

  @include mobile-only
    flex: 1
    min-width: 0
    padding: $spacing-sm $spacing-xs
    font-size: 12px

// 搜尋和篩選區
.search-filter-row
  display: flex
  gap: $spacing-md
  align-items: center
  margin-bottom: $spacing-lg

  @include mobile-only
    flex-direction: column
    align-items: stretch

.search-input-wrapper
  flex: 2

  @include mobile-only
    flex: none
    margin-bottom: $spacing-sm

.category-select-wrapper
  flex: 1
  min-width: 180px

  @include mobile-only
    flex: none
    min-width: 100%
    margin-bottom: $spacing-sm

.clear-btn
  padding: $spacing-sm $spacing-lg
  background: rgba($spot-text-primary, 0.1)
  border: 1px solid rgba($spot-text-primary, 0.2)
  border-radius: $border-radius-md
  color: $spot-text-primary
  cursor: pointer
  transition: all 0.2s ease

  &:hover
    background: rgba($spot-text-primary, 0.15)

// 結果統計
.results-info
  text-align: center

.results-count
  font-size: 16px
  color: $spot-text-primary

.filter-indicator
  color: rgba($spot-text-primary, 0.6)
  font-style: italic
</style>