<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'
import { useThemeStore } from './stores/theme'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const themeStore = useThemeStore()
const route = useRoute()

// 监听路由变化，更新页面标题
watch(() => route.meta.title, (title) => {
  if (title) {
    document.title = t(title as string) + ' - ' + t('appName')
  } else {
    document.title = t('appName')
  }
}, { immediate: true })

// 初始化主题
themeStore.initTheme()
</script>

<template>
  <div :class="{ 'dark': themeStore.isDark }">
    <router-view />
  </div>
</template>