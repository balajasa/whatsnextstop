<template>
  <!-- 載入中：貓掌腳印一步一步亮起來 -->
  <div v-if="type === 'loading'" class="state-view state-view--loading" :class="`state-view--${size}`" role="status"
    aria-live="polite">
    <div class="paws" aria-hidden="true">
      <img v-for="n in 4" :key="n" src="@/assets/img/sym/paw.png" alt="" class="paw" :style="{ '--i': n - 1 }" />
    </div>
    <p class="state-view__message">{{ message || '載入中...' }}</p>
  </div>

  <!-- 沒資料／錯誤：貓咪、標題、說明、選用按鈕 -->
  <div v-else class="state-view" :class="[`state-view--${type}`, `state-view--${size}`, { 'is-floating': floating }]"
    :role="type === 'error' ? 'alert' : undefined">
    <span v-if="!floating" class="tape" aria-hidden="true"></span>
    <img v-if="type === 'error'" src="@/assets/img/sym/cat_error.png" alt="" class="state-view__cat" />
    <img v-else src="@/assets/img/sym/cat_empty.png" alt="" class="state-view__cat" />
    <h2 class="state-view__title">{{ title || defaultTitle }}</h2>
    <p v-if="message" class="state-view__message">{{ message }}</p>
    <button v-if="actionText || type === 'error'" type="button" class="state-view__action"
      :class="type === 'error' ? 'is-primary' : 'is-ghost'" @click="emit('action')">
      {{ actionText || '重試' }}
    </button>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** empty：沒資料；loading：載入中；error：錯誤 */
  type: 'empty' | 'loading' | 'error'
  title?: string
  message?: string
  /** 按鈕文字；error 沒給時預設「重試」，empty 沒給就不顯示按鈕 */
  actionText?: string
  /** md：頁面主要區塊；sm：區塊內的小提示（例如載入更多） */
  size?: 'md' | 'sm'
  /** 浮在其他內容上（例如地圖），改用浮層陰影、不貼紙膠帶 */
  floating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  message: '',
  actionText: '',
  size: 'md',
  floating: false
})

const emit = defineEmits<{
  action: []
}>()

const defaultTitle = computed(() => (props.type === 'error' ? '哎呀，載入失敗了' : '這裡還是空的'))
</script>

<style lang="sass" scoped>
@use '@/styles/variables' as *
@use '@/styles/mixins' as *

.state-view
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: 8px
  margin: 0 auto
  padding: 28px 20px
  max-width: 480px
  border: 1px solid $nb-line
  border-radius: 18px
  background: $nb-card
  box-shadow: $nb-card-shadow
  color: $nb-ink
  text-align: center
  @include tablet
    padding: 36px 32px

  &.is-floating
    max-width: 300px
    padding: 18px
    border: none
    border-radius: 16px
    box-shadow: $nb-float-shadow
    gap: 6px

.tape
  position: absolute
  top: -10px
  left: 50%
  width: 80px
  height: 22px
  margin-left: -40px
  background: $nb-tape-yellow
  transform: rotate(-3deg)

.state-view__cat
  width: auto
  height: 130px
  @include tablet
    height: 150px

  .is-floating &
    height: 90px
    @include tablet
      height: 100px

.state-view__title
  margin: 4px 0 0
  font-family: $font-display
  font-size: 22px
  font-weight: 700
  @include tablet
    font-size: 24px

  .is-floating &
    font-size: 20px

.state-view__message
  margin: 0
  font-size: 14px
  line-height: 1.6
  color: $nb-muted

.state-view__action
  display: inline-flex
  align-items: center
  justify-content: center
  margin-top: 8px
  min-height: 44px
  padding: 0 24px
  border-radius: 999px
  font-size: 15px
  cursor: pointer
  transition: background-color 0.2s ease

  &:focus-visible
    outline: 2px solid $nb-accent
    outline-offset: 3px

  &.is-primary
    border: none
    background: $nb-accent
    color: $nb-card
    font-weight: 700
    &:hover
      background: $nb-accent-hover

  &.is-ghost
    border: 1.5px dashed #C9B89F
    background: transparent
    color: $nb-ink
    font-weight: 500
    &:hover
      background: $nb-paper

// 載入中
.state-view--loading
  gap: 18px
  padding: 48px 20px
  border: none
  background: transparent
  box-shadow: none

  &.state-view--sm
    flex-direction: row
    justify-content: center
    gap: 10px
    padding: 16px

.paws
  display: flex
  align-items: center
  gap: 12px

  .state-view--sm &
    gap: 4px

.paw
  width: 36px
  height: 36px
  opacity: 0.15
  animation: paw-step 1.6s ease-in-out infinite
  animation-delay: calc(var(--i) * 0.25s)

  // 左右腳交錯
  &:nth-child(odd)
    transform: rotate(-15deg) translateY(8px)
  &:nth-child(even)
    transform: rotate(15deg) translateY(-6px)

  .state-view--sm &
    width: 18px
    height: 18px

@keyframes paw-step
  0%, 100%
    opacity: 0.15
  30%, 60%
    opacity: 1

@media (prefers-reduced-motion: reduce)
  .paw
    animation: none
    opacity: 0.8
</style>
