<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseCard from '../components/BaseCard.vue'
import { getSystemStatistics, getAppStatistics, SystemStatistics, AppStatistics } from '../api/statistics'
import { getAppEmailKeys, EmailKey } from '../api/emailKeys'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'

// 注册ECharts组件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

const { t } = useI18n()

// 加载状态
const loading = ref(true)
// 系统统计数据
const systemStats = ref<SystemStatistics | null>(null)
// 应用统计数据
const appStats = ref<AppStatistics | null>(null)
// 应用列表
const apps = ref<string[]>([])

// 查询参数
const queryParams = reactive({
  app: '',
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10), // 过去7天
  endDate: new Date().toISOString().substr(0, 10) // 今天
})

// 图表选项 - 邮件队列状态
const queueChartOption = ref({
  title: {
    text: t('statistics.emailStats'),
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 10,
    data: [t('dashboard.total'), t('dashboard.pending'), t('dashboard.sent'), t('dashboard.failed')]
  },
  series: [
    {
      name: t('statistics.emailStats'),
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: []
    }
  ]
})

// 图表选项 - 每日发送统计
const dailyChartOption = ref({
  title: {
    text: t('statistics.dailyStats'),
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: [t('statistics.emailsSent'), t('statistics.emailsFailed')],
    bottom: 10
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: t('statistics.emailsSent'),
      type: 'line',
      data: [],
      smooth: true
    },
    {
      name: t('statistics.emailsFailed'),
      type: 'line',
      data: [],
      smooth: true
    }
  ]
})

// 图表选项 - 应用凭证对比
const appsChartOption = ref({
  title: {
    text: t('statistics.appsCompare'),
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: [t('emailKeys.list'), t('dashboard.totalDailyLimit')],
    bottom: 10
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: t('emailKeys.list'),
      type: 'bar',
      data: []
    },
    {
      name: t('dashboard.totalDailyLimit'),
      type: 'bar',
      data: []
    }
  ]
})

// 获取系统统计数据
const fetchSystemStats = async () => {
  try {
    loading.value = true
    systemStats.value = await getSystemStatistics()
    
    // 更新队列状态图表
    if (systemStats.value && systemStats.value.emailQueue) {
      const queue = systemStats.value.emailQueue
      queueChartOption.value.series[0].data = [
        { value: queue.pending, name: t('dashboard.pending') },
        { value: queue.sent, name: t('dashboard.sent') },
        { value: queue.failed, name: t('dashboard.failed') }
      ]
    }
    
    // 更新应用对比图表
    if (systemStats.value && systemStats.value.emailKeys && systemStats.value.emailKeys.byApp) {
      const byApp = systemStats.value.emailKeys.byApp
      const appNames = Object.keys(byApp)
      const keysCount = appNames.map(app => byApp[app].count)
      const limitsCount = appNames.map(app => byApp[app].totalDailyLimit)
      
      appsChartOption.value.xAxis.data = appNames
      appsChartOption.value.series[0].data = keysCount
      appsChartOption.value.series[1].data = limitsCount
    }
    
    // 获取应用列表
    const appSet = new Set<string>()
    if (systemStats.value && systemStats.value.emailKeys && systemStats.value.emailKeys.byApp) {
      Object.keys(systemStats.value.emailKeys.byApp).forEach(app => {
        appSet.add(app)
      })
    }
    apps.value = Array.from(appSet)
    
    // 如果有应用列表，默认选择第一个
    if (apps.value.length > 0 && !queryParams.app) {
      queryParams.app = apps.value[0]
    }
  } catch (error) {
    console.error('获取系统统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取应用统计数据
const fetchAppStats = async () => {
  if (!queryParams.app || !queryParams.startDate || !queryParams.endDate) return
  
  try {
    loading.value = true
    appStats.value = await getAppStatistics(
      queryParams.app,
      queryParams.startDate,
      queryParams.endDate
    )
    
    // 更新每日统计图表
    if (appStats.value) {
      const sentByDate = appStats.value.emailsSent.byDate
      const failedByDate = appStats.value.emailsFailed.byDate
      
      // 获取日期范围内的所有日期
      const dateRange = getDatesInRange(new Date(queryParams.startDate), new Date(queryParams.endDate))
      
      // 准备图表数据
      const dates = dateRange.map(date => date.toISOString().substr(0, 10))
      const sentData = dates.map(date => sentByDate[date] || 0)
      const failedData = dates.map(date => failedByDate[date] || 0)
      
      dailyChartOption.value.xAxis.data = dates
      dailyChartOption.value.series[0].data = sentData
      dailyChartOption.value.series[1].data = failedData
    }
  } catch (error) {
    console.error('获取应用统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取日期范围内的所有日期
const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
  const dates = []
  let currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

// 查询统计
const handleQuery = () => {
  fetchAppStats()
}

// 重置查询
const handleReset = () => {
  queryParams.app = apps.value.length > 0 ? apps.value[0] : ''
  queryParams.startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10)
  queryParams.endDate = new Date().toISOString().substr(0, 10)
  fetchAppStats()
}

// 监听语言变化，更新图表标题
watch(() => t('statistics.emailStats'), () => {
  queueChartOption.value.title.text = t('statistics.emailStats')
  dailyChartOption.value.title.text = t('statistics.dailyStats')
  appsChartOption.value.title.text = t('statistics.appsCompare')
  
  if (systemStats.value && systemStats.value.emailQueue) {
    const queue = systemStats.value.emailQueue
    queueChartOption.value.series[0].data = [
      { value: queue.pending, name: t('dashboard.pending') },
      { value: queue.sent, name: t('dashboard.sent') },
      { value: queue.failed, name: t('dashboard.failed') }
    ]
  }
})

// 组件挂载时获取数据
onMounted(() => {
  fetchSystemStats()
})

// 监听应用选择变化
watch(() => queryParams.app, (newVal) => {
  if (newVal) {
    fetchAppStats()
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 系统统计 -->
    <BaseCard :title="t('statistics.systemStatistics')">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 邮件队列状态 -->
        <div class="h-80">
          <v-chart :option="queueChartOption" autoresize />
        </div>
        
        <!-- 应用凭证对比 -->
        <div class="h-80">
          <v-chart :option="appsChartOption" autoresize />
        </div>
      </div>
    </BaseCard>
    
    <!-- 应用统计 -->
    <BaseCard :title="t('statistics.appStatistics')">
      <!-- 查询表单 -->
      <div class="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('statistics.selectApp') }}
            </label>
            <select v-model="queryParams.app" class="input">
              <option v-for="app in apps" :key="app" :value="app">{{ app }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('statistics.startDate') }}
            </label>
            <input 
              v-model="queryParams.startDate" 
              type="date" 
              class="input"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('statistics.endDate') }}
            </label>
            <input 
              v-model="queryParams.endDate" 
              type="date" 
              class="input"
            />
          </div>
          
          <div class="flex items-end space-x-2">
            <button @click="handleQuery" class="btn btn-primary">
              {{ t('common.search') }}
            </button>
            <button @click="handleReset" class="btn btn-secondary">
              {{ t('common.reset') }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 应用统计摘要 -->
      <div v-if="appStats" class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
          <div class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
            {{ t('statistics.emailsSent') }}
          </div>
          <div class="text-3xl font-bold text-green-600 dark:text-green-400">
            {{ appStats.emailsSent.total }}
          </div>
        </div>
        
        <div class="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
          <div class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
            {{ t('statistics.emailsFailed') }}
          </div>
          <div class="text-3xl font-bold text-red-600 dark:text-red-400">
            {{ appStats.emailsFailed.total }}
          </div>
        </div>
      </div>
      
      <!-- 每日统计图表 -->
      <div v-if="appStats" class="h-80">
        <v-chart :option="dailyChartOption" autoresize />
      </div>
      
      <div v-else-if="loading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
      
      <div v-else class="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        <p>{{ t('statistics.noStatsData') }}</p>
      </div>
    </BaseCard>
  </div>
</template>