<template>
  <div class="foodwheel-page">
    <PageHeader subtitle="轉一下，讓豆豆幫你決定今天吃什麼" />

    <!-- 遊戲區域 -->
    <div class="game-wrapper">
      <div class="game-content">
        <div class="game-bg">
          <div class="result-display" :class="{ 'show': result }">今天吃：🍴 {{ result }} 🍴</div>
          <div class="game-area">
            <!-- wheel -->
            <div class="wheel-wrapper">
              <div class="wheel-pointer"></div>
              <div class="wheel" ref="wheelRef">
                <div v-for="(item, index) in wheelItems" :key="index" class="wheel-item"
                  :style="getWheelItemStyle(index)">
                  <span>{{ item }}</span>
                </div>
                <div class="wheel-center"></div>
              </div>
            </div>
            <!-- spin -->
            <button class="spin-button" @click="spinWheel" :disabled="isSpinning">
              {{ isSpinning ? '轉動中...' : '開始轉動' }}
            </button>
          </div>
        </div>


        <div class="control-panel">
          <div class="input-group">
            <label>要吃什麼？</label>
            <input type="text" v-model="newItem" placeholder="例如：烤黑豬肉、韓式炸雞、人參雞湯" @keyup.enter="addItem" />
            <button class="add-button" @click="addItem">新增項目</button>
          </div>
          <div class="items-list">
            <div v-for="(_item, index) in wheelItems" :key="index" class="list-item">
              <input type="text" class="item-input" v-model="wheelItems[index]" />
              <button class="delete-button" @click="removeItem(index)">刪除</button>
            </div>
          </div>
          <button class="update-button" @click="updateWheel">更新轉輪</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { gsap } from 'gsap'
import _ from 'lodash'
import type { Ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'

const wheelRef: Ref<HTMLElement | null> = ref(null)
const pawAnimated: Ref<boolean> = ref(false)
const wheelItems: Ref<string[]> = ref([
  '烤黑豬肉',
  '豬肉湯麵',
  '水拌生魚片',
  '白帶魚料理',
  '辣炒年糕',
  '紫菜包飯'
])
const wheelRotation: Ref<number> = ref(0)
const isSpinning: Ref<boolean> = ref(false)
const newItem: Ref<string> = ref('')
const result: Ref<string> = ref('')

// 扇形配色：色鉛筆系，深色字都看得清楚
const colors: string[] = [
  '#8FBCDB', // 藍
  '#F2C94C', // 黃
  '#E9A07E', // 珊瑚橘
  '#A9C47F', // 抹茶
  '#D9B8E0', // 藤紫
  '#F6E7B0', // 紙膠帶黃
  '#7FB7AE', // 青磁
  '#E8D9C0'  // 奶茶
]

const getWheelItemStyle = (index: number): Record<string, string> => {
  const sectionAngle = 360 / wheelItems.value.length
  const startAngle = sectionAngle * index
  const endAngle = sectionAngle * (index + 1)
  const middleAngle = (startAngle + endAngle) / 2

  // 創建扇形的 clip-path
  const points = ['50% 50%']
  const steps = Math.max(2, Math.ceil(sectionAngle / 2))
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (sectionAngle * i) / steps
    const radian = ((angle - 90) * Math.PI) / 180
    const x = 50 + 50 * Math.cos(radian)
    const y = 50 + 50 * Math.sin(radian)
    points.push(`${x}% ${y}%`)
  }

  // 計算文字位置
  const textRadian = ((middleAngle - 90) * Math.PI) / 180
  const textRadius = 38
  const textX = 50 + textRadius * Math.cos(textRadian)
  const textY = 50 + textRadius * Math.sin(textRadian)

  return {
    position: 'absolute' as const,
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: colors[index % colors.length],
    clipPath: `polygon(${points.join(', ')})`,
    '--text-x': `${textX}%`,
    '--text-y': `${textY}%`,
    '--text-rotation': `${middleAngle}deg`
  }
}

const spinWheel = (): void => {
  if (isSpinning.value || !wheelRef.value) return

  isSpinning.value = true
  pawAnimated.value = false

  // 確保順時針旋轉：至少5圈 + 隨機額外圈數
  const minRotation = 1800 // 5圈 (360° × 5)
  const randomExtra = _.random(0, 1080) // 0-3圈的隨機額外旋轉
  const totalRotation = minRotation + randomExtra // 總共5-8圈

  // 獲取當前位置（0-360度範圍）
  const currentPosition = wheelRotation.value % 360

  // 計算目標角度：當前位置 + 旋轉圈數
  const targetRotation = currentPosition + totalRotation

  result.value = ''

  gsap.to(wheelRef.value, {
    // 使用 rotationZ 確保順時針旋轉到目標角度
    rotationZ: targetRotation,
    duration: 4.5,
    ease: 'power2.out',
    onUpdate: function () {
      // 當動畫進度到 85% 時觸發貓爪拍擊
      if (this.progress() > 0.4 && !pawAnimated.value) {
        pawAnimated.value = true
        gsap.to('.wheel-pointer', {
          scale: 1.3,
          y: 10, // 往下伸
          duration: 0.1,
          ease: 'power2.out',
          onComplete: () => {
            gsap.to('.wheel-pointer', {
              scale: 1,
              y: 0,
              duration: 0.15,
              delay: 0.1  // 稍微停留一下再縮回
            })
          }
        })
      }
    },
    onComplete: () => {
      // gsap.to('.wheel-pointer', { scale: 1, y: 0, duration: 0.2 })

      isSpinning.value = false

      // 計算最終停止的位置（0-360度範圍）
      const finalPosition = targetRotation % 360

      // 重置角度：只保留最終位置，清除累積圈數
      wheelRotation.value = finalPosition

      // 同步更新 DOM 元素的實際角度（避免下次動畫出現跳躍）
      gsap.set(wheelRef.value, { rotationZ: finalPosition })

      const sectionAngle = 360 / wheelItems.value.length

      // 因為指針在上方（0度），計算指針指向的區域
      const pointerAngle = (360 - finalPosition + 360) % 360
      let selectedIndex = Math.floor(pointerAngle / sectionAngle)

      // 確保索引在有效範圍內
      selectedIndex = selectedIndex % wheelItems.value.length
      if (selectedIndex < 0) {
        selectedIndex = wheelItems.value.length + selectedIndex
      }

      result.value = wheelItems.value[selectedIndex]
    }
  })
}

const addItem = (): void => {
  const trimmedItem = newItem.value.trim()
  if (trimmedItem && !wheelItems.value.includes(trimmedItem)) {
    wheelItems.value.push(trimmedItem)
    newItem.value = ''
  }
}

const removeItem = (index: number): void => {
  if (wheelItems.value.length > 2) {
    wheelItems.value.splice(index, 1)
  }
}

const updateWheel = (): void => {
  // 強制重新渲染轉輪
  wheelItems.value = [...wheelItems.value]
  alert('轉輪已更新！')
}
</script>

<style lang="sass" scoped>
// ===================================
// 主容器
// ===================================
.game-wrapper
  max-width: 100%
  margin: 0 auto
  padding: 8px
  border: 1px solid $nb-line
  border-radius: 18px
  background: $nb-card
  box-shadow: $nb-card-shadow

  @include tablet
    max-width: 800px
    padding: 14px
    border-radius: 20px

  @include desktop
    max-width: 1200px

  @include large-desktop
    max-width: 1300px

// ===================================
// 遊戲內容布局
// ===================================
.game-content
  display: flex
  flex-direction: column
  // margin-top: $spacing-md
  border-radius: 12px
  background: $nb-paper
  overflow: hidden

  @include desktop
    flex-direction: row

.game-bg
  width: 100%
  background: url('@/assets/img/bg/wheel_bg.jpg') center
  background-repeat: no-repeat
  // background-position: center
  background-size: cover

.game-area
  display: flex
  align-items: center
  flex-direction: column
  justify-content: center
  padding: $spacing-lg
  width: 100%
  // margin-bottom: $spacing-lg
  margin-top: 30px

  @include tablet
    padding: $spacing-xl
    margin-top: 0
    margin-bottom: 0

  @include desktop
    margin-bottom: 0

.control-panel
  overflow: hidden
  padding: $spacing-lg
  background: $nb-card
  border-radius: 0

  @include tablet
    padding: 32px 22px 12px

  @include desktop
    flex: 1
    min-width: 330px
    border-radius: 0 $border-radius-md $border-radius-md 0

// ===================================
// 轉輪樣式
// ===================================
.wheel-wrapper
  position: relative
  display: flex
  align-items: center
  justify-content: center
  // margin-left: auto
  // margin-right: auto
  margin-bottom: $spacing-xl
  width: 280px
  height: 280px

  @include tablet
    width: 360px
    height: 360px
    margin-top: $spacing-lg
    margin-bottom: $spacing-2xl

  @include desktop
    width: 400px
    height: 400px

.wheel
  position: relative
  overflow: hidden
  width: 100%
  height: 100%
  border: 6px solid #C9B89F
  border-radius: 50%
  background: $nb-card
  box-shadow: 0 6px 16px rgba($nb-ink, 0.18)
  transform: rotate(0deg)

  @include tablet
    border-width: 8px

.wheel-center
  position: absolute
  top: 50%
  left: 50%
  z-index: 10
  width: 20px
  height: 20px
  border: 3px solid #C9B89F
  border-radius: 50%
  background: $nb-card
  box-shadow: 0 2px 6px rgba($nb-ink, 0.2)
  transform: translate(-50%, -50%)

  @include tablet
    width: 30px
    height: 30px
    border-width: 4px

.wheel-item
  display: flex
  align-items: center
  justify-content: center
  color: $nb-ink
  font-weight: 500

  span
    position: absolute
    top: var(--text-y)
    left: var(--text-x)
    width: 65px
    color: $nb-ink
    font-weight: 700
    text-align: center
    font-size: 14px
    line-height: 1.3
    transform: translate(-50%, -50%) rotate(var(--text-rotation))

    @include tablet
      width: 95px
      font-size: 16px
      line-height: 1.4

    @include desktop
      width: 100px
      font-size: 16px

.wheel-pointer
  position: absolute
  top: -20px
  left: 50%
  z-index: 15
  width: 40px
  height: 40px
  background: url('@/assets/img/minigame/icon/paw_w.png')
  background-size: contain
  background-repeat: no-repeat
  background-position: center
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.3))
  transform: translateX(-50%)

  @include tablet
    top: -40px
    width: 50px
    height: 50px

  @include desktop
    top: -45px
    width: 55px
    height: 55px

  &::after
    position: absolute
    top: 50%
    left: 50%
    content: ''
    transform: translate(-50%, -50%)
    animation: pulse 2s ease-in-out infinite

@keyframes pulse
  0%, 100%
    opacity: 1
    transform: translate(-50%, -50%) scale(1)

  50%
    opacity: 0.8
    transform: translate(-50%, -50%) scale(1.1)

// ===================================
// 按鈕樣式
// ===================================
.spin-button
  overflow: hidden
  padding: $spacing-md $spacing-xl
  margin-top: 12px
  border: none
  border-radius: 999px
  background: $nb-accent
  box-shadow: 0 4px 0 $nb-accent-hover
  color: $nb-card
  letter-spacing: 1px
  font-weight: 700
  font-size: 16px
  cursor: pointer
  transition: all 0.3s ease

  @include tablet
    padding: $spacing-lg $spacing-2xl
    font-size: 18px

  &:hover:not(:disabled)
    background: $nb-accent-hover
    transform: translateY(-2px)

  &:active:not(:disabled)
    box-shadow: 0 1px 0 $nb-accent-hover
    transform: translateY(3px)

  &:disabled
    background: $nb-dash
    box-shadow: none
    color: $nb-muted
    cursor: not-allowed
    transform: none

// ===================================
// 結果顯示
// ===================================
.result-display
  visibility: hidden
  position: relative
  margin: $spacing-lg auto $spacing-xl
  padding: 16px
  width: 100%
  border: 2px dashed $nb-dash-strong
  border-radius: 14px
  background: $nb-card
  box-shadow: $nb-float-shadow
  color: $nb-ink
  font-family: $font-display
  text-align: center
  letter-spacing: 0.5px
  font-weight: 700
  font-size: 18px

  @include tablet
    margin: 24px auto
    padding: 24px
    max-width: 500px
    min-height: 70px
    font-size: 20px

  &.show
    visibility: visible
    animation: fadeIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)

@keyframes fadeIn
  from
    opacity: 0
    transform: translateY(-15px)

  to
    opacity: 1
    transform: translateY(0)

// ===================================
// 控制面板
// ===================================
.input-group
  margin-bottom: $spacing-lg

  label
    display: block
    margin-bottom: $spacing-sm
    color: $nb-ink
    letter-spacing: 0.5px
    font-weight: 700
    font-size: 16px

  input
    box-sizing: border-box
    margin-bottom: $spacing-md
    padding: 8px
    width: 100%
    border: 1.5px solid $nb-dash
    border-radius: 10px
    background: $nb-card
    color: $nb-ink
    font-weight: 400
    font-size: 15px
    transition: all 0.3s ease

    &:focus
      outline: none
      border-color: $nb-fun
      box-shadow: 0 0 0 3px rgba($nb-fun, 0.18)

    &::placeholder
      color: $nb-muted

.items-list
  overflow-y: auto
  margin-top: $spacing-lg
  max-height: 260px

  @include desktop
    display: flex
    flex-direction: column
    gap: $spacing-md
    max-height: 468px

.list-item
  display: flex
  align-items: center
  margin-bottom: 12px
  padding: $spacing-md $spacing-lg
  border: 1px solid $nb-line
  border-radius: 12px
  background: $nb-paper
  transition: all 0.3s ease

  @include desktop
    margin-bottom: 0
    padding: 12px

  &:hover
    border-color: $nb-dash-strong
    background: $nb-card

.item-input
  flex: 1
  box-sizing: border-box
  margin-right: $spacing-md
  padding: $spacing-sm $spacing-md
  min-width: 0
  border: 1px solid $nb-dash
  border-radius: 8px
  background: $nb-card
  color: $nb-ink
  font-weight: 400
  font-size: 15px
  transition: all 0.3s ease

  &:focus
    outline: none
    border-color: $nb-fun
    box-shadow: 0 0 0 2px rgba($nb-fun, 0.18)

.delete-button
  flex-shrink: 0
  padding: $spacing-sm $spacing-md
  border: none
  border-radius: 999px
  background: $nb-footprint-soft
  color: $nb-footprint-strong
  white-space: nowrap
  font-weight: 500
  font-size: 14px
  cursor: pointer

  &:hover
    background: $nb-accent
    color: $nb-card

.add-button
  width: 100%
  padding: 8px
  border: 1.5px dashed $nb-dash-strong
  border-radius: 999px
  background: transparent
  color: $nb-ink
  letter-spacing: 0.5px
  font-weight: 500
  font-size: 16px
  cursor: pointer
  transition: all 0.3s ease

  &:hover
    border-style: solid
    background: $nb-fun-soft

.update-button
  margin-top: $spacing-lg
  padding: $spacing-md $spacing-xl
  width: 100%
  border: none
  border-radius: 999px
  background: $nb-ink
  color: $nb-card
  letter-spacing: 0.5px
  font-weight: 700
  font-size: 17px
  cursor: pointer

  &:hover
    background: #1F1A16
</style>
