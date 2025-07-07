// src/types/fb-service.ts
// 服務層相關的型別定義

import type { CheckItem } from './check-item'

// ===================================
// 使用者相關型別
// ===================================

// Firebase 使用者介面
export interface FirebaseUser {
  uid: string
  isAnonymous: boolean
}

// 擴展的使用者介面
export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// ===================================
// 同步狀態型別
// ===================================

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error'

export type ConnectionStatus = 'connecting' | 'connected' | 'offline'

export interface SyncState {
  status: SyncStatus
  lastSyncTime: Date | null
  hasLocalChanges: boolean
  hasRemoteChanges: boolean
}

export interface DataSyncOptions {
  autoSync?: boolean
  syncInterval?: number
  conflictResolution?: 'local' | 'remote' | 'manual'
}

// ===================================
// useDataSync 相關型別
// ===================================

export interface DataSyncState {
  items: CheckItem[]
  syncState: SyncState
  authState: AuthState
  isOnlineMode: boolean
}

export type SyncMode = 'local' | 'cloud'

// ===================================
// 服務介面定義
// ===================================

export interface IStorageService {
  saveItems(items: CheckItem[]): boolean | Promise<boolean>
  loadItems(): CheckItem[] | Promise<CheckItem[]>
  clearItems(): boolean | Promise<boolean>
  hasStoredData(): boolean | Promise<boolean>
  getStorageSize(): number | Promise<number>
  exportData(): string | null | Promise<string | null>
  importData(jsonData: string): boolean | Promise<boolean>
}