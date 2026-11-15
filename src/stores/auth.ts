import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as authApi from '../api/auth'
import { clearToken, getToken, setToken } from '../api/index'

const USER_KEY = 'email_admin_user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getToken())
  const username = ref(localStorage.getItem(USER_KEY) || '')
  /** null = 还没查过；true/false = 后端是否已设置管理员 */
  const initialized = ref<boolean | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  function remember(result: authApi.LoginResult) {
    token.value = result.token
    username.value = result.username
    setToken(result.token)
    localStorage.setItem(USER_KEY, result.username)
  }

  async function fetchStatus(): Promise<boolean> {
    const res = await authApi.getAdminStatus()
    initialized.value = res.initialized
    return res.initialized
  }

  async function setup(user: string, pass: string) {
    remember(await authApi.setupAdmin(user, pass))
    initialized.value = true
  }

  async function login(user: string, pass: string) {
    remember(await authApi.login(user, pass))
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // 后端已失效也无所谓，本地照样清
    }
    token.value = ''
    username.value = ''
    clearToken()
    localStorage.removeItem(USER_KEY)
  }

  /** 改完密码所有旧 token 失效，这里必须用返回的新 token 覆盖 */
  async function changeCredentials(payload: authApi.ChangeCredentialsPayload) {
    remember(await authApi.changeCredentials(payload))
  }

  return { token, username, initialized, isLoggedIn, fetchStatus, setup, login, logout, changeCredentials }
})
