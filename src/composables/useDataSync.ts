// src/composables/useDataSync.ts

import { ref, computed, onBeforeUnmount, readonly } from 'vue'
import { localStorageService } from '../services/localStorageService'
import { googleAuthService } from '../services/googleAuthService'
import { firebaseStorageService } from '../services/firebaseStorageService'
import type { CheckItem } from '../types/check-item'
import type { User, AuthState, SyncStatus, SyncState, DataSyncOptions } from '../types/fb-service'

// ===================================
// useDataSync Composable
// ===================================

export function useDataSync(options: DataSyncOptions = {}) {
  // ===================================
  // 響應式狀態
  // ===================================

  const items = ref<CheckItem[]>([])
  const syncStatus = ref<SyncStatus>('offline')
  const lastSyncTime = ref<Date | null>(null)
  const hasLocalChanges = ref<boolean>(false)
  const hasRemoteChanges = ref<boolean>(false)
  const authState = ref<AuthState>({
    user: null,
    isLoading: false, // 預設不載入
    isAuthenticated: false
  })
  const isOnlineMode = ref<boolean>(false) // 預設本地模式

  // 配置選項
  const config = {
    autoSync: false, // 預設不自動同步
    syncInterval: 30000,
    conflictResolution: 'local' as const,
    ...options
  }

  // 清理函數
  const cleanupFunctions: (() => void)[] = []

  // ===================================
  // 計算屬性
  // ===================================

  const syncState = computed<SyncState>(() => ({
    status: syncStatus.value,
    lastSyncTime: lastSyncTime.value,
    hasLocalChanges: hasLocalChanges.value,
    hasRemoteChanges: hasRemoteChanges.value
  }))

  const currentUser = computed<User | null>(() => authState.value.user)

  const isAuthenticated = computed<boolean>(() => authState.value.isAuthenticated)

  const canSyncToCloud = computed<boolean>(
    () => isAuthenticated.value && !authState.value.isLoading
  )

  const syncModeText = computed<string>(() => (isOnlineMode.value ? '雲端模式' : '本地模式'))

  // ===================================
  // 認證相關方法
  // ===================================

  /**
   * Google 登入並切換到雲端模式
   */
  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      authState.value.isLoading = true

      const result = await googleAuthService.signInWithGoogle()

      if (result.success && result.user) {
        // 更新認證狀態
        authState.value = {
          user: result.user,
          isLoading: false,
          isAuthenticated: true
        }

        // 登入成功後自動同步到雲端
        await switchToCloudMode()
      } else {
        authState.value.isLoading = false
      }

      return result
    } catch (error) {
      console.error('登入失敗:', error)
      authState.value.isLoading = false
      return {
        success: false,
        error: error instanceof Error ? error.message : '登入失敗'
      }
    }
  }

  /**
   * 登出並切換到本地模式
   */
  const signOut = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // 只需要呼叫 googleAuthService.signOut()
      // 狀態更新會由 onAuthStateChanged 監聽器處理
      const result = await googleAuthService.signOut()
      return result
    } catch (error) {
      console.error('登出失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '登出失敗'
      }
    }
  }

  // ===================================
  // 資料同步方法
  // ===================================

  /**
   * 儲存項目 (根據模式決定儲存位置)
   */
  const saveItems = async (newItems: CheckItem[]): Promise<boolean> => {
    items.value = [...newItems]

    try {
      if (isOnlineMode.value && canSyncToCloud.value) {
        // 雲端模式：同時儲存到本地和雲端
        syncStatus.value = 'syncing'

        const [localSuccess, cloudSuccess] = await Promise.all([
          Promise.resolve(localStorageService.saveItems(newItems)),
          firebaseStorageService.saveItems(newItems)
        ])

        if (cloudSuccess && localSuccess) {
          hasLocalChanges.value = false
          lastSyncTime.value = new Date()
          syncStatus.value = 'synced'
        } else {
          syncStatus.value = 'error'
        }

        return localSuccess && cloudSuccess
      } else {
        // 本地模式：只儲存到本地
        const success = localStorageService.saveItems(newItems)
        if (success) {
          hasLocalChanges.value = true // 標記有本地變更
        }
        return success
      }
    } catch (error) {
      console.error('儲存項目失敗:', error)
      syncStatus.value = 'error'
      return false
    }
  }

  /**
   * 手動同步到雲端
   */
  const syncToCloud = async (): Promise<{ success: boolean; error?: string }> => {
    if (!canSyncToCloud.value) {
      return {
        success: false,
        error: '使用者未登入'
      }
    }

    try {
      syncStatus.value = 'syncing'

      const localItems = localStorageService.loadItems()
      const success = await firebaseStorageService.saveItems(localItems)

      if (success) {
        items.value = localItems
        hasLocalChanges.value = false

        // 獲取真實的更新時間
        const metadata = await firebaseStorageService.getMetadata()
        lastSyncTime.value = metadata?.lastUpdated || new Date()
        syncStatus.value = 'synced'

        return { success: true }
      } else {
        syncStatus.value = 'error'
        return {
          success: false,
          error: '同步到雲端失敗'
        }
      }
    } catch (error) {
      console.error('同步到雲端失敗:', error)
      syncStatus.value = 'error'
      return {
        success: false,
        error: error instanceof Error ? error.message : '同步失敗'
      }
    }
  }

  /**
   * 從雲端同步
   */
  const syncFromCloud = async (): Promise<{ success: boolean; error?: string }> => {
    if (!canSyncToCloud.value) {
      return {
        success: false,
        error: '使用者未登入'
      }
    }

    try {
      syncStatus.value = 'syncing'

      // 同時從雲端載入資料和 metadata
      const [cloudItems, metadata] = await Promise.all([
        firebaseStorageService.loadItems(),
        firebaseStorageService.getMetadata()
      ])

      const localSuccess = localStorageService.saveItems(cloudItems)

      if (localSuccess) {
        items.value = cloudItems
        hasRemoteChanges.value = false
        // 使用真實的更新時間，而不是當前時間
        lastSyncTime.value = metadata?.lastUpdated || new Date()
        syncStatus.value = 'synced'

        return { success: true }
      } else {
        syncStatus.value = 'error'
        return {
          success: false,
          error: '儲存到本地失敗'
        }
      }
    } catch (error) {
      console.error('從雲端同步失敗:', error)
      syncStatus.value = 'error'
      return {
        success: false,
        error: error instanceof Error ? error.message : '同步失敗'
      }
    }
  }

  // ===================================
  // 模式切換方法
  // ===================================

  /**
   * 切換到雲端模式
   */
  const switchToCloudMode = async (): Promise<void> => {
    if (!canSyncToCloud.value) {
      console.warn('無法切換到雲端模式：使用者未登入')
      return
    }

    try {
      isOnlineMode.value = true
      syncStatus.value = 'syncing'

      // 設定使用者到 Firebase 服務
      firebaseStorageService.setCurrentUser(currentUser.value)

      // 開始即時同步
      firebaseStorageService.startRealTimeSync()

      // 啟動雲端資料監聽
      const unsubscribeData = firebaseStorageService.onDataChanged((cloudItems: CheckItem[]) => {
        if (isOnlineMode.value) {
          // 檢查是否有遠端變化
          const currentItemsJson = JSON.stringify(
            items.value.sort((a: CheckItem, b: CheckItem) => a.id - b.id)
          )
          const cloudItemsJson = JSON.stringify(
            cloudItems.sort((a: CheckItem, b: CheckItem) => a.id - b.id)
          )

          if (currentItemsJson !== cloudItemsJson) {
            hasRemoteChanges.value = true

            // 根據衝突解決策略處理
            if (config.conflictResolution === 'remote') {
              items.value = cloudItems
              hasRemoteChanges.value = false
            }
          }
        }
      })
      cleanupFunctions.push(unsubscribeData)

      // 雲端優先：直接載入雲端資料（不再上傳本地）
      await loadItems()
    } catch (error) {
      console.error('切換到雲端模式失敗:', error)
      syncStatus.value = 'error'
    }
  }

  /**
   * 切換到本地模式
   */
  const switchToLocalMode = async (): Promise<void> => {
    try {
      isOnlineMode.value = false
      syncStatus.value = 'offline'

      // 停止即時同步
      firebaseStorageService.stopRealTimeSync()

      // 清除使用者
      firebaseStorageService.setCurrentUser(null)

      // 載入本地資料
      await loadItems()
    } catch (error) {
      console.error('切換到本地模式失敗:', error)
    }
  }

  // ===================================
  // 工具方法
  // ===================================

  /**
   * 清除所有資料
   */
  const clearAllData = async (): Promise<boolean> => {
    try {
      // 清除本地資料
      const localSuccess = localStorageService.clearItems()

      // 如果是雲端模式，也清除雲端資料
      if (isOnlineMode.value && canSyncToCloud.value) {
        const cloudSuccess = await firebaseStorageService.clearItems()
        const success = localSuccess && cloudSuccess

        if (success) {
          items.value = []
          hasLocalChanges.value = false
          hasRemoteChanges.value = false
        }

        return success
      } else {
        // 本地模式只清除本地資料
        if (localSuccess) {
          items.value = []
          hasLocalChanges.value = false
          hasRemoteChanges.value = false
        }

        return localSuccess
      }
    } catch (error) {
      console.error('清除所有資料失敗:', error)
      return false
    }
  }

  /**
   * 匯出資料
   */
  const exportData = async (): Promise<string | null> => {
    try {
      if (isOnlineMode.value && canSyncToCloud.value) {
        return await firebaseStorageService.exportData()
      } else {
        return localStorageService.exportData()
      }
    } catch (error) {
      console.error('匯出資料失敗:', error)
      return null
    }
  }

  /**
   * 匯入資料
   */
  const importData = async (jsonData: string): Promise<boolean> => {
    try {
      if (isOnlineMode.value && canSyncToCloud.value) {
        const success = await firebaseStorageService.importData(jsonData)
        if (success) {
          await loadItems()
        }
        return success
      } else {
        const success = localStorageService.importData(jsonData)
        if (success) {
          await loadItems()
        }
        return success
      }
    } catch (error) {
      console.error('匯入資料失敗:', error)
      return false
    }
  }

  // ===================================
  // 生命週期管理
  // ===================================

  /**
   * 載入項目 (根據模式決定載入來源，包含真實更新時間)
   */
  const loadItems = async (): Promise<CheckItem[]> => {
    try {
      let loadedItems: CheckItem[] = []

      if (isOnlineMode.value && canSyncToCloud.value) {
        // 雲端模式：載入項目和 metadata
        const [items, metadata] = await Promise.all([
          firebaseStorageService.loadItems(),
          firebaseStorageService.getMetadata()
        ])

        if (items.length > 0) {
          // 從雲端載入成功，使用真實的更新時間
          loadedItems = items
          lastSyncTime.value = metadata?.lastUpdated || new Date()
          syncStatus.value = 'synced'
        } else {
          // 如果雲端沒有資料，從本地載入
          loadedItems = localStorageService.loadItems()

          // 如果本地有資料，同步到雲端
          if (loadedItems.length > 0) {
            await firebaseStorageService.saveItems(loadedItems)
            hasLocalChanges.value = false
            // 重新獲取更新後的 metadata
            const newMetadata = await firebaseStorageService.getMetadata()
            lastSyncTime.value = newMetadata?.lastUpdated || new Date()
            syncStatus.value = 'synced'
          }
        }
      } else {
        // 本地模式：只從本地載入
        loadedItems = localStorageService.loadItems()
      }

      items.value = loadedItems
      return loadedItems
    } catch (error) {
      console.error('載入項目失敗:', error)
      return []
    }
  }

  /**
   * 初始化本地模式 (不啟動雲端功能)
   */
  const initialize = async (): Promise<void> => {
    try {
      // 監聽認證狀態變化
      const unsubscribeAuth = googleAuthService.onAuthStateChanged(newAuthState => {
        authState.value = newAuthState

        // 如果登出，自動切換到本地模式
        if (!newAuthState.isAuthenticated && isOnlineMode.value) {
          // console.log('偵測到登出，切換到本地模式')
          switchToLocalMode()
        }
      })
      cleanupFunctions.push(unsubscribeAuth)

      // 只載入本地資料
      await loadItems()
    } catch (error) {
      console.error('初始化失敗:', error)
    }
  }

  /**
   * 手動啟動雲端功能 (供「同步到雲端」按鈕使用)
   */
  const initializeCloudSync = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // 如果未登入，先登入
      if (!isAuthenticated.value) {
        const loginResult = await signInWithGoogle()
        return loginResult
      } else {
        // 已登入，直接切換到雲端模式
        await switchToCloudMode()
        return { success: true }
      }
    } catch (error) {
      console.error('啟動雲端同步失敗:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '啟動雲端同步失敗'
      }
    }
  }

  /**
   * 清理資源
   */
  const cleanup = (): void => {
    cleanupFunctions.forEach(fn => fn())
    cleanupFunctions.length = 0
    firebaseStorageService.stopRealTimeSync()
  }

  // 組件卸載時清理
  onBeforeUnmount(cleanup)

  // ===================================
  // 回傳 API
  // ===================================

  return {
    // 狀態
    items: readonly(items),
    syncState: readonly(syncState),
    authState: readonly(authState),
    isOnlineMode: readonly(isOnlineMode),
    canSyncToCloud: readonly(canSyncToCloud),
    syncModeText: readonly(syncModeText),
    currentUser: readonly(currentUser),
    isAuthenticated: readonly(isAuthenticated),

    // 認證方法
    signInWithGoogle,
    signOut,

    // 資料同步方法
    saveItems,
    loadItems,
    syncToCloud,
    syncFromCloud,

    // 模式切換
    switchToCloudMode,
    switchToLocalMode,

    // 工具方法
    clearAllData,
    exportData,
    importData,

    // 生命週期
    initialize,
    initializeCloudSync, // 新增：手動啟動雲端同步

    cleanup
  }
}

export default useDataSync
