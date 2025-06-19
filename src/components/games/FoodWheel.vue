<template>
  <div class="app">
    <div class="main-container">
      <div class="wheel-container">
        <h1>美食轉輪</h1>
        <div class="wheel-wrapper">
          <div class="wheel-pointer"></div>
          <div class="wheel" ref="wheelRef">
            <div v-for="(item, index) in wheelItems" :key="index" class="wheel-item" :style="getWheelItemStyle(index)">
              <span>{{ item }}</span>
            </div>
            <div class="wheel-center"></div>
          </div>
        </div>
        <button class="spin-button" @click="spinWheel" :disabled="isSpinning">
          {{ isSpinning ? '轉動中...' : '開始轉動' }}
        </button>
        <div v-if="result" class="result">
          今天就吃：{{ result }} 🌿
        </div>
      </div>

      <div class="settings-container">
        <h2>設定選項</h2>
        <div class="form-group">
          <label>新增美食類型</label>
          <input type="text" v-model="newItem" placeholder="例如：北歐料理、地中海美食" @keyup.enter="addItem">
          <button class="add-button" @click="addItem">新增項目</button>
        </div>
        <div class="item-list">
          <div v-for="(item, index) in wheelItems" :key="index" class="item-list-item">
            <input type="text" class="item-list-input" v-model="wheelItems[index]">
            <button class="delete-button" @click="removeItem(index)">刪除</button>
          </div>
        </div>
        <button class="save-button" @click="updateWheel">更新轉輪</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed } from 'vue'
import { gsap } from 'gsap'
import _ from 'lodash'

export default {
  name: 'NordicFoodWheel',
  setup() {
    const wheelRef = ref<HTMLElement | null>(null)
    const wheelItems = ref<string[]>(['中式料理', '日式料理', '韓式料理', '義式料理', '美式料理', '泰式料理'])
    const wheelRotation = ref(0)
    const isSpinning = ref(false)
    const newItem = ref('')
    const result = ref('')

    const colors = [
      '#E6F7F1', // 淡薄荷綠
      '#E1F5FE', // 淡天藍
      '#F1F8E9', // 淡草綠
      '#E8F5E8', // 淡森林綠
      '#F0F9FF', // 極淡藍
      '#E0F2F1', // 淡青綠
      '#F3E5F5', // 極淡紫
      '#FFF8E1', // 淡暖黃
      '#E8F6F3', // 淡海綠
      '#F5F5F5'  // 淡灰白
    ]

    const getWheelItemStyle = (index: number) => {
      const sectionAngle = 360 / wheelItems.value.length
      const startAngle = sectionAngle * index
      const endAngle = sectionAngle * (index + 1)
      const middleAngle = (startAngle + endAngle) / 2

      // 創建扇形的 clip-path
      const points = ['50% 50%']
      const steps = Math.max(2, Math.ceil(sectionAngle / 2))
      for (let i = 0; i <= steps; i++) {
        const angle = startAngle + (sectionAngle * i / steps)
        const radian = (angle - 90) * Math.PI / 180
        const x = 50 + 50 * Math.cos(radian)
        const y = 50 + 50 * Math.sin(radian)
        points.push(`${x}% ${y}%`)
      }

      // 計算文字位置
      const textRadian = (middleAngle - 90) * Math.PI / 180
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
      } as any
    }

    const spinWheel = () => {
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

          console.log(`轉了 ${(totalRotation / 360).toFixed(1)} 圈，最終位置: ${finalPosition.toFixed(1)}°，停在: ${result.value}`)
        }
      })
    }

    const addItem = () => {
      const trimmedItem = newItem.value.trim()
      if (trimmedItem && !wheelItems.value.includes(trimmedItem)) {
        wheelItems.value.push(trimmedItem)
        newItem.value = ''
      }
    }

    const removeItem = (index: number) => {
      if (wheelItems.value.length > 2) {
        wheelItems.value.splice(index, 1)
      }
    }

    const updateWheel = () => {
      // 強制重新渲染轉輪
      wheelItems.value = [...wheelItems.value]
      alert('轉輪已更新！🌿')
    }

    return {
      wheelRef,
      wheelItems,
      isSpinning,
      newItem,
      result,
      getWheelItemStyle,
      spinWheel,
      addItem,
      removeItem,
      updateWheel
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/styles/variables' as *;

.app {
  font-family: 'Microsoft JhengHei', -apple-system, BlinkMacSystemFont, sans-serif;
  margin: 0;
  padding: 20px;
  background: #F8F9FA;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(circle at 20% 30%, rgba($coral-red, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba($golden-yellow, 0.06) 0%, transparent 45%),
      radial-gradient(circle at 60% 80%, rgba($teal-green, 0.07) 0%, transparent 50%),
      radial-gradient(circle at 30% 70%, rgba($mint-green, 0.05) 0%, transparent 40%);
    pointer-events: none;
    z-index: 0;
  }
}

.main-container {
  max-width: 1150px;
  width: 95%;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  padding: 50px;
  border-radius: 20px;
  box-shadow:
    0 25px 50px rgba($deep-blue, 0.15),
    0 10px 25px rgba($teal-green, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  display: flex;
  gap: 70px;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.wheel-container {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.settings-container {
  flex: 0.8;
  min-width: 330px;
  max-width: 400px;
  padding: 35px;
  background: linear-gradient(135deg, rgba($mint-green, 0.1), rgba($teal-green, 0.1));
  border-radius: 16px;
  border: 1px solid rgba($teal-green, 0.3);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

h1 {
  background: color.adjust($coral-red, $lightness: -5%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin-bottom: 45px;
  font-size: 36px;
  font-weight: 600;
  letter-spacing: 3px;
  position: relative;

  &::after {
    content: '🎯';
    position: absolute;
    right: -45px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 28px;
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
  color: $deep-blue;
  margin-bottom: 28px;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 1px;
}

.wheel-wrapper {
  position: relative;
  width: 400px;
  height: 400px;
  margin: 0 auto 45px;
  filter: drop-shadow(0 20px 40px rgba($deep-blue, 0.2));
  display: flex;
  justify-content: center;
  align-items: center;
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  border: 6px solid $deep-blue;
  background: #FFFFFF;
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
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  background: $coral-red;
  border-radius: 50%;
  border: 4px solid #FFFFFF;
  box-shadow: 0 6px 20px rgba($coral-red, 0.4);
  z-index: 10;
}

.wheel-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  color: $deep-blue;

  span {
    position: absolute;
    left: var(--text-x);
    top: var(--text-y);
    width: 100px;
    text-align: center;
    transform: translate(-50%, -50%) rotate(var(--text-rotation));
    color: $deep-blue;
    font-weight: 600;
    font-size: 16px;
    line-height: 1.4;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
  }
}

.wheel-pointer {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-top: 40px solid $coral-red;
  z-index: 15;
  filter: drop-shadow(0 4px 10px rgba($coral-red, 0.5));

  &::after {
    content: '⭐';
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 18px;
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
  padding: 20px 50px;
  font-size: 18px;
  font-weight: 600;
  background: $coral-red;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  box-shadow:
    0 12px 35px rgba($coral-red, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover:not(:disabled) {
    background: color.adjust($coral-red, $lightness: -5%);
    transform: translateY(-3px);
    box-shadow:
      0 18px 40px rgba($coral-red, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    background: #A8A8A8;
    color: #FFFFFF;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  }
}

.result {
  margin-top: 35px;
  font-size: 24px;
  font-weight: 600;
  color: $deep-blue;
  min-height: 40px;
  text-align: center;
  padding: 20px 35px;
  background: linear-gradient(135deg, rgba($mint-green, 0.15), rgba($teal-green, 0.15));
  border-radius: 16px;
  border: 2px solid rgba($teal-green, 0.3);
  letter-spacing: 1px;
  backdrop-filter: blur(10px);
  box-shadow: 0 6px 20px rgba($teal-green, 0.2);
  animation: fadeIn 0.6s ease-out;
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

.form-group {
  margin-bottom: 28px;

  label {
    display: block;
    margin-bottom: 12px;
    font-weight: 500;
    font-size: 16px;
    color: $deep-blue;
    letter-spacing: 0.5px;
  }

  input {
    width: calc(100% - 4px);
    padding: 16px 20px;
    border: 2px solid rgba($teal-green, 0.3);
    border-radius: 10px;
    font-size: 15px;
    background: rgba(255, 255, 255, 0.9);
    color: $deep-blue;
    transition: all 0.3s ease;
    font-weight: 400;
    backdrop-filter: blur(5px);
    margin-bottom: 18px;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: $teal-green;
      background: rgba(255, 255, 255, 0.95);
      box-shadow:
        0 0 0 3px rgba($teal-green, 0.15),
        0 4px 15px rgba($teal-green, 0.2);
    }

    &::placeholder {
      color: rgba($deep-blue, 0.6);
    }
  }
}

.item-list {
  margin-top: 25px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba($teal-green, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba($teal-green, 0.4);
    border-radius: 4px;

    &:hover {
      background: rgba($teal-green, 0.6);
    }
  }
}

.item-list-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 2px solid rgba($mint-green, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  gap: 15px;

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 8px 25px rgba($teal-green, 0.2);
    border-color: rgba($mint-green, 0.4);
  }
}

.item-list-input {
  flex: 1;
  margin-right: 16px;
  padding: 12px 16px;
  border: 1px solid rgba($teal-green, 0.3);
  border-radius: 8px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.9);
  color: $deep-blue;
  font-weight: 400;
  transition: all 0.3s ease;
  box-sizing: border-box;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: $teal-green;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 2px rgba($teal-green, 0.15);
  }
}

.delete-button {
  padding: 10px 16px;
  background: $coral-red;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: color.adjust($coral-red, $lightness: -8%);
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba($coral-red, 0.3);
  }
}

.add-button {
  padding: 16px 32px;
  background: rgba($teal-green, 0.15);
  color: $deep-blue;
  border: 2px solid rgba($teal-green, 0.4);
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  width: 100%;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  backdrop-filter: blur(5px);

  &:hover {
    background: rgba($teal-green, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba($teal-green, 0.25);
    border-color: rgba($teal-green, 0.6);
  }
}

.save-button {
  padding: 18px 36px;
  background: $deep-blue;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  margin-top: 28px;
  font-size: 17px;
  font-weight: 600;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  box-shadow: 0 10px 30px rgba($deep-blue, 0.3);

  &:hover {
    background: color.adjust($deep-blue, $lightness: -8%);
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba($deep-blue, 0.4);
  }
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .main-container {
    gap: 50px;
    padding: 40px;
  }

  .wheel-wrapper {
    width: 360px;
    height: 360px;
  }
}

@media (max-width: 992px) {
  .main-container {
    flex-direction: column;
    gap: 40px;
    padding: 30px;
    max-width: 600px;
    align-items: center;
  }

  .wheel-container {
    width: 100%;
    align-items: center;
  }

  .settings-container {
    min-width: auto;
    max-width: none;
    width: 100%;
    max-width: 500px;
  }

  .wheel-wrapper {
    width: 340px;
    height: 340px;
    margin: 0 auto 35px;
  }

  h1 {
    font-size: 28px;
    margin-bottom: 35px;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .app {
    padding: 15px;
  }

  .main-container {
    padding: 25px;
    gap: 35px;
    align-items: center;
  }

  .wheel-container {
    width: 100%;
    max-width: 100%;
  }

  .wheel-wrapper {
    width: 300px;
    height: 300px;
    margin: 0 auto 35px;
  }

  .settings-container {
    padding: 25px;
    max-width: 400px;
  }

  h1 {
    font-size: 26px;
    letter-spacing: 2px;
    margin-bottom: 30px;
    text-align: center;

    &::after {
      right: -35px;
      font-size: 22px;
    }
  }

  h2 {
    font-size: 18px;
    margin-bottom: 24px;
  }

  .spin-button {
    padding: 16px 35px;
    font-size: 16px;
  }

  .result {
    font-size: 20px;
    padding: 16px 25px;
    margin-top: 30px;
  }
}

@media (max-width: 480px) {
  .app {
    padding: 10px;
  }

  .main-container {
    padding: 20px;
    gap: 30px;
    border-radius: 12px;
    align-items: center;
  }

  .wheel-container {
    width: 100%;
  }

  .wheel-wrapper {
    width: 260px;
    height: 260px;
    margin: 0 auto 30px;
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
    border: 3px solid #FFFFFF;
  }

  .wheel-pointer {
    top: -18px;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 30px solid $coral-red;
  }

  .wheel-item span {
    font-size: 13px;
    width: 80px;
  }

  .settings-container {
    padding: 20px;
    border-radius: 10px;
    width: 100%;
    max-width: 350px;
  }

  h1 {
    font-size: 22px;
    letter-spacing: 1.5px;
    margin-bottom: 25px;
    text-align: center;

    &::after {
      right: -30px;
      font-size: 18px;
    }
  }

  h2 {
    font-size: 16px;
    margin-bottom: 20px;
  }

  .spin-button {
    padding: 14px 30px;
    font-size: 15px;
    border-radius: 6px;
  }

  .result {
    font-size: 18px;
    padding: 14px 20px;
    margin-top: 25px;
    border-radius: 10px;
  }

  .form-group {
    label {
      font-size: 14px;
      margin-bottom: 10px;
    }

    input {
      padding: 12px 15px;
      font-size: 14px;
      border-radius: 6px;
      margin-bottom: 15px;
    }
  }

  .item-list-item {
    padding: 12px 15px;
    margin-bottom: 12px;
    border-radius: 8px;
    gap: 10px;
  }

  .item-list-input {
    padding: 8px 12px;
    font-size: 13px;
    border-radius: 5px;
  }

  .delete-button {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 5px;
  }

  .add-button {
    padding: 12px 20px;
    font-size: 14px;
    border-radius: 6px;
  }

  .save-button {
    padding: 14px 25px;
    font-size: 15px;
    border-radius: 6px;
    margin-top: 24px;
  }
}

@media (max-width: 375px) {
  .main-container {
    padding: 15px;
    gap: 25px;
    align-items: center;
  }

  .wheel-wrapper {
    width: 240px;
    height: 240px;
    margin: 0 auto 25px;
  }

  .wheel-item span {
    font-size: 12px;
    width: 70px;
  }

  .settings-container {
    max-width: 320px;
  }

  h1 {
    font-size: 20px;
    margin-bottom: 20px;
    text-align: center;

    &::after {
      right: -25px;
      font-size: 16px;
    }
  }

  .spin-button {
    padding: 12px 25px;
    font-size: 14px;
  }

  .result {
    font-size: 16px;
    padding: 12px 18px;
  }
}

@media (max-width: 320px) {
  .main-container {
    align-items: center;
  }

  .wheel-wrapper {
    width: 220px;
    height: 220px;
    margin: 0 auto 20px;
  }

  .wheel-item span {
    font-size: 11px;
    width: 65px;
  }

  .settings-container {
    max-width: 280px;
    padding: 15px;
  }

  h1 {
    font-size: 18px;
    text-align: center;
  }
}
</style>