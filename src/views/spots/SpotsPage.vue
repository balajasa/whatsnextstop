<template>
  <div class="spots-page">
    <!-- 麵包屑導航 -->
    <BreadcrumbNav :manual-items="breadcrumbItems" :manual-show="true" />

    <!-- 搜尋和篩選區 -->
    <SpotsFilter v-model:search-keyword="searchKeyword" v-model:selected-country="selectedCountry"
      v-model:selected-category="selectedCategory" :countries="countries" :category-options="categoryOptions"
      :total-results="totalResults" :has-active-filters="hasActiveFilters" :trip-id="route.params.shortId as string"
      @clear-filters="clearFilters" />

    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 錯誤狀態 -->
    <div v-if="error" class="error-section">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button @click="loadSpots" class="retry-btn">重試</button>
    </div>

    <!-- 景點列表 -->
    <div v-if="!loading && !error" class="spots-list">
      <div v-if="filteredSpots.length === 0" class="empty-state">
        <div class="empty-icon">🗺️</div>
        <h3>沒有找到符合條件的景點</h3>
        <p>試試調整搜尋條件或清除篩選</p>
      </div>

      <div v-else class="spots-grid">
        <SpotCard v-for="spot in paginatedSpots" :key="spot.id" :spot="spot" class="spot-item" />
      </div>

      <!-- 分頁控制 -->
      <BasePagination :current-page="currentPage" :total-items="totalResults" :items-per-page="itemsPerPage"
        @update:current-page="currentPage = $event" @update:items-per-page="itemsPerPage = $event"
        @change="handlePaginationChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { event } from 'vue-gtag'
import { getAllSpots, getSpotsByTrip, CATEGORY_OPTIONS } from '../../services/spots/spotsService'
import { findTripByShortId } from '../../services/spots/tripsService'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import SpotCard from './SpotCard.vue'
import SpotsFilter from './SpotsFilter.vue'
import BasePagination from '../../components/common/BasePagination.vue'
import type { Spot, SpotCategory } from '../../types/spots/spots'
import type { Trip } from '../../services/spots/tripsService'
import type { BreadcrumbItem } from '../../types/common/ui-layout'

const route = useRoute()

// 響應式資料
const spots = ref<Spot[]>([])
const loading = ref(true)
const error = ref('')
const currentTrip = ref<Trip | null>(null)

// 搜尋和篩選
const searchKeyword = ref('')
const selectedCountry = ref('')
const selectedCategory = ref<SpotCategory | ''>('')

// 分頁
const currentPage = ref(1)
const itemsPerPage = ref(10)

// 計算屬性
const countries = computed(() => {
  const countrySet = new Set(spots.value.map(spot => spot.country))
  return Array.from(countrySet).sort()
})

const categoryOptions = computed(() => {
  return CATEGORY_OPTIONS.filter(option => option.value !== '')
})

const filteredSpots = computed(() => {
  let result = spots.value

  // 關鍵字搜尋
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(spot =>
      spot.name.toLowerCase().includes(keyword) ||
      spot.description.toLowerCase().includes(keyword) ||
      spot.region.toLowerCase().includes(keyword) ||
      spot.notes.toLowerCase().includes(keyword)
    )
  }

  // 國家篩選
  if (selectedCountry.value) {
    result = result.filter(spot => spot.country === selectedCountry.value)
  }

  // 類別篩選
  if (selectedCategory.value) {
    result = result.filter(spot => spot.category === selectedCategory.value)
  }

  return result
})

const totalResults = computed(() => filteredSpots.value.length)


const paginatedSpots = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredSpots.value.slice(start, end)
})


const hasActiveFilters = computed(() => {
  return searchKeyword.value.trim() !== '' ||
    selectedCountry.value !== '' ||
    selectedCategory.value !== ''
})

// 動態麵包屑
const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [
    { text: '旅程列表', path: '/trips' }
  ]

  if (currentTrip.value) {
    // 有具體旅程時，顯示旅程名稱
    items.push({ text: currentTrip.value.name })
  } else {
    // 沒有具體旅程時，顯示通用標題
    items.push({ text: '景點探索' })
  }

  return items
})

// 方法
const loadSpots = async () => {
  try {
    loading.value = true
    error.value = ''

    // 檢查是否有路由參數（短 ID）
    const shortId = route.params.shortId as string

    if (shortId) {
      // 通過短 ID 找到完整旅程資料
      const trip = await findTripByShortId(shortId)
      if (!trip) {
        throw new Error('找不到指定的旅程')
      }

      currentTrip.value = trip
      // 載入特定旅程的景點
      spots.value = await getSpotsByTrip(trip.id)
    } else {
      // 沒有路由參數，載入所有景點（向下相容）
      currentTrip.value = null
      spots.value = await getAllSpots()
    }
  } catch (err: any) {
    error.value = err.message || '載入景點資料失敗'
  } finally {
    loading.value = false
  }
}


const clearFilters = () => {
  searchKeyword.value = ''
  selectedCountry.value = ''
  selectedCategory.value = ''
  currentPage.value = 1
}

const handlePaginationChange = (page: number, pageSize: number) => {
  // GA4 追蹤
  event('pagination_click', {
    current_page: page,
    items_per_page: pageSize,
    total_items: totalResults.value,
    trip_id: route.params.shortId as string || 'all',
    device: window.innerWidth <= 768 ? 'mobile' : 'desktop'
  })

  currentPage.value = page
  itemsPerPage.value = pageSize
  // 滾動到頂部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 監聽篩選條件變化，重設頁面
watch([searchKeyword, selectedCountry, selectedCategory], () => {
  currentPage.value = 1
})

// 監聽路由變化，重新載入景點
watch(() => route.params.shortId, () => {
  loadSpots()
})

// 生命週期
onMounted(() => {
  loadSpots()
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.spots-page
  min-height: 100vh
  background: $spot-bg
  padding: 0 $spacing-lg $spacing-lg

  @include tablet
    padding: 0 $spacing-lg $spacing-xl

  @include desktop
    padding: 0 $spacing-xl $spacing-xl

// SpotsFilter 間距
:deep(.spots-filter)
  margin-top: $spacing-lg

// 載入和錯誤狀態
.loading-section, .error-section
  text-align: center
  margin-top: $spacing-md
  padding: $spacing-xl

  @include tablet
    margin-top: $spacing-lg
    padding: $spacing-2xl

.loading-spinner
  width: 40px
  height: 40px
  border: 3px solid rgba($spot-text-primary, 0.1)
  border-top: 3px solid $spot-text-primary
  border-radius: 50%
  animation: spin 1s linear infinite
  margin: 0 auto $spacing-lg auto

@keyframes spin
  to
    transform: rotate(360deg)

.error-icon
  font-size: 48px
  margin-bottom: $spacing-lg

.error-message
  color: $spot-text-primary
  margin-bottom: $spacing-lg

.retry-btn
  padding: $spacing-md $spacing-xl
  background: $spot-text-primary
  color: white
  border: none
  border-radius: $border-radius-md
  cursor: pointer

  &:hover
    background: rgba($spot-text-primary, 0.9)

// 景點列表
.spots-list
  max-width: 1400px
  margin: $spacing-md auto 0

.empty-state
  text-align: center
  padding: $spacing-xl

  @include tablet
    padding: $spacing-2xl

  .empty-icon
    font-size: 64px
    margin-bottom: $spacing-lg

  h3
    color: $spot-text-primary
    margin-bottom: $spacing-md

  p
    color: rgba($spot-text-primary, 0.6)

.spots-grid
  display: grid
  grid-template-columns: 1fr
  gap: $spacing-xl
  // margin-bottom: $spacing-2xl

  @include mobile-only
    gap: $spacing-lg

</style>
