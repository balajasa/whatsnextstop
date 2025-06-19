<template>
  <div class="game-wrapper">
    <div class="info">點擊按鈕看骰子掉落展開效果</div>

    <div class="game-container">
      <!-- A區小方塊 -->
      <div v-if="gameState.taskA"
        :class="['cube', 'cube-a', { dropping: gameState.aDropping, expanded: gameState.aExpanded }]"
        :style="{ background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)' }" />

      <!-- B區小方塊 -->
      <div v-if="gameState.taskB"
        :class="['cube', 'cube-b', { dropping: gameState.bDropping, expanded: gameState.bExpanded }]"
        :style="{ background: 'linear-gradient(45deg, #4ecdc4, #6fd8d2)' }" />

      <!-- A區展開骰子 -->
      <div v-if="gameState.aExpanded" :class="['dice-expanded', 'dice-a', { show: gameState.aShowDice }]">
        <div class="dice-face top">向前走</div>
        <div class="dice-face left">轉左</div>
        <div class="dice-face center">🎯<br>A區</div>
        <div class="dice-face right">轉右</div>
        <div class="dice-face bottom">{{ gameState.taskA }}</div>
        <div class="dice-face back">任務A</div>
      </div>

      <!-- B區展開骰子 -->
      <div v-if="gameState.bExpanded" :class="['dice-expanded', 'dice-b', { show: gameState.bShowDice }]">
        <div class="dice-face top">紅招牌</div>
        <div class="dice-face left">排隊店</div>
        <div class="dice-face center">🍜<br>B區</div>
        <div class="dice-face right">有椅子</div>
        <div class="dice-face bottom">{{ gameState.taskB }}</div>
        <div class="dice-face back">任務B</div>
      </div>

      <!-- 捲軸 -->
      <div v-if="gameState.showScroll" :class="['scroll', { show: gameState.scrollShow }]">
        <div class="scroll-content">
          <div class="scroll-title">🎯 你的美食冒險任務</div>
          <div class="scroll-task"><strong>步驟A：</strong>{{ gameState.taskA }}</div>
          <div class="scroll-task"><strong>步驟B：</strong>{{ gameState.taskB }}</div>
          <div class="scroll-footer">🍽️ 開始探險！</div>
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

      <button @click="showScrollResult" :disabled="!gameState.bExpanded" class="btn btn-primary">
        📜 查看任務結果
      </button>

      <button @click="reset" class="btn btn-primary">
        重新開始
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, nextTick } from 'vue'

interface GameState {
  aExpanded: boolean
  bExpanded: boolean
  aDropping: boolean
  bDropping: boolean
  aShowDice: boolean
  bShowDice: boolean
  taskA: string
  taskB: string
  showScroll: boolean
  scrollShow: boolean
}

const gameState = reactive<GameState>({
  aExpanded: false,
  bExpanded: false,
  aDropping: false,
  bDropping: false,
  aShowDice: false,
  bShowDice: false,
  taskA: '',
  taskB: '',
  showScroll: false,
  scrollShow: false
})

const aTasks: string[] = ['向前走200公尺', '轉左到路口', '找第2間店', '往熱鬧方向走']
const bTasks: string[] = ['紅色招牌店', '有排隊的店', '門口有椅子', '店名有數字']

const dropCube = async (type: 'A' | 'B'): Promise<void> => {
  const randomTask = type === 'A'
    ? aTasks[Math.floor(Math.random() * aTasks.length)]
    : bTasks[Math.floor(Math.random() * bTasks.length)]

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
      setTimeout(() => {
        gameState.aShowDice = true
      }, 100)
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
      setTimeout(() => {
        gameState.bShowDice = true
      }, 100)
    }, 1500)
  }
}

const showScrollResult = async (): Promise<void> => {
  gameState.showScroll = true
  await nextTick()

  setTimeout(() => {
    gameState.scrollShow = true
  }, 100)
}

const reset = (): void => {
  Object.assign(gameState, {
    aExpanded: false,
    bExpanded: false,
    aDropping: false,
    bDropping: false,
    aShowDice: false,
    bShowDice: false,
    taskA: '',
    taskB: '',
    showScroll: false,
    scrollShow: false
  })
}

defineExpose({
  dropCube,
  showScrollResult,
  reset
})
</script>

<style lang="scss" scoped>
.game-wrapper {
  min-height: 100vh;
  padding: 20px;
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    position: relative;
    overflow: visible;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  // 小方塊樣式
  .cube {
    width: 50px;
    height: 50px;
    position: absolute;
    top: -60px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    transition: top 0.3s cubic-bezier(0.8, 0, 1, 1);
    border: 2px solid #fff;

    &.cube-a,
    &.cube-b {
      left: 50%;
      margin-left: -25px;
    }

    &.dropping {
      top: 540px;
    }

    &.cube-b.dropping {
      top: 480px;
    }

    &.expanded {
      opacity: 1;
    }
  }

  // 骰子展開樣式
  .dice-expanded {
    position: absolute;
    transform: translateX(-50%) scaleY(0);
    transform-origin: 83px 166px;
    transition: all 1s ease;

    &.show {
      transform: translateX(-50%) scaleY(1);
    }

    &.dice-a {
      top: 25%;
      left: 5%;
      z-index: 5;
    }

    &.dice-b {
      top: 25%;
      left: 55%;
      z-index: 10;
    }
  }

  .dice-face {
    width: 80px;
    height: 80px;
    background: white;
    border: 3px solid #333;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    color: #333;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

    &.top {
      top: -83px;
      left: 83px;
      background: #ffeb3b;
    }

    &.left {
      top: 0;
      left: 0;
      background: #ff5722;
    }

    &.center {
      top: 0;
      left: 83px;
      background: #4caf50;
    }

    &.right {
      top: 0;
      left: 166px;
      background: #2196f3;
    }

    &.bottom {
      top: 83px;
      left: 83px;
      background: #9c27b0;
    }

    &.back {
      top: 166px;
      left: 83px;
      background: #795548;
    }
  }

  // 捲軸樣式
  .scroll {
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 500px;
    height: 250px;
    background: linear-gradient(145deg, #f4e4bc, #e8d5a3);
    border: 8px solid #8b4513;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    transform-origin: left center;
    transition: all 1.2s ease;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Georgia', serif;
    overflow: hidden;

    &.show {
      transform: translateX(-50%) scaleX(1);
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 25px;
      height: 120%;
      background: linear-gradient(180deg, #654321, #8b4513, #654321);
      border-radius: 12px;
      top: -10%;
    }

    &::before {
      left: -20px;
      box-shadow: inset 3px 0 5px rgba(0, 0, 0, 0.3);
    }

    &::after {
      right: -20px;
      box-shadow: inset -3px 0 5px rgba(0, 0, 0, 0.3);
    }
  }

  .scroll-content {
    text-align: center;
    color: #2c1810;
    padding: 20px;
  }

  .scroll-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #8b4513;
  }

  .scroll-task {
    font-size: 16px;
    line-height: 1.4;
    margin: 8px 0;
  }

  .scroll-footer {
    margin-top: 15px;
    font-size: 24px;
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