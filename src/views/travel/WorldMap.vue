<template>
  <div class="world-map-svg-container" ref="mapContainer">
    <svg class="world-map-svg" ref="mapSvg" :width="width" :height="height"></svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, readonly, computed } from 'vue'
import * as d3 from 'd3'
import _ from 'lodash'
import type { Ref } from 'vue'
import type { Transform, DragBounds, MapEvents, WorldMapProps, TravelData } from '../../types/travel-map/travel-map'
import { useTravelStore } from '../../stores/useTravelStore'
import { storeToRefs } from 'pinia'
import { countryTranslation } from '../../composables/countryTranslation'

const props = withDefaults(defineProps<WorldMapProps>(), {
  width: 1000,
  height: 600,
  minScale: 1,
  maxScale: 3
})

// Emits
const emit = defineEmits<MapEvents>()

// Refs
const mapContainer: Ref<HTMLElement | null> = ref(null)
const mapSvg: Ref<HTMLElement | null> = ref(null)

// Map state
const worldData: Ref<any> = ref(null)
const projection: Ref<any> = ref(null)
const path: Ref<any> = ref(null)
const svg: Ref<any> = ref(null)
const g: Ref<any> = ref(null)
const isDragging: Ref<boolean> = ref(false)
const initialTransform: Ref<any> = ref(null)
const currentScale: Ref<number> = ref(1)
const baseScale: Ref<number | null> = ref(null)
const baseTranslate: Ref<[number, number] | null> = ref(null)

// 使用旅遊資料和國家翻譯
const travelStore = useTravelStore()
const { travels } = storeToRefs(travelStore)
const { getCountryEnglishName } = countryTranslation()

// 計算去過的國家集合（使用 Set 提升查詢效能）
const visitedCountriesSet = computed(() => {
  const countries = new Set<string>()

  travels.value.forEach((travel: TravelData) => {
    // 處理 country 可能是字串或陣列
    const countryList = Array.isArray(travel.country) ? travel.country : [travel.country]

    // 將每個國家標準化後加入 Set
    countryList.forEach((country: string) => {
      const standardName = getCountryEnglishName(country)
      countries.add(standardName)
    })
  })

  return countries
})

// 檢查國家是否去過
const isCountryVisited = (geoCountryName: string): boolean => {
  const standardGeoName = getCountryEnglishName(geoCountryName)
  return visitedCountriesSet.value.has(standardGeoName)
}

// Watch for size changes
watch(
  () => [props.width, props.height],
  () => {
    if (worldData.value) {
      nextTick(() => {
        initMap()
      })
    }
  }
)

const loadWorldData = async (): Promise<void> => {
  try {
    emit('status-change', '載入地圖數據中...')

    const response = await fetch(
      'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    worldData.value = await response.json()
    emit('status-change', '數據載入成功')
  } catch (error) {
    console.error('載入地圖數據失敗:', error)
    emit('status-change', `載入失敗: ${(error as Error).message}`)
    throw error
  }
}

const initMap = (): void => {
  try {
    if (!worldData.value) return

    emit('status-change', '繪製地圖中...')

    // 清空 SVG
    svg.value = d3.select(mapSvg.value)
    svg.value.selectAll('*').remove()

    // 設定投影，讓地圖完整顯示在容器中
    projection.value = d3.geoNaturalEarth1().fitSize([props.width, props.height], worldData.value)

    // 儲存基礎投影參數供後續使用
    baseScale.value = projection.value.scale()
    baseTranslate.value = projection.value.translate()
    currentScale.value = 1

    // 路徑生成器
    path.value = d3.geoPath().projection(projection.value)

    // 創建主要的 group 元素，用於拖曳變換
    g.value = svg.value.append('g')

    // 繪製國家 - 古地圖風格配色
    // 未去過國家: #F4E4BC (羊皮紙色) Hover: #F7EDD3 (淺羊皮紙)
    // 去過國家: #C0392B (探險紅) Hover: #E74C3C (亮探險紅)
    // 海洋: #2980B9 (古典海藍) | 國家邊界線: #8B4513 (古銅色)
    g.value
      .selectAll('.country')
      .data(worldData.value.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path.value)
      .style('stroke', '#8B4513') // 古銅色邊框
      .style('stroke-width', '0.8')
      .style('fill', (d: any) => {
        const countryName = d.properties.name || d.properties.NAME || 'unknown'
        return isCountryVisited(countryName) ? '#C0392B' : '#F4E4BC' // 探險紅 : 羊皮紙色
      })
      .style('filter', (d: any) => {
        const countryName = d.properties.name || d.properties.NAME || 'unknown'
        return isCountryVisited(countryName) ? 'drop-shadow(0 0 3px rgba(192, 57, 43, 0.4))' : 'none'
      })
      .attr('data-visited', (d: any) => {
        const countryName = d.properties.name || d.properties.NAME || 'unknown'
        return isCountryVisited(countryName)
      })
      .attr('id', (d: any) => {
        const name = d.properties.name || d.properties.NAME || 'unknown'
        return `country-${_.kebabCase(name)}`
      })
      .on('mouseenter', (event: any, d: any) => {
        if (!isDragging.value) {
          const countryName = d.properties.name || d.properties.NAME || 'unknown'
          const visited = isCountryVisited(countryName)
          emit('country-hover', countryName)

          // 根據是否去過設定不同的 hover 顏色和效果
          if (visited) {
            d3.select(event.target)
              .style('fill', '#E74C3C') // 亮探險紅
              .style('filter', 'drop-shadow(0 0 8px rgba(231, 76, 60, 0.6))')
          } else {
            d3.select(event.target)
              .style('fill', '#F7EDD3') // 淺羊皮紙
              .style('filter', 'drop-shadow(0 0 4px rgba(139, 69, 19, 0.3))')
          }
        }
      })
      .on('mouseleave', (event: any, d: any) => {
        if (!isDragging.value) {
          const countryName = d.properties.name || d.properties.NAME || 'unknown'
          const visited = isCountryVisited(countryName)
          emit('country-hover', '')

          // 恢復原本顏色和效果
          if (visited) {
            d3.select(event.target)
              .style('fill', '#C0392B') // 探險紅
              .style('filter', 'drop-shadow(0 0 3px rgba(192, 57, 43, 0.4))')
          } else {
            d3.select(event.target)
              .style('fill', '#F4E4BC') // 羊皮紙色
              .style('filter', 'none')
          }
        }
      })
      .on('click', (_event: any, d: any) => {
        if (!isDragging.value) {
          const countryName = d.properties.name || d.properties.NAME || 'unknown'
          emit('country-click', countryName)
        }
      })

    // 設定拖曳行為
    setupDrag()

    // 儲存初始變換狀態
    initialTransform.value = d3.zoomIdentity

    emit(
      'status-change',
      `載入完成！共 ${worldData.value.features.length} 個國家/地區`
    )
    emit('map-ready', {
      projection: projection.value,
      worldData: worldData.value
    })

    // 小螢幕自動放大功能
    nextTick(() => {
      checkAndApplyMobileZoom()
    })
  } catch (error) {
    console.error('地圖初始化錯誤:', error)
    emit('status-change', '地圖繪製失敗: ' + (error as Error).message)
  }
}

const zoomIn = (): void => {
  if (currentScale.value < props.maxScale) {
    applyZoom(currentScale.value * 1.5)
  }
}

const zoomOut = (): void => {
  if (currentScale.value > props.minScale) {
    applyZoom(currentScale.value / 1.5)
  }
}

const applyZoom = (newScale: number): void => {
  // 限制縮放範圍
  newScale = Math.max(props.minScale, Math.min(props.maxScale, newScale))

  // 計算當前可見區域的中心點（智能中心）
  const currentTransform = parseTransform(g.value.attr('transform') || 'translate(0,0) scale(1)')
  const centerX = (props.width / 2 - currentTransform.x) / currentScale.value
  const centerY = (props.height / 2 - currentTransform.y) / currentScale.value

  // 更新縮放
  currentScale.value = newScale

  // 計算新的平移位置，保持智能中心
  const newTranslateX = props.width / 2 - centerX * currentScale.value
  const newTranslateY = props.height / 2 - centerY * currentScale.value

  // 應用邊界限制
  const bounds = calculateDragBounds()
  const constrainedX = Math.max(bounds.minX, Math.min(bounds.maxX, newTranslateX))
  const constrainedY = Math.max(bounds.minY, Math.min(bounds.maxY, newTranslateY))

  // 使用 CSS transform 進行縮放，不重新計算路徑
  g.value
    .transition()
    .duration(300)
    .attr('transform', `translate(${constrainedX}, ${constrainedY}) scale(${currentScale.value})`)

  // 發出視圖變化事件
  emit('view-change', {
    scale: currentScale.value,
    transform: { x: constrainedX, y: constrainedY, scale: currentScale.value }
  })
}

const calculateDragBounds = (): DragBounds => {
  if (currentScale.value <= 1) {
    return { maxX: 0, maxY: 0, minX: 0, minY: 0 }
  }

  // 獲取地圖的實際邊界
  const mapBounds = path.value.bounds(worldData.value)
  const mapLeft = mapBounds[0][0]
  const mapTop = mapBounds[0][1]
  const mapRight = mapBounds[1][0]
  const mapBottom = mapBounds[1][1]

  // 地圖的實際寬高
  const mapWidth = mapRight - mapLeft
  const mapHeight = mapBottom - mapTop

  // 縮放後的地圖尺寸
  const scaledMapWidth = mapWidth * currentScale.value
  const scaledMapHeight = mapHeight * currentScale.value

  // 計算基本的拖拽範圍
  const baseMaxMoveRight = Math.max(0, scaledMapWidth - props.width)
  const baseMaxMoveDown = Math.max(0, scaledMapHeight - props.height)

  // 為了能看到南極洲和其他邊緣區域，增加額外的邊界空間
  const extraMargin = 200 * (currentScale.value - 1)

  return {
    maxX: baseMaxMoveRight + extraMargin,
    maxY: baseMaxMoveDown + extraMargin,
    minX: -(baseMaxMoveRight + extraMargin),
    minY: -(baseMaxMoveDown + extraMargin)
  }
}

const setupDrag = (): void => {
  const drag = d3
    .drag()
    .on('start', () => {
      isDragging.value = true
      svg.value.style('cursor', 'grabbing')
    })
    .on('drag', (event: any) => {
      const currentTransform =
        d3.select(g.value.node()).attr('transform') || 'translate(0,0) scale(1)'
      const parsed = parseTransform(currentTransform)

      let newX = parsed.x + event.dx
      let newY = parsed.y + event.dy

      // 只有在縮放大於1時才應用邊界限制
      if (currentScale.value > 1) {
        const bounds = calculateDragBounds()
        newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX))
        newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY))
      } else {
        // 1x 縮放時不允許移動
        newX = 0
        newY = 0
      }

      // 保持當前的縮放級別
      g.value.attr('transform', `translate(${newX}, ${newY}) scale(${currentScale.value})`)

      // 發出視圖變化事件
      emit('view-change', {
        scale: currentScale.value,
        transform: { x: newX, y: newY, scale: currentScale.value }
      })
    })
    .on('end', () => {
      setTimeout(() => {
        isDragging.value = false
      }, 50)
      svg.value.style('cursor', 'grab')
    })

  // 將拖曳行為綁定到 SVG
  svg.value.call(drag)
  svg.value.style('cursor', 'grab')
}

const parseTransform = (transformString: string): Transform => {
  // 解析包含 scale 的 transform 字串
  const translateMatch = transformString.match(/translate\(([^,]+),\s*([^)]+)\)/)
  const scaleMatch = transformString.match(/scale\(([^)]+)\)/)

  return {
    x: translateMatch ? parseFloat(translateMatch[1]) || 0 : 0,
    y: translateMatch ? parseFloat(translateMatch[2]) || 0 : 0,
    scale: scaleMatch ? parseFloat(scaleMatch[1]) || 1 : 1
  }
}

const resetView = (): void => {
  if (g.value) {
    // 重置縮放和位置
    currentScale.value = 1
    if (baseScale.value !== null && baseTranslate.value !== null) {
      projection.value = d3.geoNaturalEarth1().scale(baseScale.value).translate(baseTranslate.value)
    }

    path.value = d3.geoPath().projection(projection.value)

    // 更新所有國家路徑
    g.value.selectAll('.country').transition().duration(750).attr('d', path.value)

    // 重置位置
    g.value.transition().duration(750).attr('transform', 'translate(0, 0)')

    emit('status-change', '視圖已重置')
    emit('view-change', {
      scale: 1,
      transform: { x: 0, y: 0, scale: 1 }
    })

    setTimeout(() => {
      emit(
        'status-change',
        `載入完成！共 ${worldData.value.features.length} 個國家/地區 (可拖曳移動)`
      )
    }, 1000)
  }
}

// 檢查並套用小螢幕自動放大
const checkAndApplyMobileZoom = (): void => {
  if (typeof window !== 'undefined' && window.innerWidth <= 425) {
    // 小螢幕自動放大1.5倍
    setTimeout(() => {
      applyZoom(1.5)
      emit('status-change', '小螢幕模式：已自動放大地圖 (可拖曳移動)')
    }, 500) // 延遲500ms確保地圖完全載入
  }
}

// 監聽視窗大小變化
const handleResize = (): void => {
  if (typeof window !== 'undefined') {
    // 當從大螢幕切換到小螢幕時自動放大
    if (window.innerWidth <= 425 && currentScale.value === 1) {
      applyZoom(1.5)
    }
    // 當從小螢幕切換到大螢幕時可選擇重置（你可以調整這個邏輯）
    else if (window.innerWidth > 425 && currentScale.value === 1.5) {
      // 可以選擇保持放大或重置，這裡選擇保持
      // resetView()
    }
  }
}

// 新增更新地圖顏色的方法
const updateMapColors = (): void => {
  if (g.value) {
    g.value
      .selectAll('.country')
      .style('fill', function (d: any) {
        const countryName = d.properties.name || d.properties.NAME || 'unknown'
        return isCountryVisited(countryName) ? '#C0392B' : '#F4E4BC' // 探險紅 : 羊皮紙色
      })
      .style('filter', function (d: any) {
        const countryName = d.properties.name || d.properties.NAME || 'unknown'
        return isCountryVisited(countryName) ? 'drop-shadow(0 0 3px rgba(192, 57, 43, 0.4))' : 'none'
      })
  }
}

// 監聽旅遊資料變化，更新地圖顏色
watch(
  travels,
  (newTravels: TravelData[]) => {
    if (newTravels.length > 0 && worldData.value && g.value) {
      // 旅遊資料載入完成，更新地圖顏色
      updateMapColors()
    }
  },
  { immediate: true }
)

// 暴露方法給父組件
defineExpose({
  zoomIn,
  zoomOut,
  resetView,
  currentScale: readonly(currentScale),
  projection: readonly(projection),
  worldData: readonly(worldData)
})

onMounted(async () => {
  await travelStore.loadTravels()
  await loadWorldData()
  initMap()

  // 監聽視窗大小變化
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }
})

// 組件卸載時清理事件監聽
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.world-map-svg-container
  position: relative
  overflow: hidden
  width: 100%
  height: 100%
  border-radius: $border-radius-sm
  background: linear-gradient(135deg, #2980B9 0%, #1f618d 100%) // 古典海藍漸層

  @include tablet
    border-radius: $border-radius-md

  @include desktop
    border-radius: $border-radius-lg
    box-shadow: inset 0 2px 4px rgba(74, 85, 104, 0.1), 0 4px 12px rgba(74, 85, 104, 0.15)

.world-map-svg
  display: block
  margin: 0 auto
  max-width: 100%
  height: auto

// ===================================
// 國家樣式 - 使用主題配色系統
// ===================================
:deep(.country)
  cursor: pointer
  transition: fill 0.3s ease-in-out, stroke-width 0.2s ease, filter 0.2s ease
  stroke: #8B4513 // 古銅色
  stroke-width: 0.5

  @include tablet
    stroke-width: 0.8

  @include desktop
    transition: fill 0.2s ease-in-out, stroke-width 0.2s ease, transform 0.2s ease, filter 0.2s ease
    stroke-width: 1

  &:hover
    filter: brightness(1.05) saturate(1.1)
    stroke-width: 1.5

    @include tablet
      stroke-width: 2

    @include desktop
      filter: brightness(1.08) saturate(1.15)
      transform: scale(1.002)
      stroke-width: 2.5

  // 已訪問國家的特殊邊框 - 探險紅色系
  &[data-visited='true']
    filter: drop-shadow(0 0 6px rgba(192, 57, 43, 0.3))
    stroke: #A93226
    stroke-width: 1

    @include tablet
      filter: drop-shadow(0 0 8px rgba(192, 57, 43, 0.4))
      stroke-width: 1.2

    @include desktop
      filter: drop-shadow(0 0 10px rgba(192, 57, 43, 0.5))
      stroke-width: 1.5

    &:hover
      filter: drop-shadow(0 0 12px rgba(231, 76, 60, 0.6))
      stroke: #E74C3C
      stroke-width: 2

      @include desktop
        filter: drop-shadow(0 0 15px rgba(231, 76, 60, 0.7))
        stroke-width: 3

  // 未訪問國家特殊效果
  &[data-visited='false']
    &:hover
      filter: drop-shadow(0 0 4px rgba(139, 69, 19, 0.3)) brightness(1.08)

// ===================================
// 響應式
// ===================================

// 手機版優化
@include mobile-only
  .world-map-svg-container
    border-radius: $border-radius-sm
    background: linear-gradient(135deg, #2980B9 0%, #1f618d 100%)
    box-shadow: 0 2px 8px rgba(41, 128, 185, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)

  :deep(.country)
    stroke-width: 0.3

    &:hover
      filter: brightness(1.08)
      stroke-width: 1

    &[data-visited='true']
      stroke-width: 0.8

      &:hover
        stroke-width: 1.5

// 平板版優化
@include tablet-only
  .world-map-svg-container
    box-shadow: inset 0 1px 3px rgba(74, 85, 104, 0.08), 0 2px 10px $shadow-medium

// 桌面版增強效果 - 古地圖風格
@include desktop
  .world-map-svg-container
    position: relative
    background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, transparent 50%), linear-gradient(135deg, #2980B9 0%, #1f618d 50%, #17527a 100%)

    // 古地圖質感邊框
    &::before
      position: absolute
      top: 0
      right: 0
      left: 0
      height: 3px
      background: linear-gradient(90deg, transparent, rgba(139, 69, 19, 0.3) 20%, rgba(244, 228, 188, 0.2) 50%, rgba(139, 69, 19, 0.3) 80%, transparent)
      content: ''
      pointer-events: none

    &::after
      position: absolute
      right: 0
      bottom: 0
      left: 0
      height: 2px
      background: linear-gradient(90deg, transparent, rgba(192, 57, 43, 0.2) 30%, rgba(169, 50, 38, 0.3) 70%, transparent)
      content: ''
      pointer-events: none

  :deep(.country)
    // 桌面版特殊效果
    filter: brightness(1)
    transition: all 0.3s ease

    &:not([data-visited='true'])
      // 未訪問國家的羊皮紙質感
      background: radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), linear-gradient(45deg, #F4E4BC 0%, #F0D89E 100%)

      &:hover
        filter: brightness(1.1) sepia(0.1)
        transform: scale(1.002)

    &[data-visited='true']
      // 已訪問國家的探險質感
      position: relative

      &::before
        position: absolute
        top: 50%
        left: 50%
        width: 8px
        height: 8px
        border-radius: 50%
        background: radial-gradient(circle, rgba(231, 76, 60, 0.8) 0%, transparent 70%)
        content: ''
        transform: translate(-50%, -50%)
        pointer-events: none

      &:hover
        filter: brightness(1.15) saturate(1.3)
        transform: scale(1.005)

// 大桌面版特殊效果
@include large-desktop
  .world-map-svg-container
    border-radius: $border-radius-xl
    box-shadow: inset 0 2px 4px rgba(74, 85, 104, 0.1), 0 8px 25px rgba(74, 85, 104, 0.15), 0 2px 10px rgba(56, 178, 172, 0.05)

  :deep(.country)
    &:hover
      transition: all 0.15s ease-out

    &[data-visited='true']
      // 更強的視覺回饋
      &:hover
        box-shadow: 0 0 25px rgba(49, 151, 149, 0.6)
        transform: scale(1.003)

// ===================================
// 載入狀態和錯誤狀態樣式 - 使用主題色
// ===================================
.world-map-svg-container
  &.loading
    background: linear-gradient(135deg, rgba(245, 247, 250, 1), rgba(248, 250, 251, 1))

    &::after
      @include absolute-center
      color: $text-muted
      content: '載入地圖中...'
      font-weight: 500
      font-size: 14px

      @include tablet
        font-size: 16px

  &.error
    border: 2px dashed rgba(238, 194, 153, 1)
    background: rgba(247, 230, 212, 1)

    &::after
      @include absolute-center
      color: $timeline-recent
      content: '地圖載入失敗'
      font-weight: 600
      font-size: 14px

      @include tablet
        font-size: 16px
</style>
