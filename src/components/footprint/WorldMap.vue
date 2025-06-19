<template>
  <div class="world-map" ref="container">
    <div class="status">
      狀態: {{ status }}
    </div>

    <div class="map-container">
      <svg ref="mapSvg" :width="width" :height="height"></svg>
    </div>

    <div class="info" v-if="hoveredCountry">
      目前懸停: {{ hoveredCountry }}
    </div>

    <div class="info" v-if="clickedCountry">
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
      height: 500,
      worldData: null
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
        this.width = Math.min(containerWidth, 800)

        // 動態獲取 map-container 的實際高度
        const mapContainer = this.$refs.container.querySelector('.map-container')
        if (mapContainer) {
          this.height = mapContainer.clientHeight - 2 // 減去border寬度
        } else {
          this.height = this.width * 0.5 // 備用方案
        }

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
        d3.select(this.$refs.mapSvg).selectAll("*").remove()

        // 使用 Natural Earth 投影，完全填滿容器
        const projection = d3.geoNaturalEarth1()
          .fitExtent([[0, 0], [this.width, this.height]], this.worldData)

        // 路徑生成器
        const path = d3.geoPath().projection(projection)

        // 選擇 SVG
        const svg = d3.select(this.$refs.mapSvg)

        // 繪製國家
        svg.selectAll(".country")
          .data(this.worldData.features)
          .enter()
          .append("path")
          .attr("class", "country")
          .attr("d", path)
          .style("stroke", "#ffffff") // 國家分界邊框顏色
          .style("stroke-width", "1") // 國家分界邊框寬度
          .style("fill", "#E6C619") // 地圖初始顏色
          .attr("id", d => {
            const name = d.properties.name || d.properties.NAME || 'unknown'
            return `country-${_.kebabCase(name)}`
          })
          .on("mouseover", (event, d) => {
            const countryName = d.properties.name || d.properties.NAME || '未知國家'
            this.hoveredCountry = countryName
            d3.select(event.target).style("fill", "#FFA500")
          })
          .on("mouseout", (event, d) => {
            this.hoveredCountry = ''
            d3.select(event.target).style("fill", "#FFD700")
          })
          .on("click", (event, d) => {
            const countryName = d.properties.name || d.properties.NAME || '未知國家'
            this.clickedCountry = countryName
            console.log('點擊了:', countryName)
          })

        this.status = `載入完成！共 ${this.worldData.features.length} 個國家/地區`

      } catch (error) {
        console.error('地圖初始化錯誤:', error)
        this.status = '地圖繪製失敗: ' + error.message
      }
    }
  }
}
</script>

<style scoped>
.world-map {
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 100%;
}

.map-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  background: #f8f9fa;
  height: 500px;
  /* 設定固定高度，或使用 min-height + height: 60vh 等響應式高度 */
}

.map-container svg {
  width: 100%;
  height: 100%;
  display: block;
}

.country {
  fill: #E6C619;
  stroke: #fff;
  stroke-width: 0.5;
  cursor: pointer;
  transition: fill 0.3s ease;
}

.country:hover {
  fill: #FFA500;
}

.status {
  padding: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  margin-bottom: 20px;
}

.info {
  padding: 10px;
  background: #e8f5e8;
  border-radius: 5px;
  margin: 10px 0;
}
</style>