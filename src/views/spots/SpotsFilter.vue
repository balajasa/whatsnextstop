<template>
  <section class="spots-filter" aria-label="篩選景點">
    <div v-if="countries.length > 1 && countries.length <= MAX_COUNTRY_CHIPS" class="chip-row" role="group"
      aria-label="國家">
      <button type="button" class="chip" :class="{ 'is-active': selectedCountry === '' }"
        :aria-pressed="selectedCountry === ''" @click="handleCountryChange('')">全部國家</button>
      <button v-for="country in countries" :key="country" type="button" class="chip"
        :class="{ 'is-active': selectedCountry === country }" :aria-pressed="selectedCountry === country"
        :title="country" :aria-label="country" @click="handleCountryChange(country)">
        {{ shortName(country) }}
      </button>
    </div>
    <label v-else-if="countries.length > MAX_COUNTRY_CHIPS" class="country-select">
      <span class="country-select__label">國家</span>
      <select :value="selectedCountry" @change="handleCountryChange(($event.target as HTMLSelectElement).value)">
        <option value="">全部國家</option>
        <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
      </select>
    </label>

    <div class="chip-row" role="group" aria-label="類別">
      <button type="button" class="chip" :class="{ 'is-active': selectedCategory === '' }"
        :aria-pressed="selectedCategory === ''" @click="handleCategoryChange('')">全部類別</button>
      <button v-for="option in chipCategoryOptions" :key="option.value" type="button" class="chip"
        :class="[`cat-${categoryKey(option.value)}`, { 'is-active': selectedCategory === option.value }]"
        :aria-pressed="selectedCategory === option.value" @click="handleCategoryChange(option.value)">
        <span class="chip__dot" aria-hidden="true"></span>{{ option.label }}
      </button>
    </div>

    <div class="search-row">
      <SearchInput :model-value="searchKeyword" @update:model-value="handleSearch" @search="handleSearch"
        placeholder="搜尋景點名稱、描述..." />
      <button type="button" class="reset-btn" @click="handleClearFilters">重設</button>
    </div>

    <p class="results-info" aria-live="polite">
      共有 {{ totalResults }} 個景點<span v-if="hasActiveFilters">（已套用篩選）</span>
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { event } from 'vue-gtag'
import type { SpotCategory } from '../../types/spots/spots'
import SearchInput from '../../components/common/SearchInput.vue'

interface Props {
  searchKeyword: string
  selectedCountry: string
  selectedCategory: SpotCategory | ''
  countries: string[]
  categoryOptions: Array<{ value: SpotCategory | '', label: string }>
  totalResults: number
  hasActiveFilters: boolean
  tripId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:searchKeyword': [value: string]
  'update:selectedCountry': [value: string]
  'update:selectedCategory': [value: SpotCategory | '']
  'clear-filters': []
}>()

// 國家標籤最多幾個，超過改成下拉選單
const MAX_COUNTRY_CHIPS = 6
// 國家名稱最多顯示幾個字
const MAX_COUNTRY_NAME = 5

const shortName = (name: string): string => {
  const chars = [...name]
  return chars.length > MAX_COUNTRY_NAME ? `${chars.slice(0, MAX_COUNTRY_NAME).join('')}…` : name
}

// 類別標籤
const chipCategoryOptions = computed(() => props.categoryOptions.filter(option => option.value !== ''))

// 類別對應的顏色 key
const CATEGORY_KEYS: Record<string, string> = {
  '景點': 'attraction',
  '美食': 'food',
  '住宿': 'hotel',
  '購物': 'shopping',
  '交通': 'transport'
}
const categoryKey = (value: string): string => CATEGORY_KEYS[value] ?? 'attraction'

// 處理類別選擇
const handleCategoryChange = (value: string) => {
  // GA4 追蹤
  event('filter_interaction', {
    filter_type: 'category',
    filter_value: value || '全部類別',
    trip_id: props.tripId || 'all',
    device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
  })

  emit('update:selectedCategory', value as SpotCategory | '')
}

// 處理國家頁籤點擊
const handleCountryChange = (country: string) => {
  // GA4 追蹤
  event('filter_interaction', {
    filter_type: 'country',
    filter_value: country || '全部國家',
    trip_id: props.tripId || 'all',
    device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
  })

  emit('update:selectedCountry', country)
}

// 處理搜尋
const handleSearch = (keyword: string) => {
  // GA4 追蹤
  event('search_interaction', {
    search_keyword: keyword,
    search_results: props.totalResults,
    trip_id: props.tripId || 'all',
    device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
  })

  emit('update:searchKeyword', keyword)
}

// 處理重設
const handleClearFilters = () => {
  // GA4 追蹤
  event('filter_interaction', {
    filter_type: 'clear',
    filter_value: 'reset',
    trip_id: props.tripId || 'all',
    device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
  })

  emit('clear-filters')
}
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.spots-filter
  display: flex
  flex-direction: column
  gap: 14px
  margin-bottom: $spacing-lg
  padding: 16px
  border: 1px solid $nb-line
  border-radius: 18px
  background: $nb-card
  box-shadow: $nb-card-shadow
  @include tablet
    padding: 22px 24px

// 標籤列：手機橫向滑動（右側淡出），平板以上自動換行
.chip-row
  display: flex
  gap: 8px
  overflow-x: auto
  margin: 0 -16px
  padding: 0 16px
  scrollbar-width: none
  mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent)

  &::-webkit-scrollbar
    display: none

  @include tablet
    flex-wrap: wrap
    overflow: visible
    margin: 0
    padding: 0
    mask-image: none

.chip
  display: inline-flex
  flex-shrink: 0
  align-items: center
  gap: 6px
  min-height: 38px
  padding: 0 14px
  border: 1px solid $nb-line
  border-radius: 999px
  background: $nb-card
  color: $nb-ink
  font-size: 14px
  white-space: nowrap
  cursor: pointer
  transition: background-color 0.2s ease

  &:hover:not(.is-active)
    background: $nb-paper

  &.is-active
    border-color: $nb-ink
    background: $nb-ink
    color: $nb-card
    font-weight: 700

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

  @include tablet
    padding: 0 16px

.chip__dot
  width: 8px
  height: 8px
  border-radius: 50%

.cat-attraction .chip__dot
  background: $nb-accent
.cat-food .chip__dot
  background: #3F6224
.cat-hotel .chip__dot
  background: $nb-go-strong
.cat-shopping .chip__dot
  background: #5B3F7A
.cat-transport .chip__dot
  background: $nb-fun-strong

.chip.is-active .chip__dot
  background: $nb-card

// 國家下拉（超過 6 國時）
.country-select
  display: flex
  align-items: center
  gap: 10px
  font-size: 14px
  color: $nb-muted

  select
    min-height: 40px
    padding: 0 36px 0 14px
    border: 1.5px solid $nb-line
    border-radius: 999px
    background: $nb-card
    color: $nb-ink
    font: inherit
    font-size: 15px
    cursor: pointer

    &:focus-visible
      outline: 2px solid $nb-accent
      outline-offset: 2px

.search-row
  display: flex
  gap: 10px

  // 搜尋框吃掉剩餘寬度，重設按鈕不被擠出去
  :deep(.search-input)
    flex: 1
    min-width: 0

.reset-btn
  flex-shrink: 0
  min-height: 46px
  padding: 0 18px
  border: 1.5px dashed #C9B89F
  border-radius: 999px
  background: transparent
  color: $nb-ink
  font-size: 14px
  cursor: pointer

  &:hover
    background: $nb-paper

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 2px

.results-info
  margin: 0
  font-size: 13px
  color: $nb-muted
</style>
