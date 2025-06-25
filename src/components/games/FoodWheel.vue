<template>
  <div class="foodwheel-page">
    <div class="foodwheel-container">
      <!-- 麵包屑 -->
      <div class="nav-area">
        <BreadcrumbNav />
      </div>
      <!-- 遊戲區域 -->
      <h1>美食轉輪</h1>
      <div class="game-content">
        <div class="game-area">
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
          <button class="spin-button" @click="spinWheel" :disabled="isSpinning">
            {{ isSpinning ? '轉動中...' : '開始轉動' }}
          </button>
          <div v-if="result" class="result-display">今天就吃：{{ result }} 🌿</div>
        </div>

        <div class="control-panel">
          <h2>設定選項</h2>
          <div class="input-group">
            <label>新增美食類型</label>
            <input type="text" v-model="newItem" placeholder="例如：北歐料理、地中海美食" @keyup.enter="addItem" />
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
@use 'sass:color';
@use '@/styles/variables' as *;

.foodwheel-page {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 20px;
}

.foodwheel-container {
  margin: 0 auto;
  padding: 50px;
  max-width: 1100px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 25px 50px rgba($deep-blue, 0.15),
    0 10px 25px rgba($teal-green, 0.1);

  backdrop-filter: blur(20px);
}

.game-content {
  display: flex;
  margin-top: 12px;
  border-radius: 20px;
  background: #2e4057;
}

.game-area {
  display: flex;
  align-items: center;
  flex: 1.2;
  flex-direction: column;
  justify-content: center;
  margin-right: 40px;
  padding: 40px;
  width: 100%;
  // background: #2e4057;
  // border-radius: 20px;
  box-shadow: 0 10px 30px rgba(46, 64, 87, 0.3);
}

.control-panel {
  overflow: hidden;
  flex: 0.8;
  padding: 35px;
  min-width: 330px;
  max-width: 400px;
  border: 1px solid rgba(69, 105, 144, 0.2);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(69, 105, 144, 0.08), rgba(73, 190, 170, 0.08));

  backdrop-filter: blur(10px);
}

h1 {
  position: relative;
  margin-bottom: 45px;
  background: color.adjust($coral-red, $lightness: -5%);
  -webkit-background-clip: text;
  background-clip: text;
  text-align: center;
  letter-spacing: 3px;
  font-weight: 600;
  font-size: 36px;

  -webkit-text-fill-color: transparent;

  &::after {
    position: absolute;
    top: 50%;
    right: -45px;
    content: '🎯';
    font-size: 28px;
    transform: translateY(-50%);
    animation: sway 4s ease-in-out infinite;
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
  margin-bottom: 28px;
  color: $deep-blue;
  letter-spacing: 1px;
  font-weight: 500;
  font-size: 22px;
}

.wheel-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 45px;
  width: 400px;
  height: 400px;
  filter: drop-shadow(0 20px 40px rgba($deep-blue, 0.2));
}

.wheel {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  border: 6px solid $deep-blue;
  border-radius: 50%;
  background: #ffffff;
  box-shadow:
    0 0 0 8px rgba(255, 255, 255, 0.9),
    0 0 0 16px rgba($teal-green, 0.2),
    inset 0 0 40px rgba($deep-blue, 0.05);
  transform: rotate(0deg);
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 10;
  width: 30px;
  height: 30px;
  border: 4px solid #ffffff;
  border-radius: 50%;
  background: $coral-red;
  box-shadow: 0 6px 20px rgba($coral-red, 0.4);
  transform: translate(-50%, -50%);
}

.wheel-item {
  display: flex;
  align-items: center;
  justify-content: center;
  color: $deep-blue;
  font-weight: 500;
  font-size: 16px;

  span {
    position: absolute;
    top: var(--text-y);
    left: var(--text-x);
    width: 100px;
    color: $deep-blue;
    text-align: center;
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
    letter-spacing: 0.5px;
    font-weight: 600;
    font-size: 16px;
    line-height: 1.4;
    transform: translate(-50%, -50%) rotate(var(--text-rotation));
  }
}

.wheel-pointer {
  position: absolute;
  top: -28px;
  left: 50%;
  z-index: 15;
  width: 0;
  height: 0;
  border-top: 40px solid $coral-red;
  border-right: 20px solid transparent;
  border-left: 20px solid transparent;
  filter: drop-shadow(0 4px 10px rgba($coral-red, 0.5));
  transform: translateX(-50%);

  &::after {
    position: absolute;
    top: -35px;
    left: 50%;
    content: '⭐';
    font-size: 18px;
    transform: translateX(-50%);
    animation: pulse 2s ease-in-out infinite;
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

.spin-button {
  position: relative;
  overflow: hidden;
  padding: 20px 50px;
  border: none;
  border-radius: 12px;
  background: $coral-red;
  box-shadow:
    0 12px 35px rgba($coral-red, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  color: #ffffff;
  letter-spacing: 1px;
  font-weight: 600;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;

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
    background: color.adjust($coral-red, $lightness: -5%);
    box-shadow:
      0 18px 40px rgba($coral-red, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    background: #a8a8a8;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    color: #ffffff;
    cursor: not-allowed;
    transform: none;
  }
}

.result-display {
  margin-top: 35px;
  padding: 20px 35px;
  min-height: 40px;
  border: 2px solid rgba($teal-green, 0.3);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba($mint-green, 0.15), rgba($teal-green, 0.15));
  box-shadow: 0 6px 20px rgba($teal-green, 0.2);
  color: $deep-blue;
  text-align: center;
  letter-spacing: 1px;
  font-weight: 600;
  font-size: 24px;
  animation: fadeIn 0.6s ease-out;

  backdrop-filter: blur(10px);
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

.input-group {
  margin-bottom: 28px;

  label {
    display: block;
    margin-bottom: 12px;
    color: #456990;
    letter-spacing: 0.5px;
    font-weight: 500;
    font-size: 16px;
  }

  input {
    box-sizing: border-box;
    margin-bottom: 18px;
    padding: 16px 20px;
    width: calc(100% - 4px);
    border: 2px solid rgba(69, 105, 144, 0.3);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.9);
    color: #456990;
    font-weight: 400;
    font-size: 15px;
    transition: all 0.3s ease;

    backdrop-filter: blur(5px);

    &:focus {
      outline: none;
      border-color: #eeb868;
      background: rgba(255, 255, 255, 0.95);
      box-shadow:
        0 0 0 3px rgba(238, 184, 104, 0.15),
        0 4px 15px rgba(238, 184, 104, 0.2);
    }

    &::placeholder {
      color: rgba(69, 105, 144, 0.6);
    }
  }
}

.items-list {
  overflow-y: auto;
  margin-top: 25px;
  padding-right: 8px;
  max-height: 320px;
}

.list-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 20px;
  border: 2px solid rgba(238, 184, 104, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;

  backdrop-filter: blur(5px);

  &:hover {
    border-color: rgba(238, 184, 104, 0.4);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 8px 25px rgba(238, 184, 104, 0.2);
    transform: translateY(-2px);
  }
}

.item-input {
  flex: 1;
  box-sizing: border-box;
  margin-right: 16px;
  padding: 12px 16px;
  min-width: 0;
  border: 1px solid rgba(69, 105, 144, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #456990;
  font-weight: 400;
  font-size: 15px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #eeb868;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 2px rgba(238, 184, 104, 0.15);
  }
}

.delete-button {
  flex-shrink: 0;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #ef767a;
  color: #ffffff;
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
  padding: 16px 32px;
  width: 100%;
  border: 2px solid rgba(238, 184, 104, 0.4);
  border-radius: 10px;
  background: rgba(238, 184, 104, 0.15);
  color: #456990;
  letter-spacing: 0.5px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  backdrop-filter: blur(5px);

  &:hover {
    border-color: rgba(238, 184, 104, 0.6);
    background: rgba(238, 184, 104, 0.25);
    box-shadow: 0 8px 25px rgba(238, 184, 104, 0.25);
    transform: translateY(-2px);
  }
}

.update-button {
  margin-top: 28px;
  padding: 18px 36px;
  width: 100%;
  border: none;
  border-radius: 12px;
  background: #456990;
  box-shadow: 0 10px 30px rgba(69, 105, 144, 0.3);
  color: #ffffff;
  letter-spacing: 0.5px;
  font-weight: 600;
  font-size: 17px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #3a5a7a;
    box-shadow: 0 15px 35px rgba(69, 105, 144, 0.4);
    transform: translateY(-3px);
  }
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .foodwheel-container {
    padding: 40px;
  }

  .wheel-wrapper {
    width: 360px;
    height: 360px;
  }
}

@media (max-width: 992px) {
  .foodwheel-container {
    align-items: center;
    flex-direction: column;
    padding: 30px;
    max-width: 600px;
  }

  .game-area {
    align-items: center;
    width: 100%;
  }

  .control-panel {
    min-width: auto;
    max-width: none;
    max-width: 500px;
    width: 100%;
  }

  .wheel-wrapper {
    margin: 0 auto 35px;
    width: 340px;
    height: 340px;
  }

  h1 {
    margin-bottom: 35px;
    text-align: center;
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .foodwheel-page {
    padding: 15px;
  }

  .foodwheel-container {
    align-items: center;
    padding: 25px;
  }

  .game-area {
    max-width: 100%;
    width: 100%;
  }

  .wheel-wrapper {
    margin: 0 auto 35px;
    width: 300px;
    height: 300px;
  }

  .control-panel {
    padding: 25px;
    max-width: 400px;
  }

  h1 {
    margin-bottom: 30px;
    text-align: center;
    letter-spacing: 2px;
    font-size: 26px;

    &::after {
      right: -35px;
      font-size: 22px;
    }
  }

  h2 {
    margin-bottom: 24px;
    font-size: 18px;
  }

  .spin-button {
    padding: 16px 35px;
    font-size: 16px;
  }

  .result-display {
    margin-top: 30px;
    padding: 16px 25px;
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .foodwheel-page {
    padding: 10px;
  }

  .foodwheel-container {
    align-items: center;
    padding: 20px;
    border-radius: 12px;
  }

  .game-area {
    width: 100%;
  }

  .wheel-wrapper {
    margin: 0 auto 30px;
    width: 260px;
    height: 260px;
  }

  .wheel {
    border: 3px solid $deep-blue;
    box-shadow:
      0 0 0 6px rgba(255, 255, 255, 0.8),
      0 0 0 12px rgba($teal-green, 0.08),
      inset 0 0 30px rgba($deep-blue, 0.03);
  }

  .wheel-center {
    width: 20px;
    height: 20px;
    border: 3px solid #ffffff;
  }

  .wheel-pointer {
    top: -18px;
    border-top: 30px solid $coral-red;
    border-right: 15px solid transparent;
    border-left: 15px solid transparent;
  }

  .wheel-item span {
    width: 80px;
    font-size: 13px;
  }

  .control-panel {
    padding: 20px;
    max-width: 350px;
    width: 100%;
    border-radius: 10px;
  }

  h1 {
    margin-bottom: 25px;
    text-align: center;
    letter-spacing: 1.5px;
    font-size: 22px;

    &::after {
      right: -30px;
      font-size: 18px;
    }
  }

  h2 {
    margin-bottom: 20px;
    font-size: 16px;
  }

  .spin-button {
    padding: 14px 30px;
    border-radius: 6px;
    font-size: 15px;
  }

  .result-display {
    margin-top: 25px;
    padding: 14px 20px;
    border-radius: 10px;
    font-size: 18px;
  }

  .input-group {
    label {
      margin-bottom: 10px;
      font-size: 14px;
    }

    input {
      margin-bottom: 15px;
      padding: 12px 15px;
      border-radius: 6px;
      font-size: 14px;
    }
  }

  .list-item {
    margin-bottom: 12px;
    padding: 12px 15px;
    border-radius: 8px;
  }

  .item-input {
    padding: 8px 12px;
    border-radius: 5px;
    font-size: 13px;
  }

  .delete-button {
    padding: 6px 12px;
    border-radius: 5px;
    font-size: 12px;
  }

  .add-button {
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 14px;
  }

  .update-button {
    margin-top: 24px;
    padding: 14px 25px;
    border-radius: 6px;
    font-size: 15px;
  }
}

@media (max-width: 375px) {
  .foodwheel-container {
    align-items: center;
    padding: 15px;
  }

  .wheel-wrapper {
    margin: 0 auto 25px;
    width: 240px;
    height: 240px;
  }

  .wheel-item span {
    width: 70px;
    font-size: 12px;
  }

  .control-panel {
    max-width: 320px;
  }

  h1 {
    margin-bottom: 20px;
    text-align: center;
    font-size: 20px;

    &::after {
      right: -25px;
      font-size: 16px;
    }
  }

  .spin-button {
    padding: 12px 25px;
    font-size: 14px;
  }

  .result-display {
    padding: 12px 18px;
    font-size: 16px;
  }
}

@media (max-width: 320px) {
  .foodwheel-container {
    align-items: center;
  }

  .wheel-wrapper {
    margin: 0 auto 20px;
    width: 220px;
    height: 220px;
  }

  .wheel-item span {
    width: 65px;
    font-size: 11px;
  }

  .control-panel {
    padding: 15px;
    max-width: 280px;
  }

  h1 {
    text-align: center;
    font-size: 18px;
  }
}
</style>
