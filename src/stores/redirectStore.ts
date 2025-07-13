import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
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
  const currentUser = ref<any>(null)
  const isAuthenticated = ref(false)
  const error = ref<string | null>(null)

  // 寫日誌到畫面上
  const log = (type: 'info' | 'success' | 'error', message: string) => {
    if (globalDebugLogger) {
      globalDebugLogger(type, message)
    }
    // 也寫到 console 以防萬一
    console.log(`[STORE-${type.toUpperCase()}] ${message}`)
  }

  // 🔥 新增：設置認證狀態監聽器
  const setupAuthListener = () => {
    log('info', 'STORE: 設置認證狀態監聽器')

    onAuthStateChanged(auth, user => {
      if (user) {
        log('success', `STORE: 偵測到已登入用戶: ${user.email}`)
        currentUser.value = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
        isAuthenticated.value = true

        // 清除可能的登入標記
        localStorage.removeItem('mobile-login-pending')
        localStorage.removeItem('mobile-login-timestamp')
      } else {
        log('info', 'STORE: 沒有已登入用戶')
        currentUser.value = null
        isAuthenticated.value = false
      }

      isChecking.value = false
    })
  }

  // 🔥 新增：主要的認證檢查方法
  const checkAuthState = async () => {
    log('info', 'STORE: 開始檢查認證狀態')
    isChecking.value = true
    error.value = null

    try {
      // 先檢查當前用戶
      if (auth.currentUser) {
        log('success', `STORE: 發現當前已登入用戶: ${auth.currentUser.email}`)
        currentUser.value = {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL
        }
        isAuthenticated.value = true
        isChecking.value = false
        return { success: true, user: currentUser.value }
      }

      // 設置監聽器等待認證狀態變化
      setupAuthListener()

      // 等待一下看看是否有認證狀態變化
      log('info', 'STORE: 等待認證狀態變化...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (isAuthenticated.value) {
        log('success', 'STORE: 認證狀態監聽成功')
        return { success: true, user: currentUser.value }
      } else {
        log('info', 'STORE: 沒有偵測到登入狀態')
        return { success: true }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      log('error', `STORE: 檢查認證狀態失敗 - ${errorMsg}`)
      error.value = errorMsg
      return { success: false, error: errorMsg }
    }
  }

  // 🔥 保留原本的 redirect 檢查方法作為備用
  const checkRedirectResult = async () => {
    log('info', 'STORE: (備用) 開始檢查 redirect 結果')

    // 加入重試機制
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        log('info', `STORE: 第 ${attempt} 次嘗試...`)
        await new Promise(resolve => setTimeout(resolve, 1000)) // 等待 1 秒

        const result = await googleAuthService.checkRedirectResult()
        log('info', `STORE: 嘗試 ${attempt} 結果 = ${JSON.stringify(result)}`)

        if (result?.success && result.user) {
          log('success', `STORE: 第 ${attempt} 次成功！用戶: ${result.user.email}`)
          redirectResult.value = result
          return result
        }
      } catch (err) {
        log('error', `STORE: 第 ${attempt} 次失敗: ${err}`)
      }
    }

    log('info', 'STORE: 3 次嘗試都沒有用戶資料')
    redirectResult.value = { success: true }
    return { success: true }
  }

  return {
    isChecking,
    redirectResult,
    currentUser, // 🔥 新增
    isAuthenticated, // 🔥 新增
    error,
    checkRedirectResult,
    checkAuthState, // 🔥 新增：主要方法
    setupAuthListener // 🔥 新增
  }
})
