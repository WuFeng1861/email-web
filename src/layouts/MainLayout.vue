<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '../stores/theme'
import { useLangStore } from '../stores/lang'
import SidebarMenu from '../components/SidebarMenu.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const themeStore = useThemeStore()
const langStore = useLangStore()

// 移动设备侧边栏显示状态
const sidebarOpen = ref(false)

// 当前路由标题
const pageTitle = computed(() => {
  const title = route.meta.title
  return title ? t(title as string) : t('appName')
})

// 切换移动端侧边栏
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// 切换主题
const toggleTheme = () => {
  themeStore.toggleTheme()
}

// 切换语言
const toggleLanguage = () => {
  const newLocale = langStore.currentLocale === 'zh-CN' ? 'en-US' : 'zh-CN'
  langStore.setLocale(newLocale)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- 移动端顶部导航栏 -->
    <div class="lg:hidden bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-20">
      <div class="px-4 py-3 flex items-center justify-between">
        <button 
          @click="toggleSidebar" 
          class="text-gray-600 dark:text-gray-200 focus:outline-none"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="text-xl font-semibold text-primary-700 dark:text-primary-300">{{ t('appName') }}</div>
        <div class="flex items-center space-x-3">
          <button 
            @click="toggleTheme" 
            class="text-gray-600 dark:text-gray-200 focus:outline-none"
          >
            <svg v-if="themeStore.isDark" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          <button 
            @click="toggleLanguage" 
            class="text-gray-600 dark:text-gray-200 focus:outline-none"
          >
            <span class="text-sm font-medium">{{ langStore.currentLocale === 'zh-CN' ? 'EN' : '中' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="flex h-screen overflow-hidden">
      <!-- 侧边栏 -->
      <aside 
        :class="{
          'translate-x-0': sidebarOpen,
          '-translate-x-full': !sidebarOpen,
          'fixed inset-y-0 left-0 z-30 lg:relative lg:translate-x-0': true,
          'w-64 flex-shrink-0': true,
          'transition-transform duration-300 ease-in-out': true,
          'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700': true
        }"
      >
        <!-- 侧边栏标题区域 -->
        <div class="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-bold text-primary-700 dark:text-primary-300">{{ t('appName') }}</h2>
          <button 
            @click="toggleSidebar" 
            class="lg:hidden text-gray-600 dark:text-gray-200 focus:outline-none"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- 菜单 -->
        <div class="h-[calc(100vh-8rem)] overflow-y-auto">
          <SidebarMenu />
        </div>
        
        <!-- 底部操作区 -->
        <div class="h-16 border-t border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
          <button 
            @click="toggleTheme" 
            class="flex items-center text-gray-600 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
          >
            <svg v-if="themeStore.isDark" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span class="text-sm">{{ themeStore.isDark ? t('common.lightMode') : t('common.darkMode') }}</span>
          </button>
          <button 
            @click="toggleLanguage" 
            class="flex items-center text-gray-600 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
          >
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span class="text-sm">{{ langStore.currentLocale === 'zh-CN' ? t('common.english') : t('common.chinese') }}</span>
          </button>
        </div>
      </aside>

      <!-- 遮罩层 - 仅移动端显示 -->
      <div
        v-if="sidebarOpen"
        @click="toggleSidebar"
        class="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
      ></div>

      <!-- 主内容区域 -->
      <main class="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        <!-- 桌面端顶部栏 -->
        <div class="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <h1 class="text-xl font-semibold text-gray-800 dark:text-white">{{ pageTitle }}</h1>
          <div class="flex items-center space-x-4">
            <button 
              @click="toggleTheme" 
              class="text-gray-600 dark:text-gray-200 focus:outline-none"
            >
              <svg v-if="themeStore.isDark" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            <button 
              @click="toggleLanguage" 
              class="text-gray-600 dark:text-gray-200 focus:outline-none"
            >
              <span class="font-medium">{{ langStore.currentLocale === 'zh-CN' ? 'EN' : '中' }}</span>
            </button>
          </div>
        </div>

        <!-- 页面内容 -->
        <div class="flex-1 overflow-y-auto p-6">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>