<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCard from '../components/BaseCard.vue'
import { getSystemStatistics, restartSystem, SystemStatistics } from '../api/statistics'
import { getQueueStats, QueueStats } from '../api/email'

const { t } = useI18n()

// 加载状态
const loading = ref(true)
// 系统统计数据
const statistics = ref<SystemStatistics | null>(null)
// 队列统计数据
const queueStats = ref<QueueStats | null>(null)
// 重启系统模态框显示状态
const showRestartModal = ref(false)
// 重启系统密码
const restartPassword = ref('')
// 重启系统加载状态
const restartLoading = ref(false)
// 错误消息
const errorMessage = ref('')

// 获取系统统计数据
const fetchStatistics = async () => {
  try {
    loading.value = true
    statistics.value = await getSystemStatistics()
    queueStats.value = await getQueueStats()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 显示重启模态框
const openRestartModal = () => {
  showRestartModal.value = true
  restartPassword.value = ''
  errorMessage.value = ''
}

// 关闭重启模态框
const closeRestartModal = () => {
  showRestartModal.value = false
}

// 重启系统
const handleRestart = async () => {
  if (!restartPassword.value) {
    errorMessage.value = t('dashboard.passwordRequired')
    return
  }
  
  try {
    restartLoading.value = true
    await restartSystem(restartPassword.value)
    closeRestartModal()
    // 显示成功消息
    alert(t('dashboard.restartSuccess'))
  } catch (error) {
    console.error('重启系统失败:', error)
    errorMessage.value = t('common.failed')
  } finally {
    restartLoading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchStatistics()
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- 邮件队列统计 -->
    <BaseCard :title="t('dashboard.emailQueueStats')" :loading="loading">
      <div v-if="queueStats" class="grid grid-cols-2 gap-4">
        <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ queueStats.total }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.total') }}</div>
        </div>
        <div class="text-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
          <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{{ queueStats.pending }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.pending') }}</div>
        </div>
        <div class="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
          <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ queueStats.sent }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.sent') }}</div>
        </div>
        <div class="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
          <div class="text-3xl font-bold text-red-600 dark:text-red-400">{{ queueStats.failed }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.failed') }}</div>
        </div>
      </div>
    </BaseCard>
    
    <!-- 邮件凭证统计 -->
    <BaseCard :title="t('dashboard.emailKeysStats')" :loading="loading">
      <div v-if="statistics" class="mb-4">
        <div class="text-center p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg mb-4">
          <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ statistics.emailKeys.total }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.total') }}</div>
        </div>
        
        <div v-if="Object.keys(statistics.emailKeys.byApp).length > 0" class="mt-4">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ t('dashboard.byApp') }}</h4>
          <div v-for="(app, name) in statistics.emailKeys.byApp" :key="name" class="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
            <span class="text-gray-800 dark:text-gray-200">{{ name }}</span>
            <div class="flex space-x-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ app.count }} {{ t('emailKeys.list') }}</span>
              <span class="text-sm text-primary-600 dark:text-primary-400">{{ app.totalDailyLimit }} {{ t('dashboard.totalDailyLimit') }}</span>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
    
    <!-- 模板统计 -->
    <BaseCard :title="t('dashboard.templatesStats')" :loading="loading">
      <div v-if="statistics" class="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
        <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ statistics.templates.total }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">{{ t('dashboard.total') }}</div>
      </div>
    </BaseCard>
    
    <!-- 系统状态 -->
    <BaseCard :title="t('dashboard.systemStatus')" class="md:col-span-2 lg:col-span-3">
      <div class="flex justify-between items-center">
        <div class="flex items-center">
          <div class="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
          <span class="text-gray-800 dark:text-gray-200">{{ t('appName') }}</span>
        </div>
        <button @click="openRestartModal" class="btn btn-primary">
          {{ t('dashboard.restartSystem') }}
        </button>
      </div>
      
      <!-- 重启系统模态框 -->
      <teleport to="body">
        <div v-if="showRestartModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">{{ t('dashboard.restartSystem') }}</h3>
            
            <p class="mb-4 text-gray-600 dark:text-gray-300">{{ t('dashboard.restartConfirm') }}</p>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ t('dashboard.passwordRequired') }}</label>
              <input 
                v-model="restartPassword" 
                type="password" 
                class="input" 
                :placeholder="t('dashboard.passwordRequired')"
              />
              <p v-if="errorMessage" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button @click="closeRestartModal" class="btn btn-secondary">
                {{ t('common.cancel') }}
              </button>
              <button @click="handleRestart" class="btn btn-primary" :disabled="restartLoading">
                <span v-if="restartLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ t('common.loading') }}
                </span>
                <span v-else>{{ t('common.confirm') }}</span>
              </button>
            </div>
          </div>
        </div>
      </teleport>
    </BaseCard>
  </div>
</template>