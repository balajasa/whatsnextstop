// ===================================
// 對話框系統型別定義
// ===================================

// 對話框類型
export type DialogType = 'confirm' | 'alert' | 'custom'

// 對話框結果
export type DialogResult = boolean | any

// 確認對話框選項
export interface ConfirmDialogOptions {
  /** 標題 */
  title?: string
  /** 訊息內容 */
  message?: string
  /** 確認按鈕文字 */
  confirmText?: string
  /** 取消按鈕文字 */
  cancelText?: string
  /** 點擊遮罩是否關閉 */
  closeOnOverlay?: boolean
  /** 是否顯示載入狀態 */
  loading?: boolean
}

// 警告對話框選項
export interface AlertDialogOptions {
  /** 標題 */
  title?: string
  /** 訊息內容 */
  message: string
  /** 確認按鈕文字 */
  confirmText?: string
  /** 點擊遮罩是否關閉 */
  closeOnOverlay?: boolean
}

// 自定義對話框選項
export interface CustomDialogOptions {
  /** 要渲染的元件 */
  component: any
  /** 傳遞給元件的 props */
  props?: Record<string, any>
  /** 點擊遮罩是否關閉 */
  closeOnOverlay?: boolean
}

// 對話框實例
export interface DialogInstance {
  /** 唯一識別碼 */
  id: string
  /** 對話框類型 */
  type: DialogType
  /** 對話框選項 */
  options: ConfirmDialogOptions | AlertDialogOptions | CustomDialogOptions
  /** Promise resolve 函數 */
  resolve: (value: DialogResult) => void
  /** Promise reject 函數 */
  reject: (reason?: any) => void
  /** 是否可見 */
  visible: boolean
  /** 載入狀態 */
  loading: boolean
}

// 對話框狀態管理
export interface DialogState {
  /** 當前活躍的對話框實例 */
  dialogs: DialogInstance[]
  /** 是否有對話框開啟 */
  hasOpenDialog: boolean
}

// 對話框服務
export interface DialogService {
  /** 確認對話框 */
  confirm(options: ConfirmDialogOptions): Promise<boolean>
  /** 警告對話框 */
  alert(options: AlertDialogOptions): Promise<void>
  /** 自定義對話框 */
  custom<T = any>(options: CustomDialogOptions): Promise<T>
  /** 關閉所有對話框 */
  closeAll(): void
  /** 關閉指定對話框 */
  close(id: string): void
}

// 對話框事件
export interface DialogEvents {
  /** 確認事件 */
  confirm: (id: string, result?: any) => void
  /** 取消事件 */
  cancel: (id: string) => void
  /** 關閉事件 */
  close: (id: string) => void
}

// 提取對話框選項型別
export type ExtractDialogOptions<T extends DialogType> = T extends 'confirm'
  ? ConfirmDialogOptions
  : T extends 'alert'
    ? AlertDialogOptions
    : T extends 'custom'
      ? CustomDialogOptions
      : never

// 提取對話框結果型別
export type ExtractDialogResult<T extends DialogType> = T extends 'confirm'
  ? boolean
  : T extends 'alert'
    ? void
    : T extends 'custom'
      ? any
      : never
