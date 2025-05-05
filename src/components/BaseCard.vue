<script setup lang="ts">
defineProps<{
  title?: string
  loading?: boolean
}>()
</script>

<template>
  <div class="card animate-fade-in">
    <div v-if="title || $slots.header" class="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <h3 v-if="title" class="text-lg font-semibold text-gray-800 dark:text-gray-100">{{ title }}</h3>
        <slot name="header"></slot>
      </div>
    </div>
    
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
    </div>
    
    <div v-else>
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
      <slot name="footer"></slot>
    </div>
  </div>
</template>