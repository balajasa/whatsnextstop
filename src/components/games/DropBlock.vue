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

      <!-- 任務結果圖片 -->
      <div v-if="gameState.showResult" :class="['result-image', { show: gameState.resultShow }]">
        <div class="task-text">
          <div class="task-item"><strong>步驟A：</strong>{{ gameState.taskA }}</div>
          <div class="task-item"><strong>步驟B：</strong>{{ gameState.taskB }}</div>
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

      <button @click="reset" class="btn btn-primary">重新開始</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick, onMounted } from 'vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
import { GameState } from '../types/IMinigame'
import taskConfig from './taskConfig.json'

const gameState = reactive<GameState>({
  aExpanded: false,
  bExpanded: false,
  aDropping: false,
  bDropping: false,
  taskA: '',
  taskB: '',
  showResult: false,
  resultShow: false
})

// 石頭圖片隨機索引 (1-6)
const stoneIndex = ref<number>(Math.floor(Math.random() * 6) + 1)

// 從 JSON 配置載入任務
const aTasks = ref<string[]>([])
const bTasks = ref<string[]>([])

onMounted(() => {
  // A區使用 bobyTasks，B區使用 headTasks
  aTasks.value = taskConfig.bobyTasks
  bTasks.value = taskConfig.headTasks
})

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
      ? aTasks.value[Math.floor(Math.random() * aTasks.value.length)]
      : bTasks.value[Math.floor(Math.random() * bTasks.value.length)]

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
      // 檢查是否兩個都完成，顯示結果
      checkBothCompleted()
    }, 1500)
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
      // 檢查是否兩個都完成，顯示結果
      checkBothCompleted()
    }, 1500)
  }
}

const checkBothCompleted = async (): Promise<void> => {
  if (gameState.aExpanded && gameState.bExpanded) {
    gameState.showResult = true
    await nextTick()

    setTimeout(() => {
      gameState.resultShow = true
    }, 100)
  }
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
    taskA: '',
    taskB: '',
    showResult: false,
    resultShow: false
  })
}

defineExpose({
  dropCube,
  reset
})
</script>

<style lang="scss" scoped>
.game-wrapper {
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  box-sizing: border-box;

  .game-container {
    width: min(800px, 95vw);
    height: min(600px, 70vh);
    background-image: url('@/assets/img/bg/game_bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 15px;
    position: relative;
    overflow: visible;
    border: 2px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 20px;
  }

  // 小方塊樣式
  .cube {
    width: 100px;
    height: 100px;
    position: absolute;
    left: 50%;
    margin-left: -50px;
    transition: top 0.3s cubic-bezier(0.8, 0, 1, 1);

    &.cube-a {
      top: -120px;
    }

    &.cube-b {
      top: -240px;
    }

    &.cube-a.dropping {
      top: calc(100% - 120px);
    }

    &.cube-b.dropping {
      top: calc(100% - 220px);
    }

    &.expanded {
      opacity: 1;
    }

    // 手機版尺寸
    @media (max-width: 480px) {
      width: 80px;
      height: 80px;
      margin-left: -40px;

      &.cube-a {
        top: -96px;
      }

      &.cube-b {
        top: -192px;
      }

      &.cube-a.dropping {
        top: calc(100% - 96px);
      }

      &.cube-b.dropping {
        top: calc(100% - 176px);
      }
    }
  }

  // 任務結果圖片樣式
  .result-image {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    height: auto;
    aspect-ratio: 3/2;
    background-image: url('@/assets/img/mini/reel_map.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 15px;
    opacity: 0;
    transition: opacity 1s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;

    &.show {
      opacity: 1;
    }
  }

  .task-text {
    text-align: center;
    color: black;
    background: rgba(255, 255, 255, 0.8);
    padding: 20px;
    border-radius: 10px;
    max-width: 80%;
  }

  .task-item {
    font-size: clamp(14px, 2.5vw, 18px);
    line-height: 1.6;
    margin: 10px 0;
    font-weight: 500;
  }

  // 按鈕樣式
  .controls {
    text-align: center;
    width: 100%;
    max-width: 800px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    padding: 0 10px;
    box-sizing: border-box;
  }

  .btn {
    padding: min(15px, 2vh) min(20px, 3vw);
    border: none;
    border-radius: 25px;
    font-size: clamp(12px, 2vw, 16px);
    cursor: pointer;
    transition: all 0.3s ease;
    flex: 1;
    min-width: 150px;
    max-width: 200px;

    &.btn-primary {
      background: #ff6b6b;
      color: white;

      &:hover:not(:disabled) {
        background: #ff5252;
        transform: translateY(-2px);
      }

      &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
      }
    }

    // 手機版調整
    @media (max-width: 480px) {
      flex: 1 1 100%;
      max-width: none;
      margin: 5px 0;
    }
  }

  // 平板版調整
  @media (max-width: 768px) {
    padding: 15px 10px;

    .game-container {
      height: min(500px, 60vh);
    }
  }

  // 手機版調整
  @media (max-width: 480px) {
    padding: 10px 5px;

    .game-container {
      height: min(400px, 50vh);
    }

    .result-image {
      width: 300px;
    }
  }
}
</style>
