<template>
  <div class="world-map" ref="container">
    <div class="map-status">
      狀態: {{ status }}
    </div>

    <div class="controls">
      <button @click="resetView" class="reset-btn">重置視圖</button>
      <span class="instructions">💡 拖曳移動地圖，使用 +/- 縮放</span>
    </div>

    <div class="map-container" ref="mapContainer">
      <div class="zoom-controls">
        <button @click="zoomIn" :disabled="currentScale >= maxScale" class="zoom-btn">+</button>
        <button @click="zoomOut" :disabled="currentScale <= minScale" class="zoom-btn">-</button>
        <div class="zoom-level">{{ (currentScale).toFixed(1) }}x</div>
      </div>
      <svg class="world-map-svg" ref="mapSvg" :width="width" :height="height"></svg>
    </div>

    <div class="country-info" v-if="hoveredCountry">
      目前懸停: {{ hoveredCountry }}
    </div>

    <div class="country-info" v-if="clickedCountry">
      最後點擊: {{ clickedCountry }}
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import _ from 'lodash'

export default {
  name: 'WorldMap',
  data() {
    return {
      status: '載入中...',
      hoveredCountry: '',
      clickedCountry: '',
      width: 1000,
      height: 600, // 固定高度
      worldData: null,
      projection: null,
      path: null,
      svg: null,
      g: null,
      isDragging: false,
      initialTransform: null,
      currentScale: 1,
      minScale: 1,
      maxScale: 4,
      baseScale: null,
      baseTranslate: null
    }
  },
  async mounted() {
    this.updateSize()
    window.addEventListener('resize', this.updateSize)
    await this.loadWorldData()
    this.initMap()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateSize)
  },
  methods: {
    updateSize() {
      if (this.$refs.container) {
        const containerWidth = this.$refs.container.clientWidth - 40
        this.width = Math.min(containerWidth, 1000)
        this.height = 600 // 固定高度

        // 如果地圖已經初始化，重新繪製
        if (this.worldData) {
          this.$nextTick(() => {
            this.initMap()
          })
        }
      }
    },

    async loadWorldData() {
      try {
        this.status = '載入地圖數據中...'

        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        this.worldData = await response.json()
        this.status = '數據載入成功'

      } catch (error) {
        console.error('載入地圖數據失敗:', error)
        this.status = `載入失敗: ${error.message}`
        throw error
      }
    },

    initMap() {
      try {
        if (!this.worldData) return

        this.status = '繪製地圖中...'

        // 清空 SVG
        this.svg = d3.select(this.$refs.mapSvg)
        this.svg.selectAll("*").remove()

        // 設定投影，讓地圖完整顯示在容器中
        this.projection = d3.geoNaturalEarth1()
          .fitSize([this.width, this.height], this.worldData)

        // 儲存基礎投影參數供後續使用
        this.baseScale = this.projection.scale()
        this.baseTranslate = this.projection.translate()
        this.currentScale = 1

        // 路徑生成器
        this.path = d3.geoPath().projection(this.projection)

        // 創建主要的 group 元素，用於拖曳變換
        this.g = this.svg.append("g")

        // 繪製國家
        this.g.selectAll(".country")
          .data(this.worldData.features)
          .enter()
          .append("path")
          .attr("class", "country")
          .attr("d", this.path)
          .attr("id", d => {
            const name = d.properties.name || d.properties.NAME || 'unknown'
            return `country-${_.kebabCase(name)}`
          })
          .on("mouseover", (event, d) => {
            if (!this.isDragging) {
              const countryName = d.properties.name || d.properties.NAME || '未知國家'
              this.hoveredCountry = countryName
              d3.select(event.target).classed("hovered", true)
            }
          })
          .on("mouseout", (event, d) => {
            this.hoveredCountry = ''
            d3.select(event.target).classed("hovered", false)
          })
          .on("click", (event, d) => {
            if (!this.isDragging) {
              const countryName = d.properties.name || d.properties.NAME || '未知國家'
              this.clickedCountry = countryName
              console.log('點擊了:', countryName)
            }
          })

        // 設定拖曳行為
        this.setupDrag()

        // 儲存初始變換狀態
        this.initialTransform = d3.zoomIdentity

        this.status = `載入完成！共 ${this.worldData.features.length} 個國家/地區 (可拖曳移動)`

      } catch (error) {
        console.error('地圖初始化錯誤:', error)
        this.status = '地圖繪製失敗: ' + error.message
      }
    },

    zoomIn() {
      if (this.currentScale < this.maxScale) {
        this.applyZoom(this.currentScale * 1.5)
      }
    },

    zoomOut() {
      if (this.currentScale > this.minScale) {
        this.applyZoom(this.currentScale / 1.5)
      }
    },

    applyZoom(newScale) {
      // 限制縮放範圍
      newScale = Math.max(this.minScale, Math.min(this.maxScale, newScale))

      // 計算當前可見區域的中心點（智能中心）
      const currentTransform = this.parseTransform(this.g.attr("transform") || "translate(0,0) scale(1)")
      const centerX = (this.width / 2 - currentTransform.x) / this.currentScale
      const centerY = (this.height / 2 - currentTransform.y) / this.currentScale

      // 更新縮放
      this.currentScale = newScale

      // 計算新的平移位置，保持智能中心
      const newTranslateX = this.width / 2 - centerX * this.currentScale
      const newTranslateY = this.height / 2 - centerY * this.currentScale

      // 應用邊界限制
      const bounds = this.calculateDragBounds()
      const constrainedX = Math.max(bounds.minX, Math.min(bounds.maxX, newTranslateX))
      const constrainedY = Math.max(bounds.minY, Math.min(bounds.maxY, newTranslateY))

      // 使用 CSS transform 進行縮放，不重新計算路徑
      this.g.transition()
        .duration(300)
        .attr("transform", `translate(${constrainedX}, ${constrainedY}) scale(${this.currentScale})`)
    },

    calculateDragBounds() {
      // 根據當前縮放級別計算拖曳邊界
      const mapBounds = this.path.bounds(this.worldData)
      const mapWidth = (mapBounds[1][0] - mapBounds[0][0]) * this.currentScale
      const mapHeight = (mapBounds[1][1] - mapBounds[0][1]) * this.currentScale

      const maxTranslateX = mapWidth * 0.3
      const maxTranslateY = mapHeight * 0.3
      const minTranslateX = -mapWidth * 0.3
      const minTranslateY = -mapHeight * 0.3

      return {
        maxX: maxTranslateX,
        maxY: maxTranslateY,
        minX: minTranslateX,
        minY: minTranslateY
      }
    },

    setupDrag() {
      const drag = d3.drag()
        .on("start", (event) => {
          this.isDragging = true
          this.svg.style("cursor", "grabbing")
        })
        .on("drag", (event) => {
          const currentTransform = d3.select(this.g.node()).attr("transform") || "translate(0,0) scale(1)"
          const parsed = this.parseTransform(currentTransform)

          let newX = parsed.x + event.dx
          let newY = parsed.y + event.dy

          // 根據當前縮放級別計算邊界
          const bounds = this.calculateDragBounds()
          newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX))
          newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY))

          // 保持當前的縮放級別
          this.g.attr("transform", `translate(${newX}, ${newY}) scale(${this.currentScale})`)
        })
        .on("end", (event) => {
          setTimeout(() => {
            this.isDragging = false
          }, 50)
          this.svg.style("cursor", "grab")
        })

      // 將拖曳行為綁定到 SVG
      this.svg.call(drag)
      this.svg.style("cursor", "grab")
    },

    parseTransform(transformString) {
      // 解析包含 scale 的 transform 字串
      const translateMatch = transformString.match(/translate\(([^,]+),\s*([^)]+)\)/)
      const scaleMatch = transformString.match(/scale\(([^)]+)\)/)

      return {
        x: translateMatch ? parseFloat(translateMatch[1]) || 0 : 0,
        y: translateMatch ? parseFloat(translateMatch[2]) || 0 : 0,
        scale: scaleMatch ? parseFloat(scaleMatch[1]) || 1 : 1
      }
    },

    resetView() {
      if (this.g) {
        // 重置縮放和位置
        this.currentScale = 1
        this.projection = d3.geoNaturalEarth1()
          .scale(this.baseScale)
          .translate(this.baseTranslate)

        this.path = d3.geoPath().projection(this.projection)

        // 更新所有國家路徑
        this.g.selectAll(".country")
          .transition()
          .duration(750)
          .attr("d", this.path)

        // 重置位置
        this.g.transition()
          .duration(750)
          .attr("transform", "translate(0, 0)")

        this.status = '視圖已重置'
        setTimeout(() => {
          this.status = `載入完成！共 ${this.worldData.features.length} 個國家/地區 (可拖曳移動)`
        }, 1000)
      }
    }
  }
}
</script>

<style scoped>
.world-map {
  padding: 20px;
  max-width: 100%;
  font-family: Arial, sans-serif;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.reset-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.reset-btn:hover {
  background-color: #0056b3;
}

.instructions {
  color: #666;
  font-size: 14px;
}

.map-container {
  /* 隱藏溢出內容 */
  position: relative;
  /* 固定高度 */
  overflow: hidden;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f8f9fa;
  /* 為絕對定位的縮放按鈕提供參考 */
}

.zoom-controls {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  padding: 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  gap: 5px;
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  color: #333;
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.zoom-btn:hover:not(:disabled) {
  border-color: #999;
  background: #f0f0f0;
}

.zoom-btn:disabled {
  border-color: #e0e0e0;
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

.zoom-level {
  padding: 2px 0;
  color: #666;
  text-align: center;
  font-weight: bold;
  font-size: 11px;
}

.world-map-svg {
  display: block;
}

.country {
  cursor: pointer;
  transition: fill 0.3s ease;

  fill: #E6C619;
  stroke: #ffffff;
  stroke-width: 1;
}

.country:hover,
.country.hovered {
  fill: #FFA500;
}

.map-status {
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 5px;
  background: #f0f0f0;
}

.country-info {
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
  background: #e8f5e8;
}
</style>