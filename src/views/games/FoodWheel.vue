<template>
  <div class="foodwheel-container">
    <!-- 麵包屑 -->
    <BreadcrumbNav />

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
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

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

const colors: string[] = [
  '#89CDF1', // 水 (MIZU) - 海鮮鍋
  '#FEEEED', // 桜 (SAKURA) - 櫻花蝦
  '#8FB069', // 萌黄 (MOEGI) - 海苔湯
  '#DC143C', // 紅 (KURENAI) - 辣炒年糕
  '#E6B422', // 山吹 (YAMABUKI) - 柑橘雞
  '#884898', // 紫 (MURASAKI) - 紫薯麵
  '#4F94CD', // 浅葱 (ASAGI) - 烤魚
  '#CA6924'  // 琥珀 (KOHAKU) - 味噌湯
]

const getWheelItemStyle = (index: number): Record<string, any> => {
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
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// 主容器
// ===================================
.foodwheel-container
  min-height: 100vh
  background: $bg-primary
  padding: $spacing-md

.game-wrapper
  max-width: 100%
  margin: 0 auto
  // padding: $spacing-lg
  border: 1px solid $border-light
  border-radius: $border-radius-xl
  background: $bg-card
  box-shadow: 0 25px 50px $shadow-strong

  @include tablet
    max-width: 800px
    padding: $spacing-xl

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
  border-radius: $border-radius-lg
  background: linear-gradient(135deg, $jp-mizu, $jp-moegi)
  overflow: hidden

  @include desktop
    flex-direction: row

.game-bg
  width: 100%
  background: url('@/assets/img/minigame/wheel/wheel_bg.png') center
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
  background: rgba(255, 255, 255, 0.9)
  border: 1px solid rgba(255, 255, 255, 0.2)
  backdrop-filter: blur(10px)
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
  border: 4px solid $jp-kohaku
  border-radius: 50%
  background: $bg-card
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.9), 0 0 0 12px rgba(202, 105, 36, 0.2), inset 0 0 30px rgba(74, 85, 104, 0.05)
  transform: rotate(0deg)

  @include tablet
    border: 6px solid $jp-kohaku
    box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.9), 0 0 0 16px rgba(202, 105, 36, 0.2), inset 0 0 40px rgba(74, 85, 104, 0.05)

.wheel-center
  position: absolute
  top: 50%
  left: 50%
  z-index: 10
  width: 20px
  height: 20px
  border: 3px solid $bg-card
  border-radius: 50%
  background: $jp-yamabuki
  box-shadow: 0 4px 15px rgba(230, 180, 34, 0.4)
  transform: translate(-50%, -50%)

  @include tablet
    width: 30px
    height: 30px
    border: 4px solid $bg-card
    box-shadow: 0 6px 20px rgba(230, 180, 34, 0.4)

.wheel-item
  display: flex
  align-items: center
  justify-content: center
  color: $text-primary
  font-weight: 500

  span
    position: absolute
    top: var(--text-y)
    left: var(--text-x)
    width: 65px
    color: $text-primary
    text-align: center
    // text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8)
    // letter-spacing: 0.5px
    // font-weight: 600
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
  // border: 3px solid #E65100
  border-radius: $border-radius-md
  background: #FF7043
  box-shadow: 0 12px 35px rgba(230, 81, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(230, 81, 0, 0.8)
  color: #FFFFFF
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3)
  letter-spacing: 1px
  font-weight: 800
  font-size: 16px
  cursor: pointer
  transition: all 0.3s ease

  @include tablet
    padding: $spacing-lg $spacing-2xl
    font-size: 18px

  &:hover:not(:disabled)
    background: #FF5722
    border-color: #D84315
    box-shadow: 0 18px 40px rgba(230, 81, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(216, 67, 21, 0.8)
    transform: translateY(-3px)

  &:active
    background: #F4511E
    transform: translateY(-1px)

  &:disabled
    background: #E5E5E5
    border-color: #CCCCCC
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1)
    color: #999999
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
  // max-width: 400px
  // min-height: 60px
  border: 3px solid #8B4513
  border-radius: 16px
  background: $almond-soft
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 1), 0 0 0 1px rgba(139, 69, 19, 0.1)
  color: #2D1810
  text-align: center
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8)
  letter-spacing: 0.5px
  font-weight: 800
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
    color: $text-secondary
    letter-spacing: 0.5px
    font-weight: 500
    font-size: 16px

  input
    box-sizing: border-box
    margin-bottom: $spacing-md
    padding: 8px
    width: 100%
    border: 2px solid $border-primary
    border-radius: $border-radius-sm
    background: rgba(255, 255, 255, 0.9)
    color: $text-secondary
    font-weight: 400
    font-size: 15px
    transition: all 0.3s ease
    backdrop-filter: blur(5px)

    &:focus
      outline: none
      border-color: $jp-yamabuki
      background: $bg-card
      box-shadow: 0 0 0 3px rgba(230, 180, 34, 0.15)

    &::placeholder
      color: $text-light

.items-list
  overflow-y: auto
  margin-top: $spacing-lg
  max-height: 260px

  @include desktop
    display: flex
    flex-direction: column
    // grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))
    gap: $spacing-md
    max-height: 468px

.list-item
  display: flex
  align-items: center
  margin-bottom: 12px
  padding: $spacing-md $spacing-lg
  border: 2px solid rgba(230, 180, 34, 0.2)
  border-radius: $border-radius-md
  background: rgba(255, 255, 255, 0.8)
  transition: all 0.3s ease
  backdrop-filter: blur(5px)

  @include desktop
    margin-bottom: 0
    padding: 12px

  &:hover
    border-color: rgba(230, 180, 34, 0.4)
    background: $bg-card
    box-shadow: 0 8px 25px rgba(230, 180, 34, 0.2)
    // transform: translateY(-2px)

.item-input
  flex: 1
  box-sizing: border-box
  margin-right: $spacing-md
  padding: $spacing-sm $spacing-md
  min-width: 0
  border: 1px solid $border-primary
  border-radius: $border-radius-sm
  background: $bg-card
  color: $text-secondary
  font-weight: 400
  font-size: 15px
  transition: all 0.3s ease

  &:focus
    outline: none
    border-color: $jp-yamabuki
    box-shadow: 0 0 0 2px rgba(230, 180, 34, 0.15)

.delete-button
  flex-shrink: 0
  padding: $spacing-sm $spacing-md
  border: none
  border-radius: $border-radius-sm
  background: $jp-kurenai
  color: $text-white
  white-space: nowrap
  font-weight: 500
  font-size: 14px
  cursor: pointer
  // transition: all 0.3s ease

  &:hover
    background: rgba(220, 20, 60, 0.9)
    box-shadow: 0 6px 15px rgba(220, 20, 60, 0.3)
    // transform: translateY(-1px)

.add-button
  width: 100%
  padding: 8px
  border: 2px solid rgba(230, 180, 34, 0.4)
  border-radius: $border-radius-sm
  background: rgba(230, 180, 34, 0.15)
  color: $text-secondary
  letter-spacing: 0.5px
  font-weight: 500
  font-size: 16px
  cursor: pointer
  transition: all 0.3s ease
  backdrop-filter: blur(5px)

  &:hover
    border-color: rgba(230, 180, 34, 0.6)
    background: rgba(230, 180, 34, 0.25)
    box-shadow: 0 8px 25px rgba(230, 180, 34, 0.25)
    // transform: translateY(-2px)

.update-button
  margin-top: $spacing-lg
  padding: $spacing-md $spacing-xl
  width: 100%
  border: none
  border-radius: $border-radius-md
  background: $jp-murasaki
  box-shadow: 0 10px 30px rgba(136, 72, 152, 0.3)
  color: $text-white
  letter-spacing: 0.5px
  font-weight: 600
  font-size: 17px
  cursor: pointer

  &:hover
    background: rgba(136, 72, 152, 0.9)
    box-shadow: 0 15px 35px rgba(136, 72, 152, 0.4)
</style>