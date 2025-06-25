<template>
  <div class="game-wrapper">
    <!-- 麵包屑 -->
    <BreadcrumbNav />
    <div class="info">點擊按鈕看骰子掉落展開效果</div>

    <div class="game-container">
      <!-- A區小方塊 (body石頭) -->
      <div v-if="gameState.taskA" :class="[
        'cube',
        'cube-a',
        { dropping: gameState.aDropping, expanded: gameState.aExpanded }
      ]" :style="{
        backgroundImage: `url(${getStoneImage('body')})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }" />

      <!-- B區小方塊 (head石頭) -->
      <div v-if="gameState.taskB" :class="[
        'cube',
        'cube-b',
        { dropping: gameState.bDropping, expanded: gameState.bExpanded }
      ]" :style="{
        backgroundImage: `url(${getStoneImage('head')})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }" />

      <!-- A區地圖 -->
      <div v-if="gameState.aExpanded"
        :class="['map-result', 'map-a', { show: gameState.aShowMap, merging: gameState.merging }]">
        <img src="@/assets/img/mini/reel_map_a.png" alt="地圖A" />
        <div class="overlay-text">{{ gameState.taskA }}</div>
      </div>

      <!-- B區地圖 -->
      <div v-if="gameState.bExpanded"
        :class="['map-result', 'map-b', { show: gameState.bShowMap, merging: gameState.merging }]">
        <img src="@/assets/img/mini/reel_map_b.png" alt="地圖B" />
        <div class="overlay-text">{{ gameState.taskB }}</div>
      </div>

      <!-- 最終完整地圖 -->
      <div v-if="gameState.showFinalMap" :class="['final-map', { show: gameState.finalMapShow }]">
        <!-- 關閉按鈕放在最前面 -->
        <button @click="closeFinalMap" class="close-btn">✕</button>
        <img src="@/assets/img/mini/reel_map.png" alt="完整地圖" />
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

      <button @click="dropCube('B')" :disabled="!gameState.aExpanded || gameState.bExpanded" class="btn btn-primary">
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
.game-wrapper {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .info {
    color: white;
    text-align: center;
    margin-bottom: 20px;
    font-size: 16px;
  }

  .game-container {
    width: 800px;
    height: 600px;
    background-image: url('@/assets/img/bg/game_bg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 15px;
    position: relative;
    overflow: visible;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  // 小方塊樣式
  .cube {
    width: 100px;
    height: 100px;
    position: absolute;
    top: -120px;
    border-radius: 8px;
    transition: top 0.3s cubic-bezier(0.8, 0, 1, 1);
    left: 50%;
    margin-left: -50px;

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
  }

  // 地圖結果樣式
  .map-result {
    position: absolute;
    width: 300px;
    height: 200px;
    transition: all 1s ease;
    top: 30%;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 10px;
    }

    .overlay-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.9);
      padding: 10px 15px;
      border-radius: 8px;
      font-weight: bold;
      text-align: center;
      color: #333;
      max-width: 80%;
    }

    &.map-a {
      left: 5%;

      &.merging {
        transform: translateX(150%); // 向中心移動
        opacity: 0;
      }
    }

    &.map-b {
      right: 5%;

      &.merging {
        transform: translateX(-150%); // 向中心移動
        opacity: 0;
      }
    }
  }

  // 最終地圖樣式
  .final-map {
    position: absolute;
    top: 30%; // 和 map-result 一樣的 top 位置
    left: 50%;
    transform: translate(-50%, 0) scale(0); // 移除 -50% 的 Y 軸偏移
    width: 450px;
    height: 300px;
    transition: all 1.2s ease;
    z-index: 100;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 15px;
    }

    .overlay-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.9);
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      color: #333;
      max-width: 80%;

      .task-item {
        font-size: 16px;
        line-height: 1.6;
        margin: 8px 0;
        font-weight: 500;
      }
    }

    &.show {
      transform: translate(-50%, 0) scale(1); // 保持一致的變換
    }
  }

  // 按鈕樣式
  .controls {
    margin-top: 30px;
    text-align: center;
  }

  .btn {
    padding: 15px 30px;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    margin: 0 10px;
    transition: all 0.3s ease;

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
  }
}
</style>