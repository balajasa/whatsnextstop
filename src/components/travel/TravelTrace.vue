<template>
  <div class="footprint-container">
    <h1>我的足跡</h1>
    <p>功能開發中...</p>

    <!-- 顯示測試資料 -->
    <div v-if="data">
      <h3>測試資料：</h3>
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const data = ref(null)

onMounted(async () => {
  try {
    const response = await fetch('/api/usagi/data/travels.json')
    const result = await response.json()

    console.log('測試localhost3000', result)
    data.value = result
  } catch (error) {
    console.error('載入失敗:', error)
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.footprint-container {
  padding: 2rem;
  text-align: center;
  color: $text-primary-warm;
}

pre {
  text-align: left;
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
