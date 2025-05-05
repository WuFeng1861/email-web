import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export const useLangStore = defineStore('lang', () => {
  // 当前语言
  const currentLocale = ref(localStorage.getItem('locale') || 'zh-CN')
  const { locale } = useI18n()
  
  // 支持的语言列表
  const locales = [
    { code: 'zh-CN', name: '中文' },
    { code: 'en-US', name: 'English' }
  ]
  
  // 切换语言
  const setLocale = (localeCode: string) => {
    currentLocale.value = localeCode
    locale.value = localeCode
    localStorage.setItem('locale', localeCode)
  }
  
  return {
    currentLocale,
    locales,
    setLocale
  }
})