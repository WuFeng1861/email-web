<script setup lang="ts">
import { computed } from 'vue'

interface Column {
  key: string
  label: string
  formatter?: (value: any, row: any) => string
}

interface Props {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyText: '暂无数据'
})

const isEmpty = computed(() => !props.data || props.data.length === 0)

// 格式化单元格数据
const formatCell = (column: Column, row: any) => {
  const value = row[column.key]
  if (column.formatter) {
    return column.formatter(value, row)
  }
  return value
}
</script>

<template>
  <div class="table-container animate-fade-in">
    <div class="overflow-x-auto">
      <table v-if="!loading && !isEmpty" class="table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" class="whitespace-nowrap">
              {{ column.label }}
            </th>
            <th v-if="$slots.actions" class="text-right whitespace-nowrap">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in data" :key="index">
            <td v-for="column in columns" :key="column.key" class="whitespace-nowrap">
              {{ formatCell(column, row) }}
            </td>
            <td v-if="$slots.actions" class="text-right whitespace-nowrap">
              <slot name="actions" :row="row" :index="index"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
    </div>
    
    <div v-else-if="isEmpty" class="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
      <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
      <p>{{ emptyText }}</p>
    </div>
  </div>
</template>