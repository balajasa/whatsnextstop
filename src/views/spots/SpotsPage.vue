<template>
  <div class="spots-page">
    <PageHeader :title="currentTrip?.name || '景點探索'" :subtitle="pageSubtitle" :breadcrumb-items="breadcrumbItems"
      :show-breadcrumb="true" />

    <!-- 搜尋和篩選區 -->
    <SpotsFilter v-model:search-keyword="searchKeyword" v-model:selected-country="selectedCountry"
      v-model:selected-category="selectedCategory" :countries="countries" :category-options="categoryOptions"
      :total-results="totalResults" :has-active-filters="hasActiveFilters" :trip-id="route.params.shortId as string"
      @clear-filters="clearFilters" />

    <!-- 載入狀態 -->
    <StateView v-if="loading" type="loading" message="載入景點中..." />

    <!-- 錯誤狀態 -->
    <StateView v-if="error" type="error" :message="error" @action="loadSpots" />

    <!-- 景點列表 -->
    <div v-if="!loading && !error" class="spots-list">
      <!-- 有篩選條件時才提供「清除篩選」 -->
      <StateView v-if="filteredSpots.length === 0" type="empty"
        :title="hasActiveFilters ? '找不到符合的景點' : '這趟旅程還沒有景點'"
        :message="hasActiveFilters ? '試試調整搜尋條件' : ''" :action-text="hasActiveFilters ? '清除篩選' : ''"
        @action="clearFilters" />

      <!-- 桌機：列表（含表頭）；手機、平板：卡片 -->
      <div v-else class="spots-grid">
        <div class="spots-list-head" aria-hidden="true">
          <span>類別</span><span>景點</span><span>營業時間</span><span>票價</span><span></span><span></span>
        </div>
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
import PageHeader from '@/components/common/PageHeader.vue'
import StateView from '@/components/common/StateView.vue'
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

// 頁首副標：景點總數（不受篩選影響）
const pageSubtitle = computed(() => (spots.value.length > 0 ? `景點探索・共 ${spots.value.length} 個景點` : '景點探索'))

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

.spots-list
  display: flex
  flex-direction: column
  gap: $spacing-lg

// 手機、平板：卡片
.spots-grid
  display: grid
  grid-template-columns: minmax(0, 1fr)
  gap: $spacing-md
  @include tablet
    grid-template-columns: repeat(2, minmax(0, 1fr))
    gap: $spacing-lg

  // 桌機：整個列表包成一張紙
  @include desktop
    display: block
    overflow: hidden
    border: 1px solid $nb-line
    border-radius: 18px
    background: $nb-card
    box-shadow: $nb-card-shadow

  // 最後一列不要底線
  :deep(.spot-item:last-child .spot-row)
    border-bottom: none

// 表頭：欄位寬度要跟 SpotCardDesktop 一致
.spots-list-head
  display: none

  @include desktop
    display: grid
    grid-template-columns: 88px minmax(0, 1fr) 180px 150px 96px 44px
    gap: 16px
    padding: 12px 20px
    border-bottom: 2px solid $nb-line
    font-size: 13px
    letter-spacing: 1px
    color: $nb-muted
</style>
