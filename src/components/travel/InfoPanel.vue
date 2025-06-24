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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <div class="visit-list" :class="{ 'scrollable': getVisitHistory(selectedPin).length > 3 }">
            <div v-for="(visit, index) in getVisitHistory(selectedPin)" :key="visit" class="visit-item"
              :class="{ 'latest': index === 0 }">
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
import type { ProcessedPin } from '../types/Itravel'
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
  const allCities = pin.trips.flatMap(trip => trip.city_tw || [])

  // 去重並返回
  return [...new Set(allCities)]
}

// 獲取州省列表
const getStateList = (pin: ProcessedPin): string => {
  if (!pin.trips) return '資料不詳'

  const states = [...new Set(pin.trips.flatMap(trip => trip.state_tw || []))].join('、')
  return states || '資料不詳'
}

// 獲取訪問歷史（按時間由近到遠）
const getVisitHistory = (pin: ProcessedPin): string[] => {
  if (!pin.trips) return []

  const sortedTrips = [...pin.trips]
    .sort((a, b) => {
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
.info-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 320px;
  max-width: calc(100% - 40px);
  max-height: calc(100% - 40px);
  overflow-y: auto;
  pointer-events: auto;
  border: 1px solid #f3f4f6;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 16px;
  position: relative;
  z-index: 2;
}

.country-header {
  display: flex;
  align-items: center;
}

.country-flag-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.country-flag {
  font-size: 24px;
}

.country-info {
  margin-left: 14px;
}

.country-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.025em;
}

.country-subtitle {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  opacity: 0.8;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #f9fafb;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;

  &:hover {
    background: #f3f4f6;
    color: #374151;
    transform: scale(1.05);
  }
}

.visit-count-section {
  padding: 0 16px 20px;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 16px;
  position: relative;
  z-index: 2;
}

.visit-count {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  display: block;
}

.details-section {
  padding: 0 16px 20px;
  position: relative;
  z-index: 2;
}

.detail-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.detail-icon {
  font-size: 16px;
  opacity: 0.7;
}

.detail-title {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.detail-content {
  margin-left: 24px;
}

.info-pill {
  display: inline-block;
  padding: 6px 10px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #475569;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.city-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.city-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  background: linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%);
  color: #4338ca;
  border: 1px solid rgba(67, 56, 202, 0.1);
  border-radius: 14px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;

  /* 添加微妙的內發光效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
}

.visit-list {
  max-height: none;
  overflow-y: visible;

  /* 當有超過3個項目時才啟用滾動 */
  &.scrollable {
    max-height: 120px;
    /* 約3個項目的高度 */
    overflow-y: auto;
  }

}

.visit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(241, 245, 249, 0.8);
  transition: all 0.2s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &.latest {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
    border-color: rgba(59, 130, 246, 0.3);
  }
}

.visit-date {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.latest-badge {
  font-size: 10px;
  font-weight: 600;
  color: #059669;
  background: rgba(16, 185, 129, 0.2);
  padding: 2px 6px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

// 響應式設計 - 平板
@media (max-width: 1024px) {
  .info-panel {
    width: 300px;
    max-width: calc(100% - 30px);
    max-height: calc(100% - 30px);
  }
}

// 響應式設計 - 手機橫屏
@media (max-width: 768px) and (orientation: landscape) {
  .info-panel {
    width: 280px;
    max-width: calc(100% - 20px);
    max-height: calc(100% - 20px);
  }
}

// 響應式設計 - 手機版
@media (max-width: 768px) {
  .info-panel {
    width: 260px;
    max-width: calc(100% - 20px);
    max-height: calc(100% - 20px);
    border-radius: 12px;
  }

  .panel-header {
    padding: 16px 12px 12px;
  }

  .country-flag-container {
    width: 32px;
    height: 32px;
  }

  .country-flag {
    font-size: 18px;
  }

  .country-name {
    font-size: 16px;
  }

  .country-subtitle {
    font-size: 12px;
  }

  .visit-count-section {
    padding: 0 12px 16px;
  }

  .visit-count {
    font-size: 18px;
  }

  .details-section {
    padding: 0 12px 16px;
  }

  .detail-header {
    gap: 6px;
    margin-bottom: 6px;
  }

  .detail-icon {
    font-size: 14px;
  }

  .detail-title {
    font-size: 13px;
  }

  .detail-content {
    margin-left: 20px;
  }

  .city-tag {
    padding: 4px 8px;
    font-size: 11px;
  }

  .info-pill {
    padding: 5px 8px;
    font-size: 12px;
  }

  .visit-item {
    padding: 6px 10px;
  }

  .visit-date {
    font-size: 11px;
  }

  .latest-badge {
    font-size: 9px;
    padding: 2px 4px;
  }
}

// 小螢幕手機特殊處理
@media (max-width: 480px) {
  .info-panel {
    width: 240px;
    max-width: calc(100% - 20px);
    max-height: calc(100% - 20px);
  }

  .panel-header {
    padding: 12px 10px 10px;
  }

  .country-header {
    gap: 8px;
  }

  .country-flag-container {
    width: 28px;
    height: 28px;
  }

  .country-flag {
    font-size: 16px;
  }

  .country-name {
    font-size: 14px;
  }

  .close-btn {
    width: 24px;
    height: 24px;

    svg {
      width: 12px;
      height: 12px;
    }
  }

  .visit-count-section {
    padding: 0 10px 12px;
  }

  .visit-count {
    font-size: 16px;
  }

  .details-section {
    padding: 0 10px 12px;
  }

  .detail-item {
    margin-bottom: 12px;
  }

  .detail-content {
    margin-left: 18px;
  }

  .city-tags {
    gap: 6px;
  }
}
</style>