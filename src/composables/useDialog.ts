// src/composables/useDialog.ts

import { reactive } from 'vue'
import type {
  DialogInstance,
  DialogState,
  DialogService,
  ConfirmDialogOptions,
  AlertDialogOptions,
  CustomDialogOptions,
  DialogResult
} from '../types/common/dialog'

// ===================================
// 全域狀態
// ===================================

/** 對話框狀態 */
const dialogState: DialogState = reactive<DialogState>({
  dialogs: [],
  get hasOpenDialog(): boolean {
    return this.dialogs.length > 0
  }
})

/** 對話框 ID 計數器 */
let dialogIdCounter = 0

// ===================================
// 工具函數
// ===================================

/** 生成唯一 ID */
const generateDialogId = (): string => {
  return `dialog_${++dialogIdCounter}_${Date.now()}`
}

/** 創建對話框實例 */
const createDialogInstance = <T extends DialogResult>(
  type: DialogInstance['type'],
  options: DialogInstance['options']
): { instance: DialogInstance; promise: Promise<T> } => {
  const id = generateDialogId()

  let resolvePromise: (value: T) => void
  let rejectPromise: (reason?: any) => void

  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  const instance: DialogInstance = {
    id,
    type,
    options,
    resolve: resolvePromise!,
    reject: rejectPromise!,
    visible: false,
    loading: false
  }

  return { instance, promise }
}

/** 移除對話框實例 */
const removeDialogInstance = (id: string): void => {
  const index = dialogState.dialogs.findIndex(dialog => dialog.id === id)
  if (index > -1) {
    dialogState.dialogs.splice(index, 1)
  }
}

/** 尋找對話框實例 */
const findDialogInstance = (id: string): DialogInstance | undefined => {
  return dialogState.dialogs.find(dialog => dialog.id === id)
}

// ===================================
// 對話框操作
// ===================================

/** 顯示對話框 */
const showDialog = async <T extends DialogResult>(
  type: DialogInstance['type'],
  options: DialogInstance['options']
): Promise<T> => {
  const { instance, promise } = createDialogInstance<T>(type, options)

  // 添加到狀態中
  dialogState.dialogs.push(instance)

  // 下一個 tick 後顯示（確保 DOM 已更新）
  await new Promise(resolve => setTimeout(resolve, 0))
  instance.visible = true

  // 設置自動清理
  promise
    .finally(() => {
      instance.visible = false
      // 動畫結束後移除實例
      setTimeout(() => {
        removeDialogInstance(instance.id)
      }, 200) // 等待退出動畫
    })
    .catch(() => {
      // 防止未捕獲的 Promise rejection
    })

  return promise
}

/** 確認對話框操作 */
const handleConfirm = (id: string, result?: any): void => {
  const instance = findDialogInstance(id)
  if (instance) {
    instance.resolve(result ?? true)
  }
}

/** 取消對話框操作 */
const handleCancel = (id: string): void => {
  const instance = findDialogInstance(id)
  if (instance) {
    instance.resolve(false)
  }
}

/** 關閉對話框操作 */
const handleClose = (id: string): void => {
  const instance = findDialogInstance(id)
  if (instance) {
    instance.resolve(false)
  }
}

/** 設置載入狀態 */
const setLoading = (id: string, loading: boolean): void => {
  const instance = findDialogInstance(id)
  if (instance) {
    instance.loading = loading
  }
}

// ===================================
// 對話框服務實作
// ===================================

/** 確認對話框 */
const confirm = async (options: ConfirmDialogOptions): Promise<boolean> => {
  const defaultOptions: ConfirmDialogOptions = {
    title: '確認',
    message: '確定要執行此操作嗎？',
    confirmText: '確認',
    cancelText: '取消',
    closeOnOverlay: true,
    loading: false
  }

  const mergedOptions = { ...defaultOptions, ...options }
  return await showDialog<boolean>('confirm', mergedOptions)
}

/** 警告對話框 */
const alert = async (options: AlertDialogOptions): Promise<void> => {
  const defaultOptions: Partial<AlertDialogOptions> = {
    title: '提示',
    confirmText: '確認',
    closeOnOverlay: true
  }

  const mergedOptions = { ...defaultOptions, ...options }
  await showDialog<void>('alert', mergedOptions)
}

/** 自定義對話框 */
const custom = async <T = any>(options: CustomDialogOptions): Promise<T> => {
  const defaultOptions: Partial<CustomDialogOptions> = {
    closeOnOverlay: true
  }

  const mergedOptions = { ...defaultOptions, ...options }
  return await showDialog<T>('custom', mergedOptions)
}

/** 關閉所有對話框 */
const closeAll = (): void => {
  dialogState.dialogs.forEach((dialog: DialogInstance) => {
    dialog.resolve(false)
  })
}

/** 關閉指定對話框 */
const close = (id: string): void => {
  handleClose(id)
}

// ===================================
// 對話框服務物件
// ===================================

const dialogService: DialogService = {
  confirm,
  alert,
  custom,
  closeAll,
  close
}

// ===================================
// Composable 主函數
// ===================================

/**
 * 對話框服務 Hook
 * @returns 對話框服務和狀態
 */
export const useDialog = () => {
  return {
    // 對話框服務方法
    ...dialogService,

    // 狀態（只讀）
    state: readonly(dialogState),

    // 內部方法（供 DialogProvider 使用）
    _internal: {
      handleConfirm,
      handleCancel,
      handleClose,
      setLoading,
      findDialogInstance
    }
  }
}

// ===================================
// 只讀狀態工具
// ===================================

/** 創建只讀響應式物件 */
function readonly<T extends object>(obj: T): Readonly<T> {
  return new Proxy(obj, {
    set(): boolean {
      console.warn('Dialog state is readonly')
      return false
    },
    deleteProperty(): boolean {
      console.warn('Dialog state is readonly')
      return false
    }
  }) as Readonly<T>
}

// ===================================
// 型別導出
// ===================================

export type { DialogService, DialogInstance, DialogState }
