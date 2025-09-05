<template>
  <div class="search-input" :class="{ focused: isFocused }">
    <!-- 搜尋圖標 -->
    <div class="search-icon">
      <div class="icon-search"></div>
    </div>

    <!-- 輸入框 -->
    <input ref="inputRef" type="text" class="input-field" :placeholder="placeholder" v-model="inputValue"
      @input="handleInput" @focus="handleFocus" @blur="handleBlur" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import _ from 'lodash'

// 類型定義
interface Props {
  modelValue?: string
  placeholder?: string
  debounceMs?: number
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
}

// Props 和 Emits
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '請輸入搜尋關鍵字...',
  debounceMs: 300
})

const emit = defineEmits<Emits>()

// 響應式資料
const inputRef = ref<HTMLInputElement>()
const inputValue = ref<string>(props.modelValue)
const isFocused = ref<boolean>(false)

// 防抖搜尋函數
const debouncedSearch = _.debounce((value: string) => {
  emit('search', value)
}, props.debounceMs)

// 方法
const handleInput = (): void => {
  const value = inputValue.value
  emit('update:modelValue', value)

  // 即時搜尋 (防抖)
  debouncedSearch(value)
}

const handleFocus = (): void => {
  isFocused.value = true
}

const handleBlur = (): void => {
  isFocused.value = false
}

// 暴露方法給父元件
defineExpose({
  focus: () => inputRef.value?.focus()
})

// 監聽 props 變化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== inputValue.value) {
    inputValue.value = newValue
  }
})
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *

.search-input
  position: relative
  display: flex
  align-items: center
  width: 100%
  background: $bg-card
  border: 1px solid $border-light
  border-radius: $border-radius-md
  transition: all 0.2s ease
  overflow: hidden

  &:hover
    border-color: rgba($primary-color, 0.3)

  &.focused
    border-color: $primary-color
    box-shadow: 0 0 0 3px rgba($primary-color, 0.1)

.search-icon
  display: flex
  align-items: center
  justify-content: center
  padding: 0 $spacing-md
  color: $text-secondary

.icon-search
  width: 18px
  height: 18px
  background-image: url('@/assets/img/icon/common/search.png')
  background-size: contain
  background-repeat: no-repeat
  background-position: center
  opacity: 0.7
  transition: opacity 0.2s ease

.search-input.focused .icon-search
  opacity: 1

.input-field
  flex: 1
  padding: $spacing-md 0
  border: none
  outline: none
  background: transparent
  font-size: 14px
  color: $text-primary
  line-height: 1.4

  &::placeholder
    color: $text-light


// 響應式設計
@media (max-width: 480px)
  .search-input
    .search-icon
      padding: $spacing-xs

  .input-field
    font-size: 16px // 防止 iOS Safari 縮放
</style>
