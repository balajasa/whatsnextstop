<template>
  <div class="check-list">
    <!-- 麵包屑 -->
    <BreadcrumbNav />
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

    <!-- 同步控制區塊 -->
    <div class="sync-controls">
      <!-- 左側資訊區域 -->
      <div class="sync-controls__info">
        <!-- 模式顯示 -->
        <div class="sync-controls__info-item">
          <span class="sync-controls__icon sync-controls__icon--cloud"></span>
          {{ dataSync.syncModeText.value }}
        </div>

        <!-- 使用者資訊 -->
        <div v-if="dataSync.isAuthenticated.value" class="sync-controls__info-item">
          <span class="sync-controls__icon sync-controls__icon--user"></span>
          {{ dataSync.currentUser.value?.displayName || dataSync.currentUser.value?.email }}
        </div>

        <!-- 狀態顯示（錯誤狀態優先） -->
        <div v-if="errorMessage" class="sync-controls__info-item sync-controls__info-item--error">
          <span class="sync-controls__icon sync-controls__icon--error"></span>
          {{ errorMessage }}
        </div>

        <!-- 正常狀態顯示 -->
        <div v-else-if="dataSync.syncState.value.status === 'syncing'" class="sync-controls__info-item">
          <span class="sync-controls__icon sync-controls__icon--sync"></span>
          同步中...
        </div>

        <div v-else-if="dataSync.syncState.value.lastSyncTime" class="sync-controls__info-item">
          <span class="sync-controls__icon sync-controls__icon--clock"></span>
          {{ formatSyncTime(dataSync.syncState.value.lastSyncTime) }}
        </div>
      </div>

      <!-- 右側操作按鈕區域 -->
      <div class="sync-controls__actions">
        <!-- 動態同步按鈕 -->
        <button v-if="!dataSync.isOnlineMode.value" @click="handleSyncToCloud" :disabled="isLoading"
          class="sync-controls__btn sync-controls__btn--primary">
          <span class="sync-controls__btn-icon" :class="{
            'sync-controls__btn-icon--login': !dataSync.isAuthenticated.value,
            'sync-controls__btn-icon--cloud-done': dataSync.isAuthenticated.value
          }"></span>
          {{ dataSync.isAuthenticated.value ? '載入雲端資料' : '登入並同步' }}
        </button>

        <!-- 登出按鈕 -->
        <button v-if="dataSync.isAuthenticated.value" @click="handleSignOut" :disabled="isLoading"
          class="sync-controls__btn sync-controls__btn--secondary">
          <span class="sync-controls__btn-icon sync-controls__btn-icon--logout"></span>
          登出
        </button>
      </div>
    </div>

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
          <!-- Checkbox -->
          <div class="check-list_checkbox" @click="toggleItem(item.id)">
            <input type="checkbox" :checked="item.packed" @change="toggleItem(item.id)" />
            <span class="check-list_checkmark"></span>
          </div>

          <!-- Content (可編輯) -->
          <div class="check-list_content">
            <!-- 顯示模式 -->
            <span v-if="!item.isEditing" @click="startEdit(item)" class="check-list_text check-list_text--editable"
              title="點擊編輯">
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
            <span class="check-list_delete-icon">×</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- 確認對話框 -->
  <ConfirmDialog :visible="showConfirmDialog" title="載入雲端資料" message="載入雲端資料會覆蓋本地資料，確定要繼續嗎？" confirm-text="確認"
    cancel-text="取消" @confirm="handleConfirmLoad" @cancel="handleCancelLoad" @close="handleCancelLoad" />
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useDataSync } from '../../composables/useDataSync'
import type { CheckItem, FilterType, FilterOption } from '../../types/check-item'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

interface SyncResult {
  success: boolean;
  error?: string;
}

let visibilityHandler: (() => void) | null = null
let popupCheckInterval: number | null = null

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
// 對話框狀態
const showConfirmDialog = ref(false)

// ===================================
// 其他響應式狀態 (保持不變)
// ===================================

const newItem = ref<string>('')
const filter = ref<FilterType>('all')
const editInput = ref<HTMLInputElement[]>([])

// 操作狀態
const isLoading = ref<boolean>(false)
const errorMessage = ref<string>('')

// ===================================
// 常數定義 (保持不變)
// ===================================

const filterOptions: FilterOption[] = [
  { value: 'all', label: '全部' },
  { value: 'unpacked', label: '待攜帶' },
  { value: 'packed', label: '已攜帶' }
]

// ===================================
// 同步方法
// ===================================

const handleSyncToCloud = async (): Promise<void> => {
  if (dataSync.isAuthenticated.value && checkItems.value.length > 0) {
    // 如果已登入且本地有資料，顯示確認對話框
    showConfirmDialog.value = true
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

// 新增對話框處理方法
const handleConfirmLoad = async (): Promise<void> => {
  showConfirmDialog.value = false
  await executeSyncToCloud()
}

const handleCancelLoad = (): void => {
  showConfirmDialog.value = false
}

const executeSyncToCloud = async (): Promise<void> => {

  try {
    const syncWithPopupDetection = new Promise<SyncResult>(async (resolve, reject) => {

      // Vue 風格的清理函數
      const cleanup = () => {
        if (visibilityHandler) {
          document.removeEventListener('visibilitychange', visibilityHandler)
          visibilityHandler = null
        }
        if (popupCheckInterval) {
          clearInterval(popupCheckInterval)
          popupCheckInterval = null
        }
      }

      // 定義事件處理器
      visibilityHandler = () => {
        if (document.visibilityState === 'visible') {
          setTimeout(() => {
            if (isLoading.value && !dataSync.isAuthenticated.value) {
              cleanup()
              reject(new Error('LOGIN_CANCELLED'))
            }
          }, 1000)
        }
      }

      // 添加事件監聽器
      document.addEventListener('visibilitychange', visibilityHandler)

      // 備用檢查
      popupCheckInterval = setInterval(() => {
        if (dataSync.isAuthenticated.value) {
          cleanup()
          resolve(dataSync.initializeCloudSync())
        }
      }, 2000)

      // 處理 Firebase
      try {
        const result = await dataSync.initializeCloudSync()
        cleanup()
        resolve(result)
      } catch (error) {
        cleanup()
        reject(error)
      }
    })

    const result = await syncWithPopupDetection

    if (!result.success) {
      throw new Error(result.error || '同步失敗')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage === 'LOGIN_CANCELLED') {
      showError('登入已取消')
    } else {
      showError('同步失敗')
    }
  }
}

// 監聽視窗焦點，檢測登入視窗關閉
let windowFocusHandler: (() => void) | null = null

const setupWindowFocusListener = (): void => {
  if (windowFocusHandler) {
    window.removeEventListener('focus', windowFocusHandler)
  }

  windowFocusHandler = () => {
    // 如果正在載入但使用者未登入，可能是登入視窗被關閉
    if (isLoading.value && !dataSync.isAuthenticated.value) {
      // 延遲一點檢查，給Firebase一點時間處理
      setTimeout(() => {
        if (isLoading.value && !dataSync.isAuthenticated.value) {
          isLoading.value = false
          showError('登入已取消')
        }
      }, 1000)
    }
  }

  window.addEventListener('focus', windowFocusHandler)
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

const showError = (message: string): void => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 3000)
}

const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMsg: string = '操作失敗',
  allowDuringSync: boolean = false // 新增參數
): Promise<T | null> => {
  // 檢查是否可以執行操作（登出等特殊操作可以在同步中執行）
  if (!allowDuringSync && !canPerformOperations.value) {
    showError('正在同步中，請稍候再試')
    return null
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await operation()
    return result
  } catch (error) {
    console.error(errorMsg, error)
    showError(errorMsg)
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

    // 建立新陣列並儲存
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
    const newItems = checkItems.value.map(item => (item.id === id ? { ...item, packed: !item.packed } : item))

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
    const newItems = checkItems.value.map(item => (item.id === updatedItem.id ? { ...updatedItem } : item))

    const success = await dataSync.saveItems(newItems)
    if (!success) {
      throw new Error('更新失敗')
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

    // 儲存變更
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

    // 儲存變更
    const success = await dataSync.saveItems(newItems)
    if (!success) {
      throw new Error('排序失敗')
    }
  }, '移動項目失敗')
}

// ===================================
// 批次操作
// ===================================
// // 清空整個清單
// const clearAllItems = async (): Promise<void> => {
//   if (checkItems.value.length === 0) return

//   await withErrorHandling(async () => {
//     const success = await dataSync.saveItems([])
//     if (!success) {
//       throw new Error('清空失敗')
//     }
//   }, '清空清單失敗')
// }

// // 全部標記為已攜帶
// const markAllAsPacked = async (): Promise<void> => {
//   await withErrorHandling(async () => {
//     const newItems = checkItems.value.map(item => ({
//       ...item,
//       packed: true
//     }))

//     const success = await dataSync.saveItems(newItems)
//     if (!success) {
//       throw new Error('批次更新失敗')
//     }
//   }, '標記全部為已攜帶失敗')
// }

// // 全部標記為待攜帶
// const markAllAsUnpacked = async (): Promise<void> => {
//   await withErrorHandling(async () => {
//     const newItems = checkItems.value.map(item => ({
//       ...item,
//       packed: false
//     }))

//     const success = await dataSync.saveItems(newItems)
//     if (!success) {
//       throw new Error('批次更新失敗')
//     }
//   }, '標記全部為待攜帶失敗')
// }

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

// ===================================
// 生命週期
// ===================================

onMounted(async () => {
  isLoading.value = true

  try {
    // 只初始化本地模式，不啟動雲端功能
    await dataSync.initialize()

    // 設定視窗焦點監聽器
    setupWindowFocusListener()
  } catch (error) {
    console.error('初始化失敗:', error)
    showError('初始化失敗，請重新整理頁面')
  } finally {
    isLoading.value = false
  }
})

// 清理監聽器
onUnmounted(() => {
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler)
  }
  if (popupCheckInterval) {
    clearInterval(popupCheckInterval)
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
// Header Section - 統計儀表板 (方案2A)
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
    // flex-direction: column
    gap: $spacing-xs

.stat-item-mini
  display: flex
  gap: $spacing-xs
  margin-top: 8px
  align-items: center

.stat-icon
  // display: block
  width: 16px
  height: 16px
  background-repeat: no-repeat
  background-position: center
  background-size: 16px 16px
  flex-shrink: 0

  // 已攜帶圖示 - 青綠色
  &--packed
    background-image: url('@/assets/img/icon/task_check.png')

  // 待攜帶圖示 - 橘色
  &--unpacked
    background-image: url('@/assets/img/icon/hourglass_top.png')

// ===================================
// 同步控制區塊 - 方案2: 左右佈局
// ===================================
.sync-controls
  margin-bottom: $spacing-xl
  padding: $spacing-md $spacing-lg
  border: 1px solid $border-light
  border-radius: $border-radius-lg
  background: $bg-card
  box-shadow: 0 2px 8px $shadow-light
  display: flex
  align-items: center
  justify-content: space-between
  gap: $spacing-md

  @include tablet
    padding: 20px
    gap: $spacing-lg

// ===================================
// 左側資訊區域
// ===================================
.sync-controls__info
  display: flex
  align-items: center
  gap: $spacing-md
  flex: 1
  flex-wrap: wrap

  @include tablet
    gap: $spacing-lg

.sync-controls__info-item
  display: flex
  align-items: center
  gap: $spacing-xs
  font-size: 0.8rem
  color: $text-secondary

  // 錯誤狀態的特殊樣式
  &--error
    color: rgba(229, 62, 62, 0.9)
    font-weight: 500

  @include tablet
    font-size: 0.875rem

// ===================================
// 資訊區域圖示
// ===================================
.sync-controls__icon
  display: inline-block
  width: 14px
  height: 14px
  background-repeat: no-repeat
  background-position: center
  background-size: 14px 14px
  flex-shrink: 0

  // 雲端圖示 - 青綠色
  &--cloud
    background-image: url('@/assets/img/icon/cloud.png')

  // 使用者圖示 - 藍灰色
  &--user
    background-image: url('@/assets/img/icon/account.png')

  // 同步中圖示（旋轉動畫） - 青綠色
  &--sync
    background-image: url('@/assets/img/icon/sync.png')
    animation: rotate 1s linear infinite

  // 同步成功圖示 - 綠色
  &--check
    background-image: url('@/assets/img/icon/check.png')

  // 錯誤圖示 - 紅色
  &--error
    background-image: url('@/assets/img/icon/error.png')

  // 時間圖示 - 中性灰
  &--clock
    background-image: url('@/assets/img/icon/clock.png')

// 旋轉動畫
@keyframes rotate
  from
    transform: rotate(0deg)

  to
    transform: rotate(360deg)

// ===================================
// 右側操作按鈕區域
// ===================================
.sync-controls__actions
  display: flex
  gap: $spacing-sm
  flex-shrink: 0

  @include tablet
    gap: $spacing-md

.sync-controls__btn
  display: flex
  align-items: center
  padding: $spacing-sm $spacing-md
  border: 1px solid transparent
  border-radius: $border-radius-md
  font-size: 0.8rem
  font-weight: 500
  cursor: pointer
  transition: all 0.2s ease
  gap: $spacing-xs

  &:disabled
    opacity: 0.6
    cursor: not-allowed

  @include tablet
    font-size: 0.875rem
    padding: $spacing-sm $spacing-lg

  // 主要按鈕樣式
  &--primary
    background: $accent-color-1
    color: $text-white

    &:hover:not(:disabled)
      background: rgba(56, 178, 172, 0.8)

  // 次要按鈕樣式
  &--secondary
    background: rgba(247, 250, 252, 0.8)
    border-color: $border-primary
    color: $text-secondary

    &:hover:not(:disabled)
      background: rgba(237, 242, 247, 0.9)
      border-color: rgba(193, 212, 210, 0.8)

// ===================================
// 按鈕圖示
// ===================================
.sync-controls__btn-icon
  display: inline-block
  width: 14px
  height: 14px
  background-repeat: no-repeat
  background-position: center
  background-size: 14px 14px
  flex-shrink: 0

  // 登入圖示 - 白色（用於主要按鈕）
  &--login
    background-image: url('@/assets/img/icon/login.png')

  // 雲端完成圖示 - 白色（用於主要按鈕）
  &--cloud-done
    background-image: url('@/assets/img/icon/cloud_done.png')

  // 登出圖示 - 藍灰色（用於次要按鈕）
  &--logout
    background-image: url('@/assets/img/icon/logout.png')

// ===================================
// 同步控制區塊響應式設計
// ===================================
@media (max-width: 768px)
  .sync-controls
    flex-direction: column
    align-items: stretch
    gap: $spacing-sm

  .sync-controls__info
    justify-content: space-between

  .sync-controls__actions
    justify-content: stretch

  .sync-controls__btn
    flex: 1

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

  &--editable
    cursor: pointer
    padding: 2px 4px
    border-radius: $border-radius-sm

    &:hover
      background: rgba(56, 178, 172, 0.1)

// 編輯輸入框
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
  background: $bg-card
  color: $text-secondary
  font-size: 0.75rem
  cursor: pointer
  background-repeat: no-repeat
  background-position: center
  background-size: 12px 12px

  &:hover:not(:disabled)
    border-color: $accent-color-1
    background: rgba(56, 178, 172, 0.1)
    color: $accent-color-1

  &:disabled
    opacity: 0.3
    cursor: not-allowed

  &--up
    background-image: url('@/assets/img/icon/arrow_up.png')

  &--down
    background-image: url('@/assets/img/icon/arrow_down.png')

  @include mobile-only
    width: 28px
    height: 24px
    background-size: 14px 14px

.check-list_delete-button
  display: flex
  align-items: center
  justify-content: center
  width: 32px
  height: 32px
  border: 1px solid $border-primary
  border-radius: $border-radius-sm
  background: transparent
  color: $text-muted
  cursor: pointer
  background-image: url('@/assets/img/icon/close.png')
  background-repeat: no-repeat
  background-position: center
  background-size: 16px 16px

  &:hover
    border-color: $accent-color-2
    background: rgba(230, 168, 107, 0.1)
    color: $accent-color-2

  @include mobile-only
    width: 36px
    height: 36px
    background-size: 18px 18px

.check-list_delete-icon
  font-size: 1.25rem
  line-height: 1

// ===================================
// Progress Section
// ===================================
.check-list_progress
  padding: $spacing-lg
  border: 1px solid $border-light
  border-radius: $border-radius-lg
  background: $bg-card
  box-shadow: 0 2px 8px $shadow-light

.check-list_progress-label
  margin-bottom: $spacing-sm
  color: $text-secondary
  font-weight: 500
  font-size: 0.875rem

.check-list_progress-bar
  overflow: hidden
  height: 8px
  border-radius: $border-radius-sm
  background: $border-light

.check-list_progress-fill
  height: 100%
  border-radius: $border-radius-sm
  background: linear-gradient(90deg, $city-gradient-start, $city-gradient-end)
  transition: width 0.3s ease
</style>
