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
import type { Transform, DragBounds, MapEvents, WorldMapProps } from '../types/ITravel'
import { getTravelsData } from '../../composables/usagi'
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
const { travels, loadTravels } = getTravelsData()
const { getCountryEnglishName } = countryTranslation()

// 計算去過的國家集合（使用 Set 提升查詢效能）
const visitedCountriesSet = computed(() => {
  const countries = new Set<string>()

  travels.value.forEach(travel => {
    // 處理 country 可能是字串或陣列
    const countryList = Array.isArray(travel.country) ? travel.country : [travel.country]

    // 將每個國家標準化後加入 Set
    countryList.forEach(country => {
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

    // 繪製國家
    // #9E4A00 深咖啡色 hover: #7A3700 | #E6C619 金色 hover: #FFA500 | #B8860B 暗金色
    // 方案二：豪華金色系
    // 未去過國家: #FFD700 Hover: #FFEC8C | 去過國家（刮開後）: #F0F8FF Hover: #FFFFFF
    // 海洋: #1B4F72 | 國家邊界線: #B8860B
    g.value
      .selectAll('.country')
      .data(worldData.value.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path.value)
      .style('stroke', '#B8860B')
      .style('stroke-width', '1')
      .style('fill', (d: any) => {
        const countryName = d.properties.name || d.properties.NAME || 'unknown'
        return isCountryVisited(countryName) ? '#F0F8FF' : '#FFD700'
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

          // 根據是否去過設定不同的 hover 顏色
          d3.select(event.target).style('fill', visited ? '#FFFFFF' : '#FFEC8C')
        }
      })
      .on('mouseleave', (event: any, d: any) => {
        if (!isDragging.value) {
          const countryName = d.properties.name || d.properties.NAME || 'unknown'
          const visited = isCountryVisited(countryName)
          emit('country-hover', '')

          // 恢復原本顏色
          d3.select(event.target).style('fill', visited ? '#F0F8FF' : '#FFD700')
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

    const visitedCount = visitedCountriesSet.value.size
    emit(
      'status-change',
      `載入完成！共 ${worldData.value.features.length} 個國家/地區，已造訪 ${visitedCount} 個國家 (可拖曳移動)`
    )
    emit('map-ready', {
      projection: projection.value,
      worldData: worldData.value
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

// 新增更新地圖顏色的方法
const updateMapColors = (): void => {
  if (g.value) {
    g.value.selectAll('.country')
      .style('fill', function (d: any) {
        const countryName = d.properties.name || d.properties.NAME || 'unknown'
        return isCountryVisited(countryName) ? '#F0F8FF' : '#FFD700'
      })
      .attr('data-visited', function (d: any) {
        const countryName = d.properties.name || d.properties.NAME || 'unknown'
        return isCountryVisited(countryName)
      })
  }
}

// 監聽旅遊資料變化，更新地圖顏色
watch(visitedCountriesSet, () => {
  if (worldData.value && g.value) {
    updateMapColors()
  }
}, { deep: true })

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
  await loadTravels()
  await loadWorldData()
  initMap()
})
</script>

<style lang="scss" scoped>
.world-map-svg-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: #1B4F72; // 海洋顏色
}

.world-map-svg {
  display: block;
  margin: 0 auto;
}

:deep(.country) {
  cursor: pointer;
  transition: fill 0.3s ease;

  fill: #e6c619;
  stroke: #ffffff;
  stroke-width: 1;

  &:hover {
    fill: #FFA500;
  }
}
</style>
