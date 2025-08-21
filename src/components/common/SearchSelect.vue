<template>
  <div class="search-select" ref="searchSelectRef">
    <!-- 輸入框 -->
    <input ref="inputRef" type="text" class="select-input" :class="{ readonly: !isOpen }" :placeholder="placeholder"
      :readonly="!isOpen" v-model="searchText" @click="openDropdown" @input="handleSearch">

    <!-- 下拉箭頭 -->
    <span class="dropdown-arrow" @click="openDropdown">▼</span>

    <!-- 下拉選單 -->
    <div v-if="isOpen" class="dropdown">
      <div v-for="option in filteredOptions" :key="option.value" class="option" @click="selectOption(option)">
        {{ option.label }}
      </div>

      <!-- 無搜尋結果 -->
      <div v-if="filteredOptions.length === 0" class="no-results">
        查無相關結果
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'

// 類型定義
interface Option {
  value: string
  label: string
}

interface Props {
  options: Option[]
  placeholder?: string
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', option: Option): void
}

// Props 和 Emits
const props = withDefaults(defineProps<Props>(), {
  placeholder: '請選擇選項',
  modelValue: ''
})

const emit = defineEmits<Emits>()

// 響應式資料
const searchSelectRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const isOpen = ref<boolean>(false)
const searchText = ref<string>('')

// 計算屬性
const filteredOptions = computed(() => {
  if (!searchText.value || searchText.value === getSelectedLabel()) {
    return props.options
  }

  return props.options.filter(option =>
    option.label.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

const selectedOption = computed(() => {
  return props.options.find(option => option.value === props.modelValue)
})

// 方法
const getSelectedLabel = (): string => {
  return selectedOption.value?.label || ''
}

const openDropdown = async (): Promise<void> => {
  if (isOpen.value) return

  isOpen.value = true
  searchText.value = ''

  await nextTick()
  inputRef.value?.focus()
}

const closeDropdown = (): void => {
  isOpen.value = false
  searchText.value = getSelectedLabel()
}

const selectOption = (option: Option): void => {
  emit('update:modelValue', option.value)
  emit('change', option)
  closeDropdown()
}

const handleSearch = (): void => {
  // 搜尋邏輯已經在 computed 中處理
}

const handleClickOutside = (event: MouseEvent): void => {
  if (isOpen.value && searchSelectRef.value) {
    const target = event.target as Node
    // 如果點擊的不是下拉選單內的選項，就關閉選單
    if (!searchSelectRef.value.contains(target)) {
      closeDropdown()
    }
  }
}

// 生命週期
onMounted(() => {
  // 初始化顯示選中的值
  searchText.value = getSelectedLabel()

  // 監聽點擊外部 - 使用 capture 階段確保能捕獲到所有點擊
  document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})

// 監聽 modelValue 變化，同步更新顯示文字
watch(() => props.modelValue, () => {
  if (!isOpen.value) {
    searchText.value = getSelectedLabel()
  }
}, { immediate: true })
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *

.search-select
  position: relative
  width: 100%

.select-input
  width: 100%
  padding: $spacing-sm $spacing-xl $spacing-sm $spacing-md
  border: 1px solid $border-light
  border-radius: $border-radius-md
  font-size: 14px
  transition: all 0.2s ease
  background: $bg-card
  color: $text-primary
  outline: none
  height: 42px
  box-sizing: border-box

  &::placeholder
    color: $text-light

  &:focus
    border-color: $primary-color
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1)

  &.readonly
    cursor: pointer
    background: $bg-card

  &:disabled
    opacity: 0.6
    cursor: not-allowed
    background: $bg-primary

.dropdown-arrow
  position: absolute
  right: $spacing-md
  top: 50%
  transform: translateY(-50%)
  cursor: pointer
  color: $text-secondary
  font-size: 12px
  user-select: none

.dropdown
  position: absolute
  top: 100%
  left: 0
  right: 0
  z-index: 1000
  border: 1px solid $border-light
  border-top: none
  border-radius: 0 0 $border-radius-md $border-radius-md
  background: $bg-card
  box-shadow: $shadow-medium
  max-height: 200px
  overflow-y: auto

.option
  padding: $spacing-md
  cursor: pointer
  transition: all 0.2s ease
  color: $text-primary
  border-bottom: 1px solid $border-light

  &:last-child
    border-bottom: none

  &:hover
    background: $bg-primary
    color: $text-primary

.no-results
  padding: $spacing-md
  color: $text-tertiary
  text-align: center
  font-size: 13px
</style>
