<template>
  <div v-if="selectedPin" class="info-panel" @click.stop>
    <!-- 頭部區域：國旗 + 國名 + 關閉按鈕 -->
    <div class="panel-header">
      <div class="country-header">
        <div class="country-flag-container">
          <div class="country-flag">{{ getCountryFlag(selectedPin.country) }}</div>
        </div>
        <div class="country-info">
          <div class="country-name">{{ selectedPin.displayName }}</div>
        </div>
      </div>
      <button class="close-btn" @click="handleClose">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- 訪問次數區域 -->
    <div class="visit-count-section">
      <span class="visit-count">{{ selectedPin.visitCount }}次訪問</span>
    </div>

    <!-- 詳細資訊區域 -->
    <div class="details-section">
      <!-- 造訪省/州/市/邦/地區 -->
      <div class="detail-item">
        <div class="detail-header">
          <div class="detail-icon">🏛️</div>
          <div class="detail-title">造訪省/州/市/邦/地區</div>
        </div>
        <div class="detail-content">
          <div class="info-pill">{{ getStateList(selectedPin) }}</div>
        </div>
      </div>

      <!-- 造訪城市 -->
      <div class="detail-item">
        <div class="detail-header">
          <div class="detail-icon">🏙️</div>
          <div class="detail-title">造訪城市</div>
        </div>
        <div class="detail-content">
          <div class="city-tags">
            <span v-for="city in getCityList(selectedPin)" :key="city" class="city-tag">
              {{ city }}
            </span>
          </div>
        </div>
      </div>

      <!-- 最近訪問歷史 -->
      <div class="detail-item">
        <div class="detail-header">
          <div class="detail-icon">⏰</div>
          <div class="detail-title">訪問歷史</div>
        </div>
        <div class="detail-content">
          <div class="visit-list" :class="{ scrollable: getVisitHistory(selectedPin).length > 3 }">
            <div
              v-for="(visit, index) in getVisitHistory(selectedPin)"
              :key="visit"
              class="visit-item"
              :class="{ latest: index === 0 }"
            >
              <div class="visit-date">{{ visit }}</div>
              <div v-if="index === 0" class="latest-badge">最新</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProcessedPin } from '../types/ITravelMap'
import { countryTranslation } from '../../composables/countryTranslation'

const { getCountryFlag } = countryTranslation()

// Props 定義
interface InfoPanelProps {
  selectedPin: ProcessedPin | null
}

const { selectedPin } = defineProps<InfoPanelProps>()

// Emits 定義
const emit = defineEmits<{
  close: []
}>()

// 獲取城市列表
const getCityList = (pin: ProcessedPin): string[] => {
  if (!pin.trips) return []

  // 從所有旅程中收集城市名稱
  const allCities = pin.trips.flatMap(trip => trip.cityTW || [])

  // 去重並返回
  return [...new Set(allCities)]
}

// 獲取州省列表
const getStateList = (pin: ProcessedPin): string => {
  if (!pin.trips) return '資料不詳'

  const states = [...new Set(pin.trips.flatMap(trip => trip.stateTW || []))].join('、')
  return states || '資料不詳'
}

// 獲取訪問歷史（按時間由近到遠）
const getVisitHistory = (pin: ProcessedPin): string[] => {
  if (!pin.trips) return []

  const sortedTrips = [...pin.trips].sort((a, b) => {
    // 按年份和日期排序（由近到遠）
    const dateA = new Date(`${a.year}-${a.startDate}`)
    const dateB = new Date(`${b.year}-${b.startDate}`)
    return dateB.getTime() - dateA.getTime()
  })

  return sortedTrips.map(trip => `${trip.year}/${trip.startDate} - ${trip.endDate}`)
}

// 關閉面板
const handleClose = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

// ===================================
// 信息面板主體 (Mobile First)
// ===================================
.info-panel {
  @include absolute-center;
  z-index: $z-modal;
  background: $bg-card;
  border-radius: $border-radius-lg;
  // box-shadow: $shadow-strong;
  width: 260px;
  max-width: calc(100% - #{$spacing-lg});
  max-height: calc(100% - #{$spacing-lg});
  overflow-y: auto;
  pointer-events: auto;
  border: 1px solid $border-light;

  @include tablet {
    width: 320px;
    max-width: calc(100% - #{$spacing-xl});
    max-height: calc(100% - #{$spacing-xl});
    border-radius: $border-radius-xl;
  }

  @include desktop {
    width: 360px;
    border: 2px solid $border-primary;
  }

  @include large-desktop {
    width: 380px;
  }
}

// ===================================
// 面板頭部
// ===================================
.panel-header {
  @include flex-between;
  padding: $spacing-md $spacing-sm $spacing-sm;
  border-bottom: 1px solid $border-muted;

  @include tablet {
    padding: $spacing-lg $spacing-md $spacing-md;
  }

  @include desktop {
    padding: $spacing-xl $spacing-lg $spacing-lg;
  }
}

.country-header {
  @include flex-center;
  gap: $spacing-sm;

  @include tablet {
    gap: $spacing-md;
  }
}

.country-flag-container {
  @include flex-center;
  width: 28px;
  height: 28px;
  background: $bg-stats;
  border-radius: $border-radius-md;
  box-shadow: $shadow-light;
  border: 1px solid $border-light;

  @include tablet {
    width: 36px;
    height: 36px;
  }

  @include desktop {
    width: 42px;
    height: 42px;
    border-radius: $border-radius-lg;
  }
}

.country-flag {
  font-size: 16px;

  @include tablet {
    font-size: 20px;
  }

  @include desktop {
    font-size: 24px;
  }
}

.country-info {
  flex: 1;
  min-width: 0;
}

.country-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.3;

  @include tablet {
    font-size: 17px;
  }

  @include desktop {
    font-size: 18px;
    font-weight: 700;
  }
}

.close-btn {
  @include flex-center;
  width: 24px;
  height: 24px;
  border: none;
  background: $bg-primary;
  border-radius: 50%;
  cursor: pointer;
  color: $text-muted;
  transition: all 0.2s ease-in-out;
  border: 1px solid $border-light;
  flex-shrink: 0;

  @include tablet {
    width: 28px;
    height: 28px;
  }

  @include desktop {
    width: 32px;
    height: 32px;
    background: $bg-stats;
  }

  &:hover {
    background: $accent-color-1;
    color: $text-white;
    border-color: $accent-color-1;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 12px;
    height: 12px;

    @include tablet {
      width: 14px;
      height: 14px;
    }

    @include desktop {
      width: 16px;
      height: 16px;
    }
  }
}

// ===================================
// 訪問次數區域
// ===================================
.visit-count-section {
  padding: $spacing-sm $spacing-md $spacing-md;
  text-align: center;
  border-bottom: 1px solid $border-muted;
  background: linear-gradient(135deg, rgba($accent-color-1, 0.6), rgba($accent-color-1, 0.8));

  @include tablet {
    padding: $spacing-md $spacing-lg $spacing-lg;
  }

  @include desktop {
    padding: $spacing-lg $spacing-xl $spacing-xl;
  }
}

.visit-count {
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
  display: block;

  @include tablet {
    font-size: 20px;
  }

  @include desktop {
    font-size: 22px;
    font-weight: 700;
  }
}

// ===================================
// 詳細資訊區域
// ===================================
.details-section {
  padding: $spacing-md $spacing-sm $spacing-md;

  @include tablet {
    padding: $spacing-lg $spacing-md $spacing-lg;
  }

  @include desktop {
    padding: $spacing-xl $spacing-lg $spacing-xl;
  }
}

.detail-item {
  margin-bottom: $spacing-md;

  @include tablet {
    margin-bottom: $spacing-lg;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-header {
  @include flex-center;
  gap: $spacing-xs;
  margin-bottom: $spacing-xs;
  justify-content: flex-start;

  @include tablet {
    gap: $spacing-sm;
    margin-bottom: $spacing-sm;
  }
}

.detail-icon {
  font-size: 14px;
  opacity: 0.8;

  @include tablet {
    font-size: 16px;
  }

  @include desktop {
    font-size: 18px;
  }
}

.detail-title {
  font-weight: 600;
  color: $text-primary;
  font-size: 13px;

  @include tablet {
    font-size: 14px;
  }

  @include desktop {
    font-size: 15px;
  }
}

.detail-content {
  margin-left: $spacing-lg;

  @include tablet {
    margin-left: $spacing-xl;
  }
}

// ===================================
// 資訊標籤樣式
// ===================================
.info-pill {
  display: inline-block;
  padding: $spacing-xs $spacing-sm;
  background: rgba($primary-color, 0.15);
  color: $primary-color;
  border-radius: $border-radius-lg;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba($primary-color, 0.25);
  transition: all 0.2s ease-in-out;

  @include tablet {
    padding: $spacing-sm $spacing-md;
    font-size: 13px;
  }

  @include desktop {
    border-radius: $border-radius-xl;
  }
}

// ===================================
// 城市標籤
// ===================================
.city-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;

  @include tablet {
    gap: $spacing-sm;
  }
}

.city-tag {
  @include flex-center;
  padding: $spacing-xs $spacing-sm;
  background: linear-gradient(135deg, rgba($accent-color-1, 0.4), rgba($accent-color-1, 0.6));
  color: rgba($accent-color-1, 0.8);
  border: 1px solid rgba($accent-color-1, 0.3);
  border-radius: $border-radius-lg;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;

  @include tablet {
    padding: $spacing-sm $spacing-md;
    font-size: 12px;
  }

  @include desktop {
    border-radius: $border-radius-xl;
    font-size: 13px;
  }

  &:hover {
    background: linear-gradient(135deg, $accent-color-1, rgba($accent-color-1, 0.9));
    color: $text-white;
    border-color: $accent-color-1;
    transform: translateY(-1px);
    box-shadow: $shadow-light;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover::before {
    opacity: 1;
  }
}

// ===================================
// 訪問歷史列表
// ===================================
.visit-list {
  max-height: none;
  overflow-y: visible;

  &.scrollable {
    max-height: 100px;
    overflow-y: auto;
    padding-right: $spacing-xs;

    @include tablet {
      max-height: 120px;
    }

    // 自訂滾動條
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: $bg-primary;
      border-radius: $border-radius-sm;
    }

    &::-webkit-scrollbar-thumb {
      background: $border-primary;
      border-radius: $border-radius-sm;

      &:hover {
        background: $accent-color-1;
      }
    }
  }
}

.visit-item {
  @include flex-between;
  padding: $spacing-xs $spacing-sm;
  margin-bottom: $spacing-xs;
  background: $bg-stats;
  border-radius: $border-radius-md;
  border: 1px solid $border-light;
  transition: all 0.2s ease-in-out;

  @include tablet {
    padding: $spacing-sm $spacing-md;
    margin-bottom: $spacing-sm;
  }

  @include desktop {
    border-radius: $border-radius-lg;
  }

  &:last-child {
    margin-bottom: 0;
  }

  &.latest {
    background: linear-gradient(135deg, rgba($accent-color-2, 0.15), rgba($accent-color-2, 0.18));
    border-color: rgba($accent-color-2, 0.3);
    box-shadow: $shadow-light;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: $shadow-light;
  }
}

.visit-date {
  font-size: 11px;
  font-weight: 500;
  color: $text-secondary;

  @include tablet {
    font-size: 12px;
  }

  @include desktop {
    font-size: 13px;
  }
}

.latest-badge {
  font-size: 9px;
  font-weight: 600;
  color: $accent-color-2;
  background: rgba($accent-color-2, 0.12);
  padding: 2px $spacing-xs;
  border-radius: $border-radius-sm;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba($accent-color-2, 0.25);

  @include tablet {
    font-size: 10px;
    padding: $spacing-xs $spacing-sm;
  }

  @include desktop {
    border-radius: $border-radius-md;
  }
}

// ===================================
// 手機版特殊優化
// ===================================
@include mobile-only {
  .info-panel {
    // width: 240px;
    border-radius: $border-radius-md;
  }

  .panel-header {
    padding: $spacing-sm $spacing-xs $spacing-xs;
  }

  .country-flag-container {
    width: 24px;
    height: 24px;
  }

  .country-flag {
    font-size: 14px;
  }

  .country-name {
    font-size: 14px;
  }

  .close-btn {
    width: 20px;
    height: 20px;

    svg {
      width: 10px;
      height: 10px;
    }
  }

  .visit-count-section {
    padding: $spacing-xs $spacing-sm $spacing-sm;
  }

  .visit-count {
    font-size: 16px;
  }

  .details-section {
    padding: $spacing-sm $spacing-xs $spacing-sm;
  }

  .detail-item {
    margin-bottom: $spacing-sm;
  }

  .detail-content {
    margin-left: $spacing-md;
  }

  .city-tag {
    padding: 2px $spacing-xs;
    font-size: 10px;
  }

  .info-pill {
    padding: 2px $spacing-xs;
    font-size: 11px;
  }

  .visit-list.scrollable {
    max-height: 80px;
  }

  .visit-item {
    padding: 2px $spacing-xs;
  }

  .visit-date {
    font-size: 10px;
  }

  .latest-badge {
    font-size: 8px;
    padding: 1px 2px;
  }
}
</style>
