<template>
  <div id="app">
    <router-view />
    <DialogProvider />
  </div>
</template>

<script setup lang="ts">
import DialogProvider from './components/common/DialogProvider.vue'
</script>