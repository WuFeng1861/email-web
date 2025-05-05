<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  show: boolean
  title?: string
  width?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// 关闭模态框
const closeModal = () => {
  emit('close')
}

// ESC键关闭模态框
const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    closeModal()
  }
}

// 添加和移除事件监听器
onMounted(() => {
  document.addEventListener('keydown', handleEsc)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEsc)
})

// 当模态框显示时禁止背景滚动
watch(() => props.show, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <transition 
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- 背景遮罩 -->
        <div 
          class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          @click="closeModal"
        ></div>
        
        <!-- 模态框内容 -->
        <div class="flex items-center justify-center min-h-screen p-4">
          <transition 
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div 
              class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transform transition-all"
              :class="width ? width : 'max-w-lg w-full'"
            >
              <!-- 标题栏 -->
              <div v-if="title" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">{{ title }}</h3>
                <button 
                  @click="closeModal"
                  class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <!-- 模态框内容 -->
              <div class="px-6 py-4">
                <slot></slot>
              </div>
              
              <!-- 底部按钮区域 -->
              <div v-if="$slots.footer" class="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <slot name="footer"></slot>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </transition>
  </Teleport>
</template>