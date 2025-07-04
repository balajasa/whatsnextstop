import { ref } from 'vue'

/**
 * 旅行列表展開/收合功能 Composable
 */
export function useTravelList() {
  const expandedItems = ref<Set<number>>(new Set())

  /**
   * 展開/收合詳細資訊
   * @param index 項目索引
   * @param onExpand 展開時的回調函數
   */
  function toggleDetails(index: number, onExpand?: () => void): void {
    if (expandedItems.value.has(index)) {
      expandedItems.value.delete(index)
    } else {
      expandedItems.value.add(index)
      onExpand?.()
    }
  }

  /**
   * 檢查項目是否展開
   * @param index 項目索引
   * @returns 是否展開
   */
  function isExpanded(index: number): boolean {
    return expandedItems.value.has(index)
  }

  /**
   * 展開所有項目
   */
  function expandAll(): void {
    // 這裡需要傳入項目總數，或者在使用時動態設置
  }

  /**
   * 收合所有項目
   */
  function collapseAll(): void {
    expandedItems.value.clear()
  }

  return {
    expandedItems,
    toggleDetails,
    isExpanded,
    expandAll,
    collapseAll
  }
}