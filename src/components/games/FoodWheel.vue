<template>
  <div class="foodwheel-container">
    <!-- 麵包屑 -->
    <div class="nav-area">
      <BreadcrumbNav />
    </div>
    <!-- 遊戲區域 -->
    <div class="game-wrapper">
      <div class="game-title">美食轉輪</div>
      <div class="game-content">
        <div class="game-area">
          <div class="wheel-wrapper">
            <div class="wheel-pointer"></div>
            <div class="wheel" ref="wheelRef">
              <div
                v-for="(item, index) in wheelItems"
                :key="index"
                class="wheel-item"
                :style="getWheelItemStyle(index)"
              >
                <span>{{ item }}</span>
              </div>
              <div class="wheel-center"></div>
            </div>
          </div>
          <button class="spin-button" @click="spinWheel" :disabled="isSpinning">
            {{ isSpinning ? '轉動中...' : '開始轉動' }}
          </button>
          <div v-if="result" class="result-display">今天就吃：{{ result }} 🌿</div>
        </div>

        <div class="control-panel">
          <h2>設定選項</h2>
          <div class="input-group">
            <label>新增美食類型</label>
            <input
              type="text"
              v-model="newItem"
              placeholder="例如：北歐料理、地中海美食"
              @keyup.enter="addItem"
            />
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
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'

const wheelRef: Ref<HTMLElement | null> = ref(null)
const wheelItems: Ref<string[]> = ref([
  '中式料理',
  '日式料理',
  '韓式料理',
  '義式料理',
  '美式料理',
  '泰式料理'
])
const wheelRotation: Ref<number> = ref(0)
const isSpinning: Ref<boolean> = ref(false)
const newItem: Ref<string> = ref('')
const result: Ref<string> = ref('')

const colors: string[] = [
  '#FF6B6B', // 活潑珊瑚紅
  '#4ECDC4', // 鮮豔青綠
  '#45B7D1', // 明亮天藍
  '#96CEB4', // 清新薄荷綠
  '#FECA57', // 鮮豔金黃
  '#FF9FF3', // 粉嫩紫紅
  '#54A0FF', // 鮮豔藍色
  '#5F27CD', // 深紫羅蘭
  '#00D2D3', // 亮青色
  '#FF9F43' // 活潑橙色
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
    onComplete: () => {
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

      console.log(
        `轉了 ${(totalRotation / 360).toFixed(1)} 圈，最終位置: ${finalPosition.toFixed(1)}°，停在: ${result.value}`
      )
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
  alert('轉輪已更新！🌿')
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

// ===================================
// 主容器
// ===================================
.foodwheel-container {
  min-height: 100vh;
  background: $bg-primary;
  // padding-top: $header-height;
  // padding: $spacing-xl $spacing-md;

  // @include tablet {
  //   padding-top: calc(#{$header-height} + #{$spacing-lg});
  //   padding-left: $spacing-lg;
  //   padding-right: $spacing-lg;
  // }

  // @include desktop {
  //   padding-left: $spacing-xl;
  //   padding-right: $spacing-xl;
  // }
}

.game-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: $spacing-xl;
  border: 1px solid $border-light;
  border-radius: $border-radius-xl;
  background: $bg-card;
  box-shadow: 0 25px 50px $shadow-strong;
  // display: flex;

  @include tablet {
    padding: $spacing-xl;
  }

  @include desktop {
    max-width: 1200px;
  }

  @include large-desktop {
    max-width: 1300px;
  }
}

// ===================================
// 遊戲內容布局
// ===================================

.game-content {
  display: flex;
  flex-direction: column;
  margin-top: $spacing-md;
  border-radius: $border-radius-lg;
  background: linear-gradient(135deg, $accent-color-1, $accent-color-2);
  overflow: hidden;

  @include desktop {
    flex-direction: row;
  }
}

.game-area {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding: $spacing-xl;
  width: 100%;

  @include tablet {
    padding: $spacing-2xl;
  }

  // @include desktop {
  //   flex: 0 0 auto; // 不縮放，固定寬度
  //   width: 650px; // 給轉輪固定寬度
  // }
}

.control-panel {
  overflow: hidden;
  padding: $spacing-xl;
  min-width: 330px;
  border-radius: 0 $border-radius-md $border-radius-md 0;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);

  @include tablet {
    padding: $spacing-2xl;
  }

  @include desktop {
    flex: 1; // 佔滿剩餘空間
    // min-width: 400px;
    padding: $spacing-lg $spacing-xl;
  }
}

// ===================================
// 標題樣式
// ===================================
.game-title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: $accent-color-2; // 保留橘色主題
  // margin-bottom: $spacing-xl;

  @include tablet {
    font-size: 32px;
  }
}

@keyframes sway {
  0%,
  100% {
    transform: translateY(-50%) rotate(-5deg);
  }
  50% {
    transform: translateY(-55%) rotate(5deg);
  }
}

h2 {
  margin-bottom: $spacing-lg;
  color: $text-primary;
  letter-spacing: 1px;
  font-weight: 500;
  font-size: 22px;

  @include tablet {
    font-size: 24px;
  }
}

// ===================================
// 轉輪樣式 (保持鮮豔色彩)
// ===================================
.wheel-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto $spacing-2xl;
  width: 240px;
  height: 240px;

  // 375px 以上手機
  @media (min-width: 375px) {
    width: 280px;
    height: 280px;
  }

  // 480px 以上手機
  @media (min-width: 480px) {
    width: 320px;
    height: 320px;
  }

  @include tablet {
    width: 360px;
    height: 360px;
    margin-top: $spacing-xl;
  }

  @include desktop {
    width: 400px;
    height: 400px;
  }
}

.wheel {
  position: relative;
  right: 6px;
  overflow: hidden;
  width: 100%;
  height: 100%;
  border: 4px solid $primary-color;
  border-radius: 50%;
  background: $bg-card;
  box-shadow:
    0 0 0 6px rgba(255, 255, 255, 0.9),
    0 0 0 12px rgba(56, 178, 172, 0.2),
    inset 0 0 30px rgba(74, 85, 104, 0.05);
  transform: rotate(0deg);

  @include tablet {
    border: 6px solid $primary-color;
    box-shadow:
      0 0 0 8px rgba(255, 255, 255, 0.9),
      0 0 0 16px rgba(56, 178, 172, 0.2),
      inset 0 0 40px rgba(74, 85, 104, 0.05);
  }
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 10;
  width: 20px;
  height: 20px;
  border: 3px solid $bg-card;
  border-radius: 50%;
  background: $accent-color-2;
  box-shadow: 0 4px 15px rgba(230, 168, 107, 0.4);
  transform: translate(-50%, -50%);

  @media (min-width: 375px) {
    width: 24px;
    height: 24px;
  }

  @include tablet {
    width: 30px;
    height: 30px;
    border: 4px solid $bg-card;
    box-shadow: 0 6px 20px rgba(230, 168, 107, 0.4);
  }
}

.wheel-item {
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-primary;
  font-weight: 500;
  font-size: 16px;

  span {
    position: absolute;
    top: var(--text-y);
    left: var(--text-x);
    width: 65px;
    color: $text-primary;
    text-align: center;
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
    letter-spacing: 0.5px;
    font-weight: 600;
    font-size: 11px;
    line-height: 1.3;
    transform: translate(-50%, -50%) rotate(var(--text-rotation));

    @media (min-width: 375px) {
      width: 75px;
      font-size: 12px;
    }

    @media (min-width: 480px) {
      width: 85px;
      font-size: 13px;
    }

    @include tablet {
      width: 95px;
      font-size: 15px;
      line-height: 1.4;
    }

    @include desktop {
      width: 100px;
      font-size: 16px;
    }
  }
}

.wheel-pointer {
  position: absolute;
  top: -18px;
  left: 50%;
  z-index: 15;
  width: 0;
  height: 0;
  border-top: 24px solid $accent-color-2;
  border-right: 12px solid transparent;
  border-left: 12px solid transparent;
  filter: drop-shadow(0 3px 8px rgba(230, 168, 107, 0.5));
  transform: translateX(-50%);

  @media (min-width: 375px) {
    top: -20px;
    border-top: 28px solid $accent-color-2;
    border-right: 14px solid transparent;
    border-left: 14px solid transparent;
  }

  @media (min-width: 480px) {
    top: -22px;
    border-top: 32px solid $accent-color-2;
    border-right: 16px solid transparent;
    border-left: 16px solid transparent;
  }

  @include tablet {
    top: -25px;
    border-top: 36px solid $accent-color-2;
    border-right: 18px solid transparent;
    border-left: 18px solid transparent;
  }

  @include desktop {
    top: -28px;
    border-top: 40px solid $accent-color-2;
    border-right: 20px solid transparent;
    border-left: 20px solid transparent;
  }

  &::after {
    position: absolute;
    top: -20px;
    left: 50%;
    content: '⭐';
    font-size: 14px;
    transform: translateX(-50%);
    animation: pulse 2s ease-in-out infinite;

    @media (min-width: 375px) {
      top: -22px;
      font-size: 15px;
    }

    @media (min-width: 480px) {
      top: -25px;
      font-size: 16px;
    }

    @include tablet {
      top: -30px;
      font-size: 17px;
    }

    @include desktop {
      top: -35px;
      font-size: 18px;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 0.7;
    transform: translateX(-50%) scale(1.1);
  }
}

// ===================================
// 按鈕樣式
// ===================================
.spin-button {
  position: relative;
  overflow: hidden;
  padding: $spacing-lg $spacing-2xl;
  border: none;
  border-radius: $border-radius-md;
  background: $accent-color-2;
  box-shadow: 0 12px 35px rgba(230, 168, 107, 0.3);
  color: $text-white;
  letter-spacing: 1px;
  font-weight: 600;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;

  @include mobile-only {
    padding: $spacing-md $spacing-xl;
    font-size: 16px;
  }

  &::before {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    content: '';
    transition: left 0.6s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover:not(:disabled) {
    background: #d4941b;
    box-shadow: 0 18px 40px rgba(230, 168, 107, 0.4);
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    background: $state-muted;
    box-shadow: 0 6px 15px $shadow-light;
    color: $text-white;
    cursor: not-allowed;
    transform: none;
  }
}

// ===================================
// 結果顯示
// ===================================
.result-display {
  margin-top: $spacing-xl;
  padding: $spacing-lg $spacing-xl;
  min-height: 40px;
  border: 2px solid rgba(56, 178, 172, 0.3);
  border-radius: $border-radius-md;
  background: linear-gradient(135deg, rgba(56, 178, 172, 0.15), rgba(230, 168, 107, 0.15));
  box-shadow: 0 6px 20px rgba(56, 178, 172, 0.2);
  color: $text-primary;
  text-align: center;
  letter-spacing: 1px;
  font-weight: 600;
  font-size: 24px;
  animation: fadeIn 0.6s ease-out;
  backdrop-filter: blur(10px);

  @include mobile-only {
    font-size: 20px;
    padding: $spacing-md $spacing-lg;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ===================================
// 控制面板
// ===================================
.input-group {
  margin-bottom: $spacing-lg;

  @include desktop {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  label {
    display: block;
    margin-bottom: $spacing-md;
    color: $text-secondary;
    letter-spacing: 0.5px;
    font-weight: 500;
    font-size: 16px;

    @include desktop {
      margin-bottom: $spacing-sm;
    }
  }

  .input-row {
    @include desktop {
      display: flex;
      gap: $spacing-md;
      align-items: flex-end;
    }
  }

  input {
    box-sizing: border-box;
    margin-bottom: $spacing-md;
    padding: $spacing-md $spacing-lg;
    width: 100%;
    border: 2px solid $border-primary;
    border-radius: $border-radius-sm;
    background: rgba(255, 255, 255, 0.9);
    color: $text-secondary;
    font-weight: 400;
    font-size: 15px;
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);

    @include desktop {
      flex: 1;
      margin-bottom: 0;
    }

    &:focus {
      outline: none;
      border-color: $accent-color-2;
      background: $bg-card;
      box-shadow: 0 0 0 3px rgba(230, 168, 107, 0.15);
    }

    &::placeholder {
      color: $text-light;
    }
  }

  .add-button {
    @include desktop {
      flex-shrink: 0;
      width: auto;
      min-width: 120px;
    }
  }
}

.items-list {
  overflow-y: auto;
  margin-top: $spacing-lg;
  padding-right: $spacing-sm;
  max-height: 320px;

  @include desktop {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: $spacing-md;
    max-height: 280px;
  }
}

.list-item {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-md;
  padding: $spacing-md $spacing-lg;
  border: 2px solid rgba(230, 168, 107, 0.2);
  border-radius: $border-radius-md;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);

  @include desktop {
    margin-bottom: 0; // Grid 佈局不需要 margin
  }

  &:hover {
    border-color: rgba(230, 168, 107, 0.4);
    background: $bg-card;
    box-shadow: 0 8px 25px rgba(230, 168, 107, 0.2);
    transform: translateY(-2px);
  }
}

.item-input {
  flex: 1;
  box-sizing: border-box;
  margin-right: $spacing-md;
  padding: $spacing-sm $spacing-md;
  min-width: 0;
  border: 1px solid $border-primary;
  border-radius: $border-radius-sm;
  background: $bg-card;
  color: $text-secondary;
  font-weight: 400;
  font-size: 15px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: $accent-color-2;
    box-shadow: 0 0 0 2px rgba(230, 168, 107, 0.15);
  }
}

.delete-button {
  flex-shrink: 0;
  padding: $spacing-sm $spacing-md;
  border: none;
  border-radius: $border-radius-sm;
  background: #ef767a;
  color: $text-white;
  white-space: nowrap;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e6636a;
    box-shadow: 0 6px 15px rgba(239, 118, 122, 0.3);
    transform: translateY(-1px);
  }
}

.add-button {
  padding: $spacing-md $spacing-xl;
  width: 100%;
  border: 2px solid rgba(230, 168, 107, 0.4);
  border-radius: $border-radius-sm;
  background: rgba(230, 168, 107, 0.15);
  color: $text-secondary;
  letter-spacing: 0.5px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);

  &:hover {
    border-color: rgba(230, 168, 107, 0.6);
    background: rgba(230, 168, 107, 0.25);
    box-shadow: 0 8px 25px rgba(230, 168, 107, 0.25);
    transform: translateY(-2px);
  }
}

.update-button {
  margin-top: $spacing-lg;
  padding: $spacing-md $spacing-xl;
  width: 100%;
  border: none;
  border-radius: $border-radius-md;
  background: $primary-color;
  box-shadow: 0 10px 30px rgba(74, 85, 104, 0.3);
  color: $text-white;
  letter-spacing: 0.5px;
  font-weight: 600;
  font-size: 17px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #2d3748;
    box-shadow: 0 15px 35px rgba(74, 85, 104, 0.4);
    transform: translateY(-3px);
  }
}

// ===================================
// 響應式調整
// ===================================

// 手機版
@include mobile-only {
  .foodwheel-container {
    padding: $spacing-md;
  }

  .game-wrapper {
    padding: $spacing-lg;
  }

  .game-content {
    flex-direction: column;
  }

  .game-area {
    margin-right: 0;
    margin-bottom: $spacing-lg;
  }

  .control-panel {
    min-width: auto;
    max-width: none;
    padding: $spacing-lg;
  }

  .wheel-wrapper {
    margin-bottom: $spacing-xl;
  }

  h1 {
    font-size: 24px;
    margin-bottom: $spacing-xl;
  }

  h2 {
    font-size: 18px;
    margin-bottom: $spacing-md;
  }
}

// 平板版
@include tablet-only {
  .game-wrapper {
    max-width: 800px;
  }

  .game-content {
    flex-direction: column;
  }

  .game-area {
    margin-right: 0;
    margin-bottom: $spacing-lg;
  }

  .control-panel {
    width: 100%;
    border-radius: 0 0 $border-radius-md $border-radius-md;
  }
}
</style>
