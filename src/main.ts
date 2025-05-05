import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import i18n from './i18n'
import App from './App.vue'
import './assets/tailwind.css'

// 挂载全局应用
const app = createApp(App)

// 使用插件
app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')