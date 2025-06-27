<template>
  <div class="travel-trace">
    <div class="container">
      <div class="header">
        <!-- <h1>✈️ 我的旅行記錄</h1>
        <p>點擊展開查看更多照片和詳細資訊</p> -->
      </div>

      <div v-if="loading" class="loading-container">
        載入中...
      </div>

      <div v-else class="travel-list">
        <div class="list-header">
          <div>年份</div>
          <div>日期</div>
          <div>天數</div>
          <div>國家</div>
          <div>地點</div>
          <div></div>
        </div>

        <div v-for="(travel, index) in travels" :key="`${travel.year}-${travel.startDate}-${index}`"
          class="travel-item">
          <div class="item-header" @click="toggleDetails(index)">
            <div class="year">{{ travel.year }}</div>
            <div class="date">{{ formatDateRange(travel.startDate, travel.endDate) }}</div>
            <div class="days">{{ calculateDays(travel.startDate, travel.endDate) }}天</div>
            <div class="country">{{ formatCountries(travel.country) }}</div>
            <div class="location">{{ formatLocations(travel) }}</div>
            <div class="expand-btn" :class="{ rotated: expandedItems.has(index) }">
              ▼
            </div>
          </div>

          <div class="item-details" :class="{ expanded: expandedItems.has(index) }">
            <div class="details-content">
              <div v-if="travel.photo.length > 0" class="photo-gallery">
                <div v-for="(photoName, photoIndex) in travel.photo" :key="photoIndex" class="photo-container">
                  <div v-if="!loadedPhotos.has(getPhotoUrl(travel, photoName))" class="photo-placeholder"
                    :class="{ loading: loadingPhotos.has(getPhotoUrl(travel, photoName)) }"
                    @click="loadPhoto(travel, photoName)">
                    📸 載入中...
                  </div>
                  <div v-else class="photo-img" :style="{ backgroundImage: `url(${getPhotoUrl(travel, photoName)})` }"
                    @click="openPhoto(getPhotoUrl(travel, photoName))"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTravelsData } from '../../composables/usagi'
import { countryTranslation } from '../../composables/countryTranslation'
import type { TravelData } from '../types/IResponse'

// Composables
const { travels, loading, loadTravels, getImageUrl } = getTravelsData()
const { getCountryInfo } = countryTranslation()

// 響應式資料
const expandedItems = ref<Set<number>>(new Set())
const loadedPhotos = ref<Set<string>>(new Set())
const loadingPhotos = ref<Set<string>>(new Set())

// 格式化日期範圍
function formatDateRange(startDate: string, endDate: string): string {
  return `${startDate.replace('-', '/')}/${endDate.replace('-', '/')}`
}

// 計算天數
function calculateDays(startDate: string, endDate: string): number {
  const [startMonth, startDay] = startDate.split('-').map(Number)
  const [endMonth, endDay] = endDate.split('-').map(Number)

  const start = new Date(2024, startMonth - 1, startDay)
  const end = new Date(2024, endMonth - 1, endDay)

  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

// 格式化國家顯示
function formatCountries(countries: string[], withFlag: boolean = true): string {
  return countries
    .map(country => {
      const info = getCountryInfo(country)
      return withFlag ? `${info.flag} ${info.chinese}` : info.chinese
    })
    .join('、')
}

// 格式化地點顯示
function formatLocations(travel: TravelData): string {
  return travel.cityTW?.join('、') || travel.city.join('、')
}

// 獲取照片 URL
function getPhotoUrl(travel: TravelData, photoName: string): string {
  return getImageUrl(travel, photoName)
}

// 展開/收合詳細資訊
function toggleDetails(index: number) {
  if (expandedItems.value.has(index)) {
    expandedItems.value.delete(index)
  } else {
    expandedItems.value.add(index)
    // 展開時載入照片
    const travel = travels.value[index]
    travel.photo.forEach((photoName, photoIndex) => {
      setTimeout(() => {
        loadPhoto(travel, photoName)
      }, photoIndex * 200)
    })
  }
}

// 載入照片
function loadPhoto(travel: TravelData, photoName: string) {
  const url = getPhotoUrl(travel, photoName)

  if (loadedPhotos.value.has(url) || loadingPhotos.value.has(url)) {
    return
  }

  loadingPhotos.value.add(url)

  const img = new Image()
  img.onload = () => {
    setTimeout(() => {
      loadingPhotos.value.delete(url)
      loadedPhotos.value.add(url)
    }, 300)
  }
  img.onerror = () => {
    loadingPhotos.value.delete(url)
  }
  img.src = url
}

// 開啟照片
function openPhoto(url: string) {
  window.open(url, '_blank')
}

// 初始化
onMounted(async () => {
  await loadTravels()
})
</script>

<style lang="scss" scoped>
.travel-trace {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .container {
    margin: 0 auto;
    max-width: 1200px;
  }

  .header {
    margin-bottom: 40px;
    color: white;
    text-align: center;

    h1 {
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      font-size: 2.5rem;
    }

    p {
      font-size: 1.1rem;
      opacity: 0.9;
    }
  }

  .loading-container {
    padding: 40px;
    color: white;
    text-align: center;
    font-size: 1.2rem;
  }

  .travel-list {
    padding: 30px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

    backdrop-filter: blur(10px);
  }

  .list-header {
    display: grid;
    margin-bottom: 15px;
    padding: 15px 20px;
    border-radius: 15px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
    color: white;
    font-weight: 600;

    grid-template-columns: 80px 140px 80px 120px 1fr 50px;
    gap: 20px;
  }

  .travel-item {
    overflow: hidden;
    margin-bottom: 12px;
    border-radius: 15px;
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  }

  .item-header {
    display: grid;
    align-items: center;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;

    grid-template-columns: 80px 140px 80px 120px 1fr 50px;
    gap: 20px;

    &:hover {
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    }
  }

  .year {
    color: #2d3748;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .date {
    color: #4a5568;
    font-weight: 500;
  }

  .days {
    color: #e53e3e;
    text-align: center;
    font-weight: 600;
  }

  .country {
    color: #3182ce;
    font-weight: 600;
  }

  .location {
    color: #38a169;
    font-weight: 500;
  }

  .expand-btn {
    color: #718096;
    text-align: center;
    font-size: 1.2rem;
    transition: transform 0.3s ease;

    &.rotated {
      transform: rotate(180deg);
    }
  }

  .item-details {
    overflow: hidden;
    max-height: 0;
    background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
    transition: max-height 0.5s ease;

    &.expanded {
      max-height: 800px;
    }
  }

  .details-content {
    padding: 25px;
    border-top: 2px solid rgba(0, 0, 0, 0.05);

    h3 {
      margin-bottom: 15px;
      color: #2d3748;
    }

    p {
      margin-bottom: 15px;
      color: #4a5568;
      line-height: 1.6;
    }
  }

  .photo-gallery {
    display: grid;
    margin-top: 15px;

    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  }

  .photo-container {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .photo-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 240px;
    height: 180px;
    border-radius: 8px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(45deg, #764ba2, #667eea);
    }

    &.loading {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      color: #666;
      animation: loading 1.5s infinite;
    }
  }

  .photo-img {
    width: 240px;
    height: 180px;
    border-radius: 8px;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    cursor: pointer;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.9;
    }
  }

  @media (max-width: 768px) {
    .item-header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: space-between;

      grid-template-columns: none;
    }

    .expand-btn {
      margin-bottom: 10px;
      width: 100%;
      text-align: right;
    }

    .photo-gallery {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }

    .header h1 {
      font-size: 2rem;
    }
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>