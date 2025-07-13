// src/services/googleAuthService.ts

import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  User as FirebaseUser,
  AuthError,
  // 引入 getAuth 以確保我們總是從已初始化的 Firebase app 實例獲取 Auth
  getAuth
} from 'firebase/auth'
import { auth } from '../firebase' // 假設這裡的 `auth` 是 `getAuth(firebaseApp)` 的結果
import type { User, AuthState } from '../types/fb-service'

// 引入你的日誌服務
import { addDebugLog } from './debugLogService' // 假設你已經創建了這個文件

// ===================================
// 型別定義
// ===================================

type AuthStateCallback = (authState: AuthState) => void

interface GoogleAuthServiceConfig {
  persistence?: boolean // 是否保持登入狀態
  autoSignIn?: boolean // 是否自動嘗試登入
}

// ===================================
// GoogleAuthService 類別
// ===================================

export class GoogleAuthService {
  private provider: GoogleAuthProvider
  private authStateCallbacks: Set<AuthStateCallback> = new Set()
  private currentAuthState: AuthState = {
    user: null,
    isLoading: true,
    isAuthenticated: false
  }
  config: GoogleAuthServiceConfig

  constructor(config: GoogleAuthServiceConfig = {}) {
    this.config = {
      persistence: true,
      autoSignIn: false,
      ...config
    }

    // 初始化 Google Auth Provider
    this.provider = new GoogleAuthProvider()

    // 設定 Google Auth 範圍
    this.provider.addScope('email')
    this.provider.addScope('profile')

    // 可選：設定語言
    this.provider.setCustomParameters({
      prompt: 'select_account' // 總是顯示帳號選擇器
    })

    // 監聽認證狀態變化
    this.initializeAuthStateListener()

    // 新增日誌：確認服務實例化
    addDebugLog('info', '[GoogleAuthService] 服務實例已建立。', { config: this.config })
  }

  // ===================================
  // 公開方法
  // ===================================

  /**
   * 裝置偵測
   */
  private isMobileDevice(): boolean {
    const userAgent = navigator.userAgent.toLowerCase()
    const mobileKeywords = ['android', 'iphone', 'ipad', 'mobile', 'tablet']

    const isMobile =
      mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
      window.innerWidth <= 768 ||
      'ontouchstart' in window
    addDebugLog('debug', `[GoogleAuthService] 裝置偵測: ${isMobile ? '行動裝置' : '桌面裝置'}`, {
      userAgent,
      innerWidth: window.innerWidth
    })
    return isMobile
  }

  /**
   * 智能 Google 登入 - 根據裝置選擇方式
   */
  async signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
    addDebugLog('info', '[GoogleAuthService] 嘗試 Google 登入...')
    try {
      this.setLoadingState(true)

      if (this.isMobileDevice()) {
        // 行動版：使用 redirect
        addDebugLog('info', '🔄 [GoogleAuthService] 行動版登入：使用 redirect 方式')
        await signInWithRedirect(auth, this.provider) // 'auth' 應該是一個 getAuth(firebaseApp) 的實例

        // redirect 不會立即返回結果，頁面會重新載入
        // 登入結果會在頁面重新載入後由 checkRedirectResult 處理
        addDebugLog('info', '🔄 [GoogleAuthService] signInWithRedirect 已觸發，等待頁面重新載入...')
        return { success: true }
      } else {
        // 桌面版：使用 popup
        addDebugLog('info', '💻 [GoogleAuthService] 桌面版登入：使用 popup 方式')
        const result = await signInWithPopup(auth, this.provider)
        const user = this.convertFirebaseUser(result.user)

        addDebugLog('info', '✅ [GoogleAuthService] Popup 登入成功！', {
          email: user.email,
          uid: user.uid
        })
        this.updateAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        })

        return { success: true, user }
      }
    } catch (error) {
      const authError = error as AuthError
      const errorMessage = this.getErrorMessage(authError)
      addDebugLog('error', `🚫 [GoogleAuthService] Google 登入失敗: ${errorMessage}`, {
        code: authError.code,
        originalError: error
      })

      this.updateAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * 檢查 redirect 結果（頁面載入時呼叫）
   */
  async checkRedirectResult(): Promise<{ success: boolean; user?: User; error?: string }> {
    addDebugLog('info', '🔍 [GoogleAuthService] 檢查 redirect 登入結果...')
    try {
      // 新增日誌：確認 auth 實例和其狀態
      const currentAuthInstance = getAuth() // 確保這裡使用的是當前初始化的 Auth 實例
      addDebugLog(
        'debug',
        `🔍 [GoogleAuthService] Auth 實例狀態: currentUser=${currentAuthInstance.currentUser ? currentAuthInstance.currentUser.email : 'null'}, appName=${currentAuthInstance.app.name}`
      )

      const result = await getRedirectResult(currentAuthInstance) // 使用 getAuth() 而不是直接使用 `auth` 變數

      // 新增日誌：更詳細地檢查 result
      if (result) {
        addDebugLog('info', '✅ [GoogleAuthService] 偵測到 redirect 結果 (非 null)。', {
          userEmail: result.user?.email,
          userUid: result.user?.uid
        })
      } else {
        addDebugLog('info', 'ℹ️ [GoogleAuthService] getRedirectResult() 返回 null。')
      }

      if (result && result.user) {
        addDebugLog('info', '🎉 [GoogleAuthService] 偵測到 redirect 登入結果並成功獲取用戶資訊！', {
          user: result.user.email,
          uid: result.user.uid
        })
        const user = this.convertFirebaseUser(result.user)

        this.updateAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        })

        return { success: true, user }
      } else {
        addDebugLog(
          'info',
          'ℹ️ [GoogleAuthService] 沒有有效的 redirect 結果（用戶未登入或結果為空）。'
        )
        return { success: true } // 這裡返回 success:true 但 user:null
      }
    } catch (error) {
      const authError = error as AuthError
      const errorMessage = this.getErrorMessage(authError)
      addDebugLog('error', `❌ [GoogleAuthService] 檢查 redirect 結果失敗: ${errorMessage}`, {
        code: authError.code,
        originalError: error
      })

      this.updateAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })

      return { success: false, error: errorMessage }
    }
  }

  /**
   * 登出
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    addDebugLog('info', '[GoogleAuthService] 嘗試登出...')
    try {
      this.setLoadingState(true)

      await signOut(auth)

      addDebugLog('info', '✅ [GoogleAuthService] 登出成功。')
      this.updateAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })

      return { success: true }
    } catch (error) {
      const authError = error as AuthError
      const errorMessage = this.getErrorMessage(authError)
      addDebugLog('error', `🚫 [GoogleAuthService] 登出失敗: ${errorMessage}`, {
        code: authError.code,
        originalError: error
      })

      this.updateAuthState({
        user: this.currentAuthState.user,
        isLoading: false,
        isAuthenticated: !!this.currentAuthState.user
      })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * 獲取當前認證狀態
   */
  getCurrentAuthState(): AuthState {
    addDebugLog('debug', '[GoogleAuthService] 獲取當前認證狀態。', { state: this.currentAuthState })
    return { ...this.currentAuthState }
  }

  /**
   * 獲取當前使用者
   */
  getCurrentUser(): User | null {
    addDebugLog('debug', '[GoogleAuthService] 獲取當前使用者。', {
      user: this.currentAuthState.user?.uid
    })
    return this.currentAuthState.user
  }

  /**
   * 檢查是否已認證
   */
  isAuthenticated(): boolean {
    addDebugLog('debug', '[GoogleAuthService] 檢查是否已認證。', {
      isAuthenticated: this.currentAuthState.isAuthenticated
    })
    return this.currentAuthState.isAuthenticated
  }

  /**
   * 檢查是否正在載入
   */
  isLoading(): boolean {
    addDebugLog('debug', '[GoogleAuthService] 檢查是否正在載入。', {
      isLoading: this.currentAuthState.isLoading
    })
    return this.currentAuthState.isLoading
  }

  /**
   * 訂閱認證狀態變化
   */
  onAuthStateChanged(callback: AuthStateCallback): () => void {
    addDebugLog('debug', '[GoogleAuthService] 訂閱認證狀態變化。')
    this.authStateCallbacks.add(callback)

    // 立即回調當前狀態
    callback(this.currentAuthState)

    // 返回取消訂閱函數
    return () => {
      this.authStateCallbacks.delete(callback)
      addDebugLog('debug', '[GoogleAuthService] 取消訂閱認證狀態變化。')
    }
  }

  /**
   * 強制重新載入使用者資訊
   */
  async reloadUser(): Promise<void> {
    addDebugLog('info', '[GoogleAuthService] 嘗試重新載入使用者資訊...')
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload()
        const user = this.convertFirebaseUser(auth.currentUser)
        addDebugLog('info', '[GoogleAuthService] 使用者資訊重新載入成功。', { uid: user.uid })
        this.updateAuthState({
          ...this.currentAuthState,
          user
        })
      } catch (error) {
        addDebugLog('error', `🚫 [GoogleAuthService] 重新載入使用者資訊失敗: ${error}`, {
          originalError: error
        })
      }
    } else {
      addDebugLog('warn', '[GoogleAuthService] 無法重新載入使用者資訊：沒有當前用戶。')
    }
  }

  /**
   * 檢查 Firebase 配置狀態
   */
  isConfigured(): boolean {
    const configured = !!(auth && auth.app)
    addDebugLog('debug', `[GoogleAuthService] Firebase 是否配置: ${configured}`)
    return configured
  }

  // ===================================
  // 私有方法
  // ===================================

  /**
   * 初始化認證狀態監聽器
   */
  private initializeAuthStateListener(): void {
    addDebugLog('info', '[GoogleAuthService] 初始化認證狀態監聽器...')
    onAuthStateChanged(auth, firebaseUser => {
      if (firebaseUser) {
        const user = this.convertFirebaseUser(firebaseUser)
        addDebugLog('info', `✅ [GoogleAuthService] Auth 狀態變化: 已登入 (${user.email})`)
        this.updateAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        })
      } else {
        addDebugLog('info', 'ℹ️ [GoogleAuthService] Auth 狀態變化: 未登入')
        this.updateAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    })
  }

  /**
   * 轉換 Firebase 使用者為應用程式使用者格式
   */
  private convertFirebaseUser(firebaseUser: FirebaseUser): User {
    // 這裡不需要太多的日誌，除非你懷疑轉換有問題
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL
    }
  }

  /**
   * 更新認證狀態並通知訂閱者
   */
  private updateAuthState(newState: AuthState): void {
    addDebugLog('debug', '[GoogleAuthService] 更新認證狀態並通知訂閱者。', { newState })
    this.currentAuthState = { ...newState }

    // 通知所有訂閱者
    this.authStateCallbacks.forEach(callback => {
      try {
        callback(this.currentAuthState)
      } catch (error) {
        console.error('認證狀態回調執行失敗:', error)
        addDebugLog('error', `🚫 [GoogleAuthService] 認證狀態回調執行失敗: ${error}`, {
          originalError: error
        })
      }
    })
  }

  /**
   * 設定載入狀態
   */
  private setLoadingState(isLoading: boolean): void {
    addDebugLog('debug', `[GoogleAuthService] 設定載入狀態為: ${isLoading}`)
    this.updateAuthState({
      ...this.currentAuthState,
      isLoading
    })
  }

  /**
   * 獲取友善的錯誤訊息
   */
  private getErrorMessage(error: AuthError): string {
    const defaultMessage = `登入失敗: ${error.message}`
    let friendlyMessage: string

    switch (error.code) {
      case 'auth/cancelled-popup-request':
      case 'auth/popup-closed-by-user':
        friendlyMessage = '登入已取消'
        break
      case 'auth/popup-blocked':
        friendlyMessage = '登入彈窗被封鎖，已改用重導向方式'
        break
      case 'auth/redirect-cancelled-by-user':
        friendlyMessage = '登入已取消'
        break
      case 'auth/redirect-operation-pending':
        friendlyMessage = '登入處理中，請稍候'
        break
      case 'auth/unauthorized-domain':
        friendlyMessage = '網域未授權，請聯絡管理員'
        break
      case 'auth/network-request-failed':
        friendlyMessage = '網路連線失敗，請檢查網路狀態'
        break
      case 'auth/too-many-requests':
        friendlyMessage = '登入嘗試次數過多，請稍後再試'
        break
      case 'auth/user-disabled':
        friendlyMessage = '此帳號已被停用'
        break
      case 'auth/operation-not-allowed':
        friendlyMessage = 'Google 登入未啟用，請聯絡管理員'
        break
      case 'auth/invalid-api-key':
        friendlyMessage = 'Firebase 配置錯誤'
        break
      case 'auth/app-deleted':
        friendlyMessage = 'Firebase 應用程式配置錯誤'
        break
      default:
        addDebugLog('error', `未知認證錯誤: ${error.code}`, { originalError: error })
        friendlyMessage = defaultMessage
        break
    }
    addDebugLog('error', `[GoogleAuthService] 錯誤訊息: ${friendlyMessage}`, {
      errorCode: error.code
    })
    return friendlyMessage
  }
}

// ===================================
// 預設匯出單例實例
// ===================================

export const googleAuthService = new GoogleAuthService({
  persistence: true,
  autoSignIn: false
})

export default googleAuthService
