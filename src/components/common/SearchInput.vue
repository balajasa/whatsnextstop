<template>
  <label class="search-input" :class="{ focused: isFocused }">
    <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
    <input ref="inputRef" type="search" class="input-field" :placeholder="placeholder" :aria-label="placeholder"
      v-model="inputValue" @input="handleInput" @focus="handleFocus" @blur="handleBlur" />
  </label>
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
.search-input
  display: flex
  align-items: center
  gap: 10px
  width: 100%
  min-height: 46px
  padding: 0 16px
  border: 1.5px solid $nb-line
  border-radius: 999px
  background: $nb-paper
  color: $nb-muted
  cursor: text
  transition: border-color 0.2s ease, box-shadow 0.2s ease

  &:hover
    border-color: $nb-dash-strong

  &.focused
    border-color: $nb-accent
    box-shadow: 0 0 0 3px rgba($nb-accent, 0.15)

.search-icon
  flex-shrink: 0

.input-field
  flex: 1
  min-width: 0
  padding: 0
  border: none
  outline: none
  background: transparent
  color: $nb-ink
  font-size: 16px // 16px 以上，iOS Safari 才不會自動放大

  &::placeholder
    color: $nb-muted

  @media (min-width: 768px)
    font-size: 14px
</style>
