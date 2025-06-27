<template>
  <div class="blocks-progress">
    <div class="progress-info">
      <span class="progress-text">{{ progressText }}</span>
      <span class="progress-value">{{ currentValue }}/{{ maxValue }} {{ unit }}</span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props 定義
interface Props {
  progress: number // 0-100 的進度值
  maxValue?: number // 最大值 (用於顯示 current/max)
  unit?: string // 單位 (如 'days', 'items' 等)
  title?: string // 進度標題
  containerHeight?: number // 容器高度
  showControls?: boolean // 是否顯示測試按鈕
  animationDelay?: number // 積木掉落間隔時間 (ms)
  maxBlocks?: number // 最大積木數量
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  maxValue: 365,
  unit: 'days',
  title: 'Progress',
  containerHeight: 120,
  showControls: false,
  animationDelay: 250,
  maxBlocks: 15
})

// 計算屬性
const currentValue = computed(() => Math.round(props.maxValue * props.progress / 100))

const progressText = computed(() => `${Math.round(props.progress)}% of ${props.title}`)

</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.blocks-progress {
  background: #4A5568;
}

/* 進度資訊區域 */
.progress-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid $border-light;
}

.progress-text {
  color: $text-secondary;
  font-weight: 600;
  font-size: 16px;
}

.progress-value {
  padding: 4px 16px;
  border: 1px solid rgba($accent-color-1, 0.2);
  border-radius: 20px;
  background: rgba($accent-color-1, 0.1);
  color: $accent-color-1;
  font-weight: 700;
  font-size: 18px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .progress-info {
    flex-direction: column;
    text-align: center;

    gap: 4px;
  }

  .progress-text {
    font-size: 14px;
  }

  .progress-value {
    padding: 4px 8px;
    font-size: 16px;
  }

}

@media (max-width: 480px) {
  .progress-text {
    font-size: 13px;
  }

  .progress-value {
    font-size: 14px;
  }

}
</style>