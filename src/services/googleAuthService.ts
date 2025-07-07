// src/services/googleAuthService.ts

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth'
import { auth } from '../firebase'
import type { User, AuthState } from '../types/fb-service'

// ===================================
// 型別定義
// ===================================

type AuthStateCallback = (authState: AuthState) => void

interface GoogleAuthServiceConfig {
  persistence?: boolean // 是否保持登入狀態
  autoSignIn?: boolean  // 是否自動嘗試登入
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
  }

  // ===================================
  // 公開方法
  // ===================================

  /**
   * 使用 Google 登入
   */
  async signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      this.setLoadingState(true)

      const result = await signInWithPopup(auth, this.provider)
      const user = this.convertFirebaseUser(result.user)

      this.updateAuthState({
        user,
        isLoading: false,
        isAuthenticated: true
      })

      return {
        success: true,
        user
      }
    } catch (error) {
      const authError = error as AuthError
      const errorMessage = this.getErrorMessage(authError)

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
   * 登出
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      this.setLoadingState(true)

      await signOut(auth)

      this.updateAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })

      return { success: true }
    } catch (error) {
      const authError = error as AuthError

      this.updateAuthState({
        user: this.currentAuthState.user,
        isLoading: false,
        isAuthenticated: !!this.currentAuthState.user
      })

      return {
        success: false,
        error: this.getErrorMessage(authError)
      }
    }
  }

  /**
   * 獲取當前認證狀態
   */
  getCurrentAuthState(): AuthState {
    return { ...this.currentAuthState }
  }

  /**
   * 獲取當前使用者
   */
  getCurrentUser(): User | null {
    return this.currentAuthState.user
  }

  /**
   * 檢查是否已認證
   */
  isAuthenticated(): boolean {
    return this.currentAuthState.isAuthenticated
  }

  /**
   * 檢查是否正在載入
   */
  isLoading(): boolean {
    return this.currentAuthState.isLoading
  }

  /**
   * 訂閱認證狀態變化
   */
  onAuthStateChanged(callback: AuthStateCallback): () => void {
    this.authStateCallbacks.add(callback)

    // 立即回調當前狀態
    callback(this.currentAuthState)

    // 返回取消訂閱函數
    return () => {
      this.authStateCallbacks.delete(callback)
    }
  }

  /**
   * 強制重新載入使用者資訊
   */
  async reloadUser(): Promise<void> {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload()
        const user = this.convertFirebaseUser(auth.currentUser)
        this.updateAuthState({
          ...this.currentAuthState,
          user
        })
      } catch (error) {
        console.error('重新載入使用者資訊失敗:', error)
      }
    }
  }

  /**
   * 檢查 Firebase 配置狀態
   */
  isConfigured(): boolean {
    return !!(auth && auth.app)
  }

  // ===================================
  // 私有方法
  // ===================================

  /**
   * 初始化認證狀態監聽器
   */
  private initializeAuthStateListener(): void {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user = this.convertFirebaseUser(firebaseUser)
        this.updateAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        })
      } else {
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
    this.currentAuthState = { ...newState }

    // 通知所有訂閱者
    this.authStateCallbacks.forEach(callback => {
      try {
        callback(this.currentAuthState)
      } catch (error) {
        console.error('認證狀態回調執行失敗:', error)
      }
    })
  }

  /**
   * 設定載入狀態
   */
  private setLoadingState(isLoading: boolean): void {
    this.updateAuthState({
      ...this.currentAuthState,
      isLoading
    })
  }

  /**
   * 獲取友善的錯誤訊息
   */
  private getErrorMessage(error: AuthError): string {
    switch (error.code) {
      case 'auth/cancelled-popup-request':
      case 'auth/popup-closed-by-user':
        return '登入已取消'
      case 'auth/popup-blocked':
        return '登入彈窗被封鎖，請允許彈窗後重試'
      case 'auth/network-request-failed':
        return '網路連線失敗，請檢查網路狀態'
      case 'auth/too-many-requests':
        return '登入嘗試次數過多，請稍後再試'
      case 'auth/user-disabled':
        return '此帳號已被停用'
      case 'auth/operation-not-allowed':
        return 'Google 登入未啟用，請聯絡管理員'
      case 'auth/invalid-api-key':
        return 'Firebase 配置錯誤'
      case 'auth/app-deleted':
        return 'Firebase 應用程式配置錯誤'
      default:
        console.error('認證錯誤:', error)
        return `登入失敗: ${error.message}`
    }
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