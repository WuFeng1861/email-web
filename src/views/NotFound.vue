<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="text-center">
      <div class="text-primary-500 text-9xl font-bold">404</div>
      <h1 class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{{ t('common.notFound') }}</h1>
      <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">很抱歉，您访问的页面不存在。</p>
      <div class="mt-6">
        <button @click="goHome" class="btn btn-primary">
          {{ t('common.back') }}
        </button>
      </div>
    </div>
  </div>
</template>