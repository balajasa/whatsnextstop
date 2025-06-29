<template>
  <div class="game-wrapper">
    <!-- 麵包屑 -->
    <BreadcrumbNav />
    <div class="game-container">
      <!-- A區小方塊 (body石頭) -->
      <div
        v-if="gameState.taskA"
        :class="[
          'cube',
          'cube-a',
          { dropping: gameState.aDropping, expanded: gameState.aExpanded }
        ]"
        :style="{
          backgroundImage: `url(${getStoneImage('body')})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }"
      />

      <!-- B區小方塊 (head石頭) -->
      <div
        v-if="gameState.taskB"
        :class="[
          'cube',
          'cube-b',
          { dropping: gameState.bDropping, expanded: gameState.bExpanded }
        ]"
        :style="{
          backgroundImage: `url(${getStoneImage('head')})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }"
      />

      <!-- A區地圖 -->
      <div
        v-if="gameState.aExpanded"
        :class="['map-result', 'map-a', { show: gameState.aShowMap, merging: gameState.merging }]"
      >
        <img src="@/assets/img/mini/reel_map_a.png" alt="地圖A" />
        <div class="overlay-text">{{ gameState.taskA }}</div>
      </div>

      <!-- B區地圖 -->
      <div
        v-if="gameState.bExpanded"
        :class="['map-result', 'map-b', { show: gameState.bShowMap, merging: gameState.merging }]"
      >
        <img src="@/assets/img/mini/reel_map_b.png" alt="地圖B" />
        <div class="overlay-text">{{ gameState.taskB }}</div>
      </div>

      <!-- 最終完整地圖 -->
      <div v-if="gameState.showFinalMap" :class="['final-map', { show: gameState.finalMapShow }]">
        <!-- 關閉按鈕放在最前面 -->
        <div class="result-map">
          <button @click="closeFinalMap" class="close-btn">✕</button>
        </div>
        <div class="overlay-text">
          <div class="task-item">{{ gameState.taskA }}</div>
          <div class="task-item">＋</div>
          <div class="task-item">{{ gameState.taskB }}</div>
        </div>
      </div>
    </div>

    <div class="controls">
      <button @click="dropCube('A')" :disabled="gameState.aExpanded" class="btn btn-primary">
        {{ gameState.aExpanded ? '已完成 A 區' : '掉落 A 區方塊' }}
      </button>

      <button
        @click="dropCube('B')"
        :disabled="!gameState.aExpanded || gameState.bExpanded"
        class="btn btn-primary"
      >
        {{ gameState.bExpanded ? '已完成 B 區' : '掉落 B 區方塊' }}
      </button>

      <button @click="showMapResult" :disabled="!gameState.bExpanded" class="btn btn-primary">
        📜 查看任務結果
      </button>

      <button @click="reset" class="btn btn-primary">重新開始</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, nextTick, ref } from 'vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
import taskConfig from './taskConfig.json'
import { GameState } from '../types/IMinigame'
// 預先引入所有石頭圖片
import body01 from '@/assets/img/stone/body_01.png'
import body02 from '@/assets/img/stone/body_02.png'
import body03 from '@/assets/img/stone/body_03.png'
import body04 from '@/assets/img/stone/body_04.png'
import body05 from '@/assets/img/stone/body_05.png'
import body06 from '@/assets/img/stone/body_06.png'
import head01 from '@/assets/img/stone/head_01.png'
import head02 from '@/assets/img/stone/head_02.png'
import head03 from '@/assets/img/stone/head_03.png'
import head04 from '@/assets/img/stone/head_04.png'
import head05 from '@/assets/img/stone/head_05.png'
import head06 from '@/assets/img/stone/head_06.png'

const gameState = reactive<GameState>({
  aExpanded: false,
  bExpanded: false,
  aDropping: false,
  bDropping: false,
  aShowMap: false,
  bShowMap: false,
  taskA: '',
  taskB: '',
  merging: false,
  showFinalMap: false,
  finalMapShow: false
})

// 石頭圖片隨機索引 (1-6)
const stoneIndex = ref<number>(Math.floor(Math.random() * 6) + 1)
// 石頭圖片對應表
const stoneImages = {
  body: [body01, body02, body03, body04, body05, body06],
  head: [head01, head02, head03, head04, head05, head06]
}

// 獲取石頭圖片路徑
const getStoneImage = (type: 'body' | 'head'): string => {
  return stoneImages[type][stoneIndex.value - 1]
}

const dropCube = async (type: 'A' | 'B'): Promise<void> => {
  const randomTask =
    type === 'A'
      ? taskConfig.bobyTasks[Math.floor(Math.random() * taskConfig.bobyTasks.length)]
      : taskConfig.headTasks[Math.floor(Math.random() * taskConfig.headTasks.length)]

  if (type === 'A') {
    gameState.taskA = randomTask
    await nextTick()

    // 觸發掉落動畫
    setTimeout(() => {
      gameState.aDropping = true
    }, 10)

    // 掉落完成後展開
    setTimeout(() => {
      gameState.aExpanded = true
      // 稍微延遲後觸發地圖展開動畫
      setTimeout(() => {
        gameState.aShowMap = true
      }, 200)
    }, 500)
  } else {
    gameState.taskB = randomTask
    await nextTick()

    // 觸發掉落動畫
    setTimeout(() => {
      gameState.bDropping = true
    }, 10)

    // 掉落完成後展開
    setTimeout(() => {
      gameState.bExpanded = true
      // 稍微延遲後觸發地圖展開動畫
      setTimeout(() => {
        gameState.bShowMap = true
      }, 200)
    }, 500)
  }
}

const showMapResult = async (): Promise<void> => {
  // 觸發合併動畫
  gameState.merging = true

  // 1秒後顯示最終地圖
  setTimeout(() => {
    gameState.showFinalMap = true
    setTimeout(() => {
      gameState.finalMapShow = true
    }, 100)
  }, 1000)
}

const closeFinalMap = (): void => {
  gameState.finalMapShow = false
  setTimeout(() => {
    gameState.showFinalMap = false
    // 不重置 merging 狀態，保持A/B區地圖已合併的狀態
  }, 300)
}

const reset = (): void => {
  // 重新隨機石頭圖片組合
  stoneIndex.value = Math.floor(Math.random() * 6) + 1

  // 重置遊戲狀態
  Object.assign(gameState, {
    aExpanded: false,
    bExpanded: false,
    aDropping: false,
    bDropping: false,
    aShowMap: false,
    bShowMap: false,
    taskA: '',
    taskB: '',
    merging: false,
    showFinalMap: false,
    finalMapShow: false
  })
}

defineExpose({
  dropCube,
  showMapResult,
  closeFinalMap,
  reset
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

// ===================================
// 主容器
// ===================================
.game-wrapper {
  min-height: 100vh;
  background: $bg-primary;
  padding-top: $header-height;
  padding: $spacing-lg;

  @include tablet {
    padding-top: calc(#{$header-height} + #{$spacing-lg});
    padding: $spacing-xl;
  }

  @include desktop {
    padding: $spacing-2xl;
  }
}

// ===================================
// 提示訊息
// ===================================
.info {
  color: $text-secondary;
  text-align: center;
  margin-bottom: $spacing-lg;
  font-size: 16px;
  font-weight: 500;
  background: $bg-card;
  padding: $spacing-md $spacing-lg;
  border-radius: $border-radius-md;
  box-shadow: 0 4px 12px $shadow-light;

  @include tablet {
    font-size: 18px;
    padding: $spacing-lg $spacing-xl;
    margin-bottom: $spacing-xl;
  }
}

// ===================================
// 遊戲容器響應式化
// ===================================
.game-container {
  width: 90vw;
  max-width: 800px;
  aspect-ratio: 4/3;
  margin: 0 auto $spacing-xl;
  background-image: url('@/assets/img/bg/game_bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: $border-radius-lg;
  position: relative;
  border: 2px solid $border-primary;
  box-shadow: 0 8px 32px $shadow-medium;
  margin-top: $spacing-md;

  @include tablet {
    width: 80vw;
    max-width: 700px;
  }

  @include desktop {
    width: 70vw;
    max-width: 800px;
  }
}

// ===================================
// 方塊樣式 (百分比定位)
// ===================================
.cube {
  width: 12.5%; // 相對於容器寬度 (800px 的 100px)
  aspect-ratio: 1;
  position: absolute;
  border-radius: $border-radius-sm;
  transition: top 0.3s cubic-bezier(0.8, 0, 1, 1);
  left: 50%;
  margin-left: -6.25%; // 寬度的一半

  &.cube-a {
    top: -15%; // 相對於容器高度
  }

  &.cube-b {
    top: -30%;
  }

  &.cube-a.dropping {
    top: 80%;
  }

  &.cube-b.dropping {
    top: 63%;
  }

  &.expanded {
    opacity: 1;
  }
}

// ===================================
// 地圖結果樣式
// ===================================
.map-result {
  position: absolute;
  width: 35%;
  height: 30%;
  transition: all 1s ease;
  top: 25%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: $border-radius-sm;
    box-shadow: 0 4px 12px $shadow-medium;
  }

  .overlay-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius-sm;
    font-weight: 600;
    text-align: center;
    color: $text-primary;
    max-width: 85%;
    box-shadow: 0 2px 8px $shadow-light;
    backdrop-filter: blur(5px);

    @include mobile-only {
      font-size: 12px;
      padding: $spacing-xs $spacing-sm;
    }
  }

  &.map-a {
    left: 8%;

    &.merging {
      transform: translateX(50%) scale(0.8);
      opacity: 0;
    }
  }

  &.map-b {
    right: 8%;

    &.merging {
      transform: translateX(-50%) scale(0.8);
      opacity: 0;
    }
  }
}

// ===================================
// 最終地圖樣式
// ===================================
.final-map {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translate(-50%, 0) scale(0);
  width: 50%;
  height: 40%;
  transition: all 1.2s ease;
  z-index: 100;

  .overlay-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: $spacing-md $spacing-lg;
    border-radius: $border-radius-md;
    text-align: center;
    color: $text-primary;
    max-width: 90%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 25px $shadow-medium;

    .task-item {
      font-size: 14px;
      line-height: 1.6;
      margin: $spacing-xs 0;
      font-weight: 500;

      @include tablet {
        font-size: 16px;
        margin: $spacing-sm 0;
      }
    }
  }

  &.show {
    transform: translate(-50%, 0) scale(1);
  }
}

.result-map {
  width: 100%;
  height: 100%;
  background: url('@/assets/img/mini/reel_map.png') center;
  background-size: contain;
  background-repeat: no-repeat;
  border-radius: $border-radius-md;
  box-shadow: 0 8px 25px $shadow-strong;
}

.close-btn {
  position: absolute;
  top: 8%;
  right: 8%;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: $accent-color-2;
  color: $text-white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(230, 168, 107, 0.4);
  @include flex-center;

  &:hover {
    background: #d4941b;
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(230, 168, 107, 0.6);
  }

  &:active {
    transform: scale(0.95);
  }
}

// ===================================
// 按鈕群組響應式
// ===================================
.controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;

  @include tablet {
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-lg;
    max-width: 800px;
  }

  @include mobile-only {
    grid-template-columns: 1fr;
    gap: $spacing-sm;
    max-width: 300px;
  }
}

// ===================================
// 按鈕樣式統一
// ===================================
.btn {
  padding: $spacing-md $spacing-lg;
  border: none;
  border-radius: $border-radius-md;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  @include card-hover;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  @include tablet {
    padding: $spacing-lg $spacing-xl;
    font-size: 16px;
    min-height: 56px;
  }

  &.btn-primary {
    background: $accent-color-2;
    color: $text-white;
    box-shadow: 0 4px 12px rgba(230, 168, 107, 0.3);

    &:hover:not(:disabled) {
      background: #d4941b;
      box-shadow: 0 8px 25px rgba(230, 168, 107, 0.4);
      transform: translateY(-2px) scale(1.02);
    }

    &:active {
      transform: translateY(0) scale(1);
    }

    &:disabled {
      background: $state-muted;
      color: $text-muted;
      cursor: not-allowed;
      transform: none;
      box-shadow: 0 2px 8px $shadow-light;

      &:hover {
        transform: none;
        box-shadow: 0 2px 8px $shadow-light;
      }
    }
  }
}

// ===================================
// 響應式調整
// ===================================

// 手機版特殊處理
@include mobile-only {
  .game-wrapper {
    padding: $spacing-md;
  }

  .game-container {
    width: 95vw;
    margin-bottom: $spacing-lg;
  }

  .cube {
    width: 15%; // 手機版稍微大一點
    margin-left: -7.5%;
  }

  .map-result {
    width: 40%;
    height: 25%;

    .overlay-text {
      font-size: 11px;
      padding: 4px 8px;
    }
  }

  .final-map {
    width: 65%;
    height: 35%;

    .overlay-text .task-item {
      font-size: 12px;
    }
  }

  .close-btn {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
}

// 平板版調整
@include tablet-only {
  .cube {
    width: 13%;
    margin-left: -6.5%;
  }
}

// 大桌面版優化
@include large-desktop {
  .game-container {
    width: 60vw;
  }

  .controls {
    max-width: 900px;
  }
}
</style>
