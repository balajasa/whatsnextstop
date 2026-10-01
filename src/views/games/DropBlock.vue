<template>
  <div class="game-wrapper">
    <PageHeader subtitle="按兩下，看看天上會掉下什麼任務" />

    <div class="game-frame">
      <span class="game-frame__tape" aria-hidden="true"></span>
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
          <div class="overlay-text">{{ gameState.taskA }}</div>
        </div>

        <!-- B區地圖 -->
        <div v-if="gameState.bExpanded"
          :class="['map-result', 'map-b', { show: gameState.bShowMap, merging: gameState.merging }]">
          <div class="overlay-text">{{ gameState.taskB }}</div>
        </div>

        <!-- 最終完整地圖 -->
        <div v-if="gameState.showFinalMap" :class="['final-map', { show: gameState.finalMapShow }]">
          <div class="result-map">
            <!-- 關閉按鈕和文字覆蓋層都在 result-map 內部 -->
            <button @click="closeFinalMap" class="close-btn">✕</button>

            <div class="overlay-text">
              <div class="task-item">{{ gameState.taskA }}</div>
              <div class="task-item">＋</div>
              <div class="task-item">{{ gameState.taskB }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="controls">
      <button @click="dropCube('A')" :disabled="gameState.aExpanded" class="btn btn-primary">
        {{ gameState.aExpanded ? '身體已降落' : '先按我一下' }}
      </button>

      <button @click="dropCube('B')" :disabled="!gameState.aExpanded || gameState.bExpanded" class="btn btn-primary">
        {{ gameState.bExpanded ? '大頭已降落' : '再按我一下' }}
      </button>

      <button @click="showMapResult" :disabled="!gameState.bExpanded" class="btn btn-primary">
        📜 查看任務結果
      </button>

      <button @click="reset" class="btn btn-secondary">重新開始</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, nextTick, ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import taskConfig from '../../constants/taskConfig.json'
import type { GameState } from '../../types/games/drop-block-game'
// 圖片預載
import body01 from '@/assets/img/minigame/stone/body_01.png'
import body02 from '@/assets/img/minigame/stone/body_02.png'
import body03 from '@/assets/img/minigame/stone/body_03.png'
import body04 from '@/assets/img/minigame/stone/body_04.png'
import body05 from '@/assets/img/minigame/stone/body_05.png'
import body06 from '@/assets/img/minigame/stone/body_06.png'
import head01 from '@/assets/img/minigame/stone/head_01.png'
import head02 from '@/assets/img/minigame/stone/head_02.png'
import head03 from '@/assets/img/minigame/stone/head_03.png'
import head04 from '@/assets/img/minigame/stone/head_04.png'
import head05 from '@/assets/img/minigame/stone/head_05.png'
import head06 from '@/assets/img/minigame/stone/head_06.png'

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
  const taskPool = { A: taskConfig.bobyTasks, B: taskConfig.headTasks }
  const stateKeys = {
    A: { task: 'taskA', dropping: 'aDropping', expanded: 'aExpanded', showMap: 'aShowMap' },
    B: { task: 'taskB', dropping: 'bDropping', expanded: 'bExpanded', showMap: 'bShowMap' }
  } as const

  const keys = stateKeys[type]
  const pool = taskPool[type]

  gameState[keys.task] = pool[Math.floor(Math.random() * pool.length)]
  await nextTick()

  setTimeout(() => { gameState[keys.dropping] = true }, 10)
  setTimeout(() => { gameState[keys.expanded] = true }, 500)
  setTimeout(() => { gameState[keys.showMap] = true }, 700)
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

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// 主容器
// ===================================
.game-wrapper
  display: flex
  flex-direction: column

// 紙框（跟旅行地圖一樣）
.game-frame
  position: relative
  align-self: center
  width: 100%
  margin-bottom: $spacing-lg
  padding: 8px
  border: 1px solid $nb-line
  border-radius: 18px
  background: $nb-card
  box-shadow: $nb-card-shadow
  @include tablet
    width: auto
    padding: 14px
    border-radius: 20px
    margin-bottom: $spacing-xl

.game-frame__tape
  position: absolute
  top: -11px
  left: 40px
  z-index: 2
  width: 90px
  height: 24px
  background: $nb-tape-blue
  transform: rotate(-4deg)
  pointer-events: none
  @include tablet
    width: 110px
    height: 28px

// ===================================
// 提示訊息
// ===================================
.info
  color: $nb-muted
  text-align: center
  margin-bottom: $spacing-md
  font-size: 14px
  font-weight: 500
  background: $nb-card
  padding: $spacing-sm $spacing-md
  border-radius: $border-radius-md
  box-shadow: $nb-card-shadow

  @include tablet
    font-size: 16px
    padding: $spacing-md $spacing-lg
    margin-bottom: $spacing-lg

  @include desktop
    font-size: 18px
    padding: $spacing-lg $spacing-xl
    margin-bottom: $spacing-xl

// ===================================
// 遊戲容器
// ===================================
.game-container
  width: 100%
  max-width: none
  aspect-ratio: 4/3
  margin: 0 auto
  background-image: url('@/assets/img/bg/game_bg.jpg')
  background-size: cover
  background-position: center
  background-repeat: no-repeat
  border-radius: 12px
  position: relative
  overflow: hidden

  @include tablet
    width: 85vw
    max-width: 600px

  @include desktop
    width: 75vw
    max-width: 800px

  @include large-desktop
    width: 60vw
    max-width: 900px

// ===================================
// 方塊樣式
// ===================================
.cube
  width: 16%
  aspect-ratio: 1
  position: absolute
  border-radius: $border-radius-sm
  transition: top 0.3s cubic-bezier(0.8, 0, 1, 1)
  left: 50%
  margin-left: -8%

  &.cube-a
    top: -18%

  &.cube-b
    top: -36%

  &.cube-a.dropping
    top: 78%

  &.cube-b.dropping
    top: 57%

  &.expanded
    opacity: 1

  @include tablet
    width: 14%
    margin-left: -7%

    &.cube-a
      top: -16%

    &.cube-b
      top: -32%

    &.cube-a.dropping
      top: 80%

    &.cube-b.dropping
      top: 61.5%

// ===================================
// 地圖結果樣式
// ===================================
.map-result
  position: absolute
  width: 42%
  height: 42%
  transition: all 1s ease
  top: 20%
  background-size: cover
  background-position: center
  background-repeat: no-repeat

  // 地圖 A 背景圖片
  &.map-a
    background-image: url('@/assets/img/minigame/map/reel_map_a.png')
    left: 4%

    &.merging
      transform: translateX(50%) scale(0.8)
      opacity: 0

  // 地圖 B 背景圖片
  &.map-b
    background-image: url('@/assets/img/minigame/map/reel_map_b.png')
    right: 4%

    &.merging
      transform: translateX(-50%) scale(0.8)
      opacity: 0

  .overlay-text
    position: absolute
    top: 50%
    left: 50%
    transform: translate(-50%, -50%)
    font-weight: 600
    text-align: center
    color: $nb-ink
    min-width: 110px
    width: 100%
    font-size: 14px
    padding: 0 16px

  @include tablet
    width: 38%
    height: 32%
    top: 22%

    &.map-a
      left: 6%

    &.map-b
      right: 6%

    .overlay-text
      font-size: 16px
      padding: $spacing-sm $spacing-md

  @include desktop
    width: 35%
    height: 30%
    top: 25%

    &.map-a
      left: 8%

    &.map-b
      right: 8%

    .overlay-text
      font-size: 16px
      padding: $spacing-sm $spacing-md

// ===================================
// 最終地圖樣式
// ===================================
.final-map
  position: absolute
  top: 10%
  left: 50%
  transform: translate(-50%, 0) scale(0)
  width: 90%
  height: 65%
  transition: all 1.2s ease
  z-index: 5

  &.show
    transform: translate(-50%, 0) scale(1)

  @include tablet
    top: 15%
    width: 70%
    height: 50%

  @include desktop
    top: 25%
    width: 50%
    height: 40%

.result-map
  width: 100%
  height: 100%
  background: url('@/assets/img/minigame/map/reel_map.png') center
  background-size: contain
  background-repeat: no-repeat
  border-radius: $border-radius-md
  position: relative

  .overlay-text
    position: absolute
    top: 50%
    left: 50%
    transform: translate(-50%, -50%)
    border-radius: $border-radius-md
    text-align: center
    color: $nb-ink
    max-width: 100%

    .task-item
      font-size: 14px
      font-weight: 600

    @include tablet
      .task-item
        font-size: 16px

.close-btn
  position: absolute
  top: 4%
  right: 16%
  width: 30px
  height: 30px
  border: none
  border-radius: 50%
  background: $nb-ink
  color: $nb-card
  font-size: 14px
  font-weight: bold
  cursor: pointer
  box-shadow: 0 2px 6px rgba($nb-ink, 0.3)
  @include flex-center

  @include tablet
    top: 6%
    right: 16%
    width: 36px
    height: 36px
    font-size: 18px

  @include desktop
    top: 6%
    right: 12%
    width: 32px
    height: 32px
    font-size: 16px

// ===================================
// 按鈕群組
// ===================================
.controls
  display: grid
  gap: $spacing-sm
  max-width: 100%
  width: 100%
  margin: 0 auto
  grid-template-columns: 1fr 1fr
  grid-template-areas: "btn-a btn-b" "btn-result btn-result" "btn-reset btn-reset"

  // 為每個按鈕指定區域
  .btn:nth-child(1)
    grid-area: btn-a

  .btn:nth-child(2)
    grid-area: btn-b

  .btn:nth-child(3)
    grid-area: btn-result

  .btn:nth-child(4)
    grid-area: btn-reset

  @include tablet
    grid-template-columns: repeat(2, 1fr)
    grid-template-areas: "btn-a btn-b" "btn-result btn-reset"
    gap: $spacing-md
    max-width: 500px

  @include desktop
    grid-template-columns: repeat(4, 1fr)
    grid-template-areas: "btn-a btn-b btn-result btn-reset"
    gap: $spacing-lg
    max-width: 800px

  @include large-desktop
    max-width: 900px

// ===================================
// 按鈕樣式
// ===================================
.btn
  padding: $spacing-md
  border: none
  border-radius: 999px
  font-size: 14px
  font-weight: 700
  cursor: pointer
  transition: all 0.3s ease
  min-height: 48px
  max-height: 48px
  display: flex
  align-items: center
  justify-content: center
  text-align: center
  line-height: 1.2
  white-space: nowrap
  overflow: hidden

  @include tablet
    padding: $spacing-md $spacing-lg
    font-size: 15px
    min-height: 52px
    max-height: 52px

  @include desktop
    padding: $spacing-lg $spacing-xl
    font-size: 16px
    min-height: 56px
    max-height: 56px

  &.btn-primary
    background: $nb-accent
    color: $nb-card
    margin-top: 6px

    &:hover:not(:disabled)
      background: $nb-accent-hover
      transform: translateY(-2px)

    &:disabled
      background: $nb-dash
      color: $nb-muted
      cursor: not-allowed
      transform: none

  &.btn-secondary
    margin-top: 6px
    border: 1.5px dashed $nb-dash-strong
    background: transparent
    color: $nb-ink

    &:hover
      border-style: solid
      background: $nb-card
</style>