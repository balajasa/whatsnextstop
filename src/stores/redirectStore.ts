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

    // 🔥 加入重試機制
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        log('info', `STORE: 第 ${attempt} 次嘗試...`)
        await new Promise(resolve => setTimeout(resolve, 1000)) // 等待 1 秒

        const result = await googleAuthService.checkRedirectResult()
        log('info', `STORE: 嘗試 ${attempt} 結果 = ${JSON.stringify(result)}`)

        if (result?.success && result.user) {
          log('success', `STORE: 第 ${attempt} 次成功！用戶: ${result.user.email}`)
          return result
        }
      } catch (err) {
        log('error', `STORE: 第 ${attempt} 次失敗: ${err}`)
      }
    }

    log('info', 'STORE: 3 次嘗試都沒有用戶資料')
    return { success: true }
  }
  return {
    isChecking,
    redirectResult,
    error,
    checkRedirectResult
  }
})
