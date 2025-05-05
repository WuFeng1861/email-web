import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 是否为深色模式
  const isDark = ref(false)
  
  // 初始化主题
  const initTheme = () => {
    // 从本地存储获取主题设置
    const savedTheme = localStorage.getItem('theme')
    
    // 如果有存储的设置，使用该设置
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // 否则根据系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
    }
    
    // 应用主题
    applyTheme()
  }
  
  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }
  
  // 应用主题到文档
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  return {
    isDark,
    initTheme,
    toggleTheme
  }
})