<template>
  <div class="simple-select" ref="simpleSelectRef">
    <!-- 顯示框 -->
    <div class="select-display" @click="toggleDropdown" :class="{ open: isOpen, disabled: disabled }">
      <span class="selected-text">{{ selectedLabel || placeholder }}</span>
      <span class="dropdown-arrow" :class="{ rotated: isOpen }">▼</span>
    </div>

    <!-- 下拉選單 -->
    <div v-if="isOpen" class="dropdown">
      <div v-for="(option, index) in options" :key="option.value" class="option"
        :class="{ highlighted: highlightedIndex === index, selected: option.value === modelValue }"
        @click="selectOption(option)" @mouseenter="highlightedIndex = index">
        {{ option.label }}
      </div>

      <!-- 無選項 -->
      <div v-if="options.length === 0" class="no-options">
        暫無選項
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 類型定義
interface Option {
  value: string
  label: string
}

interface Props {
  options: Option[]
  placeholder?: string
  modelValue?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', option: Option): void
}

// Props 和 Emits
const props = withDefaults(defineProps<Props>(), {
  placeholder: '請選擇選項',
  modelValue: '',
  disabled: false
})

const emit = defineEmits<Emits>()

// 響應式資料
const simpleSelectRef = ref<HTMLElement>()
const isOpen = ref<boolean>(false)
const highlightedIndex = ref<number>(-1)

// 計算屬性
const selectedOption = computed(() => {
  return props.options.find(option => option.value === props.modelValue)
})

const selectedLabel = computed(() => {
  return selectedOption.value?.label || ''
})

// 方法
const toggleDropdown = (): void => {
  if (props.disabled) return

  isOpen.value = !isOpen.value
  if (isOpen.value) {
    // 設定當前選中項的高亮
    const currentIndex = props.options.findIndex(option => option.value === props.modelValue)
    highlightedIndex.value = currentIndex >= 0 ? currentIndex : 0
  }
}

const closeDropdown = (): void => {
  isOpen.value = false
  highlightedIndex.value = -1
}

const selectOption = (option: Option): void => {
  emit('update:modelValue', option.value)
  emit('change', option)
  closeDropdown()
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (props.disabled) return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (isOpen.value && highlightedIndex.value >= 0) {
        selectOption(props.options[highlightedIndex.value])
      } else {
        toggleDropdown()
      }
      break
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        toggleDropdown()
      } else {
        highlightedIndex.value = Math.min(highlightedIndex.value + 1, props.options.length - 1)
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (isOpen.value) {
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      }
      break
    case 'Tab':
      closeDropdown()
      break
  }
}

const handleClickOutside = (event: MouseEvent): void => {
  if (simpleSelectRef.value && !simpleSelectRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

// 生命週期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *

.simple-select
  position: relative
  width: 100%

.select-display
  width: 100%
  padding: $spacing-md
  border: 1px solid $border-light
  border-radius: $border-radius-md
  background: $bg-card
  cursor: pointer
  display: flex
  justify-content: space-between
  align-items: center
  transition: all 0.2s ease
  min-height: 20px

  &:hover:not(.disabled)
    border-color: $primary-color

  &.open
    border-color: $primary-color
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1)
    border-radius: $border-radius-md $border-radius-md 0 0

  &.disabled
    opacity: 0.6
    cursor: not-allowed
    background: $bg-primary

.selected-text
  color: $text-primary
  font-size: 14px
  flex: 1
  text-align: left

  .simple-select .select-display.disabled &
    color: $text-tertiary

.simple-select .select-display:not(.disabled) .selected-text:empty::before
  content: attr(data-placeholder)
  color: $text-light

.dropdown-arrow
  color: $text-secondary
  font-size: 12px
  transition: transform 0.2s ease
  user-select: none

  &.rotated
    transform: rotate(180deg)

.dropdown
  position: absolute
  top: 100%
  left: 0
  right: 0
  border: 1px solid $border-light
  border-top: none
  border-radius: 0 0 $border-radius-md $border-radius-md
  background: $bg-card
  box-shadow: $shadow-medium
  max-height: 200px
  overflow-y: auto
  z-index: 1

.option
  padding: $spacing-md
  cursor: pointer
  transition: all 0.2s ease
  color: $text-primary
  border-bottom: 1px solid $border-light
  display: flex
  align-items: center

  &:last-child
    border-bottom: none

  &:hover,
  &.highlighted
    background: $bg-primary
    color: $text-primary

  &.selected
    background: rgba($primary-color, 0.1)
    color: $primary-color
    font-weight: 500

.no-options
  padding: $spacing-md
  color: $text-tertiary
  text-align: center
  font-size: 13px
</style>
