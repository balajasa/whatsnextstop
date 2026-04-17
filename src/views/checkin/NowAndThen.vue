<template>
  <div class="nowandthen">
    <h2 class="page-title">Then And Memory</h2>

    <div v-if="checkinStore.isLoading" class="status-msg">載入中...</div>
    <div v-else-if="checkinStore.error" class="status-msg status-msg--error">{{ checkinStore.error }}</div>
    <div v-else-if="checkinStore.checkins.length === 0" class="status-msg">還沒有打卡記錄</div>

    <div v-else class="checkin-list">
      <div v-for="item in checkinStore.checkins" :key="item.id" class="checkin-card">

        <!-- 照片 -->
        <img :src="optimizeImageUrl(item.photoURL)" loading="lazy" class="card-photo" alt="打卡照片" />

        <div class="card-body">

          <!-- 心情 -->
          <p v-if="item.message" class="card-message">{{ item.message }}</p>

          <!-- 標籤 -->
          <div v-if="item.hashtags.length" class="card-hashtags">
            <span v-for="tag in item.hashtags" :key="tag" class="card-tag">#{{ tag }}</span>
          </div>

          <!-- 位置 -->
          <div v-if="item.locationName" class="card-row">
            <img src="@/assets/img/icon/location_pin.png" class="row-icon" alt="" />
            <span>{{ item.locationName }}</span>
          </div>

          <!-- 地址 -->
          <div v-if="item.locationAddress" class="card-row">
            <img src="@/assets/img/icon/near_me.png" class="row-icon" alt="" />
            <span>{{ item.locationAddress }}</span>
          </div>

          <!-- 時間 -->
          <div class="card-times">
            <div class="card-row">
              <span class="time-label">當地時間</span>
              <span>{{ formatTime(item.createdAt, item.timezone) }} <span class="time-offset">{{ getTimezoneOffset(item.createdAt, item.timezone) }}</span></span>
            </div>
            <div class="card-row">
              <span class="time-label">台灣時間</span>
              <span>{{ formatTime(item.createdAt, 'Asia/Taipei') }} <span class="time-offset">UTC+8</span></span>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCheckinStore } from '@/stores/useCheckinStore'
import { optimizeImageUrl } from '@/services/checkin/checkinService'

const checkinStore = useCheckinStore()

function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function getTimezoneOffset(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  }).formatToParts(date)
  return parts.find(p => p.type === 'timeZoneName')?.value.replace('GMT', 'UTC') || ''
}

onMounted(() => {
  checkinStore.loadCheckins()
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *

.nowandthen
  display: flex
  flex-direction: column
  margin: 0 auto
  padding: 8px 20px
  max-width: 480px

  gap: 24px

.page-title
  margin: 0
  color: $camera-text-primary
  text-align: left
  letter-spacing: 0.15em
  font-weight: 700
  font-size: 20px


.status-msg
  color: $camera-text-secondary
  font-size: 14px
  &--error
    color: $camera-error

.checkin-list
  display: flex
  flex-direction: column

  gap: $spacing-lg

.checkin-card
  display: flex
  flex-direction: column

  gap: $spacing-sm

.card-photo
  width: 100%
  border-radius: $border-radius-lg
  background: $camera-border-light

  aspect-ratio: 1
  object-fit: cover

.card-body
  display: flex
  flex-direction: column

  gap: $spacing-sm

.card-message
  margin: 0
  color: $camera-text-primary
  font-size: 14px
  line-height: 1.6

.card-hashtags
  display: flex
  flex-wrap: wrap

  gap: $spacing-xs

.card-tag
  padding: 2px 10px
  border: 1px solid rgba(0, 92, 175, 0.2)
  border-radius: 20px
  background: $country-tab-hover
  color: $country-tab-border
  font-size: 12px

.card-row
  display: flex
  align-items: center
  color: $camera-text-secondary
  font-size: 13px

  gap: $spacing-xs

.row-icon
  flex-shrink: 0
  width: 14px
  height: 14px
  opacity: 0.75
  filter: grayscale(1) brightness(0) invert(1) brightness(0.55)

  object-fit: contain

.card-times
  display: flex
  flex-direction: column

  gap: 4px

.time-label
  min-width: 60px
  color: $camera-text-muted


</style>
