<template>
  <div class="check-list">
    <!-- 麵包屑 -->
    <BreadcrumbNav />

    <!-- 同步控制區塊 -->
    <div class="sync-controls">
      <!-- 頂部：模式 + 使用者 -->
      <div class="sync-header">
        <div class="sync-mode">
          <span class="sync-icon sync-icon--cloud"></span>
          <span>{{ dataSync.syncModeText.value }}</span>
        </div>

        <div v-if="dataSync.isAuthenticated.value" class="user-badge">
          <div v-if="dataSync.currentUser.value?.photoURL" class="user-avatar">
            <img :src="dataSync.currentUser.value.photoURL" :alt="'使用者頭像'" />
          </div>
          <span class="user-name">{{ dataSync.currentUser.value?.displayName || dataSync.currentUser.value?.email
          }}</span>
        </div>
      </div>

      <!-- 底部：狀態 + 按鈕（桌面版水平，手機版垂直） -->
      <div class="sync-footer">
        <!-- 左側：同步狀態 -->
        <div class="sync-status">
          <!-- 同步中 -->
          <template v-if="dataSync.syncState.value.status === 'syncing'">
            <span class="sync-icon sync-icon--sync rotating"></span>
            <span>同步中...</span>
          </template>

          <!-- 雲端模式 -->
          <template v-else-if="dataSync.isOnlineMode.value">
            <span class="sync-icon sync-icon--clock"></span>
            <span>{{ formatSyncTime(dataSync.syncState.value.lastSyncTime) }}</span>
          </template>

          <!-- 本地模式 -->
          <template v-else>
            <span class="sync-icon sync-icon--check"></span>
            <span>本地資料已儲存</span>
          </template>
        </div>

        <!-- 右側：操作按鈕 -->
        <div class="sync-actions">
          <!-- 本地模式按鈕 -->
          <button v-if="!dataSync.isOnlineMode.value" @click="handleSyncToCloud" :disabled="isLoading"
            class="sync-btn sync-btn--primary">
            <span class="sync-icon" :class="{
              'sync-icon--login': !dataSync.isAuthenticated.value,
              'sync-icon--cloud-done': dataSync.isAuthenticated.value
            }"></span>
            {{ dataSync.isAuthenticated.value ? '載入雲端資料' : '登入並同步' }}
          </button>

          <!-- 雲端模式按鈕 -->
          <button v-if="dataSync.isOnlineMode.value" @click="handleManualSync" :disabled="isSyncButtonDisabled"
            :class="['sync-btn', 'sync-btn--primary', { 'sync-btn--cooldown': isSyncCooldown }]">
            <span class="sync-icon sync-icon--sync"
              :class="{ 'rotating': dataSync.syncState.value.status === 'syncing' }"></span>
            {{ syncButtonText }}
          </button>

          <!-- 登出按鈕 -->
          <button v-if="dataSync.isAuthenticated.value" @click="handleSignOut" :disabled="isLoading"
            class="sync-btn sync-btn--secondary">
            <span class="sync-icon sync-icon--logout"></span>
            登出
          </button>
        </div>
      </div>
    </div>

    <!-- Header -->
    <header class="check-list_header">
      <div class="stats-top">
        <div class="total-section">
          <div class="total-number">{{ checkItems.length }}</div>
          <div class="total-label">項攜帶物品</div>
        </div>
        <div class="completion-rate">{{ Math.round(progressPercentage) }}%</div>
      </div>

      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
        <div class="stats-mini">
          <div class="stat-item-mini">
            <div class="stat-icon stat-icon--packed"></div>
            <div>已攜帶 {{ packedCount }} 項</div>
          </div>
          <div class="stat-item-mini">
            <div class="stat-icon stat-icon--unpacked"></div>
            <div>待攜帶 {{ unpackedCount }} 項</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Add Item Form -->
    <form class="check-list_add-form" @submit="handleSubmit">
      <div class="check-list_input-group">
        <input v-model="newItem" type="text" class="check-list_input" placeholder="新增攜帶物品..."
          @keypress="handleKeyPress" />
        <button type="submit" class="check-list_add-button" :disabled="!newItem.trim()">
          <span class="check-list_add-icon">+</span>
          新增
        </button>
      </div>
    </form>

    <!-- Filter Buttons -->
    <div class="check-list_filters">
      <button v-for="filterOption in filterOptions" :key="filterOption.value"
        :class="['check-list_filter-btn', { 'check-list_filter-btn--active': filter === filterOption.value }]"
        @click="setFilter(filterOption.value)">
        {{ filterOption.label }}
      </button>
    </div>

    <!-- Check List -->
    <div class="check-list_items">
      <div v-if="filteredItems.length === 0" class="check-list_empty">
        <p class="check-list_empty-message">
          {{ getEmptyMessage() }}
        </p>
      </div>

      <div v-else class="check-list_items-container">
        <div v-for="(item, index) in filteredItems" :key="item.id"
          :class="['check-list_item', { 'check-list_item--packed': item.packed }]">
          <div class="check-list_checkbox" @click="toggleItem(item.id)">
            <input type="checkbox" :checked="item.packed" @change="toggleItem(item.id)" />
            <span class="check-list_checkmark"></span>
          </div>

          <!-- Content -->
          <div class="check-list_content">
            <!-- 顯示模式 -->
            <span v-if="!item.isEditing" @click="startEdit(item)" class="check-list_text" title="點擊編輯">
              {{ item.text }}
            </span>

            <!-- 編輯模式 -->
            <input v-else ref="editInput" v-model="item.text" @blur="saveEdit(item)" @keyup.enter="saveEdit(item)"
              @keyup.escape="cancelEdit(item)" class="check-list_edit-input" :placeholder="item.originalText" />
          </div>

          <!-- 排序控制 -->
          <div class="check-list_order-controls">
            <button v-if="index > 0" @click="moveUp(index)" class="order-btn order-btn--up" title="上移"></button>
            <button v-if="index < filteredItems.length - 1" @click="moveDown(index)" class="order-btn order-btn--down"
              title="下移"></button>
          </div>

          <!-- Delete Button -->
          <button class="check-list_delete-button" @click="deleteItem(item.id)" :aria-label="`刪除 ${item.text}`">
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 調試用 Console 顯示 -->
  <div v-if="debugLogs.length > 0" class="debug-console">
    <div class="debug-header">
      <span>Debug Console</span>
      <button @click="clearDebugLogs" class="debug-clear">清除</button>
    </div>
    <div class="debug-content">
      <div v-for="(log, index) in debugLogs" :key="index" :class="['debug-log', `debug-log--${log.type}`]">
        <span class="debug-time">{{ log.time }}</span>
        <span class="debug-message">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useDataSync } from '../../composables/useDataSync'
import { useDialog } from '../../composables/useDialog'
import type { CheckItem, FilterType, FilterOption } from '../../types/check-item'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

let popupCheckInterval: number | null = null
let windowFocusHandler: (() => void) | null = null

// ===================================
// useDataSync 整合
// ===================================
const dataSync = useDataSync({
  autoSync: false, // 改成 false
  conflictResolution: 'local'
})

// 從 useDataSync 取得資料和狀態
const checkItems = dataSync.items
const syncState = dataSync.syncState

// ===================================
// useDialog 整合
// ===================================
const { confirm, alert } = useDialog()

// ===================================
// 其他響應式狀態 (保持不變)
// ===================================

const newItem = ref<string>('')
const filter = ref<FilterType>('all')
const editInput = ref<HTMLInputElement[]>([])

// 操作狀態
const isLoading = ref<boolean>(false)

// ===================================
// 常數定義 (保持不變)
// ===================================

const filterOptions: FilterOption[] = [
  { value: 'all', label: '全部' },
  { value: 'unpacked', label: '待攜帶' },
  { value: 'packed', label: '已攜帶' }
]

// ===================================
// 同步方法 - 使用新的對話框系統
// ===================================

const handleSyncToCloud = async (): Promise<void> => {
  if (dataSync.isAuthenticated.value && checkItems.value.length > 0) {
    // 使用新的 confirm 對話框
    const confirmed = await confirm({
      title: '載入雲端資料',
      message: '載入雲端資料會覆蓋本地資料，確定要繼續嗎？',
      confirmText: '確認',
      cancelText: '取消'
    })

    if (confirmed) {
      await executeSyncToCloud()
    }
  } else {
    // 直接執行同步
    await executeSyncToCloud()
  }
}

const handleSignOut = async (): Promise<void> => {
  await withErrorHandling(async () => {
    const result = await dataSync.signOut()
    if (!result.success) {
      throw new Error(result.error || '登出失敗')
    }
  }, '登出失敗', true)
}

const executeSyncToCloud = async (): Promise<void> => {
  try {
    isLoading.value = true
    addDebugLog('info', '開始執行同步到雲端')

    // 清理可能存在的舊監聽器
    if (windowFocusHandler) {
      window.removeEventListener('focus', windowFocusHandler)
      addDebugLog('info', '清理舊的 focus 監聽器')
    }

    // 設置新的 focus 監聽器
    windowFocusHandler = () => {
      addDebugLog('info', 'Focus 事件觸發')
      setTimeout(async () => {
        addDebugLog('info', `檢查狀態 - loading: ${isLoading.value}, authenticated: ${dataSync.isAuthenticated.value}`)

        if (isLoading.value && !dataSync.isAuthenticated.value) {
          addDebugLog('info', '檢測到用戶取消登入')

          // 清理監聽器
          if (windowFocusHandler) {
            window.removeEventListener('focus', windowFocusHandler)
            windowFocusHandler = null
            addDebugLog('info', '清理 focus 監聽器')
          }

          isLoading.value = false
          await alert({
            title: '登入已取消',
            message: '您已取消 Google 登入',
            confirmText: '確定'
          })
        }
      }, 500)
    }

    window.addEventListener('focus', windowFocusHandler)
    addDebugLog('info', '設置 focus 監聽器')

    const result = await dataSync.initializeCloudSync()
    addDebugLog('info', `登入結果: ${JSON.stringify(result)}`)

    // 登入成功，清理監聽器
    if (windowFocusHandler) {
      window.removeEventListener('focus', windowFocusHandler)
      windowFocusHandler = null
      addDebugLog('success', '登入成功，清理監聽器')
    }

    if (!result.success) {
      throw new Error(result.error || '同步失敗')
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    addDebugLog('error', `捕獲錯誤: ${errorMessage}`)

    // 清理監聽器
    if (windowFocusHandler) {
      window.removeEventListener('focus', windowFocusHandler)
      windowFocusHandler = null
      addDebugLog('info', '錯誤時清理監聽器')
    }

    if (!errorMessage.includes('登入已取消')) {
      await alert({
        title: '同步失敗',
        message: errorMessage,
        confirmText: '我知道了'
      })
    }
  } finally {
    isLoading.value = false
    addDebugLog('info', '執行完成')
  }
}

// ===================================
// 立即同步相關狀態
// ===================================
const lastSyncTime = ref<number>(0)
const SYNC_COOLDOWN = 3000 // 3 秒防連點
const successMessage = ref<string>('')

// 計算距離上次同步的時間
const timeSinceLastSync = computed(() => {
  if (lastSyncTime.value === 0) return SYNC_COOLDOWN
  return Date.now() - lastSyncTime.value
})

// 是否在冷卻期間
const isSyncCooldown = computed(() => {
  return timeSinceLastSync.value < SYNC_COOLDOWN
})

// 剩餘冷卻時間（秒）
const cooldownSeconds = computed(() => {
  if (!isSyncCooldown.value) return 0
  return Math.ceil((SYNC_COOLDOWN - timeSinceLastSync.value) / 1000)
})

// 按鈕文字
const syncButtonText = computed(() => {
  if (dataSync.syncState.value.status === 'syncing') {
    return '同步中...'
  } else {
    return '立即同步'
  }
})

// 按鈕是否禁用
const isSyncButtonDisabled = computed(() => {
  return isLoading.value ||
    dataSync.syncState.value.status === 'syncing' ||
    isSyncCooldown.value
})

// ===================================
// 立即同步方法
// ===================================
const handleManualSync = async (): Promise<void> => {
  if (!dataSync.isOnlineMode.value || !dataSync.canSyncToCloud.value) {
    await showError('無法同步：請確認已登入且為雲端模式')
    return
  }

  if (isSyncCooldown.value) {
    await showError(`請稍候 ${cooldownSeconds.value} 秒後再試`)
    return
  }

  await withErrorHandling(async () => {
    // 記錄同步時間
    lastSyncTime.value = Date.now()

    // 強制同步本地資料到雲端
    const result = await dataSync.syncToCloud()

    if (!result.success) {
      throw new Error(result.error || '同步失敗')
    }

    // 顯示成功訊息
    showSuccess('同步完成')
  }, '立即同步失敗', true)
}

// 顯示成功訊息
const showSuccess = (message: string): void => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 2000)
}

// ===================================
// 計算屬性
// ===================================

const filteredItems = computed((): CheckItem[] => {
  let items = [...checkItems.value]

  // 先按 order 排序
  items.sort((a, b) => a.order - b.order)

  // 再按篩選條件過濾
  switch (filter.value) {
    case 'unpacked':
      return items.filter(item => !item.packed)
    case 'packed':
      return items.filter(item => item.packed)
    default:
      return items
  }
})

const packedCount = computed((): number => {
  return checkItems.value.filter(item => item.packed).length
})

const unpackedCount = computed((): number => {
  return checkItems.value.filter(item => !item.packed).length
})

const progressPercentage = computed((): number => {
  if (checkItems.value.length === 0) return 0
  return (packedCount.value / checkItems.value.length) * 100
})

// 操作狀態計算屬性
const canPerformOperations = computed((): boolean => {
  return !isLoading.value && !syncState.value.status.includes('syncing')
})

// ===================================
// 工具方法
// ===================================

const showError = async (message: string): Promise<void> => {
  await alert({
    title: '錯誤',
    message: message,
    confirmText: '我知道了'
  })
}

const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMsg: string = '操作失敗',
  allowDuringSync: boolean = false
): Promise<T | null> => {
  if (!allowDuringSync && !canPerformOperations.value) {
    await showError('正在同步中，請稍候再試')
    return null
  }

  isLoading.value = true

  try {
    const result = await operation()
    return result
  } catch (error) {
    console.error(errorMsg, error)
    await showError(errorMsg)
    return null
  } finally {
    isLoading.value = false
  }
}

// 格式化同步時間
const formatSyncTime = (time: Date | null): string => {
  if (!time) return '尚未同步'

  return time.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ===================================
// 優化的 CRUD 方法
// ===================================

const addItem = async (): Promise<void> => {
  if (!newItem.value.trim()) return

  await withErrorHandling(async () => {
    // 計算新項目的 order（最大值 + 1）
    const maxOrder = checkItems.value.length > 0 ? Math.max(...checkItems.value.map(item => item.order)) : 0

    const item: CheckItem = {
      id: Date.now() + Math.floor(Math.random() * 1000), // 避免重複 ID
      text: newItem.value.trim(),
      packed: false,
      createdAt: new Date(),
      order: maxOrder + 1
    }

    // 統一使用 saveItems - useDataSync 會自動選擇 local 或 firebase
    const newItems = [...checkItems.value, item]
    const success = await dataSync.saveItems(newItems)

    if (success) {
      newItem.value = ''
    } else {
      throw new Error('儲存失敗')
    }
  }, '新增項目失敗')
}

const toggleItem = async (id: number): Promise<void> => {
  await withErrorHandling(async () => {
    const newItems = checkItems.value.map(item =>
      item.id === id ? { ...item, packed: !item.packed } : item
    )

    const success = await dataSync.saveItems(newItems)
    if (!success) {
      throw new Error('更新狀態失敗')
    }
  }, '更新項目狀態失敗')
}

const deleteItem = async (id: number): Promise<void> => {
  await withErrorHandling(async () => {
    const newItems = checkItems.value.filter(item => item.id !== id)
    const success = await dataSync.saveItems(newItems)

    if (!success) {
      throw new Error('刪除失敗')
    }
  }, '刪除項目失敗')
}

const updateItem = async (updatedItem: CheckItem): Promise<void> => {
  await withErrorHandling(async () => {
    const newItems = checkItems.value.map(item =>
      item.id === updatedItem.id ? { ...updatedItem } : item
    )

    const success = await dataSync.saveItems(newItems)
    if (!success) {
      throw new Error('更新失敗')
    }

    // 如果是雲端模式，確保同步時間立即更新
    if (dataSync.isOnlineMode.value && success) {
      console.log('✅ 更新完成，同步時間:', dataSync.syncState.value.lastSyncTime)
    }
  }, '更新項目失敗')
}

// ===================================
// 優化的編輯功能
// ===================================

const startEdit = (item: CheckItem): void => {
  if (!canPerformOperations.value) {
    showError('正在同步中，無法編輯')
    return
  }

  // 儲存原始文字，用於取消編輯
  item.originalText = item.text
  item.isEditing = true

  // 下一個 tick 後聚焦輸入框
  nextTick(() => {
    const input = editInput.value?.find(el => el)
    if (input) {
      input.focus()
      input.select()
    }
  })
}

const saveEdit = async (item: CheckItem): Promise<void> => {
  if (item.text.trim()) {
    const editedItem = { ...item }
    delete editedItem.isEditing
    delete editedItem.originalText

    await updateItem(editedItem)
  } else {
    // 如果文字為空，恢復原始文字
    cancelEdit(item)
    showError('項目內容不能為空')
  }
}

const cancelEdit = (item: CheckItem): void => {
  if (item.originalText) {
    item.text = item.originalText
  }
  item.isEditing = false
  delete item.originalText
}

// ===================================
// 優化的排序功能
// ===================================

const moveUp = async (index: number): Promise<void> => {
  if (index <= 0) return

  await withErrorHandling(async () => {
    const items = [...checkItems.value].sort((a, b) => a.order - b.order)
    const currentItem = items[index]
    const previousItem = items[index - 1]

    if (!currentItem || !previousItem) {
      throw new Error('找不到要移動的項目')
    }

    // 建立新的陣列，交換 order 值
    const newItems = items.map(item => {
      if (item.id === currentItem.id) {
        return { ...item, order: previousItem.order }
      } else if (item.id === previousItem.id) {
        return { ...item, order: currentItem.order }
      }
      return { ...item }
    })

    // 儲存變更 - 統一使用 saveItems（排序是批次操作）
    const success = await dataSync.saveItems(newItems)
    if (!success) {
      throw new Error('排序失敗')
    }
  }, '移動項目失敗')
}

const moveDown = async (index: number): Promise<void> => {
  const items = [...checkItems.value].sort((a, b) => a.order - b.order)
  if (index >= items.length - 1) return

  await withErrorHandling(async () => {
    const currentItem = items[index]
    const nextItem = items[index + 1]

    if (!currentItem || !nextItem) {
      throw new Error('找不到要移動的項目')
    }

    // 建立新的陣列，交換 order 值
    const newItems = items.map(item => {
      if (item.id === currentItem.id) {
        return { ...item, order: nextItem.order }
      } else if (item.id === nextItem.id) {
        return { ...item, order: currentItem.order }
      }
      return { ...item }
    })

    // 儲存變更 - 統一使用 saveItems（排序是批次操作）
    const success = await dataSync.saveItems(newItems)
    if (!success) {
      throw new Error('排序失敗')
    }
  }, '移動項目失敗')
}

// ===================================
// 其他方法 (保持不變)
// ===================================

const setFilter = (filterType: FilterType): void => {
  filter.value = filterType
}

const getEmptyMessage = (): string => {
  switch (filter.value) {
    case 'unpacked':
      return '太棒了！所有物品都已攜帶完成 🎉'
    case 'packed':
      return '還沒有攜帶任何物品'
    default:
      return '清單是空的，開始新增攜帶物品吧！'
  }
}

// ===================================
// 事件處理
// ===================================

const handleKeyPress = (event: KeyboardEvent): void => {
  if (event.key === 'Enter' && !isLoading.value) {
    addItem()
  }
}

const handleSubmit = (event: Event): void => {
  event.preventDefault()
  if (!isLoading.value) {
    addItem()
  }
}

// 調試用
const debugLogs = ref<Array<{ type: string, message: string, time: string }>>([])

const addDebugLog = (type: 'info' | 'error' | 'success', message: string) => {
  const time = new Date().toLocaleTimeString()
  debugLogs.value.push({ type, message, time })
  console.log(`[${type}] ${message}`) // 同時也記錄到真正的 console

  // 保持最多 20 條記錄
  if (debugLogs.value.length > 20) {
    debugLogs.value.shift()
  }
}

const clearDebugLogs = () => {
  debugLogs.value = []
}

// ===================================
// 生命週期
// ===================================
const debugAuth = () => {
  console.log('🔍 認證狀態檢查:', {
    isAuthenticated: dataSync.isAuthenticated.value,
    currentUser: dataSync.currentUser.value,
    userId: dataSync.currentUser.value?.uid,
    isOnlineMode: dataSync.isOnlineMode.value
  })
}

onMounted(async () => {
  debugAuth()

  isLoading.value = true

  try {
    // 只初始化本地模式，不啟動雲端功能
    await dataSync.initialize()

  } catch (error) {
    console.error('初始化失敗:', error)
    showError('初始化失敗，請重新整理頁面')
  } finally {
    isLoading.value = false
  }
})

// 清理監聽器
onUnmounted(() => {
  if (popupCheckInterval) {
    clearInterval(popupCheckInterval)
  }

  // ✅ 新增：清理 focus 事件監聽器
  if (windowFocusHandler) {
    window.removeEventListener('focus', windowFocusHandler)
  }
})
</script>


<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

// ===================================
// Check List Container
// ===================================
.check-list
  margin: 0 auto
  padding: $spacing-lg
  min-height: 100vh
  max-width: 600px
  background: $bg-primary

  @include tablet
    padding: $spacing-xl

// ===================================
// 同步控制區塊 - 優化版本
// ===================================
.sync-controls
  margin-bottom: $spacing-xl
  border: 1px solid $border-light
  border-radius: $border-radius-lg
  background: $bg-card
  box-shadow: 0 2px 8px $shadow-light
  overflow: hidden

// ===================================
// 頂部：模式 + 使用者
// ===================================
.sync-header
  display: flex
  justify-content: space-between
  align-items: center
  padding: $spacing-sm $spacing-lg
  background: rgba(56, 178, 172, 0.05)
  border-bottom: 1px solid rgba(56, 178, 172, 0.1)
  min-height: 40px

  @include mobile-only
    flex-direction: column
    gap: $spacing-sm
    padding: $spacing-md $spacing-md  // 增加 padding 讓它更舒服
    min-height: 50px  // 增加最小高度

.sync-mode
  display: flex
  align-items: center
  gap: $spacing-xs
  font-size: 0.875rem
  font-weight: 500
  color: $text-primary

  @include mobile-only
    font-size: 0.9rem  // 稍微大一點
    order: 2  // 手機版時排在第二個

.user-badge
  display: flex
  align-items: center
  gap: $spacing-xs
  background: rgba(56, 178, 172, 0.1)
  padding: $spacing-xs $spacing-sm
  border-radius: $border-radius-sm
  font-size: 0.8rem

  @include mobile-only
    align-self: stretch
    justify-content: center
    font-size: 0.8rem  // 保持大小
    padding: $spacing-sm  // 增加 padding
    order: 1  // 手機版時排在第一個

.user-avatar
  width: 22px
  height: 22px
  border-radius: 50%
  overflow: hidden

  @include mobile-only
    width: 24px  // 手機版稍大
    height: 24px

  img
    width: 100%
    height: 100%
    object-fit: cover

.user-name
  max-width: 120px
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
  font-weight: 500

  @include mobile-only
    max-width: 100px  // 增加寬度

// ===================================
// 底部：狀態 + 按鈕（水平布局）
// ===================================
.sync-footer
  display: flex
  justify-content: space-between
  align-items: center
  padding: $spacing-md $spacing-lg
  background: rgba(247, 250, 252, 0.3)
  min-height: 50px

  @include mobile-only
    flex-direction: column
    gap: $spacing-sm
    padding: $spacing-sm $spacing-md
    min-height: auto

// 左側：同步狀態
.sync-status
  display: flex
  align-items: center
  gap: $spacing-sm
  font-size: 0.875rem
  color: $text-secondary
  flex: 1

  @include mobile-only
    justify-content: center
    font-size: 0.85rem
    padding: $spacing-xs 0  // 減少上下間距，就一行字
    width: 100%

// 右側：操作按鈕
.sync-actions
  display: flex
  gap: $spacing-sm
  flex-shrink: 0

  @include mobile-only
    width: 100%
    gap: $spacing-sm  // 按鈕間的間距

.sync-btn
  display: flex
  align-items: center
  gap: $spacing-xs
  padding: $spacing-sm $spacing-md
  border: 1px solid transparent
  border-radius: $border-radius-md
  font-size: 0.875rem
  font-weight: 500
  cursor: pointer
  transition: all 0.2s ease
  white-space: nowrap

  &:disabled
    opacity: 0.6
    cursor: not-allowed

  @include mobile-only
    flex: 1  // 手機版每個按鈕平分寬度
    justify-content: center
    padding: $spacing-sm $spacing-xs  // 減少 padding，讓按鈕更小
    font-size: 0.8rem  // 縮小字體

  &--primary
    background: $accent-color-1
    color: $text-white

    &:hover:not(:disabled)
      background: rgba(56, 178, 172, 0.8)

  &--secondary
    background: rgba(247, 250, 252, 0.8)
    border-color: $border-primary
    color: $text-secondary

    &:hover:not(:disabled)
      background: rgba(237, 242, 247, 0.9)

  &--cooldown
    background: rgba(156, 163, 175, 0.8)
    color: rgba(255, 255, 255, 0.7)

// ===================================
// 圖示樣式
// ===================================
.sync-icon
  flex-shrink: 0

  // 生成所有同步資訊圖示
  @each $name, $filename in $sync-info-icons
    &--#{$name}
      @include icon-base(14px)
      background-image: url('#{$icon-base-path}/#{$filename}.png')

  &.rotating
    @include rotating-icon

// 按鈕內的圖示
.sync-btn .sync-icon
  // 生成所有同步按鈕圖示
  @each $name, $filename in $sync-btn-icons
    &--#{$name}
      @include icon-base(16px)
      background-image: url('#{$icon-base-path}/#{$filename}.png')

// ===================================
// Header Section - 統計儀表板
// ===================================
.check-list_header
  margin-bottom: $spacing-lg
  padding: 20px
  border: 1px solid $border-light
  border-radius: $border-radius-lg
  background: $bg-card
  box-shadow: 0 2px 8px $shadow-light

.stats-top
  display: flex
  justify-content: space-between
  align-items: baseline
  margin-bottom: $spacing-md

  @include mobile-only
    flex-direction: column
    align-items: flex-start
    gap: $spacing-xs

.total-section
  display: flex
  align-items: baseline
  gap: $spacing-xs

.total-number
  font-size: 2rem
  font-weight: 700
  color: $text-primary

  @include tablet
    font-size: 2.25rem

.total-label
  color: $text-muted
  font-size: 0.875rem
  font-weight: 500

.completion-rate
  font-size: 1.25rem
  font-weight: 600
  color: $accent-color-1

  @include tablet
    font-size: 1.5rem

.progress-container
  margin-bottom: 0

.progress-bar
  height: 8px
  background: $border-light
  border-radius: 4px
  overflow: hidden
  margin-bottom: $spacing-xs

.progress-fill
  height: 100%
  background: linear-gradient(90deg, $city-gradient-start, $city-gradient-end)
  transition: width 0.6s ease

.stats-mini
  display: flex
  justify-content: space-between
  font-size: 0.8rem
  color: $text-muted

  @include mobile-only
    gap: $spacing-xs

.stat-item-mini
  display: flex
  gap: $spacing-xs
  margin-top: 8px
  align-items: center

.stat-icon
  @each $name, $filename in $stat-icons
    &--#{$name}
      @include icon-base(16px)
      background-image: url('#{$icon-base-path}/#{$filename}.png')

// ===================================
// Add Item Form
// ===================================
.check-list_add-form
  margin-bottom: $spacing-xl

.check-list_input-group
  display: flex
  padding: $spacing-md
  border: 1px solid $border-light
  border-radius: $border-radius-lg
  background: $bg-card
  box-shadow: 0 2px 8px $shadow-light
  gap: $spacing-sm

  @include mobile-only
    flex-direction: column

.check-list_input
  flex: 1
  padding: $spacing-sm $spacing-md
  border: 1px solid $border-primary
  border-radius: $border-radius-md
  background: $bg-primary
  color: $text-primary
  font-size: 1rem

  &::placeholder
    color: $text-muted

  &:focus
    outline: none
    border-color: $accent-color-1
    box-shadow: 0 0 0 2px rgba(56, 178, 172, 0.2)

.check-list_add-button
  display: flex
  align-items: center
  padding: $spacing-sm $spacing-md
  border: none
  border-radius: $border-radius-md
  background: $accent-color-1
  color: $text-white
  font-weight: 500
  font-size: 0.875rem
  cursor: pointer
  transition: all 0.2s ease
  gap: $spacing-xs

  &:hover:not(:disabled)
    background: rgba(56, 178, 172, 0.8)
    transform: translateY(-1px)

  &:disabled
    opacity: 0.6
    cursor: not-allowed

.check-list_add-icon
  font-size: 1.25rem
  line-height: 1

// ===================================
// Filter Buttons
// ===================================
.check-list_filters
  display: flex
  margin-bottom: $spacing-lg
  padding: $spacing-sm
  border: 1px solid $border-light
  border-radius: $border-radius-lg
  background: $bg-card
  box-shadow: 0 2px 8px $shadow-light
  gap: $spacing-xs

.check-list_filter-btn
  flex: 1
  padding: $spacing-sm $spacing-md
  border: 1px solid $border-primary
  border-radius: $border-radius-md
  background: transparent
  color: $text-secondary
  font-size: 0.875rem
  cursor: pointer
  transition: all 0.2s ease

  &:hover
    background: $bg-sidebar
    color: $primary-color

  &--active
    border-color: $accent-color-1
    background: $accent-color-1
    color: $text-white

// ===================================
// Items List
// ===================================
.check-list_items
  margin-bottom: $spacing-xl

.check-list_empty
  padding: $spacing-2xl
  border: 1px solid $border-light
  border-radius: $border-radius-lg
  background: $bg-card
  text-align: center

.check-list_empty-message
  margin: 0
  color: $text-muted
  font-size: 1rem

.check-list_items-container
  display: flex
  flex-direction: column
  gap: $spacing-sm

.check-list_item
  display: flex
  align-items: center
  padding: $spacing-md
  border: 1px solid $border-light
  border-radius: $border-radius-md
  background: $bg-card
  box-shadow: 0 1px 3px $shadow-light
  transition: all 0.2s ease
  gap: $spacing-md

  &:hover
    box-shadow: 0 2px 8px $shadow-medium
    transform: translateY(-1px)

  &--packed
    background: $bg-sidebar
    opacity: 0.8

    .check-list_text
      color: $text-muted
      text-decoration: line-through

.check-list_checkbox
  position: relative
  cursor: pointer

  input[type='checkbox']
    position: absolute
    width: 100%
    height: 100%
    opacity: 0
    cursor: pointer

.check-list_checkmark
  position: relative
  display: block
  width: 20px
  height: 20px
  border: 2px solid $border-primary
  border-radius: $border-radius-sm
  background: $bg-card
  transition: all 0.2s ease

  &::after
    position: absolute
    top: 2px
    left: 6px
    width: 6px
    height: 10px
    border: 2px solid $text-white
    border-top: none
    border-left: none
    content: ''
    transition: transform 0.2s ease
    transform: rotate(45deg) scale(0)

  input[type='checkbox']:checked + &
    border-color: $accent-color-1
    background: $accent-color-1

    &::after
      transform: rotate(45deg) scale(1)

.check-list_content
  display: flex
  flex: 1
  flex-direction: column
  gap: $spacing-xs

.check-list_text
  color: $text-primary
  font-weight: 500
  font-size: 1rem
  transition: all 0.2s ease
  cursor: pointer
  padding: 2px 4px
  border-radius: $border-radius-sm

  &:hover
    background: rgba(56, 178, 172, 0.1)

.check-list_edit-input
  flex: 1
  padding: 4px 8px
  border: 2px solid $accent-color-1
  border-radius: $border-radius-sm
  background: $bg-primary
  color: $text-primary
  font-size: 1rem
  font-weight: 500

  &:focus
    outline: none
    box-shadow: 0 0 0 2px rgba(56, 178, 172, 0.2)

// ===================================
// 排序控制
// ===================================
.check-list_order-controls
  display: flex
  flex-direction: column
  gap: 2px

.order-btn
  display: flex
  align-items: center
  justify-content: center
  width: 24px
  height: 20px
  border: 1px solid $border-primary
  border-radius: $border-radius-sm
  background-color: $bg-card
  color: $text-secondary
  font-size: 0.75rem
  cursor: pointer
  transition: all 0.2s ease

  // 生成排序圖示
  @each $name, $filename in $order-icons
    &--#{$name}
      @include icon-base(12px)
      background-image: url('#{$icon-base-path}/#{$filename}.png')

  &:hover:not(:disabled)
    border-color: $accent-color-1
    background-color: rgba(56, 178, 172, 0.1)
    color: $accent-color-1

  &:disabled
    opacity: 0.3
    cursor: not-allowed

  @include mobile-only
    width: 28px
    height: 24px

    @each $name, $filename in $order-icons
      &--#{$name}
        @include icon-base(14px)
        background-image: url('#{$icon-base-path}/#{$filename}.png')

// ===================================
// 刪除按鈕
// ===================================
.check-list_delete-button
  display: flex
  align-items: center
  justify-content: center
  width: 32px
  height: 32px
  border: 1px solid $border-primary
  border-radius: $border-radius-sm
  background-color: transparent
  color: $text-muted
  cursor: pointer
  transition: all 0.2s ease
  @include single-icon('close', 16px)

  &:hover
    border-color: $accent-color-2
    background-color: rgba(230, 168, 107, 0.1)
    color: $accent-color-2

  @include mobile-only
    width: 36px
    height: 36px
    @include single-icon('close', 18px)
</style>