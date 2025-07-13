import { defineStore } from 'pinia'
import { ref } from 'vue'
import { googleAuthService } from '../services/googleAuthService'

// 定義一個全域的 debug logger，讓 Store 也能寫到畫面上
let globalDebugLogger: ((type: 'info' | 'success' | 'error', message: string) => void) | null = null

export const setGlobalDebugLogger = (
  logger: (type: 'info' | 'success' | 'error', message: string) => void
) => {
  globalDebugLogger = logger
}

export const useRedirectStore = defineStore('redirect', () => {
  const isChecking = ref(false)
  const redirectResult = ref<any>(null)
  const error = ref<string | null>(null)

  // 寫日誌到畫面上
  const log = (type: 'info' | 'success' | 'error', message: string) => {
    if (globalDebugLogger) {
      globalDebugLogger(type, message)
    }
    // 也寫到 console 以防萬一
    console.log(`[STORE-${type.toUpperCase()}] ${message}`)
  }

  // 只負責檢查 redirect 結果
  const checkRedirectResult = async () => {
    log('info', 'STORE: 開始檢查 redirect 結果')
    isChecking.value = true
    error.value = null

    try {
      log('info', 'STORE: 呼叫 googleAuthService.checkRedirectResult()...')
      const result = await googleAuthService.checkRedirectResult()

      log('info', `STORE: 原始結果 = ${JSON.stringify(result, null, 2)}`)

      if (result?.success) {
        if (result.user) {
          log('success', `STORE: 登入成功！用戶: ${result.user.email}`)
        } else {
          log('info', 'STORE: 檢查完成，但沒有用戶資料（正常情況）')
        }
      } else {
        log('error', `STORE: 檢查失敗 - ${result?.error || '未知錯誤'}`)
      }

      redirectResult.value = result
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      log('error', `STORE: 例外錯誤 - ${errorMsg}`)
      error.value = errorMsg
      return null
    } finally {
      isChecking.value = false
      log('info', 'STORE: 檢查完成')
    }
  }

  return {
    isChecking,
    redirectResult,
    error,
    checkRedirectResult
  }
})
