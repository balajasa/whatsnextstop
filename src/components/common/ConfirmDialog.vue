<template>
  <!-- 遮罩層 -->
  <div v-if="visible" class="confirm-dialog-overlay" @click="handleOverlayClick">
    <!-- 對話框主體 -->
    <div class="confirm-dialog" @click.stop>
      <!-- 標題 -->
      <div v-if="title" class="confirm-dialog-title">
        {{ title }}
      </div>

      <!-- 內容 -->
      <div class="confirm-dialog-content">
        <div v-if="message" class="confirm-dialog-message">
          {{ message }}
        </div>

        <!-- 自定義內容插槽 -->
        <slot></slot>
      </div>

      <!-- 按鈕區域 -->
      <div class="confirm-dialog-actions">
        <button class="confirm-dialog-btn confirm-dialog-btn--cancel" @click="handleCancel" :disabled="loading">
          {{ cancelText }}
        </button>

        <button class="confirm-dialog-btn confirm-dialog-btn--confirm" @click="handleConfirm" :disabled="loading">
          {{ loading ? '處理中...' : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// ===================================
// Props 定義
// ===================================

interface Props {
  visible: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  message: '',
  confirmText: '確認',
  cancelText: '取消',
  loading: false,
  closeOnOverlay: true
})

// ===================================
// Emits 定義
// ===================================

interface Emits {
  confirm: []
  cancel: []
  close: []
}

const emit = defineEmits<Emits>()

// ===================================
// 事件處理
// ===================================

const handleConfirm = (): void => {
  if (!props.loading) {
    emit('confirm')
  }
}

const handleCancel = (): void => {
  if (!props.loading) {
    emit('cancel')
  }
}

const handleOverlayClick = (): void => {
  if (props.closeOnOverlay && !props.loading) {
    emit('close')
  }
}

const handleEscapeKey = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && props.visible && !props.loading) {
    emit('cancel')
  }
}

// ===================================
// 生命週期
// ===================================

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// 對話框遮罩
// ===================================
.confirm-dialog-overlay
  position: fixed
  top: 0
  left: 0
  width: 100vw
  height: 100vh
  background: $overlay-bg
  z-index: $z-modal
  @include flex-center
  padding: $spacing-md

// ===================================
// 對話框主體
// ===================================
.confirm-dialog
  background: $bg-card
  border: 1px solid $border-light
  border-radius: $border-radius-lg
  box-shadow: 0 4px 20px $shadow-strong
  max-width: 500px
  width: 100%
  max-height: 80vh
  overflow-y: auto
  animation: fadeInScale 0.2s ease-out

  @include mobile-only
    margin: 0
    border-radius: $border-radius-md
    max-height: 90vh

@keyframes fadeInScale
  from
    opacity: 0
    transform: scale(0.9)

  to
    opacity: 1
    transform: scale(1)

// ===================================
// 對話框標題
// ===================================
.confirm-dialog-title
  padding: $spacing-lg $spacing-lg 0 $spacing-lg
  font-size: 1.25rem
  font-weight: 600
  color: $primary-color
  border-bottom: 1px solid $border-light
  margin-bottom: $spacing-md

  @include tablet
    font-size: 1.375rem
    padding: $spacing-xl $spacing-xl 0 $spacing-xl


// ===================================
// 對話框內容
// ===================================
.confirm-dialog-content
  padding: 0 $spacing-lg $spacing-lg $spacing-lg

  @include tablet
    padding: 0 $spacing-xl $spacing-xl $spacing-xl

.confirm-dialog-message
  color: $text-primary
  line-height: 1.5
  margin-bottom: $spacing-md
  font-size: 1rem

// ===================================
// 按鈕區域
// ===================================
.confirm-dialog-actions
  display: flex
  gap: $spacing-sm
  padding: $spacing-md $spacing-lg $spacing-lg $spacing-lg
  justify-content: flex-end
  border-top: 1px solid $border-light

  @include tablet
    gap: $spacing-md
    padding: $spacing-md $spacing-xl $spacing-xl $spacing-xl

  @include mobile-only
    flex-direction: column-reverse

.confirm-dialog-btn
  padding: $spacing-sm $spacing-md
  border: 1px solid transparent
  border-radius: $border-radius-md
  font-size: 0.875rem
  font-weight: 500
  cursor: pointer
  transition: all 0.2s ease
  min-width: 80px

  &:disabled
    opacity: 0.6
    cursor: not-allowed

  @include tablet
    padding: $spacing-sm $spacing-lg
    min-width: 100px

  @include mobile-only
    width: 100%
    padding: $spacing-md

  // 取消按鈕樣式
  &--cancel
    background: transparent
    border-color: $border-primary
    color: $text-secondary

    &:hover:not(:disabled)
      background: rgba(74, 85, 104, 0.1)
      border-color: $primary-color
      color: $primary-color

  // 確認按鈕樣式
  &--confirm
    background: $accent-color-1
    color: $text-white

    &:hover:not(:disabled)
      background: rgba(56, 178, 172, 0.8)
      transform: translateY(-1px)

</style>