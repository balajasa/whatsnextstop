<template>
  <!-- 對話框容器 -->
  <div v-if="dialogState.hasOpenDialog" class="dialog-provider">
    <!-- 遍歷所有對話框實例 -->
    <div v-for="(dialog, index) in dialogState.dialogs" :key="dialog.id" class="dialog-instance"
      :style="{ zIndex: 1000 + index }">
      <!-- 對話框遮罩 -->
      <div class="dialog-overlay" @click="handleOverlayClick(dialog)">
        <!-- 對話框主體 -->
        <div class="dialog-content" @click.stop>

          <!-- 確認對話框 / 警告對話框 -->
          <div v-if="dialog.type === 'confirm' || dialog.type === 'alert'" class="dialog-box">
            <!-- 標題 -->
            <div v-if="getDialogTitle(dialog)" class="dialog-title">
              {{ getDialogTitle(dialog) }}
            </div>

            <!-- 內容 -->
            <div class="dialog-body">
              <div v-if="getDialogMessage(dialog)" class="dialog-message">
                {{ getDialogMessage(dialog) }}
              </div>
            </div>

            <!-- 按鈕區域 -->
            <div class="dialog-actions">
              <!-- 取消按鈕（僅確認對話框顯示） -->
              <button v-if="dialog.type === 'confirm'" class="dialog-btn dialog-btn--cancel"
                @click="handleCancel(dialog.id)" :disabled="dialog.loading">
                {{ getCancelText(dialog) }}
              </button>

              <!-- 確認按鈕 -->
              <button class="dialog-btn dialog-btn--confirm" @click="handleConfirm(dialog.id)"
                :disabled="dialog.loading">
                {{ dialog.loading ? '處理中...' : getConfirmText(dialog) }}
              </button>
            </div>
          </div>

          <!-- 自定義對話框 -->
          <component v-else-if="dialog.type === 'custom'" :is="getCustomComponent(dialog)"
            v-bind="getCustomProps(dialog)" :visible="dialog.visible"
            @confirm="(result: any) => handleConfirm(dialog.id, result)" @cancel="handleCancel(dialog.id)"
            @close="handleClose(dialog.id)" />

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useDialog } from '../../composables/useDialog'
import type {
  DialogInstance,
  ConfirmDialogOptions,
  AlertDialogOptions,
  CustomDialogOptions
} from '../../types/common/dialog'

// ===================================
// 對話框服務整合
// ===================================

const { state: dialogState, _internal } = useDialog()
const { handleConfirm, handleCancel, handleClose } = _internal

// ===================================
// 型別轉換和取值輔助函數
// ===================================

/** 獲取對話框標題 */
const getDialogTitle = (dialog: DialogInstance): string => {
  const options = dialog.options as ConfirmDialogOptions | AlertDialogOptions
  return options.title || ''
}

/** 獲取對話框訊息 */
const getDialogMessage = (dialog: DialogInstance): string => {
  const options = dialog.options as ConfirmDialogOptions | AlertDialogOptions
  return options.message || ''
}

/** 獲取確認按鈕文字 */
const getConfirmText = (dialog: DialogInstance): string => {
  const options = dialog.options as ConfirmDialogOptions | AlertDialogOptions
  return options.confirmText || '確認'
}

/** 獲取取消按鈕文字 */
const getCancelText = (dialog: DialogInstance): string => {
  const options = dialog.options as ConfirmDialogOptions
  return options.cancelText || '取消'
}

/** 檢查是否允許點擊遮罩關閉 */
const canCloseOnOverlay = (dialog: DialogInstance): boolean => {
  const options = dialog.options as any
  return options.closeOnOverlay !== false
}

/** 獲取自定義組件 */
const getCustomComponent = (dialog: DialogInstance) => {
  const options = dialog.options as CustomDialogOptions
  return options.component
}

/** 獲取自定義組件 props */
const getCustomProps = (dialog: DialogInstance): Record<string, any> => {
  const options = dialog.options as CustomDialogOptions
  return options.props || {}
}

// ===================================
// 事件處理
// ===================================

/** 處理遮罩點擊 */
const handleOverlayClick = (dialog: DialogInstance): void => {
  if (canCloseOnOverlay(dialog) && !dialog.loading) {
    handleClose(dialog.id)
  }
}

/** 處理 ESC 鍵 */
const handleEscapeKey = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && dialogState.hasOpenDialog) {
    // 關閉最後一個對話框（最上層）
    const lastDialog = dialogState.dialogs[dialogState.dialogs.length - 1]
    if (lastDialog && canCloseOnOverlay(lastDialog) && !lastDialog.loading) {
      handleClose(lastDialog.id)
    }
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
// 對話框提供者容器
// ===================================
.dialog-provider
  position: fixed
  top: 0
  left: 0
  width: 100vw
  height: 100vh
  pointer-events: none

// ===================================
// 對話框實例
// ===================================
.dialog-instance
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  pointer-events: auto

// ===================================
// 對話框遮罩
// ===================================
.dialog-overlay
  position: fixed
  top: 0
  left: 0
  width: 100vw
  height: 100vh
  background: $overlay-bg
  @include flex-center
  padding: $spacing-md
  animation: fadeIn 0.2s ease-out

@keyframes fadeIn
  from
    opacity: 0
  to
    opacity: 1

// ===================================
// 對話框內容容器
// ===================================
.dialog-content
  position: relative
  width: 100%
  max-width: 500px
  max-height: 80vh
  overflow-y: auto
  animation: fadeInScale 0.2s ease-out

  @include mobile-only
    margin: 0
    max-height: 90vh

@keyframes fadeInScale
  from
    opacity: 0
    transform: scale(0.9)
  to
    opacity: 1
    transform: scale(1)

// ===================================
// 對話框主體
// ===================================
.dialog-box
  background: $bg-card
  border: 1px solid $border-light
  border-radius: $border-radius-lg
  box-shadow: 0 4px 20px $shadow-strong
  overflow: hidden

  @include mobile-only
    border-radius: $border-radius-md

// ===================================
// 對話框標題
// ===================================
.dialog-title
  padding: $spacing-lg $spacing-lg 0 $spacing-lg
  font-size: 1.25rem
  font-weight: 600
  color: $primary-color
  border-bottom: 1px solid $border-light

  @include tablet
    font-size: 1.375rem
    padding: $spacing-xl $spacing-xl 0 $spacing-xl

// ===================================
// 對話框主體內容
// ===================================
.dialog-body
  padding: $spacing-lg

  @include tablet
    padding: $spacing-xl

.dialog-message
  color: $text-primary
  line-height: 1.5
  font-size: 1rem

// ===================================
// 按鈕區域
// ===================================
.dialog-actions
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

// ===================================
// 對話框按鈕
// ===================================
.dialog-btn
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
</style>
